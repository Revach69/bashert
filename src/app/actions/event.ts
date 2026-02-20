'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createEventSchema } from '@/lib/validations/event';
import { generateJoinCode } from '@/lib/utils';
import type { ActionResponse, EventWithDetails, ProfileWithCreator } from '@/types';
import type { Event, EventParticipation } from '@prisma/client';

// ─── Shared Prisma includes ────────────────────────────────────────────────

const eventWithDetailsInclude = {
  organizer: {
    select: { id: true, full_name: true },
  },
  matchmaker: {
    select: { id: true, full_name: true },
  },
  _count: {
    select: {
      participations: true,
      interest_requests: true,
    },
  },
} as const;

const profileWithCreatorInclude = {
  creator: {
    select: { id: true, full_name: true, email: true, phone: true },
  },
} as const;

// ─── Create Event ───────────────────────────────────────────────────────────

export async function createEvent(
  formData: FormData
): Promise<ActionResponse<Event>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי ליצור אירוע' };
    }

    // Verify user has organizer role
    if (!user.roles.includes('organizer')) {
      return { success: false, error: 'רק מארגנים יכולים ליצור אירועים' };
    }

    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      event_date: formData.get('event_date') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      pre_access_hours: formData.get('pre_access_hours') as string,
      post_access_hours: formData.get('post_access_hours') as string,
      matchmaker_id: formData.get('matchmaker_id') as string,
    };

    const parsed = createEventSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'נתונים לא תקינים' };
    }

    const data = parsed.data;

    // Generate a unique join code, retry if collision
    let joinCode = generateJoinCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.event.findUnique({
        where: { join_code: joinCode },
        select: { id: true },
      });
      if (!existing) break;
      joinCode = generateJoinCode();
      attempts++;
    }
    if (attempts >= 5) {
      return { success: false, error: 'שגיאה ביצירת קוד הצטרפות, נא לנסות שנית' };
    }

    const event = await prisma.event.create({
      data: {
        organizer_id: user.id,
        matchmaker_id: data.matchmaker_id || null,
        name: data.name,
        description: data.description || null,
        event_date: data.event_date,
        start_time: data.start_time,
        end_time: data.end_time,
        pre_access_hours: data.pre_access_hours,
        post_access_hours: data.post_access_hours,
        join_code: joinCode,
      },
    });

    return { success: true, data: event };
  } catch (error) {
    console.error('createEvent error:', error);
    return { success: false, error: 'שגיאה ביצירת האירוע' };
  }
}

// ─── Get My Events ──────────────────────────────────────────────────────────

export async function getMyEvents(): Promise<
  ActionResponse<EventWithDetails[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות באירועים' };
    }

    const events = await prisma.event.findMany({
      where: {
        organizer_id: user.id,
        is_active: true,
      },
      include: eventWithDetailsInclude,
      orderBy: { event_date: 'desc' },
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('getMyEvents error:', error);
    return { success: false, error: 'שגיאה בטעינת האירועים' };
  }
}

// ─── Get Event By Join Code ─────────────────────────────────────────────────

export async function getEventByJoinCode(
  joinCode: string
): Promise<ActionResponse<EventWithDetails>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות באירוע' };
    }

    const event = await prisma.event.findUnique({
      where: { join_code: joinCode.toUpperCase().trim() },
      include: eventWithDetailsInclude,
    });

    if (!event) {
      return { success: false, error: 'אירוע לא נמצא עם קוד זה' };
    }

    if (!event.is_active) {
      return { success: false, error: 'האירוע אינו פעיל' };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error('getEventByJoinCode error:', error);
    return { success: false, error: 'שגיאה בטעינת האירוע' };
  }
}

// ─── Opt-In Profile to Event ────────────────────────────────────────────────

export async function optInProfile(
  eventId: string,
  profileId: string
): Promise<ActionResponse<EventParticipation>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי להצטרף לאירוע' };
    }

    // Verify profile exists and user owns it
    const profile = await prisma.profileCard.findUnique({
      where: { id: profileId },
      select: { creator_id: true, is_active: true },
    });

    if (!profile) {
      return { success: false, error: 'הכרטיס לא נמצא' };
    }

    if (profile.creator_id !== user.id) {
      return { success: false, error: 'אין הרשאה לשייך כרטיס זה' };
    }

    if (!profile.is_active) {
      return { success: false, error: 'הכרטיס אינו פעיל' };
    }

    // Verify event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { is_active: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    if (!event.is_active) {
      return { success: false, error: 'האירוע אינו פעיל' };
    }

    // Check for duplicate opt-in
    const existingParticipation = await prisma.eventParticipation.findUnique({
      where: {
        event_id_profile_id: {
          event_id: eventId,
          profile_id: profileId,
        },
      },
    });

    if (existingParticipation) {
      return { success: false, error: 'הכרטיס כבר משויך לאירוע זה' };
    }

    const participation = await prisma.eventParticipation.create({
      data: {
        event_id: eventId,
        profile_id: profileId,
        opted_in_by: user.id,
      },
    });

    return { success: true, data: participation };
  } catch (error) {
    console.error('optInProfile error:', error);
    return { success: false, error: 'שגיאה בהצטרפות לאירוע' };
  }
}

// ─── Get Event Participants ─────────────────────────────────────────────────

export async function getEventParticipants(
  eventId: string
): Promise<ActionResponse<ProfileWithCreator[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות במשתתפים' };
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    const participations = await prisma.eventParticipation.findMany({
      where: { event_id: eventId },
      include: {
        profile: {
          include: profileWithCreatorInclude,
        },
      },
      orderBy: { opted_in_at: 'desc' },
    });

    const profiles = participations.map((p) => p.profile);

    return { success: true, data: profiles };
  } catch (error) {
    console.error('getEventParticipants error:', error);
    return { success: false, error: 'שגיאה בטעינת המשתתפים' };
  }
}
