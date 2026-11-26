import { CANON_PROFILE, GENERATED_ASSETS } from './canonConfig';

export interface PrologueBlock {
  readonly id: string;
  readonly act: 'past' | 'rupture';
  readonly heading?: string;
  readonly lines: readonly string[];
  readonly reversedEcho?: string;
  readonly emphasizeFirst?: boolean;
  readonly includeDocumentSlip?: boolean;
}

/**
 * Canonical prologue copy for Chapter 00.
 * - Opens immediately on launch so the player understands the story from frame 1.
 * - Weaves Letícia's full birth date organically into the archival intake record.
 * - Embeds an atmospheric reversed-word cue ("oirártnoc oa" / "de trás para frente")
 *   without ever revealing the numeric passcode itself.
 */
export const PROLOGUE_BLOCKS: readonly PrologueBlock[] = [
  {
    id: 'past-1',
    act: 'past',
    heading: 'PRÓLOGO',
    emphasizeFirst: true,
    lines: [
      'Há vinte e um anos, uma garota de quinze anos foi encontrada inconsciente.',
      'Estava ferida. Havia sofrido uma pancada na cabeça.',
      'Quando acordou, não conseguiu explicar o que havia acontecido.',
    ],
  },
  {
    id: 'past-2',
    act: 'past',
    lines: [
      'As lembranças eram fragmentadas.',
      'Uma sensação de perigo. Um lugar que não conseguia reconhecer.',
      'A impressão de que alguém havia feito algo terrível — mas tudo na sua mente voltava de trás para frente.',
    ],
    reversedEcho: 'etnerf arap sárt ed',
  },
  {
    id: 'past-3',
    act: 'past',
    lines: [
      'Ela não sabia quem.',
      'Não sabia exatamente o quê.',
      'E, durante anos, não soube distinguir o que realmente lembrava daquilo que sua própria mente tentava reconstruir.',
    ],
  },
  {
    id: 'past-4',
    act: 'past',
    lines: [
      `Seu nome era ${CANON_PROFILE.firstName}.`,
      'Hoje, aos trinta e seis anos, ela construiu uma vida sobre perguntas que nunca tiveram respostas.',
      'Mas algumas coisas não permanecem enterradas para sempre.',
    ],
  },
  {
    id: 'rupture-1',
    act: 'rupture',
    emphasizeFirst: true,
    includeDocumentSlip: true,
    lines: [
      `${CANON_PROFILE.firstName} desapareceu.`,
      'O que aconteceu com ela ainda não foi esclarecido.',
    ],
  },
  {
    id: 'rupture-2',
    act: 'rupture',
    lines: [
      'Entre seus pertences, existe um dispositivo que pode guardar informações sobre os últimos acontecimentos de sua vida.',
      'Mensagens. Fotografias. Registros. Segredos.',
      'Ou absolutamente nada que explique seu desaparecimento.',
    ],
  },
  {
    id: 'rupture-3',
    act: 'rupture',
    emphasizeFirst: true,
    lines: [
      'Você está prestes a acessar esse dispositivo.',
      'O que encontrar nele dependerá do que conseguir descobrir — às vezes, até o que parece simples só faz sentido lido ao contrário.',
      'E nem tudo que foi escondido deveria, necessariamente, ser encontrado.',
    ],
    reversedEcho: 'oirártnoc oa',
  },
];

export interface MessageEntry {
  readonly id: string;
  readonly sender: 'them' | 'leticia';
  readonly text: string;
  readonly time: string;
}

export interface MessageThread {
  readonly id: string;
  readonly contactName: string;
  readonly preview: string;
  readonly timestamp: string;
  readonly unreadCount: number;
  readonly messages: readonly MessageEntry[];
}

export interface GalleryPhoto {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly dateLabel: string;
  readonly locationLabel: string;
  readonly resolution: string;
}

export interface NoteEntry {
  readonly id: string;
  readonly title: string;
  readonly updatedAt: string;
  readonly excerpt: string;
  readonly body: string;
  readonly locked?: boolean;
}

export interface CallLogEntry {
  readonly id: string;
  readonly contact: string;
  readonly kind: 'missed' | 'outgoing' | 'incoming';
  readonly timeLabel: string;
  readonly durationLabel: string;
}

export const LOCK_SCREEN_NOTIFICATIONS = [
  {
    id: 'notif-1',
    app: 'Mensagens',
    summary: '2 novas mensagens',
    time: '02:54',
  },
  {
    id: 'notif-2',
    app: 'Telefone',
    summary: '3 chamadas perdidas',
    time: '02:18',
  },
] as const;

