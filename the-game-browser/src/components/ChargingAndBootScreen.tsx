import { useEffect, useState } from 'react';
import { CHARGING_MILESTONES } from '../game/canonConfig';

interface ChargingScreenProps {
  onChargingDone: () => void;
}

/**
 * State B — Conexão física reconhecida.
 * Steps authentically through 20% -> 40% -> 60% -> 80% -> 100% before
 * powering on the smartphone. Strictly omits gamey messages like "USB correto".
 */
export function ChargingScreen({ onChargingDone }: ChargingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const chargeLevel = CHARGING_MILESTONES[stepIndex];

  useEffect(() => {
    const timers: number[] = [];

    for (let i = 1; i < CHARGING_MILESTONES.length; i += 1) {
      timers.push(
        window.setTimeout(() => {
          setStepIndex(i);
        }, i * 850)
      );
    }

    timers.push(
      window.setTimeout(() => {
        onChargingDone();
      }, CHARGING_MILESTONES.length * 850 + 550)
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [onChargingDone]);

  const maxFillHeight = 86;
  const fillHeight = Math.round((chargeLevel / 100) * maxFillHeight);
  const fillY = 104 - fillHeight;
  const fillColor =
    chargeLevel <= 20
      ? '#dc2626'
      : chargeLevel <= 40
        ? '#f59e0b'
        : '#30d158';

  return (
    <div
      data-testid="charging-screen"
      data-charge-percent={chargeLevel}
      aria-label={`Carregando bateria: ${chargeLevel}%`}
      className="flex h-full w-full flex-col items-center justify-center bg-black p-8 select-none"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Authentic vertical OLED charging battery */}
        <svg viewBox="0 0 72 124" className="h-32 w-20" aria-hidden="true">
          <rect x="24" y="4" width="24" height="6" rx="2.5" fill="#71717a" />
          <rect
            x="10"
            y="12"
            width="52"
            height="102"
            rx="11"
            fill="none"
            stroke="#71717a"
            strokeWidth="3.5"
          />
          <rect
            x="16"
            y={fillY}
            width="40"
            height={fillHeight}
            rx="5"
            fill={fillColor}
            className="transition-all duration-500 ease-out"
          />
          {/* Subtle charging bolt centered over battery */}
          <path
            d="M38.5 42L27 63h8.5L33.5 84L45 63h-8.5L38.5 42Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </svg>

        <div className="flex flex-col items-center gap-2">
          <span
            data-testid="charging-percent"
            className="text-3xl font-light tracking-tight text-zinc-100 tabular-nums"
          >
            {chargeLevel}%
          </span>

          {/* Subtle 5-step milestone progress ticks (20 / 40 / 60 / 80 / 100) */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {CHARGING_MILESTONES.map((milestone, idx) => (
              <span
                key={milestone}
                className={`h-1 w-5 rounded-full transition-colors duration-300 ${
                  idx <= stepIndex
                    ? chargeLevel >= 60
                      ? 'bg-[#30d158]'
                      : chargeLevel >= 40
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BootingScreenProps {
  onBootDone: () => void;
}

/**
 * State C — Inicialização do aparelho.
 * Minimal monochrome manufacturer boot emblem with synchronized haptic vibration
 * before revealing the iPhone-style Lock Screen.
 */
export function BootingScreen({ onBootDone }: BootingScreenProps) {
  const [logoVisible, setLogoVisible] = useState(false);

  useEffect(() => {
    const tIn = window.setTimeout(() => setLogoVisible(true), 120);
    const tOut = window.setTimeout(() => setLogoVisible(false), 1850);
    const tDone = window.setTimeout(() => onBootDone(), 2300);
    return () => {
      window.clearTimeout(tIn);
      window.clearTimeout(tOut);
      window.clearTimeout(tDone);
    };
  }, [onBootDone]);

  return (
    <div
      data-testid="booting-screen"
      aria-label="Ligando aparelho"
      className="flex h-full w-full flex-col items-center justify-center bg-black p-8 select-none"
    >
      <div
        className={`flex flex-col items-center gap-6 transition-opacity duration-700 ${
          logoVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <svg
          viewBox="0 0 64 64"
          className="h-16 w-16 text-zinc-100"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r="24"
            stroke="currentColor"
            strokeWidth="1.75"
            opacity="0.9"
          />
          <path
            d="M32 14v36M21 25l11-11 11 11"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.92"
          />
        </svg>
      </div>
    </div>
  );
}
