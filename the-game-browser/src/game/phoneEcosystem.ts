import { GENERATED_ASSETS } from './canonConfig';

export const LETICIA_PORTRAIT_TOKEN = '__LETICIA_PORTRAIT__';

/**
 * Persistent relational entity model for Letícia Vasconcelos's unlocked smartphone.
 * - Every person, phone number, address, financial transaction, email, chat, photo,
 *   ride, and document shares stable entity IDs across all apps.
 * - Zero automatic "clue highlighting": connections are discovered strictly by
 *   cross-referencing everyday data, receipts, timestamps, and inconsistencies.
 * - 100% fictitious Brazilian names, numbers, brands, and financial entries.
 */

export interface PersonEntity {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly phone: string;
  readonly email?: string;
  readonly handle?: string;
  readonly relation: string;
  readonly initials: string;
  readonly avatarTint: string;
  readonly notes?: string;
  readonly blocked?: boolean;
}

export interface EcosystemMessage {
  readonly id: string;
  readonly sender: 'leticia' | 'them' | 'system';
  readonly senderName?: string;
  readonly text: string;
  readonly time: string;
  readonly dateLabel?: string;
  readonly status?: 'sent' | 'delivered' | 'read';
  readonly attachmentLabel?: string;
  readonly deletedPlaceholder?: boolean;
}

export interface EcosystemChatThread {
  readonly id: string;
  readonly app: 'sms' | 'pulso';
  readonly personId?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly isGroup?: boolean;
  readonly archived?: boolean;
  readonly unreadCount: number;
  readonly lastTime: string;
  readonly preview: string;
  readonly messages: readonly EcosystemMessage[];
}

export interface CallRecord {
  readonly id: string;
  readonly personId?: string;
  readonly displayName: string;
  readonly phone: string;
  readonly kind: 'missed' | 'incoming' | 'outgoing';
  readonly timeLabel: string;
  readonly dateLabel: string;
  readonly durationLabel: string;
}

export interface VoicemailRecord {
  readonly id: string;
  readonly personId?: string;
  readonly displayName: string;
  readonly phone: string;
  readonly timeLabel: string;
  readonly durationSec: number;
  readonly transcriptPreview: string;
  readonly audioToneHz: number;
  readonly unread: boolean;
}

export interface EmailRecord {
  readonly id: string;
  readonly folder: 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
  readonly personId?: string;
  readonly fromName: string;
  readonly fromAddress: string;
  readonly toAddress: string;
  readonly subject: string;
  readonly preview: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly unread: boolean;
  readonly body: readonly string[];
  readonly attachment?: {
    readonly fileId?: string;
    readonly name: string;
    readonly sizeLabel: string;
  };
}

export interface PhotoRecord {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly album: 'Recentes' | 'Favoritas' | 'Capturas' | 'Ocultas' | 'Apagadas';
  readonly favorite?: boolean;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly locationLabel?: string;
  readonly cameraLabel?: string;
  readonly resolution: string;
  readonly caption?: string;
  readonly grayscale?: boolean;
}

export interface NoteRecord {
  readonly id: string;
  readonly folder: 'Pessoais' | 'Trabalho' | 'Listas';
  readonly title: string;
  readonly updatedAt: string;
  readonly excerpt: string;
  readonly body: readonly string[];
  readonly locked?: boolean;
  readonly lockHint?: string;
}

export interface BankTransaction {
  readonly id: string;
  readonly personId?: string;
  readonly counterparty: string;
  readonly category: 'Pix' | 'Cartão' | 'Transferência' | 'Serviços' | 'Estorno';
  readonly direction: 'in' | 'out';
  readonly amount: number;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly description: string;
  readonly receiptCode: string;
  readonly bankLabel: string;
  readonly documentMask: string;
}

export interface CardInstallment {
  readonly id: string;
  readonly merchant: string;
  readonly dateLabel: string;
  readonly installmentLabel: string;
  readonly amount: number;
  readonly category: string;
}

export interface MarketplaceOrder {
  readonly id: string;
  readonly kind: 'sale' | 'purchase';
  readonly itemTitle: string;
  readonly price: number;
  readonly status: 'Concluído' | 'Em transporte' | 'Retirada combinada' | 'Cancelado';
  readonly counterpartyId?: string;
  readonly counterpartyName: string;
  readonly counterpartyHandle: string;
  readonly dateLabel: string;
  readonly pickupOrAddress: string;
  readonly trackingCode?: string;
  readonly chatMessages: readonly {
    readonly id: string;
    readonly from: 'leticia' | 'other';
    readonly text: string;
    readonly time: string;
  }[];
}

export interface MapPlaceRecord {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly category: 'Favorito' | 'Recente' | 'Sem sinal';
  readonly lastVisit: string;
  readonly x: number;
  readonly y: number;
  readonly note?: string;
}

export interface RideTripRecord {
  readonly id: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly origin: string;
  readonly destination: string;
  readonly driverName: string;
  readonly carLabel: string;
  readonly fare: number;
  readonly status: 'Finalizada' | 'Interrompida antes do destino' | 'Cancelada';
  readonly note?: string;
}

export interface DatingMatchRecord {
  readonly id: string;
  readonly personId?: string;
  readonly name: string;
  readonly age: number;
  readonly distanceLabel: string;
  readonly bio: string;
  readonly status: 'active' | 'ended' | 'blocked';
  readonly lastActive: string;
  readonly messages: readonly {
    readonly id: string;
    readonly from: 'leticia' | 'match';
    readonly text: string;
    readonly time: string;
  }[];
}

export interface SocialPostRecord {
  readonly id: string;
  readonly authorId?: string;
  readonly authorHandle: string;
  readonly authorName: string;
  readonly location?: string;
  readonly dateLabel: string;
  readonly imageSrc?: string;
  readonly imageAlt?: string;
  readonly caption: string;
  readonly likes: number;
  readonly comments: readonly {
    readonly id: string;
    readonly handle: string;
    readonly text: string;
    readonly time: string;
  }[];
}

export interface SocialDmRecord {
  readonly id: string;
  readonly personId?: string;
  readonly handle: string;
  readonly displayName: string;
  readonly lastTime: string;
  readonly unread: boolean;
  readonly messages: readonly {
    readonly id: string;
    readonly from: 'leticia' | 'them';
    readonly text: string;
    readonly time: string;
  }[];
}

export interface PhoneFileRecord {
  readonly id: string;
  readonly folder: 'Documentos' | 'Comprovantes' | 'Downloads' | 'Trabalho';
  readonly name: string;
  readonly extension: 'PDF' | 'TXT' | 'JPG';
  readonly sizeLabel: string;
  readonly modifiedAt: string;
  readonly locked?: boolean;
  readonly lines: readonly string[];
}

export interface CalendarEventRecord {
  readonly id: string;
  readonly day: number;
  readonly monthLabel: string;
  readonly timeLabel: string;
  readonly title: string;
  readonly location?: string;
  readonly category: 'Trabalho' | 'Pessoal' | 'Lembrete';
  readonly notes?: string;
}

export interface VoiceMemoRecord {
  readonly id: string;
  readonly title: string;
  readonly dateLabel: string;
  readonly durationSec: number;
  readonly locationLabel?: string;
  readonly summaryNote: string;
  readonly toneHz: number;
}

export interface BrowserHistoryRecord {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly timeLabel: string;
  readonly snippet: string;
  readonly bookmarked?: boolean;
}

export interface OsNotificationItem {
  readonly id: string;
  readonly appId: 'messages' | 'pulso' | 'phone' | 'email' | 'bank';
  readonly appName: string;
  readonly title: string;
  readonly body: string;
  readonly timeLabel: string;
  readonly targetId?: string;
}

// ============================================================================
// PERSISTENT ENTITIES (26 contacts across family, work, daily life & suspects)
// ============================================================================

