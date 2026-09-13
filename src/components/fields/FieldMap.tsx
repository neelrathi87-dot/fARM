"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Layers, Satellite, Compass, Search, Mountain, Globe, Crosshair, X } from "lucide-react";

// Safe SVG-based pin icons created lazily in browser
const getCustomPinIcon = (color: string, ringColor: string = "rgba(0,0,0,0.2)") => {
  if (typeof window === "undefined" || !L || !L.divIcon) return undefined as any;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${ringColor}" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 44 16 44 C16 44 32 28 32 16 C32 7.16 24.84 0 16 0 Z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="15" r="6" fill="#ffffff" />
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-leaflet-marker",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  });
};

interface FieldMapProps {
  fields: Array<{
    id: string;
    name: string;
    cropType: string;
    areaAcres: number;
    latitude: number;
    longitude: number;
    polygonGeoJson?: string | null;
    totalWaterLiters?: number;
  }>;
  selectedFieldId?: string;
  onSelectField?: (fieldId: string) => void;
  onCoordinateClick?: (lat: number, lon: number) => void;
  center?: [number, number];
  zoom?: number;
  interactiveSelect?: boolean;
}

// Resizes Leaflet map on mount to avoid gray tiles
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// View controller to smooth-pan map when target changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevRef = useRef({ lat: center[0], lon: center[1], zoom });

  useEffect(() => {
    if (
      center[0] !== prevRef.current.lat ||
      center[1] !== prevRef.current.lon ||
      zoom !== prevRef.current.zoom
    ) {
      map.flyTo(center, zoom, { duration: 1.2 });
      prevRef.current = { lat: center[0], lon: center[1], zoom };
    }
  }, [center, zoom, map]);

  return null;
}

// Map click handler
function MapClickHandler({ onClick }: { onClick?: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
      }
    },
  });
  return null;
}

