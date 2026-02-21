import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordMinLength'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'validation.fullNameRequired').max(100),
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordMinLength'),
  phone: z.string().optional().or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
