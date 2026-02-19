---
name: backend-patterns
description: Next.js API Routes and Server Actions patterns for Bashert.
---

# Backend Patterns Skill

## Server Actions (Primary)
```typescript
'use server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function myAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const data = Schema.parse(Object.fromEntries(formData));
  const result = await prisma.model.create({ data });
  revalidatePath('/path');
  return { success: true, data: result };
}
```

## API Routes (When Needed)
```typescript
// src/app/api/webhooks/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Process webhook...
  return NextResponse.json({ received: true });
}
```

## Email Notifications (Resend)
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Bashert <noreply@bashert.app>',
  to: email,
  subject: 'בקשת עניין חדשה',
  html: emailTemplate,
});
```

## Input Validation
Always use Zod schemas. Validate on server, never trust client.
