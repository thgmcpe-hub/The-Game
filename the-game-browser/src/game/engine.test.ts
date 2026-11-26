import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHORIZED_USB_DESCRIPTORS,
  CANON_PASSCODE_FORMAT,
  CANON_PROFILE,
  CHARGING_MILESTONES,
  LOCKOUT_POLICY,
} from './canonConfig';
import {
  deriveCanonicalPasscodeDigest,
  getPasscodeLength,
  verifyPasscode,
} from './passcode';
import {
  classifyUsbException,
  isRealBatteryActivelyCharging,
  performUsbHandshake,
  validateUsbDevice,
  type UsbDeviceLike,
} from './usbHardware';
import {
  chapterReducer,
  createInitialChapterState,
  getRemainingLockoutSeconds,
  isLockedOut,
} from './stateMachine';
import {
  loadRestoredState,
  PROGRESS_STORAGE_KEY,
  saveProgress,
  type StorageLike,
} from './persistence';
import {
  countPassedHomologation,
  createEmptyHomologationStatus,
  formatHomologationReport,
} from './homologation';
import {
  PHONE_MESSAGES,
  PHONE_NOTES,
  PROLOGUE_BLOCKS,
} from './phoneContent';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function getExpectedReversedPasscodeForTest(): string {
  const [day, month, year] = CANON_PROFILE.birthDate.split('/');
  const digits =
    CANON_PASSCODE_FORMAT === 'DDMM'
      ? `${day}${month}`
      : CANON_PASSCODE_FORMAT === 'DDMMAA'
        ? `${day}${month}${year.slice(-2)}`
        : `${day}${month}${year}`;
  return digits.split('').reverse().join('');
}

test('1. Sem USB conectado, não é possível iniciar o aparelho', () => {
  let state = createInitialChapterState({ skipPrologue: true });
  assert.equal(state.phase, 'DEVICE_DEAD');

  state = chapterReducer(state, { type: 'TAP_DEAD_SCREEN' });
  assert.equal(state.phase, 'DEVICE_DEAD');
  assert.equal(state.deadBatteryPulseId, 1);

  state = chapterReducer(state, { type: 'CHARGING_COMPLETE' });
  assert.equal(state.phase, 'DEVICE_DEAD');

  state = chapterReducer(state, { type: 'BOOT_COMPLETE' });
  assert.equal(state.phase, 'DEVICE_DEAD');

  state = chapterReducer(state, { type: 'KEYPAD_DIGIT', digit: '0', now: 1000 });
  assert.equal(state.phase, 'DEVICE_DEAD');
});

test('2. Conectar um periférico não autorizado não desbloqueia o estado', async () => {
  const randomMouse: UsbDeviceLike = {
    vendorId: 0x046d,
    productId: 0xc52b,
    serialNumber: 'LOGI-999',
  };

  const validation = validateUsbDevice(randomMouse);
  assert.equal(validation.authorized, false);
  assert.equal(validation.errorCode, 'UNAUTHORIZED_DEVICE');

  const handshake = await performUsbHandshake(randomMouse);
  assert.equal(handshake.ok, false);
  assert.equal(handshake.errorCode, 'UNAUTHORIZED_DEVICE');

  // Wrong serial prefix on matching VID/PID is also rejected
  const wrongSerialDevice: UsbDeviceLike = {
    vendorId: AUTHORIZED_USB_DESCRIPTORS[0].vendorId,
    productId: AUTHORIZED_USB_DESCRIPTORS[0].productId,
    serialNumber: 'FAKE-0001',
  };
  assert.equal(validateUsbDevice(wrongSerialDevice).authorized, false);

  let state = createInitialChapterState({ skipPrologue: true });
  state = chapterReducer(state, {
    type: 'USB_VALIDATION_FAILED',
    errorCode: 'UNAUTHORIZED_DEVICE',
  });
  assert.equal(state.phase, 'DEVICE_DEAD');
  assert.equal(state.usbConnected, false);
});

