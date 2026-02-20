import { z } from 'zod';

export const createProfileSchema = z.object({
  subject_first_name: z.string().min(1, 'שם פרטי נדרש').max(50),
  subject_last_name: z.string().min(1, 'שם משפחה נדרש').max(50),
  subject_email: z
    .string()
    .email('כתובת אימייל לא תקינה')
    .optional()
    .or(z.literal('')),
  subject_phone: z.string().optional().or(z.literal('')),
  gender: z.enum(['male', 'female'], { error: 'נא לבחור מין' }),
  date_of_birth: z.coerce.date().refine(
    (date) => {
      const age = Math.floor(
        (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      return age >= 18;
    },
    'הגיל המינימלי הוא 18'
  ),
  photo_url: z.string().url().optional().or(z.literal('')),
  height: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  education: z.string().optional().or(z.literal('')),
  ethnicity: z.string().optional().or(z.literal('')),
  family_background: z.string().optional().or(z.literal('')),
  hashkafa: z.string().optional().or(z.literal('')),
  additional_info: z.string().optional().or(z.literal('')),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = createProfileSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
