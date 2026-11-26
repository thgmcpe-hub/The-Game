import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, X } from 'lucide-react';
import { chapterAudio } from '../game/audio';
import { CANON_PROFILE } from '../game/canonConfig';
import { PROLOGUE_BLOCKS } from '../game/phoneContent';
import { ProloguePhoneEvidenceCard } from './EvidenceBoard';

interface PrologueScreenProps {
  mode?: 'initial' | 'reread';
  detectiveName?: string;
  onEnterRupture?: () => void;
  onComplete: () => void;
}

/**
 * Mobile-first documentary police-dossier Prologue (6 slides).
 * Carries the exact visual language of Page 00 across every slide:
 * distressed scanned-paper surface, warm tungsten desk lamp cone, crimson
 * dossier accents, editorial Lora serif leads, and weathered parchment CTA.
 */
export function PrologueScreen({
  mode = 'initial',
  detectiveName,
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
    chapterAudio.playPrologueStep();
    if (isReread) {
      chapterAudio.stopAmbientDrone();
      onComplete();
      return;
    }
    setIsBlackout(true);
    chapterAudio.stopAmbientDrone();
    window.setTimeout(() => {
      onComplete();
    }, 600);
  }, [isReread, onComplete]);

  const goBack = useCallback(() => {
    if (isBlackout || isFirstBlock) return;
    chapterAudio.unlock();
    chapterAudio.playFileAccessClick();
    setBlockIndex((prev) => Math.max(0, prev - 1));
  }, [isBlackout, isFirstBlock]);

  const advance = useCallback(() => {
    if (isBlackout) return;
    chapterAudio.unlock();
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
    } else {
      chapterAudio.playPrologueStep();
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
    chapterAudio.unlock();
    chapterAudio.playFileAccessClick();
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
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden px-5 pt-[calc(env(safe-area-inset-top)+0.85rem)] pb-[calc(env(safe-area-inset-bottom)+5rem)] text-stone-100 transition-colors duration-700 select-none sm:px-5 sm:pt-4 sm:pb-5 ${
        isBlackout
          ? 'bg-black'
          : isRupture
            ? 'bg-[#080709]'
            : 'bg-[#070606]'
      } ${ruptureFlicker ? 'animate-rupture-flicker' : ''}`}
    >
      {/* Warm tungsten desk lamp glow (shifts to colder forensic crimson tint in rupture act) */}
      <div
        aria-hidden="true"
        className={`animate-lamp-flicker pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          isBlackout ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: isRupture
            ? 'radial-gradient(ellipse 74% 50% at 22% 8%, rgba(120, 146, 178, 0.14) 0%, rgba(127, 29, 29, 0.08) 44%, rgba(7, 6, 6, 0) 74%)'
            : 'radial-gradient(ellipse 75% 52% at 18% 6%, rgba(196, 138, 78, 0.19) 0%, rgba(112, 72, 40, 0.08) 38%, rgba(7, 6, 6, 0) 72%), radial-gradient(circle at 86% 62%, rgba(127, 29, 29, 0.09) 0%, rgba(7, 6, 6, 0) 58%)',
        }}
      />

      {/* Organic scanned-paper grain & faint terminal scanlines */}
      <div
        aria-hidden="true"
        className="dossier-paper-noise pointer-events-none absolute inset-0 opacity-85"
      />

      {/* Left-edge subtle crimson deterioration accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#7f1d1d]/60 to-transparent"
      />

      {/* Top procedural police dossier header + 6-slide progression hairlines */}
      <header
        className={`relative z-20 shrink-0 space-y-2.5 transition-opacity duration-500 ${
          isBlackout ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-stone-400 tabular-nums">
            <span className="flex items-center gap-1.5 text-red-400/95">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#991b1b]"
              />
              CASO Nº {CANON_PROFILE.caseNumber}
            </span>
            <span aria-hidden="true" className="text-stone-700">
              ·
            </span>
            <span>
              REGISTRO {String(blockIndex + 1).padStart(2, '0')}/
              {String(PROLOGUE_BLOCKS.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={
                muted ? 'Ativar áudio ambiente' : 'Silenciar áudio ambiente'
              }
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-stone-800/90 bg-stone-950/80 text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100 focus-visible:outline-1 focus-visible:outline-stone-400"
            >
              {muted ? (
                <VolumeX className="h-3.5 w-3.5 text-stone-500" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-stone-300" />
              )}
            </button>

            {isReread && (
              <button
                type="button"
                onClick={triggerBlackoutAndFinish}
                aria-label="Voltar ao aparelho"
                className="flex h-8 items-center gap-1 rounded-sm border border-stone-700/90 bg-stone-950/90 px-2.5 font-mono text-[10px] tracking-[0.12em] text-stone-200 uppercase transition-colors hover:border-stone-500 hover:text-white focus-visible:outline-1 focus-visible:outline-stone-300"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                <span>Voltar</span>
              </button>
            )}
          </div>
        </div>

        {/* 6-part dossier progress hairlines */}
        <div
          aria-label={`Parte ${blockIndex + 1} de ${PROLOGUE_BLOCKS.length}`}
          className="flex items-center gap-1.5"
        >
          {PROLOGUE_BLOCKS.map((block, idx) => (
            <span
              key={block.id}
              className={`h-[2px] transition-all duration-300 ${
                idx === blockIndex
                  ? 'w-7 bg-[#b8323a]'
                  : idx < blockIndex
                    ? 'w-3 bg-[#d6c9b4]/60'
                    : 'w-3 bg-stone-800'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Central archival reading area */}
      <div
        key={currentBlock.id}
        className={`relative z-10 flex min-h-0 flex-1 flex-col items-start justify-center overflow-y-auto text-left transition-opacity duration-500 ${
          currentBlock.includeDocumentSlip ? 'gap-3 py-2' : 'gap-4 py-3'
        } ${isBlackout ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Dossier chapter tag & crimson brushstroke */}
        <div className="animate-prologue-line w-full">
          <p className="font-mono text-[10px] tracking-[0.26em] text-stone-400 uppercase">
            {currentBlock.heading
              ? currentBlock.heading
              : isRupture
                ? 'OCORRÊNCIA · ARQUIVO ABERTO'
                : 'PRÓLOGO · DEPOIMENTO'}
          </p>
          <svg
            viewBox="0 0 220 8"
            aria-hidden="true"
            className="mt-1.5 h-1.5 w-[136px]"
            preserveAspectRatio="none"
          >
            <path
              d="M2 5C54 2 142 1.8 216 4.5C172 6.6 92 7.2 4 6.4Z"
              fill="#8f1d24"
              opacity="0.82"
            />
          </svg>
        </div>

        {/* Narrative paragraphs styled identically to Page 00 */}
        <div
          className={`flex w-full flex-col ${
            currentBlock.includeDocumentSlip ? 'gap-2.5' : 'gap-4'
          }`}
        >
          {currentBlock.lines.map((line, index) => {
            const isHeroLine = Boolean(
              currentBlock.emphasizeFirst && index === 0
            );
            return (
              <p
                key={`${currentBlock.id}-${index}`}
                style={{ animationDelay: `${index * 200}ms` }}
                className={`animate-prologue-line text-pretty ${
                  isHeroLine
                    ? 'font-serif text-[19px] leading-[1.42] font-normal tracking-[0.01em] text-[#e5dccb]'
                    : 'border-l border-[#7f1d1d]/55 pl-3.5 font-sans text-[14.5px] leading-[1.66] font-normal text-stone-300/95'
                }`}
              >
                {line}
              </p>
            );
          })}
        </div>

        {/* Slide 05: Recovered smartphone evidence mini-card */}
        {currentBlock.id === 'rupture-1' && <ProloguePhoneEvidenceCard />}

        {/* Slide 06: Distressed archival Boletim slip carrying canonical birth date */}
        {currentBlock.includeDocumentSlip && (
          <div
            style={{ animationDelay: '440ms' }}
            className="animate-prologue-line w-full rounded-[3px] border border-stone-800/90 bg-[#0d0c0b]/95 p-3 font-mono text-[10.5px] leading-5 text-stone-400 shadow-[0_12px_28px_rgba(0,0,0,0.75)] tabular-nums"
          >
            <div className="flex items-center justify-between gap-2 border-b border-stone-800/90 pb-1.5">
              <span className="tracking-[0.14em] text-stone-200">
                BOLETIM Nº {CANON_PROFILE.caseNumber}
              </span>
              <span className="rounded-[2px] border border-[#8f1d24]/70 bg-[#8f1d24]/15 px-1.5 py-0.5 text-[8.5px] tracking-[0.16em] text-red-400/95">
                RESTRITO
              </span>
            </div>
            <div className="mt-2 space-y-0.5 text-stone-300/95">
              <p>
                <span className="text-stone-500">TITULAR:</span>{' '}
                {CANON_PROFILE.fullName}
              </p>
              <p>
                <span className="text-stone-500">NASCIMENTO:</span>{' '}
                <span className="text-[#e5dccb]">{CANON_PROFILE.birthDate}</span>
              </p>
              <p>
                <span className="text-stone-500">ITEM RETIDO:</span>{' '}
                {CANON_PROFILE.recoveredItemLabel}
              </p>
              {detectiveName && (
                <p>
                  <span className="text-stone-500">INVESTIGADOR:</span> Det.{' '}
                  {detectiveName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Closing directive before transitioning into the discharged phone */}
        {currentBlock.closingDirective && (
          <p
            style={{ animationDelay: '620ms' }}
            className="animate-prologue-line w-full rounded-[3px] border border-[#7f1d1d]/55 bg-[#120b0c]/90 px-3 py-2 text-center font-mono text-[11.5px] tracking-[0.04em] text-[#e5dccb]"
          >
            {currentBlock.closingDirective}
          </p>
        )}
      </div>

      {/* Thumb-zone archival navigation controls */}
      <div
        className={`relative z-20 flex shrink-0 items-center justify-between gap-2.5 border-t border-stone-900 pt-2.5 transition-opacity duration-500 ${
          isBlackout ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex items-center">
          {!isFirstBlock ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Voltar parte anterior do prólogo"
              className="flex h-[46px] items-center gap-1 rounded-[3px] border border-stone-700/80 bg-[#0d0c0b]/95 px-3 font-mono text-[11px] tracking-[0.12em] text-stone-300 uppercase transition-colors hover:border-stone-500 hover:text-stone-100 active:scale-[0.98] focus-visible:outline-1 focus-visible:outline-stone-300"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-stone-400" />
              <span className="whitespace-nowrap">Anterior</span>
            </button>
          ) : (
            <span className="font-mono text-[10px] tracking-[0.16em] text-stone-500 tabular-nums">
              01 / {String(PROLOGUE_BLOCKS.length).padStart(2, '0')}
            </span>
          )}
        </div>

        <button
          type="button"
          data-start="true"
          onClick={advance}
          aria-label={
            isLastBlock
              ? isReread
                ? 'Voltar ao celular'
                : 'Acessar celular'
              : 'Continuar prólogo'
          }
          className="parchment-cta group flex h-[46px] items-center gap-2 rounded-[3px] border border-[#b5a387] px-4 font-mono text-[12px] font-semibold tracking-[0.12em] text-[#171310] uppercase shadow-[0_10px_24px_rgba(0,0,0,0.72)] transition-all hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2b092]"
        >
          <span className="whitespace-nowrap">
            {isLastBlock
              ? isReread
                ? 'Voltar ao celular'
                : 'Acessar celular'
              : 'Avançar'}
          </span>
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
