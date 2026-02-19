---
name: execute-prd
description: Execute an approved PRD by deploying sub-agents in dependency waves. Reads the PRD execution plan and orchestrates implementation.
argument-hint: <path to PRD file>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, Task, TodoWrite
---

You are the orchestrator for implementing an approved PRD in Bashert.

## Step 1: Load the PRD and Create Branch

1. Read the PRD file at `$ARGUMENTS`
2. Parse the **Execution Plan** section to extract waves and agent assignments
3. Create a TodoWrite checklist from the execution plan waves
4. Create and checkout a new git branch:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/prd-{kebab-case-name}
   ```

## Step 2: Execute Waves

For each wave in the execution plan:

### Deploy Agents
- Launch ALL agents in the same wave **in parallel** using the Task tool
- Each agent Task call must include:
  1. The **full PRD context**
  2. Their **specific task** from the execution plan
  3. Their **target files**
  4. The **Bashert conventions** reminder:
     - Database fields: snake_case
     - Prisma for all DB operations
     - Supabase Auth for authentication
     - RTL-first: logical CSS properties
     - Server Components by default
     - Zod for input validation
  5. Instruction: "If you need output from another agent that isn't ready yet, document what you need as a TODO comment and move on"

### Agent-to-SubagentType Mapping
All agents map to `general-purpose` subagent_type. Include the agent's role in the prompt.

### After Each Wave
1. Wait for ALL agents to complete
2. Run verification:
   ```bash
   npx prisma generate
   npx tsc --noEmit
   ```
3. If errors: fix directly or deploy build-error-resolver
4. Mark wave as completed

## Step 3: Post-Implementation Verification

```bash
npx prisma generate
npx tsc --noEmit
npm run build
grep -r "TODO" src/
```

## Step 4: Commit and Push

```bash
git add -A
git commit -m "feat: implement {feature name} from PRD"
git push -u origin feature/prd-{name}
```

## Step 5: Summary Report

Print wave results, files modified, verification status, and next steps.
