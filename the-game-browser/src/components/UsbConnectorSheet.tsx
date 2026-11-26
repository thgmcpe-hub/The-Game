import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Cable, Usb, X, Zap } from 'lucide-react';
import { chapterAudio } from '../game/audio';
import type { HardwareUsbSupportMode, UsbErrorCode } from '../game/usbHardware';

interface UsbConnectorSheetProps {
  open: boolean;
  supportMode: HardwareUsbSupportMode;
  isMobile: boolean;
  hidSupported: boolean;
  usbBusy: boolean;
  usbErrorCode: UsbErrorCode | null;
  onClose: () => void;
  onTriggerWebUsbPicker: () => void;
  onTriggerWebHidPicker: () => void;
  onManualPlugComplete: () => void;
}

const HOLD_DURATION_MS = 850;

function formatUsbErrorMessage(code: UsbErrorCode | null): string | null {
  switch (code) {
    case 'PERMISSION_DENIED':
      return 'O navegador ou janela bloqueou o acesso direto à porta USB. Segure o conector abaixo para encaixar o cabo.';
    case 'USER_CANCELLED':
      return 'Nenhum dispositivo USB foi selecionado. Se o cabo não apareceu na lista, use o periférico USB ou segure o conector abaixo.';
    case 'UNSUPPORTED_BROWSER':
      return 'Este navegador não libera leitura direta de USB. Segure o conector abaixo para encaixar o cabo.';
    case 'UNAUTHORIZED_DEVICE':
      return 'Dispositivo USB não reconhecido para carga. Tente outro cabo ou segure o conector abaixo.';
    case 'CONNECTION_LOST':
      return 'Conexão USB interrompida antes de estabilizar a energia. Tente conectar novamente.';
    case 'READ_FAILED':
      return 'Não foi possível ler a porta USB neste computador. Segure o conector abaixo para energizar o aparelho.';
    default:
      return null;
  }
}

/**
 * Diegetic USB-C physical connector sheet shown when interacting with the USB-C port:
 * - On PC: supports live charger/USB audio detection, native WebUSB picker, native WebHID
 *   USB peripheral picker (works with mice, keyboards, headsets, controllers on Windows/Mac),
 *   AND tactile click-and-hold USB-C insertion (works in every browser & iframe).
 * - On Mobile: supports automatic Android charger detection + tactile hold-to-plug for iOS/Safari.
 */
