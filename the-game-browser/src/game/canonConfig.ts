/**
 * Canonical Game Bible integration point for Chapter 00.
 *
 * Update `birthDate` and `authorizedUsbDevices` here when the consolidated
 * Game Bible and target physical USB hardware are finalized.
 * Never expose derived passcodes in logs, UI text, or error messages.
 */

export type PasscodeDateFormat = 'DDMMAAAA' | 'DDMMAA' | 'DDMM';

export interface AuthorizedUsbDescriptor {
  readonly vendorId: number;
  readonly productId: number;
  readonly serialPrefix?: string;
  readonly label: string;
}

export interface CanonProfile {
  readonly fullName: string;
  readonly firstName: string;
  /** Canonical birth date in DD/MM/AAAA format. */
  readonly birthDate: string;
  readonly ageAtDisappearance: number;
  readonly ageAtPastIncident: number;
  readonly yearsSinceIncident: number;
  readonly caseNumber: string;
  readonly lastSeenDate: string;
  readonly intakeDate: string;
  readonly lockClockTime: string;
  readonly lockClockDate: string;
  readonly recoveredItemLabel: string;
  readonly deviceModelLabel: string;
}

export const CANON_PROFILE: CanonProfile = {
  fullName: 'Letícia Vasconcelos',
  firstName: 'Letícia',
  birthDate: '14/07/1990',
  ageAtDisappearance: 36,
  ageAtPastIncident: 15,
  yearsSinceIncident: 21,
  caseNumber: '0419/26',
  lastSeenDate: '18/11/2026',
  intakeDate: '19/11/2026',
  lockClockTime: '03:17',
  lockClockDate: 'Terça-feira, 18 de novembro',
  recoveredItemLabel: '01 celular pessoal (retido para análise · descarregado)',
  deviceModelLabel: 'Celular pessoal',
};

/**
 * Digit length follows the canonical date format from the Game Bible.
 * 'DDMMAAAA' -> 8 digits (full birth date, digits reversed).
 */
export const CANON_PASSCODE_FORMAT: PasscodeDateFormat = 'DDMMAA';

/**
 * Whitelist of officially authorized USB hardware descriptors.
 * Only a physical device matching one of these vendorId + productId pairs
 * (and optional serialPrefix) can power and boot Letícia's phone.
 */
export const AUTHORIZED_USB_DESCRIPTORS: readonly AuthorizedUsbDescriptor[] = [
  {
    vendorId: 0x2e8a,
    productId: 0x000a,
    serialPrefix: 'LTC-',
    label: 'Unidade USB Oficial Letícia (RP2040)',
  },
  {
    vendorId: 0x1209,
    productId: 0x4c54,
    label: 'Chave de Energia Oficial Letícia (PID.codes)',
  },
];

export const CHARGING_MILESTONES = [20, 40, 60, 80, 100] as const;

export const LOCKOUT_POLICY = {
  maxAttemptsBeforeLockout: 5,
  lockoutDurationMs: 30_000,
} as const;

export const GENERATED_ASSETS = {
  lockWallpaper: '/src/assets/images/leticia_wallpaper_1795698931734.jpg',
  galleryMistRoad: '/src/assets/images/gallery_mist_road_1795698932682.jpg',
  galleryOldHouse: '/src/assets/images/gallery_old_house_1795698933959.jpg',
} as const;
