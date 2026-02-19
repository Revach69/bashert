# Agent Orchestration Rules

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, multi-file changes |
| architect | System design | Architecture decisions, new services |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Quality review | After writing code |
| security-reviewer | Security analysis | Auth, RLS, secrets changes |
| build-error-resolver | Fix builds | When tsc/build fails |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation | When APIs change |
| supabase-specialist | Supabase/Prisma/Auth | Database, auth, storage, RLS |
| frontend-specialist | Next.js/React/RTL | Frontend development |

## Automatic Agent Invocation

### Complex Features (3+ files)
Use `planner` agent first to design implementation

### Database/Auth Changes
Use `supabase-specialist` for Prisma schema, RLS policies, auth flows, storage

### Frontend Changes
Use `frontend-specialist` for pages, components, RTL layout, shadcn/ui

### After Writing Code
Use `code-reviewer` for quality check

### Auth/Security Changes
Use `security-reviewer` for auth flows, RLS policies, secrets

### Build Failures
Use `build-error-resolver` when TypeScript or build fails

## Parallel Execution

Use parallel Task execution for independent operations:
- Type checking + lint checking
- Security review + performance review
- Multiple independent file analyses

## Agent Selection by File Type

| File Pattern | Recommended Agent |
|--------------|-------------------|
| `prisma/schema.prisma` | supabase-specialist |
| `src/app/api/*` | supabase-specialist, security-reviewer |
| `src/actions/*` | supabase-specialist, code-reviewer |
| `src/app/**/*.tsx` | frontend-specialist |
| `src/components/**` | frontend-specialist |
| `supabase/migrations/*` | supabase-specialist, security-reviewer |
