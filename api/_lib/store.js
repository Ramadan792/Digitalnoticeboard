import fs from 'fs/promises';
import path from 'path';

// The seed file that ships with the deployment bundle. On Vercel this path
// is READ-ONLY at runtime — only /tmp is writable, and /tmp is wiped
// whenever the function's container recycles (which can be as often as
// every few minutes of inactivity) and is never shared across concurrent
// instances or regions.
//
// So: locally (no VERCEL env var), we read/write data/notices.json
// directly — a real, persistent file. On Vercel, we copy the seed data
// into /tmp on first read of a given container, then read/write /tmp from
// then on. This means the API works end-to-end once deployed, but writes
// (submit/approve/reject/delete) are NOT durable in production — they can
// vanish whenever Vercel recycles the container, and two people hitting
// different instances can see different data. See the README for how to
// swap this for a real database without touching notices.js or [id].js —
// they only call readNotices()/writeNotices() below.
const SEED_PATH = path.join(process.cwd(), 'data', 'notices.json');
const WRITABLE_PATH = process.env.VERCEL ? '/tmp/notices.json' : SEED_PATH;

async function ensureWritableFileExists() {
  if (WRITABLE_PATH === SEED_PATH) return; // local dev: the real file already exists
  try {
    await fs.access(WRITABLE_PATH);
  } catch {
    const seed = await fs.readFile(SEED_PATH, 'utf-8');
    await fs.writeFile(WRITABLE_PATH, seed, 'utf-8');
  }
}

export async function readNotices() {
  await ensureWritableFileExists();
  const raw = await fs.readFile(WRITABLE_PATH, 'utf-8');
  return JSON.parse(raw).notices;
}

export async function writeNotices(notices) {
  await ensureWritableFileExists();
  await fs.writeFile(WRITABLE_PATH, JSON.stringify({ notices }, null, 2), 'utf-8');
}
