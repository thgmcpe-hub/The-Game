import { useState } from 'react';
import { chapterAudio } from '../game/audio';
import { CANON_PROFILE } from '../game/canonConfig';
import evidenceLeticiaPortrait from '../assets/images/evidence_leticia_portrait.jpg';
import evidenceRecoveredPhone from '../assets/images/evidence_recovered_phone.jpg';

/**
 * Mobile-first dual evidence board for Page 00:
 * - Frame 1: Properly fitted B&W Polaroid of Letícia (partially obscured, tap to inspect)
 * - Frame 2: Properly fitted evidence photograph of the recovered discharged cell phone
 * Both Polaroids sit cleanly seated inside a dark archival evidence tray linked by crimson thread.
 */
export function EvidenceBoard() {
  const [inspectTarget, setInspectTarget] = useState<'none' | 'portrait' | 'phone'>('none');

  const toggleInspect = (target: 'portrait' | 'phone') => {
    chapterAudio.unlock();
    chapterAudio.playFileAccessClick();
    setInspectTarget((prev) => (prev === target ? 'none' : target));
  };

  const portraitFocused = inspectTarget === 'portrait';
  const phoneFocused = inspectTarget === 'phone';

  return (
    <div
      data-testid="evidence-board"
      className="animate-dossier-reveal relative w-full rounded-[3px] border border-stone-800/80 bg-[#0c0b0a]/90 px-3 pt-2.5 pb-2 shadow-[0_14px_34px_rgba(0,0,0,0.75)] select-none"
      style={{ animationDelay: '460ms' }}
    >
      {/* Subtle crimson investigation thread connecting the two evidence frames */}
      <svg
        viewBox="0 0 320 120"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        preserveAspectRatio="none"
      >
        <line
          x1="46"
          y1="16"
          x2="274"
          y2="18"
          stroke="#7f1d1d"
          strokeWidth="1.2"
          strokeOpacity="0.65"
        />
      </svg>

      {/* Two cleanly fitted Polaroid frames side-by-side */}
      <div className="relative z-20 grid grid-cols-2 gap-3">
        {/* FRAME 01: Fotografia de evidência de Letícia */}
        <button
          type="button"
          data-testid="evidence-polaroid-btn"
          onClick={() => toggleInspect('portrait')}
          aria-label="Inspecionar fotografia de evidência de Letícia"
          aria-pressed={portraitFocused}
          className={`group relative flex flex-col rounded-[2px] bg-[#d8ccb7] p-1.5 pb-2 text-left shadow-[0_10px_22px_rgba(0,0,0,0.88)] transition-all duration-300 focus-visible:outline-1 focus-visible:outline-red-700 ${
            portraitFocused ? 'scale-[1.02] ring-1 ring-[#8f1d24]/70' : ''
          }`}
        >
          {/* Corner crimson pushpin seated cleanly on the top-left border */}
          <span
            aria-hidden="true"
            className="absolute top-1 left-1 z-30 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#450a0a] shadow-[0_1px_4px_rgba(0,0,0,0.9)] ring-1 ring-red-300/25"
          />

          {/* Metallic paperclip seated on top-right border */}
          <svg
            viewBox="0 0 28 52"
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 right-2.5 z-30 h-7 w-3.5 rotate-[10deg] drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]"
            fill="none"
          >
            <path
              d="M9 12V37C9 42 13 45 17 45C21 45 24 42 24 37V11C24 6 20 2.5 15 2.5C10 2.5 6 6 6 11V33C6 36.5 8.5 39 11.8 39C15 39 17.5 36.5 17.5 33V14"
              stroke="#a1a1aa"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>

          {/* Cleanly fitted portrait aperture */}
          <div className="relative h-[94px] w-full overflow-hidden bg-zinc-950 ring-1 ring-black/45">
            <img
              src={evidenceLeticiaPortrait}
              alt="Fotografia de evidência em preto e branco de Letícia"
              className={`h-full w-full object-cover object-center grayscale transition-all duration-500 ${
                portraitFocused
                  ? 'contrast-110 brightness-[0.98]'
                  : 'contrast-120 brightness-[0.86]'
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                portraitFocused ? 'opacity-20' : 'opacity-62'
              }`}
              style={{
                background:
                  'linear-gradient(128deg, rgba(5,5,7,0.82) 0%, rgba(5,5,7,0.08) 54%, rgba(5,5,7,0.62) 100%)',
              }}
            />
          </div>

          <div className="mt-1.5 flex items-baseline justify-between gap-1 px-0.5">
            <span className="font-serif text-[11px] leading-none italic text-stone-900">
              Letícia V.
            </span>
            <span className="font-mono text-[7.5px] tracking-[0.12em] text-[#7f1d1d]">
              FOTO #01
            </span>
          </div>
        </button>

        {/* FRAME 02: Fotografia de evidência do celular recuperado */}
        <button
          type="button"
          data-testid="evidence-phone-btn"
          onClick={() => toggleInspect('phone')}
          aria-label="Inspecionar fotografia do celular recuperado de Letícia"
          aria-pressed={phoneFocused}
          className={`group relative flex flex-col rounded-[2px] bg-[#d4c7b1] p-1.5 pb-2 text-left shadow-[0_10px_22px_rgba(0,0,0,0.88)] transition-all duration-300 focus-visible:outline-1 focus-visible:outline-red-700 ${
            phoneFocused ? 'scale-[1.02] ring-1 ring-[#8f1d24]/70' : ''
          }`}
        >
          {/* Corner crimson pushpin seated cleanly on the top-right border */}
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 z-30 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#450a0a] shadow-[0_1px_4px_rgba(0,0,0,0.9)] ring-1 ring-red-300/25"
          />

          {/* Cleanly fitted recovered smartphone aperture */}
          <div className="relative h-[94px] w-full overflow-hidden bg-zinc-950 ring-1 ring-black/45">
            <img
              src={evidenceRecoveredPhone}
              alt="Fotografia de evidência do celular pessoal recuperado e descarregado"
              className={`h-full w-full object-cover object-center transition-all duration-500 ${
                phoneFocused
                  ? 'contrast-110 brightness-105'
                  : 'contrast-115 brightness-[0.94]'
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                phoneFocused ? 'opacity-15' : 'opacity-40'
              }`}
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, transparent 38%, rgba(5,5,7,0.75) 100%)',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-1 bg-black/75 px-1 py-0.5 font-mono text-[7px] tracking-[0.14em] text-red-400/95"
            >
              SEM CARGA
            </span>
          </div>

          <div className="mt-1.5 flex items-baseline justify-between gap-1 px-0.5">
            <span className="font-serif text-[11px] leading-none italic text-stone-900">
              Celular retido
            </span>
            <span className="font-mono text-[7.5px] tracking-[0.12em] text-[#7f1d1d]">
              ITEM #01
            </span>
          </div>
        </button>
      </div>

      {/* Compact Boletim metadata line */}
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-stone-800/80 pt-1.5 font-mono text-[9px] tracking-[0.14em] text-stone-400 tabular-nums">
        <span>BOLETIM Nº {CANON_PROFILE.caseNumber}</span>
        <span className="text-red-400/90">
          {portraitFocused
            ? 'DESAPARECIDA · 36 ANOS'
            : phoneFocused
              ? 'APARELHO BLOQUEADO'
              : `RESTRITO · ${CANON_PROFILE.intakeDate}`}
        </span>
      </div>
    </div>
  );
}