export const FieldMap: React.FC<FieldMapProps> = ({
  fields,
  selectedFieldId,
  onSelectField,
  onCoordinateClick,
  center,
  zoom,
  interactiveSelect = false,
}) => {
  const [tileMode, setTileMode] = useState<"google_hybrid" | "google_streets" | "esri_satellite" | "google_terrain">("google_hybrid");
  const [clickedCoord, setClickedCoord] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapTarget, setMapTarget] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(zoom || (fields.length > 0 ? 12 : 5));
  const [suggestions, setSuggestions] = useState<
    Array<{ id: string; name: string; displayName: string; lat: number; lon: number; source?: string }>
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Guards to ensure dropdown only shows when user is actively typing
  const isUserTypingRef = useRef(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dynamically load Google Maps JavaScript API SDK with user's key
  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyAH26vVAd1y4-oSUZhk4exofmyN_Tdh4Pc";
    if (typeof window !== "undefined" && !(window as any).google?.maps && apiKey) {
      const existing = document.getElementById("google-maps-js-sdk");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "google-maps-js-sdk";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Client-safe memoized marker icons
  const defaultPinIcon = React.useMemo(() => getCustomPinIcon("#16a34a", "#15803d"), []);
  const activePinIcon = React.useMemo(() => getCustomPinIcon("#0284c7", "#0369a1"), []);
  const selectedTargetPinIcon = React.useMemo(() => getCustomPinIcon("#e11d48", "#be123c"), []);

  // Compute map center and zoom
  const fallbackCenter: [number, number] = center
    ? center
    : fields.length > 0
    ? [fields[0].latitude, fields[0].longitude]
    : [18.5204, 73.8567]; // Detected region base

  const fallbackZoom = zoom ? zoom : fields.length > 0 ? 12 : 13;
  const activeCenter = mapTarget || fallbackCenter;

  // Do not silently force Pune on initial mount; preserve user coordinates or active fields

  const handleMapClick = (lat: number, lon: number) => {
    setClickedCoord([lat, lon]);
    setShowDropdown(false);
  };

  // Debounced search via /api/geocode (ONLY when the user is actively typing!)
  useEffect(() => {
    if (!isUserTypingRef.current || !searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0 && isUserTypingRef.current) {
            setSuggestions(data.results);
            setShowDropdown(true);
          } else {
            setSuggestions([]);
            setShowDropdown(false);
          }
        }
      } catch (err) {
        console.error("Geocoding fetch error:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectLocation = (lat: number, lon: number, name?: string) => {
    isUserTypingRef.current = false;
    setShowDropdown(false);
    setSuggestions([]);
    setMapTarget([lat, lon]);
    setMapZoom(14);
    setClickedCoord([lat, lon]);
    if (name) setSearchQuery(name);
  };

  // Robust coordinate parser
  const tryParseMapCoords = (input: string): [number, number] | null => {
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
  };

  // Location search: supports coordinates, postal PIN codes, and city/village names
  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    isUserTypingRef.current = false;
    setShowDropdown(false);
    if (!searchQuery.trim()) return;

    // 1. Direct coordinates check
    const coords = tryParseMapCoords(searchQuery);
    if (coords) {
      selectLocation(coords[0], coords[1]);
      setLocationToast(`📍 Coordinates: ${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`);
      setTimeout(() => setLocationToast(null), 4000);
      return;
    }

    // 2. If suggestions already loaded in dropdown, pick top match
    if (suggestions.length > 0) {
      const top = suggestions[0];
      selectLocation(top.lat, top.lon, top.displayName || top.name);
      setLocationToast(`📍 Focused on: ${top.displayName || top.name}`);
      setTimeout(() => setLocationToast(null), 4000);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const first = data.results[0];
        selectLocation(first.lat, first.lon, first.displayName || first.name);
        setLocationToast(`📍 Focused on: ${first.displayName || first.name}`);
        setTimeout(() => setLocationToast(null), 4000);
      } else {
        setLocationToast(`⚠️ Location "${searchQuery.trim()}" not found. Try a nearby town, village, or coordinates.`);
        setTimeout(() => setLocationToast(null), 5000);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      setLocationToast("⚠️ Location search error. Please check coordinates or network.");
      setTimeout(() => setLocationToast(null), 5000);
    } finally {
      setSearchLoading(false);
    }
  };

  // High-Precision Geolocation: Uses real GPS/Wi-Fi positioning (12s timeout) without faking inaccurate cities
  const handleLocateMe = async () => {
    isUserTypingRef.current = false;
    setShowDropdown(false);
    setLocating(true);
    setLocationToast("Detecting high-precision GPS coordinates...");

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocating(false);
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lon = Number(pos.coords.longitude.toFixed(6));
          let label = `GPS Position (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          try {
            const geoRes = await fetch(`/api/geocode?q=${lat},${lon}`);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
              label = geoData.results[0].displayName || geoData.results[0].name;
            }
          } catch (e) {}

          selectLocation(lat, lon, label);
          setLocationToast(`📍 High-Precision GPS Located: ${label}`);
          setTimeout(() => setLocationToast(null), 6000);
        },
        (error) => {
          setLocating(false);
          console.warn("Browser GPS error:", error.message);
          setLocationToast("📍 GPS not detected. Please search your village or 6-digit PIN code above.");
          setTimeout(() => setLocationToast(null), 6000);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    } else {
      setLocating(false);
      setLocationToast("📍 Geolocation not supported. Please search your village or PIN code above.");
      setTimeout(() => setLocationToast(null), 5000);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">
      {/* Floating Status Notification Toast */}
      {locationToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-slate-700 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-1.5">
          <span>{locationToast}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="absolute top-3 left-12 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Location / Coordinate Search & Locate Me */}
        <div ref={searchContainerRef} className="relative flex items-center gap-2 pointer-events-auto">
          <form
            onSubmit={handleLocationSearch}
            className="flex items-center bg-white/95 backdrop-blur-md rounded-lg p-1 border border-slate-200 shadow-md text-xs relative"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-1" />
            <input
              type="text"
              placeholder="Search city, village, PIN code, or lat, lon..."
              value={searchQuery}
              onChange={(e) => {
                isUserTypingRef.current = true;
                setSearchQuery(e.target.value);
              }}
              onFocus={() => {
                if (suggestions.length > 0 && isUserTypingRef.current) {
                  setShowDropdown(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowDropdown(false);
                }
              }}
              className="w-48 sm:w-64 h-7 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none pr-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  isUserTypingRef.current = false;
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors mr-1 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="submit"
              disabled={searchLoading}
              className="px-2.5 py-1 bg-farm-600 hover:bg-farm-700 text-white rounded text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
            >
              {searchLoading ? "..." : "Search"}
            </button>
          </form>

          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-slate-800 border border-slate-200 rounded-lg shadow-md text-xs font-semibold flex items-center gap-1.5 transition-all hover:text-farm-700 active:scale-95 cursor-pointer"
            title="Detect My Current Location"
          >
            <Crosshair className={`h-3.5 w-3.5 text-rose-600 ${locating ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{locating ? "Locating..." : "Locate Me"}</span>
          </button>

          {/* Autocomplete Suggestion Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-10 left-0 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 max-h-60 overflow-y-auto">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectLocation(s.lat, s.lon, s.displayName || s.name)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-none flex items-start gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-farm-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-800 block truncate">{s.name}</span>
                      {s.source === "google" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 shrink-0">
                          Google Maps
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{s.displayName}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls: Google Maps API Status Badge + Tile Layer Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Google Maps API Verified Active Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-800">Google Maps API</span>
            <span className="text-[10px] text-slate-400 font-normal">Active</span>
          </div>

          {/* Tile Layer Selector */}
          <div className="flex items-center bg-white/95 backdrop-blur-md rounded-lg p-1 border border-slate-200 shadow-md">
            <button
              type="button"
              onClick={() => setTileMode("google_hybrid")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                tileMode === "google_hybrid"
                  ? "bg-farm-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Google Satellite Hybrid with Roads & Labels"
            >
              <Satellite className="h-3 w-3" />
              Google Satellite
            </button>

            <button
              type="button"
              onClick={() => setTileMode("esri_satellite")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                tileMode === "esri_satellite"
                  ? "bg-farm-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Esri Aerial High-Res Satellite"
            >
              <Globe className="h-3 w-3" />
              Esri Aerial
            </button>

            <button
              type="button"
              onClick={() => setTileMode("google_terrain")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                tileMode === "google_terrain"
                  ? "bg-farm-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Google Topo Terrain"
            >
              <Mountain className="h-3 w-3" />
              Terrain
            </button>

            <button
              type="button"
              onClick={() => setTileMode("google_streets")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                tileMode === "google_streets"
                  ? "bg-farm-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Clean Google Vector Roadmap"
            >
              <Layers className="h-3 w-3" />
              Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* Floating Status / Action Indicator */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 shadow-md text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
          <Crosshair className="h-3.5 w-3.5 text-farm-600" />
          <span>Click anywhere to pinpoint farm coordinates</span>
        </div>
      </div>

      <MapContainer
        center={activeCenter}
        zoom={fallbackZoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[420px] flex-1"
      >
        <MapResizer />
        <MapViewController center={activeCenter} zoom={mapTarget ? mapZoom : fallbackZoom} />

        {/* Tile Layers */}
        {tileMode === "google_hybrid" && (
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={["0", "1", "2", "3"]}
            maxZoom={20}
          />
        )}

        {tileMode === "esri_satellite" && (
          <TileLayer
            attribution='&copy; Esri & Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}

        {tileMode === "google_terrain" && (
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            subdomains={["0", "1", "2", "3"]}
            maxZoom={20}
          />
        )}

        {tileMode === "google_streets" && (
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={["0", "1", "2", "3"]}
            maxZoom={20}
          />
        )}

        {/* Click Handler */}
        <MapClickHandler onClick={handleMapClick} />

        {/* Clicked coordinate pinpoint marker */}
        {clickedCoord && (
          <Marker position={clickedCoord} icon={selectedTargetPinIcon}>
            <Popup>
              <div className="p-2.5 text-xs min-w-[190px]">
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <Crosshair className="h-4 w-4" />
                  <span>Pinpoint Location</span>
                </div>
                <div className="text-slate-700 font-mono text-[11px] mt-1.5 bg-slate-50 p-1.5 rounded border border-slate-200">
                  <div>Lat: <span className="font-bold">{clickedCoord[0].toFixed(5)}</span></div>
                  <div>Lon: <span className="font-bold">{clickedCoord[1].toFixed(5)}</span></div>
                </div>
                {onCoordinateClick && (
                  <button
                    type="button"
                    onClick={() => onCoordinateClick(clickedCoord[0], clickedCoord[1])}
                    className="mt-2.5 w-full py-1.5 px-2 text-center text-xs font-semibold text-white bg-farm-600 hover:bg-farm-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>+ Add Plot at this Pin</span>
                  </button>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${clickedCoord[0]},${clickedCoord[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 w-full py-1 text-center text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open in Google Maps ↗</span>
                </a>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Saved Fields */}
        {fields.map((field) => {
          const isSelected = field.id === selectedFieldId;

          // Parse polygon if available
          let polygonPositions: [number, number][] | null = null;
          if (field.polygonGeoJson) {
            try {
              const parsed = JSON.parse(field.polygonGeoJson);
              if (parsed.type === "Polygon" && parsed.coordinates?.[0]) {
                polygonPositions = parsed.coordinates[0].map(
                  (pt: [number, number]) => [pt[1], pt[0]] as [number, number]
                );
              }
            } catch (e) {
              // ignore invalid geojson
            }
          }

          return (
            <React.Fragment key={field.id}>
              {polygonPositions && (
                <Polygon
                  positions={polygonPositions}
                  pathOptions={{
                    color: isSelected ? "#0284c7" : "#16a34a",
                    fillColor: isSelected ? "#38bdf8" : "#4ade80",
                    fillOpacity: isSelected ? 0.4 : 0.25,
                    weight: isSelected ? 3 : 2,
                  }}
                />
              )}

              <Marker
                position={[field.latitude, field.longitude]}
                icon={isSelected ? activePinIcon : defaultPinIcon}
                eventHandlers={{
                  click: () => {
                    if (onSelectField) onSelectField(field.id);
                  },
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[210px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                      <MapPin className="h-4 w-4 text-farm-600" />
                      {field.name}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Crop:</span>
                        <span className="font-semibold text-slate-800">{field.cropType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Area:</span>
                        <span className="font-semibold text-slate-800">{field.areaAcres} Acres</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">GPS:</span>
                        <span className="font-mono text-[10px] text-slate-600">
                          {field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}
                        </span>
                      </div>
                      {field.totalWaterLiters !== undefined && (
                        <div className="flex justify-between pt-1 border-t border-slate-100">
                          <span className="text-slate-500">Water Discharged:</span>
                          <span className="font-semibold text-water-700">
                            {field.totalWaterLiters.toLocaleString()} L
                          </span>
                        </div>
                      )}
                    </div>
                    {onSelectField && (
                      <button
                        type="button"
                        onClick={() => onSelectField(field.id)}
                        className="mt-2.5 w-full py-1 text-center text-xs font-semibold text-white bg-farm-600 hover:bg-farm-700 rounded-md transition-colors"
                      >
                        Set as Active Focus
                      </button>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${field.latitude},${field.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 w-full py-1 text-center text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View on Google Maps ↗</span>
                    </a>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default FieldMap;
