# Bashert - Claude Code Guidelines

## Project Overview

**Bashert** (בשערט) is an event-based shidduch platform that digitizes how Orthodox families discover and express interest in potential matches at social events. Parents, relatives, and individuals create reusable profile cards, browse other profiles at simchas, and submit interest requests to a professional shadchan.

### Key Features
- **Event-based browsing**: Profiles are only visible within events they've opted into
- **Profile cards**: Reusable across events, created by parents/relatives/self
- **Interest requests**: "I'm Interested" → routed to event's assigned shadchan
- **Mutual interest detection**: Auto-flagged when both sides express interest
- **Shadchan dashboard**: Professional tool for managing requests
- **RTL-first**: Hebrew as primary language, right-to-left layout

### Guiding Principle
Bashert mirrors the existing social process — it does not replace the shadchan or create a "dating app." The shadchan remains the gatekeeper.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14+ (App Router) + React | SSR, routing, DX |
| **Styling** | Tailwind CSS + shadcn/ui | Mobile-responsive, RTL-ready |
| **Backend** | Next.js API Routes + Server Actions | Single codebase |
| **Database** | PostgreSQL (via Supabase) | Relational data model |
| **ORM** | Prisma | Type-safe queries, migrations |
| **Auth** | Supabase Auth | Email/password + verification |
| **Storage** | Supabase Storage | Profile photos (CDN-backed) |
| **Email** | Resend | Transactional emails |
| **Hosting** | Vercel | Zero-config Next.js hosting |
| **Validation** | Zod | Runtime schema validation |

---

## Architecture: Intentional Monolith

Single Next.js application. No microservices, no separate admin panel. Role-based access control determines what each user sees.

```
bashert.app/
├── /                       → Landing page + login/register
├── /auth/login             → Login page
├── /auth/register          → Registration page
├── /auth/callback          → Auth callback handler
├── /dashboard              → Creator home (profile cards)
├── /profile/new            → Create new profile card
├── /profile/[id]           → View/edit profile card
├── /event/[code]           → Event join page
├── /event/[code]/browse    → Browse profiles in event
├── /matchmaker             → Shadchan dashboard
├── /matchmaker/[eventId]   → Requests for specific event
├── /organizer              → Organizer dashboard
├── /organizer/new          → Create new event
```

---

## Project Structure

```
Bashert/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (public)/       # Public pages (landing, auth)
│   │   ├── (protected)/    # Auth-required pages
│   │   │   ├── dashboard/  # Creator dashboard
│   │   │   ├── profile/    # Profile management
│   │   │   ├── event/      # Event pages
│   │   │   ├── matchmaker/ # Shadchan dashboard
│   │   │   └── organizer/  # Organizer dashboard
│   │   └── api/            # API routes (webhooks, etc.)
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── forms/          # Form components
│   │   ├── profile/        # Profile-related components
│   │   └── layout/         # Layout components
│   ├── actions/            # Server Actions
│   ├── lib/                # Utilities
│   │   ├── prisma.ts       # Prisma client
│   │   ├── supabase/       # Supabase client (server + browser)
│   │   ├── auth.ts         # Auth helpers
│   │   ├── email.ts        # Resend email helpers
│   │   └── utils.ts        # General utilities
│   ├── types/              # TypeScript types
│   └── hooks/              # Custom React hooks
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration files
├── public/                 # Static assets
├── .claude/                # Claude Code configuration
└── .env.local              # Environment variables (not committed)
```

---

## User Roles

| Role | Description |
|------|-------------|
| **Creator** (יוצר) | Creates/manages profile cards, browses events, sends interest requests |
| **Shadchan** (שדכן/ית) | Professional matchmaker, manages interest requests via dashboard |
| **Organizer** (מארגן/ת) | Creates events, assigns shadchan, distributes join link |

A single account can hold multiple roles.

---

## Data Model (Prisma)

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | User accounts (email, name, phone, roles) |
| `profile_cards` | Shidduch candidate profiles (created by Creator) |
| `events` | Event definitions (name, date, access windows) |
| `event_participations` | Links profiles to events (opt-in) |
| `interest_requests` | "I'm interested" requests (core transaction) |

### Key Conventions
- **Field naming**: snake_case (`creator_id`, `subject_first_name`, `created_at`)
- **Table naming**: snake_case plural (`profile_cards`, `interest_requests`)
- **Timestamps**: `@default(now())` for `created_at`, `@updatedAt` for `updated_at`
- **IDs**: UUID via `@default(uuid()) @db.Uuid`
- **Enums**: Prisma enum types for roles, genders, statuses

---

## RTL Strategy (CRITICAL)

### Day 1 Requirements
- `dir="rtl"` at HTML root
- `lang="he"` on root element
- ALL layout uses logical properties:
  - `ms-*` / `me-*` (not ml/mr)
  - `ps-*` / `pe-*` (not pl/pr)
  - `text-start` / `text-end` (not left/right)
  - `start-*` / `end-*` (not left/right positioning)
- Hebrew content by default
- English as secondary option

---

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create/apply migrations
npx prisma studio        # Visual DB browser

# Building
npm run build            # Production build
npm run lint             # ESLint

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode

# Type checking
npx tsc --noEmit         # TypeScript check
```

---

## Claude Code Configuration

### Directory Structure
```
.claude/
├── agents/           # 10 specialized subagents
├── rules/            # Always-follow guidelines
├── commands/         # Slash commands (/create-prd, /execute-prd, /review, /learn)
├── skills/           # Workflow definitions
└── hooks/            # Automated TypeScript checks
```

### Available Commands
| Command | Purpose |
|---------|---------|
| `/create-prd` | Create a PRD from a feature request with agent execution plan |
| `/execute-prd` | Deploy sub-agents in waves to implement an approved PRD |
| `/review` | Comprehensive code review with verification |
| `/learn` | Capture a pattern or learning to project config |

### Key Rules
- **Security**: See `.claude/rules/security.md`
- **Coding Style**: See `.claude/rules/coding-style.md`
- **Supabase**: See `.claude/rules/supabase.md`
- **Frontend/RTL**: See `.claude/rules/frontend.md`
