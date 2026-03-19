import { type NextRequest, NextResponse } from "next/server";
import type { GroupFilters } from "@/lib/types";
import type { RankingType } from "@/lib/ranking/ranking-factory";
import { cookies } from "next/headers";
import { executeGroupSearch } from "@/lib/mediator/search-mediator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters: GroupFilters = body.filters || body;
    const rankingType: RankingType = body.rankingType || "relevance";

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    const groups = await executeGroupSearch(filters, rankingType, userId);

    return NextResponse.json(groups);
  } catch (error) {
    console.error("[HobbyHop] Error searching groups:", error);
    return NextResponse.json(
      { error: "Failed to search groups" },
      { status: 500 }
    );
  }
}
