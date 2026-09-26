# Perolt — Frontend

A React (Vite) frontend for Perolt, an AI-powered document knowledge assistant.
This app is UI only — it talks to your existing backend and doesn't touch the
database, API, or RAG pipeline.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. Make sure your backend is
running at `http://localhost:5000` (see `src/services/api.js` for the base
URL) — the upload and ask endpoints described in the brief are wired up
there.

## Structure

```
src/
  components/   UploadZone, DocumentCard, ChatWindow, ChatMessage,
                SourceCard, Sidebar, LoadingIndicator, EmptyState
  pages/        Dashboard, Documents, AskPerolt, Settings
  services/     api.js — uploadDocument(), askQuestion(), getDocuments()
  context/      DocumentsContext — shares the uploaded-document list
                between the Dashboard and Documents pages
  styles/       index.css — design tokens (color, type, radius) shared
                across the app
```

## Notes on the API layer

Two endpoints were specified in the brief and are used as-is:

- `POST /api/documents/upload` — multipart form, field name `document`
- `POST /api/documents/ask` — `{ question }` → `{ answer, sources }`

A `GET /api/documents` call is also made from `getDocuments()` to populate
the Documents page on load. That route wasn't part of the original two
endpoints, so if your backend uses a different path, update it in
`src/services/api.js`. If the call fails, the UI falls back gracefully —
documents uploaded during the session still appear, just not documents
from previous sessions.
