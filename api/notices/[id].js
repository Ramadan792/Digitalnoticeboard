import express from 'express';
import cors from 'cors';
import { readNotices, writeNotices } from '../_lib/store.js';

// The [id].js filename is Vercel's dynamic-route syntax — it matches any
// "/api/notices/<something>" request. Inside Express we still match on
// the literal ":id" param rather than relying on Vercel's own req.query.id,
// since the whole point of using Express here is to write normal Express
// routes; Vercel just forwards the full original path (e.g. "/api/notices/3")
// into this app, so app.get('/api/notices/:id', ...) matches it directly.
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/notices/:id', async (req, res) => {
  const notices = await readNotices();
  const notice = notices.find((n) => String(n.id) === req.params.id);
  if (!notice) return res.status(404).json({ error: 'Notice not found' });
  res.status(200).json(notice);
});

// PATCH is used for status changes (approve/reject) — only the fields
// present in the body get merged in, so a { status: "approved" } request
// doesn't clobber the rest of the record.
app.patch('/api/notices/:id', async (req, res) => {
  const notices = await readNotices();
  const index = notices.findIndex((n) => String(n.id) === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Notice not found' });

  notices[index] = { ...notices[index], ...req.body };
  await writeNotices(notices);
  res.status(200).json(notices[index]);
});

app.delete('/api/notices/:id', async (req, res) => {
  const notices = await readNotices();
  const index = notices.findIndex((n) => String(n.id) === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Notice not found' });

  const [deleted] = notices.splice(index, 1);
  await writeNotices(notices);
  res.status(200).json(deleted);
});

export default app;
