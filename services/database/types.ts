/**
 * MERA Database Schema Types
 */

export interface ScriptRecord {
  id: string;
  title: string;
  content: string;
  word_count: number;
  estimated_duration_sec: number;
  created_at: number;
  updated_at: number;
}

export interface RecordingRecord {
  id: string;
  script_id: string | null;
  title: string;
  file_uri: string;
  thumbnail_uri: string | null;
  duration_sec: number;
  file_size_bytes: number;
  preset_used: string;
  created_at: number;
}

export interface UserSettings {
  defaultCamera: 'front' | 'back';
  defaultOrientation: 'portrait' | 'landscape';
  prompterFontSize: number;
  prompterOpacity: number;
  prompterPosition: 'top' | 'middle' | 'bottom';
  prompterLayout: 'overlay' | 'split';
  trackingSensitivity: 'low' | 'medium' | 'high';
  pauseDelayMs: number;
  countdownSeconds: number;
  defaultPresetId: string;
  speechLocale: string;
  speakingRateWpm: number;
  hasCompletedOnboarding?: boolean;
  currentUserEmail?: string | null;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultCamera: 'front',
  defaultOrientation: 'portrait',
  prompterFontSize: 24,
  prompterOpacity: 0.75,
  prompterPosition: 'top',
  prompterLayout: 'overlay',
  trackingSensitivity: 'medium',
  pauseDelayMs: 1500,
  countdownSeconds: 3,
  defaultPresetId: 'tiktok_reels',
  speechLocale: 'en-US',
  speakingRateWpm: 140,
  hasCompletedOnboarding: false,
  currentUserEmail: null,
};
