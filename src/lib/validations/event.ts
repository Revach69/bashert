import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(1, 'validation.eventNameRequired').max(200),
  description: z.string().optional().or(z.literal('')),
  location: z.string().max(500).optional(),
  event_date: z.coerce.date({ error: 'validation.dateRequired' }),
  start_time: z.coerce.date({ error: 'validation.startTimeRequired' }),
  end_time: z.coerce.date({ error: 'validation.endTimeRequired' }),
  pre_access_hours: z.coerce.number().int().min(0).max(72).default(0),
  post_access_hours: z.coerce.number().int().min(0).max(72).default(0),
  matchmaker_id: z.string().uuid().optional(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time;
  }
  return true;
}, { message: 'validation.endTimeAfterStart', path: ['end_time'] });

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  location: z.string().max(500).optional(),
  event_date: z.coerce.date().optional(),
  start_time: z.coerce.date().optional(),
  end_time: z.coerce.date().optional(),
  pre_access_hours: z.coerce.number().int().min(0).max(72).optional(),
  post_access_hours: z.coerce.number().int().min(0).max(72).optional(),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