test('3. Conectar o USB correto dispara a sequência de inicialização', async () => {
  let openedCalled = false;
  const authorizedDevice: UsbDeviceLike = {
    vendorId: AUTHORIZED_USB_DESCRIPTORS[0].vendorId,
    productId: AUTHORIZED_USB_DESCRIPTORS[0].productId,
    serialNumber: 'LTC-0042',
    opened: false,
    open: async () => {
      openedCalled = true;
    },
  };

  const handshake = await performUsbHandshake(authorizedDevice);
  assert.equal(handshake.ok, true);
  assert.equal(openedCalled, true);
  assert.ok(handshake.deviceFingerprint);

  let state = createInitialChapterState({ skipPrologue: true });
  state = chapterReducer(state, {
    type: 'USB_VALIDATION_SUCCEEDED',
    deviceFingerprint: handshake.deviceFingerprint!,
  });
  assert.equal(state.phase, 'DEVICE_CHARGING');
  assert.equal(state.usbConnected, true);

  state = chapterReducer(state, { type: 'CHARGING_COMPLETE' });
  assert.equal(state.phase, 'DEVICE_BOOTING');

  state = chapterReducer(state, { type: 'BOOT_COMPLETE' });
  assert.equal(state.phase, 'DEVICE_LOCKED');
});

test('4. Falhas de conexão, desconexão e permissões são tratadas corretamente', async () => {
  const deniedError = new Error('Permission denied');
  deniedError.name = 'SecurityError';
  assert.equal(classifyUsbException(deniedError), 'PERMISSION_DENIED');

  const cancelError = new Error('No device selected');
  cancelError.name = 'NotFoundError';
  assert.equal(classifyUsbException(cancelError), 'USER_CANCELLED');

  const flakyDevice: UsbDeviceLike = {
    vendorId: AUTHORIZED_USB_DESCRIPTORS[1].vendorId,
    productId: AUTHORIZED_USB_DESCRIPTORS[1].productId,
    open: async () => {
      const err = new Error('Lost link');
      err.name = 'NetworkError';
      throw err;
    },
  };
  const outcome = await performUsbHandshake(flakyDevice);
  assert.equal(outcome.ok, false);
  assert.equal(outcome.errorCode, 'CONNECTION_LOST');

  // Unplugging during charging drops power back to DEVICE_DEAD
  let state = createInitialChapterState({ skipPrologue: true });
  state = chapterReducer(state, {
    type: 'USB_VALIDATION_SUCCEEDED',
    deviceFingerprint: '1209:4c54:noserial',
  });
  assert.equal(state.phase, 'DEVICE_CHARGING');
  state = chapterReducer(state, {
    type: 'USB_DISCONNECTED',
    deviceFingerprint: '1209:4c54:noserial',
  });
  assert.equal(state.phase, 'DEVICE_DEAD');
  assert.equal(state.usbConnected, false);
});

