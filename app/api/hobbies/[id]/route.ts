import { type NextRequest, NextResponse } from "next/server";
import { getHobbyRepository } from "@/lib/repository/group-repository";
import { getParticipantRepository } from "@/lib/repository/participant-repository";
import { cookies } from "next/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hobbyRepo = getHobbyRepository();
    const hobby = await hobbyRepo.findById(id);

    if (!hobby) {
      return NextResponse.json({ error: "Hobby meetup not found" }, { status: 404 });
    }

    const participantRepo = getParticipantRepository();
    const participants = await participantRepo.findByHobbyId(id);

    return NextResponse.json({ ...hobby, participants });
  } catch (error) {
    console.error("[HobbyHop] Error fetching hobby:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobby meetup" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hobbyRepo = getHobbyRepository();
    const hobby = await hobbyRepo.findById(id);

    if (!hobby) {
      return NextResponse.json({ error: "Hobby meetup not found" }, { status: 404 });
    }

    if (hobby.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the host can delete this meetup" },
        { status: 403 }
      );
    }

    const participantRepo = getParticipantRepository();
    const participants = await participantRepo.findByHobbyId(id);
    for (const participant of participants) {
      await participantRepo.delete(participant.id);
    }

    await hobbyRepo.delete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[HobbyHop] Error deleting hobby:", error);
    return NextResponse.json(
      { error: "Failed to delete hobby meetup" },
      { status: 500 }
    );
  }
}
