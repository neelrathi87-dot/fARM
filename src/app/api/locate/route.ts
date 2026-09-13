import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "";

    const isLocalOrPrivate =
      !clientIp ||
      clientIp === "127.0.0.1" ||
      clientIp === "::1" ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("172.16.");

    // Provider 1: ipwho.is
    try {
      const url = isLocalOrPrivate ? "https://ipwho.is/" : `https://ipwho.is/${clientIp}`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success !== false && data.latitude && data.longitude) {
          return NextResponse.json({
            success: true,
            lat: Number(data.latitude),
            lon: Number(data.longitude),
            city: data.city || "Detected City",
            region: data.region || "",
            country: data.country || "India",
            postal: data.postal || "",
            source: "ipwho.is",
          });
        }
      }
    } catch (e1) {
      console.warn("ipwho.is lookup failed:", e1);
    }

    // Provider 2: ip-api.com
    try {
      const url = isLocalOrPrivate ? "http://ip-api.com/json/" : `http://ip-api.com/json/${clientIp}`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === "success" && data.lat && data.lon) {
          return NextResponse.json({
            success: true,
            lat: Number(data.lat),
            lon: Number(data.lon),
            city: data.city || "Detected City",
            region: data.regionName || data.region || "",
            country: data.country || "India",
            postal: data.zip || "",
            source: "ip-api.com",
          });
        }
      }
    } catch (e2) {
      console.warn("ip-api.com lookup failed:", e2);
    }

    // Fallback if both IP services fail
    return NextResponse.json({
      success: true,
      lat: 18.5204,
      lon: 73.8567,
      city: "Pune",
      region: "Maharashtra",
      country: "India",
      source: "fallback",
    });
  } catch (error: any) {
    console.error("Locate API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to detect location",
        lat: 18.5204,
        lon: 73.8567,
        city: "Pune",
        region: "Maharashtra",
        country: "India",
      },
      { status: 200 }
    );
  }
}
