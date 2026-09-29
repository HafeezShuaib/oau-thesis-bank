# OAU Thesis Bank — Backend Handoff

## Frontend status
- 45 numbered screens preserved.
- Landing page is the default entry point.
- Authenticated screens use a shared responsive application shell.
- Admin screens (43–45) use a separate admin navigation mode.
- Dashboards are interactive UI prototypes using mock data.
- Framer Motion is used for purposeful transitions and page/section reveals.

## Screens needing backend data
1. Authentication: login, signup, password reset, sessions.
2. Thesis repository: search, filters, thesis details, PDF access, saves.
3. Upload workflow: file upload, metadata, access/privacy, processing, publish state.
4. AI: summarization, semantic search, similarity, research gaps, RAG answers.
5. Researcher network: profiles, collaboration, mentorship, messaging.
6. Notifications and access requests.
7. Analytics: personal, thesis impact, university-level metrics.
8. Admin: moderation queue, user management, roles, audit events.

## Suggested API areas
- `/api/auth/*`
- `/api/theses/*`
- `/api/search/*`
- `/api/researchers/*`
- `/api/collaboration/*`
- `/api/messages/*`
- `/api/notifications/*`
- `/api/analytics/*`
- `/api/admin/*`
- `/api/ai/*`

## Important security note
The frontend `admin` layout is presentation only. The backend must enforce authentication, role-based authorization, ownership checks, moderation permissions, and access/privacy rules. Never trust a frontend route or hidden button as an authorization boundary.

## Data contracts to agree on
- User: id, name, email, role, department, faculty, avatar, status.
- Thesis: id, title, author, department, year, abstract, supervisor, tags, status, access policy, file URL, processing status.
- Search result: thesis + relevance score + matched concepts.
- Analytics: time series + totals + breakdowns.
- Moderation item: thesis + flag type + similarity score + reviewer status.

## Local setup
```bash
npm install
npm run dev
```

## Production check
```bash
npm run build
```

The environment used to prepare this handoff could not finish downloading npm dependencies, so the final Vite production build should be run after `npm install` on the developer machine/CI.

## Admin control center expectations
The frontend Screen 43 is intentionally a monitoring/control-center UI. Backend services should supply real values for repository totals, active users, moderation queues, platform activity, AI/RAG processing jobs, service health, and audit/activity events. Admin authorization must be enforced by the backend even if frontend routes are visible.