export const PHONE_CONTACTS: readonly PersonEntity[] = [
  {
    id: 'person-helena',
    name: 'Helena Vasconcelos (Mãe)',
    shortName: 'Mãe',
    phone: '(11) 99104-3318',
    email: 'helena.vasc@correio.br',
    relation: 'Família',
    initials: 'HV',
    avatarTint: 'bg-amber-900/70 text-amber-200',
    notes: 'Mora em Pinheiros. Sempre liga quando chove forte.',
  },
  {
    id: 'person-clara',
    name: 'Clara Nogueira',
    shortName: 'Clara (Escritório)',
    phone: '(11) 98741-2209',
    email: 'clara.nogueira@ateliermendes.br',
    handle: '@claranogueira',
    relation: 'Colega de trabalho',
    initials: 'CN',
    avatarTint: 'bg-sky-900/70 text-sky-200',
    notes: 'Coordena projetos de restauração arquitetônica.',
  },
  {
    id: 'person-unknown-0934',
    name: '(11) 98412-0934',
    shortName: '(11) 98412-0934',
    phone: '(11) 98412-0934',
    relation: 'Número não salvo',
    initials: '?',
    avatarTint: 'bg-zinc-800 text-zinc-300',
  },
  {
    id: 'person-henrique',
    name: 'Henrique Duarte',
    shortName: 'Henrique Duarte',
    phone: '(11) 97218-6640',
    email: 'henrique@hdservicos.br',
    handle: '@hduarte84',
    relation: 'Comprador MercadoLocal',
    initials: 'HD',
    avatarTint: 'bg-emerald-900/70 text-emerald-200',
    notes: 'Retirada na Rua das Acácias, 412.',
  },
  {
    id: 'person-bruno',
    name: 'Bruno Salles',
    shortName: 'Bruno',
    phone: '(11) 99652-4180',
    email: 'bruno.salles@ponto.br',
    handle: '@brunosalles',
    relation: 'Ex-companheiro',
    initials: 'BS',
    avatarTint: 'bg-slate-800 text-slate-200',
    notes: 'Ainda tem uma caixa de livros no depósito.',
  },
  {
    id: 'person-camila',
    name: 'Camila Ferraz',
    shortName: 'Camila',
    phone: '(11) 98330-5912',
    handle: '@camilaferraz',
    relation: 'Amiga da faculdade',
    initials: 'CF',
    avatarTint: 'bg-rose-900/70 text-rose-200',
  },
  {
    id: 'person-matheus',
    name: 'Matheus Ribeiro',
    shortName: 'Matheus R.',
    phone: '(11) 96441-1087',
    handle: '@matheus.rib',
    relation: 'Faísca (bloqueado)',
    initials: 'MR',
    avatarTint: 'bg-red-950 text-red-200',
    blocked: true,
    notes: 'Bloqueado em 17/11 após mencionar 2005.',
  },
  {
    id: 'person-marcos',
    name: 'Marcos Silveira Oliveira',
    shortName: 'M. S. Oliveira',
    phone: '(11) 97709-8831',
    relation: 'Chaveiro / Reparos',
    initials: 'MO',
    avatarTint: 'bg-stone-800 text-stone-200',
  },
  {
    id: 'person-dr-alberto',
    name: 'Dr. Alberto Queiroz',
    shortName: 'Dr. Alberto',
    phone: '(11) 3088-4410',
    email: 'consultorio@queirozpsi.br',
    relation: 'Psicólogo',
    initials: 'AQ',
    avatarTint: 'bg-indigo-900/70 text-indigo-200',
  },
  {
    id: 'person-dona-teresa',
    name: 'Dona Teresa (Síndica)',
    shortName: 'Dona Teresa',
    phone: '(11) 99211-0402',
    relation: 'Condomínio Vila Verde',
    initials: 'DT',
    avatarTint: 'bg-teal-900/70 text-teal-200',
  },
  {
    id: 'person-rafael-ti',
    name: 'Rafael Costa',
    shortName: 'Rafael (TI)',
    phone: '(11) 98114-7752',
    email: 'rafael.costa@ateliermendes.br',
    relation: 'Escritório',
    initials: 'RC',
    avatarTint: 'bg-cyan-900/70 text-cyan-200',
  },
  {
    id: 'person-paula',
    name: 'Paula Mendonça',
    shortName: 'Paula',
    phone: '(11) 99540-2193',
    handle: '@paulamend',
    relation: 'Vizinha apto 42',
    initials: 'PM',
    avatarTint: 'bg-purple-900/70 text-purple-200',
  },
  {
    id: 'person-sergio',
    name: 'Sérgio (Portaria)',
    shortName: 'Portaria',
    phone: '(11) 3812-0094',
    relation: 'Condomínio Vila Verde',
    initials: 'SP',
    avatarTint: 'bg-zinc-800 text-zinc-200',
  },
  {
    id: 'person-daniela',
    name: 'Daniela Prado',
    shortName: 'Daniela',
    phone: '(11) 98602-1190',
    email: 'daniela@pradocontabil.br',
    relation: 'Contadora',
    initials: 'DP',
    avatarTint: 'bg-emerald-950 text-emerald-200',
  },
  {
    id: 'person-lucas',
    name: 'Lucas Viana',
    shortName: 'Lucas V.',
    phone: '(11) 97120-5504',
    handle: '@lucasviana',
    relation: 'Fornecedor gráfico',
    initials: 'LV',
    avatarTint: 'bg-orange-950 text-orange-200',
  },
  {
    id: 'person-beatriz',
    name: 'Beatriz Lins',
    shortName: 'Beatriz',
    phone: '(11) 99318-6240',
    relation: 'Pilates / Estúdio',
    initials: 'BL',
    avatarTint: 'bg-pink-950 text-pink-200',
  },
  {
    id: 'person-eduardo',
    name: 'Eduardo Teles',
    shortName: 'Eduardo T.',
    phone: '(11) 98290-3044',
    email: 'eduardo@ateliermendes.br',
    relation: 'Sócio do escritório',
    initials: 'ET',
    avatarTint: 'bg-slate-800 text-slate-200',
  },
  {
    id: 'person-renata',
    name: 'Renata Vasconcelos',
    shortName: 'Renata (Prima)',
    phone: '(11) 99801-7315',
    relation: 'Família',
    initials: 'RV',
    avatarTint: 'bg-amber-950 text-amber-200',
  },
  {
    id: 'person-thiago',
    name: 'Thiago Moreira',
    shortName: 'Thiago',
    phone: '(11) 97433-9021',
    relation: 'Mecânico / Oficina',
    initials: 'TM',
    avatarTint: 'bg-neutral-800 text-neutral-200',
  },
  {
    id: 'person-vanessa',
    name: 'Vanessa Correia',
    shortName: 'Vanessa',
    phone: '(11) 98977-4122',
    handle: '@vanessac',
    relation: 'Ex-colega faculdade',
    initials: 'VC',
    avatarTint: 'bg-violet-950 text-violet-200',
  },
  {
    id: 'person-roberto',
    name: 'Roberto Braga',
    shortName: 'Roberto B.',
    phone: '(11) 96105-8840',
    relation: 'Proprietário imóvel',
    initials: 'RB',
    avatarTint: 'bg-stone-800 text-stone-200',
  },
  {
    id: 'person-juliana',
    name: 'Juliana Sato',
    shortName: 'Juliana',
    phone: '(11) 98449-2311',
    relation: 'Dentista',
    initials: 'JS',
    avatarTint: 'bg-teal-950 text-teal-200',
  },
  {
    id: 'person-gustavo',
    name: 'Gustavo Pires',
    shortName: 'Gustavo',
    phone: '(11) 97881-6039',
    relation: 'Faísca',
    initials: 'GP',
    avatarTint: 'bg-blue-950 text-blue-200',
  },
  {
    id: 'person-andre',
    name: 'André Neri',
    shortName: 'André',
    phone: '(11) 99014-5276',
    relation: 'Fotógrafo parceiro',
    initials: 'AN',
    avatarTint: 'bg-zinc-800 text-zinc-200',
  },
  {
    id: 'person-mariana',
    name: 'Mariana Faria',
    shortName: 'Mariana',
    phone: '(11) 98512-0943',
    relation: 'Clube do Livro',
    initials: 'MF',
    avatarTint: 'bg-rose-950 text-rose-200',
  },
  {
    id: 'person-wagner',
    name: 'Wagner Rocha',
    shortName: 'Wagner',
    phone: '(11) 97604-3198',
    relation: 'Antiquário Luz',
    initials: 'WR',
    avatarTint: 'bg-amber-950 text-amber-200',
  },
];

// ============================================================================
// CHATS: SMS (Mensagens) + FICTITIOUS MESSENGER (PulsoChat)
// ============================================================================

