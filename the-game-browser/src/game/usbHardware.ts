import {
  AUTHORIZED_USB_DESCRIPTORS,
  type AuthorizedUsbDescriptor,
} from './canonConfig';

export interface UsbDeviceLike {
  readonly vendorId: number;
  readonly productId: number;
  readonly serialNumber?: string | null;
  readonly productName?: string | null;
  readonly manufacturerName?: string | null;
  readonly opened?: boolean;
  open?: () => Promise<void>;
  close?: () => Promise<void>;
}

export interface BatteryManagerLike {
  readonly charging: boolean;
  readonly level: number;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  addEventListener(type: 'chargingchange' | 'levelchange', listener: () => void): void;
  removeEventListener(type: 'chargingchange' | 'levelchange', listener: () => void): void;
}

export type UsbErrorCode =
  | 'UNSUPPORTED_BROWSER'
  | 'USER_CANCELLED'
  | 'PERMISSION_DENIED'
  | 'UNAUTHORIZED_DEVICE'
  | 'READ_FAILED'
  | 'CONNECTION_LOST';

export interface UsbValidationResult {
  readonly authorized: boolean;
  readonly matchedDescriptor?: AuthorizedUsbDescriptor;
  readonly errorCode?: UsbErrorCode;
  readonly deviceFingerprint?: string;
}

export interface UsbConnectionOutcome {
  readonly ok: boolean;
  readonly descriptor?: AuthorizedUsbDescriptor;
  readonly deviceFingerprint?: string;
  readonly errorCode?: UsbErrorCode;
  readonly source?: 'webusb' | 'battery-charger';
}

interface WebUsbManagerLike {
  getDevices(): Promise<UsbDeviceLike[]>;
  requestDevice(options: {
    filters: Array<{ vendorId?: number; productId?: number }>;
  }): Promise<UsbDeviceLike>;
  addEventListener(
    type: 'connect' | 'disconnect',
    listener: (event: Event & { device?: UsbDeviceLike }) => void
  ): void;
  removeEventListener(
    type: 'connect' | 'disconnect',
    listener: (event: Event & { device?: UsbDeviceLike }) => void
  ): void;
}

function getNavigatorUsb(): WebUsbManagerLike | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & { usb?: WebUsbManagerLike };
  return nav.usb ?? null;
}

function getNavigatorBattery(): Promise<BatteryManagerLike> | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & {
    getBattery?: () => Promise<BatteryManagerLike>;
  };
  if (typeof nav.getBattery !== 'function') return null;
  return nav.getBattery();
}

export function isWebUsbSupported(): boolean {
  return getNavigatorUsb() !== null;
}

export function isBatteryApiSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { getBattery?: unknown };
  return typeof nav.getBattery === 'function';
}

/**
 * Distinguishes a real phone/laptop actively charging on a USB power cable
 * from a desktop PC with no battery (which Chromium reports as charging=true,
 * level=1, chargingTime=0, dischargingTime=Infinity).
 */
export function isRealBatteryActivelyCharging(
  battery: Pick<BatteryManagerLike, 'charging' | 'level' | 'chargingTime'>
): boolean {
  if (!battery.charging) return false;
  const isDesktopDummy = battery.level === 1 && battery.chargingTime === 0;
  return !isDesktopDummy;
}

export function buildDeviceFingerprint(device: UsbDeviceLike): string {
  const vid = device.vendorId.toString(16).padStart(4, '0');
  const pid = device.productId.toString(16).padStart(4, '0');
  const serial = device.serialNumber ? device.serialNumber.trim() : 'noserial';
  return `${vid}:${pid}:${serial}`;
}

/**
 * Validates that a connected USB peripheral matches an explicitly authorized
 * hardware descriptor (vendorId, productId, and optional serialPrefix).
 */
