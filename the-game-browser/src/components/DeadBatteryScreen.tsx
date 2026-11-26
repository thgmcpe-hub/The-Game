import { useEffect, useState } from 'react';

interface DeadBatteryScreenProps {
  pulseId: number;
  onTapScreen: () => void;
}

/**
 * State A — Dispositivo sem energia.
 * Pure OLED black display. Clicking or tapping only briefly illuminates the
 * depleted battery symbol and never unlocks or bypasses the USB requirement.
 */
export function DeadBatteryScreen({
  pulseId,
  onTapScreen,
}: DeadBatteryScreenProps) {
  const [iconVisible, setIconVisible] = useState(true);

  useEffect(() => {
    setIconVisible(true);
    const holdMs = pulseId <= 1 ? 4500 : 2600;
    const timer = window.setTimeout(() => {
      setIconVisible(false);
    }, holdMs);
    return () => window.clearTimeout(timer);
  }, [pulseId]);

  return (
    <button
      type="button"
      data-testid="dead-battery-screen"
      aria-label="Tela apagada do aparelho de Letícia — bateria descarregada"
      onClick={onTapScreen}
      className="relative flex h-full w-full cursor-default flex-col items-center justify-center bg-black p-8 focus-visible:outline-none"
    >
      <div
        className={`flex flex-col items-center gap-6 transition-opacity duration-700 ${
          iconVisible ? 'opacity-100' : 'opacity-15'
        }`}
      >
        {/* Realistic minimal OLED depleted battery outline */}
        <svg
          viewBox="0 0 64 116"
          className="h-24 w-14"
          aria-hidden="true"
        >
          {/* Top battery cap */}
          <rect
            x="21"
            y="4"
            width="22"
            height="6"
            rx="2.5"
            fill="#52525b"
          />
          {/* Outer battery body */}
          <rect
            x="8"
            y="12"
            width="48"
            height="98"
            rx="9"
            fill="none"
            stroke="#52525b"
            strokeWidth="3.5"
          />
          {/* Critical red sliver at the bottom */}
          <rect
            x="14"
            y="95"
            width="36"
            height="9"
            rx="3"
            fill="#b91c1c"
            className={iconVisible ? 'animate-battery-breathe' : ''}
          />
        </svg>

        {/* Minimal disconnected lightning + cable glyph (zero explanatory text) */}
        <svg
          viewBox="0 0 40 40"
          className="h-7 w-7 text-zinc-500/80"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M22.5 5L12 20.5h7.5L17.5 35L28 19.5h-7.5L22.5 5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
