# Claude Code Context — AI Job Match

## Project Goal

AI-enhanced job matching demo for interview portfolio. Built in compressed timeline by Rada Ivanković (3 years full-stack experience).

## Stack (FIXED — do not suggest alternatives)

- Next.js 16 App Router + TypeScript + Tailwind CSS
- Anthropic Claude API (model: claude-sonnet-4-5-20250929)
- PostgreSQL via Supabase (pooler URLs — IPv4 only)
- Prisma 6.x ORM
- Python (psycopg2) for data seeding and scraping
- Deploy: Vercel
- Live URL: https://ai-job-match-tan.vercel.app

## Critical Constraints

1. Use `--legacy-peer-deps` for all npm installs (Next 16 + React 19 conflicts)
2. NEVER use `npm audit fix --force` — broke Next.js to v9 previously
3. Prisma URLs: `DATABASE_URL` (pooler:6543) + `DIRECT_URL` (pooler:5432) in schema.prisma
4. No Prisma 7 — stay on v6
5. Claude API: `messages.create()`, `content` is array of blocks, `max_tokens` REQUIRED

## File Conventions

- `src/lib/prisma.ts` — singleton Prisma client
- `src/lib/claude.ts` — Anthropic SDK init + model constant
- `src/app/api/[name]/route.ts` — API routes (Node runtime)
- `src/components/` — React components
- `scripts/*.py` — Python utilities

## What's Done ✅

- [x] Prisma schema (Job, UserProfile, Match, CoverLetter) with relations
- [x] Migration applied to Supabase
- [x] Python seed with 10 curated jobs
- [x] /api/test endpoint (DB + Claude health check)
- [x] /api/profile (POST) — save user profile, validation
- [x] /api/match (POST) — Claude ranks jobs with structured JSON output + fallback parser
- [x] /api/cover-letter (POST) — Claude generates personalized cover letters
- [x] Landing page (placeholder)
- [x] Vercel deploy with env vars

## What's Next 🚧

### Frontend (B4-B6)

- [ ] Profile form component
- [ ] Match results list with score badges and reasoning
- [ ] Cover letter modal with copy-to-clipboard
- [ ] Loading and error states
- [ ] Responsive design

### Features

- [ ] Chat bot widget (contextual career assistant)
- [ ] Real job scraping (Infostud, HelloWorld.rs)

### Polish

- [ ] Screenshots in README
- [ ] Demo video
- [ ] Interview prep document

## Scope (Current MVP)

- Single user, no auth
- Manual profile entry (no CV upload)
- Mix of curated jobs + real scraped jobs (v2 scope expansion)
- Contextual chat with in-memory history

## Out of Scope

- PDF CV parsing
- User authentication
- Save/favorite jobs across sessions
- Multi-language UI

## Style Guidelines

- Tailwind utility classes only — no separate CSS files
- shadcn/ui components when needed (manual install)
- All async calls need loading states (Claude API takes 3-10s)
- Mobile-first responsive design
- Subtle animations (transitions, not Framer Motion overkill)
- Color palette: slate base + blue/indigo accents
- Generous whitespace, professional SaaS feel

## Interview Context

Demonstrates:

- LLM integration with structured output parsing + fallback strategies
- Type-safe full-stack TypeScript (Prisma → API → React)
- Data pipeline thinking (Python ingestion layer)
- Production deployment with environment management
- Pragmatic scope management
