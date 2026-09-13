"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createField, updateField } from "@/actions/fields";
import { FieldInput } from "@/lib/validations/schemas";
import { MapPin, Sparkles, Sprout, Ruler } from "lucide-react";

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldToEdit?: any | null;
  onSuccess?: () => void;
}

export const FieldModal: React.FC<FieldModalProps> = ({
  isOpen,
  onClose,
  fieldToEdit,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FieldInput>({
    name: "",
    cropType: "",
    areaAcres: 0,
    latitude: 18.5204,
    longitude: 73.8567,
    polygonGeoJson: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalSuggestions, setModalSuggestions] = useState<
    Array<{ id: string; name: string; displayName: string; lat: number; lon: number; source?: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (fieldToEdit) {
      setFormData({
        name: fieldToEdit.name,
        cropType: fieldToEdit.cropType,
        areaAcres: fieldToEdit.areaAcres,
        latitude: fieldToEdit.latitude,
        longitude: fieldToEdit.longitude,
        polygonGeoJson: fieldToEdit.polygonGeoJson || "",
      });
      setLocationSuccessMsg(null);
    } else {
      setFormData({
        name: "",
        cropType: "",
        areaAcres: 0,
        latitude: 0,
        longitude: 0,
        polygonGeoJson: "",
      });
      setLocationSuccessMsg(null);
    }
    setError(null);
    setModalSearchQuery("");
  }, [fieldToEdit, isOpen]);

  // Debounced search for place/city in modal
  useEffect(() => {
    if (!modalSearchQuery.trim() || modalSearchQuery.trim().length < 2) {
      setModalSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(modalSearchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            setModalSuggestions(data.results);
            setShowSuggestions(true);
          }
        }
      } catch (err) {
        console.error("Geocoding fetch error:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [modalSearchQuery]);

  const handleSelectPlace = (lat: number, lon: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lon.toFixed(6)),
    }));
    setModalSearchQuery(name);
    setShowSuggestions(false);
    setLocationSuccessMsg(`✓ Selected: ${name}`);
  };

  const handleAutoDetect = async () => {
    setLocating(true);
    setLocationSuccessMsg(null);

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLocating(false);
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lon = Number(pos.coords.longitude.toFixed(6));
          let label = `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          try {
            const geoRes = await fetch(`/api/geocode?q=${lat},${lon}`);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results.length > 0) {
              label = geoData.results[0].displayName || geoData.results[0].name;
            }
          } catch (e) {}
          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lon }));
          setLocationSuccessMsg(`✓ High-Precision GPS: ${label}`);
        },
        (err) => {
          setLocating(false);
          console.warn("GPS error:", err.message);
          setLocationSuccessMsg("⚠️ GPS not detected. Please search your village or PIN code below.");
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    } else {
      setLocating(false);
      setLocationSuccessMsg("⚠️ Geolocation not supported on device. Please search your village or PIN code below.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      if (fieldToEdit?.id) {
        res = await updateField(fieldToEdit.id, formData);
      } else {
        res = await createField(formData);
      }

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to save field");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fieldToEdit ? "Edit Field / Plot" : "Add New Field / Plot"}
      subtitle="Configure agricultural plot boundaries, crop variety, and geospatial telemetry coordinates"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        {/* Field Name */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Field / Plot Name</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. North Valley Orchard 3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 focus:border-farm-500 outline-none text-slate-900"
            />
          </div>
        </div>

        {/* Crop Type & Acreage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Sprout className="h-3.5 w-3.5 text-farm-600" />
              Primary Crop Type
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cotton, Cabernet Sauvignon, Maize"
              value={formData.cropType}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 focus:border-farm-500 outline-none text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-farm-600" />
              Plot Area (Acres)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              placeholder="e.g. 25.5"
              value={formData.areaAcres || ""}
              onChange={(e) => setFormData({ ...formData, areaAcres: parseFloat(e.target.value) || 0 })}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-farm-500 focus:border-farm-500 outline-none text-slate-900"
            />
          </div>
        </div>

        {/* Geospatial GPS Pinpoint */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-farm-600" />
              Plot Location (GPS Coordinates)
            </span>
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={locating}
              className="px-2.5 py-1 bg-farm-600 hover:bg-farm-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <span>{locating ? "Detecting..." : "📍 Auto-Detect My Location"}</span>
            </button>
          </div>

          {locationSuccessMsg && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1.5">
              <span>{locationSuccessMsg}</span>
            </div>
          )}

          {/* Place / City Search */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-slate-600">
                Search Town, Village, or Farm Location (auto-fills coordinates)
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Google Places API
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Pune, Baramati, Nashik, Sangli..."
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              onFocus={() => {
                if (modalSuggestions.length > 0) setShowSuggestions(true);
              }}
              className="w-full h-8 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
            />
            {showSuggestions && modalSuggestions.length > 0 && (
              <div className="absolute top-15 left-0 right-0 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 max-h-48 overflow-y-auto">
                {modalSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectPlace(s.lat, s.lon, s.displayName || s.name)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-none flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-slate-800">{s.name}</span>
                      {s.source === "google" && (
                        <span className="text-[9px] font-bold px-1 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 shrink-0">
                          Google
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 truncate max-w-[180px]">{s.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Latitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={formData.latitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-9 px-2.5 font-mono border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Longitude</label>
              <input
                type="number"
                step="0.000001"
                required
                value={formData.longitude || ""}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                }
                className="w-full h-9 px-2.5 font-mono border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-farm-500 outline-none"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Coordinates connect to live OpenWeather telemetry and calculate wind spray drift risk.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={loading}>
            {fieldToEdit ? "Update Plot" : "Create Plot"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
