import { LOCKOUT_POLICY } from './canonConfig';
import { getPasscodeLength, verifyPasscode } from './passcode';
import type { UsbErrorCode } from './usbHardware';

export type ChapterPhase =
  | 'PROLOGUE_PAST'
  | 'PROLOGUE_RUPTURE'
  | 'DEVICE_DEAD'
  | 'DEVICE_CHARGING'
  | 'DEVICE_BOOTING'
  | 'DEVICE_LOCKED'
  | 'DEVICE_UNLOCKED';

export interface ChapterState {
  readonly phase: ChapterPhase;
  readonly prologueCompleted: boolean;
  readonly usbConnected: boolean;
  readonly usbDeviceFingerprint: string | null;
  readonly lastUsbError: UsbErrorCode | null;
  readonly deadBatteryPulseId: number;
  readonly enteredDigits: string;
  readonly failedAttempts: number;
  readonly passcodeErrorId: number;
  readonly lockoutUntil: number | null;
  readonly unlockedAt: number | null;
}

export type ChapterAction =
  | { type: 'ENTER_RUPTURE' }
  | { type: 'COMPLETE_PROLOGUE' }
  | { type: 'TAP_DEAD_SCREEN' }
  | { type: 'USB_VALIDATION_SUCCEEDED'; deviceFingerprint: string }
  | { type: 'USB_VALIDATION_FAILED'; errorCode: UsbErrorCode }
  | { type: 'USB_DISCONNECTED'; deviceFingerprint?: string }
  | { type: 'CHARGING_COMPLETE' }
  | { type: 'BOOT_COMPLETE' }
  | { type: 'KEYPAD_DIGIT'; digit: string; now: number }
  | { type: 'KEYPAD_BACKSPACE' }
  | { type: 'KEYPAD_CLEAR' }
  | { type: 'COOLDOWN_EXPIRED'; now: number }
  | { type: 'REPLAY_PROLOGUE' }
  | { type: 'RESET_CHAPTER' };

export function createInitialChapterState(options?: {
  skipPrologue?: boolean;
}): ChapterState {
  return {
    phase: options?.skipPrologue ? 'DEVICE_DEAD' : 'PROLOGUE_PAST',
    prologueCompleted: Boolean(options?.skipPrologue),
    usbConnected: false,
    usbDeviceFingerprint: null,
    lastUsbError: null,
    deadBatteryPulseId: 0,
    enteredDigits: '',
    failedAttempts: 0,
    passcodeErrorId: 0,
    lockoutUntil: null,
    unlockedAt: null,
  };
}

export function isLockedOut(state: ChapterState, now: number): boolean {
  return state.lockoutUntil !== null && now < state.lockoutUntil;
}

export function getRemainingLockoutSeconds(state: ChapterState, now: number): number {
  if (state.lockoutUntil === null || now >= state.lockoutUntil) {
    return 0;
  }
  return Math.ceil((state.lockoutUntil - now) / 1000);
}

