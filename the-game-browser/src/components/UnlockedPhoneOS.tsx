import { useEffect, useState, type ComponentType } from 'react';
import {
  BatteryCharging,
  Calendar as CalendarIcon,
  Calculator,
  Clock,
  CloudRain,
  Compass,
  Flame,
  Folder,
  FolderKanban,
  Image as ImageIcon,
  Landmark,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mic,
  Phone,
  Plane,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  StickyNote,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { chapterAudio } from '../game/audio';
import { GENERATED_ASSETS } from '../game/canonConfig';
import {
  ECOSYSTEM_CALLS,
  ECOSYSTEM_CHATS,
  ECOSYSTEM_EMAILS,
  INITIAL_OS_NOTIFICATIONS,
  type OsNotificationItem,
} from '../game/phoneEcosystem';
import {
  DEFAULT_OS_SETTINGS,
  type OsAppId,
  type OsDeepLink,
  type OsSystemSettings,
} from './os/OsTypes';
import {
  ControlCenterOverlay,
  NotificationCenterOverlay,
  SpotlightSearchOverlay,
  UtilitiesFolderOverlay,
} from './os/SystemOverlays';
import { EmailApp, MessagingApp, PhoneApp } from './os/CommunicationApps';
import {
  CalendarApp,
  FilesApp,
  NotesApp,
  PhotosApp,
} from './os/PersonalMediaApps';
import {
  BankApp,
  DatingApp,
  MapsApp,
  MarketplaceApp,
  SocialApp,
} from './os/LifestyleFinanceApps';
import {
  BrowserApp,
  CalculatorApp,
  ClockApp,
  RecorderApp,
  SettingsApp,
} from './os/UtilitySystemApps';

interface UnlockedPhoneOSProps {
  usbConnected: boolean;
  detectiveName?: string;
}

const OS_SETTINGS_STORAGE_KEY = 'leticia_ch00_os_settings_v1';

function loadOsSettings(): OsSystemSettings {
  try {
    const raw = window.localStorage.getItem(OS_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_OS_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<OsSystemSettings>;
    return {
      brightness:
        typeof parsed.brightness === 'number'
          ? Math.max(45, Math.min(100, parsed.brightness))
          : DEFAULT_OS_SETTINGS.brightness,
      wifiEnabled:
        typeof parsed.wifiEnabled === 'boolean'
          ? parsed.wifiEnabled
          : DEFAULT_OS_SETTINGS.wifiEnabled,
      airplaneMode:
        typeof parsed.airplaneMode === 'boolean'
          ? parsed.airplaneMode
          : DEFAULT_OS_SETTINGS.airplaneMode,
      flashlightOn: false,
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean'
          ? parsed.soundEnabled
          : DEFAULT_OS_SETTINGS.soundEnabled,
      notificationsEnabled:
        typeof parsed.notificationsEnabled === 'boolean'
          ? parsed.notificationsEnabled
          : DEFAULT_OS_SETTINGS.notificationsEnabled,
      largeText:
        typeof parsed.largeText === 'boolean'
          ? parsed.largeText
          : DEFAULT_OS_SETTINGS.largeText,
    };
  } catch {
    return DEFAULT_OS_SETTINGS;
  }
}

interface HomeAppDescriptor {
  id: Exclude<OsAppId, 'home'> | 'utilities-folder';
  label: string;
  icon: ComponentType<{ className?: string }>;
  tint: string;
  badge?: number;
}

export function UnlockedPhoneOS({ usbConnected }: UnlockedPhoneOSProps) {
  const [activeApp, setActiveApp] = useState<OsAppId>('home');
  const [deepLinkTarget, setDeepLinkTarget] = useState<string | undefined>(undefined);
  const [homePage, setHomePage] = useState<0 | 1>(0);
  const [settings, setSettings] = useState<OsSystemSettings>(() => loadOsSettings());
  const [notifications, setNotifications] = useState<readonly OsNotificationItem[]>(
    INITIAL_OS_NOTIFICATIONS
  );

  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);

  const isOffline = settings.airplaneMode || !settings.wifiEnabled;

  useEffect(() => {
    try {
      window.localStorage.setItem(OS_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage quota restrictions
    }
  }, [settings]);

  const updateSettings = (patch: Partial<OsSystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const openApp = (appId: Exclude<OsAppId, 'home'>, targetId?: string) => {
    chapterAudio.playUiTap();
    setDeepLinkTarget(targetId);
    setActiveApp(appId);
  };

  const handleDeepLink = (link: OsDeepLink) => {
    setDeepLinkTarget(link.targetId);
    setActiveApp(link.appId);
  };

  const goHome = () => {
    chapterAudio.playUiTap();
    setActiveApp('home');
    setDeepLinkTarget(undefined);
    setControlCenterOpen(false);
    setNotifCenterOpen(false);
    setSpotlightOpen(false);
    setUtilitiesOpen(false);
  };

  const missedCallsCount = ECOSYSTEM_CALLS.filter((c) => c.kind === 'missed').length;
  const unreadSmsCount = ECOSYSTEM_CHATS.filter((c) => c.app === 'sms').reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );
  const unreadPulsoCount = ECOSYSTEM_CHATS.filter((c) => c.app === 'pulso').reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );
  const unreadEmailsCount = ECOSYSTEM_EMAILS.filter((e) => e.unread).length;

  const pageOneApps: readonly HomeAppDescriptor[] = [
    {
      id: 'photos',
      label: 'Fotos',
      icon: ImageIcon,
      tint: 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-900',
    },
    {
      id: 'notes',
      label: 'Notas',
      icon: StickyNote,
      tint: 'bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950',
    },
    {
      id: 'files',
      label: 'Arquivos',
      icon: Folder,
      tint: 'bg-gradient-to-br from-sky-500 to-blue-700 text-white',
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: CalendarIcon,
      tint: 'bg-gradient-to-br from-zinc-800 to-zinc-950 text-rose-300 border border-white/10',
    },
    {
      id: 'maps',
      label: 'Mapas',
      icon: MapPin,
      tint: 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white',
    },
    {
      id: 'bank',
      label: 'Áurea',
      icon: Landmark,
      tint: 'bg-gradient-to-br from-[#2b2620] to-[#151310] text-[#D8C7B3] border border-[#D8C7B3]/30',
    },
    {
      id: 'market',
      label: 'Mercado',
      icon: ShoppingBag,
      tint: 'bg-gradient-to-br from-amber-600 to-orange-800 text-white',
    },
    {
      id: 'email',
      label: 'Correio',
      icon: Mail,
      tint: 'bg-gradient-to-br from-blue-600 to-indigo-800 text-white',
      badge: unreadEmailsCount,
    },
    {
      id: 'social',
      label: 'Lume',
      icon: Sparkles,
      tint: 'bg-gradient-to-br from-stone-700 to-zinc-900 text-amber-200 border border-white/10',
    },
    {
      id: 'dating',
      label: 'Faísca',
      icon: Flame,
      tint: 'bg-gradient-to-br from-[#8c323b] to-[#561d23] text-rose-100',
    },
    {
      id: 'recorder',
      label: 'Gravador',
      icon: Mic,
      tint: 'bg-gradient-to-br from-[#23262f] to-[#111318] text-rose-400 border border-white/10',
    },
    {
      id: 'utilities-folder',
      label: 'Utilidades',
      icon: FolderKanban,
      tint: 'bg-white/12 text-zinc-100 border border-white/15 backdrop-blur-md',
    },
  ];

  const pageTwoApps: readonly HomeAppDescriptor[] = [
    {
      id: 'browser',
      label: 'Vela',
      icon: Compass,
      tint: 'bg-gradient-to-br from-sky-600 to-cyan-800 text-white',
    },
    {
      id: 'calculator',
      label: 'Calculadora',
      icon: Calculator,
      tint: 'bg-gradient-to-br from-zinc-700 to-zinc-900 text-amber-300 border border-white/10',
    },
    {
      id: 'clock',
      label: 'Relógio',
      icon: Clock,
      tint: 'bg-gradient-to-br from-zinc-800 to-black text-zinc-100 border border-white/10',
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: Settings,
      tint: 'bg-gradient-to-br from-zinc-600 to-zinc-800 text-zinc-100',
    },
  ];

  const dockApps: readonly HomeAppDescriptor[] = [
    {
      id: 'phone',
      label: 'Telefone',
      icon: Phone,
      tint: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white',
      badge: missedCallsCount,
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquare,
      tint: 'bg-gradient-to-br from-green-600 to-emerald-800 text-white',
      badge: unreadSmsCount,
    },
    {
      id: 'pulso',
      label: 'PulsoChat',
      icon: MessageCircle,
      tint: 'bg-gradient-to-br from-teal-600 to-cyan-900 text-white',
      badge: unreadPulsoCount,
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: Settings,
      tint: 'bg-gradient-to-br from-zinc-600 to-zinc-800 text-zinc-100',
    },
  ];

  const dimOpacity = Math.max(0, ((100 - settings.brightness) / 100) * 0.65);

  const renderAppTile = (app: HomeAppDescriptor, compactLabel = false) => {
    const Icon = app.icon;
    return (
      <button
        key={app.id}
        type="button"
        data-testid={`os-icon-${app.id}`}
        onClick={() => {
          if (app.id === 'utilities-folder') {
            chapterAudio.playUiTap();
            setUtilitiesOpen(true);
          } else {
            openApp(app.id);
          }
        }}
        className="group flex flex-col items-center gap-1 focus:outline-none"
      >
        <span
          className={`relative flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg transition-transform group-active:scale-92 ${app.tint}`}
        >
          <Icon className="h-6 w-6" />
          {app.badge && app.badge > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#9e333d] px-1 font-mono text-[9.5px] font-semibold text-white shadow">
              {app.badge}
            </span>
          ) : null}
        </span>
        {!compactLabel && (
          <span className="max-w-[66px] truncate text-[10.5px] font-medium text-zinc-200 drop-shadow">
            {app.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      data-testid="unlocked-phone-os"
      className={`relative flex h-full w-full flex-col overflow-hidden bg-[#08090b] text-zinc-100 select-none ${
        settings.largeText ? 'text-[15px]' : ''
      }`}
    >
      {/* Subtle Top Flashlight Glow when enabled in Control Center */}
      {settings.flashlightOn && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-20 bg-gradient-to-b from-amber-100/25 to-transparent"
        />
      )}

      {/* Persistent Smartphone Status Bar */}
      <header className="relative z-30 flex shrink-0 items-center justify-between bg-[#08090b]/85 px-4 pt-2.5 pb-1.5 text-[11px] backdrop-blur-md">
        <button
          type="button"
          data-testid="status-notifications-btn"
          aria-label="Abrir Central de Notificações"
          onClick={() => {
            chapterAudio.playUiTap();
            setControlCenterOpen(false);
            setNotifCenterOpen((v) => !v);
          }}
          className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 font-mono font-semibold text-zinc-100 tabular-nums hover:bg-white/10"
        >
          <span>03:12</span>
          {settings.notificationsEnabled && notifications.length > 0 && (
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[#b54852]"
            />
          )}
        </button>

        <button
          type="button"
          data-testid="status-control-btn"
          aria-label="Abrir Central de Controle"
          onClick={() => {
            chapterAudio.playUiTap();
            setNotifCenterOpen(false);
            setControlCenterOpen((v) => !v);
          }}
          className="flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-zinc-200 hover:bg-white/10"
        >
          {settings.airplaneMode ? (
            <Plane className="h-3.5 w-3.5 text-amber-400" />
          ) : settings.wifiEnabled ? (
            <Wifi className="h-3.5 w-3.5 text-zinc-200" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-zinc-500" />
          )}
          <span className="flex items-center gap-0.5 font-mono text-[10.5px] tabular-nums">
            {usbConnected ? (
              <Zap className="h-3 w-3 text-emerald-400" />
            ) : (
              <BatteryCharging className="h-3.5 w-3.5 text-zinc-300" />
            )}
            100%
          </span>
        </button>
      </header>

      {/* Main Viewport: Home Screen OR Active App */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeApp === 'home' ? (
          <div className="relative flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
            {/* Dark Rain Wallpaper */}
            <img
              src={GENERATED_ASSETS.lockWallpaper}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08090b]/75 via-[#0b0d12]/65 to-[#08090b]/92"
            />

            {/* Home Screen Body */}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between px-4 pt-3 pb-2.5">
              {homePage === 0 ? (
                <div className="space-y-4">
                  {/* Editorial Weather & Calendar Widget */}
                  <button
                    type="button"
                    data-testid="home-calendar-widget"
                    onClick={() => openApp('calendar')}
                    className="flex w-full items-center justify-between rounded-3xl border border-white/12 bg-[#14171f]/80 px-4 py-3 text-left shadow-xl backdrop-blur-md transition-colors hover:border-white/20"
                  >
                    <div>
                      <p className="font-mono text-[10px] tracking-widest text-rose-300/90 uppercase">
                        Quinta · 19 Nov
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-zinc-100">
                        01:00 · Confirmar portão — Km 14
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-zinc-400">
                        Amanhã 11:00 · Sessão Dr. Alberto
                      </p>
                    </div>
                    <div className="flex flex-col items-end pl-3 text-right">
                      <CloudRain className="h-4.5 w-4.5 text-sky-300/85" />
                      <span className="mt-1 font-mono text-base font-semibold text-zinc-100 tabular-nums">
                        17°
                      </span>
                      <span className="text-[9.5px] text-zinc-400">Chuva leve</span>
                    </div>
                  </button>

                  {/* Primary 4x3 App Grid */}
                  <div className="grid grid-cols-4 gap-x-2.5 gap-y-3.5">
                    {pageOneApps.map((app) => renderAppTile(app))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Secondary Page Storage Widget */}
                  <button
                    type="button"
                    onClick={() => openApp('settings')}
                    className="w-full rounded-3xl border border-white/12 bg-[#14171f]/80 px-4 py-3 text-left shadow-xl backdrop-blur-md hover:border-white/20"
                  >
                    <div className="flex items-center justify-between text-[10.5px] text-zinc-400">
                      <span>Armazenamento local</span>
                      <span className="font-mono text-zinc-200">48,2 / 128 GB</span>
                    </div>
                    <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div className="w-[38%] bg-sky-500/80" />
                      <div className="w-[24%] bg-emerald-500/80" />
                      <div className="w-[16%] bg-amber-400/80" />
                    </div>
                    <p className="mt-1.5 text-[10.5px] text-zinc-400">
                      Bateria 100% · Sem chip de operadora
                    </p>
                  </button>

                  <div className="grid grid-cols-4 gap-x-2.5 gap-y-3.5">
                    {pageTwoApps.map((app) => renderAppTile(app))}
                  </div>
                </div>
              )}

              {/* Spotlight Trigger + Page Switcher + Frosted Dock */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Página 1 da tela inicial"
                    onClick={() => {
                      chapterAudio.playUiTap();
                      setHomePage(0);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      homePage === 0 ? 'w-4 bg-white' : 'w-1.5 bg-white/35'
                    }`}
                  />
                  <button
                    type="button"
                    data-testid="home-spotlight-btn"
                    onClick={() => {
                      chapterAudio.playUiTap();
                      setSpotlightOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-white/12 bg-[#161922]/85 px-3 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur-md hover:bg-white/15"
                  >
                    <Search className="h-3 w-3 text-zinc-400" />
                    <span>Buscar</span>
                  </button>
                  <button
                    type="button"
                    data-testid="home-page-2-dot"
                    aria-label="Página 2 da tela inicial"
                    onClick={() => {
                      chapterAudio.playUiTap();
                      setHomePage(1);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      homePage === 1 ? 'w-4 bg-white' : 'w-1.5 bg-white/35'
                    }`}
                  />
                </div>

                {/* Frosted 4-icon Dock */}
                <nav
                  aria-label="Dock principal"
                  className="grid grid-cols-4 gap-2 rounded-3xl border border-white/12 bg-[#171a22]/78 px-3 py-2.5 shadow-2xl backdrop-blur-xl"
                >
                  {dockApps.map((app) => renderAppTile(app, true))}
                </nav>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {activeApp === 'phone' && (
              <PhoneApp
                initialTargetId={deepLinkTarget}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'messages' && (
              <MessagingApp
                mode="sms"
                initialThreadId={deepLinkTarget}
                offline={isOffline}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'pulso' && (
              <MessagingApp
                mode="pulso"
                initialThreadId={deepLinkTarget}
                offline={isOffline}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'email' && (
              <EmailApp
                initialEmailId={deepLinkTarget}
                offline={isOffline}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'photos' && <PhotosApp onBackHome={goHome} />}
            {activeApp === 'notes' && (
              <NotesApp initialNoteId={deepLinkTarget} onBackHome={goHome} />
            )}
            {activeApp === 'files' && (
              <FilesApp initialFileId={deepLinkTarget} onBackHome={goHome} />
            )}
            {activeApp === 'calendar' && <CalendarApp onBackHome={goHome} />}
            {activeApp === 'bank' && (
              <BankApp
                initialTxId={deepLinkTarget}
                offline={isOffline}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'market' && (
              <MarketplaceApp
                initialOrderId={deepLinkTarget}
                offline={isOffline}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'maps' && (
              <MapsApp
                initialPlaceId={deepLinkTarget}
                offline={isOffline}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'social' && (
              <SocialApp
                offline={isOffline}
                onNavigate={handleDeepLink}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'dating' && <DatingApp onBackHome={goHome} />}
            {activeApp === 'recorder' && <RecorderApp onBackHome={goHome} />}
            {activeApp === 'browser' && (
              <BrowserApp
                offline={isOffline}
                onOpenSettings={() => openApp('settings')}
                onBackHome={goHome}
              />
            )}
            {activeApp === 'calculator' && <CalculatorApp onBackHome={goHome} />}
            {activeApp === 'clock' && <ClockApp onBackHome={goHome} />}
            {activeApp === 'settings' && (
              <SettingsApp
                usbConnected={usbConnected}
                settings={settings}
                onUpdate={updateSettings}
                onBackHome={goHome}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom iOS-style Home Indicator */}
      <div className="relative z-30 flex shrink-0 items-center justify-center bg-[#08090b] py-1.5">
        <button
          type="button"
          data-testid="os-home-indicator"
          aria-label="Voltar para a tela inicial do celular"
          onClick={goHome}
          className="h-1 w-28 rounded-full bg-white/35 transition-colors hover:bg-white/65"
        />
      </div>

      {/* System Overlays */}
      <ControlCenterOverlay
        open={controlCenterOpen}
        usbConnected={usbConnected}
        settings={settings}
        onUpdate={updateSettings}
        onClose={() => setControlCenterOpen(false)}
      />

      <NotificationCenterOverlay
        open={notifCenterOpen}
        notifications={notifications}
        onDismissOne={(id) =>
          setNotifications((prev) => prev.filter((item) => item.id !== id))
        }
        onClearAll={() => setNotifications([])}
        onOpenLink={handleDeepLink}
        onClose={() => setNotifCenterOpen(false)}
      />

      <SpotlightSearchOverlay
        open={spotlightOpen}
        onOpenLink={handleDeepLink}
        onClose={() => setSpotlightOpen(false)}
      />

      <UtilitiesFolderOverlay
        open={utilitiesOpen}
        onOpenApp={(appId) => openApp(appId)}
        onClose={() => setUtilitiesOpen(false)}
      />

      {/* Real Screen Brightness Dimmer */}
      {dimOpacity > 0 && (
        <div
          aria-hidden="true"
          style={{ opacity: dimOpacity }}
          className="pointer-events-none absolute inset-0 z-50 bg-black"
        />
      )}
    </div>
  );
}
