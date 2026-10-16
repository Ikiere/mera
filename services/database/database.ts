/**
 * MERA SQLite Database Service
 * Embedded persistent storage for scripts, recordings metadata, and user settings.
 */

import * as SQLite from 'expo-sqlite';
import { DEFAULT_USER_SETTINGS, UserSettings } from './types';
import { tokenizeScript } from '../../lib/engine/tokenizer';

const DB_NAME = 'mera_production.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        await initTables(db);
        return db;
      } catch (error) {
        dbPromise = null;
        console.error('[MERA Database] Connection initialization failed:', error);
        throw error;
      }
    })();
  }
  return dbPromise;
}

async function initTables(db: SQLite.SQLiteDatabase): Promise<void> {
  // Execute table creation in a transaction
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS scripts (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0,
      estimated_duration_sec INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY NOT NULL,
      script_id TEXT,
      title TEXT NOT NULL,
      file_uri TEXT NOT NULL,
      thumbnail_uri TEXT,
      duration_sec REAL NOT NULL DEFAULT 0,
      file_size_bytes INTEGER NOT NULL DEFAULT 0,
      preset_used TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(script_id) REFERENCES scripts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  await seedInitialDataIfNeeded(db);
}

async function seedInitialDataIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  // Check if any scripts exist
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM scripts;'
  );

  if (!countRow || countRow.count === 0) {
    const welcomeTitle = 'Welcome to MERA Video Director';
    const welcomeContent = `Welcome to MERA, your personal AI-assisted video director!

With MERA, you never have to memorize your lines or stare awkwardly while a teleprompter scrolls past too fast.

As you speak, MERA listens to your voice and follows your exact words. If you pause to breathe or think, MERA patiently waits for you.

When you skip ahead to your next point, MERA smoothly catches right up.

Position your camera at eye level, check your framing with the Smart Setup Assistant, and tap Record when you're ready to create something extraordinary.`;

    const tokenized = tokenizeScript(welcomeContent, 140);
    const now = Date.now();

    await db.runAsync(
      `INSERT INTO scripts (id, title, content, word_count, estimated_duration_sec, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        'welcome_script_01',
        welcomeTitle,
        welcomeContent,
        tokenized.totalWords,
        tokenized.estimatedDurationSec,
        now,
        now,
      ]
    );
  }

  // Ensure default settings exist
  for (const [key, val] of Object.entries(DEFAULT_USER_SETTINGS)) {
    const existing = await db.getFirstAsync<{ key: string }>(
      'SELECT key FROM settings WHERE key = ?;',
      [key]
    );
    if (!existing) {
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?);',
        [key, JSON.stringify(val)]
      );
    }
  }

  // Ensure initial demo recordings matching design reference exist
  const countRecs = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM recordings;'
  );
  if (!countRecs || countRecs.count === 0) {
    const now = Date.now();
    const demoItems = [
      {
        id: 'rec_demo_1',
        title: 'Product Update',
        duration_sec: 154,
        file_size_bytes: 1024 * 1024 * 38,
        created_at: now - 3600 * 1000 * 3,
      },
      {
        id: 'rec_demo_2',
        title: 'Lesson 1 – Python Basics',
        duration_sec: 312,
        file_size_bytes: 1024 * 1024 * 85,
        created_at: now - 3600 * 1000 * 26,
      },
      {
        id: 'rec_demo_3',
        title: 'Brand Introduction',
        duration_sec: 108,
        file_size_bytes: 1024 * 1024 * 28,
        created_at: now - 3600 * 1000 * 75,
      },
    ];

    for (const demo of demoItems) {
      await db.runAsync(
        `INSERT INTO recordings (id, script_id, title, file_uri, thumbnail_uri, duration_sec, file_size_bytes, preset_used, created_at)
         VALUES (?, NULL, ?, ?, NULL, ?, ?, 'tiktok_reels', ?);`,
        [
          demo.id,
          demo.title,
          `file://local/recordings/${demo.id}.mp4`,
          demo.duration_sec,
          demo.file_size_bytes,
          demo.created_at,
        ]
      );
    }
  }
}
