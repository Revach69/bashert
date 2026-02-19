# Performance Optimization

## Server Components First

### Default to Server Components
Server Components render on the server with zero client JS. Use them by default for:
- Data fetching pages
- Static layouts
- Profile cards display
- Dashboard views

### Client Components Only When Needed
- Forms with interactivity
- Real-time filters
- Animations
- Browser API access

## Database Query Optimization

### Select Only Needed Fields
```typescript
// CORRECT
const profiles = await prisma.profileCard.findMany({
  where: { is_active: true },
  select: {
    id: true,
    subject_first_name: true,
    photo_url: true,
  },
});

// AVOID - loads all fields
const profiles = await prisma.profileCard.findMany({
  where: { is_active: true },
});
```

### Use Prisma Indexes
```prisma
model ProfileCard {
  // ...
  @@index([gender, is_active])
  @@index([creator_id])
}

model EventParticipation {
  // ...
  @@index([event_id, profile_id])
}
```

### Avoid N+1 Queries
```typescript
// CORRECT - single query with include
const event = await prisma.event.findUnique({
  where: { id: eventId },
  include: {
    participations: {
      include: { profile: true },
    },
  },
});

// WRONG - N+1 pattern
const event = await prisma.event.findUnique({ where: { id: eventId } });
const participations = await prisma.eventParticipation.findMany({
  where: { event_id: eventId },
});
for (const p of participations) {
  const profile = await prisma.profileCard.findUnique({ where: { id: p.profile_id } });
}
```

## Image Optimization

### Use Next.js Image Component
```tsx
import Image from 'next/image';

<Image
  src={profile.photo_url || '/placeholder-avatar.svg'}
  alt={profile.subject_first_name}
  width={200}
  height={200}
  className="rounded-full object-cover"
/>
```

## Build Performance

### If build fails:
1. Use `build-error-resolver` agent
2. Check `npx tsc --noEmit` first
3. Fix type errors before build issues
