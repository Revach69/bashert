---
name: verification-loop
description: Verification workflow to ensure code quality before commits and deployments.
---

# Verification Loop Skill

## Quick Verification
```bash
npx tsc --noEmit
npm run lint
```

## Full Verification
```bash
npx prisma generate
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Before Commit
- TypeScript compiles
- Lint passes
- Tests pass
- No console.log in production
- No hardcoded secrets
- RTL logical properties used

## Before Deploy
- All above + build succeeds
- Environment variables set
- Prisma migrations applied
