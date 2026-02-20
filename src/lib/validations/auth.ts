import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להיות לפחות 6 תווים'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'שם מלא נדרש').max(100),
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להיות לפחות 6 תווים'),
  phone: z.string().optional().or(z.literal('')),
  roles: z
    .array(z.enum(['creator', 'matchmaker', 'organizer']))
    .min(1, 'נא לבחור לפחות תפקיד אחד'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
