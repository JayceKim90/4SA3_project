import { type NextRequest, NextResponse } from "next/server";
import { getHobbyRepository } from "@/lib/repository/group-repository";
import { getParticipantRepository } from "@/lib/repository/participant-repository";
import { getSessionMediator } from "@/lib/mediator/session-mediator";
import { buildHobbyForCreate } from "@/lib/factories/group-factory";
export async function GET(request: NextRequest) {
  try {
    const hobbyRepo = getHobbyRepository();
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get("hostId");

    const hobbies = hostId
      ? await hobbyRepo.findByHostId(hostId)
      : await hobbyRepo.findUpcoming();

    const participantRepo = getParticipantRepository();
    const hobbiesWithParticipants = await Promise.all(
      hobbies.map(async (h) => {
        const participants = await participantRepo.findByHobbyId(h.id);
        return { ...h, participants };
      })
    );

    return NextResponse.json(hobbiesWithParticipants);
  } catch (error) {
    console.error("[HobbyHop] Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
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

    const draft = buildHobbyForCreate({
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

    const hobbyRepo = getHobbyRepository();
    const hobby = await hobbyRepo.create(draft);

    const mediator = getSessionMediator();
    mediator.notifySessionCreated(hobby.id);

    return NextResponse.json(hobby, { status: 201 });
  } catch (error) {
    console.error("[HobbyHop] Error creating hobby:", error);
    return NextResponse.json(
      { error: "Failed to create hobby meetup" },
      { status: 500 }
    );
  }
}
