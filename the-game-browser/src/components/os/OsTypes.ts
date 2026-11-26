export type OsAppId =
  | 'home'
  | 'phone'
  | 'messages'
  | 'pulso'
  | 'email'
  | 'photos'
  | 'notes'
  | 'files'
  | 'calendar'
  | 'maps'
  | 'bank'
  | 'market'
  | 'social'
  | 'dating'
  | 'recorder'
  | 'browser'
  | 'calculator'
  | 'clock'
  | 'settings';

export interface OsSystemSettings {
  brightness: number; // 45..100
  wifiEnabled: boolean;
  airplaneMode: boolean;
  flashlightOn: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  largeText: boolean;
}

export interface OsDeepLink {
  appId: Exclude<OsAppId, 'home'>;
  targetId?: string;
}

export const DEFAULT_OS_SETTINGS: OsSystemSettings = {
  brightness: 92,
  wifiEnabled: true,
  airplaneMode: false,
  flashlightOn: false,
  soundEnabled: true,
  notificationsEnabled: true,
  largeText: false,
};
