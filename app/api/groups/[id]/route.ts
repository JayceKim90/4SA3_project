import { type NextRequest, NextResponse } from "next/server";
import { getGroupRepository } from "@/lib/repository/group-repository";
import { getParticipantRepository } from "@/lib/repository/participant-repository";
import { cookies } from "next/headers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const groupRepo = getGroupRepository();
    const group = await groupRepo.findById(id);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const participantRepo = getParticipantRepository();
    const participants = await participantRepo.findByGroupId(id);

    return NextResponse.json({ ...group, participants });
  } catch (error) {
    console.error("[HobbyHop] Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
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

    const groupRepo = getGroupRepository();
    const group = await groupRepo.findById(id);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.hostId !== userId) {
      return NextResponse.json(
        { error: "Only the host can delete this group" },
        { status: 403 }
      );
    }

    const participantRepo = getParticipantRepository();
    const participants = await participantRepo.findByGroupId(id);
    for (const participant of participants) {
      await participantRepo.delete(participant.id);
    }

    await groupRepo.delete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[HobbyHop] Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
