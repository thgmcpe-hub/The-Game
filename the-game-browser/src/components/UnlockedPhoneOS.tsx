import { useState } from 'react';
import {
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Zap,
} from 'lucide-react';
import { CANON_PROFILE, GENERATED_ASSETS } from '../game/canonConfig';
import {
  PHONE_CALLS,
  PHONE_MESSAGES,
  PHONE_NOTES,
  PHONE_PHOTOS,
  type GalleryPhoto,
  type MessageThread,
  type NoteEntry,
} from '../game/phoneContent';

type PhoneAppId = 'home' | 'messages' | 'photos' | 'notes' | 'calls';

interface UnlockedPhoneOSProps {
  usbConnected: boolean;
}

/**
 * State E — Acesso autorizado.
 * Beginning of the real exploration inside Letícia's unlocked smartphone.
 */
export function UnlockedPhoneOS({ usbConnected }: UnlockedPhoneOSProps) {
  const [activeApp, setActiveApp] = useState<PhoneAppId>('home');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteEntry | null>(null);
  const [wallpaperBroken, setWallpaperBroken] = useState(false);
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});

  const goHome = () => {
    setActiveApp('home');
    setSelectedThread(null);
    setSelectedPhoto(null);
    setSelectedNote(null);
  };

  return (
    <div
      data-testid="unlocked-phone-os"
      className="relative flex h-full w-full flex-col overflow-hidden bg-[#0a0c10] text-zinc-100 select-none"
    >
      {/* Wallpaper underneath home screen */}
      {activeApp === 'home' && !wallpaperBroken && (
        <>
          <img
            src={GENERATED_ASSETS.lockWallpaper}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => setWallpaperBroken(true)}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/72 via-black/48 to-black/84"
          />
        </>
      )}

      {/* Top OS Status Bar */}
      <div className="relative z-20 flex shrink-0 items-center justify-between px-5 pt-3 pb-2 text-[11px] font-medium text-zinc-200/90 tabular-nums">
        <span>{CANON_PROFILE.lockClockTime}</span>
        <div className="flex items-center gap-1.5">
          <span>100%</span>
          <span className="relative inline-flex h-3 w-5 items-center rounded-[3px] border border-zinc-300/75 p-[1.5px]">
            <span className="h-full w-full rounded-[1px] bg-[#30d158]" />
            {usbConnected && (
              <Zap className="absolute -right-2.5 h-2.5 w-2.5 fill-zinc-200 text-zinc-200" />
            )}
          </span>
        </div>
      </div>

      {/* Main Screen Content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeApp === 'home' && (
          <div className="flex flex-1 flex-col justify-between px-5 pt-6 pb-4">
            {/* Minimalist clock & date header */}
            <div>
              <p className="text-3xl font-light tracking-tight text-zinc-50 tabular-nums">
                {CANON_PROFILE.lockClockTime}
              </p>
              <p className="mt-1 text-xs text-zinc-300/80">
                {CANON_PROFILE.lockClockDate}
              </p>
              <p className="mt-4 truncate border-t border-white/10 pt-3 font-mono text-[10px] text-zinc-400">
                Sem serviço · Sincronizado em 18 nov
              </p>
            </div>

            {/* App Grid */}
            <div className="grid grid-cols-2 gap-3.5 pb-4">
              <button
                type="button"
                onClick={() => setActiveApp('messages')}
                className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/75 p-4 text-left transition-colors hover:bg-zinc-800/85 focus-visible:outline-1 focus-visible:outline-zinc-300"
              >
                <div className="flex w-full items-center justify-between">
                  <MessageSquare className="h-5 w-5 text-zinc-200" />
                  <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                    2
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Mensagens</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    3 conversas recentes
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveApp('photos')}
                className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/75 p-4 text-left transition-colors hover:bg-zinc-800/85 focus-visible:outline-1 focus-visible:outline-zinc-300"
              >
                <div className="flex w-full items-center justify-between">
                  <ImageIcon className="h-5 w-5 text-zinc-200" />
                  <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                    {PHONE_PHOTOS.length}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Fotos</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Câmera recente
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveApp('notes')}
                className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/75 p-4 text-left transition-colors hover:bg-zinc-800/85 focus-visible:outline-1 focus-visible:outline-zinc-300"
              >
                <div className="flex w-full items-center justify-between">
                  <FileText className="h-5 w-5 text-zinc-200" />
                  <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                    {PHONE_NOTES.length}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Notas</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Anotações pessoais
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveApp('calls')}
                className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/75 p-4 text-left transition-colors hover:bg-zinc-800/85 focus-visible:outline-1 focus-visible:outline-zinc-300"
              >
                <div className="flex w-full items-center justify-between">
                  <Phone className="h-5 w-5 text-zinc-200" />
                  <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                    {PHONE_CALLS.length}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Chamadas</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Registro recente
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES APP */}
        {activeApp === 'messages' && (
          <div className="flex min-h-0 flex-1 flex-col bg-[#0d1015]">
            <div className="flex items-center gap-2 border-b border-zinc-800/90 px-3 py-2.5">
              <button
                type="button"
                onClick={() => (selectedThread ? setSelectedThread(null) : goHome())}
                aria-label="Voltar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="truncate text-sm font-medium text-zinc-100">
                {selectedThread ? selectedThread.contactName : 'Mensagens'}
              </h2>
            </div>

            {!selectedThread ? (
              <div className="flex-1 divide-y divide-zinc-800/70 overflow-y-auto px-4">
                {PHONE_MESSAGES.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThread(thread)}
                    className="flex w-full flex-col gap-1 py-3.5 text-left transition-colors hover:bg-zinc-900/60"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium text-zinc-100">
                        {thread.contactName}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-zinc-500 tabular-nums">
                        {thread.timestamp}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-xs text-zinc-400">
                      {thread.preview}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {selectedThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'leticia' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                        msg.sender === 'leticia'
                          ? 'bg-zinc-700/80 text-zinc-100'
                          : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 px-1 font-mono text-[10px] text-zinc-500 tabular-nums">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PHOTOS APP */}
        {activeApp === 'photos' && (
          <div className="flex min-h-0 flex-1 flex-col bg-[#0d1015]">
            <div className="flex items-center gap-2 border-b border-zinc-800/90 px-3 py-2.5">
              <button
                type="button"
                onClick={() => (selectedPhoto ? setSelectedPhoto(null) : goHome())}
                aria-label="Voltar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="truncate text-sm font-medium text-zinc-100">
                {selectedPhoto ? selectedPhoto.dateLabel : 'Fotos'}
              </h2>
            </div>

            {!selectedPhoto ? (
              <div className="grid flex-1 grid-cols-2 content-start gap-2.5 overflow-y-auto p-4">
                {PHONE_PHOTOS.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    aria-label={`Abrir fotografia de ${photo.dateLabel}`}
                    className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left focus-visible:outline-1 focus-visible:outline-zinc-300"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                      {!brokenPhotos[photo.id] ? (
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenPhotos((prev) => ({ ...prev, [photo.id]: true }))
                          }
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-600">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <p className="px-2.5 py-2 font-mono text-[10px] text-zinc-400 tabular-nums">
                      {photo.dateLabel}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
                  {!brokenPhotos[selectedPhoto.id] ? (
                    <img
                      src={selectedPhoto.src}
                      alt={selectedPhoto.alt}
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenPhotos((prev) => ({
                          ...prev,
                          [selectedPhoto.id]: true,
                        }))
                      }
                      className="w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-zinc-600">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-1 border-t border-zinc-800/80 pt-3 font-mono text-[11px] text-zinc-400 tabular-nums">
                  <p className="text-zinc-200">{selectedPhoto.locationLabel}</p>
                  <p>
                    {selectedPhoto.dateLabel} · {selectedPhoto.resolution}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOTES APP */}
        {activeApp === 'notes' && (
          <div className="flex min-h-0 flex-1 flex-col bg-[#0d1015]">
            <div className="flex items-center gap-2 border-b border-zinc-800/90 px-3 py-2.5">
              <button
                type="button"
                onClick={() => (selectedNote ? setSelectedNote(null) : goHome())}
                aria-label="Voltar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="truncate text-sm font-medium text-zinc-100">
                {selectedNote ? selectedNote.title : 'Notas'}
              </h2>
            </div>

            {!selectedNote ? (
              <div className="flex-1 divide-y divide-zinc-800/70 overflow-y-auto px-4">
                {PHONE_NOTES.map((note) => (
                  <button
                    key={note.id}
                    type="button"
                    disabled={note.locked}
                    onClick={() => setSelectedNote(note)}
                    className="flex w-full flex-col gap-1 py-3.5 text-left transition-colors hover:bg-zinc-900/60 disabled:opacity-55"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-zinc-100">
                        {note.title}
                      </span>
                      {note.locked ? (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      ) : (
                        <span className="shrink-0 font-mono text-[10px] text-zinc-500 tabular-nums">
                          {note.updatedAt}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-zinc-400">
                      {note.excerpt}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="font-mono text-[11px] text-zinc-500 tabular-nums">
                  {selectedNote.updatedAt}
                </p>
                <p className="mt-4 font-serif text-sm leading-7 text-zinc-200">
                  {selectedNote.body}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CALLS APP */}
        {activeApp === 'calls' && (
          <div className="flex min-h-0 flex-1 flex-col bg-[#0d1015]">
            <div className="flex items-center gap-2 border-b border-zinc-800/90 px-3 py-2.5">
              <button
                type="button"
                onClick={goHome}
                aria-label="Voltar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-sm font-medium text-zinc-100">Chamadas</h2>
            </div>

            <div className="flex-1 divide-y divide-zinc-800/70 overflow-y-auto px-4">
              {PHONE_CALLS.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {call.kind === 'missed' ? (
                      <PhoneMissed className="h-4 w-4 shrink-0 text-red-400/80" />
                    ) : call.kind === 'outgoing' ? (
                      <PhoneOutgoing className="h-4 w-4 shrink-0 text-zinc-400" />
                    ) : (
                      <PhoneIncoming className="h-4 w-4 shrink-0 text-zinc-400" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-medium ${
                          call.kind === 'missed'
                            ? 'text-red-300/90'
                            : 'text-zinc-100'
                        }`}
                      >
                        {call.contact}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {call.durationLabel}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-zinc-500 tabular-nums">
                    {call.timeLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom OS Home Indicator Bar */}
      <div className="relative z-20 flex shrink-0 justify-center bg-black/50 py-2.5">
        <button
          type="button"
          onClick={goHome}
          aria-label="Voltar para a tela inicial do celular"
          className="flex h-5 w-32 items-center justify-center focus-visible:outline-1 focus-visible:outline-zinc-400"
        >
          <span className="h-1 w-24 rounded-full bg-zinc-300/45 transition-colors hover:bg-zinc-200/80" />
        </button>
      </div>
    </div>
  );
}