export function validateUsbDevice(
  device: UsbDeviceLike | null | undefined,
  whitelist: readonly AuthorizedUsbDescriptor[] = AUTHORIZED_USB_DESCRIPTORS
): UsbValidationResult {
  if (!device || typeof device.vendorId !== 'number' || typeof device.productId !== 'number') {
    return {
      authorized: false,
      errorCode: 'READ_FAILED',
    };
  }

  const match = whitelist.find((descriptor) => {
    if (descriptor.vendorId !== device.vendorId) return false;
    if (descriptor.productId !== device.productId) return false;
    if (descriptor.serialPrefix) {
      const serial = device.serialNumber ?? '';
      return serial.startsWith(descriptor.serialPrefix);
    }
    return true;
  });

  if (!match) {
    return {
      authorized: false,
      errorCode: 'UNAUTHORIZED_DEVICE',
      deviceFingerprint: buildDeviceFingerprint(device),
    };
  }

  return {
    authorized: true,
    matchedDescriptor: match,
    deviceFingerprint: buildDeviceFingerprint(device),
  };
}

/**
 * Executes the physical open/read handshake on a USB device.
 * When `enforceWhitelist` is true (default), strictly verifies vendorId/productId.
 * When `enforceWhitelist` is false (real-world PC/OTG USB cable picker mode),
 * verifies the physical device is valid and reachable via WebUSB.
 */
export async function performUsbHandshake(
  device: UsbDeviceLike,
  whitelist: readonly AuthorizedUsbDescriptor[] = AUTHORIZED_USB_DESCRIPTORS,
  options?: { enforceWhitelist?: boolean }
): Promise<UsbConnectionOutcome> {
  const enforceWhitelist = options?.enforceWhitelist ?? true;

  if (!device || typeof device.vendorId !== 'number' || typeof device.productId !== 'number') {
    return {
      ok: false,
      errorCode: 'READ_FAILED',
    };
  }

  let matchedDescriptor: AuthorizedUsbDescriptor | undefined;
  if (enforceWhitelist) {
    const validation = validateUsbDevice(device, whitelist);
    if (!validation.authorized || !validation.matchedDescriptor) {
      return {
        ok: false,
        errorCode: validation.errorCode ?? 'UNAUTHORIZED_DEVICE',
        deviceFingerprint: validation.deviceFingerprint,
      };
    }
    matchedDescriptor = validation.matchedDescriptor;
  }

  const fingerprint = buildDeviceFingerprint(device);

  try {
    if (typeof device.open === 'function' && !device.opened) {
      await device.open();
    }
    return {
      ok: true,
      descriptor: matchedDescriptor,
      deviceFingerprint: fingerprint,
      source: 'webusb',
    };
  } catch (error) {
    // On some OSes, a physically plugged USB device cannot be exclusively claimed
    // by WebUSB (e.g., busy with OS driver) even though it was physically selected.
    const code = classifyUsbException(error);
    if (!enforceWhitelist && code === 'PERMISSION_DENIED') {
      return {
        ok: false,
        errorCode: code,
        deviceFingerprint: fingerprint,
      };
    }
    return {
      ok: false,
      errorCode: code,
      deviceFingerprint: fingerprint,
    };
  }
}

export function classifyUsbException(error: unknown): UsbErrorCode {
  if (error instanceof Error) {
    const name = error.name;
    if (name === 'NotFoundError') return 'USER_CANCELLED';
    if (name === 'SecurityError' || name === 'NotAllowedError') {
      return 'PERMISSION_DENIED';
    }
    if (name === 'NetworkError' || name === 'InvalidStateError') {
      return 'CONNECTION_LOST';
    }
  }
  return 'READ_FAILED';
}

/**
 * Scans already-permitted physical USB devices connected to the host.
 */
export async function scanAuthorizedPairedUsb(
  whitelist: readonly AuthorizedUsbDescriptor[] = AUTHORIZED_USB_DESCRIPTORS
): Promise<UsbConnectionOutcome | null> {
  const usb = getNavigatorUsb();
  if (!usb) return null;

  try {
    const devices = await usb.getDevices();
    for (const device of devices) {
      const outcome = await performUsbHandshake(device, whitelist, {
        enforceWhitelist: false,
      });
      if (outcome.ok) {
        return outcome;
      }
    }
    return null;
  } catch (error) {
    return {
      ok: false,
      errorCode: classifyUsbException(error),
    };
  }
}

