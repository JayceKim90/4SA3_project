import { type NextRequest, NextResponse } from "next/server";
import { getParticipantRepository } from "@/lib/repository/participant-repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const participantRepo = getParticipantRepository();
    const participants = await participantRepo.findByGroupId(id);

    return NextResponse.json(participants);
  } catch (error) {
    console.error("[HobbyHop] Error fetching participants:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
