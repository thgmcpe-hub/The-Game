import { useEffect, useState } from 'react';
import { FileText, X } from 'lucide-react';
import { CANON_PROFILE } from '../game/canonConfig';

interface EvidenceSlipProps {
  detectiveName?: string;
}

/**
 * Mobile-first documentary property intake sheet (Termo de Recolhimento).
 * Accessible discreetly from the device screen as a mobile bottom sheet
 * containing Letícia's biographical metadata organically (zero password hints).
 */
export function EvidenceSlip({ detectiveName }: EvidenceSlipProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Abrir ficha de recolhimento de pertences"
        className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-zinc-800/80 bg-zinc-950/90 px-3 font-mono text-[11px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200 focus-visible:outline-1 focus-visible:outline-zinc-400"
      >
        <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">Ficha</span>
      </button>

      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Termo de Recolhimento de Pertences"
          onClick={() => setExpanded(false)}
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/80"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full rounded-t-3xl border-t border-stone-700/60 bg-[#161513] px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] text-stone-200 shadow-2xl sm:pb-7"
          >
            {/* Mobile bottom-sheet grab handle */}
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-700"
            />

            <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <p className="font-mono text-[11px] tracking-wider text-stone-400 tabular-nums">
                  OCORRÊNCIA {CANON_PROFILE.caseNumber}
                </p>
                <h2 className="mt-1 font-serif text-base font-medium text-stone-100">
                  Termo de Recolhimento de Pertences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Fechar ficha de recolhimento"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4 font-mono text-xs leading-5 tabular-nums">
              <div className="col-span-2">
                <dt className="text-[10px] text-stone-500">Titular</dt>
                <dd className="text-stone-200">{CANON_PROFILE.fullName}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-stone-500">Data de nascimento</dt>
                <dd className="text-stone-200">{CANON_PROFILE.birthDate}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-stone-500">Último registro</dt>
                <dd className="text-stone-200">{CANON_PROFILE.lastSeenDate}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10px] text-stone-500">Item custodiado</dt>
                <dd className="text-stone-200">
                  {CANON_PROFILE.recoveredItemLabel}
                </dd>
              </div>
              {detectiveName && (
                <div className="col-span-2">
                  <dt className="text-[10px] text-stone-500">
                    Responsável pela perícia
                  </dt>
                  <dd className="text-stone-200">Det. {detectiveName}</dd>
                </div>
              )}
              <div className="col-span-2">
                <dt className="text-[10px] text-stone-500">Observação</dt>
                <dd className="text-stone-300/90">
                  Celular pessoal retido para análise em {CANON_PROFILE.intakeDate}{' '}
                  entre os pertences da titular. Entregue à perícia completamente
                  descarregado.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
