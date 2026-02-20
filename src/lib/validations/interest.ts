import { z } from 'zod';

export const createInterestSchema = z.object({
  event_id: z.string().uuid(),
  requesting_profile_id: z.string().uuid(),
  target_profile_id: z.string().uuid(),
});

export type CreateInterestInput = z.infer<typeof createInterestSchema>;

export const updateInterestStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'reviewed', 'approved', 'rejected', 'archived']),
  matchmaker_notes: z.string().optional(),
});

export type UpdateInterestStatusInput = z.infer<typeof updateInterestStatusSchema>;
