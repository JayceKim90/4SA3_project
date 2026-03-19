export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

/** 취미 모임 — MongoDB `hobbies` 컬렉션 */
export interface Hobby {
  id: string;
  hostId: string;
  host?: User;
  title: string;
  category: string;
  tags: string[];
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  location: Location;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  participants?: HobbyParticipant[];
}

export interface HobbyParticipant {
  id: string;
  hobbyId: string;
  userId: string;
  user?: User;
  contactEmail?: string;
  contactPhone?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  respondedAt?: Date;
}

export interface HobbyFilters {
  subject?: string;
  category?: string;
  tags?: string[];
  date?: Date;
  maxDistance?: number;
  userLocation?: { latitude: number; longitude: number };
}

export interface HobbySearchResult extends Hobby {
  distance?: number;
  relevanceScore?: number;
  participationStatus?: "pending" | "approved" | "rejected" | null;
}

export function hobbyTitle(
  h: Pick<Hobby, "title"> & { subject?: string }
): string {
  if ("title" in h && h.title) return h.title;
  const s = h as { subject?: string };
  return s.subject ?? "";
}

/** 레거시 별칭 — 동일 타입 */
export type Group = Hobby;
export type GroupParticipant = HobbyParticipant;
export type GroupFilters = HobbyFilters;
export type GroupSearchResult = HobbySearchResult;

export const groupTitle = hobbyTitle;

export type StudySession = Hobby;
export type SessionParticipant = HobbyParticipant;
export type SessionFilters = HobbyFilters;
export type SessionSearchResult = HobbySearchResult;
