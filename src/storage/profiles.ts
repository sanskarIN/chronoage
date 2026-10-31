import type { SavedProfile } from '../types/models';
import { validateBirthDateString, validateProfileName } from '../domain/validation';
import { UserVisibleError } from '../errors';
import { logger } from '../utils/logger';
import { createRandomUuid } from '../utils/randomId';

const STORAGE_KEY = 'chronoage.profiles.v1';
export const MAX_PROFILES = 100;
const MAX_BACKUP_BYTES = 1_000_000;

interface ProfileEnvelope {
  schemaVersion: typeof CURRENT_BACKUP_SCHEMA_VERSION;
  profiles: SavedProfile[];
}

function isSavedProfileShape(value: unknown): value is SavedProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Record<string, unknown>;
  if (
    typeof profile.id !== 'string' ||
    profile.id.length < 1 ||
    profile.id.length > MAX_PROFILE_ID_LENGTH ||
    /[\u0000-\u001F\u007F]/.test(profile.id)
  ) {
    throw new Error('Profile has an invalid id.');
  }
  if (seenIds.has(profile.id)) throw new Error('Profile ids must be unique.');
  if (typeof profile.name !== 'string' || typeof profile.birthDate !== 'string') {
    throw new Error('Profile has invalid fields.');
  }
  if (
    typeof profile.createdAt !== 'string' ||
    typeof profile.updatedAt !== 'string' ||
    !isIsoTimestamp(profile.createdAt) ||
    !isIsoTimestamp(profile.updatedAt)
  ) {
    throw new Error('Profile has invalid timestamps.');
  }
  if (new Date(profile.updatedAt).getTime() < new Date(profile.createdAt).getTime()) {
    throw new Error('Profile update timestamp cannot precede creation.');
  }

  const normalized: SavedProfile = {
    id: profile.id,
    name: validateProfileName(profile.name),
    birthDate: validateBirthDateString(profile.birthDate),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
  seenIds.add(normalized.id);
  return normalized;
}

function emptyEnvelope(): ProfileEnvelope {
  return { schemaVersion: CURRENT_BACKUP_SCHEMA_VERSION, profiles: [] };
}

function isValidTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function normalizeProfile(value: unknown, regenerateId = false): SavedProfile | null {
  if (!isSavedProfileShape(value)) return null;
  try {
    const createdAt = isValidTimestamp(value.createdAt) ? value.createdAt : new Date().toISOString();
    const updatedAt = isValidTimestamp(value.updatedAt) ? value.updatedAt : createdAt;
    return {
      id: regenerateId || value.id.trim().length === 0 ? crypto.randomUUID() : value.id,
      name: validateProfileName(value.name),
      birthDate: validateBirthDateString(value.birthDate),
      createdAt,
      updatedAt,
    };
  } catch {
    return null;
  }
}

function parseEnvelope(raw: string | null): ProfileEnvelope {
  if (!raw) return emptyEnvelope();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid profile envelope');
    const candidate = parsed as Record<string, unknown>;
    if (candidate.schemaVersion !== CURRENT_BACKUP_SCHEMA_VERSION || !Array.isArray(candidate.profiles)) {
      throw new Error('Unsupported profile schema');
    }

    const profiles: SavedProfile[] = [];
    const ids = new Set<string>();
    for (const entry of candidate.profiles) {
      const normalized = normalizeProfile(entry);
      if (!normalized || ids.has(normalized.id)) continue;
      ids.add(normalized.id);
      profiles.push(normalized);
      if (profiles.length === MAX_PROFILES) break;
    }
    return { schemaVersion: 1, profiles };
  } catch (error) {
    logger.warn('Saved profile data was invalid and was ignored.', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    return emptyEnvelope();
  }
}

function readStoredProfiles(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    logger.warn('Profile storage could not be read; no saved profiles are being loaded.', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    return null;
  }
}