test('5 & 6. Teclado numérico funciona e senha incorreta bloqueia acesso com cooldown', () => {
  let state = createInitialChapterState({ skipPrologue: true });
  state = chapterReducer(state, {
    type: 'USB_VALIDATION_SUCCEEDED',
    deviceFingerprint: '2e8a:000a:LTC-1',
  });
  state = chapterReducer(state, { type: 'CHARGING_COMPLETE' });
  state = chapterReducer(state, { type: 'BOOT_COMPLETE' });
  assert.equal(state.phase, 'DEVICE_LOCKED');

  // Forward birth date (unreversed) MUST NOT unlock
  const forwardDateDigits = CANON_PROFILE.birthDate.replace(/\D/g, '');
  assert.equal(verifyPasscode(forwardDateDigits), false);

  // Enter digits and test backspace
  state = chapterReducer(state, { type: 'KEYPAD_DIGIT', digit: '1', now: 1000 });
  state = chapterReducer(state, { type: 'KEYPAD_DIGIT', digit: '4', now: 1000 });
  assert.equal(state.enteredDigits, '14');
  state = chapterReducer(state, { type: 'KEYPAD_BACKSPACE' });
  assert.equal(state.enteredDigits, '1');
  state = chapterReducer(state, { type: 'KEYPAD_CLEAR' });
  assert.equal(state.enteredDigits, '');

  // Submit wrong passcode 5 times to trigger lockout cooldown
  const wrongCode = '11111111'.slice(0, getPasscodeLength());
  for (let attempt = 0; attempt < LOCKOUT_POLICY.maxAttemptsBeforeLockout; attempt += 1) {
    for (const digit of wrongCode) {
      state = chapterReducer(state, {
        type: 'KEYPAD_DIGIT',
        digit,
        now: 10_000 + attempt * 100,
      });
    }
  }

  assert.equal(state.phase, 'DEVICE_LOCKED');
  assert.equal(state.failedAttempts, LOCKOUT_POLICY.maxAttemptsBeforeLockout);
  assert.equal(isLockedOut(state, 10_500), true);
  assert.ok(getRemainingLockoutSeconds(state, 10_500) > 0);

  // Even correct digits during lockout are ignored until cooldown expires
  const firstCorrectDigit = getExpectedReversedPasscodeForTest()[0];
  state = chapterReducer(state, {
    type: 'KEYPAD_DIGIT',
    digit: firstCorrectDigit,
    now: 11_000,
  });
  assert.equal(state.enteredDigits, '');
});

test('7. A senha correta (data canônica invertida) libera o aparelho', () => {
  const reversed = getExpectedReversedPasscodeForTest();
  assert.equal(verifyPasscode(reversed), true);

  // Also test alternate formats via pure derivation
  const ddmmaaDigest = deriveCanonicalPasscodeDigest('14/07/1990', 'DDMMAA');
  assert.equal(verifyPasscode('097041', ddmmaaDigest, 6), true);
  assert.equal(verifyPasscode('140790', ddmmaaDigest, 6), false);

  let state = createInitialChapterState({ skipPrologue: true });
  state = chapterReducer(state, {
    type: 'USB_VALIDATION_SUCCEEDED',
    deviceFingerprint: '2e8a:000a:LTC-1',
  });
  state = chapterReducer(state, { type: 'CHARGING_COMPLETE' });
  state = chapterReducer(state, { type: 'BOOT_COMPLETE' });

  for (const digit of reversed) {
    state = chapterReducer(state, {
      type: 'KEYPAD_DIGIT',
      digit,
      now: 50_000,
    });
  }

  assert.equal(state.phase, 'DEVICE_UNLOCKED');
  assert.equal(state.enteredDigits, '');
  assert.equal(state.unlockedAt, 50_000);
});

test('8. Recarregar (F5) reinicia na tela inicial mantendo nome do detetive e bloqueio ativo de 30s', () => {
  const storage = createMemoryStorage();

  // Case A: Starting requires a non-empty detective name
  let intake = createInitialChapterState();
  assert.equal(intake.phase, 'TITLE_INTAKE');
  intake = chapterReducer(intake, {
    type: 'START_INVESTIGATION',
    detectiveName: '   ',
  });
  assert.equal(intake.phase, 'TITLE_INTAKE');

  intake = chapterReducer(intake, {
    type: 'START_INVESTIGATION',
    detectiveName: 'Rafael Mendes',
  });
  assert.equal(intake.phase, 'PROLOGUE_PAST');
  assert.equal(intake.detectiveName, 'Rafael Mendes');

  // Case B: Reloading from locked state restarts at TITLE_INTAKE with saved detectiveName
  let lockedState = createInitialChapterState({
    skipPrologue: true,
    detectiveName: 'Rafael Mendes',
  });
  lockedState = chapterReducer(lockedState, {
    type: 'USB_VALIDATION_SUCCEEDED',
    deviceFingerprint: '2e8a:000a:LTC-9',
  });
  lockedState = chapterReducer(lockedState, { type: 'CHARGING_COMPLETE' });
  lockedState = chapterReducer(lockedState, { type: 'BOOT_COMPLETE' });
  saveProgress(lockedState, storage);

  const restoredAfterF5 = loadRestoredState({ storage, now: 2000 });
  assert.equal(restoredAfterF5.phase, 'TITLE_INTAKE');
  assert.equal(restoredAfterF5.detectiveName, 'Rafael Mendes');
  assert.equal(restoredAfterF5.usbConnected, false);

  // Case C: Active 30s lockout cooldown is preserved across reload so F5 cannot bypass it
  const wrongCode = '11111111'.slice(0, getPasscodeLength());
  let lockedOutState = lockedState;
  for (let attempt = 0; attempt < LOCKOUT_POLICY.maxAttemptsBeforeLockout; attempt += 1) {
    for (const digit of wrongCode) {
      lockedOutState = chapterReducer(lockedOutState, {
        type: 'KEYPAD_DIGIT',
        digit,
        now: 10_000 + attempt * 100,
      });
    }
  }
  saveProgress(lockedOutState, storage);

  const restoredDuringLockout = loadRestoredState({ storage, now: 15_000 });
  assert.equal(restoredDuringLockout.phase, 'TITLE_INTAKE');
  assert.equal(isLockedOut(restoredDuringLockout, 15_000), true);

  // Corrupted storage falls back safely
  storage.setItem(PROGRESS_STORAGE_KEY, '{invalid-json');
  const fallback = loadRestoredState({ storage, now: 5000 });
  assert.equal(fallback.phase, 'TITLE_INTAKE');
});

