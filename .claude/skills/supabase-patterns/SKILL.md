---
name: supabase-patterns
description: Supabase + Prisma patterns for database, auth, storage, and RLS.
---

# Supabase Patterns Skill

## Auth
- Supabase Auth for email/password + verification
- Server-side session via `createServerClient`
- Middleware for route protection

## Prisma
- All DB operations through Prisma
- snake_case fields, `@@map()` for table names
- Efficient queries with `select`/`include`
- Transactions for multi-table operations

## RLS
- Enable on ALL tables
- Ownership policies for CRUD
- Authenticated read for browsing

## Storage
- Profile photos in Supabase Storage
- User-scoped folders
- File validation (size, type)

## Error Handling
- Check `{ data, error }` from Supabase
- Handle Prisma known errors by code
