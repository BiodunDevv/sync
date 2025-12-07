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

    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: true,
      });

      // Add satellite tile layer (Esri World Imagery)
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        }
      ).addTo(map);

      // Add labels overlay
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/only_labels/{z}/{x}/{y}.png",
        {
          attribution: "&copy; CartoDB",
          maxZoom: 19,
          pane: "shadowPane",
        }
      ).addTo(map);

      // Create custom icon for the marker
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="position: relative;">
            <div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #10b981, #059669);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Add marker
      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; padding: 4px;">
          <strong style="display: block; margin-bottom: 4px;">📍 You are here</strong>
          <div style="font-size: 12px; color: #666;">
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
      map.setView([latitude, longitude], 16);

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
          <div style="position: relative;">
            <div style="
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #10b981, #059669);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="text-align: center; padding: 4px;">
          <strong style="display: block; margin-bottom: 4px;">📍 You are here</strong>
          <div style="font-size: 12px; color: #666;">
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