export const ECOSYSTEM_CHATS: readonly EcosystemChatThread[] = [
  // --- SMS / MENSAGENS ---
  {
    id: 'sms-unknown',
    app: 'sms',
    personId: 'person-unknown-0934',
    title: '(11) 98412-0934',
    unreadCount: 1,
    lastTime: '02:54',
    preview: 'Você não deveria ter voltado lá.',
    messages: [
      {
        id: 'sm-u1',
        sender: 'leticia',
        text: 'Eu sei que você esteve na estrada velha semana passada.',
        time: '02:39',
        dateLabel: '19 nov',
        status: 'read',
      },
      {
        id: 'sm-u2',
        sender: 'them',
        text: 'Esquece isso, Letícia. Não tem nada lá para você.',
        time: '02:47',
      },
      {
        id: 'sm-u3',
        sender: 'them',
        text: 'Você não deveria ter voltado lá.',
        time: '02:54',
      },
    ],
  },
  {
    id: 'sms-mae',
    app: 'sms',
    personId: 'person-helena',
    title: 'Mãe',
    unreadCount: 1,
    lastTime: '02:18',
    preview: 'Me liga assim que ouvir isso, por favor.',
    messages: [
      {
        id: 'sm-m1',
        sender: 'them',
        text: 'Filha, você chegou em casa? Está chovendo muito.',
        time: '23:41',
        dateLabel: '18 nov',
      },
      {
        id: 'sm-m2',
        sender: 'them',
        text: 'Liguei três vezes e caiu na caixa postal.',
        time: '01:55',
        dateLabel: '19 nov',
      },
      {
        id: 'sm-m3',
        sender: 'them',
        text: 'Me liga assim que ouvir isso, por favor.',
        time: '02:18',
      },
    ],
  },
  {
    id: 'sms-clara',
    app: 'sms',
    personId: 'person-clara',
    title: 'Clara (Escritório)',
    unreadCount: 0,
    lastTime: 'Ontem',
    preview: 'Os arquivos da terça ficaram abertos na sua mesa.',
    messages: [
      {
        id: 'sm-c1',
        sender: 'them',
        text: 'Letícia, você não apareceu na reunião das 16h.',
        time: '16:22',
        dateLabel: '18 nov',
      },
      {
        id: 'sm-c2',
        sender: 'leticia',
        text: 'Precisei resolver uma coisa antiga. Amanhã compenso tudo.',
        time: '17:04',
        status: 'read',
      },
      {
        id: 'sm-c3',
        sender: 'them',
        text: 'Os arquivos da terça ficaram abertos na sua mesa.',
        time: '18:10',
      },
    ],
  },
  {
    id: 'sms-aurea',
    app: 'sms',
    title: 'Banco Áurea',
    unreadCount: 0,
    lastTime: '18 nov',
    preview: 'Pix enviado de R$ 1.200,00 para M. S. Oliveira confirmado.',
    messages: [
      {
        id: 'sm-b1',
        sender: 'them',
        text: 'Banco Áurea: Pix recebido de R$ 480,00 (H. D. Serviços Ltda) em 15/11 às 14:22.',
        time: '14:22',
        dateLabel: '15 nov',
      },
      {
        id: 'sm-b2',
        sender: 'them',
        text: 'Banco Áurea: Pix enviado de R$ 1.200,00 para M. S. Oliveira em 18/11 às 21:07. Código AUR-88412.',
        time: '21:07',
        dateLabel: '18 nov',
      },
    ],
  },

  // --- PULSOCHAT (FICTITIOUS MESSENGER) ---
  {
    id: 'pulso-mae',
    app: 'pulso',
    personId: 'person-helena',
    title: 'Mãe',
    subtitle: 'visto por último hoje às 02:20',
    unreadCount: 2,
    lastTime: '01:58',
    preview: 'A Paula falou que a luz da sua sala não acendeu hoje.',
    messages: [
      {
        id: 'pc-m1',
        sender: 'leticia',
        text: 'Mãe, não vou conseguir passar aí no domingo, preciso organizar umas caixas antigas.',
        time: '11:14',
        dateLabel: '16 nov',
        status: 'read',
      },
      {
        id: 'pc-m2',
        sender: 'them',
        text: 'Tudo bem, filha. Só não fica mexendo naquela caixa do quarto dos fundos sozinha.',
        time: '11:29',
      },
      {
        id: 'pc-m3',
        sender: 'them',
        text: 'Letícia? Você saiu de carro ou de aplicativo?',
        time: '01:49',
        dateLabel: '19 nov',
      },
      {
        id: 'pc-m4',
        sender: 'them',
        text: 'A Paula falou que a luz da sua sala não acendeu hoje.',
        time: '01:58',
      },
    ],
  },
  {
    id: 'pulso-grupo-escritorio',
    app: 'pulso',
    title: 'Ateliê Mendes · Projetos',
    subtitle: 'Clara, Eduardo, Rafael, Você',
    isGroup: true,
    unreadCount: 1,
    lastTime: '18 nov',
    preview: 'Eduardo: Alguém conseguiu falar com a Letícia sobre a planta?',
    messages: [
      {
        id: 'pc-g1',
        sender: 'them',
        senderName: 'Rafael (TI)',
        text: 'Subi as fotos em alta da fachada do Galpão Norte no servidor.',
        time: '10:05',
        dateLabel: '18 nov',
      },
      {
        id: 'pc-g2',
        sender: 'them',
        senderName: 'Clara',
        text: 'Obrigada Rafa! Letícia, você confirma a revisão até 16h?',
        time: '13:40',
      },
      {
        id: 'pc-g3',
        sender: 'them',
        senderName: 'Eduardo',
        text: 'Alguém conseguiu falar com a Letícia sobre a planta?',
        time: '19:12',
      },
    ],
  },
  {
    id: 'pulso-henrique',
    app: 'pulso',
    personId: 'person-henrique',
    title: 'Henrique Duarte',
    subtitle: 'visto por último ontem às 22:04',
    unreadCount: 0,
    lastTime: '18 nov',
    preview: 'Deixei a cópia da nota com o porteiro do galpão 3.',
    messages: [
      {
        id: 'pc-h1',
        sender: 'them',
        text: 'Oi Letícia, fiz o Pix pela conta da empresa (H. D. Serviços), caiu aí?',
        time: '14:24',
        dateLabel: '15 nov',
      },
      {
        id: 'pc-h2',
        sender: 'leticia',
        text: 'Caiu sim, Henrique. Obrigada. Só achei estranho o papel dobrado no fundo da caixa quando embalei.',
        time: '14:41',
        status: 'read',
      },
      {
        id: 'pc-h3',
        sender: 'them',
        text: 'Ah, se ainda tiver aquele endereço anotado, me manda depois. Trabalho perto da Rua das Acácias.',
        time: '15:02',
      },
      {
        id: 'pc-h4',
        sender: 'them',
        text: 'Deixei a cópia da nota com o porteiro do galpão 3.',
        time: '20:15',
        dateLabel: '18 nov',
      },
    ],
  },
  {
    id: 'pulso-camila',
    app: 'pulso',
    personId: 'person-camila',
    title: 'Camila',
    subtitle: 'online recentemente',
    unreadCount: 0,
    lastTime: '17 nov',
    preview: 'Aquele prédio fechou faz anos, Le. Por que isso voltou agora?',
    messages: [
      {
        id: 'pc-c1',
        sender: 'leticia',
        text: 'Cami, você lembra o nome da travessa atrás da antiga Boate Eclipse?',
        time: '22:18',
        dateLabel: '17 nov',
        status: 'read',
      },
      {
        id: 'pc-c2',
        sender: 'them',
        text: 'Nossa, que susto… acho que era Travessa do Cedro, colada na estrada velha. Por quê?',
        time: '22:25',
      },
      {
        id: 'pc-c3',
        sender: 'leticia',
        text: 'Recebi uma mensagem esquisita no app e um detalhe bateu com uma coisa que eu nunca contei pra ninguém.',
        time: '22:31',
        status: 'read',
      },
      {
        id: 'pc-c4',
        sender: 'them',
        text: 'Aquele prédio fechou faz anos, Le. Por que isso voltou agora?',
        time: '22:34',
      },
    ],
  },
  {
    id: 'pulso-paula',
    app: 'pulso',
    personId: 'person-paula',
    title: 'Paula (Apto 42)',
    unreadCount: 0,
    lastTime: '18 nov',
    preview: 'Reguei suas plantas da varanda como você pediu :)',
    messages: [
      {
        id: 'pc-p1',
        sender: 'leticia',
        text: 'Paula, se eu atrasar hoje consegue dar uma olhada no corredor?',
        time: '18:02',
        dateLabel: '18 nov',
        status: 'read',
      },
      {
        id: 'pc-p2',
        sender: 'them',
        text: 'Reguei suas plantas da varanda como você pediu :)',
        time: '19:45',
      },
    ],
  },
  {
    id: 'pulso-bruno-archived',
    app: 'pulso',
    personId: 'person-bruno',
    title: 'Bruno',
    archived: true,
    unreadCount: 0,
    lastTime: '12 nov',
    preview: 'Mensagem apagada',
    messages: [
      {
        id: 'pc-b1',
        sender: 'them',
        text: 'Vi que você foi atrás do número do Wagner no antiquário.',
        time: '21:14',
        dateLabel: '12 nov',
      },
      {
        id: 'pc-b2',
        sender: 'them',
        text: 'Esta mensagem foi apagada.',
        time: '21:16',
        deletedPlaceholder: true,
      },
      {
        id: 'pc-b3',
        sender: 'leticia',
        text: 'Para de acompanhar onde eu vou, Bruno. Já encerramos isso faz dois anos.',
        time: '21:29',
        status: 'read',
      },
    ],
  },
];