function persist(profiles: SavedProfile[]): void {
  const envelope: ProfileEnvelope = {
    schemaVersion: CURRENT_BACKUP_SCHEMA_VERSION,
    profiles: profiles.slice(0, MAX_PROFILES),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (error) {
    logger.warn('Profile storage could not be written.', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    throw new UserVisibleError(STORAGE_UNAVAILABLE_MESSAGE);
  }
}

export function loadProfiles(): SavedProfile[] {
  return parseEnvelope(readStoredProfiles()).profiles;
}

export function saveProfile(input: { name: string; birthDate: string }): SavedProfile {
  const profiles = loadProfiles();
  if (profiles.length >= MAX_PROFILES) {
    throw new UserVisibleError(`Profile limit of ${MAX_PROFILES} reached.`);
  }
  const now = new Date().toISOString();
  const profile: SavedProfile = {
    id: createRandomUuid(),
    name: validateProfileName(input.name),
    birthDate: validateBirthDateString(input.birthDate),
    createdAt: now,
    updatedAt: now,
  };
  persist([profile, ...profiles]);
  return profile;
}

export function updateProfile(id: string, input: { name: string; birthDate: string }): SavedProfile {
  const profiles = loadProfiles();
  const current = profiles.find((profile) => profile.id === id);
  if (!current) throw new UserVisibleError('Profile not found.');
  const updated: SavedProfile = {
    ...current,
    name: validateProfileName(input.name),
    birthDate: validateBirthDateString(input.birthDate),
    updatedAt: nextUpdateTimestamp(current),
  };
  persist(profiles.map((profile) => (profile.id === id ? updated : profile)));
  return updated;
}

export function deleteProfile(id: string): SavedProfile[] {
  const profiles = loadProfiles();
  if (!profiles.some((profile) => profile.id === id)) {
    throw new UserVisibleError('Profile not found.');
  }
  const next = profiles.filter((profile) => profile.id !== id);
  persist(next);
  return next;
}

export function restoreProfile(profile: SavedProfile, position = 0): SavedProfile[] {
  const profiles = loadProfiles();
  if (profiles.length >= MAX_PROFILES) {
    throw new UserVisibleError(`Profile limit of ${MAX_PROFILES} reached.`);
  }
  if (profiles.some((entry) => entry.id === profile.id)) {
    throw new UserVisibleError('Profile already exists.');
  }

  let restored: SavedProfile;
  try {
    restored = normalizeProfile(profile, new Set<string>());
  } catch {
    throw new UserVisibleError('Profile could not be restored.');
  }
  const normalizedPosition = Number.isFinite(position)
    ? Math.min(Math.max(0, Math.trunc(position)), profiles.length)
    : 0;
  const next = [...profiles];
  next.splice(normalizedPosition, 0, restored);
  persist(next);
  return next;
}

export function restoreProfile(profile: SavedProfile): SavedProfile[] {
  const profiles = loadProfiles();
  if (profiles.some((item) => item.id === profile.id)) return profiles;
  if (profiles.length >= MAX_PROFILES) throw new Error(`Profile limit of ${MAX_PROFILES} reached.`);
  const normalized = normalizeProfile(profile);
  if (!normalized) throw new Error('Profile can no longer be restored.');
  const next = [normalized, ...profiles];
  persist(next);
  return next;
}

export function clearProfiles(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.warn('Profile storage could not be cleared.', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    throw new UserVisibleError(STORAGE_UNAVAILABLE_MESSAGE);
  }
}

export function exportProfiles(): string {
  return JSON.stringify(
    { schemaVersion: 1, exportedAt: new Date().toISOString(), profiles: loadProfiles() },
    null,
    2,
  );
}

export function importProfiles(raw: string): SavedProfile[] {
  if (new Blob([raw]).size > MAX_BACKUP_BYTES) throw new Error('Backup file is too large.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error('Backup is not valid JSON.');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid backup file.');
  const value = parsed as Record<string, unknown>;
  if (value.schemaVersion !== 1 || !Array.isArray(value.profiles)) {
    throw new Error('Unsupported backup format.');
  }
  if (value.profiles.length > MAX_PROFILES) {
    throw new Error(`Backup exceeds the ${MAX_PROFILES} profile limit.`);
  }

  const imported: SavedProfile[] = [];
  const ids = new Set<string>();
  for (const entry of value.profiles) {
    let normalized = normalizeProfile(entry);
    if (!normalized) throw new Error('Backup contains an invalid profile.');
    if (ids.has(normalized.id)) {
      normalized = { ...normalized, id: crypto.randomUUID() };
    }
    ids.add(normalized.id);
    imported.push(normalized);
  }
  persist(imported);
  return imported;
}
