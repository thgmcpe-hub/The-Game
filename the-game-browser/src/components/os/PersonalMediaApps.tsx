import { useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  EyeOff,
  FileText,
  Folder,
  Heart,
  Image as ImageIcon,
  Info,
  Lock,
  Search,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { chapterAudio } from '../../game/audio';
import {
  ECOSYSTEM_CALENDAR_EVENTS,
  ECOSYSTEM_FILES,
  ECOSYSTEM_NOTES,
  ECOSYSTEM_PHOTOS,
  LETICIA_PORTRAIT_TOKEN,
  normalizeSearchText,
  type NoteRecord,
  type PhoneFileRecord,
  type PhotoRecord,
} from '../../game/phoneEcosystem';
import evidenceLeticiaPortrait from '../../assets/images/evidence_leticia_portrait.jpg';

function resolvePhotoSrc(src: string): string {
  return src === LETICIA_PORTRAIT_TOKEN ? evidenceLeticiaPortrait : src;
}

// ============================================================================
// FOTOS (Recentes, Favoritas, Ocultas [bloqueada], Apagadas + Zoom & EXIF)
// ============================================================================

export function PhotosApp({ onBackHome }: { onBackHome: () => void }) {
  const [albumTab, setAlbumTab] = useState<'Recentes' | 'Favoritas' | 'Ocultas' | 'Apagadas'>('Recentes');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const visiblePhotos = useMemo(() => {
    if (albumTab === 'Favoritas') {
      return ECOSYSTEM_PHOTOS.filter((p) => p.favorite);
    }
    if (albumTab === 'Apagadas') {
      return ECOSYSTEM_PHOTOS.filter((p) => p.album === 'Apagadas');
    }
    if (albumTab === 'Ocultas') {
      return [];
    }
    return ECOSYSTEM_PHOTOS.filter((p) => p.album !== 'Apagadas');
  }, [albumTab]);

  return (
    <div data-testid="app-photos" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              if (selectedPhoto) {
                setSelectedPhoto(null);
                setZoomed(false);
                setShowMeta(false);
              } else {
                onBackHome();
              }
            }}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-zinc-100">
            {selectedPhoto ? `${selectedPhoto.dateLabel} · ${selectedPhoto.timeLabel}` : 'Fotos'}
          </h2>
        </div>

        {selectedPhoto && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                chapterAudio.playUiTap();
                setZoomed((z) => !z);
              }}
              aria-label={zoomed ? 'Reduzir zoom' : 'Ampliar foto'}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
            >
              {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                chapterAudio.playUiTap();
                setShowMeta((m) => !m);
              }}
              aria-label="Detalhes da fotografia"
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                showMeta ? 'bg-white/15 text-white' : 'text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {!selectedPhoto ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-4 border-b border-white/8 bg-[#111318] px-2 py-1.5 text-[11px]">
            {(
              [
                ['Recentes', ImageIcon],
                ['Favoritas', Heart],
                ['Ocultas', EyeOff],
                ['Apagadas', Trash2],
              ] as const
            ).map(([label, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setAlbumTab(label);
                }}
                className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-medium ${
                  albumTab === label
                    ? 'bg-white/12 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {albumTab === 'Ocultas' ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <Lock className="h-6 w-6 text-zinc-500" />
              <p className="text-xs font-medium text-zinc-200">
                Álbum Oculto protegido
              </p>
              <p className="text-[11px] leading-5 text-zinc-500">
                A autenticação biométrica não está disponível no modo perícia.
              </p>
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-2 content-start gap-2.5 overflow-y-auto p-3.5">
              {visiblePhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    setSelectedPhoto(photo);
                  }}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-[#15171c] text-left"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                    <img
                      src={resolvePhotoSrc(photo.src)}
                      alt={photo.alt}
                      loading="lazy"
                      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        photo.grayscale ? 'grayscale' : ''
                      }`}
                    />
                    {photo.favorite && (
                      <Heart className="absolute right-2 bottom-2 h-3.5 w-3.5 fill-white/85 text-white" />
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="font-mono text-[10px] text-zinc-300 tabular-nums">
                      {photo.dateLabel} · {photo.timeLabel}
                    </p>
                    <p className="truncate text-[10px] text-zinc-500">
                      {photo.locationLabel ?? 'Sem dados de local'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between overflow-y-auto bg-black p-4">
          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black">
            <img
              src={resolvePhotoSrc(selectedPhoto.src)}
              alt={selectedPhoto.alt}
              className={`max-h-[340px] w-full object-contain transition-transform duration-300 ${
                zoomed ? 'scale-150' : 'scale-100'
              } ${selectedPhoto.grayscale ? 'grayscale' : ''}`}
            />
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-[#15171c] p-3 font-mono text-[10.5px] leading-5 text-zinc-300 tabular-nums">
            <p className="text-zinc-100">
              {selectedPhoto.locationLabel ?? 'Localização não registrada no arquivo'}
            </p>
            <p className="text-zinc-400">
              {selectedPhoto.dateLabel} às {selectedPhoto.timeLabel} · {selectedPhoto.resolution}
            </p>
            {showMeta && selectedPhoto.cameraLabel && (
              <p className="mt-1 text-zinc-500">{selectedPhoto.cameraLabel}</p>
            )}
            {selectedPhoto.caption && (
              <p className="mt-1 text-amber-300/90">{selectedPhoto.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NOTAS (Pastas, busca, nota protegida com feedback de senha)
// ============================================================================

export function NotesApp({
  initialNoteId,
  onBackHome,
}: {
  initialNoteId?: string;
  onBackHome: () => void;
}) {
  const [selectedNote, setSelectedNote] = useState<NoteRecord | null>(
    () => ECOSYSTEM_NOTES.find((n) => n.id === initialNoteId && !n.locked) ?? null
  );
  const [lockedNotePrompt, setLockedNotePrompt] = useState<NoteRecord | null>(null);
  const [lockAttempt, setLockAttempt] = useState('');
  const [lockError, setLockError] = useState(false);
  const [query, setQuery] = useState('');

  const filteredNotes = useMemo(() => {
    const q = normalizeSearchText(query);
    if (!q) return ECOSYSTEM_NOTES;
    return ECOSYSTEM_NOTES.filter((n) =>
      normalizeSearchText(`${n.title} ${n.excerpt} ${n.body.join(' ')}`).includes(q)
    );
  }, [query]);

  return (
    <div data-testid="app-notes" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            if (selectedNote || lockedNotePrompt) {
              setSelectedNote(null);
              setLockedNotePrompt(null);
              setLockAttempt('');
              setLockError(false);
            } else {
              onBackHome();
            }
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="truncate text-sm font-semibold text-zinc-100">
          {selectedNote ? selectedNote.title : lockedNotePrompt ? lockedNotePrompt.title : 'Notas'}
        </h2>
      </div>

      {lockedNotePrompt ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <Lock className="h-7 w-7 text-amber-300/80" />
          <p className="text-xs font-medium text-zinc-100">Nota protegida</p>
          <p className="text-[11px] leading-5 text-zinc-400">
            {lockedNotePrompt.lockHint}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              chapterAudio.playPasscodeError();
              setLockError(true);
              setLockAttempt('');
            }}
            className="mt-2 w-full max-w-[240px] space-y-2"
          >
            <input
              type="password"
              value={lockAttempt}
              onChange={(e) => {
                setLockAttempt(e.target.value);
                setLockError(false);
              }}
              placeholder="Digite a senha da nota"
              className="h-10 w-full rounded-xl border border-white/12 bg-[#15171c] px-3 text-center text-xs text-zinc-100 focus:border-amber-400 focus:outline-none"
            />
            {lockError && (
              <p className="text-[11px] text-rose-400">
                Senha incorreta. Acesso negado.
              </p>
            )}
            <button
              type="submit"
              className="h-9 w-full rounded-xl bg-amber-500/20 text-xs font-medium text-amber-200 hover:bg-amber-500/30"
            >
              Desbloquear
            </button>
          </form>
        </div>
      ) : !selectedNote ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar notas..."
                className="h-9 w-full rounded-xl border border-white/8 bg-[#15171c] pr-3 pl-8 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 divide-y divide-white/6 overflow-y-auto px-4">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  if (note.locked) setLockedNotePrompt(note);
                  else setSelectedNote(note);
                }}
                className="flex w-full flex-col gap-1 py-3 text-left hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-zinc-100">
                    {note.title}
                  </span>
                  {note.locked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400/80" />
                  ) : (
                    <span className="shrink-0 font-mono text-[10px] text-zinc-500 tabular-nums">
                      {note.updatedAt}
                    </span>
                  )}
                </div>
                <p className="line-clamp-1 text-[11px] text-zinc-400">
                  {note.excerpt}
                </p>
                <span className="text-[9.5px] text-zinc-500">{note.folder}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="font-mono text-[10.5px] text-zinc-500 tabular-nums">
            {selectedNote.folder} · {selectedNote.updatedAt}
          </p>
          <div className="mt-4 space-y-3 font-sans text-[13.5px] leading-6 text-zinc-200">
            {selectedNote.body.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ARQUIVOS (Pastas & Leitor de PDFs Fictícios)
// ============================================================================

export function FilesApp({
  initialFileId,
  onBackHome,
}: {
  initialFileId?: string;
  onBackHome: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<PhoneFileRecord | null>(
    () => ECOSYSTEM_FILES.find((f) => f.id === initialFileId) ?? null
  );
  const [folder, setFolder] = useState<'Todos' | PhoneFileRecord['folder']>('Todos');

  const files =
    folder === 'Todos'
      ? ECOSYSTEM_FILES
      : ECOSYSTEM_FILES.filter((f) => f.folder === folder);

  return (
    <div data-testid="app-files" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            if (selectedFile) setSelectedFile(null);
            else onBackHome();
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="truncate text-sm font-semibold text-zinc-100">
          {selectedFile ? selectedFile.name : 'Arquivos'}
        </h2>
      </div>

      {!selectedFile ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex gap-1.5 overflow-x-auto border-b border-white/8 bg-[#111318] px-3 py-2 text-[11px]">
            {(['Todos', 'Documentos', 'Comprovantes', 'Trabalho'] as const).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    setFolder(f);
                  }}
                  className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 font-medium ${
                    folder === f
                      ? 'bg-sky-500/20 text-sky-200'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Folder className="h-3 w-3" />
                  <span>{f}</span>
                </button>
              )
            )}
          </div>

          <div className="flex-1 divide-y divide-white/6 overflow-y-auto px-4">
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                data-testid={`file-row-${file.id}`}
                onClick={() => {
                  chapterAudio.playUiTap();
                  setSelectedFile(file);
                }}
                className="flex w-full items-center gap-3 py-3 text-left hover:bg-white/[0.03]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-950/80 text-sky-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-100">
                    {file.name}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-500 tabular-nums">
                    {file.folder} · {file.sizeLabel} · {file.modifiedAt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-[#0f1117] p-4">
          <div className="rounded-xl border border-stone-300/20 bg-[#e8e4df] p-4 font-mono text-[11px] leading-6 text-stone-900 shadow-lg">
            <p className="mb-2 border-b border-stone-400/50 pb-1 text-[9.5px] tracking-widest text-stone-600 uppercase">
              VISUALIZAÇÃO · {selectedFile.extension} · {selectedFile.sizeLabel}
            </p>
            <div className="space-y-1.5">
              {selectedFile.lines.map((line, idx) => (
                <p key={idx} className={idx === 0 ? 'font-semibold' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CALENDÁRIO (Novembro 2026 + Agenda diária)
// ============================================================================

export function CalendarApp({ onBackHome }: { onBackHome: () => void }) {
  const [selectedDay, setSelectedDay] = useState<number>(19);
  const eventDays = new Set(ECOSYSTEM_CALENDAR_EVENTS.map((e) => e.day));
  const dayEvents = ECOSYSTEM_CALENDAR_EVENTS.filter((e) => e.day === selectedDay);

  return (
    <div data-testid="app-calendar" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBackHome}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-zinc-100">Novembro 2026</h2>
        </div>
        <CalendarIcon className="h-4 w-4 text-rose-400" />
      </div>

      <div className="border-b border-white/8 px-4 py-3">
        <div className="mb-2 grid grid-cols-7 text-center text-[10px] text-zinc-500">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center font-mono text-xs tabular-nums">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const hasEvent = eventDays.has(day);
            const active = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setSelectedDay(day);
                }}
                className={`relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full transition-colors ${
                  active
                    ? 'bg-rose-600 font-semibold text-white'
                    : day === 19
                      ? 'border border-rose-500/60 text-rose-300'
                      : 'text-zinc-300 hover:bg-white/10'
                }`}
              >
                <span>{day}</span>
                {hasEvent && !active && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        <p className="font-mono text-[10.5px] text-zinc-500 uppercase">
          {selectedDay} de novembro · compromissos
        </p>
        {dayEvents.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-500">
            Nenhum evento registrado neste dia.
          </p>
        ) : (
          dayEvents.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border-l-2 border-rose-500 bg-[#15171c] p-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-zinc-100">{ev.title}</p>
                <span className="font-mono text-[10.5px] text-zinc-400 tabular-nums">
                  {ev.timeLabel}
                </span>
              </div>
              {ev.location && (
                <p className="mt-0.5 text-[11px] text-zinc-400">{ev.location}</p>
              )}
              {ev.notes && (
                <p className="mt-1 text-[10.5px] italic text-zinc-500">
                  {ev.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
