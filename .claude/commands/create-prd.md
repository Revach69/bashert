---
name: create-prd
description: Create a Product Requirements Document from a user story or feature request. Explores the codebase, asks clarifying questions, and produces a PRD with an agent execution plan.
argument-hint: <feature description or user story>
allowed-tools: Read, Glob, Grep, Bash, WebSearch, AskUserQuestion
---

You are creating a PRD for Bashert. Parse `$ARGUMENTS` as the feature description.

## Step 1: Explore the Codebase

Before writing anything, understand what exists:
- Search for relevant files, components, actions, and patterns
- Check existing types in `src/types/`
- Check existing Prisma schema in `prisma/schema.prisma`
- Check existing pages in `src/app/`
- Check existing Server Actions in `src/actions/`

## Step 2: Clarify Requirements

If the feature description is ambiguous, ask the user clarifying questions using AskUserQuestion. Do NOT ask if requirements are clear from the description.

## Step 3: Write the PRD

Create a file at `.claude/plans/prd-{kebab-case-name}.md` with this structure:

```markdown
# PRD: {Feature Name}

## Overview
What this feature does and why it matters.

## User Stories
- As a [user], I want [X] so that [Y]

## Requirements

### Functional
### Non-Functional

## Technical Design

### Database Changes
New tables/fields (snake_case), indexes needed. Reference Prisma schema.

### API/Actions
New Server Actions or API Routes.

### UI Changes
New pages, components, layout changes. RTL considerations.

## Edge Cases
## Out of Scope

## Execution Plan

### Wave 1 (No Dependencies)
| Agent | Task | Files |
|-------|------|-------|

### Wave 2 (Depends on Wave 1)
| Agent | Task | Files | Depends On |

### Wave 3 (Integration & Verification)
| Agent | Task | Files | Depends On |
```

## Step 4: Design the Execution Plan

| If work involves... | Use agent |
|---------------------|-----------|
| Prisma schema, RLS, Supabase auth/storage | supabase-specialist |
| Pages, components, layouts, RTL | frontend-specialist |
| Build/type errors | build-error-resolver |
| Documentation updates | doc-updater |

## Step 5: Output

1. Write the PRD file
2. Print the full content for review
3. Add footer with implementation command
