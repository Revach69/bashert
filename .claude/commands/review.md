---
name: review
description: Comprehensive review of implementation. Checks code quality, patterns, security, and runs verification against all project rules.
allowed-tools: Read, Glob, Grep, Bash, WebSearch, Task, TodoWrite
---

You are reviewing the current implementation in Bashert. This is a comprehensive quality gate.

## Step 1: Identify Changed Files

```bash
git diff --name-only
git diff --cached --name-only
```

## Step 2: Deploy Review Agents in Parallel

| If files changed in... | Deploy this review |
|------------------------|--------------------|
| `prisma/` | Supabase review (schema, RLS, migrations) |
| `src/app/` | Frontend review (RSC, RTL, Tailwind, shadcn) |
| `src/actions/` | Server Actions review (auth, validation, error handling) |
| `src/app/api/` | API Routes review (auth, status codes, validation) |
| Any `.ts`/`.tsx` | Code quality review (naming, types, patterns) |

## Step 3: Run Automated Verification

```bash
npx prisma generate
npx tsc --noEmit
npm run build
npm test
```

## Step 4: Compile Review Report

Report with findings by category, automated verification results, and verdict (APPROVED / NEEDS FIXES).

## Step 5: Fix Critical Issues

Fix CRITICAL issues immediately. List MAJOR issues for user decision. Report MINOR as notes.
