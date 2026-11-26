import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, X } from 'lucide-react';
import { chapterAudio } from '../game/audio';
import { CANON_PROFILE } from '../game/canonConfig';
import { PROLOGUE_BLOCKS } from '../game/phoneContent';

interface PrologueScreenProps {
  mode?: 'initial' | 'reread';
  onEnterRupture?: () => void;
  onComplete: () => void;
}

/**
 * Mobile-first cinematic prologue (Tela 01 — O passado & Tela 02 — A ruptura).
 * Supports both initial opening play and constant "reread" mode so the player
 * can revisit every clue at any time without losing device progress.
 */
export function PrologueScreen({
  mode = 'initial',
  onEnterRupture,
  onComplete,
}: PrologueScreenProps) {
  const [blockIndex, setBlockIndex] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);
  const [ruptureFlicker, setRuptureFlicker] = useState(false);
  const [muted, setMuted] = useState(chapterAudio.isMuted());
  const ruptureFiredRef = useRef(false);
  const completedRef = useRef(false);

  const currentBlock = PROLOGUE_BLOCKS[blockIndex];
  const isRupture = currentBlock.act === 'rupture';
  const isFirstBlock = blockIndex === 0;
  const isLastBlock = blockIndex >= PROLOGUE_BLOCKS.length - 1;
  const isReread = mode === 'reread';

  const triggerBlackoutAndFinish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (isReread) {
      chapterAudio.stopAmbientDrone();
      onComplete();
      return;
    }
    setIsBlackout(true);
    chapterAudio.stopAmbientDrone();
    window.setTimeout(() => {
      onComplete();
    }, 650);
  }, [isReread, onComplete]);

  const goBack = useCallback(() => {
    if (isBlackout || isFirstBlock) return;
    setBlockIndex((prev) => Math.max(0, prev - 1));
  }, [isBlackout, isFirstBlock]);

  const advance = useCallback(() => {
    if (isBlackout) return;
    chapterAudio.startAmbientDrone(isRupture ? 'cold-rupture' : 'warm-dark');

    if (isLastBlock) {
      triggerBlackoutAndFinish();
      return;
    }

    const nextIndex = blockIndex + 1;
    const nextBlock = PROLOGUE_BLOCKS[nextIndex];
    if (nextBlock.act === 'rupture' && !ruptureFiredRef.current) {
      ruptureFiredRef.current = true;
      setRuptureFlicker(true);
      chapterAudio.playRuptureGlitch();
      chapterAudio.startAmbientDrone('cold-rupture');
      onEnterRupture?.();
      window.setTimeout(() => setRuptureFlicker(false), 650);
    }

    setBlockIndex(nextIndex);
  }, [
    blockIndex,
    isBlackout,
    isLastBlock,
    isRupture,
    onEnterRupture,
    triggerBlackoutAndFinish,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (
        event.key === ' ' ||
        event.key === 'Enter' ||
        event.key === 'ArrowRight'
      ) {
        event.preventDefault();
        advance();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
      } else if (event.key === 'Escape' && isReread) {
        event.preventDefault();
        triggerBlackoutAndFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, goBack, isReread, triggerBlackoutAndFinish]);

  const handleToggleMute = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = !muted;
    setMuted(next);
    chapterAudio.setMuted(next);
    if (!next) {
      chapterAudio.startAmbientDrone(isRupture ? 'cold-rupture' : 'warm-dark');
    }
  };

  return (
    <div
      data-testid="prologue-stage"
      data-act={currentBlock.act}
      data-mode={mode}
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden px-6 pt-7 pb-7 transition-colors duration-700 select-none ${
        isBlackout
          ? 'bg-black'
          : isRupture
            ? 'bg-[#06090e]'
            : 'bg-[#050506]'
      } ${ruptureFlicker ? 'animate-rupture-flicker' : ''}`}
    >
      {/* Subtle atmospheric cold vignette during Tela 02 */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          isRupture && !isBlackout ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at 50% 38%, rgba(125, 152, 181, 0.11) 0%, rgba(5, 7, 11, 0) 70%)',
        }}
      />

      <div
        aria-hidden="true"
        className="film-grain pointer-events-none absolute inset-0 opacity-40"
      />

      {/* Top bar: chapter progression hairlines + audio mute / return button in reread mode */}
      <div
        className={`relative z-20 flex items-center justify-between gap-3 transition-opacity duration-500 ${
          isBlackout ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div
          aria-label={`Parte ${blockIndex + 1} de ${PROLOGUE_BLOCKS.length}`}
          className="flex items-center gap-1.5"
        >
          {PROLOGUE_BLOCKS.map((block, idx) => (
            <span
              key={block.id}
              className={`h-[2px] transition-all duration-300 ${
                idx === blockIndex
                  ? 'w-6 bg-zinc-200'
                  : idx < blockIndex
                    ? 'w-2.5 bg-zinc-500'
                    : 'w-2.5 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={
              muted ? 'Ativar áudio ambiente' : 'Silenciar áudio ambiente'
            }
            className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:text-zinc-100 focus-visible:outline-1 focus-visible:outline-zinc-400"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          {isReread && (
            <button
              type="button"
              onClick={triggerBlackoutAndFinish}
              aria-label="Voltar ao aparelho"
              className="flex h-11 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white focus-visible:outline-1 focus-visible:outline-zinc-300"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">Voltar</span>
            </button>
          )}
        </div>
      </div>

      {/* Central narrative reading area */}
      <div
        key={currentBlock.id}
        className={`relative z-10 my-auto flex flex-col items-start gap-5 py-4 text-left transition-opacity duration-500 ${
          isBlackout ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentBlock.heading && (
          <p className="animate-prologue-line font-mono text-[11px] tracking-[0.28em] text-zinc-400">
            {currentBlock.heading}
          </p>
        )}

        {currentBlock.lines.map((line, index) => {
          const isHeroLine = Boolean(currentBlock.emphasizeFirst && index === 0);
          return (
            <p
              key={`${currentBlock.id}-${index}`}
              style={{ animationDelay: `${index * 260}ms` }}
              className={`animate-prologue-line font-serif text-balance tracking-[0.01em] ${
                isHeroLine
                  ? 'text-[22px] leading-8 font-medium text-zinc-50'
                  : 'text-[16px] leading-7 font-normal text-zinc-300/95'
              }`}
            >
              {line}
            </p>
          );
        })}

        {/* Eerie reversed-word echo woven into the psychological narrative */}
        {currentBlock.reversedEcho && (
          <p
            style={{ animationDelay: '720ms' }}
            className="animate-prologue-line pt-1 font-mono text-xs tracking-[0.18em] text-zinc-400/85"
          >
            {currentBlock.reversedEcho}
          </p>
        )}

        {/* Documentary archival record (organic inclusion of birth date) */}
        {currentBlock.includeDocumentSlip && (
          <div
            style={{ animationDelay: '620ms' }}
            className="animate-prologue-line mt-2 w-full border-t border-zinc-800/90 pt-4 font-mono text-xs leading-6 text-zinc-400 tabular-nums"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span>Registro {CANON_PROFILE.caseNumber}</span>
              <span>{CANON_PROFILE.intakeDate}</span>
            </div>
            <div className="mt-2 space-y-0.5 text-zinc-300/90">
              <p>Titular: {CANON_PROFILE.fullName}</p>
              <p>Nascimento: {CANON_PROFILE.birthDate}</p>
            </div>
            <p className="mt-1 text-zinc-400/85">
              Pertences: {CANON_PROFILE.recoveredItemLabel}
            </p>
          </div>
        )}
      </div>

      {/* Thumb-zone navigation controls: Anterior | Page | Avançar / Voltar ao aparelho */}
      <div
        className={`relative z-20 flex items-center justify-between gap-2 pt-2 transition-opacity duration-500 ${
          isBlackout ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-2">
          {!isFirstBlock ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Voltar parte anterior do prólogo"
              className="flex min-h-[48px] items-center gap-1 rounded-lg border border-zinc-800/80 bg-zinc-950/80 px-3.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100 active:scale-[0.98] focus-visible:outline-1 focus-visible:outline-zinc-300"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-400" />
              <span className="whitespace-nowrap">Anterior</span>
            </button>
          ) : (
            <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
              {String(blockIndex + 1).padStart(2, '0')} /{' '}
              {String(PROLOGUE_BLOCKS.length).padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isFirstBlock && (
            <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
              {String(blockIndex + 1).padStart(2, '0')} /{' '}
              {String(PROLOGUE_BLOCKS.length).padStart(2, '0')}
            </span>
          )}

          <button
            type="button"
            data-start="true"
            onClick={advance}
            aria-label={
              isLastBlock
                ? isReread
                  ? 'Voltar ao aparelho'
                  : 'Acessar dispositivo'
                : 'Continuar prólogo'
            }
            className="flex min-h-[48px] items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-4 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800 active:scale-[0.98] focus-visible:outline-1 focus-visible:outline-zinc-300"
          >
            <span className="whitespace-nowrap">
              {isLastBlock
                ? isReread
                  ? 'Voltar ao aparelho'
                  : 'Continuar'
                : 'Avançar'}
            </span>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
