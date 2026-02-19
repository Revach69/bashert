# Testing Rules

## Framework

- **Vitest** for unit/integration tests
- **Playwright** for E2E tests (V1 post-launch)

## Coverage Requirements

- Server Actions: 80%
- Utility functions: 80%
- Critical paths (auth, interest requests): 100%

## Test Structure (AAA Pattern)

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateAge', () => {
  it('should calculate correct age', () => {
    // Arrange
    const dob = new Date('2000-01-01');

    // Act
    const age = calculateAge(dob);

    // Assert
    expect(age).toBe(26);
  });

  it('should enforce 18+ age requirement', () => {
    const dob = new Date('2010-01-01');
    expect(isEligibleAge(dob)).toBe(false);
  });
});
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Edge Cases to Always Test

1. **Null/Undefined**: What if input is null?
2. **Empty**: What if array/string is empty?
3. **Boundaries**: Min/max values (age 18 boundary)
4. **Auth**: Unauthorized access attempts
5. **Duplicate**: Duplicate interest requests
6. **Mutual**: Mutual interest detection

## Test Naming

```typescript
// CORRECT
test('returns error when profile creator is not the authenticated user', () => {});
test('detects mutual interest when both sides express interest', () => {});

// WRONG
test('works', () => {});
test('test auth', () => {});
```
