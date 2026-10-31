export type ThemePreference = 'light' | 'dark' | 'system';
export type LeapDayPolicy = 'feb28' | 'mar1';
export type DstAmbiguityPolicy = 'earlier' | 'later';

export interface LocalDate {
  year: number;
  month: number;
  day: number;
}

export interface LocalDateTime extends LocalDate {
  hour: number;
  minute: number;
}

export interface AgeInput {
  birth: LocalDateTime;
  reference: LocalDateTime;
  timeZone: string;
  includeTime: boolean;
  leapDayPolicy: LeapDayPolicy;
  dstAmbiguityPolicy?: DstAmbiguityPolicy;
}

export interface AgeBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
}

export interface BirthdayCountdown {
  nextBirthday: LocalDate;
  weekday: string;
  daysUntil: number;
  ageTurning: number;
}

export interface Milestone {
  label: string;
  date: LocalDate;
  weekday: string;
  reached: boolean;
}

export interface SavedProfile {
  id: string;
  name: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: ThemePreference;
  reducedMotion: boolean;
  highContrast: boolean;
  defaultTimeZone: string;
  leapDayPolicy: LeapDayPolicy;
  dstAmbiguityPolicy: DstAmbiguityPolicy;
  onboardingComplete: boolean;
}
