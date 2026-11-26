import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Check,
  CheckCheck,
  ChevronLeft,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Pause,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Play,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  User,
  Voicemail,
} from 'lucide-react';
import { chapterAudio } from '../../game/audio';
import {
  ECOSYSTEM_CALLS,
  ECOSYSTEM_CHATS,
  ECOSYSTEM_EMAILS,
  ECOSYSTEM_VOICEMAILS,
  PHONE_CONTACTS,
  normalizeSearchText,
  type EcosystemChatThread,
  type EmailRecord,
  type PersonEntity,
} from '../../game/phoneEcosystem';
import type { OsDeepLink } from './OsTypes';

// ============================================================================
// TELEFONE & CONTATOS (Recentes, Perdidas, Contatos [26+], Correio de Voz)
// ============================================================================

interface PhoneAppProps {
  initialTargetId?: string;
  onNavigate: (link: OsDeepLink) => void;
  onBackHome: () => void;
}

export function PhoneApp({
  initialTargetId,
  onNavigate,
  onBackHome,
}: PhoneAppProps) {
  const initialPerson = useMemo(
    () => PHONE_CONTACTS.find((p) => p.id === initialTargetId) ?? null,
    [initialTargetId]
  );

  const [tab, setTab] = useState<'recents' | 'missed' | 'contacts' | 'voicemail'>(
    initialPerson ? 'contacts' : 'recents'
  );
  const [selectedPerson, setSelectedPerson] = useState<PersonEntity | null>(
    initialPerson
  );
  const [contactQuery, setContactQuery] = useState('');
  const [playingVmId, setPlayingVmId] = useState<string | null>(null);
  const [callNotice, setCallNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!playingVmId) return;
    const timer = window.setTimeout(() => setPlayingVmId(null), 4000);
    return () => window.clearTimeout(timer);
  }, [playingVmId]);

  const filteredContacts = useMemo(() => {
    const q = normalizeSearchText(contactQuery);
    if (!q) return PHONE_CONTACTS;
    return PHONE_CONTACTS.filter((p) =>
      normalizeSearchText(`${p.name} ${p.phone} ${p.relation}`).includes(q)
    );
  }, [contactQuery]);

  const displayedCalls =
    tab === 'missed'
      ? ECOSYSTEM_CALLS.filter((c) => c.kind === 'missed')
      : ECOSYSTEM_CALLS;

  const openPersonById = (personId?: string) => {
    if (!personId) return;
    const found = PHONE_CONTACTS.find((p) => p.id === personId);
    if (found) {
      chapterAudio.playUiTap();
      setSelectedPerson(found);
      setCallNotice(null);
    }
  };

  if (selectedPerson) {
    const linkedSms = ECOSYSTEM_CHATS.find(
      (c) => c.app === 'sms' && c.personId === selectedPerson.id
    );
    const linkedPulso = ECOSYSTEM_CHATS.find(
      (c) => c.app === 'pulso' && c.personId === selectedPerson.id
    );
    const linkedCalls = ECOSYSTEM_CALLS.filter(
      (c) => c.personId === selectedPerson.id
    );

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              setSelectedPerson(null);
              setCallNotice(null);
            }}
            aria-label="Voltar aos contatos"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-medium text-zinc-300">Contato</span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold ${selectedPerson.avatarTint}`}
            >
              {selectedPerson.initials}
            </div>
            <h2 className="mt-3 text-base font-semibold text-zinc-100">
              {selectedPerson.name}
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              {selectedPerson.relation}
              {selectedPerson.blocked ? ' · Bloqueado' : ''}
            </p>
          </div>

          {/* Cross-app action shortcuts */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                chapterAudio.playDeadButtonClick();
                setCallNotice('Sem serviço de operadora. Não é possível ligar.');
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#15171c] py-2.5 text-[10.5px] text-zinc-300 hover:bg-white/10"
            >
              <Phone className="h-4 w-4 text-zinc-300" />
              <span>Ligar</span>
            </button>

            <button
              type="button"
              disabled={!linkedSms}
              onClick={() => {
                if (!linkedSms) return;
                chapterAudio.playUiTap();
                onNavigate({ appId: 'messages', targetId: linkedSms.id });
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#15171c] py-2.5 text-[10.5px] text-zinc-300 hover:bg-white/10 disabled:opacity-35"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Mensagens</span>
            </button>

            <button
              type="button"
              disabled={!linkedPulso}
              onClick={() => {
                if (!linkedPulso) return;
                chapterAudio.playUiTap();
                onNavigate({ appId: 'pulso', targetId: linkedPulso.id });
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#15171c] py-2.5 text-[10.5px] text-zinc-300 hover:bg-white/10 disabled:opacity-35"
            >
              <MessageCircle className="h-4 w-4 text-teal-400" />
              <span>PulsoChat</span>
            </button>
          </div>

          {callNotice && (
            <p
              role="status"
              className="rounded-xl border border-[#752B32]/60 bg-[#1d1113] px-3 py-2 text-center text-[11px] text-rose-200"
            >
              {callNotice}
            </p>
          )}

          <div className="space-y-2.5 rounded-2xl border border-white/8 bg-[#15171c] p-3.5 text-xs">
            <div>
              <p className="text-[10px] text-zinc-500">celular</p>
              <p className="mt-0.5 font-mono text-zinc-100 tabular-nums">
                {selectedPerson.phone}
              </p>
            </div>
            {selectedPerson.email && (
              <div className="border-t border-white/5 pt-2.5">
                <p className="text-[10px] text-zinc-500">e-mail</p>
                <p className="mt-0.5 text-zinc-200">{selectedPerson.email}</p>
              </div>
            )}
            {selectedPerson.handle && (
              <div className="border-t border-white/5 pt-2.5">
                <p className="text-[10px] text-zinc-500">usuário</p>
                <p className="mt-0.5 font-mono text-zinc-300">
                  {selectedPerson.handle}
                </p>
              </div>
            )}
            {selectedPerson.notes && (
              <div className="border-t border-white/5 pt-2.5">
                <p className="text-[10px] text-zinc-500">notas</p>
                <p className="mt-0.5 leading-5 text-zinc-300">
                  {selectedPerson.notes}
                </p>
              </div>
            )}
          </div>

          {linkedCalls.length > 0 && (
            <div className="rounded-2xl border border-white/8 bg-[#15171c] p-3.5">
              <p className="mb-2 text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                Ligações recentes
              </p>
              <div className="space-y-2">
                {linkedCalls.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span
                      className={
                        c.kind === 'missed' ? 'text-rose-300' : 'text-zinc-300'
                      }
                    >
                      {c.dateLabel} · {c.timeLabel}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {c.durationLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="app-phone" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBackHome}
            aria-label="Voltar para início"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-zinc-100">Telefone</h2>
        </div>
        <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
          {PHONE_CONTACTS.length} contatos
        </span>
      </div>

      {/* Sub-tabs */}
      <div className="grid grid-cols-4 border-b border-white/8 bg-[#111318] px-2 py-1.5 text-[11px]">
        {(
          [
            ['recents', 'Recentes'],
            ['missed', 'Perdidas'],
            ['contacts', 'Contatos'],
            ['voicemail', 'Voz'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              setTab(id);
            }}
            className={`rounded-lg py-1.5 font-medium transition-colors ${
              tab === id
                ? 'bg-white/12 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {(tab === 'recents' || tab === 'missed') && (
          <div className="divide-y divide-white/6 px-4">
            {displayedCalls.map((call) => (
              <button
                key={call.id}
                type="button"
                onClick={() => openPersonById(call.personId)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-white/[0.03]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {call.kind === 'missed' ? (
                    <PhoneMissed className="h-4 w-4 shrink-0 text-rose-400" />
                  ) : call.kind === 'outgoing' ? (
                    <PhoneOutgoing className="h-4 w-4 shrink-0 text-zinc-400" />
                  ) : (
                    <PhoneIncoming className="h-4 w-4 shrink-0 text-emerald-400" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`truncate text-xs font-medium ${
                        call.kind === 'missed' ? 'text-rose-300' : 'text-zinc-100'
                      }`}
                    >
                      {call.displayName}
                    </p>
                    <p className="text-[10.5px] text-zinc-500">
                      {call.durationLabel} · {call.dateLabel}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-zinc-500 tabular-nums">
                  {call.timeLabel}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === 'contacts' && (
          <div className="px-4 py-3">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                placeholder="Buscar nos 26 contatos..."
                className="h-9 w-full rounded-xl border border-white/8 bg-[#15171c] pr-3 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div className="divide-y divide-white/6">
              {filteredContacts.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    setSelectedPerson(person);
                  }}
                  className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-white/[0.03]"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${person.avatarTint}`}
                  >
                    {person.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-100">
                      {person.name}
                    </p>
                    <p className="truncate text-[10.5px] text-zinc-500">
                      {person.relation}
                    </p>
                  </div>
                </button>
              ))}
              {filteredContacts.length === 0 && (
                <p className="py-8 text-center text-xs text-zinc-500">
                  Nenhum contato encontrado.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'voicemail' && (
          <div className="space-y-3 p-4">
            {ECOSYSTEM_VOICEMAILS.map((vm) => {
              const isPlaying = playingVmId === vm.id;
              return (
                <div
                  key={vm.id}
                  className="rounded-2xl border border-white/10 bg-[#15171c] p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Voicemail className="h-4 w-4 text-sky-400" />
                      <div>
                        <p className="text-xs font-semibold text-zinc-100">
                          {vm.displayName}
                        </p>
                        <p className="font-mono text-[10px] text-zinc-500">
                          {vm.timeLabel} · 0:{String(vm.durationSec).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        chapterAudio.unlock();
                        chapterAudio.playUiTap();
                        setPlayingVmId(isPlaying ? null : vm.id);
                      }}
                      aria-label={
                        isPlaying ? 'Pausar recado de voz' : 'Reproduzir recado de voz'
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-zinc-100 hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5 translate-x-[1px]" />
                      )}
                    </button>
                  </div>

                  {/* Subtle progress bar when playing */}
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full bg-sky-400 transition-all duration-1000 ${
                        isPlaying ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>

                  <p className="mt-2.5 text-[11.5px] leading-5 italic text-zinc-300">
                    {vm.transcriptPreview}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MENSAGENS (SMS) & PULSOCHAT (FICTITIOUS MESSENGER)
// ============================================================================

interface MessagingAppProps {
  mode: 'sms' | 'pulso';
  initialThreadId?: string;
  offline: boolean;
  onNavigate: (link: OsDeepLink) => void;
  onBackHome: () => void;
}

export function MessagingApp({
  mode,
  initialThreadId,
  offline,
  onNavigate,
  onBackHome,
}: MessagingAppProps) {
  const allThreads = useMemo(
    () => ECOSYSTEM_CHATS.filter((c) => c.app === mode),
    [mode]
  );

  const [selectedThread, setSelectedThread] = useState<EcosystemChatThread | null>(
    () => allThreads.find((t) => t.id === initialThreadId) ?? null
  );
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [replyNotice, setReplyNotice] = useState<string | null>(null);

  const archivedCount = allThreads.filter((t) => t.archived).length;

  const visibleThreads = useMemo(() => {
    const q = normalizeSearchText(query);
    return allThreads.filter((t) => {
      if (!q && Boolean(t.archived) !== showArchived) return false;
      if (!q) return true;
      return normalizeSearchText(
        `${t.title} ${t.preview} ${t.messages.map((m) => m.text).join(' ')}`
      ).includes(q);
    });
  }, [allThreads, query, showArchived]);

  const accentBubble =
    mode === 'pulso'
      ? 'bg-emerald-900/85 text-emerald-50 border border-emerald-700/40'
      : 'bg-sky-700/85 text-white';

  return (
    <div
      data-testid={mode === 'pulso' ? 'app-pulso' : 'app-messages'}
      className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              if (selectedThread) {
                setSelectedThread(null);
                setReplyNotice(null);
              } else {
                onBackHome();
              }
            }}
            aria-label="Voltar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-zinc-100">
              {selectedThread
                ? selectedThread.title
                : mode === 'pulso'
                  ? 'PulsoChat'
                  : 'Mensagens'}
            </h2>
            {selectedThread?.subtitle && (
              <p className="truncate text-[10px] text-zinc-500">
                {selectedThread.subtitle}
              </p>
            )}
          </div>
        </div>

        {selectedThread?.personId && (
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              onNavigate({ appId: 'phone', targetId: selectedThread.personId });
            }}
            aria-label="Abrir ficha do contato"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-zinc-300 hover:bg-white/15"
          >
            <User className="h-4 w-4" />
          </button>
        )}
      </div>

      {!selectedThread ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conversas..."
                className="h-9 w-full rounded-xl border border-white/8 bg-[#15171c] pr-3 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>

            {archivedCount > 0 && !query.trim() && (
              <button
                type="button"
                data-testid="toggle-archived-chats"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setShowArchived((prev) => !prev);
                }}
                className="mt-2.5 flex w-full items-center justify-between rounded-xl border border-white/8 bg-[#15171c] px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Archive className="h-3.5 w-3.5 text-zinc-400" />
                  {showArchived ? 'Voltar às conversas ativas' : 'Conversas arquivadas'}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  {archivedCount}
                </span>
              </button>
            )}
          </div>

          <div className="flex-1 divide-y divide-white/6 overflow-y-auto px-4">
            {visibleThreads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                data-testid={`chat-thread-${thread.id}`}
                onClick={() => {
                  chapterAudio.playUiTap();
                  setSelectedThread(thread);
                }}
                className="flex w-full items-start justify-between gap-3 py-3 text-left hover:bg-white/[0.03]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-zinc-100">
                      {thread.title}
                    </span>
                    {thread.archived && (
                      <span className="rounded bg-white/8 px-1.5 py-0.5 text-[9px] text-zinc-400">
                        Arquivada
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11.5px] text-zinc-400">
                    {thread.preview}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                    {thread.lastTime}
                  </span>
                  {thread.unreadCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9.5px] font-semibold text-white">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}

            {visibleThreads.length === 0 && (
              <p className="py-10 text-center text-xs text-zinc-500">
                Nenhuma conversa encontrada.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
            {selectedThread.messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.dateLabel && (
                  <p className="py-1 text-center font-mono text-[10px] text-zinc-500">
                    {msg.dateLabel}
                  </p>
                )}
                <div
                  className={`flex flex-col ${
                    msg.sender === 'leticia' ? 'items-end' : 'items-start'
                  }`}
                >
                  {msg.senderName && (
                    <span className="mb-0.5 px-1 text-[10px] font-medium text-zinc-400">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`max-w-[84%] rounded-2xl px-3.5 py-2 text-xs leading-5 ${
                      msg.deletedPlaceholder
                        ? 'border border-dashed border-zinc-700 bg-zinc-900/60 italic text-zinc-500'
                        : msg.sender === 'leticia'
                          ? accentBubble
                          : 'border border-white/8 bg-[#171920] text-zinc-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-0.5 flex items-center gap-1 px-1 font-mono text-[9.5px] text-zinc-500 tabular-nums">
                    {msg.time}
                    {msg.sender === 'leticia' &&
                      (msg.status === 'read' ? (
                        <CheckCheck className="h-3 w-3 text-sky-400" />
                      ) : (
                        <Check className="h-3 w-3 text-zinc-500" />
                      ))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Read-only forensic composer with authentic offline feedback */}
          <div className="border-t border-white/10 bg-[#111318] px-3 py-2.5">
            {replyNotice && (
              <p className="mb-1.5 text-center text-[10px] text-zinc-400">
                {replyNotice}
              </p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  chapterAudio.playDeadButtonClick();
                  setReplyNotice(
                    offline
                      ? 'Modo Avião ativo — não é possível enviar mensagens.'
                      : 'Sem chip de operadora — envio desativado no modo perícia.'
                  );
                }}
                className="flex h-9 flex-1 items-center rounded-full border border-white/10 bg-[#181a20] px-3.5 text-left text-xs text-zinc-500"
              >
                Mensagem...
              </button>
              <button
                type="button"
                aria-label="Enviar mensagem"
                onClick={() => {
                  chapterAudio.playDeadButtonClick();
                  setReplyNotice(
                    'Envio bloqueado: aparelho em análise sem conexão ativa.'
                  );
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-zinc-400"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CORREIO (E-MAIL — Entrada, Enviados, Rascunhos, Spam, Lixeira)
// ============================================================================

interface EmailAppProps {
  initialEmailId?: string;
  offline: boolean;
  onNavigate: (link: OsDeepLink) => void;
  onBackHome: () => void;
}

export function EmailApp({
  initialEmailId,
  offline,
  onNavigate,
  onBackHome,
}: EmailAppProps) {
  const [folder, setFolder] = useState<EmailRecord['folder']>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(
    () => ECOSYSTEM_EMAILS.find((e) => e.id === initialEmailId) ?? null
  );
  const [query, setQuery] = useState('');

  const filteredEmails = useMemo(() => {
    const q = normalizeSearchText(query);
    return ECOSYSTEM_EMAILS.filter((e) => {
      if (!q && e.folder !== folder) return false;
      if (!q) return true;
      return normalizeSearchText(
        `${e.fromName} ${e.subject} ${e.body.join(' ')}`
      ).includes(q);
    });
  }, [folder, query]);

  return (
    <div data-testid="app-email" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              if (selectedEmail) setSelectedEmail(null);
              else onBackHome();
            }}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-zinc-100">Correio</h2>
        </div>
        {offline && (
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
            Offline
          </span>
        )}
      </div>

      {!selectedEmail ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Folder pills */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-white/8 bg-[#111318] px-3 py-2 text-[11px]">
            {(
              [
                ['inbox', 'Entrada', Inbox],
                ['sent', 'Enviados', Send],
                ['drafts', 'Rascunhos', Mail],
                ['spam', 'Spam', ShieldAlert],
                ['trash', 'Lixeira', Trash2],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setFolder(id);
                }}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium ${
                  folder === id
                    ? 'bg-white/14 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="px-4 pt-3 pb-1.5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar e-mails..."
                className="h-9 w-full rounded-xl border border-white/8 bg-[#15171c] pr-3 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 divide-y divide-white/6 overflow-y-auto px-4">
            {filteredEmails.map((em) => (
              <button
                key={em.id}
                type="button"
                data-testid={`email-row-${em.id}`}
                onClick={() => {
                  chapterAudio.playUiTap();
                  setSelectedEmail(em);
                }}
                className="flex w-full flex-col gap-0.5 py-3 text-left hover:bg-white/[0.03]"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-zinc-100">
                    {em.unread && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    )}
                    <span className="truncate">{em.fromName}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500 tabular-nums">
                    {em.dateLabel}
                  </span>
                </div>
                <p className="truncate text-xs text-zinc-200">{em.subject}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="line-clamp-1 text-[11px] text-zinc-500">
                    {em.preview}
                  </p>
                  {em.attachment && (
                    <Paperclip className="h-3 w-3 shrink-0 text-zinc-400" />
                  )}
                </div>
              </button>
            ))}
            {filteredEmails.length === 0 && (
              <p className="py-10 text-center text-xs text-zinc-500">
                Pasta vazia.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100">
              {selectedEmail.subject}
            </h3>
            <p className="mt-1.5 text-xs text-zinc-300">
              {selectedEmail.fromName}{' '}
              <span className="text-zinc-500">
                &lt;{selectedEmail.fromAddress}&gt;
              </span>
            </p>
            <p className="mt-0.5 font-mono text-[10.5px] text-zinc-500 tabular-nums">
              Para: {selectedEmail.toAddress} · {selectedEmail.dateLabel} às{' '}
              {selectedEmail.timeLabel}
            </p>
          </div>

          <div className="space-y-3 text-xs leading-6 text-zinc-200">
            {selectedEmail.body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {selectedEmail.attachment && (
            <button
              type="button"
              onClick={() => {
                if (!selectedEmail.attachment?.fileId) return;
                chapterAudio.playUiTap();
                onNavigate({
                  appId: 'files',
                  targetId: selectedEmail.attachment.fileId,
                });
              }}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#15171c] px-3.5 py-3 text-left hover:border-zinc-600"
            >
              <div className="flex items-center gap-2.5">
                <Paperclip className="h-4 w-4 text-zinc-400" />
                <div>
                  <p className="text-xs font-medium text-zinc-100">
                    {selectedEmail.attachment.name}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {selectedEmail.attachment.sizeLabel} · Abrir em Arquivos
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
