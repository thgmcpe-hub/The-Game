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

interface WebHidDeviceLike {
  readonly vendorId: number;
  readonly productId: number;
  readonly productName?: string;
}

interface WebHidManagerLike {
  getDevices(): Promise<WebHidDeviceLike[]>;
  requestDevice(options: {
    filters: Array<{ vendorId?: number; productId?: number }>;
  }): Promise<WebHidDeviceLike[]>;
}

function getNavigatorUsb(): WebUsbManagerLike | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & { usb?: WebUsbManagerLike };
  return nav.usb ?? null;
}

function getNavigatorHid(): WebHidManagerLike | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & { hid?: WebHidManagerLike };
  return nav.hid ?? null;
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

export function isWebHidSupported(): boolean {
  return getNavigatorHid() !== null;
}

export function isBatteryApiSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { getBattery?: unknown };
  return typeof nav.getBattery === 'function';
}

export type HardwareUsbSupportMode =
  | 'battery-and-usb'
  | 'battery-only'
  | 'usb-only'
  | 'manual-fallback';

export function isLikelyMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent ?? '';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  return (navigator.maxTouchPoints ?? 0) > 1;
}

export function getHardwareUsbSupport(): HardwareUsbSupportMode {
  const hasBattery = isBatteryApiSupported();
  const hasUsb = isWebUsbSupported() || isWebHidSupported();
  if (hasBattery && hasUsb) return 'battery-and-usb';
  if (hasBattery) return 'battery-only';
  if (hasUsb) return 'usb-only';
  return 'manual-fallback';
}

/**
 * Distinguishes a real phone/laptop actively charging on a USB power cable
 * from a desktop PC with no battery (which Chromium reports as charging=true,
 * level=1, chargingTime=0, dischargingTime=Infinity).
 * When `sawUnplugged` is true (live false -> true transition), even a 100% laptop counts!
 */