/**
 * Compact recovered-phone evidence card rendered inside the Prologue rupture slide
 * to keep visual cohesion between Page 00 and the Prologue dossier.
 */
export function ProloguePhoneEvidenceCard() {
  return (
    <div
      style={{ animationDelay: '340ms' }}
      className="animate-prologue-line flex w-full items-center gap-3 rounded-[3px] border border-stone-800/85 bg-[#0c0b0a]/90 p-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
    >
      <div className="relative h-[66px] w-[86px] shrink-0 rounded-[2px] bg-[#d4c7b1] p-1 shadow-[0_6px_14px_rgba(0,0,0,0.85)]">
        <div className="relative h-full w-full overflow-hidden bg-zinc-950 ring-1 ring-black/45">
          <img
            src={evidenceRecoveredPhone}
            alt="Celular pessoal de Letícia retido para análise pericial"
            className="h-full w-full object-cover object-center brightness-95 contrast-115"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-1 font-mono text-[10px] leading-4 text-stone-400 tabular-nums">
        <p className="flex items-center gap-1.5 text-[9px] tracking-[0.18em] text-red-400/95">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#991b1b]"
          />
          EVIDÊNCIA #01 · CUSTÓDIA
        </p>
        <p className="text-stone-200">Celular pessoal apreendido</p>
        <p className="text-[9.5px] text-stone-500">
          Estado: sem carga · bloqueio ativo
        </p>
      </div>
    </div>
  );
}
