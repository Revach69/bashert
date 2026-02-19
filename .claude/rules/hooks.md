# Hooks System

## Overview

Hooks are automated actions triggered by Claude Code events. They run shell commands at specific points in the workflow.

## Active Hooks

### TypeScript Check on File Write/Edit
Runs `npx tsc --noEmit` after writing or editing `.ts`/`.tsx` files.

### Console.log Warning
Warns when `console.log` is found in TypeScript files.

## Best Practices

1. **Keep hooks fast** - Slow hooks interrupt workflow
2. **Use head/tail** - Limit output to avoid flooding
3. **Exit codes matter** - Non-zero exits block PreToolUse actions
4. **Be specific** - Use precise matchers to avoid false triggers
