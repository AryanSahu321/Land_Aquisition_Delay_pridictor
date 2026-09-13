import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import {
  MapPin,
  AlertOctagon,
  CheckCircle,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Sparkles,
  Scale,
  Calendar,
  Building,
  Maximize2,
} from "lucide-react";

// Color choropleth mapping based on delay probability
function getRiskColor(delayProb) {
  if (delayProb < 0.3) {
    return "#10b981"; // Emerald 500 (Green)
  } else if (delayProb <= 0.65) {
    return "#f59e0b"; // Amber 500 (Yellow)
  } else {
    return "#ef4444"; // Red 500 (Critical)
  }
}

// Map center controller
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function CorridorMap({
  corridorData,
  selectedParcel,
  onSelectParcel,
  onOpenSimulation,
}) {
  const [mapCenter, setMapCenter] = useState([25.463, 81.922]);
  const [mapZoom, setMapZoom] = useState(13);
  const [filterRisk, setFilterRisk] = useState("ALL");

  if (!corridorData || !corridorData.features) {
    return (
      <div className="h-[520px] bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
        <span className="ml-3 text-sm">
          Rendering Right-of-Way GIS Corridor...
        </span>
      </div>
    );
  }

  const handleFeatureClick = (feature) => {
    const props = feature.properties;
    onSelectParcel(props);
    if (props.center_lat && props.center_lon) {
      setMapCenter([props.center_lat, props.center_lon]);
      setMapZoom(15);
    }
  };

  // Style each parcel polygon
  const geojsonStyle = (feature) => {
    const props = feature.properties;
    const prob = props.delay_probability || 0;
    const isSelected =
      selectedParcel && selectedParcel.parcel_id === props.parcel_id;
    const color = getRiskColor(prob);

    // Apply risk filter opacity
    let opacity = 0.85;
    let fillOpacity = 0.55;
    if (filterRisk !== "ALL") {
      if (filterRisk === "HIGH" && prob <= 0.65) fillOpacity = 0.08;
      if (filterRisk === "MEDIUM" && (prob < 0.3 || prob > 0.65))
        fillOpacity = 0.08;
      if (filterRisk === "LOW" && prob >= 0.3) fillOpacity = 0.08;
    }

    return {
      fillColor: color,
      weight: isSelected ? 4 : 2,
      opacity: isSelected ? 1.0 : opacity,
      color: isSelected ? "#ffffff" : color,
      dashArray: isSelected ? "" : "",
      fillOpacity: isSelected ? 0.85 : fillOpacity,
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    const prob = Math.round((props.delay_probability || 0) * 100);
    const delay = props.predicted_delay_days || 0;
    const risk = props.risk_category || "Low";

    layer.on({
      click: () => handleFeatureClick(feature),
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 4, color: "#60a5fa", fillOpacity: 0.8 });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(geojsonStyle(feature));
      },
    });

    const tooltipContent = `
      <div style="font-family: Inter, sans-serif; font-size: 12px; color: #f8fafc;">
        <div style="font-weight: bold; color: #93c5fd; margin-bottom: 2px;">
          ${props.khasra_no ? `Khasra ${props.khasra_no}` : props.parcel_id}
        </div>
        <div>${props.village_name || ""}, ${props.tehsil || ""}</div>
        <div style="margin-top: 4px; display: flex; gap: 8px;">
          <span style="color: ${prob > 65 ? "#f87171" : prob >= 30 ? "#fbbf24" : "#34d399"}; font-weight: 700;">
            ${risk} Risk (${prob}%)
          </span>
          <span style="color: #cbd5e1;">+${delay} days</span>
        </div>
      </div>
    `;
    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: "custom-map-tooltip",
    });
  };

  return (
    <div className="space-y-4">
      {/* Map Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>
              Interactive Right-of-Way Corridor (25 Contiguous Parcels)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            NH-19 Expressway Alignment &bull; Prayagraj-Varanasi Stretch &bull;
            Live ML Choropleth
          </p>
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter:</span>
          <button
            onClick={() => setFilterRisk("ALL")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition ${
              filterRisk === "ALL"
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
            }`}
          >
            All (25)
          </button>
          <button
            onClick={() => setFilterRisk("HIGH")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition ${
              filterRisk === "HIGH"
                ? "bg-red-600 text-white border-red-500"
                : "bg-slate-800 text-red-300 border-red-900/50 hover:bg-slate-750"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Critical (&gt;65%)
          </button>
          <button
            onClick={() => setFilterRisk("MEDIUM")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition ${
              filterRisk === "MEDIUM"
                ? "bg-amber-600 text-white border-amber-500"
                : "bg-slate-800 text-amber-300 border-amber-900/50 hover:bg-slate-750"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Moderate (30-65%)
          </button>
          <button
            onClick={() => setFilterRisk("LOW")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition ${
              filterRisk === "LOW"
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-slate-800 text-emerald-300 border-emerald-900/50 hover:bg-slate-750"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Low (&lt;30%)
          </button>
        </div>
      </div>

      {/* Map + Side Inspect Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leaflet Map Frame */}
        <div className="lg:col-span-8 h-[520px] rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; CartoDB Dark'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <GeoJSON
              key={`corridor-${filterRisk}-${selectedParcel?.parcel_id || "none"}`}
              data={corridorData}
              style={geojsonStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700/80 shadow-xl text-xs space-y-1.5">
            <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1">
              Live RoW Risk Level
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span>Low Risk (&lt;30% prob)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
              <span>Moderate Risk (30-65% prob)</span>
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-3 h-3 rounded-sm bg-red-500"></span>
              <span>Critical Blocker (&gt;65% prob)</span>
            </div>
          </div>
        </div>

        {/* Interactive Inspect Side-Sheet */}
        <div className="lg:col-span-4 h-[520px] bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl">
          {selectedParcel ? (
            <div className="space-y-4">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Stationing: {selectedParcel.chainage_km}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                      selectedParcel.risk_category === "High"
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : selectedParcel.risk_category === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {selectedParcel.risk_category} Risk (
                    {Math.round((selectedParcel.delay_probability || 0) * 100)}
                    %)
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Khasra No:{" "}
                  {selectedParcel.khasra_no || selectedParcel.parcel_id}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedParcel.village_name}, Tehsil {selectedParcel.tehsil},{" "}
                  {selectedParcel.district}
                </p>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Khatauni: {selectedParcel.khatauni_no || "KH-3912"} &bull; ID:{" "}
                  {selectedParcel.parcel_id}
                </div>
              </div>

              {/* Primary Delay Metrics */}
              <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">
                    Predicted Timeline Delay
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">
                      +{selectedParcel.predicted_delay_days}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1">
                      Days
                    </span>
                  </div>
                </div>

                {/* Primary Bottleneck Tag */}
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Primary Bottleneck
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-950/50 text-red-300 border border-red-800/40">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    {selectedParcel.primary_bottleneck ||
                      "Pending Section Verification"}
                  </span>
                </div>
              </div>

              {/* Detailed Revenue & Statutory Specs */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">Statutory Milestone:</span>
                  <span className="font-semibold text-white">
                    {selectedParcel.statutory_stage}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">Elapsed in Stage:</span>
                  <span className="font-mono text-slate-200">
                    {selectedParcel.days_in_current_stage || 45} days
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">Land Classification:</span>
                  <span className="font-semibold text-slate-200">
                    {selectedParcel.land_type}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">Acquisition Footprint:</span>
                  <span className="font-mono text-slate-200">
                    {selectedParcel.total_area_hectares} ha (
                    {selectedParcel.affected_families_count} families)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">
                    Compensation Disbursed:
                  </span>
                  <span className="font-mono font-bold text-blue-400">
                    {selectedParcel.compensation_disbursed_pct}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                  <span className="text-slate-400">Civil Court Stays:</span>
                  <span
                    className={`font-mono font-bold ${selectedParcel.pending_court_injunctions > 0 ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {selectedParcel.pending_court_injunctions} active
                    {selectedParcel.sec_3h_escrow_deposited
                      ? " (Sec 3H Escrowed)"
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-300">
                  <span className="text-slate-400">
                    Joint Measurement Survey:
                  </span>
                  <span
                    className={`font-semibold ${selectedParcel.jms_completed !== false ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {selectedParcel.jms_completed !== false
                      ? "Demarcation Complete"
                      : "Survey Stalled"}
                  </span>
                </div>
              </div>

              {/* Action Button: Launch Simulation Sandbox */}
              <div className="pt-2">
                <button
                  onClick={() => onOpenSimulation(selectedParcel)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Launch "What-If" Simulation & XAI</span>
                  <ArrowUpRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-3">
              <MapPin className="w-10 h-10 text-slate-600 stroke-[1.5]" />
              <div>
                <h4 className="font-bold text-slate-200 text-sm">
                  Select Any Parcel Polygon
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click on any of the 25 right-of-way corridor polygons on the
                  GIS map to inspect Khasra details, live AI risk factors, and
                  statutory SOPs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
