import { type NextRequest, NextResponse } from "next/server";
import type { HobbyFilters } from "@/lib/types";
import type { RankingType } from "@/lib/ranking/ranking-factory";
import { cookies } from "next/headers";
import { executeHobbySearch } from "@/lib/mediator/search-mediator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters: HobbyFilters = body.filters || body;
    const rankingType: RankingType = body.rankingType || "relevance";

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    const hobbies = await executeHobbySearch(filters, rankingType, userId);

    return NextResponse.json(hobbies);
  } catch (error) {
    console.error("[HobbyHop] Error searching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to search hobbies" },
      { status: 500 }
    );
  }
}