export const PHONE_MESSAGES: readonly MessageThread[] = [
  {
    id: 'thread-unknown',
    contactName: '(11) 98412-0934',
    preview: 'Você não deveria ter voltado lá.',
    timestamp: '02:54',
    unreadCount: 1,
    messages: [
      {
        id: 'm-u1',
        sender: 'leticia',
        text: 'Eu sei que você esteve na estrada velha semana passada.',
        time: '02:39',
      },
      {
        id: 'm-u2',
        sender: 'them',
        text: 'Esquece isso, Letícia. Não tem nada lá para você.',
        time: '02:47',
      },
      {
        id: 'm-u3',
        sender: 'them',
        text: 'Você não deveria ter voltado lá.',
        time: '02:54',
      },
    ],
  },
  {
    id: 'thread-mae',
    contactName: 'Mãe',
    preview: 'Me liga assim que ouvir isso, por favor.',
    timestamp: '02:18',
    unreadCount: 1,
    messages: [
      {
        id: 'm-m1',
        sender: 'them',
        text: 'Filha, você chegou em casa? Está chovendo muito.',
        time: '23:41',
      },
      {
        id: 'm-m2',
        sender: 'them',
        text: 'Liguei três vezes e caiu na caixa postal.',
        time: '01:55',
      },
      {
        id: 'm-m3',
        sender: 'them',
        text: 'Me liga assim que ouvir isso, por favor.',
        time: '02:18',
      },
    ],
  },
  {
    id: 'thread-clara',
    contactName: 'Clara (Escritório)',
    preview: 'Os arquivos da terça ficaram abertos na sua mesa.',
    timestamp: 'Ontem',
    unreadCount: 0,
    messages: [
      {
        id: 'm-c1',
        sender: 'them',
        text: 'Letícia, você não apareceu na reunião das 16h.',
        time: '16:22',
      },
      {
        id: 'm-c2',
        sender: 'leticia',
        text: 'Precisei resolver uma coisa antiga. Amanhã compenso tudo.',
        time: '17:04',
      },
      {
        id: 'm-c3',
        sender: 'them',
        text: 'Os arquivos da terça ficaram abertos na sua mesa.',
        time: '18:10',
      },
    ],
  },
];

export const PHONE_PHOTOS: readonly GalleryPhoto[] = [
  {
    id: 'photo-road',
    src: GENERATED_ASSETS.galleryMistRoad,
    alt: 'Estrada de asfalto molhada desaparecendo na neblina sob um único poste de luz',
    dateLabel: '18 nov · 01:42',
    locationLabel: 'Estrada vicinal · Km 14',
    resolution: '4032 × 3024',
  },
  {
    id: 'photo-gate',
    src: GENERATED_ASSETS.galleryOldHouse,
    alt: 'Portão de ferro antigo entreaberto diante de um caminho de pedras coberto de neblina',
    dateLabel: '17 nov · 18:19',
    locationLabel: 'Sem localização registrada',
    resolution: '4032 × 3024',
  },
];

export const PHONE_NOTES: readonly NoteEntry[] = [
  {
    id: 'note-1',
    title: 'O que ainda volta à noite',
    updatedAt: '16 nov · 03:08',
    excerpt: 'O cheiro de terra molhada e o barulho do portão metálico...',
    body:
      'O cheiro de terra molhada e o barulho do portão metálico nunca mudam. Às vezes acho que estou inventando detalhes para preencher o vazio de quinze anos atrás. Outras vezes tenho certeza de que alguém me viu saindo daquela curva.',
  },
  {
    id: 'note-2',
    title: 'Antes de sair',
    updatedAt: '18 nov · 00:49',
    excerpt: 'Não avisar ninguém antes de confirmar o endereço...',
    body:
      'Não avisar ninguém antes de confirmar o endereço. Levar lanterna. Se o sinal cair antes da ponte, anotar a placa no bloco de papel.',
  },
  {
    id: 'note-3',
    title: 'Anexo protegido',
    updatedAt: '18 nov · 02:11',
    excerpt: 'Conteúdo bloqueado para o próximo capítulo.',
    body: '',
    locked: true,
  },
];

export const PHONE_CALLS: readonly CallLogEntry[] = [
  {
    id: 'call-1',
    contact: '(11) 98412-0934',
    kind: 'outgoing',
    timeLabel: '02:41',
    durationLabel: '00:19',
  },
  {
    id: 'call-2',
    contact: 'Mãe',
    kind: 'missed',
    timeLabel: '02:18',
    durationLabel: 'Não atendida',
  },
  {
    id: 'call-3',
    contact: 'Mãe',
    kind: 'missed',
    timeLabel: '01:53',
    durationLabel: 'Não atendida',
  },
  {
    id: 'call-4',
    contact: 'Clara (Escritório)',
    kind: 'incoming',
    timeLabel: 'Ontem · 16:15',
    durationLabel: '01:12',
  },
];
