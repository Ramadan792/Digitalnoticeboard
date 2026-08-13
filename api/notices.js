import express from 'express';
import cors from 'cors';
import { readNotices, writeNotices } from './_lib/store.js';

// Vercel maps this file to the "/api/notices" route based on its filename.
// An Express app is a valid Node request handler on its own (it's just a
// function of (req, res)), so exporting it directly as the default export
// is all Vercel needs to run it as the function for this route.
const app = express();

app.use(cors()); // reflects the request's Origin and handles OPTIONS preflight
app.use(express.json({ limit: '10mb' })); // generous limit: submitted images arrive as base64

// GET /api/notices — everything, newest first
app.get('/api/notices', async (req, res) => {
  const notices = await readNotices();
  notices.sort((a, b) => new Date(b.dateModified) - new Date(a.dateModified));
  res.status(200).json(notices);
});

// POST /api/notices — create a submission; always starts "pending"
// regardless of what the client sends, so nothing can self-approve.
app.post('/api/notices', async (req, res) => {
  const notices = await readNotices();
  const nextId = notices.length ? Math.max(...notices.map((n) => n.id)) + 1 : 1;

  const newNotice = {
    ...req.body,
    id: nextId,
    status: 'pending',
    dateModified: new Date().toISOString(),
  };

  notices.push(newNotice);
  await writeNotices(notices);
  res.status(201).json(newNotice);
});

export default app;
