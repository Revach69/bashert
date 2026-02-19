# Git Workflow Rules

## Commit Format

### Conventional Commits
```
feat: Add user authentication
fix: Resolve profile card display issue
refactor: Extract email notification service
docs: Update API documentation
test: Add profile creation tests
chore: Update dependencies
```

### Commit Message Structure
```
<type>: <short description>

[optional body]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Branch Strategy

### Feature Branches
```bash
git checkout -b feature/add-shadchan-dashboard
git checkout -b fix/profile-photo-upload
```

## Pre-Commit Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets
- [ ] RTL logical properties used (no physical ml/mr/pl/pr)

## Never Do

- **Never force push to main**
- **Never skip hooks**: `git commit --no-verify`
- **Never commit secrets**: API keys, passwords, tokens
- **Never commit .env files**: Should be in .gitignore
