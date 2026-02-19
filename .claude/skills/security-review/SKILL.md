---
name: security-review
description: Security review checklist for authentication, authorization, input validation, and RLS.
---

# Security Review Skill

## Checklist
1. Auth checks on all protected routes/actions
2. Ownership verification before mutations
3. Role checks for shadchan/organizer operations
4. Zod validation on all inputs
5. File upload validation
6. RLS policies on all tables
7. No hardcoded secrets
8. Sensitive data not in logs
9. Error messages don't leak internals
