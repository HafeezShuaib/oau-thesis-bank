# OAU Thesis Bank — Connected Frontend

A faithful clone of the original OAU Thesis Bank interface with the same 45-screen routing, Tailwind v3 visual system, Framer Motion transitions, and Lucide icon language. This version replaces the original demo data and frontend-only authentication with the Django REST API in `../backend`.

## Run

```bash
npm install
npm run dev
npm run build
```

The Vite development server runs on `http://localhost:5173` and talks to `http://127.0.0.1:8000/api` by default. Copy `.env.example` to `.env.local` to change `VITE_API_BASE_URL`.

## Connected capabilities

- JWT sign-in, refresh, registration, profile updates, and password changes.
- Repository search, filters, thesis details, saved theses, PDF downloads, uploads, edits, and access requests.
- Researcher profiles, collaboration opportunities, mentorship requests, conversations, notifications, and supported analytics.
- Loading, error, empty, and backend-unavailable states instead of fabricated records when the API has no corresponding capability.

## Backend

Start Django from `../backend` and ensure PostgreSQL is running. The backend allows the frontend origins `http://localhost:5173` and `http://127.0.0.1:5173` through `CORS_ALLOWED_ORIGINS`.
