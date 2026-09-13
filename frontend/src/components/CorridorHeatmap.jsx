import React from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { Flame, Layers, AlertTriangle, ShieldCheck } from "lucide-react";

function getHeatColor(prob) {
  if (prob > 0.65) return "#ef4444"; // Red
  if (prob >= 0.3) return "#f59e0b"; // Amber
  return "#10b981"; // Green
}

function getRadius(prob) {
  if (prob > 0.65) return 18;
  if (prob >= 0.3) return 12;
  return 8;
}

export default function CorridorHeatmap({ corridorData }) {
  if (!corridorData || !corridorData.features) return null;

  const center = [25.463, 81.922];

  return (
    <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <span>
              Spatial Delay Heatmap &bull; Right-of-Way Cluster Analysis
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            PostGIS spatial density visualization highlighting high
            concentrations of delayed acquisitions along the 64km alignment
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            Critical Cluster (&gt;65% Risk)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Moderate Cluster
          </span>
        </div>
      </div>

      <div className="h-[420px] rounded-xl overflow-hidden border border-slate-800 relative">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; CartoDB Dark"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {corridorData.features.map((feat) => {
            const props = feat.properties;
            const lat = props.center_lat || 25.46;
            const lon = props.center_lon || 81.92;
            const prob = props.delay_probability || 0.2;
            const color = getHeatColor(prob);
            const radius = getRadius(prob);

            return (
              <React.Fragment key={props.parcel_id}>
                {/* Heat glow outer ring */}
                {prob > 0.65 && (
                  <CircleMarker
                    center={[lat, lon]}
                    radius={radius * 1.8}
                    pathOptions={{
                      fillColor: "#ef4444",
                      fillOpacity: 0.22,
                      stroke: false,
                    }}
                  />
                )}
                {/* Core marker */}
                <CircleMarker
                  center={[lat, lon]}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.85,
                    color: "#ffffff",
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <div className="p-1 text-slate-100 font-sans text-xs">
                      <div className="font-bold text-blue-300">
                        {props.khasra_no
                          ? `Khasra ${props.khasra_no}`
                          : props.parcel_id}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {props.chainage_km}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`font-bold ${prob > 0.65 ? "text-red-400" : "text-amber-400"}`}
                        >
                          +{props.predicted_delay_days}d delay
                        </span>
                        <span className="text-slate-400">
                          ({Math.round(prob * 100)}% risk)
                        </span>
                      </div>
                      <div className="text-[10px] text-red-300 mt-1">
                        Bottleneck: {props.primary_bottleneck}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
