'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createInterestSchema } from '@/lib/validations/interest';
import { canSubmitRequests } from '@/lib/utils';
import { sendInterestConfirmation, sendNewRequestToShadchan } from '@/lib/email';
import type { ActionResponse, InterestRequestWithProfiles } from '@/types';
import type { InterestRequest } from '@prisma/client';

// ─── Shared Prisma includes ────────────────────────────────────────────────

const profileWithCreatorInclude = {
  creator: {
    select: { id: true, full_name: true, email: true, phone: true },
  },
} as const;

const interestRequestWithProfilesInclude = {
  requesting_profile: {
    include: profileWithCreatorInclude,
  },
  target_profile: {
    include: profileWithCreatorInclude,
  },
  requester: {
    select: { id: true, full_name: true, email: true, phone: true },
  },
} as const;

// ─── Create Interest Request ─────────────────────────────────────────────────

export async function createInterestRequest(
  eventId: string,
  requestingProfileId: string,
  targetProfileId: string
): Promise<ActionResponse<InterestRequest>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לשלוח בקשת עניין' };
    }

    // Validate input with Zod
    const parsed = createInterestSchema.safeParse({
      event_id: eventId,
      requesting_profile_id: requestingProfileId,
      target_profile_id: targetProfileId,
    });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'נתונים לא תקינים' };
    }

    // Prevent self-interest
    if (requestingProfileId === targetProfileId) {
      return { success: false, error: 'לא ניתן לשלוח בקשת עניין לעצמך' };
    }

    // Verify requesting profile exists and user owns it
    const requestingProfile = await prisma.profileCard.findUnique({
      where: { id: requestingProfileId },
      select: { creator_id: true, is_active: true },
    });

    if (!requestingProfile) {
      return { success: false, error: 'הכרטיס המבקש לא נמצא' };
    }

    if (requestingProfile.creator_id !== user.id) {
      return { success: false, error: 'אין הרשאה לשלוח בקשת עניין מכרטיס זה' };
    }

    if (!requestingProfile.is_active) {
      return { success: false, error: 'הכרטיס המבקש אינו פעיל' };
    }

    // Verify target profile exists
    const targetProfile = await prisma.profileCard.findUnique({
      where: { id: targetProfileId },
      select: { is_active: true },
    });

    if (!targetProfile) {
      return { success: false, error: 'כרטיס היעד לא נמצא' };
    }

    if (!targetProfile.is_active) {
      return { success: false, error: 'כרטיס היעד אינו פעיל' };
    }

    // Verify event exists, is active, and within request submission window
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { is_active: true, start_time: true, end_time: true, pre_access_hours: true, post_access_hours: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    if (!event.is_active) {
      return { success: false, error: 'האירוע אינו פעיל' };
    }

    if (!canSubmitRequests(event)) {
      return { success: false, error: 'חלון הזמן להגשת בקשות עניין הסתיים' };
    }

    // Prevent duplicate request (same event + requester + target)
    const existingRequest = await prisma.interestRequest.findUnique({
      where: {
        event_id_requesting_profile_id_target_profile_id: {
          event_id: eventId,
          requesting_profile_id: requestingProfileId,
          target_profile_id: targetProfileId,
        },
      },
    });

    if (existingRequest) {
      return { success: false, error: 'כבר נשלחה בקשת עניין לכרטיס זה באירוע זה' };
    }

    // Check if mutual interest exists (target already sent request to requester)
    const reverseRequest = await prisma.interestRequest.findUnique({
      where: {
        event_id_requesting_profile_id_target_profile_id: {
          event_id: eventId,
          requesting_profile_id: targetProfileId,
          target_profile_id: requestingProfileId,
        },
      },
    });

    const isMutual = !!reverseRequest;

    // Create the interest request
    const interestRequest = await prisma.interestRequest.create({
      data: {
        event_id: eventId,
        requesting_profile_id: requestingProfileId,
        target_profile_id: targetProfileId,
        requested_by: user.id,
        is_mutual: isMutual,
      },
    });

    // If mutual, update the reverse request to also be marked mutual
    if (isMutual && reverseRequest) {
      await prisma.interestRequest.update({
        where: { id: reverseRequest.id },
        data: { is_mutual: true },
      });
    }

    // Send email notifications (non-blocking)
    try {
      // Fetch names and event details for notification emails
      const [reqProfile, tgtProfile, eventDetails] = await Promise.all([
        prisma.profileCard.findUnique({
          where: { id: requestingProfileId },
          select: { subject_first_name: true, subject_last_name: true },
        }),
        prisma.profileCard.findUnique({
          where: { id: targetProfileId },
          select: { subject_first_name: true, subject_last_name: true },
        }),
        prisma.event.findUnique({
          where: { id: eventId },
          select: {
            name: true,
            matchmaker_id: true,
            matchmaker: { select: { email: true, full_name: true } },
          },
        }),
      ]);

      if (reqProfile && tgtProfile && eventDetails) {
        const requesterName = `${reqProfile.subject_first_name} ${reqProfile.subject_last_name}`;
        const targetName = `${tgtProfile.subject_first_name} ${tgtProfile.subject_last_name}`;

        // Send confirmation to the creator who submitted the request
        sendInterestConfirmation(
          user.email,
          requesterName,
          targetName,
          eventDetails.name
        ).catch((err) => {
          console.error('Failed to send interest confirmation email:', err);
        });

        // Notify the shadchan if one is assigned
        if (eventDetails.matchmaker) {
          sendNewRequestToShadchan(
            eventDetails.matchmaker.email,
            eventDetails.matchmaker.full_name,
            requesterName,
            targetName,
            eventDetails.name
          ).catch((err) => {
            console.error('Failed to send shadchan notification email:', err);
          });
        }
      }
    } catch (emailError) {
      // Email failures should not affect the main action
      console.error('Error preparing notification emails:', emailError);
    }

    return { success: true, data: interestRequest };
  } catch (error) {
    console.error('createInterestRequest error:', error);
    return { success: false, error: 'שגיאה בשליחת בקשת העניין' };
  }
}