// ============================================================================
// PHONE CALLS & VOICEMAIL
// ============================================================================

export const ECOSYSTEM_CALLS: readonly CallRecord[] = [
  {
    id: 'call-1',
    personId: 'person-unknown-0934',
    displayName: '(11) 98412-0934',
    phone: '(11) 98412-0934',
    kind: 'outgoing',
    timeLabel: '02:41',
    dateLabel: '19 nov',
    durationLabel: '00:19',
  },
  {
    id: 'call-2',
    personId: 'person-helena',
    displayName: 'Mãe',
    phone: '(11) 99104-3318',
    kind: 'missed',
    timeLabel: '02:18',
    dateLabel: '19 nov',
    durationLabel: 'Não atendida',
  },
  {
    id: 'call-3',
    personId: 'person-helena',
    displayName: 'Mãe',
    phone: '(11) 99104-3318',
    kind: 'missed',
    timeLabel: '01:53',
    dateLabel: '19 nov',
    durationLabel: 'Não atendida',
  },
  {
    id: 'call-4',
    personId: 'person-helena',
    displayName: 'Mãe',
    phone: '(11) 99104-3318',
    kind: 'missed',
    timeLabel: '01:12',
    dateLabel: '19 nov',
    durationLabel: 'Não atendida',
  },
  {
    id: 'call-5',
    personId: 'person-marcos',
    displayName: 'M. S. Oliveira',
    phone: '(11) 97709-8831',
    kind: 'outgoing',
    timeLabel: '20:51',
    dateLabel: '18 nov',
    durationLabel: '02:44',
  },
  {
    id: 'call-6',
    personId: 'person-clara',
    displayName: 'Clara (Escritório)',
    phone: '(11) 98741-2209',
    kind: 'incoming',
    timeLabel: '16:15',
    dateLabel: '18 nov',
    durationLabel: '01:12',
  },
  {
    id: 'call-7',
    personId: 'person-dr-alberto',
    displayName: 'Dr. Alberto',
    phone: '(11) 3088-4410',
    kind: 'outgoing',
    timeLabel: '09:30',
    dateLabel: '17 nov',
    durationLabel: '03:08',
  },
];

export const ECOSYSTEM_VOICEMAILS: readonly VoicemailRecord[] = [
  {
    id: 'vm-1',
    personId: 'person-helena',
    displayName: 'Mãe',
    phone: '(11) 99104-3318',
    timeLabel: 'Hoje · 02:19',
    durationSec: 24,
    transcriptPreview:
      '“Filha, sou eu de novo… já passou das duas, a chuva não para. Me retorna só pra eu saber que você está bem.”',
    audioToneHz: 210,
    unread: true,
  },
  {
    id: 'vm-2',
    personId: 'person-clara',
    displayName: 'Clara (Escritório)',
    phone: '(11) 98741-2209',
    timeLabel: 'Ontem · 16:40',
    durationSec: 17,
    transcriptPreview:
      '“Le, o Eduardo perguntou se você remarcou a visita do Galpão Norte. Me dá um toque quando sair do compromisso.”',
    audioToneHz: 245,
    unread: false,
  },
];

// ============================================================================
// EMAILS (CORREIO)
// ============================================================================

export const ECOSYSTEM_EMAILS: readonly EmailRecord[] = [
  {
    id: 'em-1',
    folder: 'inbox',
    personId: 'person-clara',
    fromName: 'Clara Nogueira',
    fromAddress: 'clara.nogueira@ateliermendes.br',
    toAddress: 'leticia.vasc@correio.br',
    subject: 'Re: Revisão de planta — terça 16h',
    preview: 'Deixei a pasta física em cima da sua mesa caso chegue cedo...',
    dateLabel: '18 nov',
    timeLabel: '18:14',
    unread: true,
    body: [
      'Oi Letícia,',
      'Como você não conseguiu entrar na reunião das 16h, deixei a pasta impressa da restauração em cima da sua mesa.',
      'O Eduardo pediu para confirmarmos o orçamento com a Daniela até sexta.',
      'Qualquer coisa me chama no PulsoChat.',
      '— Clara',
    ],
  },
  {
    id: 'em-2',
    folder: 'inbox',
    fromName: 'MercadoLocal · Vendas',
    fromAddress: 'avisos@mercadolocal.br',
    toAddress: 'leticia.vasc@correio.br',
    subject: 'Comprovante de retirada — Pedido #ML-9042',
    preview: 'Venda confirmada: Caixa de música antiga anos 90 (R$ 480,00)...',
    dateLabel: '15 nov',
    timeLabel: '14:26',
    unread: false,
    body: [
      'Olá, Letícia Vasconcelos.',
      'Sua venda #ML-9042 foi marcada como retirada combinada pelo comprador @hduarte84 (Henrique Duarte).',
      'Item: Caixa de música antiga anos 90',
      'Valor informado: R$ 480,00 (pagamento direto via Pix)',
      'Local registrado para entrega: Rua das Acácias, 412 — Galpão 3.',
    ],
    attachment: {
      fileId: 'file-ml-receipt',
      name: 'Comprovante_ML_9042.pdf',
      sizeLabel: '148 KB',
    },
  },
  {
    id: 'em-3',
    folder: 'inbox',
    fromName: 'Banco Áurea',
    fromAddress: 'extratos@bancoaurea.br',
    toAddress: 'leticia.vasc@correio.br',
    subject: 'Comprovante Pix enviado — R$ 1.200,00',
    preview: 'Transferência realizada em 18/11 às 21:07 para M. S. Oliveira...',
    dateLabel: '18 nov',
    timeLabel: '21:08',
    unread: true,
    body: [
      'Comprovante de operação Pix',
      'Pagadora: Letícia Vasconcelos',
      'Beneficiário: M. S. Oliveira (CPF/CNPJ ***.418.902-**)',
      'Valor: R$ 1.200,00',
      'Descrição informada: devolução chave',
      'Autenticação: AUR-88412-2611',
    ],
    attachment: {
      fileId: 'file-pix-18nov',
      name: 'Comprovante_PIX_18nov.pdf',
      sizeLabel: '92 KB',
    },
  },
  {
    id: 'em-4',
    folder: 'inbox',
    personId: 'person-dr-alberto',
    fromName: 'Consultório Dr. Alberto Queiroz',
    fromAddress: 'consultorio@queirozpsi.br',
    toAddress: 'leticia.vasc@correio.br',
    subject: 'Confirmação de sessão — sexta 20/11 às 11h',
    preview: 'Lembrete automático de consulta presencial na Rua Mourato Coelho...',
    dateLabel: '17 nov',
    timeLabel: '10:02',
    unread: false,
    body: [
      'Olá Letícia,',
      'Confirmamos sua sessão para sexta-feira, 20/11, às 11h00.',
      'Caso precise remarcar, avise com 24 horas de antecedência.',
    ],
  },
  {
    id: 'em-5',
    folder: 'sent',
    personId: 'person-wagner',
    fromName: 'Letícia Vasconcelos',
    fromAddress: 'leticia.vasc@correio.br',
    toAddress: 'contato@antiquarioluz.br',
    subject: 'Foto de chaveiro antigo / 2005',
    preview: 'Sr. Wagner, conforme conversamos semana passada, encontrei a etiqueta...',
    dateLabel: '14 nov',
    timeLabel: '19:40',
    unread: false,
    body: [
      'Boa noite, Sr. Wagner.',
      'Conforme conversamos na semana passada, encontrei o recibo antigo com o carimbo do bairro da Luz.',
      'O senhor ainda guarda os livros de entrada de 2005? Passo aí na quinta se puder separar.',
      'Obrigada, Letícia.',
    ],
  },
  {
    id: 'em-6',
    folder: 'drafts',
    fromName: 'Letícia Vasconcelos',
    fromAddress: 'leticia.vasc@correio.br',
    toAddress: 'helena.vasc@correio.br',
    subject: '(Sem assunto)',
    preview: 'Mãe, se eu não voltar antes das três da manhã, olha a nota...',
    dateLabel: '19 nov',
    timeLabel: '00:54',
    unread: false,
    body: [
      'Mãe,',
      'Se eu não atender o telefone hoje, não vai sozinha na estrada velha. Eu só precisava confirmar se o portão ainda existe e quem',
    ],
  },
  {
    id: 'em-7',
    folder: 'spam',
    fromName: 'Clube Prêmio Digital',
    fromAddress: 'ofertas@premiomais.invalid',
    toAddress: 'leticia.vasc@correio.br',
    subject: 'Seus pontos expiram hoje!',
    preview: 'Resgate agora seu vale-presente exclusivo...',
    dateLabel: '18 nov',
    timeLabel: '07:15',
    unread: false,
    body: ['Mensagem identificada automaticamente como spam.'],
  },
  {
    id: 'em-8',
    folder: 'trash',
    fromName: 'Faísca · Suporte',
    fromAddress: 'seguranca@faiscaapp.br',
    toAddress: 'leticia.vasc@correio.br',
    subject: 'Perfil bloqueado com sucesso',
    preview: 'Confirmamos o bloqueio do perfil Matheus R. em 17/11 às 23:42...',
    dateLabel: '17 nov',
    timeLabel: '23:42',
    unread: false,
    body: [
      'Olá Letícia,',
      'Confirmamos que o perfil Matheus R. foi bloqueado e removido da sua lista ativa em 17/11 às 23:42.',
    ],
  },
];

