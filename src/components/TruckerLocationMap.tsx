import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationCluster {
  lat: number;
  lng: number;
  count: number;
  drivers: { user_id: string; user_name: string; updated_at?: string; }[];
  place_name?: string;
}

interface TruckerLocationMapProps {
  clusters: LocationCluster[];
  center: [number, number];
}

export const TruckerLocationMap = ({ clusters, center }: TruckerLocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current).setView(center, 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, mapRef.current.getZoom());
  }, [center]);

  // Update markers when clusters change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    clusters.forEach((cluster) => {
      const icon = L.divIcon({
        className: "custom-cluster-icon",
        html: `<div style="
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 50%;
          width: ${Math.min(30 + cluster.count * 5, 60)}px;
          height: ${Math.min(30 + cluster.count * 5, 60)}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: ${Math.min(12 + cluster.count, 18)}px;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${cluster.count}</div>`,
        iconSize: [Math.min(30 + cluster.count * 5, 60), Math.min(30 + cluster.count * 5, 60)],
        iconAnchor: [Math.min(15 + cluster.count * 2.5, 30), Math.min(15 + cluster.count * 2.5, 30)],
      });

      const marker = L.marker([cluster.lat, cluster.lng], { icon });

      // 4) Marker-Popup mit aktiven Fahrern und Zeitlabels
      const popupContent = document.createElement("div");
      popupContent.className = "text-sm";
      
      // Erstelle Fahrer-Liste mit Zeitlabels (max 5)
      const driversList = cluster.drivers.slice(0, 5).map(driver => {
        const minutesAgo = driver.updated_at 
          ? Math.floor((Date.now() - new Date(driver.updated_at).getTime()) / 60000)
          : 0;
        const timeLabel = minutesAgo < 5 ? 'online' : `vor ${minutesAgo} Min.`;
        return `<li class="text-xs text-muted-foreground">${driver.user_name} – ${timeLabel}</li>`;
      }).join('');
      
      popupContent.innerHTML = `
        <p class="font-semibold mb-1">
          ${cluster.count} Fahrer in dieser Nähe
        </p>
        ${
          cluster.place_name
            ? '<p class="text-xs text-muted-foreground mb-2">Autohof / Rastplatz in der Nähe</p>'
            : ""
        }
        ${driversList ? `<ul class="space-y-1 mt-2">${driversList}</ul>` : ''}
      `;

      marker.bindPopup(popupContent);
      marker.addTo(layer);
    });
  }, [clusters]);

  return <div ref={containerRef} className="h-[400px] rounded-md overflow-hidden mt-3" />;
};
