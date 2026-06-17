import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';

mkdirSync('./data', { recursive: true });

const db = new DatabaseSync('./data/rate_limit.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS rate_limits (
    creator_id INTEGER NOT NULL,
    tag        TEXT    NOT NULL,
    last_called_at INTEGER NOT NULL,
    PRIMARY KEY (creator_id, tag)
  )
`);

const RATE_LIMIT_SECONDS = process.env.RATE_LIMIT_SECONDS ? Number(process.env.RATE_LIMIT_SECONDS) : 300;

const selectStmt = db.prepare(
  'SELECT last_called_at FROM rate_limits WHERE creator_id = ? AND tag = ?'
);
const upsertStmt = db.prepare(
  'INSERT OR REPLACE INTO rate_limits (creator_id, tag, last_called_at) VALUES (?, ?, ?)'
);

export function checkAndUpdate(
  creatorId: string,
  tag: string
): { allowed: boolean; waitSeconds?: number } {
  const now = Math.floor(Date.now() / 1000);
  const row = selectStmt.get(creatorId, tag) as { last_called_at: number } | undefined;

  if (row) {
    const elapsed = now - row.last_called_at;
    if (elapsed < RATE_LIMIT_SECONDS) {
      return { allowed: false, waitSeconds: RATE_LIMIT_SECONDS - elapsed };
    }
  }

  upsertStmt.run(creatorId, tag, now);
  return { allowed: true };
}