export function isRealBatteryActivelyCharging(
  battery: Pick<BatteryManagerLike, 'charging' | 'level' | 'chargingTime'>,
  options?: { isMobile?: boolean; sawUnplugged?: boolean }
): boolean {
  if (!battery.charging) return false;
  if (options?.isMobile || options?.sawUnplugged) return true;
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
 * Checks once whether the host device's real battery is currently drawing USB power.
 */
export async function checkPhysicalChargerNow(): Promise<UsbConnectionOutcome | null> {
  const batteryPromise = getNavigatorBattery();
  if (!batteryPromise) return null;
  try {
    const battery = await batteryPromise;
    const mobile = isLikelyMobileDevice();
    if (isRealBatteryActivelyCharging(battery, { isMobile: mobile })) {
      return {
        ok: true,
        deviceFingerprint: `usb-power:${Math.round(battery.level * 100)}pct`,
        source: 'battery-charger',
      };
    }
    return null;
  } catch {
    return null;
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
  const chargerOutcome = await checkPhysicalChargerNow();
  if (chargerOutcome?.ok) {
    return chargerOutcome;
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
 * Opens Chrome/Edge's native WebHID picker on PC so the player can authorize
 * any physical USB peripheral connected to their computer (mouse, keyboard,
 * headset, controller, USB dongle) when WebUSB has no claimable devices.
 */
export async function requestPhysicalHidDevice(): Promise<UsbConnectionOutcome> {
  const hid = getNavigatorHid();
  if (!hid) {
    return {
      ok: false,
      errorCode: 'UNSUPPORTED_BROWSER',
    };
  }

  try {
    const devices = await hid.requestDevice({ filters: [] });
    if (!devices || devices.length === 0) {
      return {
        ok: false,
        errorCode: 'USER_CANCELLED',
      };
    }
    const first = devices[0];
    const vid = first.vendorId.toString(16).padStart(4, '0');
    const pid = first.productId.toString(16).padStart(4, '0');
    return {
      ok: true,
      deviceFingerprint: `webhid:${vid}:${pid}`,
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
 * - Immediately detects if a mobile phone/laptop is already plugged into a USB charger
 *   upon entering the dead-battery screen.
 * - Tracks live `charging === false -> true` transitions (`sawUnplugged`) so a laptop
 *   at 100% battery still triggers cleanly when the user plugs in the charger.
 * - Listens to live `chargingchange` + `levelchange` events AND runs a lightweight
 *   1.2s backup poll so Android devices never miss a cable insertion event.
 */
export function subscribePhysicalChargerEvents(handlers: {
  onChargerConnected: (fingerprint: string) => void;
  onChargerDisconnected: () => void;
}): () => void {
  const batteryPromise = getNavigatorBattery();
  if (!batteryPromise) return () => {};

  let disposed = false;
  let batteryRef: BatteryManagerLike | null = null;
  let wasActivelyCharging = false;
  let sawUnplugged = false;
  let pollTimer: number | null = null;
  const mobile = isLikelyMobileDevice();

  const evaluateBattery = (battery: BatteryManagerLike) => {
    if (disposed) return;
    if (!battery.charging) {
      sawUnplugged = true;
    }
    const nowActive = isRealBatteryActivelyCharging(battery, {
      isMobile: mobile,
      sawUnplugged,
    });
    if (nowActive && !wasActivelyCharging) {
      wasActivelyCharging = true;
      handlers.onChargerConnected(
        `usb-power:${Math.round(battery.level * 100)}pct`
      );
    } else if (!nowActive && wasActivelyCharging) {
      wasActivelyCharging = false;
      handlers.onChargerDisconnected();
    }
  };

  const handleEvent = () => {
    if (batteryRef) {
      evaluateBattery(batteryRef);
    }
  };

  void batteryPromise
    .then((battery) => {
      if (disposed) return;
      batteryRef = battery;
      evaluateBattery(battery);
      battery.addEventListener('chargingchange', handleEvent);
      battery.addEventListener('levelchange', handleEvent);

      if (typeof window !== 'undefined') {
        pollTimer = window.setInterval(() => {
          if (disposed) return;
          const freshPromise = getNavigatorBattery();
          if (freshPromise) {
            void freshPromise.then((fresh) => evaluateBattery(fresh)).catch(() => {});
          } else if (batteryRef) {
            evaluateBattery(batteryRef);
          }
        }, 1200);
      }
    })
    .catch(() => {});

  return () => {
    disposed = true;
    if (pollTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(pollTimer);
    }
    if (batteryRef) {
      batteryRef.removeEventListener('chargingchange', handleEvent);
      batteryRef.removeEventListener('levelchange', handleEvent);
    }
  };
}

/**
 * Subscribes to live PC USB audio/video hardware insertions via MediaDevices `devicechange`.
 * Works across Chrome, Edge, Firefox, and Safari on desktop (even inside iframes!)
 * whenever a user plugs in a USB headset, USB mic, webcam, or USB-C audio cable.
 */
export function subscribePhysicalMediaUsbEvents(handlers: {
  onDeviceAttached: (fingerprint: string) => void;
}): () => void {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.addEventListener !== 'function' ||
    typeof navigator.mediaDevices.enumerateDevices !== 'function'
  ) {
    return () => {};
  }

  let disposed = false;
  let baselineCount: number | null = null;

  void navigator.mediaDevices
    .enumerateDevices()
    .then((list) => {
      if (!disposed) baselineCount = list.length;
    })
    .catch(() => {});

  const handleDeviceChange = () => {
    void navigator.mediaDevices
      .enumerateDevices()
      .then((list) => {
        if (disposed) return;
        if (baselineCount === null) {
          baselineCount = list.length;
          return;
        }
        if (list.length > baselineCount) {
          baselineCount = list.length;
          handlers.onDeviceAttached(`usb-media:attached-${list.length}`);
        } else {
          baselineCount = list.length;
        }
      })
      .catch(() => {});
  };

  navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
  return () => {
    disposed = true;
    navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
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