// ============================================================================
// PHOTOS & ALBUMS
// ============================================================================

export const ECOSYSTEM_PHOTOS: readonly PhotoRecord[] = [
  {
    id: 'photo-road',
    src: GENERATED_ASSETS.galleryMistRoad,
    alt: 'Estrada de asfalto molhada desaparecendo na neblina sob um único poste de luz',
    album: 'Recentes',
    favorite: true,
    dateLabel: '19 nov',
    timeLabel: '01:42',
    locationLabel: 'Estrada Vicinal · Km 14',
    cameraLabel: 'Grande-angular 26mm · f/1.6',
    resolution: '4032 × 3024',
  },
  {
    id: 'photo-gate',
    src: GENERATED_ASSETS.galleryOldHouse,
    alt: 'Portão de ferro antigo entreaberto diante de um caminho de pedras coberto de neblina',
    album: 'Recentes',
    dateLabel: '17 nov',
    timeLabel: '18:19',
    cameraLabel: 'Grande-angular 26mm · f/1.6',
    resolution: '4032 × 3024',
  },
  {
    id: 'photo-portrait',
    src: LETICIA_PORTRAIT_TOKEN,
    alt: 'Retrato pessoal de Letícia em preto e branco',
    album: 'Favoritas',
    favorite: true,
    dateLabel: '04 nov',
    timeLabel: '17:08',
    locationLabel: 'Pinheiros, São Paulo',
    cameraLabel: 'Retrato 50mm · P&B',
    resolution: '3024 × 3024',
    grayscale: true,
  },
  {
    id: 'photo-window-rain',
    src: GENERATED_ASSETS.lockWallpaper,
    alt: 'Vidro molhado de chuva à noite com reflexo distante de luzes da rua',
    album: 'Recentes',
    dateLabel: '11 nov',
    timeLabel: '23:14',
    locationLabel: 'Vila Madalena, São Paulo',
    cameraLabel: 'Grande-angular 26mm · f/1.6',
    resolution: '4032 × 3024',
  },
  {
    id: 'photo-deleted-gate',
    src: GENERATED_ASSETS.galleryOldHouse,
    alt: 'Foto semelhante do portão metálico movida para apagadas recentemente',
    album: 'Apagadas',
    dateLabel: '17 nov',
    timeLabel: '18:17',
    resolution: '4032 × 3024',
    caption: 'Apagada há 2 dias · restauração disponível por 28 dias',
  },
];

// ============================================================================
// NOTES
// ============================================================================

export const ECOSYSTEM_NOTES: readonly NoteRecord[] = [
  {
    id: 'note-1',
    folder: 'Pessoais',
    title: 'O que ainda volta à noite',
    updatedAt: '16 nov · 03:08',
    excerpt: 'O cheiro de terra molhada e o barulho do portão metálico...',
    body: [
      'O cheiro de terra molhada e o barulho do portão metálico nunca mudam. Às vezes acho que estou inventando detalhes para preencher o vazio de vinte e um anos atrás.',
      'Outras vezes tenho certeza de que alguém me viu saindo daquela curva, e agora esse mesmo endereço apareceu num papel dobrado dentro da caixa que eu vendi.',
    ],
  },
  {
    id: 'note-2',
    folder: 'Pessoais',
    title: 'Antes de sair',
    updatedAt: '19 nov · 00:49',
    excerpt: 'Não avisar ninguém antes de confirmar o endereço...',
    body: [
      'Não avisar ninguém antes de confirmar o endereço.',
      'Levar lanterna carregada e bateria reserva.',
      'Se o sinal cair antes da ponte do Km 14, anotar a placa do carro no bloco de papel.',
      'Não entrar se o portão estiver aberto.',
    ],
  },
  {
    id: 'note-mercado',
    folder: 'Listas',
    title: 'Mercado da semana',
    updatedAt: '15 nov · 10:12',
    excerpt: 'Café em grãos, pão de fermentação natural, azeite, limão...',
    body: [
      '• Café em grãos (torra média)',
      '• Pão de fermentação natural',
      '• Leite vegetal e ovos',
      '• Pilhas AAA para lanterna pequena',
      '• Filtro de papel nº 103',
    ],
  },
  {
    id: 'note-trabalho',
    folder: 'Trabalho',
    title: 'Pauta Ateliê — Galpão Norte',
    updatedAt: '18 nov · 11:30',
    excerpt: 'Confirmar medidas do mezanino com Clara e enviar NF para Daniela...',
    body: [
      '1. Revisar corte longitudinal com a Clara antes das 16h.',
      '2. Enviar nota de serviço para a Daniela fechar o mês.',
      '3. Conferir orçamento de iluminação indireta com o Lucas.',
    ],
  },
  {
    id: 'note-3',
    folder: 'Pessoais',
    title: 'Anexo protegido — 2005',
    updatedAt: '18 nov · 02:11',
    excerpt: 'Nota protegida por senha independente.',
    body: [],
    locked: true,
    lockHint: 'Conteúdo bloqueado por senha secundária.',
  },
];

// ============================================================================
// BANK (BANCO ÁUREA — FICTITIOUS)
// ============================================================================

export const BANK_ACCOUNT_SUMMARY = {
  bankName: 'Banco Áurea',
  agency: '0001',
  account: '48291-7',
  balance: 4382.65,
  cardLimitTotal: 6500.0,
  cardInvoiceCurrent: 1248.9,
  cardDueDate: '05 dez',
} as const;

export const ECOSYSTEM_TRANSACTIONS: readonly BankTransaction[] = [
  {
    id: 'tx-1',
    personId: 'person-marcos',
    counterparty: 'M. S. Oliveira',
    category: 'Pix',
    direction: 'out',
    amount: 1200.0,
    dateLabel: '18 nov',
    timeLabel: '21:07',
    description: 'devolução chave',
    receiptCode: 'AUR-88412-2611',
    bankLabel: 'Banco Solaris S.A.',
    documentMask: '***.418.902-**',
  },
  {
    id: 'tx-2',
    counterparty: 'RotaGo Mobilidade',
    category: 'Cartão',
    direction: 'out',
    amount: 64.9,
    dateLabel: '19 nov',
    timeLabel: '01:14',
    description: 'Corrida noturna · Estrada Vicinal',
    receiptCode: 'AUR-88490-2611',
    bankLabel: 'Cartão final 4092',
    documentMask: '29.401.882/0001-10',
  },
  {
    id: 'tx-3',
    counterparty: 'Padaria Santa Clara',
    category: 'Cartão',
    direction: 'out',
    amount: 38.4,
    dateLabel: '18 nov',
    timeLabel: '08:27',
    description: 'Café da manhã',
    receiptCode: 'AUR-88310-2611',
    bankLabel: 'Cartão final 4092',
    documentMask: '14.208.331/0001-04',
  },
  {
    id: 'tx-4',
    personId: 'person-henrique',
    counterparty: 'H. D. Serviços Ltda',
    category: 'Pix',
    direction: 'in',
    amount: 480.0,
    dateLabel: '15 nov',
    timeLabel: '14:22',
    description: 'Caixa antiga ML-9042',
    receiptCode: 'AUR-87904-2611',
    bankLabel: 'Banco Meridiano',
    documentMask: '38.912.440/0001-82',
  },
  {
    id: 'tx-5',
    personId: 'person-roberto',
    counterparty: 'Roberto Braga',
    category: 'Transferência',
    direction: 'out',
    amount: 2650.0,
    dateLabel: '10 nov',
    timeLabel: '09:04',
    description: 'Aluguel Apto 41 — nov/26',
    receiptCode: 'AUR-87119-2611',
    bankLabel: 'Banco Áurea',
    documentMask: '***.702.114-**',
  },
  {
    id: 'tx-6',
    counterparty: 'Ateliê Mendes Arquitetura',
    category: 'Transferência',
    direction: 'in',
    amount: 7400.0,
    dateLabel: '05 nov',
    timeLabel: '10:00',
    description: 'Honorários mensais',
    receiptCode: 'AUR-86502-2611',
    bankLabel: 'Banco Meridiano',
    documentMask: '22.845.190/0001-55',
  },
];

