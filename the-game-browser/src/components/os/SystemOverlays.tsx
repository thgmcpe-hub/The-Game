import { useState } from 'react';
import {
  BellOff,
  Calculator,
  Clock,
  Compass,
  Flashlight,
  Mic,
  Plane,
  Search,
  Settings,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { chapterAudio } from '../../game/audio';
import {
  searchPhoneEcosystem,
  type OsNotificationItem,
} from '../../game/phoneEcosystem';
import type { OsAppId, OsDeepLink, OsSystemSettings } from './OsTypes';

interface ControlCenterProps {
  open: boolean;
  usbConnected: boolean;
  settings: OsSystemSettings;
  onUpdate: (patch: Partial<OsSystemSettings>) => void;
  onClose: () => void;
}

export function ControlCenterOverlay({
  open,
  usbConnected,
  settings,
  onUpdate,
  onClose,
}: ControlCenterProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Central de Controle"
      data-testid="control-center-overlay"
      onClick={onClose}
      className="absolute inset-0 z-40 flex flex-col justify-start bg-black/75 px-4 pt-11 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full space-y-3 rounded-3xl border border-white/10 bg-[#15171c]/95 p-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium tracking-wide text-zinc-400">
            Central de Controle
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Central de Controle"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Connectivity & Hardware Toggles */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            data-testid="cc-airplane-btn"
            aria-pressed={settings.airplaneMode}
            onClick={() => {
              chapterAudio.playUiTap();
              const nextAirplane = !settings.airplaneMode;
              onUpdate({
                airplaneMode: nextAirplane,
                wifiEnabled: nextAirplane ? false : settings.wifiEnabled,
              });
            }}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-[10px] font-medium transition-colors ${
              settings.airplaneMode
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80'
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>Avião</span>
          </button>

          <button
            type="button"
            data-testid="cc-wifi-btn"
            aria-pressed={settings.wifiEnabled && !settings.airplaneMode}
            onClick={() => {
              chapterAudio.playUiTap();
              onUpdate({
                wifiEnabled: !settings.wifiEnabled,
                airplaneMode: false,
              });
            }}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-[10px] font-medium transition-colors ${
              settings.wifiEnabled && !settings.airplaneMode
                ? 'bg-sky-500 text-white'
                : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80'
            }`}
          >
            {settings.wifiEnabled && !settings.airplaneMode ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span>Wi-Fi</span>
          </button>

          <button
            type="button"
            data-testid="cc-sound-btn"
            aria-pressed={settings.soundEnabled}
            onClick={() => {
              const next = !settings.soundEnabled;
              chapterAudio.setMuted(!next);
              if (next) chapterAudio.playUiTap();
              onUpdate({ soundEnabled: next });
            }}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-[10px] font-medium transition-colors ${
              settings.soundEnabled
                ? 'bg-zinc-200 text-zinc-950'
                : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80'
            }`}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            <span>{settings.soundEnabled ? 'Som' : 'Mudo'}</span>
          </button>

          <button
            type="button"
            data-testid="cc-flashlight-btn"
            aria-pressed={settings.flashlightOn}
            onClick={() => {
              chapterAudio.playUiTap();
              onUpdate({ flashlightOn: !settings.flashlightOn });
            }}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-[10px] font-medium transition-colors ${
              settings.flashlightOn
                ? 'bg-amber-200 text-zinc-950'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80'
            }`}
          >
            <Flashlight className="h-4 w-4" />
            <span>Lanterna</span>
          </button>
        </div>

        {/* Brightness Slider */}
        <div className="rounded-2xl bg-zinc-900/90 px-3.5 py-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-zinc-300" />
              Brilho da tela
            </span>
            <span className="font-mono tabular-nums">{settings.brightness}%</span>
          </div>
          <input
            type="range"
            min={45}
            max={100}
            value={settings.brightness}
            aria-label="Brilho da tela"
            onChange={(e) => onUpdate({ brightness: Number(e.target.value) })}
            className="h-1.5 w-full cursor-pointer accent-zinc-200"
          />
        </div>

        {/* Battery & Network Status */}
        <div className="flex items-center justify-between rounded-2xl bg-zinc-900/80 px-3.5 py-2.5 text-[11px] text-zinc-300">
          <span className="flex items-center gap-1.5">
            <Zap
              className={`h-3.5 w-3.5 ${
                usbConnected ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            />
            {usbConnected ? 'Carregando via USB · 100%' : 'Bateria · 100%'}
          </span>
          <span className="font-mono text-[10px] text-zinc-500">
            {settings.airplaneMode
              ? 'Modo Avião'
              : settings.wifiEnabled
                ? 'Wi-Fi · Sem chip'
                : 'Sem rede'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface NotificationCenterProps {
  open: boolean;
  notifications: readonly OsNotificationItem[];
  onDismissOne: (id: string) => void;
  onClearAll: () => void;
  onOpenLink: (link: OsDeepLink) => void;
  onClose: () => void;
}

export function NotificationCenterOverlay({
  open,
  notifications,
  onDismissOne,
  onClearAll,
  onOpenLink,
  onClose,
}: NotificationCenterProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Central de Notificações"
      data-testid="notification-center-overlay"
      onClick={onClose}
      className="absolute inset-0 z-40 flex flex-col bg-black/82 px-4 pt-11 pb-6 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Notificações</h2>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  onClearAll();
                }}
                className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-white/20"
              >
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar notificações"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-zinc-500">
            <BellOff className="h-6 w-6" />
            <p className="text-xs">Nenhuma notificação pendente.</p>
          </div>
        ) : (
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border border-white/10 bg-[#15171c]/95 p-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      chapterAudio.playUiTap();
                      onOpenLink({ appId: n.appId, targetId: n.targetId });
                      onClose();
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                        {n.appName}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                        {n.timeLabel}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold text-zinc-100">
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-zinc-400">
                      {n.body}
                    </p>
                  </button>
                  <button
                    type="button"
                    aria-label={`Descartar notificação de ${n.title}`}
                    onClick={() => {
                      chapterAudio.playUiTap();
                      onDismissOne(n.id);
                    }}
                    className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SpotlightSearchProps {
  open: boolean;
  onOpenLink: (link: OsDeepLink) => void;
  onClose: () => void;
}

export function SpotlightSearchOverlay({
  open,
  onOpenLink,
  onClose,
}: SpotlightSearchProps) {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const results = searchPhoneEcosystem(query);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Busca global do aparelho"
      data-testid="spotlight-overlay"
      onClick={onClose}
      className="absolute inset-0 z-40 flex flex-col bg-black/84 px-4 pt-11 pb-5 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="search"
              autoFocus
              data-testid="spotlight-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar contatos, mensagens, Pix, locais..."
              className="h-10 w-full rounded-xl border border-white/10 bg-[#15171c] pr-3 pl-9 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-1.5 text-xs font-medium text-zinc-300 hover:text-white"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto">
          {!query.trim() ? (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                Sugestões recentes
              </p>
              <div className="flex flex-wrap gap-2">
                {['Acácias', 'Km 14', 'Henrique', 'Eclipse', 'Pix'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-white/10 bg-[#15171c] px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Nenhum resultado encontrado para “{query}”.
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#15171c]">
              {results.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  data-testid={`spotlight-hit-${hit.targetId}`}
                  onClick={() => {
                    chapterAudio.playUiTap();
                    onOpenLink({ appId: hit.appId, targetId: hit.targetId });
                    onClose();
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-100">
                      {hit.title}
                    </p>
                    <p className="truncate text-[11px] text-zinc-400">
                      {hit.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-white/8 px-2 py-0.5 text-[10px] text-zinc-300">
                    {hit.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface UtilitiesFolderProps {
  open: boolean;
  onOpenApp: (app: Exclude<OsAppId, 'home'>) => void;
  onClose: () => void;
}

export function UtilitiesFolderOverlay({
  open,
  onOpenApp,
  onClose,
}: UtilitiesFolderProps) {
  if (!open) return null;

  const items: Array<{
    id: Exclude<OsAppId, 'home'>;
    label: string;
    icon: typeof Mic;
    tint: string;
  }> = [
    { id: 'recorder', label: 'Gravador', icon: Mic, tint: 'bg-[#752B32] text-rose-100' },
    { id: 'browser', label: 'Vela', icon: Compass, tint: 'bg-sky-700 text-sky-50' },
    { id: 'calculator', label: 'Calculadora', icon: Calculator, tint: 'bg-zinc-700 text-amber-300' },
    { id: 'clock', label: 'Relógio', icon: Clock, tint: 'bg-zinc-800 text-zinc-100' },
    { id: 'settings', label: 'Ajustes', icon: Settings, tint: 'bg-zinc-600 text-zinc-100' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pasta Utilidades"
      data-testid="utilities-folder-overlay"
      onClick={onClose}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/75 px-6 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[300px] rounded-3xl border border-white/12 bg-[#1a1d24]/92 p-5 shadow-2xl"
      >
        <h2 className="mb-4 text-center text-sm font-medium text-zinc-100">
          Utilidades
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`folder-app-${item.id}`}
                onClick={() => {
                  chapterAudio.playUiTap();
                  onClose();
                  onOpenApp(item.id);
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-13 w-13 items-center justify-center rounded-2xl shadow-md transition-transform active:scale-95 ${item.tint}`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[10.5px] text-zinc-200">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
