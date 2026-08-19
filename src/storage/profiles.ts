import type { SavedProfile } from '../types/models';
import { validateBirthDateString, validateProfileName } from '../domain/validation';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'chronoage.profiles.v1';
export const MAX_PROFILES = 100;
const MAX_BACKUP_BYTES = 1_000_000;

interface ProfileEnvelope {
  schemaVersion: 1;
  profiles: SavedProfile[];
}

function isSavedProfileShape(value: unknown): value is SavedProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.birthDate === 'string' &&
    typeof profile.createdAt === 'string' &&
    typeof profile.updatedAt === 'string'
  );
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
  if (!raw) return { schemaVersion: 1, profiles: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid profile envelope');
    const candidate = parsed as Record<string, unknown>;
    if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.profiles)) {
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
    return { schemaVersion: 1, profiles: [] };
  }
}

function persist(profiles: SavedProfile[]): void {
  const envelope: ProfileEnvelope = { schemaVersion: 1, profiles: profiles.slice(0, MAX_PROFILES) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

export function loadProfiles(): SavedProfile[] {
  return parseEnvelope(localStorage.getItem(STORAGE_KEY)).profiles;
}

export function saveProfile(input: { name: string; birthDate: string }): SavedProfile {
  const profiles = loadProfiles();
  if (profiles.length >= MAX_PROFILES) throw new Error(`Profile limit of ${MAX_PROFILES} reached.`);
  const now = new Date().toISOString();
  const profile: SavedProfile = {
    id: crypto.randomUUID(),
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
  if (!current) throw new Error('Profile not found.');
  const updated: SavedProfile = {
    ...current,
    name: validateProfileName(input.name),
    birthDate: validateBirthDateString(input.birthDate),
    updatedAt: new Date().toISOString(),
  };
  persist(profiles.map((profile) => (profile.id === id ? updated : profile)));
  return updated;
}

export function deleteProfile(id: string): SavedProfile[] {
  const next = loadProfiles().filter((profile) => profile.id !== id);
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
  localStorage.removeItem(STORAGE_KEY);
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
