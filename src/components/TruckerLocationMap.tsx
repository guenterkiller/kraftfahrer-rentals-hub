import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationCluster {
  lat: number;
  lng: number;
  count: number;
  drivers: { user_id: string; user_name: string; }[];
  place_name?: string;
}

interface TruckerLocationMapProps {
  clusters: LocationCluster[];
  center: [number, number];
}

export const TruckerLocationMap = ({ clusters, center }: TruckerLocationMapProps) => {
  return (
    <div className="h-[400px] rounded-md overflow-hidden mt-3">
      <MapContainer
        key={`${center[0]}-${center[1]}`}
        center={center}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clusters.map((cluster, idx) => {
          const icon = divIcon({
            className: 'custom-cluster-icon',
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
            iconAnchor: [Math.min(15 + cluster.count * 2.5, 30), Math.min(15 + cluster.count * 2.5, 30)]
          });

          return (
            <Marker
              key={idx}
              position={[cluster.lat, cluster.lng]}
              icon={icon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold mb-1">
                    {cluster.count} {cluster.count === 1 ? 'Fahrer' : 'Fahrer'} in dieser Nähe
                  </p>
                  {cluster.place_name && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Autohof / Rastplatz in der Nähe
                    </p>
                  )}
                  <ul className="text-xs space-y-1 max-h-24 overflow-y-auto">
                    {cluster.drivers.slice(0, 5).map((driver, dIdx) => (
                      <li key={dIdx} className="text-muted-foreground">
                        {driver.user_name}
                      </li>
                    ))}
                    {cluster.drivers.length > 5 && (
                      <li className="text-muted-foreground italic">
                        ... und {cluster.drivers.length - 5} weitere
                      </li>
                    )}
                  </ul>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
