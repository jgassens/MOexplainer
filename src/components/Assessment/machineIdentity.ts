import type { MachineRegistration } from './types';
import { canonicalize, sha256Hex } from './cryptoText';

const DB_NAME = 'moexplainer-assessment-identity-v1';
const STORE_NAME = 'identity';
const RECORD_KEY = 'ecdsa-p256-keypair-v1';

interface StoredIdentityRecord {
  id: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
  createdAt: string;
}

export interface MachineIdentity {
  machineId: string;
  machineCreatedAt: string;
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
  deviceHintHash: string;
}

function openIdentityDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error ?? new Error('Could not open MOexplainer identity database.'));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function readStoredIdentity(): Promise<StoredIdentityRecord | null> {
  const db = await openIdentityDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onerror = () => reject(request.error ?? new Error('Could not read MOexplainer identity.'));
    request.onsuccess = () => resolve((request.result as StoredIdentityRecord | undefined) ?? null);
  });
}

async function writeStoredIdentity(record: StoredIdentityRecord): Promise<void> {
  const db = await openIdentityDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.onerror = () => reject(tx.error ?? new Error('Could not save MOexplainer identity.'));
    tx.oncomplete = () => resolve();
    tx.objectStore(STORE_NAME).put(record);
  });
}

function navigatorHint(): string {
  const screenBits = typeof window === 'undefined' || !window.screen ? 'screen:unknown' : `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const nav = typeof window === 'undefined' ? undefined : window.navigator;
  return [
    nav?.userAgent ?? 'ua:unknown',
    nav?.language ?? 'lang:unknown',
    nav?.platform ?? 'platform:unknown',
    screenBits,
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'tz:unknown',
  ].join('|');
}

async function machineIdFromPublicKey(publicKeyJwk: JsonWebKey): Promise<string> {
  const digest = await sha256Hex(canonicalize(publicKeyJwk));
  return `MOE-${digest.slice(0, 20).toUpperCase()}`;
}

export async function getOrCreateMachineIdentity(): Promise<MachineIdentity> {
  const existing = await readStoredIdentity();
  if (existing) {
    return {
      machineId: await machineIdFromPublicKey(existing.publicKeyJwk),
      machineCreatedAt: existing.createdAt,
      publicKey: existing.publicKey,
      privateKey: existing.privateKey,
      publicKeyJwk: existing.publicKeyJwk,
      deviceHintHash: await sha256Hex(navigatorHint()),
    };
  }

  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign', 'verify'],
  );
  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const record: StoredIdentityRecord = {
    id: RECORD_KEY,
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyJwk,
    createdAt: new Date().toISOString(),
  };
  await writeStoredIdentity(record);
  return {
    machineId: await machineIdFromPublicKey(publicKeyJwk),
    machineCreatedAt: record.createdAt,
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyJwk,
    deviceHintHash: await sha256Hex(navigatorHint()),
  };
}

export async function buildMachineRegistration(studentName: string, studentId: string): Promise<MachineRegistration> {
  const identity = await getOrCreateMachineIdentity();
  return {
    schema: 'moexplainer-machine-registration-v1',
    appName: 'MOexplainer',
    studentName,
    studentId,
    machineId: identity.machineId,
    machineCreatedAt: identity.machineCreatedAt,
    publicKeyJwk: identity.publicKeyJwk,
    deviceHintHash: identity.deviceHintHash,
    exportedAt: new Date().toISOString(),
  };
}
