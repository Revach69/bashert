import type {
  User,
  ProfileCard,
  Event,
  EventParticipation,
  InterestRequest,
} from '@prisma/client';

// ─── Extended types with relations ─────────────────────────────────────────────

export type ProfileWithCreator = ProfileCard & {
  creator: Pick<User, 'id' | 'full_name' | 'email' | 'phone'>;
};

export type EventWithDetails = Event & {
  organizer: Pick<User, 'id' | 'full_name'>;
  matchmaker: Pick<User, 'id' | 'full_name'> | null;
  _count: {
    participations: number;
    interest_requests: number;
  };
};

export type InterestRequestWithProfiles = InterestRequest & {
  requesting_profile: ProfileWithCreator;
  target_profile: ProfileWithCreator;
  requester: Pick<User, 'id' | 'full_name' | 'email' | 'phone'>;
};

// ─── Browsing types ────────────────────────────────────────────────────────────

export type EventBrowseProfile = Pick<
  ProfileCard,
  | 'id'
  | 'subject_first_name'
  | 'subject_last_name'
  | 'gender'
  | 'date_of_birth'
  | 'photo_url'
  | 'height'
  | 'occupation'
  | 'education'
  | 'ethnicity'
  | 'hashkafa'
>;

// ─── Server Action response type ───────────────────────────────────────────────

export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Filter types for browsing ─────────────────────────────────────────────────

export type ProfileFilters = {
  gender?: 'male' | 'female';
  min_age?: number;
  max_age?: number;
  hashkafa?: string;
  ethnicity?: string;
  education?: string;
};

// ─── Role type ─────────────────────────────────────────────────────────────────

export type UserRole = 'creator' | 'matchmaker' | 'organizer';
