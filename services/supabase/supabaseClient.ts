/**
 * MERA Supabase Client
 * Initialized with SQLite local persistence adapter for seamless session recovery.
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, isSupabaseConfigured } from './config';
import { getUserSetting, saveRawSetting } from '../database/settingsRepo';

// Custom SQLite-backed storage adapter for session persistence
const SQLiteAuthStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await getUserSetting(`auth_${key}`, null);
      return typeof val === 'string' ? val : val ? JSON.stringify(val) : null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await saveRawSetting(`auth_${key}`, value);
    } catch (err) {
      console.warn('[Supabase Storage] Failed to write session key:', err);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await saveRawSetting(`auth_${key}`, null);
    } catch (err) {
      console.warn('[Supabase Storage] Failed to remove session key:', err);
    }
  },
};

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    storage: SQLiteAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
