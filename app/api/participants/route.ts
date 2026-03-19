import { type NextRequest, NextResponse } from "next/server";
import { getParticipantRepository } from "@/lib/repository/participant-repository";

function resolveGroupId(body: Record<string, unknown>): string | undefined {
  const gid = body.groupId ?? body.sessionId;
  return typeof gid === "string" ? gid : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const groupId = resolveGroupId(body);
    const userId = body.userId as string | undefined;
    const contactEmail = (body.contactEmail as string | undefined)?.trim();
    const contactPhone = (body.contactPhone as string | undefined)?.trim();

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: groupId (or sessionId), userId" },
        { status: 400 }
      );
    }

    if (!contactEmail || !contactPhone) {
      return NextResponse.json(
        { error: "contactEmail and contactPhone are required" },
        { status: 400 }
      );
    }

    const participantRepo = getParticipantRepository();

    const existing = await participantRepo.findByGroupId(groupId);
    const alreadyRequested = existing.some((p) => p.userId === userId);

    if (alreadyRequested) {
      return NextResponse.json(
        { error: "Already requested to join this group" },
        { status: 400 }
      );
    }

    const participant = await participantRepo.create({
      groupId,
      userId,
      contactEmail,
      contactPhone,
      status: "pending",
      requestedAt: new Date(),
    });

    const json = {
      ...participant,
      sessionId: participant.groupId,
    };

    return NextResponse.json(json, { status: 201 });
  } catch (error) {
    console.error("[HobbyHop] Error creating participant request:", error);
    return NextResponse.json(
      { error: "Failed to create join request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const groupId = resolveGroupId(body);
    const userId = body.userId as string | undefined;

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const participantRepo = getParticipantRepository();
    const existing = await participantRepo.findByGroupId(groupId);
    const participant = existing.find((p) => p.userId === userId);

    if (!participant) {
      return NextResponse.json(
        { error: "Participant record not found" },
        { status: 404 }
      );
    }

    await participantRepo.delete(participant.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[HobbyHop] Error deleting participant request:", error);
    return NextResponse.json(
      { error: "Failed to delete join request" },
      { status: 500 }
    );
  }
}
