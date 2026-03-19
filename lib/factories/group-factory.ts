import type { Group, Location } from "@/lib/types";

export type HobbyCategory = "sports" | "music" | "education" | "general";

const CATEGORY_DEFAULTS: Record<
  HobbyCategory,
  { suggestedTags: string[]; descriptionBlurb: string; defaultTitle: string }
> = {
  sports: {
    suggestedTags: ["outdoor", "fitness", "team"],
    descriptionBlurb: "Active group meetup — bring gear and good energy.",
    defaultTitle: "Sports & outdoor hobby meetup",
  },
  music: {
    suggestedTags: ["jam", "acoustic", "practice"],
    descriptionBlurb: "Music lovers gathering — share skills and play together.",
    defaultTitle: "Music & arts jam session",
  },
  education: {
    suggestedTags: ["workshop", "skills", "learning"],
    descriptionBlurb: "Learn and teach — casual skill-share with peers.",
    defaultTitle: "Education & skills workshop",
  },
  general: {
    suggestedTags: ["social", "local", "meetup"],
    descriptionBlurb: "Local hobbyists meeting up — all welcome.",
    defaultTitle: "Local hobby meetup",
  },
};

function normalizeCategory(raw?: string): HobbyCategory {
  const c = (raw || "general").toLowerCase();
  if (c === "sports" || c === "music" || c === "education" || c === "general") {
    return c;
  }
  return "general";
}

export type CreateGroupInput = {
  hostId: string;
  title?: string;
  subject?: string;
  category?: string;
  tags?: string[];
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  location: Location;
  description?: string;
};

/**
 * Factory: 카테고리별 기본 설명·태그를 채운 그룹 생성 페이로드 (Controller는 분기 없이 이 함수만 호출)
 */
export function buildGroupForCreate(input: CreateGroupInput): Omit<
  Group,
  "id" | "createdAt" | "updatedAt"
> {
  const cat = normalizeCategory(input.category);
  const d = CATEGORY_DEFAULTS[cat];
  const rawTitle = (input.title || input.subject || "").trim();
  const title = rawTitle || d.defaultTitle;
  const tags =
    input.tags && input.tags.length > 0 ? input.tags : [...d.suggestedTags];
  const description =
    (input.description || "").trim() || d.descriptionBlurb;

  return {
    hostId: input.hostId,
    title,
    category: cat,
    tags,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    capacity: input.capacity,
    location: input.location,
    description,
  };
}
