---
name: coding-standards
description: Universal TypeScript coding standards for Bashert.
---

# Coding Standards Skill

## Naming Conventions

### Database Fields: snake_case
### TypeScript Variables: camelCase
### Types/Interfaces: PascalCase
### Constants: UPPER_SNAKE_CASE
### Functions: camelCase (verb-noun pattern)

## RTL-First CSS: Logical Properties Only
- `ms-*` / `me-*` (not ml/mr)
- `ps-*` / `pe-*` (not pl/pr)
- `text-start` / `text-end` (not left/right)

## Type Safety
- Use Prisma generated types for DB models
- Custom types in `src/types/`
- No `any` without justification
- Zod for runtime validation

## Error Handling
- Server Actions: return `{ success, data/error }`
- Always try-catch async operations
- Log errors server-side, return user-friendly messages

## Async/Await
- Always use async/await (not .then chains)
- Use Promise.all for parallel operations

## Immutability
- Prefer spread operator for updates
- Use immutable array methods (filter, map, find)
