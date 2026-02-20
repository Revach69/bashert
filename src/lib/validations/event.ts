import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(1, 'שם האירוע נדרש').max(200),
  description: z.string().optional().or(z.literal('')),
  event_date: z.coerce.date({ error: 'תאריך נדרש' }),
  start_time: z.coerce.date({ error: 'שעת התחלה נדרשת' }),
  end_time: z.coerce.date({ error: 'שעת סיום נדרשת' }),
  pre_access_hours: z.coerce.number().int().min(0).max(72).default(0),
  post_access_hours: z.coerce.number().int().min(0).max(72).default(0),
  matchmaker_id: z.string().uuid().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  event_date: z.coerce.date().optional(),
  start_time: z.coerce.date().optional(),
  end_time: z.coerce.date().optional(),
  pre_access_hours: z.coerce.number().int().min(0).max(72).optional(),
  post_access_hours: z.coerce.number().int().min(0).max(72).optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
