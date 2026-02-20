'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createEventSchema, updateEventSchema } from '@/lib/validations/event';
import { generateJoinCode } from '@/lib/utils';
import type { ActionResponse, EventWithDetails, ProfileWithCreator } from '@/types';
import type { Event, EventParticipation } from '@prisma/client';

// ─── Assign Matchmaker ──────────────────────────────────────────────────────

export async function assignMatchmaker(
  eventId: string,
  matchmakerEmail: string
): Promise<ActionResponse<Event>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לשייך שדכן/ית' };
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organizer_id: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    // Verify the current user is the event organizer
    if (event.organizer_id !== user.id) {
      return { success: false, error: 'רק מארגן האירוע יכול לשייך שדכן/ית' };
    }

    // Look up the target user by email
    const matchmakerUser = await prisma.user.findUnique({
      where: { email: matchmakerEmail.toLowerCase().trim() },
      select: { id: true, roles: true },
    });

    if (!matchmakerUser) {
      return { success: false, error: 'המשתמש עם אימייל זה לא נמצא' };
    }

    // Verify the target user has the 'matchmaker' role
    if (!matchmakerUser.roles.includes('matchmaker')) {
      return { success: false, error: 'המשתמש אינו בעל תפקיד שדכן/ית' };
    }

    // Update the event's matchmaker_id
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { matchmaker_id: matchmakerUser.id },
    });

    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error('assignMatchmaker error:', error);
    return { success: false, error: 'שגיאה בשיוך שדכן/ית לאירוע' };
  }
}

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

    const matchmakerEmail = (formData.get('matchmaker_email') as string)?.trim() || null;

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

    // If matchmaker_email was provided and no matchmaker_id was set, try to assign by email
    if (matchmakerEmail && !data.matchmaker_id) {
      try {
        const matchmakerUser = await prisma.user.findUnique({
          where: { email: matchmakerEmail.toLowerCase() },
          select: { id: true, roles: true },
        });

        if (matchmakerUser && matchmakerUser.roles.includes('matchmaker')) {
          await prisma.event.update({
            where: { id: event.id },
            data: { matchmaker_id: matchmakerUser.id },
          });
        }
      } catch (matchmakerError) {
        // Non-blocking: event was created successfully, matchmaker assignment failed
        console.error('Failed to assign matchmaker by email:', matchmakerError);
      }
    }

    return { success: true, data: event };
  } catch (error) {
    console.error('createEvent error:', error);
    return { success: false, error: 'שגיאה ביצירת האירוע' };
  }
}

// ─── Get Event By ID ─────────────────────────────────────────────────────

export async function getEventById(
  eventId: string
): Promise<ActionResponse<EventWithDetails>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות באירוע' };
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: eventWithDetailsInclude,
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    // Strip join_code for non-organizer users
    if (event.organizer_id !== user.id) {
      return { success: true, data: { ...event, join_code: '' } };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error('getEventById error:', error);
    return { success: false, error: 'שגיאה בטעינת האירוע' };
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

    // Find the user's profile IDs so we can look up participated events
    const userProfiles = await prisma.profileCard.findMany({
      where: { creator_id: user.id, is_active: true },
      select: { id: true },
    });
    const userProfileIds = userProfiles.map((p) => p.id);

    // Return events where user is the organizer OR where the user has
    // an EventParticipation record via one of their profile cards
    const events = await prisma.event.findMany({
      where: {
        is_active: true,
        OR: [
          { organizer_id: user.id },
          ...(userProfileIds.length > 0
            ? [
                {
                  participations: {
                    some: {
                      profile_id: { in: userProfileIds },
                    },
                  },
                },
              ]
            : []),
        ],
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

    // Verify event exists and fetch organizer/matchmaker for authorization
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organizer_id: true, matchmaker_id: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    // Authorization: user must be organizer, matchmaker, or a participant
    const isOrganizer = event.organizer_id === user.id;
    const isMatchmaker = event.matchmaker_id === user.id;

    if (!isOrganizer && !isMatchmaker) {
      const userParticipation = await prisma.eventParticipation.findFirst({
        where: {
          event_id: eventId,
          profile: { creator_id: user.id },
        },
        select: { id: true },
      });

      if (!userParticipation) {
        return { success: false, error: 'אין הרשאה לצפות במשתתפי אירוע זה' };
      }
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

// ─── Update Event ──────────────────────────────────────────────────────────

export async function updateEvent(
  formData: FormData
): Promise<ActionResponse<Event>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לעדכן אירוע' };
    }

    const rawData = {
      id: formData.get('id') as string,
      name: formData.get('name') as string || undefined,
      description: formData.get('description') as string || undefined,
      event_date: formData.get('event_date') as string || undefined,
      start_time: formData.get('start_time') as string || undefined,
      end_time: formData.get('end_time') as string || undefined,
      pre_access_hours: formData.get('pre_access_hours') as string || undefined,
      post_access_hours: formData.get('post_access_hours') as string || undefined,
    };

    const parsed = updateEventSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'נתונים לא תקינים' };
    }

    const { id, ...updateFields } = parsed.data;

    // Verify event exists and user is the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { organizer_id: true },
    });

    if (!existingEvent) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    if (existingEvent.organizer_id !== user.id) {
      return { success: false, error: 'רק מארגן האירוע יכול לעדכן אותו' };
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateFields,
    });

    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error('updateEvent error:', error);
    return { success: false, error: 'שגיאה בעדכון האירוע' };
  }
}

// ─── Toggle Event Active ───────────────────────────────────────────────────

export async function toggleEventActive(
  eventId: string
): Promise<ActionResponse<Event>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לשנות סטטוס אירוע' };
    }

    // Verify event exists and user is the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizer_id: true, is_active: true },
    });

    if (!existingEvent) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    if (existingEvent.organizer_id !== user.id) {
      return { success: false, error: 'רק מארגן האירוע יכול לשנות את סטטוס האירוע' };
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { is_active: !existingEvent.is_active },
    });

    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error('toggleEventActive error:', error);
    return { success: false, error: 'שגיאה בשינוי סטטוס האירוע' };
  }
}
