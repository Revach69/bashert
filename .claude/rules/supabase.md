# Supabase & Prisma Rules

## Prisma Schema Conventions

### Field Naming (CRITICAL)
```prisma
// ALWAYS snake_case for database fields
model ProfileCard {
  id                   String   @id @default(uuid()) @db.Uuid
  creator_id           String   @db.Uuid
  subject_first_name   String
  subject_last_name    String
  date_of_birth        DateTime @db.Date
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt

  @@map("profile_cards")
}
```

### Table Naming
- Use snake_case plural: `profile_cards`, `interest_requests`, `event_participations`
- Use `@@map()` to control table names

### Timestamps
```prisma
// ALWAYS add these to every model
created_at DateTime @default(now())
updated_at DateTime @updatedAt
```

## Supabase Auth

### Session Management
```typescript
// Server-side session check
import { createServerClient } from '@supabase/ssr';

export async function getSession() {
  const supabase = createServerClient(/* ... */);
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
```

### ALWAYS Check Auth Before Protected Operations
```typescript
'use server';

export async function createProfile(data: CreateProfileInput) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  return prisma.profileCard.create({
    data: { ...data, creator_id: session.user.id },
  });
}
```

## Row Level Security (CRITICAL)

### Enable RLS on ALL tables
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_requests ENABLE ROW LEVEL SECURITY;
```

### Standard Policies
```sql
-- Creators manage their own profile cards
CREATE POLICY "creators_manage_own_profiles" ON profile_cards
  USING (auth.uid() = creator_id);

-- Authenticated users can read active profiles in events they participate in
CREATE POLICY "auth_read_event_profiles" ON profile_cards
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND is_active = true
  );
```

## Prisma Query Patterns

### Efficient Queries with select
```typescript
// CORRECT - select only needed fields
const profiles = await prisma.profileCard.findMany({
  where: { is_active: true },
  select: {
    id: true,
    subject_first_name: true,
    photo_url: true,
    gender: true,
  },
});

// AVOID - selecting everything
const profiles = await prisma.profileCard.findMany();
```

### Transactions for Multi-Table Operations
```typescript
await prisma.$transaction([
  prisma.interestRequest.create({ data: requestData }),
  prisma.eventParticipation.update({
    where: { id: participationId },
    data: { last_activity_at: new Date() },
  }),
]);
```

## Supabase Storage

### Profile Photo Upload
```typescript
const { data, error } = await supabase.storage
  .from('profile-photos')
  .upload(`${userId}/${fileName}`, file, {
    cacheControl: '3600',
    upsert: true,
  });
```

### ALWAYS validate file uploads
- Max size: 5MB
- Allowed types: image/jpeg, image/png, image/webp
- Store in user-scoped folders

## Error Handling

### Prisma Errors
```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return { error: 'Email already exists' };
    }
  }
  throw error;
}
```