/**
 * Invokes real physical power/USB detection from a user gesture on the USB-C port:
 * 1. First checks if the device's real battery is actively drawing power via USB charger.
 * 2. Otherwise opens the native browser WebUSB hardware picker so the player can
 *    select any real physical USB cable/device plugged into their phone or PC.
 */
export async function requestPhysicalUsbConnection(): Promise<UsbConnectionOutcome> {
  // 1. Check real physical charger via Battery Status API (phones & laptops)
  const batteryPromise = getNavigatorBattery();
  if (batteryPromise) {
    try {
      const battery = await batteryPromise;
      if (isRealBatteryActivelyCharging(battery)) {
        return {
          ok: true,
          deviceFingerprint: `usb-power:${Math.round(battery.level * 100)}pct`,
          source: 'battery-charger',
        };
      }
    } catch {
      // Fall through to WebUSB hardware picker.
    }
  }

  // 2. Open native WebUSB picker for physical USB peripherals connected to PC/OTG
  const usb = getNavigatorUsb();
  if (!usb) {
    return {
      ok: false,
      errorCode: 'UNSUPPORTED_BROWSER',
    };
  }

  try {
    const device = await usb.requestDevice({ filters: [] });
    return {
      ok: true,
      deviceFingerprint: buildDeviceFingerprint(device),
      source: 'webusb',
    };
  } catch (error) {
    return {
      ok: false,
      errorCode: classifyUsbException(error),
    };
  }
}

/**
 * Subscribes to real-time physical charger plug/unplug events via Battery Status API.
 * Fires immediately when a physical USB cable is plugged into a phone or laptop!
 */
export function subscribePhysicalChargerEvents(handlers: {
  onChargerConnected: (fingerprint: string) => void;
  onChargerDisconnected: () => void;
}): () => void {
  const batteryPromise = getNavigatorBattery();
  if (!batteryPromise) return () => {};

  let disposed = false;
  let batteryRef: BatteryManagerLike | null = null;
  let previousCharging: boolean | null = null;

  const handleChargingChange = () => {
    if (disposed || !batteryRef) return;
    const nowCharging = batteryRef.charging;
    if (nowCharging && previousCharging === false) {
      handlers.onChargerConnected(
        `usb-power:${Math.round(batteryRef.level * 100)}pct`
      );
    } else if (!nowCharging && previousCharging === true) {
      handlers.onChargerDisconnected();
    }
    previousCharging = nowCharging;
  };

  void batteryPromise
    .then((battery) => {
      if (disposed) return;
      batteryRef = battery;
      previousCharging = battery.charging;
      battery.addEventListener('chargingchange', handleChargingChange);
    })
    .catch(() => {});

  return () => {
    disposed = true;
    if (batteryRef) {
      batteryRef.removeEventListener('chargingchange', handleChargingChange);
    }
  };
}

/**
 * Subscribes to live physical USB connect & disconnect events from WebUSB.
 */
export function subscribePhysicalUsbEvents(handlers: {
  onConnect: (device: UsbDeviceLike) => void;
  onDisconnect: (device: UsbDeviceLike) => void;
}): () => void {
  const usb = getNavigatorUsb();
  if (!usb) return () => {};

  const handleConnect = (event: Event & { device?: UsbDeviceLike }) => {
    if (event.device) {
      handlers.onConnect(event.device);
    }
  };

  const handleDisconnect = (event: Event & { device?: UsbDeviceLike }) => {
    if (event.device) {
      handlers.onDisconnect(event.device);
    }
  };

  usb.addEventListener('connect', handleConnect);
  usb.addEventListener('disconnect', handleDisconnect);

  return () => {
    usb.removeEventListener('connect', handleConnect);
    usb.removeEventListener('disconnect', handleDisconnect);
  };
}
