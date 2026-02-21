'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { updateInterestStatusSchema } from '@/lib/validations/interest';
import { sendStatusChangeNotification, sendApprovalToTarget } from '@/lib/email';
import type { ActionResponse, EventWithDetails, InterestRequestWithProfiles } from '@/types';
import type { InterestRequest, RequestStatus } from '@prisma/client';

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

// ─── Get Shadchan Events ────────────────────────────────────────────────────

export async function getShadchanEvents(): Promise<
  ActionResponse<EventWithDetails[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewShadchanEvents' };
    }

    if (!user.roles.includes('matchmaker')) {
      return { success: false, error: 'actions.onlyShadchanim' };
    }

    const events = await prisma.event.findMany({
      where: {
        matchmaker_id: user.id,
        is_active: true,
      },
      include: eventWithDetailsInclude,
      orderBy: { event_date: 'desc' },
    });

    return { success: true, data: events };
  } catch (error) {
    console.error('getShadchanEvents error:', error);
    return { success: false, error: 'actions.shadchanEventsError' };
  }
}

// ─── Get Shadchan Event Requests ────────────────────────────────────────────

export async function getShadchanEventRequests(
  eventId: string
): Promise<ActionResponse<InterestRequestWithProfiles[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewRequests' };
    }

    if (!user.roles.includes('matchmaker')) {
      return { success: false, error: 'actions.onlyShadchanimRequests' };
    }

    // Verify the event exists and user is the matchmaker for it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, matchmaker_id: true },
    });

    if (!event) {
      return { success: false, error: 'actions.eventNotFound' };
    }

    if (event.matchmaker_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToViewEventRequests' };
    }

    const requests = await prisma.interestRequest.findMany({
      where: {
        event_id: eventId,
      },
      include: interestRequestWithProfilesInclude,
      orderBy: [
        { is_mutual: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error('getShadchanEventRequests error:', error);
    return { success: false, error: 'actions.eventRequestsError' };
  }
}

// ─── Update Request Status ──────────────────────────────────────────────────

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  notes?: string
): Promise<ActionResponse<InterestRequest>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToUpdateStatus' };
    }

    // Fetch the request with its event to verify matchmaker authorization
    const existingRequest = await prisma.interestRequest.findUnique({
      where: { id: requestId },
      include: {
        event: {
          select: { matchmaker_id: true, name: true },
        },
        requesting_profile: {
          select: {
            subject_first_name: true,
            subject_last_name: true,
          },
        },
        target_profile: {
          select: {
            subject_first_name: true,
            subject_last_name: true,
            creator: {
              select: { full_name: true, email: true },
            },
          },
        },
        requester: {
          select: { full_name: true, email: true },
        },
      },
    });

    if (!existingRequest) {
      return { success: false, error: 'actions.requestNotFound' };
    }

    if (existingRequest.event.matchmaker_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToUpdateRequest' };
    }

    // Validate input with Zod schema
    const parsed = updateInterestStatusSchema.safeParse({
      id: requestId,
      status,
      notes,
    });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'errors.invalidData' };
    }

    // Build update data
    const updateData: { status: RequestStatus; matchmaker_notes?: string } = {
      status: parsed.data.status,
    };
    if (parsed.data.notes !== undefined) {
      updateData.matchmaker_notes = parsed.data.notes;
    }

    const updatedRequest = await prisma.interestRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Send status change notification to requester (non-blocking)
    const targetName = `${existingRequest.target_profile.subject_first_name} ${existingRequest.target_profile.subject_last_name}`;
    const requesterName = `${existingRequest.requesting_profile.subject_first_name} ${existingRequest.requesting_profile.subject_last_name}`;
    sendStatusChangeNotification(
      existingRequest.requester.email,
      existingRequest.requester.full_name,
      targetName,
      existingRequest.event.name,
      status
    ).catch((err) => {
      console.error('Failed to send status change notification:', err);
    });

    // Send approval notification to target profile's creator (non-blocking)
    if (status === 'approved' && existingRequest.target_profile.creator) {
      sendApprovalToTarget(
        existingRequest.target_profile.creator.email,
        existingRequest.target_profile.creator.full_name,
        requesterName,
        existingRequest.event.name
      ).catch((err) => {
        console.error('Failed to send approval notification to target:', err);
      });
    }

    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('updateRequestStatus error:', error);
    return { success: false, error: 'actions.statusUpdateError' };
  }
}

// ─── Add Matchmaker Note ────────────────────────────────────────────────────

export async function addMatchmakerNote(
  requestId: string,
  note: string
): Promise<ActionResponse<InterestRequest>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToAddNote' };
    }

    // Fetch the request with its event to verify matchmaker authorization
    const existingRequest = await prisma.interestRequest.findUnique({
      where: { id: requestId },
      include: {
        event: {
          select: { matchmaker_id: true },
        },
      },
    });

    if (!existingRequest) {
      return { success: false, error: 'actions.requestNotFound' };
    }

    if (existingRequest.event.matchmaker_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToAddNote' };
    }

    if (!note.trim()) {
      return { success: false, error: 'actions.noteRequired' };
    }

    const updatedRequest = await prisma.interestRequest.update({
      where: { id: requestId },
      data: { matchmaker_notes: note.trim() },
    });

    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('addMatchmakerNote error:', error);
    return { success: false, error: 'actions.noteAddError' };
  }
}
