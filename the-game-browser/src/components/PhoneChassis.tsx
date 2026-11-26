import type { ReactNode } from 'react';
import { BookOpen, Usb, Volume2, VolumeX } from 'lucide-react';
import { EvidenceSlip } from './EvidenceSlip';

interface PhoneChassisProps {
  children: ReactNode;
  isVibrating: boolean;
  usbConnected: boolean;
  usbBusy: boolean;
  showHardwareControls: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onOpenPrologue: () => void;
  onPressPowerButton: () => void;
  onInteractUsbPort: () => void;
}

/**
 * True mobile-first viewport container:
 * - On mobile phones (< 640px): fills 100vw x 100dvh edge-to-edge natively.
 * - On desktop (>= 640px): centers a dedicated 390x844 mobile portrait viewport.
 * - Bottom dock keeps "Prólogo" (reread clues anytime), "Ficha", "USB-C", and
 *   audio toggle constantly accessible without losing device state.
 */
export function PhoneChassis({
  children,
  isVibrating,
  usbConnected,
  usbBusy,
  showHardwareControls,
  muted,
  onToggleMute,
  onOpenPrologue,
  onPressPowerButton,
  onInteractUsbPort,
}: PhoneChassisProps) {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-[#050506] sm:px-4 sm:py-5">
      <div
        data-testid="phone-chassis"
        className={`relative flex h-full w-full flex-col overflow-hidden bg-black sm:h-[min(844px,calc(100dvh-48px))] sm:w-[390px] sm:rounded-[38px] sm:border sm:border-zinc-800/90 sm:shadow-[0_32px_90px_rgba(0,0,0,0.92)] ${
          isVibrating ? 'animate-phone-vibrate' : ''
        }`}
      >
        {/* Subtle physical side power button on desktop portrait frame */}
        {showHardwareControls && (
          <button
            type="button"
            onClick={onPressPowerButton}
            aria-label="Botão lateral de energia do aparelho"
            className="hidden sm:block sm:absolute sm:top-32 sm:-right-[4px] sm:z-30 sm:h-14 sm:w-[4px] sm:rounded-r sm:bg-zinc-700 sm:transition-colors sm:hover:bg-zinc-400"
          />
        )}

        {/* Active Mobile Viewport Content */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>

        {/* Constant bottom utility dock: Prólogo (reread) · Ficha · USB-C · Áudio */}
        {showHardwareControls && (
          <div className="relative z-20 flex shrink-0 items-center justify-between gap-1.5 border-t border-zinc-900/90 bg-[#070709] px-2.5 py-2">
            <button
              type="button"
              data-testid="reread-prologue-btn"
              onClick={onOpenPrologue}
              aria-label="Reler prólogo"
              className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-800/80 bg-zinc-950/90 px-3 font-mono text-[11px] text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100 focus-visible:outline-1 focus-visible:outline-zinc-400"
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Prólogo</span>
            </button>

            <EvidenceSlip />

            <button
              type="button"
              data-testid="usb-port-trigger"
              disabled={usbBusy}
              onClick={onInteractUsbPort}
              aria-label={
                usbConnected
                  ? 'Cabo USB conectado ao aparelho'
                  : 'Conectar dispositivo USB físico à entrada do aparelho'
              }
              className={`flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-[11px] font-mono transition-colors focus-visible:outline-1 focus-visible:outline-zinc-400 ${
                usbConnected
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-200'
                  : 'border-zinc-800/90 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              <Usb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">
                {usbConnected ? 'USB ok' : 'USB-C'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
              className="flex h-11 w-10 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:text-zinc-200 focus-visible:outline-1 focus-visible:outline-zinc-400"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
