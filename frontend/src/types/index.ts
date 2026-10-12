/**
 * Shared domain types for the EventFlow frontend.
 *
 * These mirror the shape the AWS-backed API (EC2 + RDS PostgreSQL + S3) is
 * expected to return in a later milestone. Everything here is plain
 * serialisable data so it can travel between server and client components.
 */

export type UserRole = "student" | "organizer";

export type EventStatus = "draft" | "published" | "completed" | "cancelled";

export type RegistrationStatus =
  | "confirmed"
  | "waitlisted"
  | "pending"
  | "cancelled"
  | "attended";

export const EVENT_CATEGORIES = [
  "Technology",
  "Workshops",
  "Arts & Culture",
  "Sports",
  "Career",
  "Music",
  "Academic",
  "Social",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** Illustration keys used by <EventPoster /> until real posters live on S3. */
export type PosterArt =
  | "tech"
  | "design"
  | "culture"
  | "sports"
  | "career"
  | "robotics"
  | "music"
  | "startup"
  | "film"
  | "photo"
  | "debate"
  | "wellness";

export interface CampusUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Programme or job title, e.g. "B.Tech Computer Science" or "Events Coordinator". */
  programme: string;
  year?: string;
  studentId?: string;
  phone?: string;
  avatarTone: AvatarTone;
}

export type AvatarTone = "brand" | "berry" | "mint" | "plum" | "sky" | "clay";

export interface CampusEvent {
  id: string;
  title: string;
  /** One-line teaser shown on cards. */
  summary: string;
  /** Full description, split into readable paragraphs. */
  description: string[];
  category: EventCategory;
  status: EventStatus;
  /** ISO date-time strings (local campus time). */
  startsAt: string;
  endsAt: string;
  registrationClosesAt: string;
  venue: string;
  building?: string;
  isOnline: boolean;
  capacity: number;
  registered: number;
  waitlisted: number;
  /** 0 means the event is free. */
  priceUsd: number;
  organizerId: string;
  tags: string[];
  featured: boolean;
  /** Set once real poster files exist in S3. */
  posterUrl?: string;
  posterArt: PosterArt;
  createdAt: string;
  highlights: string[];
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programme: string;
  year?: string;
  status: RegistrationStatus;
  registeredAt: string;
  ticketCode: string;
  checkedInAt?: string;
}

export interface OrganizerSummary {
  totalEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  draftEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  waitlisted: number;
  averageFillRate: number;
  checkedInRate: number;
}

export interface DashboardActivity {
  id: string;
  label: string;
  detail: string;
  at: string;
  tone: AvatarTone | "leaf" | "brand";
}