test('9 & 10. Prólogo com pistas sutis nos slides 01-05, sem oirártnoc oa no slide 06, celular claro e relatório 10 itens', () => {
  const reversed = getExpectedReversedPasscodeForTest();
  const prologueText = PROLOGUE_BLOCKS.flatMap((b) => [
    b.heading ?? '',
    ...b.lines,
    b.closingDirective ?? '',
  ]).join(' ');

  assert.equal(PROLOGUE_BLOCKS.length, 6);
  assert.equal(PROLOGUE_BLOCKS[0].heading, 'PRÓLOGO');
  assert.ok(PROLOGUE_BLOCKS[0].lines[0].includes('esquina de trás de uma boate'));
  // No literal reversed gibberish words, em-dashes, or heavy-handed "inverte"
  assert.equal(prologueText.includes('etnerf arap sárt ed'), false);
  assert.equal(prologueText.includes('oirártnoc oa'), false);
  assert.equal(prologueText.includes('—'), false);
  assert.equal(/se inverte/i.test(prologueText), false);
  // Subtle organic reverse imagery across slides 02, 03, and 04 (3 clues total)
  const firstFiveText = PROLOGUE_BLOCKS.slice(0, 5)
    .flatMap((b) => b.lines)
    .join(' ');
  assert.ok(firstFiveText.includes('pelo avesso'));
  assert.ok(firstFiveText.includes('do fim ao começo'));
  assert.ok(firstFiveText.includes('de trás para frente'));
  // Slide 01 uses flowing commas instead of choppy periods (at most 1 period per paragraph)
  const slideOnePeriods = (PROLOGUE_BLOCKS[0].lines.join(' ').match(/\./g) ?? []).length;
  assert.ok(slideOnePeriods <= 2);
  // Explicit cell phone retained for analysis & discharged
  assert.ok(/celular pessoal.*retido para análise/i.test(firstFiveText));
  assert.ok(/descarregado/i.test(firstFiveText));
  // Slide 05 is a clean connective bridge; Slide 06 carries slip + closing directive
  assert.equal(PROLOGUE_BLOCKS[4].includeDocumentSlip, undefined);
  assert.equal(PROLOGUE_BLOCKS[5].includeDocumentSlip, true);
  assert.equal(
    PROLOGUE_BLOCKS[5].closingDirective,
    'Desbloqueie o celular para dar início à investigação.'
  );

  const narrativeCorpus = [
    prologueText,
    ...PHONE_MESSAGES.flatMap((t) => [t.preview, ...t.messages.map((m) => m.text)]),
    ...PHONE_NOTES.flatMap((n) => [n.title, n.excerpt, n.body]),
  ].join(' ');

  assert.equal(narrativeCorpus.includes(reversed), false);
  assert.equal(/senha.*anivers/i.test(narrativeCorpus), false);

  const status = createEmptyHomologationStatus();
  assert.equal(countPassedHomologation(status), 0);
  status.no_usb_no_boot = true;
  status.right_passcode_unlocks = true;
  assert.equal(countPassedHomologation(status), 2);

  const report = formatHomologationReport(status, {
    webUsbSupported: true,
    currentPhase: 'DEVICE_LOCKED',
  });
  assert.ok(report.includes('(2/10 aprovados)'));
  assert.ok(report.includes('[x] Sem USB conectado, não é possível iniciar o aparelho'));
});