export function chapterReducer(
  state: ChapterState,
  action: ChapterAction
): ChapterState {
  switch (action.type) {
    case 'ENTER_RUPTURE': {
      if (state.phase !== 'PROLOGUE_PAST') return state;
      return {
        ...state,
        phase: 'PROLOGUE_RUPTURE',
      };
    }

    case 'COMPLETE_PROLOGUE': {
      if (state.phase !== 'PROLOGUE_PAST' && state.phase !== 'PROLOGUE_RUPTURE') {
        return state;
      }
      return {
        ...state,
        phase: 'DEVICE_DEAD',
        prologueCompleted: true,
        deadBatteryPulseId: state.deadBatteryPulseId + 1,
      };
    }

    case 'TAP_DEAD_SCREEN': {
      // Mandatory behavior: tapping, clicking, or pressing keys NEVER leaves DEVICE_DEAD.
      if (state.phase !== 'DEVICE_DEAD') return state;
      return {
        ...state,
        deadBatteryPulseId: state.deadBatteryPulseId + 1,
      };
    }

    case 'USB_VALIDATION_SUCCEEDED': {
      if (state.phase === 'DEVICE_DEAD') {
        return {
          ...state,
          phase: 'DEVICE_CHARGING',
          usbConnected: true,
          usbDeviceFingerprint: action.deviceFingerprint,
          lastUsbError: null,
        };
      }
      // If already booted/locked/unlocked, reconnect power silently without regressing progress.
      if (
        state.phase === 'DEVICE_CHARGING' ||
        state.phase === 'DEVICE_BOOTING' ||
        state.phase === 'DEVICE_LOCKED' ||
        state.phase === 'DEVICE_UNLOCKED'
      ) {
        return {
          ...state,
          usbConnected: true,
          usbDeviceFingerprint: action.deviceFingerprint,
          lastUsbError: null,
        };
      }
      return state;
    }

    case 'USB_VALIDATION_FAILED': {
      // Strictly never advances from DEVICE_DEAD on unauthorized/failed USB.
      return {
        ...state,
        lastUsbError: action.errorCode,
        deadBatteryPulseId:
          state.phase === 'DEVICE_DEAD'
            ? state.deadBatteryPulseId + 1
            : state.deadBatteryPulseId,
      };
    }

    case 'USB_DISCONNECTED': {
      if (
        action.deviceFingerprint &&
        state.usbDeviceFingerprint &&
        action.deviceFingerprint !== state.usbDeviceFingerprint
      ) {
        return state;
      }

      // If unplugged during initial charging or boot before OS stabilizes, power drops.
      if (state.phase === 'DEVICE_CHARGING' || state.phase === 'DEVICE_BOOTING') {
        return {
          ...state,
          phase: 'DEVICE_DEAD',
          usbConnected: false,
          usbDeviceFingerprint: null,
          lastUsbError: 'CONNECTION_LOST',
          deadBatteryPulseId: state.deadBatteryPulseId + 1,
        };
      }

      return {
        ...state,
        usbConnected: false,
        usbDeviceFingerprint: null,
      };
    }

    case 'CHARGING_COMPLETE': {
      if (state.phase !== 'DEVICE_CHARGING' || !state.usbConnected) {
        return state;
      }
      return {
        ...state,
        phase: 'DEVICE_BOOTING',
      };
    }

    case 'BOOT_COMPLETE': {
      if (state.phase !== 'DEVICE_BOOTING' || !state.usbConnected) {
        return state;
      }
      return {
        ...state,
        phase: 'DEVICE_LOCKED',
      };
    }

    case 'KEYPAD_DIGIT': {
      if (state.phase !== 'DEVICE_LOCKED') return state;
      if (!/^\d$/.test(action.digit)) return state;
      if (isLockedOut(state, action.now)) return state;

      const passcodeLength = getPasscodeLength();
      const nextDigits = `${state.enteredDigits}${action.digit}`.slice(
        0,
        passcodeLength
      );

      if (nextDigits.length < passcodeLength) {
        return {
          ...state,
          enteredDigits: nextDigits,
        };
      }

      if (verifyPasscode(nextDigits)) {
        return {
          ...state,
          phase: 'DEVICE_UNLOCKED',
          enteredDigits: '',
          failedAttempts: 0,
          lockoutUntil: null,
          unlockedAt: action.now,
        };
      }

      const nextFailedAttempts = state.failedAttempts + 1;
      const shouldLockout =
        nextFailedAttempts >= LOCKOUT_POLICY.maxAttemptsBeforeLockout &&
        nextFailedAttempts % LOCKOUT_POLICY.maxAttemptsBeforeLockout === 0;

      return {
        ...state,
        enteredDigits: '',
        failedAttempts: nextFailedAttempts,
        passcodeErrorId: state.passcodeErrorId + 1,
        lockoutUntil: shouldLockout
          ? action.now + LOCKOUT_POLICY.lockoutDurationMs
          : state.lockoutUntil,
      };
    }

    case 'KEYPAD_BACKSPACE': {
      if (state.phase !== 'DEVICE_LOCKED') return state;
      if (state.enteredDigits.length === 0) return state;
      return {
        ...state,
        enteredDigits: state.enteredDigits.slice(0, -1),
      };
    }

    case 'KEYPAD_CLEAR': {
      if (state.phase !== 'DEVICE_LOCKED') return state;
      return {
        ...state,
        enteredDigits: '',
      };
    }

    case 'COOLDOWN_EXPIRED': {
      if (state.lockoutUntil === null || action.now < state.lockoutUntil) {
        return state;
      }
      return {
        ...state,
        lockoutUntil: null,
      };
    }

    case 'REPLAY_PROLOGUE': {
      return {
        ...state,
        phase: 'PROLOGUE_PAST',
      };
    }

    case 'RESET_CHAPTER': {
      return createInitialChapterState({ skipPrologue: false });
    }

    default:
      return state;
  }
}
