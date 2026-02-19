---
name: frontend-patterns
description: Next.js App Router and React patterns for Bashert.
---

# Frontend Patterns Skill

## Server Components (Default)
No `'use client'` needed. Fetch data directly.

## Client Components
Add `'use client'` only for interactivity (useState, onClick, forms).

## Server Actions for Mutations
```typescript
'use server';
export async function createProfile(formData: FormData) { ... }
```

## Form Pattern (shadcn/ui + react-hook-form + zod)
```tsx
'use client';
const form = useForm({ resolver: zodResolver(Schema) });
```

## RTL Layout
All logical properties. Hebrew by default. `dir="rtl"` on root.

## Mobile-Responsive
Mobile-first with Tailwind breakpoints.
