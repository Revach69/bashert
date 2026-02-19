# Coding Style Rules

## Database Field Naming (CRITICAL)

### ALWAYS snake_case for Database Fields
```typescript
// CORRECT
const profileData = {
  subject_first_name: 'Moshe',
  creator_id: userId,
  created_at: new Date(),
  is_active: true,
};

// WRONG - Never camelCase in database
const profileData = {
  subjectFirstName: 'Moshe',  // NO
  creatorId: userId,           // NO
};
```

### TypeScript Variables Can Use camelCase
```typescript
const userId = profile.creator_id;
const firstName = profile.subject_first_name;
```

## Type Imports

### Use Prisma Generated Types + Custom Types
```typescript
// Import from Prisma for DB types
import type { User, ProfileCard, Event } from '@prisma/client';

// Import custom types from src/types/
import type { ProfileWithCreator, EventWithStats } from '@/types';
```

## RTL-First CSS (CRITICAL)

### ALWAYS Use Logical Properties
```tsx
// CORRECT - works in both LTR and RTL
className="ms-4 me-2 ps-3 pe-1 text-start"

// WRONG - breaks in RTL
className="ml-4 mr-2 pl-3 pr-1 text-left"
```

## Function Naming

### Verb-Noun Pattern
```typescript
async function createProfile(data: CreateProfileInput) { }
async function fetchEventProfiles(eventId: string) { }
function isValidAge(dateOfBirth: Date): boolean { }
function calculateAge(dateOfBirth: Date): number { }
```

## File Organization

### Target: 200-400 lines per file
### Maximum: 800 lines per file

### Project Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── ...           # Feature components
├── actions/          # Server Actions
├── lib/              # Utilities, clients
├── types/            # TypeScript type definitions
└── hooks/            # Custom React hooks
```

## Import Order
```typescript
// 1. React/Next.js
import { useState } from 'react';
import { redirect } from 'next/navigation';

// 2. External packages
import { z } from 'zod';

// 3. Internal: components
import { Button } from '@/components/ui/button';

// 4. Internal: lib/actions/types
import { prisma } from '@/lib/prisma';
import type { ProfileWithCreator } from '@/types';
```
