import { type NextRequest, NextResponse } from "next/server";
import { getHobbyRepository } from "@/lib/repository/group-repository";
import { buildHobbyForCreate } from "@/lib/factories/group-factory";

const TITLES = [
  "Weekend nature photography walk",
  "Acoustic guitar circle",
  "Board game night",
  "Beginner Python hobby coding circle",
  "Community yoga in the park",
  "Watercolor sketching meetup",
  "Running crew — easy pace",
  "English conversation club",
];

const TAGS = [
  "social",
  "outdoor",
  "creative",
  "learning",
  "fitness",
  "games",
  "music",
  "beginners-welcome",
];

const CATEGORIES = ["sports", "music", "education", "general"] as const;

const LOCATIONS = [
  {
    name: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    addresses: [
      "Toronto Reference Library",
      "Robarts Library",
      "Gerstein Science Information Centre",
      "Toronto Public Library - Fort York",
    ],
  },
  {
    name: "Mississauga",
    lat: 43.589,
    lng: -79.6441,
    addresses: [
      "Mississauga Central Library",
      "UTM Library",
      "Port Credit Library",
      "Sheridan College Hazel McCallion Campus",
    ],
  },
];

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("count") || "10", 10);

    const hostId =
      searchParams.get("hostId") ||
      "1ee0edfe-ddc6-4aef-aa3e-3c5e0cd2088e";

    const hobbyRepo = getHobbyRepository();
    const created = [];

    for (let i = 0; i < count; i++) {
      const locationBase = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const latVariation = (Math.random() - 0.5) * 0.02;
      const lngVariation = (Math.random() - 0.5) * 0.02;

      const address =
        locationBase.addresses[
          Math.floor(Math.random() * locationBase.addresses.length)
        ];

      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));

      const startHour = 8 + Math.floor(Math.random() * 12);
      const startTime = `${startHour.toString().padStart(2, "0")}:00`;
      const endTime = `${(startHour + 2).toString().padStart(2, "0")}:00`;

      const title = TITLES[Math.floor(Math.random() * TITLES.length)];
      const category =
        CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const numTags = 1 + Math.floor(Math.random() * 3);
      const selectedTags: string[] = [];
      for (let j = 0; j < numTags; j++) {
        selectedTags.push(TAGS[Math.floor(Math.random() * TAGS.length)]);
      }

      const draft = buildHobbyForCreate({
        hostId,
        title,
        category,
        tags: [...new Set(selectedTags)],
        date,
        startTime,
        endTime,
        capacity: 2 + Math.floor(Math.random() * 8),
        location: {
          address,
          latitude: locationBase.lat + latVariation,
          longitude: locationBase.lng + lngVariation,
        },
        description: `HobbyHop seed meetup — ${title}. Open to new members.`,
      });

      const hobby = await hobbyRepo.create(draft);
      created.push(hobby);
    }

    return NextResponse.json({
      message: `Successfully created ${created.length} hobby meetups`,
      sessions: created,
      hobbies: created,
      groups: created,
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}
