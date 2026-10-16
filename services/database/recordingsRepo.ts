/**
 * MERA Recordings Repository
 * Local metadata management for recorded videos.
 */

import { getDatabase } from './database';
import { RecordingRecord } from './types';
import * as FileSystem from 'expo-file-system/legacy';

function generateId(): string {
  return 'rec_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

export async function saveRecordingMetadata(
  data: Omit<RecordingRecord, 'id' | 'created_at'>
): Promise<RecordingRecord> {
  const db = await getDatabase();
  const id = generateId();
  const now = Date.now();

  const record: RecordingRecord = {
    id,
    script_id: data.script_id ? String(data.script_id) : null,
    title: (data.title || 'Untitled Recording').trim(),
    file_uri: String(data.file_uri || ''),
    thumbnail_uri: data.thumbnail_uri ? String(data.thumbnail_uri) : null,
    duration_sec: Math.max(0, Math.round(Number(data.duration_sec) || 0)),
    file_size_bytes: Math.max(0, Math.round(Number(data.file_size_bytes) || 0)),
    preset_used: String(data.preset_used || 'tiktok_reels'),
    created_at: now,
  };

  try {
    await db.runAsync(
      `INSERT INTO recordings (id, script_id, title, file_uri, thumbnail_uri, duration_sec, file_size_bytes, preset_used, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id,
        record.script_id,
        record.title,
        record.file_uri,
        record.thumbnail_uri,
        record.duration_sec,
        record.file_size_bytes,
        record.preset_used,
        record.created_at,
      ]
    );
  } catch (err: any) {
    console.warn('[RecordingsRepo] Standard insert failed, attempting safe fallback:', err?.message);
    // If the insert failed due to a foreign key constraint (e.g. temporary or unsaved script):
    await db.runAsync(
      `INSERT INTO recordings (id, script_id, title, file_uri, thumbnail_uri, duration_sec, file_size_bytes, preset_used, created_at)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?);`,
      [
        record.id,
        record.title,
        record.file_uri,
        record.thumbnail_uri,
        record.duration_sec,
        record.file_size_bytes,
        record.preset_used,
        record.created_at,
      ]
    );
    record.script_id = null;
  }

  return record;
}

export async function getAllRecordings(): Promise<RecordingRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecordingRecord>(
    `SELECT * FROM recordings ORDER BY created_at DESC;`
  );
  return rows || [];
}

export async function getRecordingById(id: string): Promise<RecordingRecord | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RecordingRecord>(
    `SELECT * FROM recordings WHERE id = ?;`,
    [id]
  );
  return row || null;
}

export async function updateRecordingTitle(id: string, newTitle: string): Promise<RecordingRecord> {
  const db = await getDatabase();
  const safeTitle = (newTitle || 'Untitled Recording').trim();

  await db.runAsync(
    `UPDATE recordings SET title = ? WHERE id = ?;`,
    [safeTitle, id]
  );

  const updated = await getRecordingById(id);
  if (!updated) {
    throw new Error(`Recording not found: ${id}`);
  }
  return updated;
}

export async function deleteRecording(id: string): Promise<boolean> {
  const db = await getDatabase();
  const existing = await getRecordingById(id);
  
  if (existing && existing.file_uri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(existing.file_uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(existing.file_uri, { idempotent: true });
      }
    } catch (err) {
      console.warn('Could not delete local video file:', err);
    }
  }

  const result = await db.runAsync(
    `DELETE FROM recordings WHERE id = ?;`,
    [id]
  );
  return result.changes > 0;
}
