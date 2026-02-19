# Frontend Rules

## RTL-First Design (CRITICAL)

### ALWAYS Use Logical Properties
```tsx
// CORRECT
className="ms-4 me-2 ps-3 pe-1 text-start border-s-2"

// WRONG - breaks in RTL
className="ml-4 mr-2 pl-3 pr-1 text-left border-l-2"
```

### Mapping Table
| Physical (DON'T) | Logical (DO) |
|---|---|
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` |
| `border-l-*` / `border-r-*` | `border-s-*` / `border-e-*` |
| `float-left` / `float-right` | `float-start` / `float-end` |

### Root HTML Setup
```tsx
<html lang="he" dir="rtl">
```

## Next.js App Router

### Server Components by Default
```tsx
// No 'use client' needed - server component by default
async function ProfilePage({ params }: { params: { id: string } }) {
  const profile = await prisma.profileCard.findUnique({ where: { id: params.id } });
  return <ProfileView profile={profile} />;
}
```

### Client Components Only When Needed
Use `'use client'` ONLY for:
- useState, useEffect, useContext, useRef
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (window, localStorage)
- Third-party client-only libraries

### Server Actions for Mutations
```typescript
'use server';

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const data = UpdateProfileSchema.parse(Object.fromEntries(formData));
  await prisma.profileCard.update({
    where: { id: data.id, creator_id: session.user.id },
    data,
  });
  revalidatePath('/dashboard');
}
```

## shadcn/ui Components

### Form Pattern
```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(CreateProfileSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="subject_first_name" render={({ field }) => (
          <FormItem>
            <FormLabel>שם פרטי</FormLabel>
            <Input {...field} />
            <FormMessage />
          </FormItem>
        )} />
      </form>
    </Form>
  );
}
```

## Mobile-Responsive Design

### Mobile-First Approach
```tsx
<div className="
  w-full          // mobile: full width
  md:w-1/2        // tablet: half
  lg:w-1/3        // desktop: third
">
```

### Touch-Friendly Targets
- Minimum touch target: 44x44px
- Buttons: `min-h-[44px]`
- Adequate spacing between interactive elements

## Hebrew Content

### Default language is Hebrew
- UI labels in Hebrew
- Placeholder text in Hebrew
- Error messages in Hebrew
- English as secondary option
