import { type NextRequest, NextResponse } from "next/server";
import { getGroupRepository } from "@/lib/repository/group-repository";
import { getParticipantRepository } from "@/lib/repository/participant-repository";
import { getSessionMediator } from "@/lib/mediator/session-mediator";
import { buildGroupForCreate } from "@/lib/factories/group-factory";
export async function GET(request: NextRequest) {
  try {
    const groupRepo = getGroupRepository();
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");

    const groups = hostId
      ? await groupRepo.findByHostId(hostId)
      : await groupRepo.findUpcoming();

    const participantRepo = getParticipantRepository();
    const groupsWithParticipants = await Promise.all(
      groups.map(async (g) => {
        const participants = await participantRepo.findByGroupId(g.id);
        return { ...g, participants };
      })
    );

    return NextResponse.json(groupsWithParticipants);
  } catch (error) {
    console.error("[HobbyHop] Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hostId,
      title,
      subject,
      category,
      tags,
      date,
      startTime,
      endTime,
      capacity,
      address,
      description,
    } = body;

    if (
      !hostId ||
      !(title || subject) ||
      !date ||
      !startTime ||
      !endTime ||
      !capacity ||
      !address
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: hostId, title or subject, date, startTime, endTime, capacity, address",
        },
        { status: 400 }
      );
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(hostId)) {
      return NextResponse.json(
        { error: "Invalid hostId format. Must be a valid UUID." },
        { status: 400 }
      );
    }

    if (typeof capacity !== "number" || capacity <= 0) {
      return NextResponse.json(
        { error: "Capacity must be a positive number" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";
    const geocodeResponse = await fetch(
      `${baseUrl}/api/geocode?address=${encodeURIComponent(address)}`
    );

    if (!geocodeResponse.ok) {
      return NextResponse.json(
        { error: "Failed to geocode address" },
        { status: 500 }
      );
    }

    const geocodeData = await geocodeResponse.json();

    if (!geocodeData.found) {
      return NextResponse.json(
        { error: "Address not found. Please provide a valid address." },
        { status: 400 }
      );
    }

    const location = {
      address: geocodeData.formattedAddress,
      latitude: geocodeData.lat,
      longitude: geocodeData.lng,
      placeId: geocodeData.placeId,
    };

    const draft = buildGroupForCreate({
      hostId,
      title,
      subject,
      category,
      tags,
      date: new Date(date),
      startTime,
      endTime,
      capacity,
      location,
      description,
    });

    const groupRepo = getGroupRepository();
    const group = await groupRepo.create(draft);

    const mediator = getSessionMediator();
    mediator.notifySessionCreated(group.id);

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("[HobbyHop] Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
