# Security Rules

## Secrets Management

### NEVER Hardcode
```typescript
// WRONG
const supabaseUrl = 'https://xxx.supabase.co';

// CORRECT
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
```

### Environment Variables
- `NEXT_PUBLIC_*` - Only for truly public values (Supabase URL, anon key)
- All others server-side only
- `.env.local` in .gitignore (ALWAYS)

## Authentication (CRITICAL)

### Protect All Mutations
```typescript
'use server';

export async function sensitiveAction(data: Input) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  // Proceed...
}
```

### Middleware for Route Protection
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Check auth for protected routes
  const protectedPaths = ['/dashboard', '/profile', '/matchmaker', '/organizer'];
  if (protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))) {
    // Verify session...
  }
}
```

## Input Validation (CRITICAL)

### ALWAYS Validate with Zod
```typescript
import { z } from 'zod';

const CreateProfileSchema = z.object({
  subject_first_name: z.string().min(1).max(50),
  subject_last_name: z.string().min(1).max(50),
  gender: z.enum(['male', 'female']),
  date_of_birth: z.coerce.date().refine(
    (d) => calculateAge(d) >= 18,
    'Must be 18 or older'
  ),
  email: z.string().email(),
});
```

## Row Level Security

### RLS on ALL tables
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Ownership Checks
```sql
-- Users can only modify their own data
CREATE POLICY "own_data" ON users
  USING (auth.uid() = id);

-- Creators can only manage their own profiles
CREATE POLICY "own_profiles" ON profile_cards
  FOR ALL USING (auth.uid() = creator_id);
```

## File Upload Security

### Validate Before Upload
```typescript
function validateFile(file: File) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > MAX_SIZE) throw new Error('File too large');
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Invalid file type');
}
```

## Data Protection

### Never Log Sensitive Data
```typescript
// WRONG
console.log('User data:', { email, password });

// CORRECT
console.log('User action:', { userId, action: 'login' });
```

### Error Messages Don't Leak Internals
```typescript
// WRONG
catch (error) { return { error: error.message }; }

// CORRECT
catch (error) {
  console.error('Internal error:', error);
  return { error: 'Something went wrong' };
}
```
