import { useState, type FormEvent } from 'react';
import { ArrowRight, User, Volume2, VolumeX } from 'lucide-react';
import { chapterAudio } from '../game/audio';
import { CANON_PROFILE } from '../game/canonConfig';
import { EvidenceBoard } from './EvidenceBoard';

interface TitleIntakeScreenProps {
  initialDetectiveName: string;
  muted: boolean;
  onToggleMute: () => void;
  onStartInvestigation: (detectiveName: string) => void;
}

/**
 * Mobile-first Confidential Police File Opening Screen ("Página 00 — LETÍCIA").
 * Engineered to fit 100% inside a single mobile viewport with ZERO vertical scrolling
 * and generous bottom clearance above Netlify's floating badge.
 */
export function TitleIntakeScreen({
  initialDetectiveName,
  muted,
  onToggleMute,
  onStartInvestigation,
}: TitleIntakeScreenProps) {
  const [nameInput, setNameInput] = useState(initialDetectiveName);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isExiting) return;

    const cleaned = nameInput.trim();
    if (!cleaned) {
      chapterAudio.unlock();
      chapterAudio.playDeadButtonClick();
      setValidationError('Informe seu nome para registrar o acesso.');
      return;
    }

    setValidationError(null);
    setIsExiting(true);
    chapterAudio.unlock();
    chapterAudio.playStartInvestigation();
    chapterAudio.startAmbientDrone('warm-dark');

    window.setTimeout(() => {
      onStartInvestigation(cleaned);
    }, 480);
  };

  return (
    <div
      data-testid="title-intake-screen"
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#070606] px-5 pt-[calc(env(safe-area-inset-top)+0.85rem)] pb-[calc(env(safe-area-inset-bottom)+4.85rem)] text-stone-100 transition-opacity duration-500 select-none sm:px-5 sm:pt-4 sm:pb-4 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Warm tungsten desk lamp cone from top-left */}
      <div
        aria-hidden="true"
        className="animate-lamp-flicker pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 52% at 18% 6%, rgba(196, 138, 78, 0.2) 0%, rgba(112, 72, 40, 0.08) 38%, rgba(7, 6, 6, 0) 72%), radial-gradient(circle at 86% 62%, rgba(127, 29, 29, 0.1) 0%, rgba(7, 6, 6, 0) 58%)',
        }}
      />

      {/* Organic scanned-paper noise & faint terminal scanlines */}
      <div
        aria-hidden="true"
        className="dossier-paper-noise pointer-events-none absolute inset-0 opacity-85"
      />

      {/* Left-edge subtle crimson deterioration accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#7f1d1d]/60 to-transparent"
      />

      {/* Top procedural bar */}
      <header
        className="animate-dossier-reveal relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-stone-800/80 pb-2"
        style={{ animationDelay: '50ms' }}
      >
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-stone-400 tabular-nums">
          <span className="flex items-center gap-1.5 text-red-400/95">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-[#991b1b]"
            />
            ACESSO RESTRITO
          </span>
          <span aria-hidden="true" className="text-stone-700">
            ·
          </span>
          <span>CASO Nº {CANON_PROFILE.caseNumber}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            chapterAudio.unlock();
            chapterAudio.playFileAccessClick();
            onToggleMute();
          }}
          aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-stone-800/90 bg-stone-950/80 text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100 focus-visible:outline-1 focus-visible:outline-stone-400"
        >
          {muted ? (
            <VolumeX className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 text-stone-300" aria-hidden="true" />
          )}
        </button>
      </header>

      {/* Main single-screen mobile dossier stack (no scrolling required) */}
      <section
        aria-labelledby="case-title"
        className="relative z-10 flex min-h-0 flex-1 flex-col justify-evenly py-1.5"
      >
        {/* Case classification & editorial title */}
        <div>
          <p
            className="animate-dossier-reveal font-mono text-[9.5px] tracking-[0.26em] text-stone-400 uppercase"
            style={{ animationDelay: '150ms' }}
          >
            ARQUIVO DE INVESTIGAÇÃO
          </p>

          <div
            className="animate-dossier-reveal mt-1"
            style={{ animationDelay: '320ms' }}
          >
            <h1
              id="case-title"
              className="font-serif text-[36px] leading-[0.96] font-normal tracking-[0.12em] text-[#e5dccb]"
            >
              LETÍCIA
            </h1>
            <svg
              viewBox="0 0 260 10"
              aria-hidden="true"
              className="mt-1 h-2 w-[184px]"
              preserveAspectRatio="none"
            >
              <path
                d="M2 6C56 2.5 152 2 256 5C208 7.4 112 8.2 4 7.4Z"
                fill="#8f1d24"
                opacity="0.88"
              />
            </svg>
          </div>

          <p
            className="animate-dossier-reveal mt-1.5 font-mono text-[9.5px] tracking-[0.2em] text-stone-300/90 uppercase"
            style={{ animationDelay: '400ms' }}
          >
            DESAPARECIMENTO SEM ESCLARECIMENTO
          </p>
        </div>

        {/* Dual fitted evidence frames: Letícia B&W portrait + Recovered Cell Phone */}
        <EvidenceBoard />

        {/* Concise mysterious lead (reduced copy, flowing commas, no spoiler overload) */}
        <div
          className="animate-dossier-reveal space-y-1.5 border-l border-[#7f1d1d]/55 pl-3 font-sans text-[12.5px] leading-[1.48] text-stone-300/92"
          style={{ animationDelay: '580ms' }}
        >
          <p>
            Um celular foi recuperado sem carga, sua dona segue desaparecida e
            parte do conteúdo permanece bloqueada.
          </p>
          <p className="text-stone-200">
            Algumas pessoas têm respostas, outras têm motivos para mentir.
          </p>
        </div>

        {/* Investigator identification & parchment CTA */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="animate-dossier-reveal w-full space-y-2.5"
          style={{ animationDelay: '700ms' }}
        >
          <div className="space-y-1">
            <label
              htmlFor="detective-name-input"
              className="block font-mono text-[9.5px] tracking-[0.2em] text-stone-400 uppercase"
            >
              IDENTIFICAÇÃO DO INVESTIGADOR
            </label>

            <div className="relative">
              <User
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-500"
              />
              <input
                id="detective-name-input"
                name="detectiveName"
                type="text"
                value={nameInput}
                onFocus={() => {
                  chapterAudio.unlock();
                  chapterAudio.playFileAccessClick();
                }}
                onChange={(event) => {
                  setNameInput(event.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Nome do investigador"
                autoComplete="name"
                maxLength={40}
                aria-invalid={validationError ? 'true' : 'false'}
                aria-describedby={
                  validationError ? 'detective-name-error' : undefined
                }
                className="h-[42px] w-full rounded-[3px] border border-stone-700/80 bg-[#0d0c0b]/95 pr-3 pl-9 font-mono text-[13px] text-stone-100 placeholder:text-stone-500 transition-colors focus:border-[#991b1b] focus:bg-[#12100f] focus:outline-none"
              />
            </div>

            {validationError && (
              <p
                id="detective-name-error"
                role="alert"
                className="font-mono text-[10.5px] leading-tight text-red-400"
              >
                {validationError}
              </p>
            )}
          </div>

          <button
            type="submit"
            data-start="true"
            data-testid="start-investigation-btn"
            disabled={isExiting}
            className="parchment-cta group relative flex h-[46px] w-full items-center justify-between overflow-hidden rounded-[3px] border border-[#b5a387] px-4 font-mono text-[12.5px] font-semibold tracking-[0.12em] text-[#171310] uppercase shadow-[0_12px_28px_rgba(0,0,0,0.78)] transition-all hover:brightness-105 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2b092] disabled:opacity-70"
          >
            <span className="relative z-10">INICIAR INVESTIGAÇÃO</span>
            <ArrowRight
              aria-hidden="true"
              className="relative z-10 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-3 -bottom-4 h-12 w-12 rounded-full border-2 border-dashed border-[#7f1d1d]/35"
            />
          </button>

          <p className="text-center font-serif text-[11px] leading-snug italic text-stone-400">
            Todo registro deixa uma história, nem toda história corresponde à
            verdade.
          </p>
        </form>
      </section>

      {/* Bottom archival sensitivity notice */}
      <footer
        className="animate-dossier-reveal relative z-10 shrink-0 border-t border-stone-900 pt-1.5 text-center font-mono text-[9px] tracking-[0.16em] text-stone-500 uppercase"
        style={{ animationDelay: '820ms' }}
      >
        ÁUDIO RECOMENDADO · CONTEÚDO SENSÍVEL
      </footer>
    </div>
  );
}
