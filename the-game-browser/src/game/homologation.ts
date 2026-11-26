export type HomologationCheckId =
  | 'no_usb_no_boot'
  | 'unauthorized_usb_rejected'
  | 'valid_usb_boots'
  | 'usb_errors_handled'
  | 'lockscreen_keypad_functional'
  | 'wrong_passcode_rejected'
  | 'right_passcode_unlocks'
  | 'reload_preserves_progress'
  | 'no_solution_leaked'
  | 'supported_runtime_flow';

export interface HomologationItem {
  readonly id: HomologationCheckId;
  readonly label: string;
}

export const HOMOLOGATION_CHECKLIST: readonly HomologationItem[] = [
  {
    id: 'no_usb_no_boot',
    label: 'Sem USB conectado, não é possível iniciar o aparelho',
  },
  {
    id: 'unauthorized_usb_rejected',
    label: 'Conectar um periférico não autorizado não desbloqueia o estado',
  },
  {
    id: 'valid_usb_boots',
    label: 'Conectar o USB correto dispara a sequência de inicialização',
  },
  {
    id: 'usb_errors_handled',
    label: 'Falhas de conexão ou permissões são tratadas corretamente',
  },
  {
    id: 'lockscreen_keypad_functional',
    label: 'A tela bloqueada exibe o teclado numérico funcional',
  },
  {
    id: 'wrong_passcode_rejected',
    label: 'Uma senha incorreta não permite acesso ao conteúdo',
  },
  {
    id: 'right_passcode_unlocks',
    label: 'A senha correta libera o aparelho',
  },
  {
    id: 'reload_preserves_progress',
    label: 'Recarregar ou reiniciar o jogo mantém o progresso previsto',
  },
  {
    id: 'no_solution_leaked',
    label: 'Nenhuma tela ou mensagem revela a solução do enigma',
  },
  {
    id: 'supported_runtime_flow',
    label: 'O fluxo completo funciona em dispositivos e sistemas oficialmente suportados',
  },
];

export type HomologationStatusMap = Record<HomologationCheckId, boolean>;

export function createEmptyHomologationStatus(): HomologationStatusMap {
  return {
    no_usb_no_boot: false,
    unauthorized_usb_rejected: false,
    valid_usb_boots: false,
    usb_errors_handled: false,
    lockscreen_keypad_functional: false,
    wrong_passcode_rejected: false,
    right_passcode_unlocks: false,
    reload_preserves_progress: false,
    no_solution_leaked: false,
    supported_runtime_flow: false,
  };
}

export function countPassedHomologation(status: HomologationStatusMap): number {
  return HOMOLOGATION_CHECKLIST.reduce(
    (acc, item) => acc + (status[item.id] ? 1 : 0),
    0
  );
}

export function formatHomologationReport(
  status: HomologationStatusMap,
  meta?: { webUsbSupported: boolean; currentPhase: string }
): string {
  const passed = countPassedHomologation(status);
  const total = HOMOLOGATION_CHECKLIST.length;
  const header = [
    `CHECKLIST DE HOMOLOGAÇÃO — CAPÍTULO 00 (${passed}/${total} aprovados)`,
    meta
      ? `WebUSB disponível: ${meta.webUsbSupported ? 'Sim' : 'Não'} | Estado atual: ${meta.currentPhase}`
      : '',
    '',
  ].filter(Boolean);

  const lines = HOMOLOGATION_CHECKLIST.map(
    (item) => `[${status[item.id] ? 'x' : ' '}] ${item.label}`
  );

  return [...header, ...lines].join('\n');
}
