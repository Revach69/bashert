# Common Patterns

## API Response Format

```typescript
// Server Action response
type ActionResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};
```

## Server Action Pattern

```typescript
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const Schema = z.object({
  name: z.string().min(1),
});

export async function createEvent(formData: FormData): Promise<ActionResponse<Event>> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const data = Schema.parse(Object.fromEntries(formData));

    const event = await prisma.event.create({
      data: { ...data, organizer_id: session.user.id },
    });

    revalidatePath('/organizer');
    return { success: true, data: event };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('[createEvent]', error);
    return { success: false, error: 'Failed to create event' };
  }
}
```

## Custom Hook Pattern

```typescript
'use client';

export function useProfile(profileId: string) {
  const [profile, setProfile] = useState<ProfileCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProfile(profileId)
      .then(data => { if (!cancelled) setProfile(data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [profileId]);

  return { profile, loading };
}
```

## Protected Route Pattern

```typescript
// src/app/(protected)/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  return <>{children}</>;
}
```

## Middleware Auth Pattern

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```
