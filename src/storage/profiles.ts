import type { SavedProfile } from '../types/models';
import { validateBirthDateString, validateProfileName } from '../domain/validation';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'chronoage.profiles.v1';
const MAX_PROFILES = 100;

interface ProfileEnvelope {
  schemaVersion: 1;
  profiles: SavedProfile[];
}

function isSavedProfile(value: unknown): value is SavedProfile {
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

function parseEnvelope(raw: string | null): ProfileEnvelope {
  if (!raw) return { schemaVersion: 1, profiles: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid profile envelope');
    const candidate = parsed as Record<string, unknown>;
    if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.profiles)) {
      throw new Error('Unsupported profile schema');
    }
    const profiles = candidate.profiles.filter(isSavedProfile).slice(0, MAX_PROFILES);
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

export function clearProfiles(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportProfiles(): string {
  return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), profiles: loadProfiles() }, null, 2);
}

export function importProfiles(raw: string): SavedProfile[] {
  if (raw.length > 1_000_000) throw new Error('Backup file is too large.');
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid backup file.');
  const value = parsed as Record<string, unknown>;
  if (value.schemaVersion !== 1 || !Array.isArray(value.profiles)) throw new Error('Unsupported backup format.');

  const imported = value.profiles.map((entry) => {
    if (!isSavedProfile(entry)) throw new Error('Backup contains an invalid profile.');
    return {
      ...entry,
      id: typeof entry.id === 'string' && entry.id ? entry.id : crypto.randomUUID(),
      name: validateProfileName(entry.name),
      birthDate: validateBirthDateString(entry.birthDate),
    };
  });
  if (imported.length > MAX_PROFILES) throw new Error(`Backup exceeds the ${MAX_PROFILES} profile limit.`);
  persist(imported);
  return imported;
}
