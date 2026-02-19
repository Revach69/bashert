---
name: learn
description: Capture a pattern, convention, or learning from the current session and persist it to project configuration.
argument-hint: <what you learned or want to document>
allowed-tools: Read, Write, Edit, Glob, Grep
---

You are capturing knowledge from the current session and persisting it to the Bashert project configuration.

## Step 1: Identify the Learning

Parse `$ARGUMENTS` as the learning to capture.

## Step 2: Classify and Route

| Type | Destination |
|------|-------------|
| Architecture/stack change | `CLAUDE.md` |
| Coding convention | `.claude/rules/coding-style.md` |
| Supabase/Prisma pattern | `.claude/rules/supabase.md` |
| Frontend/RTL pattern | `.claude/rules/frontend.md` |
| Security rule | `.claude/rules/security.md` |
| Performance pattern | `.claude/rules/performance.md` |
| Testing pattern | `.claude/rules/testing.md` |
| Git/workflow convention | `.claude/rules/git-workflow.md` |
| Reusable workflow | `.claude/skills/{name}/SKILL.md` |
| New specialist capability | `.claude/agents/{name}.md` |

## Step 3: Check for Duplicates
## Step 4: Write the Learning
## Step 5: Confirm

Print: `Learned: [description] | Added to: [file path] | Section: [section]`
