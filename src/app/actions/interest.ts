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
      return { success: false, error: 'actions.loginToSendInterest' };
    }

    // Validate input with Zod
    const parsed = createInterestSchema.safeParse({
      event_id: eventId,
      requesting_profile_id: requestingProfileId,
      target_profile_id: targetProfileId,
    });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'errors.invalidData' };
    }

    // Prevent self-interest
    if (requestingProfileId === targetProfileId) {
      return { success: false, error: 'actions.cannotSelfInterest' };
    }

    // Verify requesting profile exists and user owns it
    const requestingProfile = await prisma.profileCard.findUnique({
      where: { id: requestingProfileId },
      select: { creator_id: true, is_active: true },
    });

    if (!requestingProfile) {
      return { success: false, error: 'actions.requestingCardNotFound' };
    }

    if (requestingProfile.creator_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToSendFromCard' };
    }

    if (!requestingProfile.is_active) {
      return { success: false, error: 'actions.requestingCardNotActive' };
    }

    // Verify target profile exists
    const targetProfile = await prisma.profileCard.findUnique({
      where: { id: targetProfileId },
      select: { is_active: true },
    });

    if (!targetProfile) {
      return { success: false, error: 'actions.targetCardNotFound' };
    }

    if (!targetProfile.is_active) {
      return { success: false, error: 'actions.targetCardNotActive' };
    }

    // Verify event exists, is active, and within request submission window
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { is_active: true, start_time: true, end_time: true, pre_access_hours: true, post_access_hours: true },
    });

    if (!event) {
      return { success: false, error: 'actions.eventNotFound' };
    }

    if (!event.is_active) {
      return { success: false, error: 'actions.eventNotActive' };
    }

    if (!canSubmitRequests(event)) {
      return { success: false, error: 'actions.requestWindowClosed' };
    }

    // Verify both profiles are opted into this event
    const [requestingParticipation, targetParticipation] = await Promise.all([
      prisma.eventParticipation.findUnique({
        where: {
          event_id_profile_id: {
            event_id: eventId,
            profile_id: requestingProfileId,
          },
        },
        select: { id: true },
      }),
      prisma.eventParticipation.findUnique({
        where: {
          event_id_profile_id: {
            event_id: eventId,
            profile_id: targetProfileId,
          },
        },
        select: { id: true },
      }),
    ]);

    if (!requestingParticipation) {
      return { success: false, error: 'actions.requestingNotInEvent' };
    }

    if (!targetParticipation) {
      return { success: false, error: 'actions.targetNotInEvent' };
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
      return { success: false, error: 'actions.duplicateRequest' };
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
    return { success: false, error: 'actions.interestSendError' };
  }
}

// ─── Get Sent Interest Target IDs ────────────────────────────────────────────

export async function getSentInterestTargetIds(
  eventId: string
): Promise<ActionResponse<string[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewInterests' };
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
    return { success: false, error: 'actions.interestTargetIdsError' };
  }
}

// ─── Get Interest Requests For Event (sent by current user) ──────────────────

export async function getInterestRequestsForEvent(
  eventId: string
): Promise<ActionResponse<InterestRequestWithProfiles[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewInterests' };
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return { success: false, error: 'actions.eventNotFound' };
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
    return { success: false, error: 'actions.interestLoadError' };
  }
}

// ─── Cancel Interest Request ─────────────────────────────────────────────────

export async function cancelInterestRequest(
  requestId: string
): Promise<ActionResponse<null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToCancelInterest' };
    }

    // Find the interest request and verify ownership
    const request = await prisma.interestRequest.findUnique({
      where: { id: requestId },
      include: {
        requesting_profile: {
          select: { creator_id: true },
        },
      },
    });

    if (!request) {
      return { success: false, error: 'actions.requestNotFound' };
    }

    // Verify the requester (requesting profile's creator) is the current user
    if (request.requesting_profile.creator_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToCancel' };
    }

    // Only allow cancellation if status is still pending
    if (request.status !== 'pending') {
      return { success: false, error: 'actions.canOnlyCancelPending' };
    }

    // Hard delete since the request was never acted on
    await prisma.interestRequest.delete({
      where: { id: requestId },
    });

    return { success: true, data: null };
  } catch (error) {
    console.error('cancelInterestRequest error:', error);
    return { success: false, error: 'actions.cancelError' };
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
      return { success: false, error: 'actions.loginToViewIncoming' };
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!event) {
      return { success: false, error: 'actions.eventNotFound' };
    }

    // Verify the profile exists and belongs to the current user
    const profile = await prisma.profileCard.findUnique({
      where: { id: profileId },
      select: { creator_id: true },
    });

    if (!profile) {
      return { success: false, error: 'actions.cardNotFound' };
    }

    if (profile.creator_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToViewRequests' };
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
    return { success: false, error: 'actions.incomingLoadError' };
  }
}
