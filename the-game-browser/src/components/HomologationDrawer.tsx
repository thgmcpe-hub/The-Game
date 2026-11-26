import { useState } from 'react';
import { Check, Copy, RotateCcw, Usb, X } from 'lucide-react';
import {
  AUTHORIZED_USB_DESCRIPTORS,
  CANON_PASSCODE_FORMAT,
  CANON_PROFILE,
} from '../game/canonConfig';
import {
  countPassedHomologation,
  formatHomologationReport,
  HOMOLOGATION_CHECKLIST,
  type HomologationCheckId,
  type HomologationStatusMap,
} from '../game/homologation';
import type { ChapterState } from '../game/stateMachine';
import { isWebUsbSupported } from '../game/usbHardware';

interface HomologationDrawerProps {
  open: boolean;
  state: ChapterState;
  checklist: HomologationStatusMap;
  onClose: () => void;
  onToggleCheck: (id: HomologationCheckId) => void;
  onSimulateUnauthorizedUsb: () => void;
  onSimulateAuthorizedUsb: () => void;
  onSimulatePermissionDenied: () => void;
  onSimulateDisconnect: () => void;
  onResetChapter: () => void;
  onReplayPrologue: () => void;
}

/**
 * Developer / QA Homologation Panel (Section 06).
 * Strictly invisible during normal play — mounted only with `?qa=1` or Ctrl+Shift+H.
 */
export function HomologationDrawer({
  open,
  state,
  checklist,
  onClose,
  onToggleCheck,
  onSimulateUnauthorizedUsb,
  onSimulateAuthorizedUsb,
  onSimulatePermissionDenied,
  onSimulateDisconnect,
  onResetChapter,
  onReplayPrologue,
}: HomologationDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const passedCount = countPassedHomologation(checklist);
  const totalCount = HOMOLOGATION_CHECKLIST.length;
  const webUsbAvailable = isWebUsbSupported();

  const handleCopyReport = async () => {
    const report = formatHomologationReport(checklist, {
      webUsbSupported: webUsbAvailable,
      currentPhase: state.phase,
    });
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside
      data-testid="homologation-drawer"
      aria-label="Checklist de homologação"
      className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-[#0d0f12] text-zinc-100 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Checklist de homologação
          </h2>
          <p className="mt-0.5 font-mono text-xs text-zinc-400 tabular-nums">
            {passedCount}/{totalCount} aprovados · Fase: {state.phase}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel de homologação"
          className="flex h-9 w-9 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* Runtime Hardware Status */}
        <section className="space-y-2 border-b border-zinc-800/80 pb-5 font-mono text-xs text-zinc-400">
          <div className="flex items-center justify-between">
            <span>WebUSB no navegador</span>
            <span className="text-zinc-200">
              {webUsbAvailable ? 'Suportado' : 'Indisponível'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>USB físico conectado</span>
            <span className="text-zinc-200">
              {state.usbConnected ? state.usbDeviceFingerprint : 'Nenhum'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Último erro USB</span>
            <span className="text-zinc-200">{state.lastUsbError ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Formato canônico</span>
            <span className="text-zinc-200">
              {CANON_PASSCODE_FORMAT} ({CANON_PROFILE.birthDate})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Hardware autorizado</span>
            <span className="text-zinc-200 tabular-nums">
              {AUTHORIZED_USB_DESCRIPTORS.length} descritores
            </span>
          </div>
        </section>

        {/* QA Hardware Event Harness (never visible to players) */}
        <section className="space-y-2.5 border-b border-zinc-800/80 pb-5">
          <p className="text-xs font-medium text-zinc-300">
            Banco de testes de hardware USB (somente modo QA)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSimulateUnauthorizedUsb}
              className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              <Usb className="h-3.5 w-3.5 text-zinc-400" />
              <span className="whitespace-nowrap">USB não autorizado</span>
            </button>
            <button
              type="button"
              onClick={onSimulateAuthorizedUsb}
              className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-700"
            >
              <Usb className="h-3.5 w-3.5 text-zinc-200" />
              <span className="whitespace-nowrap">USB autorizado</span>
            </button>
            <button
              type="button"
              onClick={onSimulatePermissionDenied}
              className="rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Permissão negada
            </button>
            <button
              type="button"
              onClick={onSimulateDisconnect}
              className="rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Desconectar USB
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onReplayPrologue}
              className="flex-1 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900"
            >
              Rever prólogo
            </button>
            <button
              type="button"
              onClick={onResetChapter}
              className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reiniciar capítulo</span>
            </button>
          </div>
        </section>

        {/* 10 Mandatory Homologation Checks */}
        <section className="space-y-2">
          {HOMOLOGATION_CHECKLIST.map((item) => {
            const passed = checklist[item.id];
            return (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3.5 py-2.5 text-xs leading-5 text-zinc-200 hover:border-zinc-700"
              >
                <input
                  type="checkbox"
                  checked={passed}
                  onChange={() => onToggleCheck(item.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-200"
                />
                <span className={passed ? 'text-zinc-100' : 'text-zinc-400'}>
                  {item.label}
                </span>
              </label>
            );
          })}
        </section>
      </div>

      {/* Footer Copy Action */}
      <div className="border-t border-zinc-800 p-4">
        <button
          type="button"
          onClick={handleCopyReport}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Resultados copiados</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copiar resultados dos testes</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
