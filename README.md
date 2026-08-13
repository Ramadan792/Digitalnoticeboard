# Online Bulletin Board

React + Vite frontend, Node.js/Express backend running as Vercel
Serverless Functions, deployed as a single project from one GitHub repo.

## Local development

```bash
npm install
npm run dev
```

`npm run dev` runs `vercel dev`, which serves the Vite frontend AND the
`/api` functions together from one local server (usually `http://localhost:3000`)
— this matches how it behaves once deployed, so there's nothing different
to configure for production later.

First run may ask a couple of setup questions (link to a Vercel account,
project name, etc.) — accepting the defaults is fine, and you don't need
a paid account for local dev.

If you just want to iterate on the UI without the API (e.g. no internet,
or `vercel dev` isn't cooperating), `npm run dev:vite-only` runs Vite
alone — but `/api` calls will fail until you're back on `vercel dev`.

## Signing in

**Student** (ID only, no password):

| Student ID | Name |
|---|---|
| STU-2024-001 | Chidi Okonkwo |
| STU-2024-002 | Amaka Nwosu |
| STU-2024-003 | Emeka Adeleke |
| STU-2024-004 | Fatima Suleiman |

**Admin** (pick a name, shared password: `DigitalNoticeBoard`):

| Admin Name | Can do |
|---|---|
| Mrs. Adaeze Okoro | View only |
| Mr. Tunde Bello | View only |
| Main Admin | View, Approve, Reject, **Delete** |

Only Main Admin sees action buttons on `/admin/all-news` — the other two
admins get a read-only table with a "View only" banner.

## API

| Method | Route | Does |
|---|---|---|
| GET | `/api/notices` | all notices, newest first |
| POST | `/api/notices` | create a notice (server forces `status: "pending"`) |
| GET | `/api/notices/:id` | one notice |
| PATCH | `/api/notices/:id` | update fields (used for status changes) |
| DELETE | `/api/notices/:id` | delete |

Implemented as two Express apps (`api/notices.js`, `api/notices/[id].js`),
each exported directly as the default export — Vercel runs an Express app
as a serverless function without any extra adapter, since an Express app
is just a `(req, res)` function under the hood.

## ⚠️ Important: the "database" is a flat file, and that has a real limit

`data/notices.json` is the seed data. **On Vercel, the deployed filesystem
is read-only** except `/tmp`, and `/tmp` is wiped whenever the function's
container recycles (can be minutes) and isn't shared across concurrent
instances or regions. So:

- **Locally**, `api/_lib/store.js` reads/writes `data/notices.json`
  directly — a normal, persistent file. Submissions, approvals, and
  deletes behave exactly as you'd expect.
- **On Vercel**, the same code copies the seed data into `/tmp` on first
  read, then reads/writes `/tmp` from then on. This means the API *works*
  (nothing crashes), but writes are **not durable** — they can vanish
  after a while, and two people hitting different serverless instances
  can see different data.

This is fine for a demo/course project, but don't rely on it for real
data. If you need real persistence, swap the storage backend: everything
funnels through `readNotices()` / `writeNotices()` in `api/_lib/store.js`,
so replacing those two functions with calls to a real database (Vercel
Postgres, Supabase, MongoDB Atlas, etc.) is the only change needed —
`notices.js` and `[id].js` don't need to know what's underneath.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), **Add New → Project**, and
   import the GitHub repo. Vercel auto-detects it's a Vite project.
3. Confirm the build settings (Vercel usually fills these in correctly
   from the Vite preset, but double-check):
   - **Build command:** `vite build`
   - **Output directory:** `dist`
4. No environment variables are required for this setup — leave
   `VITE_API_URL` unset (see `.env.example`). Only set it later if you
   move to a separate database and want to point at a different API origin.
5. Click **Deploy**. Once it's live, both the frontend and `/api/*` routes
   are served from the same domain — no CORS issues, no separate hosting
   to manage.

`vercel.json` handles routing: API requests pass through to the matching
function under `/api`, and everything else falls back to `index.html` so
React Router can handle client-side routes like `/daily-news` on a fresh
page load or refresh.

## Roles & permissions

Enforced entirely in the React frontend (`context/AuthContext.jsx`) —
there's no real auth backend, which the spec explicitly accepts for now:

- `isAuthenticated` — any signed-in user (student or admin)
- `isStudent` / `isAdmin` — which type of account
- `isMainAdmin` — the only admin who can Approve/Reject/Delete

`ProtectedRoute.jsx` reads these: no `isAuthenticated` → redirect to `/`;
`adminOnly` route + student account → redirect to `/daily-news` instead.
The Sidebar hides "Admin access" from students entirely, and
`AdminAllNews.jsx` hides all action buttons (not just Delete) from admins
who aren't Main Admin.

## Light / dark mode

Unchanged from before: `context/ThemeContext.jsx` toggles a `dark` class
on `<html>`, persisted to `localStorage`. Every color in `index.css` is a
CSS custom property re-defined under `:root.dark`, so the whole app
re-themes from that one class toggle.

## Notes

- Poll interval is 10s (`POLL_INTERVAL_MS` in `NewsContext.jsx`).
- Image uploads are base64 data URLs stored directly on the record — same
  size caveat as before, worse now given the `/tmp` durability issue above.
