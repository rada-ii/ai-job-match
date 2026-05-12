markdown# AI Job Match Agent

> AI-enhanced job matching platform demonstrating modern recruitment workflows powered by Claude API.

**Status:** 🚧 In active development

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4.5-orange)](https://anthropic.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)](https://www.postgresql.org/)

## Overview

AI Job Match demonstrates how Large Language Models can enhance the job search experience. The platform takes a user profile, ranks curated job listings using Claude's reasoning, and generates personalized cover letters — all with full transparency into the AI's decision process.

## Tech Stack

| Layer             | Technology                                        |
| ----------------- | ------------------------------------------------- |
| **Frontend**      | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| **Backend**       | Next.js API Routes, Anthropic SDK                 |
| **Database**      | PostgreSQL (Supabase) with Prisma ORM             |
| **AI**            | Claude Sonnet 4.5 via Anthropic API               |
| **Data Pipeline** | Python (psycopg2) for seed data ingestion         |
| **Deploy**        | Vercel                                            |

## Architecture

┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Next.js UI │─────▶│ API Routes │─────▶│ Claude API │
│ (React + TS) │ │ (Node runtime) │ │ (match + letter)│
└─────────────────┘ └──────────────────┘ └─────────────────┘
│
▼
┌──────────────────┐ ┌─────────────────┐
│ Prisma ORM │◀─────│ Python seeder │
│ (Supabase PG) │ │ (data pipeline) │
└──────────────────┘ └─────────────────┘

The Python script (`scripts/seed_jobs.py`) acts as a **data ingestion layer**. Currently it loads curated demo data; in v2 it will be replaced with real scrapers targeting Infostud, LinkedIn Jobs, and HelloWorld.rs.

## Features

### ✅ Implemented

- PostgreSQL schema with relational models (Job, UserProfile, Match, CoverLetter)
- Prisma ORM with singleton client pattern
- Claude API integration with type-safe SDK
- Python data ingestion script
- Health-check endpoint (`/api/test`)
- Landing page

### 🚧 In Progress

- User profile creation form
- AI-powered job matching with score + reasoning
- Personalized cover letter generation

### 📋 Planned (v2)

- CV PDF parsing & automated skill extraction
- Real job scraping (Selenium + BeautifulSoup)
- User authentication & saved profiles
- Contextual career assistant chat
- Multi-language support (EN/SR)

## Local Development

### Prerequisites

- Node.js 22+
- Python 3.9+
- Supabase account (free tier)
- Anthropic API key

### Setup

```bash
# Clone the repository
git clone https://github.com/rada-ii/ai-job-match.git
cd ai-job-match

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY, DATABASE_URL, DIRECT_URL

# Run database migrations
npx prisma migrate dev

# Seed demo data
pip3 install psycopg2-binary python-dotenv
python3 scripts/seed_jobs.py

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and visit `/api/test` to verify the setup.

## Project Structure

ai-job-match/
├── src/
│ ├── app/
│ │ ├── api/ # API routes (Claude integration)
│ │ ├── page.tsx # Landing page
│ │ └── layout.tsx
│ └── lib/
│ ├── claude.ts # Anthropic SDK client
│ └── prisma.ts # Prisma singleton client
├── prisma/
│ ├── schema.prisma # Database schema
│ └── migrations/
├── scripts/
│ └── seed_jobs.py # Python data ingestion
└── README.md

## Design Decisions

**Why Claude over OpenAI?** Claude excels at structured output, longer context windows, and produces more reasoned, less hallucinatory responses for evaluative tasks like job matching.

**Why PostgreSQL over MongoDB?** The data is inherently relational (Profile → Matches → Cover Letters). Relational integrity and Prisma's type-safe queries outweigh NoSQL flexibility for this use case.

**Why Python for seed data?** Python's data ecosystem (BeautifulSoup, Selenium, Playwright) makes it the natural choice for the v2 scraping layer. Building the ingestion pipeline in Python from day one keeps that path open.

**Why Supabase pooler?** Direct Supabase connections require IPv6. The PgBouncer pooler provides IPv4 access plus connection pooling — essential for serverless deploys on Vercel.

## License

MIT

---

Built by **[Rada Ivanković](https://github.com/rada-ii)**
