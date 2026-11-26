import {
  CANON_PASSCODE_FORMAT,
  CANON_PROFILE,
  type PasscodeDateFormat,
} from './canonConfig';

const DIGEST_SALT = 'leticia-cap00-v1::device-lock-verifier';

/**
 * Pure deterministic 128-bit digest (4x32-bit FNV/Murmur-inspired mixing)
 * so passcode verification never compares or exposes plaintext codes in
 * runtime state, logs, or UI layers, and runs synchronously in both browser
 * and Node unit test environments.
 */
export function computePasscodeDigest(input: string): string {
  const payload = `${DIGEST_SALT}:${input}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  let h3 = 0x85ebca6b;
  let h4 = 0xc2b2ae35;

  for (let i = 0; i < payload.length; i += 1) {
    const code = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code + i), 0x27d4eb2d);
    h3 = Math.imul(h3 ^ (code << 3), 0x165667b1);
    h4 = Math.imul(h4 ^ (code + (i * 17)), 0x9e3779b1);
  }

  h1 ^= h3 >>> 16;
  h2 ^= h4 >>> 13;
  h3 ^= h1 >>> 15;
  h4 ^= h2 >>> 11;

  return [h1, h2, h3, h4]
    .map((n) => (n >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

export function getPasscodeLength(
  format: PasscodeDateFormat = CANON_PASSCODE_FORMAT
): number {
  switch (format) {
    case 'DDMM':
      return 4;
    case 'DDMMAA':
      return 6;
    case 'DDMMAAAA':
    default:
      return 8;
  }
}

/**
 * Extracts canonical date digits according to the configured format and
 * returns only the irreversible digest of the reversed digit sequence.
 */
export function deriveCanonicalPasscodeDigest(
  birthDate: string = CANON_PROFILE.birthDate,
  format: PasscodeDateFormat = CANON_PASSCODE_FORMAT
): string {
  const parts = birthDate.split('/').map((part) => part.trim());
  if (parts.length !== 3) {
    throw new Error('Data canônica inválida. Formato esperado: DD/MM/AAAA.');
  }

  const [day, month, year] = parts;
  let canonicalDigits = '';

  if (format === 'DDMM') {
    canonicalDigits = `${day}${month}`;
  } else if (format === 'DDMMAA') {
    canonicalDigits = `${day}${month}${year.slice(-2)}`;
  } else {
    canonicalDigits = `${day}${month}${year}`;
  }

  const expectedLength = getPasscodeLength(format);
  if (!/^\d+$/.test(canonicalDigits) || canonicalDigits.length !== expectedLength) {
    throw new Error('Comprimento da data canônica incompatível com o formato.');
  }

  const reversedSequence = canonicalDigits.split('').reverse().join('');
  return computePasscodeDigest(reversedSequence);
}

const CANONICAL_DIGEST = deriveCanonicalPasscodeDigest();

/**
 * Constant-time-style digest comparison.
 * Returns only a boolean — never reveals per-digit accuracy or hints.
 */
export function verifyPasscode(
  attempt: string,
  expectedDigest: string = CANONICAL_DIGEST,
  expectedLength: number = getPasscodeLength()
): boolean {
  if (!/^\d+$/.test(attempt) || attempt.length !== expectedLength) {
    return false;
  }

  const attemptDigest = computePasscodeDigest(attempt);
  if (attemptDigest.length !== expectedDigest.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < expectedDigest.length; i += 1) {
    mismatch |= attemptDigest.charCodeAt(i) ^ expectedDigest.charCodeAt(i);
  }
  return mismatch === 0;
}