export const ECOSYSTEM_CARD_INSTALLMENTS: readonly CardInstallment[] = [
  {
    id: 'ci-1',
    merchant: 'Livraria Travessa',
    dateLabel: '12 nov',
    installmentLabel: '2/3',
    amount: 79.9,
    category: 'Cultura',
  },
  {
    id: 'ci-2',
    merchant: 'Estúdio Pilates Pinheiros',
    dateLabel: '08 nov',
    installmentLabel: 'Mensal',
    amount: 420.0,
    category: 'Saúde',
  },
  {
    id: 'ci-3',
    merchant: 'MercadoLocal · Lanterna tática',
    dateLabel: '16 nov',
    installmentLabel: '1/2',
    amount: 94.5,
    category: 'Compras',
  },
];

// ============================================================================
// MARKETPLACE (MERCADOLOCAL)
// ============================================================================

export const ECOSYSTEM_MARKETPLACE: readonly MarketplaceOrder[] = [
  {
    id: 'ord-ml-9042',
    kind: 'sale',
    itemTitle: 'Caixa de música antiga anos 90 (prata escovada)',
    price: 480.0,
    status: 'Retirada combinada',
    counterpartyId: 'person-henrique',
    counterpartyName: 'Henrique Duarte',
    counterpartyHandle: '@hduarte84',
    dateLabel: '15 nov',
    pickupOrAddress: 'Rua das Acácias, 412 — Galpão 3',
    chatMessages: [
      {
        id: 'mlc-1',
        from: 'other',
        text: 'Boa tarde! Essa caixa ainda toca ou está travada? Vi que tem uma gravação pequena na tampa.',
        time: '14 nov · 18:10',
      },
      {
        id: 'mlc-2',
        from: 'leticia',
        text: 'Boa tarde, funciona sim, só precisa dar corda devagar. Era da casa da minha avó.',
        time: '14 nov · 18:24',
      },
      {
        id: 'mlc-3',
        from: 'other',
        text: 'Fechado. Posso retirar amanhã perto da Rua das Acácias, 412, Galpão 3. Pago no Pix na hora.',
        time: '14 nov · 19:02',
      },
    ],
  },
  {
    id: 'ord-ml-9088',
    kind: 'purchase',
    itemTitle: 'Lanterna LED compacta recarregável USB-C',
    price: 189.0,
    status: 'Concluído',
    counterpartyName: 'Loja Trilha Urbana',
    counterpartyHandle: '@trilhaurbana',
    dateLabel: '16 nov',
    pickupOrAddress: 'Entregue na portaria — Cond. Vila Verde',
    trackingCode: 'MLBR-77492018',
    chatMessages: [
      {
        id: 'mlc-4',
        from: 'other',
        text: 'Pedido entregue na portaria e recebido por Sérgio às 15:40.',
        time: '17 nov · 15:42',
      },
    ],
  },
];

// ============================================================================
// MAPS & MOBILITY (MAPAS + ROTAGO)
// ============================================================================

export const ECOSYSTEM_MAP_PLACES: readonly MapPlaceRecord[] = [
  {
    id: 'place-home',
    name: 'Casa — Vila Verde',
    address: 'Rua Harmonia, 318 · Apto 41',
    category: 'Favorito',
    lastVisit: '18 nov · 22:40',
    x: 28,
    y: 58,
  },
  {
    id: 'place-office',
    name: 'Ateliê Mendes Arquitetura',
    address: 'Rua Mourato Coelho, 890',
    category: 'Favorito',
    lastVisit: '18 nov · 14:10',
    x: 44,
    y: 46,
  },
  {
    id: 'place-galpao',
    name: 'Galpão 3 — Rua das Acácias',
    address: 'Rua das Acácias, 412',
    category: 'Recente',
    lastVisit: '15 nov · 14:20',
    x: 66,
    y: 38,
    note: 'Pesquisado novamente em 18 nov · 20:42',
  },
  {
    id: 'place-km14',
    name: 'Estrada Vicinal · Km 14',
    address: 'Acesso Travessa do Cedro (zona rural)',
    category: 'Sem sinal',
    lastVisit: '19 nov · 01:36 (sinal perdido)',
    x: 82,
    y: 20,
    note: 'Último registro de GPS antes da perda de rede.',
  },
];

export const ECOSYSTEM_RIDES: readonly RideTripRecord[] = [
  {
    id: 'ride-1',
    dateLabel: '19 nov',
    timeLabel: '01:14',
    origin: 'Rua Harmonia, 318',
    destination: 'Estrada Vicinal · Km 14',
    driverName: 'Carlos A.',
    carLabel: 'Sedan Prata · Final 7E4',
    fare: 64.9,
    status: 'Interrompida antes do destino',
    note: 'Passageira pediu desembarque 400m antes da ponte.',
  },
  {
    id: 'ride-2',
    dateLabel: '17 nov',
    timeLabel: '17:52',
    origin: 'Rua Mourato Coelho, 890',
    destination: 'Travessa do Cedro, s/n',
    driverName: 'Júlio M.',
    carLabel: 'Hatch Cinza · Final 2B9',
    fare: 48.2,
    status: 'Finalizada',
  },
  {
    id: 'ride-3',
    dateLabel: '15 nov',
    timeLabel: '13:55',
    origin: 'Rua Harmonia, 318',
    destination: 'Rua das Acácias, 412',
    driverName: 'Renato S.',
    carLabel: 'Sedan Preto · Final 9C1',
    fare: 29.5,
    status: 'Finalizada',
  },
];

// ============================================================================
// DATING APP (FAÍSCA)
// ============================================================================

export const ECOSYSTEM_DATING_MATCHES: readonly DatingMatchRecord[] = [
  {
    id: 'match-gustavo',
    personId: 'person-gustavo',
    name: 'Gustavo',
    age: 37,
    distanceLabel: '4 km',
    bio: 'Designer de som, café passado na hora e cinema fora de circuito.',
    status: 'active',
    lastActive: '16 nov',
    messages: [
      {
        id: 'dm-g1',
        from: 'match',
        text: 'Aquele café da Fradique ainda tem o melhor pão de queijo da região?',
        time: '15 nov · 20:10',
      },
      {
        id: 'dm-g2',
        from: 'leticia',
        text: 'Ainda tem! Essa semana está corrida, mas sexta posso passar por lá.',
        time: '16 nov · 09:42',
      },
    ],
  },
  {
    id: 'match-matheus',
    personId: 'person-matheus',
    name: 'Matheus R.',
    age: 38,
    distanceLabel: 'Indisponível',
    bio: 'Perfil bloqueado pela usuária.',
    status: 'blocked',
    lastActive: '17 nov',
    messages: [
      {
        id: 'dm-m1',
        from: 'match',
        text: 'Posso perguntar uma coisa estranha? Você frequentava o bairro da Luz em 2005?',
        time: '17 nov · 23:18',
      },
      {
        id: 'dm-m2',
        from: 'leticia',
        text: 'Acho que você está me confundindo com outra pessoa.',
        time: '17 nov · 23:24',
      },
      {
        id: 'dm-m3',
        from: 'match',
        text: 'Não estou. Ninguém esquece aquela noite atrás da Eclipse.',
        time: '17 nov · 23:39',
      },
    ],
  },
];

// ============================================================================
// SOCIAL NETWORK (LUME)
// ============================================================================