export function UsbConnectorSheet({
  open,
  supportMode,
  isMobile,
  hidSupported,
  usbBusy,
  usbErrorCode,
  onClose,
  onTriggerWebUsbPicker,
  onTriggerWebHidPicker,
  onManualPlugComplete,
}: UsbConnectorSheetProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [releasedEarly, setReleasedEarly] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);

  const stopHold = () => {
    const wasHolding = holding;
    setHolding(false);
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (!completedRef.current) {
      if (wasHolding && holdProgress < 100) {
        setReleasedEarly(true);
      }
      setHoldProgress(0);
    }
  };

  useEffect(() => {
    if (!open) {
      completedRef.current = false;
      setHoldProgress(0);
      setHolding(false);
      setReleasedEarly(false);
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [open, onClose]);

  const startHold = () => {
    if (completedRef.current) return;
    chapterAudio.unlock();
    chapterAudio.playDeadButtonClick();
    setReleasedEarly(false);
    setHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
      setHoldProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        completedRef.current = true;
        setHolding(false);
        rafRef.current = null;
        chapterAudio.playCablePlugSnap();
        onManualPlugComplete();
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
  };

  if (!open) return null;

  const isWebUsbCapable =
    supportMode === 'battery-and-usb' || supportMode === 'usb-only';
  const errorFeedback = formatUsbErrorMessage(usbErrorCode);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Entrada USB-C do aparelho"
      data-testid="usb-connector-sheet"
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/82"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full rounded-t-3xl border-t border-stone-800 bg-[#0d0c0b] px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] text-stone-200 shadow-2xl sm:pb-6"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-3.5 h-1 w-10 rounded-full bg-stone-700"
        />

        <div className="flex items-start justify-between gap-4 border-b border-stone-800/90 pb-3.5">
          <div className="flex items-center gap-2.5">
            <Cable className="h-4 w-4 text-red-400/90" aria-hidden="true" />
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-stone-500 uppercase">
                ENTRADA USB-C · ENERGIA
              </p>
              <h2 className="mt-0.5 text-sm font-medium text-stone-100">
                Conectar cabo ao celular de Letícia
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar entrada USB-C"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3.5 space-y-3">
          <p className="text-xs leading-5 text-stone-400">
            {isMobile
              ? 'Conecte o carregador físico no seu celular para carregar automaticamente, ou segure o botão abaixo para encaixar o cabo USB-C.'
              : 'No computador, você pode plugar o carregador do notebook, selecionar um cabo ou periférico USB conectado ao PC, ou manter pressionado o conector abaixo.'}
          </p>

          {errorFeedback && (
            <div
              role="status"
              data-testid="usb-error-feedback"
              className="flex items-start gap-2 rounded-lg border border-[#7f1d1d]/60 bg-[#1a0d0f] px-3 py-2 text-[11px] leading-4 text-red-200/90"
            >
              <AlertCircle
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400"
                aria-hidden="true"
              />
              <span>{errorFeedback}</span>
            </div>
          )}

          {/* Tactile hold-to-plug USB-C connector (mouse, touch, and keyboard Enter/Space) */}
          <button
            type="button"
            data-testid="usb-hold-plug-btn"
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            onKeyDown={(event) => {
              if ((event.key === 'Enter' || event.key === ' ') && !holding) {
                event.preventDefault();
                startHold();
              }
            }}
            onKeyUp={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                stopHold();
              }
            }}
            aria-label="Segure para encaixar o cabo USB-C"
            className="relative flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-[#b5a387]/75 bg-[#161310] px-4 font-mono text-xs font-medium tracking-[0.06em] text-[#e5dccb] uppercase transition-colors select-none touch-none hover:border-[#d6c9b4] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#c2b092]"
          >
            {/* Smooth charging insertion fill bar */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 bg-emerald-500/30 transition-[width] duration-75"
              style={{ width: `${holdProgress}%` }}
            />
            <Zap
              className={`relative z-10 h-4 w-4 transition-colors ${
                holding ? 'text-emerald-400' : 'text-[#d6c9b4]'
              }`}
              aria-hidden="true"
            />
            <span className="relative z-10">
              {holding
                ? `Encaixando cabo... ${holdProgress}%`
                : 'Segure para encaixar o cabo USB-C'}
            </span>
          </button>

          {releasedEarly && !holding && (
            <p className="text-center font-mono text-[10px] text-amber-300/90">
              Mantenha o botão pressionado até completar 100%.
            </p>
          )}

          {/* Native PC / OTG hardware pickers */}
          {!isMobile && (isWebUsbCapable || hidSupported) && (
            <div className="space-y-2 border-t border-stone-800/80 pt-3">
              <p className="font-mono text-[9.5px] tracking-[0.16em] text-stone-500 uppercase">
                DETECÇÃO FÍSICA NO PC
              </p>

              <div className="grid grid-cols-1 gap-2">
                {isWebUsbCapable && (
                  <button
                    type="button"
                    data-testid="usb-webusb-picker-btn"
                    disabled={usbBusy}
                    onClick={() => {
                      chapterAudio.unlock();
                      onTriggerWebUsbPicker();
                    }}
                    className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-stone-800 bg-stone-900/75 px-3 font-mono text-[11px] text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100 disabled:opacity-50"
                  >
                    <Usb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Selecionar porta WebUSB no navegador</span>
                  </button>
                )}

                {hidSupported && (
                  <button
                    type="button"
                    data-testid="usb-webhid-picker-btn"
                    disabled={usbBusy}
                    onClick={() => {
                      chapterAudio.unlock();
                      onTriggerWebHidPicker();
                    }}
                    className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-stone-800 bg-stone-900/75 px-3 font-mono text-[11px] text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100 disabled:opacity-50"
                  >
                    <Cable className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Reconhecer periférico USB do PC</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
