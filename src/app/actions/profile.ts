'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createProfileSchema, updateProfileSchema } from '@/lib/validations/profile';
import type { ActionResponse, ProfileWithCreator } from '@/types';
import type { ProfileCard } from '@prisma/client';

// ─── Shared Prisma include for ProfileWithCreator ──────────────────────────

const profileWithCreatorInclude = {
  creator: {
    select: { id: true, full_name: true, email: true, phone: true },
  },
} as const;

// ─── Create Profile ─────────────────────────────────────────────────────────

export async function createProfile(
  formData: FormData
): Promise<ActionResponse<ProfileCard>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToCreateCard' };
    }

    const rawData = {
      subject_first_name: formData.get('subject_first_name') as string,
      subject_last_name: formData.get('subject_last_name') as string,
      subject_email: formData.get('subject_email') as string,
      subject_phone: formData.get('subject_phone') as string,
      gender: formData.get('gender') as string,
      date_of_birth: formData.get('date_of_birth') as string,
      photo_url: formData.get('photo_url') as string,
      height: formData.get('height') as string,
      occupation: formData.get('occupation') as string,
      education: formData.get('education') as string,
      ethnicity: formData.get('ethnicity') as string,
      family_background: formData.get('family_background') as string,
      hashkafa: formData.get('hashkafa') as string,
      additional_info: formData.get('additional_info') as string,
    };

    const parsed = createProfileSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'errors.invalidData' };
    }

    const data = parsed.data;

    const profile = await prisma.profileCard.create({
      data: {
        creator_id: user.id,
        subject_first_name: data.subject_first_name,
        subject_last_name: data.subject_last_name,
        subject_email: data.subject_email || null,
        subject_phone: data.subject_phone || null,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        photo_url: data.photo_url || null,
        height: data.height || null,
        occupation: data.occupation || null,
        education: data.education || null,
        ethnicity: data.ethnicity || null,
        family_background: data.family_background || null,
        hashkafa: data.hashkafa || null,
        additional_info: data.additional_info || null,
      },
    });

    return { success: true, data: profile };
  } catch (error) {
    console.error('createProfile error:', error);
    return { success: false, error: 'actions.cardCreateError' };
  }
}

// ─── Update Profile ─────────────────────────────────────────────────────────

export async function updateProfile(
  formData: FormData
): Promise<ActionResponse<ProfileCard>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToUpdateCard' };
    }

    const rawData: Record<string, unknown> = {
      id: formData.get('id') as string,
    };

    // Only include fields that were submitted in the form
    const optionalFields = [
      'subject_first_name',
      'subject_last_name',
      'subject_email',
      'subject_phone',
      'gender',
      'date_of_birth',
      'photo_url',
      'height',
      'occupation',
      'education',
      'ethnicity',
      'family_background',
      'hashkafa',
      'additional_info',
    ] as const;

    for (const field of optionalFields) {
      const value = formData.get(field);
      if (value !== null) {
        rawData[field] = value as string;
      }
    }

    const parsed = updateProfileSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'errors.invalidData' };
    }

    const { id, ...data } = parsed.data;

    // Verify ownership
    const existing = await prisma.profileCard.findUnique({
      where: { id },
      select: { creator_id: true },
    });

    if (!existing) {
      return { success: false, error: 'actions.cardNotFound' };
    }

    if (existing.creator_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToUpdate' };
    }

    // Build update data, converting empty strings to null for optional fields
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'gender' || key === 'date_of_birth' || key === 'subject_first_name' || key === 'subject_last_name') {
        updateData[key] = value;
      } else {
        updateData[key] = value || null;
      }
    }

    const profile = await prisma.profileCard.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: profile };
  } catch (error) {
    console.error('updateProfile error:', error);
    return { success: false, error: 'actions.cardUpdateError' };
  }
}

// ─── Delete Profile (Soft Delete) ───────────────────────────────────────────

export async function deleteProfile(
  id: string
): Promise<ActionResponse<null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToDeleteCard' };
    }

    // Verify ownership
    const existing = await prisma.profileCard.findUnique({
      where: { id },
      select: { creator_id: true },
    });

    if (!existing) {
      return { success: false, error: 'actions.cardNotFound' };
    }

    if (existing.creator_id !== user.id) {
      return { success: false, error: 'actions.noPermissionToDelete' };
    }

    // Soft delete: set is_active to false
    await prisma.profileCard.update({
      where: { id },
      data: { is_active: false },
    });

    return { success: true, data: null };
  } catch (error) {
    console.error('deleteProfile error:', error);
    return { success: false, error: 'actions.cardDeleteError' };
  }
}

// ─── Get My Profiles ────────────────────────────────────────────────────────

export async function getMyProfiles(): Promise<
  ActionResponse<ProfileWithCreator[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewCards' };
    }

    const profiles = await prisma.profileCard.findMany({
      where: {
        creator_id: user.id,
        is_active: true,
      },
      include: profileWithCreatorInclude,
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: profiles };
  } catch (error) {
    console.error('getMyProfiles error:', error);
    return { success: false, error: 'actions.cardLoadError' };
  }
}

// ─── Get My Profile IDs ─────────────────────────────────────────────────

export async function getMyProfileIds(): Promise<
  ActionResponse<string[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewCards' };
    }

    const profiles = await prisma.profileCard.findMany({
      where: {
        creator_id: user.id,
        is_active: true,
      },
      select: { id: true },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: profiles.map((p) => p.id) };
  } catch (error) {
    console.error('getMyProfileIds error:', error);
    return { success: false, error: 'actions.cardIdLoadError' };
  }
}

// ─── Get Profile By ID ──────────────────────────────────────────────────────

export async function getProfileById(
  id: string
): Promise<ActionResponse<ProfileWithCreator>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'actions.loginToViewCard' };
    }

    const profile = await prisma.profileCard.findUnique({
      where: { id },
      include: profileWithCreatorInclude,
    });

    if (!profile) {
      return { success: false, error: 'actions.cardNotFound' };
    }

    // If the requester is the profile owner, return full data
    if (profile.creator_id === user.id) {
      return { success: true, data: profile };
    }

    // For non-owners, only return the profile if the requester shares an event with this profile
    // (both have profiles opted into the same event)
    const sharedEvent = await prisma.event.findFirst({
      where: {
        is_active: true,
        AND: [
          {
            participations: {
              some: { profile_id: id },
            },
          },
          {
            OR: [
              // Requester has a profile in the same event
              {
                participations: {
                  some: {
                    profile: { creator_id: user.id },
                  },
                },
              },
              // Requester is the event organizer
              { organizer_id: user.id },
              // Requester is the event matchmaker
              { matchmaker_id: user.id },
            ],
          },
        ],
      },
      select: { id: true },
    });

    if (!sharedEvent) {
      return { success: false, error: 'actions.noPermissionToView' };
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error('getProfileById error:', error);
    return { success: false, error: 'actions.cardSingleLoadError' };
  }
}