// ─── Get Sent Interest Target IDs ────────────────────────────────────────────

export async function getSentInterestTargetIds(
  eventId: string
): Promise<ActionResponse<string[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות בבקשות עניין' };
    }

    const requests = await prisma.interestRequest.findMany({
      where: {
        event_id: eventId,
        requested_by: user.id,
      },
      select: { target_profile_id: true },
    });

    return {
      success: true,
      data: requests.map((r) => r.target_profile_id),
    };
  } catch (error) {
    console.error('getSentInterestTargetIds error:', error);
    return { success: false, error: 'שגיאה בטעינת מזהי היעדים' };
  }
}

// ─── Get Interest Requests For Event (sent by current user) ──────────────────

export async function getInterestRequestsForEvent(
  eventId: string
): Promise<ActionResponse<InterestRequestWithProfiles[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות בבקשות עניין' };
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    // Get all interest requests where the current user is the requester
    const requests = await prisma.interestRequest.findMany({
      where: {
        event_id: eventId,
        requested_by: user.id,
      },
      include: interestRequestWithProfilesInclude,
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error('getInterestRequestsForEvent error:', error);
    return { success: false, error: 'שגיאה בטעינת בקשות העניין' };
  }
}

// ─── Get Incoming Interest Requests (for shadchan view) ──────────────────────

export async function getIncomingInterestRequests(
  eventId: string,
  profileId: string
): Promise<ActionResponse<InterestRequestWithProfiles[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות בבקשות נכנסות' };
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    // Verify the profile exists and belongs to the current user
    const profile = await prisma.profileCard.findUnique({
      where: { id: profileId },
      select: { creator_id: true },
    });

    if (!profile) {
      return { success: false, error: 'הכרטיס לא נמצא' };
    }

    if (profile.creator_id !== user.id) {
      return { success: false, error: 'אין הרשאה לצפות בבקשות עבור כרטיס זה' };
    }

    // Get interest requests where the target_profile_id matches
    const requests = await prisma.interestRequest.findMany({
      where: {
        event_id: eventId,
        target_profile_id: profileId,
      },
      include: interestRequestWithProfilesInclude,
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error('getIncomingInterestRequests error:', error);
    return { success: false, error: 'שגיאה בטעינת הבקשות הנכנסות' };
  }
}
