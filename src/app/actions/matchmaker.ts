'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendStatusChangeNotification } from '@/lib/email';
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
      return { success: false, error: 'יש להתחבר כדי לצפות באירועי שדכנות' };
    }

    if (!user.roles.includes('matchmaker')) {
      return { success: false, error: 'רק שדכנים יכולים לגשת לעמוד זה' };
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
    return { success: false, error: 'שגיאה בטעינת אירועי השדכנות' };
  }
}

// ─── Get Shadchan Event Requests ────────────────────────────────────────────

export async function getShadchanEventRequests(
  eventId: string
): Promise<ActionResponse<InterestRequestWithProfiles[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'יש להתחבר כדי לצפות בבקשות' };
    }

    if (!user.roles.includes('matchmaker')) {
      return { success: false, error: 'רק שדכנים יכולים לגשת לבקשות אלו' };
    }

    // Verify the event exists and user is the matchmaker for it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, matchmaker_id: true },
    });

    if (!event) {
      return { success: false, error: 'האירוע לא נמצא' };
    }

    if (event.matchmaker_id !== user.id) {
      return { success: false, error: 'אין הרשאה לצפות בבקשות אירוע זה' };
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
    return { success: false, error: 'שגיאה בטעינת בקשות האירוע' };
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
      return { success: false, error: 'יש להתחבר כדי לעדכן סטטוס בקשה' };
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
          },
        },
        requester: {
          select: { full_name: true, email: true },
        },
      },
    });

    if (!existingRequest) {
      return { success: false, error: 'הבקשה לא נמצאה' };
    }

    if (existingRequest.event.matchmaker_id !== user.id) {
      return { success: false, error: 'אין הרשאה לעדכן בקשה זו' };
    }

    // Validate status value
    const validStatuses: RequestStatus[] = ['pending', 'reviewed', 'approved', 'rejected', 'archived'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'סטטוס לא תקין' };
    }

    // Build update data
    const updateData: { status: RequestStatus; matchmaker_notes?: string } = {
      status,
    };
    if (notes !== undefined) {
      updateData.matchmaker_notes = notes;
    }

    const updatedRequest = await prisma.interestRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Send status change notification (non-blocking)
    const targetName = `${existingRequest.target_profile.subject_first_name} ${existingRequest.target_profile.subject_last_name}`;
    sendStatusChangeNotification(
      existingRequest.requester.email,
      existingRequest.requester.full_name,
      targetName,
      existingRequest.event.name,
      status
    ).catch((err) => {
      console.error('Failed to send status change notification:', err);
    });

    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('updateRequestStatus error:', error);
    return { success: false, error: 'שגיאה בעדכון סטטוס הבקשה' };
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
      return { success: false, error: 'יש להתחבר כדי להוסיף הערה' };
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
      return { success: false, error: 'הבקשה לא נמצאה' };
    }

    if (existingRequest.event.matchmaker_id !== user.id) {
      return { success: false, error: 'אין הרשאה להוסיף הערה לבקשה זו' };
    }

    if (!note.trim()) {
      return { success: false, error: 'יש להזין הערה' };
    }

    const updatedRequest = await prisma.interestRequest.update({
      where: { id: requestId },
      data: { matchmaker_notes: note.trim() },
    });

    return { success: true, data: updatedRequest };
  } catch (error) {
    console.error('addMatchmakerNote error:', error);
    return { success: false, error: 'שגיאה בהוספת ההערה' };
  }
}
