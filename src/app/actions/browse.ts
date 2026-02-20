'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isEventAccessible, calculateAge } from '@/lib/utils';
import type {
  ActionResponse,
  EventBrowseProfile,
  ProfileFilters,
  ProfileWithCreator,
} from '@/types';

// ─── Shared Prisma includes ────────────────────────────────────────────────

const profileWithCreatorInclude = {
  creator: {
    select: { id: true, full_name: true, email: true, phone: true },
  },
} as const;

// ─── Select fields for browse profile (matches EventBrowseProfile type) ─────

const browseProfileSelect = {
  id: true,
  subject_first_name: true,
  subject_last_name: true,
  gender: true,
  date_of_birth: true,
  photo_url: true,
  height: true,
  occupation: true,
  education: true,
  ethnicity: true,
  hashkafa: true,
} as const;

// ─── Get Event Browse Profiles ───────────────────────────────────────────────

export async function getEventBrowseProfiles(
  eventId: string,
  filters?: ProfileFilters
): Promise<ActionResponse<EventBrowseProfile[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לעיין בפרופילים' };
    }

    // Verify event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        is_active: true,
        organizer_id: true,
        matchmaker_id: true,
        start_time: true,
        end_time: true,
        pre_access_hours: true,
        post_access_hours: true,
      },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    if (!event.is_active) {
      return { success: false, error: 'האירוע אינו פעיל' };
    }

    // Check that the event is within its access window
    if (!isEventAccessible(event)) {
      return { success: false, error: 'האירוע אינו בחלון הגישה הפעיל' };
    }

    // Authorization: user must be organizer, matchmaker, or have a profile in this event
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
        return { success: false, error: 'אין הרשאה לעיין בפרופילים באירוע זה' };
      }
    }

    // Get the current user's profile IDs so we can exclude them
    const userProfiles = await prisma.profileCard.findMany({
      where: { creator_id: user.id },
      select: { id: true },
    });
    const userProfileIds = userProfiles.map((p) => p.id);

    // Build where clause for profile filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileWhere: Record<string, any> = {
      is_active: true,
    };

    if (filters?.gender) {
      profileWhere.gender = filters.gender;
    }

    if (filters?.hashkafa) {
      profileWhere.hashkafa = filters.hashkafa;
    }

    if (filters?.ethnicity) {
      profileWhere.ethnicity = filters.ethnicity;
    }

    if (filters?.education) {
      profileWhere.education = filters.education;
    }

    // Build participation where clause, excluding user's own profiles if any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const participationWhere: Record<string, any> = {
      event_id: eventId,
      profile: profileWhere,
    };

    if (userProfileIds.length > 0) {
      participationWhere.profile_id = { notIn: userProfileIds };
    }

    // Get all opted-in profiles for this event, excluding the current user's own profiles
    const participations = await prisma.eventParticipation.findMany({
      where: participationWhere,
      include: {
        profile: {
          select: browseProfileSelect,
        },
      },
    });

    let profiles: EventBrowseProfile[] = participations.map((p) => p.profile);

    // Apply age filters (calculated from date_of_birth) in-memory
    if (filters?.min_age !== undefined || filters?.max_age !== undefined) {
      profiles = profiles.filter((profile) => {
        const age = calculateAge(new Date(profile.date_of_birth));
        if (filters.min_age !== undefined && age < filters.min_age) {
          return false;
        }
        if (filters.max_age !== undefined && age > filters.max_age) {
          return false;
        }
        return true;
      });
    }

    return { success: true, data: profiles };
  } catch (error) {
    console.error('getEventBrowseProfiles error:', error);
    return { success: false, error: 'שגיאה בטעינת הפרופילים' };
  }
}

// ─── Get Profile Detail For Event ────────────────────────────────────────────

export async function getProfileDetailForEvent(
  eventId: string,
  profileId: string
): Promise<ActionResponse<ProfileWithCreator>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות בפרופיל' };
    }

    // Verify event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        is_active: true,
        start_time: true,
        end_time: true,
        pre_access_hours: true,
        post_access_hours: true,
      },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    if (!event.is_active) {
      return { success: false, error: 'האירוע אינו פעיל' };
    }

    // Check that the event is within its access window
    if (!isEventAccessible(event)) {
      return { success: false, error: 'האירוע אינו בחלון הגישה הפעיל' };
    }

    // Verify the target profile is opted into this event
    const targetParticipation = await prisma.eventParticipation.findUnique({
      where: {
        event_id_profile_id: {
          event_id: eventId,
          profile_id: profileId,
        },
      },
    });

    if (!targetParticipation) {
      return { success: false, error: 'הפרופיל אינו משתתף באירוע זה' };
    }

    // Verify the viewer (current user) has at least one profile opted into this event
    const viewerParticipation = await prisma.eventParticipation.findFirst({
      where: {
        event_id: eventId,
        profile: {
          creator_id: user.id,
        },
      },
    });

    if (!viewerParticipation) {
      return { success: false, error: 'יש להצטרף לאירוע כדי לצפות בפרופילים' };
    }

    // Get full profile details with creator info
    const profile = await prisma.profileCard.findUnique({
      where: { id: profileId },
      include: profileWithCreatorInclude,
    });

    if (!profile) {
      return { success: false, error: 'הפרופיל לא נמצא' };
    }

    if (!profile.is_active) {
      return { success: false, error: 'הפרופיל אינו פעיל' };
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error('getProfileDetailForEvent error:', error);
    return { success: false, error: 'שגיאה בטעינת פרטי הפרופיל' };
  }
}
