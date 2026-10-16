/**
 * MERA Scripts Repository
 * CRUD operations for local script management.
 */

import { getDatabase } from './database';
import { ScriptRecord } from './types';
import { tokenizeScript } from '../../lib/engine/tokenizer';

function generateId(): string {
  return 'script_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

export async function createScript(
  title: string,
  content: string,
  wpm = 140
): Promise<ScriptRecord> {
  const db = await getDatabase();
  const id = generateId();
  const safeTitle = (title || 'Untitled Script').trim();
  const tokenized = tokenizeScript(content, wpm);
  const now = Date.now();

  const record: ScriptRecord = {
    id,
    title: safeTitle,
    content: content || '',
    word_count: tokenized.totalWords,
    estimated_duration_sec: tokenized.estimatedDurationSec,
    created_at: now,
    updated_at: now,
  };

  await db.runAsync(
    `INSERT INTO scripts (id, title, content, word_count, estimated_duration_sec, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      record.id,
      record.title,
      record.content,
      record.word_count,
      record.estimated_duration_sec,
      record.created_at,
      record.updated_at,
    ]
  );

  return record;
}

export async function getAllScripts(): Promise<ScriptRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ScriptRecord>(
    `SELECT * FROM scripts ORDER BY updated_at DESC;`
  );
  return rows || [];
}

export async function getScriptById(id: string): Promise<ScriptRecord | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ScriptRecord>(
    `SELECT * FROM scripts WHERE id = ?;`,
    [id]
  );
  return row || null;
}

export async function updateScript(
  id: string,
  title: string,
  content: string,
  wpm = 140
): Promise<ScriptRecord> {
  const db = await getDatabase();
  const safeTitle = (title || 'Untitled Script').trim();
  const tokenized = tokenizeScript(content, wpm);
  const now = Date.now();

  await db.runAsync(
    `UPDATE scripts
     SET title = ?, content = ?, word_count = ?, estimated_duration_sec = ?, updated_at = ?
     WHERE id = ?;`,
    [safeTitle, content, tokenized.totalWords, tokenized.estimatedDurationSec, now, id]
  );

  const updated = await getScriptById(id);
  if (!updated) {
    throw new Error(`Script not found after update: ${id}`);
  }
  return updated;
}

export async function deleteScript(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `DELETE FROM scripts WHERE id = ?;`,
    [id]
  );
  return result.changes > 0;
}

export async function duplicateScript(id: string): Promise<ScriptRecord> {
  const existing = await getScriptById(id);
  if (!existing) {
    throw new Error(`Script ${id} not found to duplicate`);
  }

  const copyTitle = `${existing.title} (Copy)`;
  return createScript(copyTitle, existing.content);
}

export async function searchScripts(query: string): Promise<ScriptRecord[]> {
  const db = await getDatabase();
  const trimmed = query.trim();
  if (!trimmed) {
    return getAllScripts();
  }

  const searchParam = `%${trimmed}%`;
  const rows = await db.getAllAsync<ScriptRecord>(
    `SELECT * FROM scripts
     WHERE title LIKE ? OR content LIKE ?
     ORDER BY updated_at DESC;`,
    [searchParam, searchParam]
  );
  return rows || [];
}
