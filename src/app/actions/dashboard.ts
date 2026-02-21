'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { ActionResponse, EventWithDetails } from '@/types';

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

// ─── Dashboard Stats Types ──────────────────────────────────────────────────

interface DashboardStats {
  profileCount: number;
  activeEventCount: number;
  pendingRequestCount: number;
}

interface OrganizerStats {
  events: EventWithDetails[];
  totalParticipants: number;
  totalRequests: number;
}

// ─── Get Dashboard Stats ────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<
  ActionResponse<DashboardStats>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewDashboard' };
    }

    // Count active profile cards created by user
    const profileCount = await prisma.profileCard.count({
      where: {
        creator_id: user.id,
        is_active: true,
      },
    });

    // Count active events the user's profiles are opted into
    const activeEventCount = await prisma.eventParticipation.count({
      where: {
        profile: {
          creator_id: user.id,
        },
        event: {
          is_active: true,
        },
      },
    });

    // Count pending interest requests sent by user
    const pendingRequestCount = await prisma.interestRequest.count({
      where: {
        requested_by: user.id,
        status: 'pending',
      },
    });

    return {
      success: true,
      data: {
        profileCount,
        activeEventCount,
        pendingRequestCount,
      },
    };
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return { success: false, error: 'actions.dashboardLoadError' };
  }
}

// ─── Get Organizer Stats ────────────────────────────────────────────────────

export async function getOrganizerStats(): Promise<
  ActionResponse<OrganizerStats>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewOrganizerData' };
    }

    if (!user.roles.includes('organizer')) {
      return { success: false, error: 'actions.onlyOrganizersData' };
    }

    // Get all events organized by this user
    const events = await prisma.event.findMany({
      where: {
        organizer_id: user.id,
      },
      include: eventWithDetailsInclude,
      orderBy: { event_date: 'desc' },
    });

    // Calculate totals from the _count fields
    let totalParticipants = 0;
    let totalRequests = 0;

    for (const event of events) {
      totalParticipants += event._count.participations;
      totalRequests += event._count.interest_requests;
    }

    return {
      success: true,
      data: {
        events,
        totalParticipants,
        totalRequests,
      },
    };
  } catch (error) {
    console.error('getOrganizerStats error:', error);
    return { success: false, error: 'actions.organizerDataError' };
  }
}
