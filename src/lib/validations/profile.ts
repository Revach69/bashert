import { z } from 'zod';

export const createProfileSchema = z.object({
  subject_first_name: z.string().min(1, 'validation.firstNameRequired').max(50),
  subject_last_name: z.string().min(1, 'validation.lastNameRequired').max(50),
  subject_email: z
    .string()
    .email('validation.invalidEmail')
    .max(254)
    .optional()
    .or(z.literal('')),
  subject_phone: z.string().max(20).optional().or(z.literal('')),
  gender: z.enum(['male', 'female'], { error: 'validation.selectGender' }),
  date_of_birth: z.coerce.date().refine(
    (date) => {
      const age = Math.floor(
        (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      return age >= 18;
    },
    'validation.minAge'
  ),
  photo_url: z.string().url().max(2000).optional().or(z.literal('')),
  height: z.string().max(20).optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  education: z.string().max(200).optional().or(z.literal('')),
  ethnicity: z.string().max(100).optional().or(z.literal('')),
  family_background: z.string().max(2000).optional().or(z.literal('')),
  hashkafa: z.string().max(100).optional().or(z.literal('')),
  additional_info: z.string().max(2000).optional().or(z.literal('')),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = createProfileSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
