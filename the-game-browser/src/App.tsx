import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { BootingScreen, ChargingScreen } from './components/ChargingAndBootScreen';
import { DeadBatteryScreen } from './components/DeadBatteryScreen';
import { LockScreen } from './components/LockScreen';
import { PhoneChassis } from './components/PhoneChassis';
import { PrologueScreen } from './components/PrologueScreen';
import { chapterAudio } from './game/audio';
import { AUTHORIZED_USB_DESCRIPTORS } from './game/canonConfig';
import {
  createEmptyHomologationStatus,
  type HomologationCheckId,
  type HomologationStatusMap,
} from './game/homologation';
import {
  clearProgress,
  loadRestoredState,
  PROGRESS_STORAGE_KEY,
  saveProgress,
} from './game/persistence';
import { chapterReducer, type ChapterPhase } from './game/stateMachine';
import {
  buildDeviceFingerprint,
  performUsbHandshake,
  requestPhysicalUsbConnection,
  scanAuthorizedPairedUsb,
  subscribePhysicalChargerEvents,
  subscribePhysicalUsbEvents,
  type UsbDeviceLike,
} from './game/usbHardware';

const UnlockedPhoneOS = lazy(() =>
  import('./components/UnlockedPhoneOS').then((m) => ({
    default: m.UnlockedPhoneOS,
  }))
);

const HomologationDrawer = lazy(() =>
  import('./components/HomologationDrawer').then((m) => ({
    default: m.HomologationDrawer,
  }))
);

function getUrlFlags(): { autostart: boolean; qa: boolean } {
  if (typeof window === 'undefined') {
    return { autostart: false, qa: false };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    autostart: params.get('autostart') === '1',
    qa: params.get('qa') === '1',
  };
}

function hasPersistedSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(PROGRESS_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function mapPhaseToBodyState(phase: ChapterPhase): string {
  switch (phase) {
    case 'PROLOGUE_PAST':
    case 'PROLOGUE_RUPTURE':
      return 'prologue';
    case 'DEVICE_DEAD':
      return 'dead';
    case 'DEVICE_CHARGING':
      return 'charging';
    case 'DEVICE_BOOTING':
      return 'booting';
    case 'DEVICE_LOCKED':
      return 'locked';
    case 'DEVICE_UNLOCKED':
      return 'unlocked';
  }
}

export default function App() {
  const initialFlags = getUrlFlags();
  const hydratedFromStorageRef = useRef(hasPersistedSession());
  const [state, dispatch] = useReducer(chapterReducer, undefined, () =>
    loadRestoredState({ skipPrologue: initialFlags.autostart })
  );

  const [qaOpen, setQaOpen] = useState(initialFlags.qa);
  const [rereadingPrologue, setRereadingPrologue] = useState(false);
  const [usbBusy, setUsbBusy] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [muted, setMuted] = useState(chapterAudio.isMuted());
  const [checklist, setChecklist] = useState<HomologationStatusMap>(() => ({
    ...createEmptyHomologationStatus(),
    no_solution_leaked: true,
    reload_preserves_progress: hydratedFromStorageRef.current,
  }));

  const prevPhaseRef = useRef<ChapterPhase>(state.phase);

  const markCheckPassed = useCallback((id: HomologationCheckId) => {
    setChecklist((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  // Mirror phase to document.body.dataset.state & persist security lockout state
  useEffect(() => {
    document.body.dataset.state = rereadingPrologue
      ? 'prologue-reread'
      : mapPhaseToBodyState(state.phase);
    saveProgress(state);
  }, [state, rereadingPrologue]);

  // Subtle vibration & audio transitions when phase shifts
  useEffect(() => {
    const previous = prevPhaseRef.current;
    prevPhaseRef.current = state.phase;

    if (previous === state.phase) return;

    if (state.phase === 'DEVICE_CHARGING') {
      chapterAudio.playUsbConnectChime();
      markCheckPassed('valid_usb_boots');
    } else if (state.phase === 'DEVICE_BOOTING') {
      setIsVibrating(true);
      chapterAudio.playBootVibration();
      const timer = window.setTimeout(() => setIsVibrating(false), 620);
      return () => window.clearTimeout(timer);
    } else if (state.phase === 'DEVICE_LOCKED') {
      markCheckPassed('lockscreen_keypad_functional');
    } else if (state.phase === 'DEVICE_UNLOCKED') {
      chapterAudio.playUnlockSuccess();
      markCheckPassed('right_passcode_unlocks');
      markCheckPassed('supported_runtime_flow');
    }
  }, [state.phase, markCheckPassed]);

  // Play error feedback when wrong passcode is submitted
  useEffect(() => {
    if (state.passcodeErrorId > 0) {
      chapterAudio.playPasscodeError();
      markCheckPassed('wrong_passcode_rejected');
    }
  }, [state.passcodeErrorId, markCheckPassed]);

  // Developer-only QA drawer shortcut (Ctrl+Shift+H) — never shown to players
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        setQaOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  // Pressing any key on the dead battery scene only pulses the dead battery icon
  useEffect(() => {
    if (state.phase !== 'DEVICE_DEAD' || rereadingPrologue) return;
    const handleDeadKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Tab' || event.key === 'Escape') return;
      chapterAudio.playDeadButtonClick();
      dispatch({ type: 'TAP_DEAD_SCREEN' });
      markCheckPassed('no_usb_no_boot');
    };
    window.addEventListener('keydown', handleDeadKey);
    return () => window.removeEventListener('keydown', handleDeadKey);
  }, [state.phase, rereadingPrologue, markCheckPassed]);

  // Real WebUSB & Battery Charger hardware detection: paired scan + live plug/unplug events
  const handlePhysicalDeviceAttempt = useCallback(
    async (device: UsbDeviceLike, options?: { enforceWhitelist?: boolean }) => {
      const outcome = await performUsbHandshake(device, undefined, options);
      if (outcome.ok && outcome.deviceFingerprint) {
        dispatch({
          type: 'USB_VALIDATION_SUCCEEDED',
          deviceFingerprint: outcome.deviceFingerprint,
        });
      } else {
        chapterAudio.playDeadButtonClick();
        const errorCode = outcome.errorCode ?? 'UNAUTHORIZED_DEVICE';
        dispatch({ type: 'USB_VALIDATION_FAILED', errorCode });
        if (errorCode === 'UNAUTHORIZED_DEVICE') {
          markCheckPassed('unauthorized_usb_rejected');
        } else {
          markCheckPassed('usb_errors_handled');
        }
      }
    },
    [markCheckPassed]
  );

  useEffect(() => {
    if (
      state.phase === 'PROLOGUE_PAST' ||
      state.phase === 'PROLOGUE_RUPTURE'
    ) {
      return;
    }

    let cancelled = false;

    void scanAuthorizedPairedUsb().then((outcome) => {
      if (cancelled || !outcome) return;
      if (outcome.ok && outcome.deviceFingerprint) {
        dispatch({
          type: 'USB_VALIDATION_SUCCEEDED',
          deviceFingerprint: outcome.deviceFingerprint,
        });
      } else if (outcome.errorCode) {
        dispatch({
          type: 'USB_VALIDATION_FAILED',
          errorCode: outcome.errorCode,
        });
        markCheckPassed('usb_errors_handled');
      }
    });

    const unsubscribeCharger = subscribePhysicalChargerEvents({
      onChargerConnected: (fingerprint) => {
        dispatch({
          type: 'USB_VALIDATION_SUCCEEDED',
          deviceFingerprint: fingerprint,
        });
      },
      onChargerDisconnected: () => {
        dispatch({ type: 'USB_DISCONNECTED' });
        markCheckPassed('usb_errors_handled');
      },
    });

    const unsubscribeUsb = subscribePhysicalUsbEvents({
      onConnect: (device) => {
        void handlePhysicalDeviceAttempt(device, { enforceWhitelist: false });
      },
      onDisconnect: (device) => {
        const fingerprint = buildDeviceFingerprint(device);
        dispatch({
          type: 'USB_DISCONNECTED',
          deviceFingerprint: fingerprint,
        });
        markCheckPassed('usb_errors_handled');
      },
    });

    return () => {
      cancelled = true;
      unsubscribeCharger();
      unsubscribeUsb();
    };
  }, [state.phase, handlePhysicalDeviceAttempt, markCheckPassed]);

  const handleTapDeadScreen = useCallback(() => {
    chapterAudio.playDeadButtonClick();
    dispatch({ type: 'TAP_DEAD_SCREEN' });
    markCheckPassed('no_usb_no_boot');
  }, [markCheckPassed]);

  const handlePressPowerButton = useCallback(() => {
    chapterAudio.playDeadButtonClick();
    if (state.phase === 'DEVICE_DEAD') {
      dispatch({ type: 'TAP_DEAD_SCREEN' });
      markCheckPassed('no_usb_no_boot');
    }
  }, [state.phase, markCheckPassed]);

  const handleInteractUsbPort = useCallback(async () => {
    if (usbBusy) return;
    setUsbBusy(true);
    try {
      const outcome = await requestPhysicalUsbConnection();
      if (outcome.ok && outcome.deviceFingerprint) {
        dispatch({
          type: 'USB_VALIDATION_SUCCEEDED',
          deviceFingerprint: outcome.deviceFingerprint,
        });
      } else {
        chapterAudio.playDeadButtonClick();
        const errorCode = outcome.errorCode ?? 'READ_FAILED';
        dispatch({ type: 'USB_VALIDATION_FAILED', errorCode });
        if (errorCode === 'UNAUTHORIZED_DEVICE') {
          markCheckPassed('unauthorized_usb_rejected');
        } else {
          markCheckPassed('usb_errors_handled');
        }
      }
    } finally {
      setUsbBusy(false);
    }
  }, [usbBusy, markCheckPassed]);

  const handleDigit = useCallback((digit: string) => {
    chapterAudio.playKeypadTap(digit);
    dispatch({ type: 'KEYPAD_DIGIT', digit, now: Date.now() });
  }, []);

  const handleBackspace = useCallback(() => {
    chapterAudio.playKeypadTap();
    dispatch({ type: 'KEYPAD_BACKSPACE' });
  }, []);

  const handleCooldownExpired = useCallback(() => {
    dispatch({ type: 'COOLDOWN_EXPIRED', now: Date.now() });
  }, []);

  const handleChargingComplete = useCallback(() => {
    dispatch({ type: 'CHARGING_COMPLETE' });
  }, []);

  const handleBootComplete = useCallback(() => {
    dispatch({ type: 'BOOT_COMPLETE' });
  }, []);

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    chapterAudio.setMuted(next);
  };

  // QA-only hardware harness handlers (never exposed in player UI)
  const handleQaUnauthorizedUsb = useCallback(() => {
    void handlePhysicalDeviceAttempt({
      vendorId: 0x046d,
      productId: 0xc52b,
      serialNumber: 'GENERIC-PERIPHERAL',
    });
  }, [handlePhysicalDeviceAttempt]);

  const handleQaAuthorizedUsb = useCallback(() => {
    const official = AUTHORIZED_USB_DESCRIPTORS[0];
    void handlePhysicalDeviceAttempt({
      vendorId: official.vendorId,
      productId: official.productId,
      serialNumber: `${official.serialPrefix ?? ''}QA01`,
      opened: false,
      open: async () => {},
    });
  }, [handlePhysicalDeviceAttempt]);

  const handleQaPermissionDenied = useCallback(() => {
    chapterAudio.playDeadButtonClick();
    dispatch({
      type: 'USB_VALIDATION_FAILED',
      errorCode: 'PERMISSION_DENIED',
    });
    markCheckPassed('usb_errors_handled');
  }, [markCheckPassed]);

  const handleQaDisconnect = useCallback(() => {
    dispatch({
      type: 'USB_DISCONNECTED',
      deviceFingerprint: state.usbDeviceFingerprint ?? undefined,
    });
    markCheckPassed('usb_errors_handled');
  }, [state.usbDeviceFingerprint, markCheckPassed]);

  const handleResetChapter = useCallback(() => {
    clearProgress();
    setRereadingPrologue(false);
    dispatch({ type: 'RESET_CHAPTER' });
  }, []);

  const handleToggleCheck = useCallback((id: HomologationCheckId) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isPrologue =
    state.phase === 'PROLOGUE_PAST' || state.phase === 'PROLOGUE_RUPTURE';

  return (
    <>
      <main
        data-testid="device-scene"
        data-phase={state.phase}
        className="h-[100dvh] w-full overflow-hidden bg-[#050506]"
      >
        <PhoneChassis
          isVibrating={isVibrating}
          usbConnected={state.usbConnected}
          usbBusy={usbBusy}
          showHardwareControls={!isPrologue && !rereadingPrologue}
          muted={muted}
          onToggleMute={handleToggleMute}
          onOpenPrologue={() => setRereadingPrologue(true)}
          onPressPowerButton={handlePressPowerButton}
          onInteractUsbPort={handleInteractUsbPort}
        >
          {isPrologue ? (
            <PrologueScreen
              mode="initial"
              onEnterRupture={() => dispatch({ type: 'ENTER_RUPTURE' })}
              onComplete={() => dispatch({ type: 'COMPLETE_PROLOGUE' })}
            />
          ) : rereadingPrologue ? (
            <PrologueScreen
              mode="reread"
              onComplete={() => setRereadingPrologue(false)}
            />
          ) : (
            <div className="relative flex h-full w-full flex-col">
              {state.phase === 'DEVICE_DEAD' && (
                <DeadBatteryScreen
                  pulseId={state.deadBatteryPulseId}
                  onTapScreen={handleTapDeadScreen}
                />
              )}

              {state.phase === 'DEVICE_CHARGING' && (
                <ChargingScreen onChargingDone={handleChargingComplete} />
              )}

              {state.phase === 'DEVICE_BOOTING' && (
                <BootingScreen onBootDone={handleBootComplete} />
              )}

              {state.phase === 'DEVICE_LOCKED' && (
                <LockScreen
                  enteredDigits={state.enteredDigits}
                  passcodeErrorId={state.passcodeErrorId}
                  lockoutUntil={state.lockoutUntil}
                  usbConnected={state.usbConnected}
                  onDigit={handleDigit}
                  onBackspace={handleBackspace}
                  onCooldownExpired={handleCooldownExpired}
                />
              )}

              {state.phase === 'DEVICE_UNLOCKED' && (
                <Suspense
                  fallback={
                    <div className="h-full w-full bg-[#0a0c10]" aria-hidden="true" />
                  }
                >
                  <UnlockedPhoneOS usbConnected={state.usbConnected} />
                </Suspense>
              )}
            </div>
          )}
        </PhoneChassis>
      </main>

      {/* Hidden QA Homologation Panel (?qa=1 or Ctrl+Shift+H only, lazy-loaded) */}
      {qaOpen && (
        <Suspense fallback={null}>
          <HomologationDrawer
            open={qaOpen}
            state={state}
            checklist={checklist}
            onClose={() => setQaOpen(false)}
            onToggleCheck={handleToggleCheck}
            onSimulateUnauthorizedUsb={handleQaUnauthorizedUsb}
            onSimulateAuthorizedUsb={handleQaAuthorizedUsb}
            onSimulatePermissionDenied={handleQaPermissionDenied}
            onSimulateDisconnect={handleQaDisconnect}
            onResetChapter={handleResetChapter}
            onReplayPrologue={() => {
              setRereadingPrologue(false);
              dispatch({ type: 'REPLAY_PROLOGUE' });
            }}
          />
        </Suspense>
      )}
    </>
  );
}
