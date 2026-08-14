import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

// Previously this read/wrote a flat JSON file, which doesn't work reliably
// on Vercel: the deployed filesystem is read-only except /tmp, and /tmp
// isn't shared across serverless instances or durable across container
// recycles — writes (approve/reject/delete/submit) could silently vanish
// or appear inconsistent depending on which instance handled a request.
//
// Now everything is stored under one key ("notices") in a real Redis
// database (Upstash, connected via the Vercel Marketplace — see README).
// This is the ONLY file that changed to make that swap; notices.js and
// [id].js still just call readNotices()/writeNotices() and don't know or
// care what's underneath.
const SEED_PATH = path.join(process.cwd(), 'data', 'notices.json');
const KEY = 'notices';

export async function readNotices() {
  let notices = await kv.get(KEY);

  // First-ever read: the database is empty, so seed it from the bundled
  // data/notices.json (read-only file, still fine to read from — we're
  // not writing back to it). Every read after this comes straight from
  // Redis.
  if (!notices) {
    const seedRaw = await fs.readFile(SEED_PATH, 'utf-8');
    notices = JSON.parse(seedRaw).notices;
    await kv.set(KEY, notices);
  }

  return notices;
}

export async function writeNotices(notices) {
  await kv.set(KEY, notices);
}