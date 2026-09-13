import { NextRequest, NextResponse } from "next/server";
import { fetchLiveWeather, assessSprayDriftRisk } from "@/lib/weather/weatherService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    if (!latStr || !lonStr) {
      return NextResponse.json(
        { error: "Latitude and Longitude are required query parameters." },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: "Invalid numeric coordinates provided." },
        { status: 400 }
      );
    }

    const telemetry = await fetchLiveWeather(lat, lon);
    const driftRisk = assessSprayDriftRisk(telemetry as any);

    return NextResponse.json({
      success: true,
      telemetry,
      driftRisk,
      source: telemetry.source,
    });
  } catch (error: any) {
    console.error("API Weather Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch weather telemetry" },
      { status: 500 }
    );
  }
}
