"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function MapComponent({
  latitude,
  longitude,
  accuracy,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Calculate zoom based on accuracy (more accurate = closer zoom)
    const getZoomLevel = (accuracy: number) => {
      if (accuracy < 10) return 19;
      if (accuracy < 50) return 18;
      if (accuracy < 100) return 17;
      if (accuracy < 500) return 16;
      return 15;
    };

    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: getZoomLevel(accuracy),
        zoomControl: true,
        maxZoom: 20,
      });

      // Add satellite tile layer (Esri World Imagery)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 20,
          minZoom: 2,
        }
      ).addTo(map);

      // Add labels overlay
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/only_labels/{z}/{x}/{y}.png",
        {
          attribution: "&copy; CartoDB",
          maxZoom: 20,
          minZoom: 2,
          pane: "shadowPane",
        }
      ).addTo(map);

      // Create custom icon for the marker
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      // Add marker
      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981"/>
            </svg>
            <strong style="font-size: 14px;">You are here</strong>
          </div>
          <div style="font-size: 13px; color: #666; font-family: monospace; background: #f3f4f6; padding: 6px; border-radius: 4px;">
            ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°
          </div>
        </div>
      `);

      // Add accuracy circle
      L.circle([latitude, longitude], {
        radius: accuracy,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map);

      // Add pulsing circle animation
      L.circle([latitude, longitude], {
        radius: 20,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.3,
        weight: 0,
        className: "pulsing-circle",
      }).addTo(map);

      mapRef.current = map;
    } else {
      // Update existing map
      const map = mapRef.current;

      // Calculate zoom based on accuracy
      const getZoomLevel = (accuracy: number) => {
        if (accuracy < 10) return 19;
        if (accuracy < 50) return 18;
        if (accuracy < 100) return 17;
        if (accuracy < 500) return 16;
        return 15;
      };

      // Smoothly pan to new location
      map.flyTo([latitude, longitude], getZoomLevel(accuracy), {
        duration: 0.5,
      });

      // Clear existing layers except base tiles
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Re-add marker and circles
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#10b981"/>
            </svg>
            <strong style="font-size: 14px;">You are here</strong>
          </div>
          <div style="font-size: 13px; color: #666; font-family: monospace; background: #f3f4f6; padding: 6px; border-radius: 4px;">
            ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°
          </div>
        </div>
      `);

      L.circle([latitude, longitude], {
        radius: accuracy,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map);

      L.circle([latitude, longitude], {
        radius: 20,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 0.3,
        weight: 0,
        className: "pulsing-circle",
      }).addTo(map);
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, accuracy]);

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full" />
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }

        .pulsing-circle {
          animation: pulse 2s ease-in-out infinite;
        }

        .custom-marker {
          background: transparent;
          border: none;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .leaflet-popup-tip {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}