export const ECOSYSTEM_SOCIAL_POSTS: readonly SocialPostRecord[] = [
  {
    id: 'post-1',
    authorId: 'person-clara',
    authorHandle: '@claranogueira',
    authorName: 'Clara Nogueira',
    location: 'Ateliê Mendes',
    dateLabel: '18 nov',
    imageSrc: GENERATED_ASSETS.lockWallpaper,
    imageAlt: 'Chuva na janela do escritório ao entardecer',
    caption: 'Mais uma terça de chuva fechando prancha até tarde.',
    likes: 34,
    comments: [
      {
        id: 'c-1',
        handle: '@paulamend',
        text: 'Esse tempo não dá trégua essa semana!',
        time: '18 nov',
      },
    ],
  },
  {
    id: 'post-2',
    authorHandle: '@leticiavasc',
    authorName: 'Letícia Vasconcelos',
    location: 'Vila Madalena',
    dateLabel: '11 nov',
    imageSrc: LETICIA_PORTRAIT_TOKEN,
    imageAlt: 'Retrato em preto e branco publicado por Letícia',
    caption: 'Luz de fim de tarde antes de chover.',
    likes: 62,
    comments: [
      {
        id: 'c-2',
        handle: '@camilaferraz',
        text: 'Saudade de você, some não!',
        time: '11 nov',
      },
      {
        id: 'c-3',
        handle: '@brunosalles',
        text: 'Ficou boa essa foto.',
        time: '12 nov',
      },
    ],
  },
  {
    id: 'post-3',
    authorId: 'person-henrique',
    authorHandle: '@hduarte84',
    authorName: 'Henrique Duarte',
    location: 'Centro Histórico',
    dateLabel: '15 nov',
    imageSrc: GENERATED_ASSETS.galleryOldHouse,
    imageAlt: 'Fachada antiga com portão de ferro sob neblina',
    caption: 'Restaurando peças antigas que chegam no galpão.',
    likes: 19,
    comments: [],
  },
];

export const ECOSYSTEM_SOCIAL_DMS: readonly SocialDmRecord[] = [
  {
    id: 'sdm-camila',
    personId: 'person-camila',
    handle: '@camilaferraz',
    displayName: 'Camila Ferraz',
    lastTime: '17 nov',
    unread: false,
    messages: [
      {
        id: 'sdm-1',
        from: 'them',
        text: 'Amiga, vi você curtindo arquivo antigo da Boate Eclipse. Tá tudo bem?',
        time: '17 nov · 22:04',
      },
      {
        id: 'sdm-2',
        from: 'leticia',
        text: 'Te chamo no PulsoChat agora.',
        time: '17 nov · 22:15',
      },
    ],
  },
  {
    id: 'sdm-paula',
    personId: 'person-paula',
    handle: '@paulamend',
    displayName: 'Paula Mendonça',
    lastTime: '14 nov',
    unread: false,
    messages: [
      {
        id: 'sdm-3',
        from: 'them',
        text: 'Amei o vaso novo na sua foto!',
        time: '14 nov · 16:30',
      },
    ],
  },
];

// ============================================================================
// FILES (ARQUIVOS — FICTITIOUS PDFs & DOCUMENTS)
// ============================================================================

export const ECOSYSTEM_FILES: readonly PhoneFileRecord[] = [
  {
    id: 'file-pix-18nov',
    folder: 'Comprovantes',
    name: 'Comprovante_PIX_18nov.pdf',
    extension: 'PDF',
    sizeLabel: '92 KB',
    modifiedAt: '18 nov · 21:08',
    lines: [
      'BANCO ÁUREA S.A. — COMPROVANTE PIX',
      'Data/Hora: 18/11/2026 às 21:07:14',
      'Pagadora: Letícia Vasconcelos',
      'Recebedor: M. S. Oliveira (Banco Solaris)',
      'Documento: ***.418.902-**',
      'Valor: R$ 1.200,00',
      'Descrição: devolução chave',
      'Código de autenticação: AUR-88412-2611',
    ],
  },
  {
    id: 'file-ml-receipt',
    folder: 'Comprovantes',
    name: 'Comprovante_ML_9042.pdf',
    extension: 'PDF',
    sizeLabel: '148 KB',
    modifiedAt: '15 nov · 14:26',
    lines: [
      'MERCADOLOCAL — REGISTRO DE VENDA #ML-9042',
      'Anúncio: Caixa de música antiga anos 90',
      'Vendedora: Letícia Vasconcelos',
      'Comprador: Henrique Duarte (@hduarte84)',
      'Retirada combinada: Rua das Acácias, 412 — Galpão 3',
      'Valor: R$ 480,00 · Status: Concluído',
    ],
  },
  {
    id: 'file-laudo-2005',
    folder: 'Documentos',
    name: 'Prontuario_2005_copia.pdf',
    extension: 'PDF',
    sizeLabel: '412 KB',
    modifiedAt: '13 nov · 23:51',
    lines: [
      'PRONTO-SOCORRO MUNICIPAL · CÓPIA DIGITALIZADA',
      'Data do atendimento: 19/11/2005 — 03h40',
      'Paciente: L. V., 15 anos',
      'Ocorrência: encontrada desacordada próxima à Travessa do Cedro.',
      'Quadro: trauma craniano leve, confusão temporal e amnésia lacunar.',
      'Observação médica: paciente relata lembranças fragmentadas e fora de ordem.',
    ],
  },
  {
    id: 'file-aluguel',
    folder: 'Documentos',
    name: 'Contrato_Aluguel_VilaVerde.pdf',
    extension: 'PDF',
    sizeLabel: '310 KB',
    modifiedAt: '02 jan · 11:20',
    lines: [
      'CONTRATO DE LOCAÇÃO RESIDENCIAL',
      'Imóvel: Rua Harmonia, 318 — Apto 41 (Cond. Vila Verde)',
      'Locador: Roberto Braga',
      'Locatária: Letícia Vasconcelos',
      'Valor mensal: R$ 2.650,00 · Vencimento dia 10.',
    ],
  },
  {
    id: 'file-planta',
    folder: 'Trabalho',
    name: 'Galpao_Norte_Rev04.pdf',
    extension: 'PDF',
    sizeLabel: '1,4 MB',
    modifiedAt: '18 nov · 12:04',
    lines: [
      'ATELIÊ MENDES ARQUITETURA — REVISÃO 04',
      'Projeto: Restauro Galpão Norte',
      'Responsáveis técnicas: Letícia Vasconcelos / Clara Nogueira',
      'Pendência: validação de corte longitudinal com Eduardo Teles.',
    ],
  },
];

// ============================================================================
// CALENDAR (NOVEMBER 2026)
// ============================================================================

export const ECOSYSTEM_CALENDAR_EVENTS: readonly CalendarEventRecord[] = [
  {
    id: 'ev-1',
    day: 15,
    monthLabel: 'Novembro 2026',
    timeLabel: '14:00',
    title: 'Entregar caixa antiga — Henrique',
    location: 'Rua das Acácias, 412 (Galpão 3)',
    category: 'Pessoal',
  },
  {
    id: 'ev-2',
    day: 17,
    monthLabel: 'Novembro 2026',
    timeLabel: '18:00',
    title: 'Passar na Travessa do Cedro antes de escurecer',
    category: 'Pessoal',
  },
  {
    id: 'ev-3',
    day: 18,
    monthLabel: 'Novembro 2026',
    timeLabel: '16:00',
    title: 'Reunião Galpão Norte (Clara / Eduardo)',
    location: 'Ateliê Mendes',
    category: 'Trabalho',
    notes: 'Não compareceu.',
  },
  {
    id: 'ev-4',
    day: 19,
    monthLabel: 'Novembro 2026',
    timeLabel: '01:00',
    title: 'Confirmar portão — Km 14',
    location: 'Estrada Vicinal',
    category: 'Lembrete',
  },
  {
    id: 'ev-5',
    day: 20,
    monthLabel: 'Novembro 2026',
    timeLabel: '11:00',
    title: 'Sessão Dr. Alberto Queiroz',
    location: 'Rua Mourato Coelho',
    category: 'Pessoal',
  },
  {
    id: 'ev-6',
    day: 20,
    monthLabel: 'Novembro 2026',
    timeLabel: '18:30',
    title: 'Café com Gustavo (confirmar)',
    location: 'Rua Fradique Coutinho',
    category: 'Pessoal',
  },
];

// ============================================================================
// VOICE MEMOS (GRAVADOR)
// ============================================================================

