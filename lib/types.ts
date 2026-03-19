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

/** 취미 모임 (마일스톤 Groups 컬렉션) */
export interface Group {
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
  participants?: GroupParticipant[];
}

export interface GroupParticipant {
  id: string;
  groupId: string;
  userId: string;
  user?: User;
  contactEmail?: string;
  contactPhone?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  respondedAt?: Date;
}

export interface GroupFilters {
  subject?: string;
  category?: string;
  tags?: string[];
  date?: Date;
  maxDistance?: number;
  userLocation?: { latitude: number; longitude: number };
}

export interface GroupSearchResult extends Group {
  distance?: number;
  relevanceScore?: number;
  participationStatus?: "pending" | "approved" | "rejected" | null;
}

/** 레거시 명명 — 동일 타입 */
export type StudySession = Group;
export type SessionParticipant = GroupParticipant;
export type SessionFilters = GroupFilters;
export type SessionSearchResult = GroupSearchResult;

export function groupTitle(g: Pick<Group, "title"> & { subject?: string }): string {
  if ("title" in g && g.title) return g.title;
  const s = g as { subject?: string };
  return s.subject ?? "";
}
