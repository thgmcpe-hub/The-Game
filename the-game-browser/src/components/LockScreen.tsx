import { useEffect, useState } from 'react';
import { Lock, Zap } from 'lucide-react';
import { CANON_PROFILE, GENERATED_ASSETS } from '../game/canonConfig';
import { getPasscodeLength } from '../game/passcode';

interface LockScreenProps {
  enteredDigits: string;
  passcodeErrorId: number;
  lockoutUntil: number | null;
  usbConnected: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onCooldownExpired: () => void;
}

const KEYPAD_ROWS: ReadonlyArray<ReadonlyArray<{ digit: string; letters: string }>> = [
  [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
  ],
  [
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
  ],
  [
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
  ],
];

/**
 * State D — Tela de bloqueio estilo iPhone.
 * - Frosted translucent circular numeric keypad with uppercase sub-letters.
 * - Authentic horizontal shake on wrong code.
 * - Real 5-attempt lockout ("iPhone Indisponível" + 30s live countdown)
 *   that disables input and persists across reload.
 */
export function LockScreen({
  enteredDigits,
  passcodeErrorId,
  lockoutUntil,
  usbConnected,
  onDigit,
  onBackspace,
  onCooldownExpired,
}: LockScreenProps) {
  const [wallpaperBroken, setWallpaperBroken] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showErrorLabel, setShowErrorLabel] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const passcodeLength = getPasscodeLength();
  const isLockedOutNow = remainingSeconds > 0;

  useEffect(() => {
    if (passcodeErrorId === 0) return;
    setShaking(true);
    setShowErrorLabel(true);
    const shakeTimer = window.setTimeout(() => setShaking(false), 450);
    const labelTimer = window.setTimeout(() => setShowErrorLabel(false), 2200);
    return () => {
      window.clearTimeout(shakeTimer);
      window.clearTimeout(labelTimer);
    };
  }, [passcodeErrorId]);

  useEffect(() => {
    if (lockoutUntil === null) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      const diff = lockoutUntil - Date.now();
      if (diff <= 0) {
        setRemainingSeconds(0);
        onCooldownExpired();
      } else {
        setRemainingSeconds(Math.ceil(diff / 1000));
      }
    };

    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [lockoutUntil, onCooldownExpired]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        onDigit(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        onBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDigit, onBackspace]);

  return (
    <div
      data-testid="lock-screen"
      data-locked-out={isLockedOutNow ? 'true' : 'false'}
      className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#0c1118] text-white select-none"
    >
      {/* Letícia's blurred lock screen wallpaper (iOS passcode blur feel) */}
      {!wallpaperBroken && (
        <img
          src={GENERATED_ASSETS.lockWallpaper}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          onError={() => setWallpaperBroken(true)}
          className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-85 blur-[14px]"
        />
      )}

      {/* Measured iOS dark frosted scrim */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/58 via-black/50 to-black/78"
      />

      {/* iOS Top Status Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-3.5 text-[12px] font-medium tracking-tight text-white/90 tabular-nums">
        <span>Sem serviço</span>
        <div className="flex items-center gap-1.5">
          <span>100%</span>
          <span className="relative inline-flex h-[13px] w-[24px] items-center rounded-[4px] border border-white/75 p-[1.5px]">
            <span className="h-full w-full rounded-[2px] bg-[#30d158]" />
            {usbConnected && (
              <Zap className="absolute -right-3 h-2.5 w-2.5 fill-white text-white" />
            )}
          </span>
        </div>
      </div>

      {/* Lockout Mode (iPhone Indisponível — 30s real-life cooldown after 5 wrong tries) */}
      {isLockedOutNow ? (
        <div
          data-testid="lockout-screen"
          aria-live="polite"
          className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center"
        >
          <Lock className="h-7 w-7 text-white/85" aria-hidden="true" />
          <h1 className="mt-5 text-[28px] leading-tight font-light tracking-tight text-white">
            iPhone Indisponível
          </h1>
          <p className="mt-3 text-sm font-normal text-white/80 tabular-nums">
            Tente novamente em {remainingSeconds}{' '}
            {remainingSeconds === 1 ? 'segundo' : 'segundos'}
          </p>
        </div>
      ) : (
        <>
          {/* iPhone Lock Header + Passcode Dots */}
          <div className="relative z-10 flex flex-col items-center px-6 pt-3 text-center">
            <Lock className="h-4 w-4 text-white/85" aria-hidden="true" />
            <p className="mt-1.5 text-[38px] leading-none font-light tracking-tight text-white tabular-nums">
              {CANON_PROFILE.lockClockTime}
            </p>
            <p className="mt-1 text-xs font-normal text-white/75">
              {CANON_PROFILE.lockClockDate}
            </p>

            <div className="mt-4 flex flex-col items-center">
              <p
                aria-live="polite"
                className="h-5 text-sm font-normal tracking-tight text-white/95"
              >
                {showErrorLabel ? 'Código incorreto' : 'Digite o código'}
              </p>

              <div
                data-testid="passcode-dots"
                data-filled={enteredDigits.length}
                aria-label={`${enteredDigits.length} de ${passcodeLength} dígitos inseridos`}
                className={`mt-3 flex items-center gap-3 ${
                  shaking ? 'animate-keypad-shake' : ''
                }`}
              >
                {Array.from({ length: passcodeLength }).map((_, idx) => {
                  const filled = idx < enteredDigits.length;
                  return (
                    <span
                      key={idx}
                      className={`h-3 w-3 rounded-full border-[1.5px] transition-all duration-150 ${
                        filled
                          ? 'scale-105 border-white bg-white'
                          : 'border-white/75 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Authentic iPhone Circular Frosted Keypad */}
          <div className="relative z-10 flex flex-col items-center px-6 pb-3">
            <div
              role="group"
              aria-label="Teclado numérico"
              className="grid w-full max-w-[258px] grid-cols-3 justify-items-center gap-x-4 gap-y-2.5"
            >
              {KEYPAD_ROWS.flat().map((key) => (
                <button
                  key={key.digit}
                  type="button"
                  onClick={() => onDigit(key.digit)}
                  aria-label={`Dígito ${key.digit}`}
                  className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full bg-white/[0.15] text-white backdrop-blur-md transition-colors duration-100 hover:bg-white/[0.24] active:scale-95 active:bg-white/[0.38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span className="text-[26px] leading-none font-light tabular-nums">
                    {key.digit}
                  </span>
                  {key.letters && (
                    <span className="mt-0.5 text-[8px] font-semibold tracking-[0.16em] text-white/80">
                      {key.letters}
                    </span>
                  )}
                </button>
              ))}

              {/* Bottom row: empty spacer | 0 | Apagar (iOS style) */}
              <div className="h-[64px] w-[64px]" aria-hidden="true" />

              <button
                type="button"
                onClick={() => onDigit('0')}
                aria-label="Dígito 0"
                className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white/[0.15] text-[26px] font-light text-white tabular-nums backdrop-blur-md transition-colors duration-100 hover:bg-white/[0.24] active:scale-95 active:bg-white/[0.38] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                0
              </button>

              <button
                type="button"
                disabled={enteredDigits.length === 0}
                onClick={onBackspace}
                aria-label="Apagar último dígito"
                className="flex h-[64px] w-[64px] items-center justify-center text-sm font-normal text-white/90 transition-opacity hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-0"
              >
                Apagar
              </button>
            </div>
          </div>
        </>
      )}

      {/* iPhone Home Bar */}
      <div className="relative z-10 flex justify-center pb-2">
        <div
          aria-hidden="true"
          className="h-1 w-28 rounded-full bg-white/45"
        />
      </div>
    </div>
  );
}
