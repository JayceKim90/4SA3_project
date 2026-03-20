import { type NextRequest, NextResponse } from "next/server";
import { getParticipantRepository } from "@/lib/repository/participant-repository";

function resolveHobbyId(body: Record<string, unknown>): string | undefined {
  const hid =
    body.hobbyId ?? body.groupId ?? body.sessionId;
  return typeof hid === "string" ? hid : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const hobbyId = resolveHobbyId(body);
    const userId = body.userId as string | undefined;
    const contactEmail = (body.contactEmail as string | undefined)?.trim();
    const contactPhone = (body.contactPhone as string | undefined)?.trim();

    if (!hobbyId || !userId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: hobbyId (or legacy groupId/sessionId), userId",
        },
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

    const existing = await participantRepo.findByHobbyId(hobbyId);
    const alreadyRequested = existing.some(
      (p) => String(p.userId) === String(userId)
    );

    if (alreadyRequested) {
      return NextResponse.json(
        { error: "Already requested to join this meetup" },
        { status: 400 }
      );
    }

    const participant = await participantRepo.create({
      hobbyId,
      userId,
      contactEmail,
      contactPhone,
      status: "pending",
      requestedAt: new Date(),
    });

    const json = {
      ...participant,
      sessionId: participant.hobbyId,
      groupId: participant.hobbyId,
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
    const hobbyId = resolveHobbyId(body);
    const userId = body.userId as string | undefined;

    if (!hobbyId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const participantRepo = getParticipantRepository();
    const existing = await participantRepo.findByHobbyId(hobbyId);
    const participant = existing.find(
      (p) => String(p.userId) === String(userId)
    );

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