test('11. Detecção real de carregador ignora desktop sem bateria, aceita celular em 100% e segue 20/40/60/80/100', () => {
  assert.deepEqual([...CHARGING_MILESTONES], [20, 40, 60, 80, 100]);

  // Desktop PC without battery reports charging=true, level=1, chargingTime=0 -> must NOT false-trigger
  assert.equal(
    isRealBatteryActivelyCharging({ charging: true, level: 1, chargingTime: 0 }),
    false
  );

  // Real mobile phone plugged in even at 100% -> MUST trigger!
  assert.equal(
    isRealBatteryActivelyCharging(
      { charging: true, level: 1, chargingTime: 0 },
      { isMobile: true }
    ),
    true
  );

  // Phone unplugged -> false
  assert.equal(
    isRealBatteryActivelyCharging({
      charging: false,
      level: 0.54,
      chargingTime: Infinity,
    }),
    false
  );

  // Laptop at 100% that transitioned from unplugged -> plugged live MUST trigger!
  assert.equal(
    isRealBatteryActivelyCharging(
      { charging: true, level: 1, chargingTime: 0 },
      { isMobile: false, sawUnplugged: true }
    ),
    true
  );

  // Real phone/laptop actively charging on USB -> true
  assert.equal(
    isRealBatteryActivelyCharging({
      charging: true,
      level: 0.62,
      chargingTime: 2400,
    }),
    true
  );
});

test('12. Ecossistema pós-desbloqueio: 25+ contatos, busca global integrada e zero vazamento da senha', async () => {
  const eco = await import('./phoneEcosystem');
  const reversed = getExpectedReversedPasscodeForTest();

  assert.ok(eco.PHONE_CONTACTS.length >= 25);
  assert.ok(eco.ECOSYSTEM_CHATS.some((c) => c.app === 'pulso' && c.archived));
  assert.ok(eco.ECOSYSTEM_TRANSACTIONS.some((t) => t.counterparty === 'M. S. Oliveira'));

  // Cross-app Spotlight search for "Acácias" links contact, chat, email, file, and map place
  const acaciasHits = eco.searchPhoneEcosystem('Acácias');
  const hitApps = new Set(acaciasHits.map((h) => h.appId));
  assert.ok(hitApps.has('pulso'));
  assert.ok(hitApps.has('email'));
  assert.ok(hitApps.has('files'));
  assert.ok(hitApps.has('maps'));

  // Spotlight search for "Pix" reaches Banco Áurea
  const pixHits = eco.searchPhoneEcosystem('devolução chave');
  assert.ok(pixHits.some((h) => h.appId === 'bank' && h.targetId === 'tx-1'));

  // Zero accidental passcode spoiler inside the unlocked OS corpus
  const corpus = [
    ...eco.ECOSYSTEM_CHATS.flatMap((c) => c.messages.map((m) => m.text)),
    ...eco.ECOSYSTEM_NOTES.flatMap((n) => [n.title, ...n.body]),
    ...eco.ECOSYSTEM_EMAILS.flatMap((e) => [e.subject, ...e.body]),
    ...eco.ECOSYSTEM_FILES.flatMap((f) => [f.name, ...f.lines]),
  ].join(' ');
  assert.equal(corpus.includes(reversed), false);
});

