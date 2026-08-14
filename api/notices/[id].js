import express from 'express';
import cors from 'cors';
import { readNotices, writeNotices } from '../_lib/store.js';

// Earlier version matched routes like app.get('/api/notices/:id', ...),
// assuming Vercel always forwards the full original path into this app.
// In production that assumption turned out to be wrong — the plain
// "/api/notices" route (no dynamic segment) worked fine, but this dynamic
// bracket route 404'd on every request, meaning Express's own path
// matching never found a match here and fell through to its default 404
// before our handler code ever ran.
//
// Fix: don't depend on matching a specific path string at all. Use a
// wildcard route (matches any path) and manually pull the ID off the END
// of the URL — this works whether Vercel forwards "/api/notices/7",
// "/notices/7", or just "/7" into this function.
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function getIdFromUrl(url) {
  const withoutQuery = url.split('?')[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

app.get('*', async (req, res) => {
  const id = getIdFromUrl(req.url);
  const notices = await readNotices();
  const notice = notices.find((n) => String(n.id) === id);
  if (!notice) return res.status(404).json({ error: 'Notice not found' });
  res.status(200).json(notice);
});

// PATCH is used for status changes (approve/reject) — only the fields
// present in the body get merged in, so a { status: "approved" } request
// doesn't clobber the rest of the record.
app.patch('*', async (req, res) => {
  const id = getIdFromUrl(req.url);
  const notices = await readNotices();
  const index = notices.findIndex((n) => String(n.id) === id);
  if (index === -1) return res.status(404).json({ error: 'Notice not found' });

  notices[index] = { ...notices[index], ...req.body };
  await writeNotices(notices);
  res.status(200).json(notices[index]);
});

app.delete('*', async (req, res) => {
  const id = getIdFromUrl(req.url);
  const notices = await readNotices();
  const index = notices.findIndex((n) => String(n.id) === id);
  if (index === -1) return res.status(404).json({ error: 'Notice not found' });

  const [deleted] = notices.splice(index, 1);
  await writeNotices(notices);
  res.status(200).json(deleted);
});

export default app;