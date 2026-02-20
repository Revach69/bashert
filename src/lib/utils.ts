import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Age calculation ───────────────────────────────────────────────────────────

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}

// ─── Generate unique join code ─────────────────────────────────────────────────
// 6 alphanumeric characters, uppercase, no ambiguous chars (I, O, 0, 1)

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ─── Check if event is within access window ────────────────────────────────────

export function isEventAccessible(event: {
  start_time: Date;
  end_time: Date;
  pre_access_hours: number;
  post_access_hours: number;
}): boolean {
  const now = new Date();
  const accessStart = new Date(
    event.start_time.getTime() - event.pre_access_hours * 60 * 60 * 1000
  );
  const accessEnd = new Date(
    event.end_time.getTime() + event.post_access_hours * 60 * 60 * 1000
  );
  return now >= accessStart && now <= accessEnd;
}

// ─── Check if new requests can be submitted (before end_time + post_access) ───

export function canSubmitRequests(event: {
  end_time: Date;
  post_access_hours: number;
}): boolean {
  const now = new Date();
  const deadline = new Date(
    event.end_time.getTime() + event.post_access_hours * 60 * 60 * 1000
  );
  return now <= deadline;
}

// ─── Format Hebrew date display ────────────────────────────────────────────────

export function formatHebrewDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// ─── Format time display ───────────────────────────────────────────────────────

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
