/**
 * MERA Settings Repository
 * Key-Value preferences stored in SQLite.
 */

import { getDatabase } from './database';
import { DEFAULT_USER_SETTINGS, UserSettings } from './types';

export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM settings;`
  );

  const settings: Partial<UserSettings> = { ...DEFAULT_USER_SETTINGS };

  for (const row of rows || []) {
    try {
      (settings as any)[row.key] = JSON.parse(row.value);
    } catch {
      (settings as any)[row.key] = row.value;
    }
  }

  return settings as UserSettings;
}

export async function saveUserSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K]
): Promise<void> {
  const db = await getDatabase();
  const serialized = JSON.stringify(value);

  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [key, serialized]
  );
}

export async function getUserSetting<T = any>(
  key: string,
  defaultValue: T | null = null
): Promise<T | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM settings WHERE key = ?;`,
    [key]
  );
  if (!row) return defaultValue;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value as unknown as T;
  }
}

export async function saveRawSetting(key: string, value: any): Promise<void> {
  const db = await getDatabase();
  const serialized = JSON.stringify(value);

  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [key, serialized]
  );
}

export async function resetUserSettings(): Promise<UserSettings> {
  const db = await getDatabase();
  for (const [key, val] of Object.entries(DEFAULT_USER_SETTINGS)) {
    await db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
      [key, JSON.stringify(val)]
    );
  }
  return { ...DEFAULT_USER_SETTINGS };
}
