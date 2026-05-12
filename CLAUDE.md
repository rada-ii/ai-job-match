# Claude Code Context — AI Job Match

## Project Goal

AI-enhanced job matching demo for interview portfolio. Built in compressed timeline (~5 days) by Rada Ivanković, junior-to-mid full-stack developer with 3 years experience.

## Stack (FIXED — do not suggest alternatives)

- Next.js 16 App Router + TypeScript + Tailwind CSS
- Anthropic Claude API (model: claude-sonnet-4-5-20250929)
- PostgreSQL via Supabase (pooler URLs — IPv4 only, NO direct connection)
- Prisma 6.x ORM
- Python (psycopg2) for data seeding only
- Deploy: Vercel

## Critical Constraints

1. **Use --legacy-peer-deps for all npm installs** (Next 16 + React 19 peer conflicts)
2. **NEVER use `npm audit fix --force`** — it broke Next.js previously by downgrading to 9.x
3. **Prisma URL setup:** url = DATABASE_URL (pooler:6543), directUrl = DIRECT_URL (pooler:5432). Both must be in schema.prisma datasource block.
4. **No Prisma 7** — incompatible config requirements, stay on v6.
5. Claude API: `messages.create()` not `chat.completions`, content is array of blocks, `max_tokens` is REQUIRED.

## File Conventions

- `src/lib/prisma.ts` — singleton Prisma client (globalThis pattern)
- `src/lib/claude.ts` — Anthropic SDK init + model constant
- `src/app/api/[name]/route.ts` — API routes (Node runtime, not Edge)
- `scripts/*.py` — Python utilities (seed, future scrapers)

## What's Done

- [x] Prisma schema (Job, UserProfile, Match, CoverLetter)
- [x] Migration applied to Supabase
- [x] Python seed with 10 curated jobs
- [x] /api/test endpoint (DB + Claude health check)
- [x] Landing page
- [x] Vercel deploy

## What's Next

- [ ] /api/profile (POST) — save user profile
- [ ] /api/match (POST) — Claude ranks jobs against profile
- [ ] /api/cover-letter (POST) — Claude generates cover letter
- [ ] Profile form UI
- [ ] Job results UI with match scores
- [ ] Cover letter modal/page

## Scope Lock (v1 / MVP)

- Single user, no auth, no save
- Manual profile entry (no CV upload)
- Curated demo jobs (no real scraping)
- In-memory chat history (no persistence)

## Out of Scope (v2)

- PDF CV parsing
- Real scraping (Infostud, LinkedIn)
- User auth (Clerk/Supabase Auth)
- Save/favorite jobs
- Multi-language

## Style Guidelines

- Tailwind utility classes, no custom CSS files
- shadcn/ui components when needed (manual install only — no full library)
- Loading states for all async calls (Claude API takes 3-10s)
- Error boundaries on critical paths
- Mobile-first responsive

## Interview Context

This project demonstrates:

- LLM integration patterns (system prompts, JSON output parsing, error handling)
- Type-safe full-stack TypeScript (Prisma + Next.js)
- Data pipeline thinking (Python ingestion layer for future scrapers)
- Pragmatic scope management (mock data + clear v2 roadmap)