export const ECOSYSTEM_VOICE_MEMOS: readonly VoiceMemoRecord[] = [
  {
    id: 'memo-1',
    title: 'Estrada Vicinal · 01h38',
    dateLabel: '19 nov · 01:38',
    durationSec: 18,
    locationLabel: 'Sem sinal de rede',
    summaryNote:
      'Som de chuva forte, passos em cascalho molhado e uma respiração acelerada antes de o áudio cortar abruptamente.',
    toneHz: 155,
  },
  {
    id: 'memo-2',
    title: 'Lembrete obra Galpão Norte',
    dateLabel: '18 nov · 11:45',
    durationSec: 32,
    locationLabel: 'Ateliê Mendes',
    summaryNote:
      'Anotação de voz sobre as medidas do mezanino e ajuste de luminárias com a Clara.',
    toneHz: 260,
  },
  {
    id: 'memo-3',
    title: 'Sessão — anotações soltas',
    dateLabel: '13 nov · 19:22',
    durationSec: 47,
    locationLabel: 'Casa — Vila Verde',
    summaryNote:
      'Relato em voz baixa sobre tentar reconstruir a noite de 2005 sem preencher lacunas com imaginação.',
    toneHz: 190,
  },
];

// ============================================================================
// FICTITIOUS BROWSER HISTORY (NAVEGADOR VELA)
// ============================================================================

export const ECOSYSTEM_BROWSER_HISTORY: readonly BrowserHistoryRecord[] = [
  {
    id: 'bh-1',
    title: 'Arquivo Urbano SP — Encerramento Boate Eclipse (2006)',
    url: 'arquivourbano.br/registros/eclipse-2006',
    timeLabel: '18 nov · 23:12',
    snippet:
      'Registro municipal de interdição do imóvel comercial próximo à Travessa do Cedro em março de 2006.',
    bookmarked: true,
  },
  {
    id: 'bh-2',
    title: 'Consulta CNPJ — H. D. Serviços Ltda',
    url: 'consultacadastro.br/hd-servicos-ltda',
    timeLabel: '18 nov · 20:35',
    snippet:
      'Situação ativa. Endereço fiscal cadastrado na Rua das Acácias, 412 — Galpão 3.',
  },
  {
    id: 'bh-3',
    title: 'Previsão do tempo — São Paulo 19 nov',
    url: 'climaagora.br/sao-paulo',
    timeLabel: '18 nov · 22:50',
    snippet: 'Chuva persistente durante a madrugada, neblina nas vias periféricas, 17°C.',
  },
  {
    id: 'bh-4',
    title: 'Restauro de estruturas metálicas em galpões antigos',
    url: 'revistaarquitetura.br/restauro-galpoes',
    timeLabel: '16 nov · 15:18',
    snippet: 'Referências técnicas para o projeto Galpão Norte no Ateliê Mendes.',
    bookmarked: true,
  },
];

// ============================================================================
// NOTIFICATION CENTER FEED
// ============================================================================

export const INITIAL_OS_NOTIFICATIONS: readonly OsNotificationItem[] = [
  {
    id: 'n-1',
    appId: 'messages',
    appName: 'Mensagens',
    title: '(11) 98412-0934',
    body: 'Você não deveria ter voltado lá.',
    timeLabel: '02:54',
    targetId: 'sms-unknown',
  },
  {
    id: 'n-2',
    appId: 'phone',
    appName: 'Telefone',
    title: 'Mãe',
    body: '3 chamadas perdidas · 1 nova mensagem de voz',
    timeLabel: '02:19',
  },
  {
    id: 'n-3',
    appId: 'pulso',
    appName: 'PulsoChat',
    title: 'Mãe',
    body: 'A Paula falou que a luz da sua sala não acendeu hoje.',
    timeLabel: '01:58',
    targetId: 'pulso-mae',
  },
  {
    id: 'n-4',
    appId: 'bank',
    appName: 'Banco Áurea',
    title: 'Pix enviado confirmado',
    body: 'R$ 1.200,00 para M. S. Oliveira (devolução chave)',
    timeLabel: 'Ontem · 21:07',
    targetId: 'tx-1',
  },
  {
    id: 'n-5',
    appId: 'email',
    appName: 'Correio',
    title: 'Clara Nogueira',
    body: 'Re: Revisão de planta — terça 16h',
    timeLabel: 'Ontem · 18:14',
    targetId: 'em-1',
  },
];

// ============================================================================
// PURE GLOBAL SEARCH (SPOTLIGHT) — UNIT-TESTABLE CROSS-APP INDEX
// ============================================================================

export interface SpotlightResult {
  readonly id: string;
  readonly category:
    | 'Contato'
    | 'Mensagem'
    | 'PulsoChat'
    | 'E-mail'
    | 'Nota'
    | 'Banco'
    | 'Arquivo'
    | 'Local';
  readonly title: string;
  readonly subtitle: string;
  readonly appId:
    | 'phone'
    | 'messages'
    | 'pulso'
    | 'email'
    | 'notes'
    | 'bank'
    | 'files'
    | 'maps';
  readonly targetId: string;
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Pure global Spotlight search across all persistent entities in Letícia's phone.
 * Returns ranked cross-app hits without ever marking or spoiling "clues".
 */
export function searchPhoneEcosystem(rawQuery: string): SpotlightResult[] {
  const q = normalizeSearchText(rawQuery);
  if (!q) return [];

  const hits: SpotlightResult[] = [];

  for (const person of PHONE_CONTACTS) {
    const hay = normalizeSearchText(
      `${person.name} ${person.phone} ${person.handle ?? ''} ${person.relation}`
    );
    if (hay.includes(q)) {
      hits.push({
        id: `hit-person-${person.id}`,
        category: 'Contato',
        title: person.name,
        subtitle: `${person.relation} · ${person.phone}`,
        appId: 'phone',
        targetId: person.id,
      });
    }
  }

  for (const chat of ECOSYSTEM_CHATS) {
    const hay = normalizeSearchText(
      `${chat.title} ${chat.preview} ${chat.messages.map((m) => m.text).join(' ')}`
    );
    if (hay.includes(q)) {
      hits.push({
        id: `hit-chat-${chat.id}`,
        category: chat.app === 'sms' ? 'Mensagem' : 'PulsoChat',
        title: chat.title,
        subtitle: chat.preview,
        appId: chat.app === 'sms' ? 'messages' : 'pulso',
        targetId: chat.id,
      });
    }
  }

  for (const email of ECOSYSTEM_EMAILS) {
    const hay = normalizeSearchText(
      `${email.fromName} ${email.subject} ${email.body.join(' ')}`
    );
    if (hay.includes(q)) {
      hits.push({
        id: `hit-email-${email.id}`,
        category: 'E-mail',
        title: email.subject,
        subtitle: `${email.fromName} · ${email.dateLabel}`,
        appId: 'email',
        targetId: email.id,
      });
    }
  }

  for (const note of ECOSYSTEM_NOTES) {
    const hay = normalizeSearchText(
      `${note.title} ${note.excerpt} ${note.body.join(' ')}`
    );
    if (hay.includes(q)) {
      hits.push({
        id: `hit-note-${note.id}`,
        category: 'Nota',
        title: note.title,
        subtitle: note.updatedAt,
        appId: 'notes',
        targetId: note.id,
      });
    }
  }

  for (const tx of ECOSYSTEM_TRANSACTIONS) {
    const hay = normalizeSearchText(
      `${tx.counterparty} ${tx.description} ${tx.receiptCode} ${tx.amount}`
    );
    if (hay.includes(q)) {
      hits.push({
        id: `hit-tx-${tx.id}`,
        category: 'Banco',
        title: tx.counterparty,
        subtitle: `${tx.direction === 'in' ? '+' : '-'} R$ ${tx.amount.toFixed(2).replace('.', ',')} · ${tx.description}`,
        appId: 'bank',
        targetId: tx.id,
      });
    }
  }

  for (const file of ECOSYSTEM_FILES) {
    const hay = normalizeSearchText(`${file.name} ${file.lines.join(' ')}`);
    if (hay.includes(q)) {
      hits.push({
        id: `hit-file-${file.id}`,
        category: 'Arquivo',
        title: file.name,
        subtitle: `${file.folder} · ${file.sizeLabel}`,
        appId: 'files',
        targetId: file.id,
      });
    }
  }

  for (const place of ECOSYSTEM_MAP_PLACES) {
    const hay = normalizeSearchText(
      `${place.name} ${place.address} ${place.note ?? ''}`
    );
    if (hay.includes(q)) {
      hits.push({
        id: `hit-place-${place.id}`,
        category: 'Local',
        title: place.name,
        subtitle: place.address,
        appId: 'maps',
        targetId: place.id,
      });
    }
  }

  return hits.slice(0, 18);
}

export function getPersonById(personId?: string): PersonEntity | undefined {
  if (!personId) return undefined;
  return PHONE_CONTACTS.find((p) => p.id === personId);
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
