import { NextRequest, NextResponse } from "next/server";

const BASE = "https://maps.googleapis.com/maps/api/geocode/json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "missing address" }, { status: 400 });
  }

  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!key) {
    return NextResponse.json(
      {
        error: "missing api key",
        message:
          "Please set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables",
      },
      { status: 500 }
    );
  }

  const url = `${BASE}?address=${encodeURIComponent(address)}&key=${key}`;

  const res = await fetch(url, { cache: "no-store" });

  const data = await res.json();

  if (
    data.status !== "OK" ||
    !Array.isArray(data.results) ||
    data.results.length === 0
  ) {
    return NextResponse.json(
      { found: false, status: data.status ?? "ZERO_RESULTS" },
      { status: 200 }
    );
  }

  const r = data.results[0];

  const lat = r.geometry.location.lat as number;
  const lng = r.geometry.location.lng as number;
  const formattedAddress = r.formatted_address as string;
  const placeId = r.place_id as string;

  return NextResponse.json({
    found: true,
    lat,
    lng,
    formattedAddress,
    placeId,
  });
}
