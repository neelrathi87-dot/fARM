import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface GeocodeResult {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  source?: "google" | "openweather" | "nominatim" | "preset";
}

// Robust coordinate parser: supports "18.52, 73.85", "18.52 73.85", "18.52N, 73.85E", etc.
function tryParseCoords(input: string): [number, number] | null {
  const trimmed = input.trim();
  const regex = /^([-+]?\d{1,2}(?:\.\d+)?)\s*[°\s]*([NSns])?[,\s;/|]+\s*([-+]?\d{1,3}(?:\.\d+)?)\s*[°\s]*([EWew])?$/;
  const match = trimmed.match(regex);
  if (match) {
    let lat = parseFloat(match[1]);
    const latDir = match[2]?.toUpperCase();
    let lon = parseFloat(match[3]);
    const lonDir = match[4]?.toUpperCase();
    if (latDir === "S" && lat > 0) lat = -lat;
    if (lonDir === "W" && lon > 0) lon = -lon;
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return [lat, lon];
    }
  }

  const parts = trimmed.split(/[\s,;/|]+/).map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    if (parts[0] >= -90 && parts[0] <= 90 && parts[1] >= -180 && parts[1] <= 180) {
      return [parts[0], parts[1]];
    }
  }

  return null;
}

// Offline fallback for key Indian agricultural centers in case external APIs are unreachable or throttled
const AGRI_LOCATIONS_FALLBACK: Record<string, { lat: number; lon: number; name: string; state: string }> = {
  pune: { lat: 18.5204, lon: 73.8567, name: "Pune", state: "Maharashtra" },
  baramati: { lat: 18.1517, lon: 74.5772, name: "Baramati", state: "Maharashtra" },
  indapur: { lat: 18.1167, lon: 75.0333, name: "Indapur", state: "Maharashtra" },
  daund: { lat: 18.4667, lon: 74.5833, name: "Daund", state: "Maharashtra" },
  shirur: { lat: 18.8265, lon: 74.3789, name: "Shirur", state: "Maharashtra" },
  saswad: { lat: 18.3444, lon: 74.0306, name: "Saswad", state: "Maharashtra" },
  narayangaon: { lat: 19.1167, lon: 73.9833, name: "Narayangaon", state: "Maharashtra" },
  junnar: { lat: 19.2083, lon: 73.875, name: "Junnar", state: "Maharashtra" },
  manchar: { lat: 18.9958, lon: 73.9431, name: "Manchar", state: "Maharashtra" },
  khed: { lat: 18.8472, lon: 73.9083, name: "Khed (Rajgurunagar)", state: "Maharashtra" },
  nashik: { lat: 19.9975, lon: 73.7898, name: "Nashik", state: "Maharashtra" },
  niphad: { lat: 20.0769, lon: 74.1083, name: "Niphad", state: "Maharashtra" },
  dindori: { lat: 20.2008, lon: 73.8344, name: "Dindori", state: "Maharashtra" },
  sangli: { lat: 16.8524, lon: 74.5815, name: "Sangli", state: "Maharashtra" },
  tasgaon: { lat: 17.0347, lon: 74.6033, name: "Tasgaon", state: "Maharashtra" },
  satara: { lat: 17.6805, lon: 73.9925, name: "Satara", state: "Maharashtra" },
  phaltan: { lat: 17.9833, lon: 74.4333, name: "Phaltan", state: "Maharashtra" },
  solapur: { lat: 17.6599, lon: 75.9064, name: "Solapur", state: "Maharashtra" },
  pandharpur: { lat: 17.6775, lon: 75.3278, name: "Pandharpur", state: "Maharashtra" },
  kolhapur: { lat: 16.705, lon: 74.2433, name: "Kolhapur", state: "Maharashtra" },
  ahmednagar: { lat: 19.0952, lon: 74.7496, name: "Ahmednagar", state: "Maharashtra" },
  mumbai: { lat: 19.076, lon: 72.8777, name: "Mumbai", state: "Maharashtra" },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const trimmed = query.trim();

    // 1. Direct coordinate parsing check
    const coords = tryParseCoords(trimmed);
    if (coords) {
      const [lat, lon] = coords;
      const apiKey =
        process.env.OPENWEATHER_API_KEY ||
        process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
        "c03de4415c1a38120c63282ef4141104";

      try {
        const revUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        const revRes = await fetch(revUrl, { next: { revalidate: 3600 } });
        if (revRes.ok) {
          const revData = await revRes.json();
          if (Array.isArray(revData) && revData.length > 0) {
            const item = revData[0];
            const state = item.state ? `, ${item.state}` : "";
            const country = item.country ? `, ${item.country}` : "";
            return NextResponse.json({
              results: [
                {
                  id: `coord-${lat.toFixed(5)}-${lon.toFixed(5)}`,
                  name: item.name,
                  displayName: `${item.name}${state}${country} (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
                  lat,
                  lon,
                },
              ],
            });
          }
        }
      } catch (e) {
        console.warn("Reverse geocoding error:", e);
      }

      return NextResponse.json({
        results: [
          {
            id: `coord-${lat.toFixed(5)}-${lon.toFixed(5)}`,
            name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
            displayName: `GPS Pinpoint: ${lat.toFixed(5)}, ${lon.toFixed(5)}`,
            lat,
            lon,
          },
        ],
      });
    }

    const results: GeocodeResult[] = [];
    const apiKey =
      process.env.OPENWEATHER_API_KEY ||
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ||
      "c03de4415c1a38120c63282ef4141104";

    const addUniqueResult = (item: GeocodeResult) => {
      const isDuplicate = results.some(
        (r) =>
          (r.name.toLowerCase() === item.name.toLowerCase() &&
            Math.abs(r.lat - item.lat) < 0.25 &&
            Math.abs(r.lon - item.lon) < 0.25) ||
          (Math.abs(r.lat - item.lat) < 0.03 && Math.abs(r.lon - item.lon) < 0.03)
      );
      if (!isDuplicate) {
        results.push(item);
      }
    };

    // 2. Query Google Maps Places API (New) using NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const googleMapsKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      "AIzaSyAH26vVAd1y4-oSUZhk4exofmyN_Tdh4Pc";

    if (googleMapsKey) {
      try {
        const gRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": googleMapsKey,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
          },
          body: JSON.stringify({
            textQuery: trimmed,
            languageCode: "en",
          }),
          next: { revalidate: 3600 },
        });

        if (gRes.ok) {
          const gData = await gRes.json();
          if (Array.isArray(gData.places)) {
            for (const place of gData.places) {
              if (place.location?.latitude && place.location?.longitude) {
                const name = place.displayName?.text || trimmed;
                const formatted = place.formattedAddress || name;
                addUniqueResult({
                  id: `google-${place.id}`,
                  name,
                  displayName: formatted,
                  lat: place.location.latitude,
                  lon: place.location.longitude,
                  source: "google",
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("Google Places API search error:", err);
      }
    }

    // 3. If user typed a 6-digit Indian Postal PIN Code (e.g. 412306)
    if (/^\d{6}$/.test(trimmed)) {
      try {
        const pinUrl = `https://nominatim.openstreetmap.org/search?postalcode=${trimmed}&country=India&format=json&addressdetails=1`;
        const pinRes = await fetch(pinUrl, {
          headers: {
            "User-Agent": "FarmPulseOps/1.0 (contact@farmpulse.internal)",
            Accept: "application/json",
          },
          next: { revalidate: 86400 },
        });
        if (pinRes.ok) {
          const pinData = await pinRes.json();
          if (Array.isArray(pinData)) {
            for (const item of pinData) {
              addUniqueResult({
                id: `pin-${item.place_id}`,
                name: `PIN ${trimmed}`,
                displayName: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
              });
            }
          }
        }
      } catch (e) {
        console.warn("Postal code geocoding error:", e);
      }
    }

    // 3. Query OpenStreetMap Nominatim with India priority (highest detail for villages/talukas)
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        trimmed
      )}&countrycodes=in&limit=5&addressdetails=1`;
      const nomRes = await fetch(nomUrl, {
        headers: {
          "User-Agent": "FarmPulseOps/1.0 (contact@farmpulse.internal)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          for (const item of nomData) {
            const rawName = item.name || item.display_name.split(",")[0].trim();
            const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            addUniqueResult({
              id: `nom-${item.place_id}`,
              name: cleanName,
              displayName: item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            });
          }
        }
      }
    } catch (e) {
      console.warn("Nominatim geocoding error:", e);
    }

    // 4. Query OpenWeather Geocoding API
    try {
      const owUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        trimmed
      )},IN&limit=5&appid=${apiKey}`;
      const owRes = await fetch(owUrl, { next: { revalidate: 3600 } });
      if (owRes.ok) {
        const owData = await owRes.json();
        if (Array.isArray(owData)) {
          for (const item of owData) {
            const cleanName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
            const state = item.state ? `, ${item.state}` : "";
            const country = item.country ? `, ${item.country}` : "";
            const displayName = `${cleanName}${state}${country}`;
            addUniqueResult({
              id: `ow-${item.lat}-${item.lon}`,
              name: cleanName,
              displayName,
              lat: Number(item.lat),
              lon: Number(item.lon),
            });
          }
        }
      }
    } catch (e) {
      console.warn("OpenWeather geocoding error:", e);
    }

    // 5. Global fallback query on Nominatim if results are still empty
    if (results.length === 0) {
      try {
        const globalNomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&limit=5&addressdetails=1`;
        const nomRes = await fetch(globalNomUrl, {
          headers: {
            "User-Agent": "FarmPulseOps/1.0 (contact@farmpulse.internal)",
            Accept: "application/json",
          },
          next: { revalidate: 3600 },
        });
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (Array.isArray(nomData)) {
            for (const item of nomData) {
              const rawName = item.name || item.display_name.split(",")[0].trim();
              const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
              addUniqueResult({
                id: `nom-g-${item.place_id}`,
                name: cleanName,
                displayName: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
              });
            }
          }
        }
      } catch (e) {
        console.warn("Global Nominatim geocoding error:", e);
      }
    }

    // 6. Offline dictionary fallback for agricultural hubs in case of network throttle
    if (results.length === 0) {
      const lower = trimmed.toLowerCase();
      const matchKey = Object.keys(AGRI_LOCATIONS_FALLBACK).find((k) => lower.includes(k) || k.includes(lower));
      if (matchKey) {
        const loc = AGRI_LOCATIONS_FALLBACK[matchKey];
        results.push({
          id: `fallback-${matchKey}`,
          name: loc.name,
          displayName: `${loc.name}, ${loc.state}, India`,
          lat: loc.lat,
          lon: loc.lon,
        });
      }
    }

    return NextResponse.json({ results: results.slice(0, 6) });
  } catch (error: any) {
    console.error("Geocoding API error:", error);
    return NextResponse.json({ error: "Failed to search locations", results: [] }, { status: 500 });
  }
}

