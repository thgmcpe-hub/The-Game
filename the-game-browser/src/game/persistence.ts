import {
  createInitialChapterState,
  type ChapterState,
} from './stateMachine';

export const PROGRESS_STORAGE_KEY = 'leticia_cap00_progress_v3';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PersistedProgress {
  readonly version: 1;
  readonly detectiveName?: string;
  readonly failedAttempts: number;
  readonly lockoutUntil: number | null;
}

/**
 * Extracts only the detective's identification and security-relevant lockout state.
 * Reloading (F5) always restarts cleanly at the case intake screen so the player
 * never misses the start/prologue, while keeping any active 30s lockout intact.
 */
export function serializeAllowedProgress(state: ChapterState): PersistedProgress {
  return {
    version: 1,
    detectiveName: state.detectiveName,
    failedAttempts: state.failedAttempts,
    lockoutUntil: state.lockoutUntil,
  };
}

export function saveProgress(
  state: ChapterState,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    const payload = serializeAllowedProgress(state);
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / private-browsing exceptions gracefully.
  }
}

export function clearProgress(
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

/**
 * Always initializes on TITLE_INTAKE on a fresh page load / F5 (unless
 * `skipPrologue` is explicitly set via `?autostart=1`), while preserving the
 * saved detective name (pre-filled in the form) and any unexpired 30s lockout.
 */
export function loadRestoredState(options?: {
  storage?: StorageLike | null;
  skipPrologue?: boolean;
  now?: number;
}): ChapterState {
  const storage =
    options?.storage === undefined ? getDefaultStorage() : options.storage;
  const now = options?.now ?? Date.now();
  const base = createInitialChapterState({ skipPrologue: options?.skipPrologue });

  if (!storage) return base;

  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    if (parsed.version !== 1) return base;

    const activeLockout =
      typeof parsed.lockoutUntil === 'number' && parsed.lockoutUntil > now
        ? parsed.lockoutUntil
        : null;
    const failedAttempts =
      activeLockout !== null &&
      typeof parsed.failedAttempts === 'number' &&
      parsed.failedAttempts >= 0
        ? Math.floor(parsed.failedAttempts)
        : 0;
    const savedName =
      typeof parsed.detectiveName === 'string'
        ? parsed.detectiveName.trim().slice(0, 40)
        : '';

    return {
      ...base,
      detectiveName: savedName || base.detectiveName,
      failedAttempts,
      lockoutUntil: activeLockout,
    };
  } catch {
    return base;
  }
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
