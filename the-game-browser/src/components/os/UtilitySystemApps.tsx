import { useEffect, useState } from 'react';
import {
  BatteryCharging,
  Bell,
  Bookmark,
  ChevronLeft,
  Clock as ClockIcon,
  Compass,
  Delete,
  Globe,
  HardDrive,
  History,
  Mic,
  Pause,
  Plane,
  Play,
  Sun,
  Type,
  UserCheck,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { chapterAudio } from '../../game/audio';
import {
  ECOSYSTEM_BROWSER_HISTORY,
  ECOSYSTEM_VOICE_MEMOS,
  type BrowserHistoryRecord,
  type VoiceMemoRecord,
} from '../../game/phoneEcosystem';
import type { OsSystemSettings } from './OsTypes';

// ============================================================================
// AJUSTES (Funcional: Brilho, Som, Wi-Fi, Avião, Notificações, Texto, Bateria)
// ============================================================================

export function SettingsApp({
  usbConnected,
  settings,
  onUpdate,
  onBackHome,
}: {
  usbConnected: boolean;
  settings: OsSystemSettings;
  onUpdate: (patch: Partial<OsSystemSettings>) => void;
  onBackHome: () => void;
}) {
  return (
    <div data-testid="app-settings" className="flex min-h-0 flex-1 flex-col bg-[#0b0c10]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            onBackHome();
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-zinc-100">Ajustes</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-3.5 py-3.5">
        {/* Owner Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#15171c] p-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
            LV
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-100">
              Letícia Vasconcelos
            </p>
            <p className="truncate text-[11px] text-zinc-400">
              leticia.vasc@correio.br
            </p>
          </div>
        </div>

        {/* Connectivity */}
        <div className="divide-y divide-white/6 rounded-2xl border border-white/10 bg-[#15171c]">
          <label className="flex cursor-pointer items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-2.5 text-xs text-zinc-200">
              <Plane className="h-4 w-4 text-amber-400" />
              Modo Avião
            </span>
            <input
              type="checkbox"
              data-testid="settings-airplane-toggle"
              checked={settings.airplaneMode}
              onChange={(e) => {
                chapterAudio.playUiTap();
                const checked = e.target.checked;
                onUpdate({
                  airplaneMode: checked,
                  wifiEnabled: checked ? false : settings.wifiEnabled,
                });
              }}
              className="h-4 w-4 accent-amber-400"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-2.5 text-xs text-zinc-200">
              <Wifi className="h-4 w-4 text-sky-400" />
              Wi-Fi ({settings.wifiEnabled && !settings.airplaneMode ? 'Ativo' : 'Desligado'})
            </span>
            <input
              type="checkbox"
              data-testid="settings-wifi-toggle"
              checked={settings.wifiEnabled && !settings.airplaneMode}
              onChange={(e) => {
                chapterAudio.playUiTap();
                onUpdate({
                  wifiEnabled: e.target.checked,
                  airplaneMode: false,
                });
              }}
              className="h-4 w-4 accent-sky-400"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-2.5 text-xs text-zinc-200">
              <Volume2 className="h-4 w-4 text-zinc-300" />
              Sons do sistema
            </span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => {
                const next = e.target.checked;
                chapterAudio.setMuted(!next);
                if (next) chapterAudio.playUiTap();
                onUpdate({ soundEnabled: next });
              }}
              className="h-4 w-4 accent-zinc-200"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-2.5 text-xs text-zinc-200">
              <Bell className="h-4 w-4 text-rose-300" />
              Notificações na barra
            </span>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => {
                chapterAudio.playUiTap();
                onUpdate({ notificationsEnabled: e.target.checked });
              }}
              className="h-4 w-4 accent-zinc-200"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-2.5 text-xs text-zinc-200">
              <Type className="h-4 w-4 text-zinc-300" />
              Texto ampliado
            </span>
            <input
              type="checkbox"
              checked={settings.largeText}
              onChange={(e) => {
                chapterAudio.playUiTap();
                onUpdate({ largeText: e.target.checked });
              }}
              className="h-4 w-4 accent-zinc-200"
            />
          </label>
        </div>

        {/* Brightness */}
        <div className="rounded-2xl border border-white/10 bg-[#15171c] p-3.5">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-300">
            <span className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-200" />
              Brilho da tela
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              {settings.brightness}%
            </span>
          </div>
          <input
            type="range"
            min={45}
            max={100}
            value={settings.brightness}
            aria-label="Brilho nos ajustes"
            onChange={(e) => onUpdate({ brightness: Number(e.target.value) })}
            className="h-1.5 w-full cursor-pointer accent-zinc-200"
          />
        </div>

        {/* Battery & Storage */}
        <div className="divide-y divide-white/6 rounded-2xl border border-white/10 bg-[#15171c] text-xs">
          <div className="flex items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-2 text-zinc-300">
              <BatteryCharging className="h-4 w-4 text-emerald-400" />
              Bateria
            </span>
            <span className="font-mono text-[11px] text-zinc-400">
              100% {usbConnected ? '· USB conectado' : '· Estável'}
            </span>
          </div>
          <div className="space-y-2 px-3.5 py-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-300">
                <HardDrive className="h-4 w-4 text-zinc-400" />
                Armazenamento
              </span>
              <span className="font-mono text-[11px] text-zinc-400">
                48,2 GB de 128 GB
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className="w-[36%] bg-sky-500/80" />
              <div className="w-[24%] bg-emerald-500/80" />
              <div className="w-[18%] bg-amber-400/80" />
              <div className="w-[10%] bg-zinc-500" />
            </div>
            <p className="text-[10.5px] text-zinc-500">
              Fotos 18,4 GB · PulsoChat 11,6 GB · Arquivos 6,2 GB · Sistema 12,0 GB
            </p>
          </div>
          <div className="px-3.5 py-3">
            <div className="flex items-center gap-2 text-zinc-300">
              <UserCheck className="h-4 w-4 text-zinc-400" />
              Contas conectadas
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Correio · PulsoChat · Lume (@leticiavasc) · Banco Áurea · MercadoLocal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GRAVADOR (Áudios com progresso animado e resumo textual)
// ============================================================================

export function RecorderApp({ onBackHome }: { onBackHome: () => void }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const activeMemo: VoiceMemoRecord | undefined = ECOSYSTEM_VOICE_MEMOS.find(
    (m) => m.id === playingId
  );

  useEffect(() => {
    if (!activeMemo) {
      setElapsedSec(0);
      return;
    }
    const interval = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= activeMemo.durationSec) {
          setPlayingId(null);
          return 0;
        }
        return prev + 1;
      });
    }, 350);
    return () => window.clearInterval(interval);
  }, [activeMemo]);

  return (
    <div data-testid="app-recorder" className="flex min-h-0 flex-1 flex-col bg-[#0b0c10]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            onBackHome();
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <Mic className="h-4 w-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Gravador</h2>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3.5">
        {ECOSYSTEM_VOICE_MEMOS.map((memo) => {
          const isPlaying = playingId === memo.id;
          const pct = isPlaying
            ? Math.min(100, Math.round((elapsedSec / memo.durationSec) * 100))
            : 0;
          return (
            <div
              key={memo.id}
              className="rounded-2xl border border-white/10 bg-[#15171c] p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-100">
                    {memo.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                    {memo.dateLabel}
                    {memo.locationLabel ? ` · ${memo.locationLabel}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={isPlaying ? `Pausar ${memo.title}` : `Reproduzir ${memo.title}`}
                  onClick={() => {
                    chapterAudio.playUiTap();
                    if (isPlaying) {
                      setPlayingId(null);
                    } else {
                      setElapsedSec(0);
                      setPlayingId(memo.id);
                    }
                  }}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isPlaying
                      ? 'bg-[#752B32] text-white'
                      : 'bg-white/10 text-zinc-200 hover:bg-white/20'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Waveform progress bar */}
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-[#b6525c] transition-all duration-200"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                  0:{String(isPlaying ? elapsedSec : memo.durationSec).padStart(2, '0')}
                </span>
              </div>

              <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-400">
                {memo.summaryNote}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// NAVEGADOR VELA (Histórico, Favoritos, Leitor local e Estado Offline real)
// ============================================================================

export function BrowserApp({
  offline,
  onOpenSettings,
  onBackHome,
}: {
  offline: boolean;
  onOpenSettings: () => void;
  onBackHome: () => void;
}) {
  const [selectedPage, setSelectedPage] = useState<BrowserHistoryRecord | null>(null);
  const [filter, setFilter] = useState<'history' | 'bookmarks'>('history');

  const items =
    filter === 'bookmarks'
      ? ECOSYSTEM_BROWSER_HISTORY.filter((h) => h.bookmarked)
      : ECOSYSTEM_BROWSER_HISTORY;

  return (
    <div data-testid="app-browser" className="flex min-h-0 flex-1 flex-col bg-[#0b0c10]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            if (selectedPage) {
              setSelectedPage(null);
            } else {
              onBackHome();
            }
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-white/8 px-3 py-1.5 text-[11px] text-zinc-300">
          <Compass className="h-3.5 w-3.5 shrink-0 text-sky-400" />
          <span className="truncate font-mono">
            {selectedPage ? selectedPage.url : 'vela://historico'}
          </span>
        </div>
      </div>

      {offline ? (
        <div
          data-testid="browser-offline-state"
          className="flex flex-1 flex-col items-center justify-center px-6 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
            <WifiOff className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-100">
            Sem conexão com a internet
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
            O Modo Avião está ativado ou o Wi-Fi está desligado. Reative a rede na
            Central de Controle ou nos Ajustes para carregar páginas.
          </p>
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              onOpenSettings();
            }}
            className="mt-4 rounded-xl bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-white"
          >
            Abrir Ajustes
          </button>
        </div>
      ) : selectedPage ? (
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <span className="rounded-md bg-white/8 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            Cópia local · {selectedPage.timeLabel}
          </span>
          <h3 className="text-base font-semibold text-zinc-100">
            {selectedPage.title}
          </h3>
          <p className="font-mono text-[11px] text-sky-400">{selectedPage.url}</p>
          <div className="rounded-2xl border border-white/10 bg-[#15171c] p-4 text-xs leading-relaxed text-zinc-300">
            {selectedPage.snippet}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex gap-2 px-3.5 py-2.5">
            <button
              type="button"
              onClick={() => {
                chapterAudio.playUiTap();
                setFilter('history');
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
                filter === 'history'
                  ? 'bg-zinc-200 text-zinc-950'
                  : 'bg-white/6 text-zinc-400'
              }`}
            >
              <History className="h-3 w-3" />
              Histórico
            </button>
            <button
              type="button"
              onClick={() => {
                chapterAudio.playUiTap();
                setFilter('bookmarks');
              }}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
                filter === 'bookmarks'
                  ? 'bg-zinc-200 text-zinc-950'
                  : 'bg-white/6 text-zinc-400'
              }`}
            >
              <Bookmark className="h-3 w-3" />
              Favoritos
            </button>
          </div>

          <div className="flex-1 divide-y divide-white/6 overflow-y-auto px-3.5 pb-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setSelectedPage(item);
                }}
                className="flex w-full items-start gap-2.5 py-3 text-left hover:bg-white/4"
              >
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-sky-400/80" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-100">
                    {item.title}
                  </p>
                  <p className="truncate font-mono text-[10px] text-zinc-500">
                    {item.url} · {item.timeLabel}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CALCULADORA (Funcional estilo iOS escuro)
// ============================================================================

export function CalculatorApp({ onBackHome }: { onBackHome: () => void }) {
  const [display, setDisplay] = useState('0');
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const inputDigit = (d: string) => {
    chapterAudio.playUiTap();
    if (resetNext) {
      setDisplay(d === '.' ? '0.' : d);
      setResetNext(false);
      return;
    }
    if (d === '.' && display.includes('.')) return;
    setDisplay(display === '0' && d !== '.' ? d : `${display}${d}`.slice(0, 12));
  };

  const applyOperator = (op: '+' | '-' | '*' | '/') => {
    chapterAudio.playUiTap();
    setStored(parseFloat(display));
    setOperator(op);
    setResetNext(true);
  };

  const calculate = () => {
    chapterAudio.playUiTap();
    if (stored === null || !operator) return;
    const current = parseFloat(display);
    let result = current;
    if (operator === '+') result = stored + current;
    if (operator === '-') result = stored - current;
    if (operator === '*') result = stored * current;
    if (operator === '/') result = current === 0 ? 0 : stored / current;
    const formatted = Number.isInteger(result)
      ? String(result)
      : String(Number(result.toFixed(4)));
    setDisplay(formatted.slice(0, 12));
    setStored(null);
    setOperator(null);
    setResetNext(true);
  };

  const clear = () => {
    chapterAudio.playUiTap();
    setDisplay('0');
    setStored(null);
    setOperator(null);
    setResetNext(false);
  };

  const keys: Array<{ label: string; kind: 'fn' | 'op' | 'num'; action: () => void }> = [
    { label: 'AC', kind: 'fn', action: clear },
    {
      label: '+/-',
      kind: 'fn',
      action: () => {
        chapterAudio.playUiTap();
        setDisplay((v) => (v.startsWith('-') ? v.slice(1) : v === '0' ? '0' : `-${v}`));
      },
    },
    {
      label: '%',
      kind: 'fn',
      action: () => {
        chapterAudio.playUiTap();
        setDisplay(String(Number((parseFloat(display) / 100).toFixed(4))));
      },
    },
    { label: '÷', kind: 'op', action: () => applyOperator('/') },
    { label: '7', kind: 'num', action: () => inputDigit('7') },
    { label: '8', kind: 'num', action: () => inputDigit('8') },
    { label: '9', kind: 'num', action: () => inputDigit('9') },
    { label: '×', kind: 'op', action: () => applyOperator('*') },
    { label: '4', kind: 'num', action: () => inputDigit('4') },
    { label: '5', kind: 'num', action: () => inputDigit('5') },
    { label: '6', kind: 'num', action: () => inputDigit('6') },
    { label: '−', kind: 'op', action: () => applyOperator('-') },
    { label: '1', kind: 'num', action: () => inputDigit('1') },
    { label: '2', kind: 'num', action: () => inputDigit('2') },
    { label: '3', kind: 'num', action: () => inputDigit('3') },
    { label: '+', kind: 'op', action: () => applyOperator('+') },
    { label: '0', kind: 'num', action: () => inputDigit('0') },
    { label: ',', kind: 'num', action: () => inputDigit('.') },
    {
      label: 'DEL',
      kind: 'fn',
      action: () => {
        chapterAudio.playUiTap();
        setDisplay((v) => (v.length <= 1 ? '0' : v.slice(0, -1)));
      },
    },
    { label: '=', kind: 'op', action: calculate },
  ];

  return (
    <div data-testid="app-calculator" className="flex min-h-0 flex-1 flex-col bg-[#08090b]">
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            onBackHome();
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-zinc-200">Calculadora</h2>
      </div>

      <div className="flex flex-1 flex-col justify-end px-4 pb-5">
        <div
          data-testid="calc-display"
          className="mb-4 truncate text-right font-mono text-4xl font-light text-zinc-100 tabular-nums"
        >
          {display.replace('.', ',')}
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {keys.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={k.action}
              className={`flex h-13 items-center justify-center rounded-2xl text-base font-medium transition-transform active:scale-95 ${
                k.kind === 'op'
                  ? 'bg-amber-600/90 text-white hover:bg-amber-500'
                  : k.kind === 'fn'
                    ? 'bg-zinc-700/80 text-zinc-100 hover:bg-zinc-600'
                    : 'bg-[#1a1d24] text-zinc-100 hover:bg-[#242832]'
              }`}
            >
              {k.label === 'DEL' ? <Delete className="h-4 w-4" /> : k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RELÓGIO (Alarmes alternáveis)
// ============================================================================

export function ClockApp({ onBackHome }: { onBackHome: () => void }) {
  const [alarms, setAlarms] = useState([
    { id: 'al-1', time: '06:45', label: 'Trabalho · Seg a Sex', enabled: true },
    { id: 'al-2', time: '02:30', label: 'Despertador', enabled: false },
    { id: 'al-3', time: '10:30', label: 'Consulta Dr. Alberto', enabled: true },
    { id: 'al-4', time: '08:00', label: 'Fim de semana', enabled: false },
  ]);

  return (
    <div data-testid="app-clock" className="flex min-h-0 flex-1 flex-col bg-[#0b0c10]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            onBackHome();
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <ClockIcon className="h-4 w-4 text-zinc-300" />
          <h2 className="text-sm font-semibold text-zinc-100">Relógio</h2>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
        <div className="rounded-2xl border border-white/10 bg-[#15171c] p-4 text-center">
          <p className="font-mono text-3xl font-light text-zinc-100 tabular-nums">
            03:12
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            São Paulo · Quinta-feira, 19 nov
          </p>
        </div>

        <div className="divide-y divide-white/6 rounded-2xl border border-white/10 bg-[#15171c]">
          {alarms.map((alarm) => (
            <label
              key={alarm.id}
              className="flex cursor-pointer items-center justify-between px-4 py-3"
            >
              <div>
                <p
                  className={`font-mono text-xl font-light tabular-nums ${
                    alarm.enabled ? 'text-zinc-100' : 'text-zinc-500'
                  }`}
                >
                  {alarm.time}
                </p>
                <p className="text-[11px] text-zinc-400">{alarm.label}</p>
              </div>
              <input
                type="checkbox"
                checked={alarm.enabled}
                onChange={() => {
                  chapterAudio.playUiTap();
                  setAlarms((prev) =>
                    prev.map((a) =>
                      a.id === alarm.id ? { ...a, enabled: !a.enabled } : a
                    )
                  );
                }}
                className="h-4 w-4 accent-amber-400"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
