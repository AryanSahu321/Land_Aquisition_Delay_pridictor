import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  Layers,
  MapPin,
  Compass,
  AlertTriangle,
  CheckCircle,
  AlertOctagon,
  Maximize2,
  FileText,
  ShieldAlert,
  Scale,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// Risk color mapping
function getRiskColor(prob) {
  if (prob >= 0.65) return "#ef4444"; // Red (Critical)
  if (prob >= 0.3) return "#f59e0b"; // Amber (Moderate)
  return "#10b981"; // Emerald (Low / Cleared)
}

// Controller to handle fitBounds and flyTo
function MapViewController({ bounds, center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length === 2) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch {
        if (center) map.flyTo(center, zoom || 10, { duration: 1.2 });
      }
    } else if (center) {
      map.flyTo(center, zoom || 10, { duration: 1.2 });
    }
  }, [bounds, center, zoom, map]);

  return null;
}

export default function CorridorMap({
  corridorData,
  corridorGeojson,
  selectedParcel,
  onSelectParcel,
}) {
  const data = corridorData || corridorGeojson || {};
  const features = data.features || [];

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [baseLayer, setBaseLayer] = useState("street"); // 'street' | 'satellite'
  const [internalSelectedParcel, setInternalSelectedParcel] = useState(null);

  // Auto-select first parcel if none selected
  useEffect(() => {
    if (!selectedParcel && !internalSelectedParcel && features.length > 0) {
      const defaultParcel = features[0].properties;
      setInternalSelectedParcel(defaultParcel);
      if (onSelectParcel) onSelectParcel(defaultParcel);
    }
  }, [features, selectedParcel, internalSelectedParcel, onSelectParcel]);

  const activeParcel = selectedParcel || internalSelectedParcel;

  // Filter features based on active risk filter (supports both probability and category string)
  const filteredFeatures = features.filter((feat) => {
    const prob = feat.properties?.delay_probability || 0;
    const cat = (feat.properties?.risk_category || "").toUpperCase();
    if (activeFilter === "CRITICAL") return cat === "CRITICAL" || prob >= 0.65;
    if (activeFilter === "MODERATE")
      return (
        cat === "MODERATE" || (prob >= 0.3 && prob < 0.65)
      );
    if (activeFilter === "LOW") return cat === "LOW" || prob < 0.3;
    return true;
  });

  const filteredGeojson = {
    type: "FeatureCollection",
    features: filteredFeatures,
  };

  // Highway spine alignment line
  const alignmentLine = data.alignment_line || [];
  const milestones = data.milestones || [];
  const mapCenter = data.center || [26.25, 82.35];
  const mapZoom = data.zoom || 9;
  const mapBounds = data.bounds || null;

  const handleParcelClick = (feature) => {
    const props = feature.properties;
    setInternalSelectedParcel(props);
    if (onSelectParcel) onSelectParcel(props);
  };

  // Polygon styling for cadastral strips
  const geojsonStyle = (feature) => {
    const props = feature.properties || {};
    const prob = props.delay_probability || 0;
    const isSelected =
      activeParcel && activeParcel.parcel_id === props.parcel_id;
    const color = getRiskColor(prob);

    return {
      fillColor: color,
      weight: isSelected ? 4 : 2,
      opacity: isSelected ? 1.0 : 0.85,
      color: isSelected ? "#ffffff" : color,
      fillOpacity: isSelected ? 0.85 : 0.6,
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const prob = Math.round((props.delay_probability || 0) * 100);
    const delay = props.predicted_delay_days || 0;
    const risk = props.risk_category || "Low";

    layer.on({
      click: () => handleParcelClick(feature),
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 4, color: "#60a5fa", fillOpacity: 0.9 });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(geojsonStyle(feature));
      },
    });

    const tooltipHtml = `
      <div style="font-family: inherit; font-size: 11px; color: #f8fafc;">
        <div style="font-weight: 800; color: #38bdf8; margin-bottom: 2px;">
          ${props.khasra_no || props.parcel_id} (${props.chainage_km || "RoW Strip"})
        </div>
        <div>${props.village_name || ""}, ${props.district || ""}</div>
        <div style="margin-top: 4px; display: flex; gap: 8px;">
          <span style="color: ${prob >= 65 ? "#f87171" : prob >= 30 ? "#fbbf24" : "#34d399"}; font-weight: 700;">
            ${risk} Risk (${prob}%)
          </span>
          <span style="color: #cbd5e1;">+${delay} Days</span>
        </div>
      </div>
    `;
    layer.bindTooltip(tooltipHtml, {
      sticky: true,
      className: "custom-map-tooltip",
    });
  };

  const criticalCount = features.filter((f) => {
    const p = f.properties || {};
    return (
      (p.risk_category || "").toUpperCase() === "CRITICAL" ||
      (p.delay_probability || 0) >= 0.65
    );
  }).length;
  const moderateCount = features.filter((f) => {
    const p = f.properties || {};
    const prob = p.delay_probability || 0;
    return (
      (p.risk_category || "").toUpperCase() === "MODERATE" ||
      (prob >= 0.3 && prob < 0.65)
    );
  }).length;
  const lowCount = features.filter((f) => {
    const p = f.properties || {};
    return (
      (p.risk_category || "").toUpperCase() === "LOW" ||
      (p.delay_probability || 0) < 0.3
    );
  }).length;

  return (
    <div className="space-y-4">
      {/* Top Controls & Metrics Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                {data.project_name || "Expressway Right-of-Way Corridor"}
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                Exact 120m RoW Buffer
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Authentic Cadastral Khasra Strips Hugging the Alignment &bull;
              Zoom-Resilient Geometry
            </p>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-center font-mono">
            <span className="text-[9px] uppercase text-slate-400 block font-semibold">
              Length
            </span>
            <span className="font-bold text-white">
              {data.total_km || 340.8} km
            </span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-center font-mono">
            <span className="text-[9px] uppercase text-slate-400 block font-semibold">
              RoW Width
            </span>
            <span className="font-bold text-sky-400">120 Metres</span>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-center font-mono">
            <span className="text-[9px] uppercase text-slate-400 block font-semibold">
              Scale
            </span>
            <span className="font-bold text-emerald-400">100m Strips</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map (8 cols) + Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Map Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          {/* Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-300">RoW Parcels:</span>
              <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    activeFilter === "ALL"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({features.length})
                </button>
                <button
                  onClick={() => setActiveFilter("CRITICAL")}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition ${
                    activeFilter === "CRITICAL"
                      ? "bg-red-600 text-white"
                      : "text-red-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Critical ({criticalCount})
                </button>
                <button
                  onClick={() => setActiveFilter("MODERATE")}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition ${
                    activeFilter === "MODERATE"
                      ? "bg-amber-600 text-white"
                      : "text-amber-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Moderate ({moderateCount})
                </button>
                <button
                  onClick={() => setActiveFilter("LOW")}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition ${
                    activeFilter === "LOW"
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-400 hover:text-white"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Cleared ({lowCount})
                </button>
              </div>
            </div>

            {/* Base Layer Switcher & Fit Corridor */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setBaseLayer("satellite")}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    baseLayer === "satellite"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🛰️ Satellite
                </button>
                <button
                  onClick={() => setBaseLayer("street")}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    baseLayer === "street"
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🗺️ Clean Map
                </button>
              </div>

              {mapBounds && (
                <button
                  onClick={() => {
                    const mapEl = document.querySelector(".leaflet-container");
                    if (mapEl && mapEl._leaflet_map) {
                      mapEl._leaflet_map.fitBounds(mapBounds, {
                        padding: [50, 50],
                      });
                    }
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Fit Corridor</span>
                </button>
              )}
            </div>
          </div>

          {/* Leaflet Map Frame */}
          <div className="h-[540px] rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <MapViewController
                bounds={mapBounds}
                center={mapCenter}
                zoom={mapZoom}
              />

              {/* Zero-Block Digital Base Layers */}
              {baseLayer === "satellite" ? (
                <TileLayer
                  attribution="&copy; Esri, Maxar & Earthstar Geographics | PM GatiShakti GIS"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              ) : (
                <TileLayer
                  attribution="&copy; Esri, HERE, Garmin & OpenStreetMap contributors | PM GatiShakti GIS"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              )}

              {/* Glowing Highway Alignment Spine */}
              {alignmentLine.length > 1 && (
                <Polyline
                  positions={alignmentLine}
                  pathOptions={{
                    color: "#4f46e5",
                    weight: 6,
                    opacity: 0.9,
                    dashArray: "10, 8",
                  }}
                />
              )}

              {/* Terminus Origin & Destination Mile Markers Only */}
              {milestones
                .filter((_, idx) => idx === 0 || idx === milestones.length - 1)
                .map((m, idx) => {
                  const isOrigin = idx === 0;
                  return (
                    <CircleMarker
                      key={`milestone-terminus-${idx}`}
                      center={m.coords}
                      radius={9}
                      pathOptions={{
                        color: isOrigin ? "#38bdf8" : "#10b981",
                        fillColor: isOrigin ? "#0284c7" : "#059669",
                        fillOpacity: 0.95,
                        weight: 3,
                      }}
                    >
                      <Tooltip sticky>{m.name}</Tooltip>
                    </CircleMarker>
                  );
                })}

              {/* 120m Cadastral Strips Layer */}
              <GeoJSON
                key={`parcels-${activeFilter}-${activeParcel?.parcel_id || "none"}`}
                data={filteredGeojson}
                style={geojsonStyle}
                onEachFeature={onEachFeature}
              />

              {/* HIGH-VISIBILITY RISK HOTSPOT DOTS (RED, AMBER, GREEN - EXACTLY AS IN GIS_DEMO.HTML) */}
              {filteredFeatures.map((feat) => {
                const props = feat.properties || {};
                const prob = props.delay_probability ?? 0.1;
                const riskCat = (props.risk_category || "").toUpperCase();
                const color =
                  riskCat === "CRITICAL" || prob >= 0.65
                    ? "#ef4444"
                    : riskCat === "MODERATE" || prob >= 0.3
                    ? "#f59e0b"
                    : "#10b981";
                const isSelected =
                  activeParcel && activeParcel.parcel_id === props.parcel_id;
                const radius = isSelected
                  ? 12
                  : riskCat === "CRITICAL" || prob >= 0.65
                  ? 10
                  : 8;

                // Center coordinates
                let lat = props.center_lat;
                let lon = props.center_lon;
                if (
                  (lat == null || lon == null) &&
                  feat.geometry?.coordinates?.[0]?.[0]
                ) {
                  lon = feat.geometry.coordinates[0][0][0];
                  lat = feat.geometry.coordinates[0][0][1];
                }
                if (lat == null || lon == null) return null;

                return (
                  <CircleMarker
                    key={`hotspot-dot-${props.parcel_id}`}
                    center={[lat, lon]}
                    radius={radius}
                    pathOptions={{
                      color: isSelected ? "#ffffff" : color,
                      weight: isSelected ? 3.5 : 2,
                      fillColor: color,
                      fillOpacity: 0.95,
                    }}
                    eventHandlers={{
                      click: () => {
                        setInternalSelectedParcel(props);
                        if (onSelectParcel) onSelectParcel(props);
                      },
                    }}
                  >
                    <Tooltip sticky>
                      <div
                        style={{
                          fontFamily: "inherit",
                          fontSize: "11px",
                          color: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#38bdf8",
                            marginBottom: "2px",
                          }}
                        >
                          {props.khasra_no || props.parcel_id} (
                          {props.village_name || ""})
                        </div>
                        <div>
                          {props.district || ""} &bull;{" "}
                          {props.chainage_km || "RoW Strip"}
                        </div>
                        <div
                          style={{
                            marginTop: "4px",
                            color,
                            fontWeight: 700,
                          }}
                        >
                          {props.risk_category || "RISK"} &bull; +
                          {props.predicted_delay_days || 0}d Delay (
                          {Math.round(prob * 100)}%)
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Bottom Floating Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-1.5 font-mono">
              <div className="font-bold text-slate-200 text-[10px] uppercase tracking-wider mb-1">
                RoW Acquisition Risk Status
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>High Risk (Stay Order / Sec 3H Escrow)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Moderate Risk (Mutation / Succession)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Cleared (Handed to Contractor)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspector Panel (4 cols) matching gis_demo.html */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-white text-sm">
                  Cadastral Parcel Inspector
                </h4>
              </div>
              {activeParcel && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono border ${
                    activeParcel.risk_category === "Critical" ||
                    activeParcel.risk_category === "High"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : activeParcel.risk_category === "Moderate" ||
                          activeParcel.risk_category === "Medium"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {activeParcel.risk_category?.toUpperCase()} RISK (+
                  {activeParcel.predicted_delay_days || 0}D DELAY)
                </span>
              )}
            </div>

            {activeParcel ? (
              <div className="space-y-4 text-xs">
                {/* Parcel Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">
                      {activeParcel.khasra_no || activeParcel.parcel_id}
                    </h3>
                    <span className="text-[11px] font-mono text-sky-400 font-bold">
                      {activeParcel.chainage_km || "km 00+000"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Village
                      </span>
                      <span className="font-medium text-slate-200">
                        {activeParcel.village_name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        District
                      </span>
                      <span className="font-medium text-slate-200">
                        {activeParcel.district || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Package
                      </span>
                      <span className="font-medium text-slate-200">
                        {activeParcel.package || "Package 1"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Area
                      </span>
                      <span className="font-medium text-slate-200">
                        {activeParcel.total_area_hectares || 1.4} Hectares
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statutory Title & Court Stay */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Statutory Title & Court Stay</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div>
                      <span className="text-slate-500">Khatedar / Heirs: </span>
                      <span className="text-white font-medium">
                        {activeParcel.khatedar || "Landowner Record"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Dispute: </span>
                      <span className="text-red-300 font-semibold">
                        {activeParcel.court_stay || "None"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">
                        Statutory Section:{" "}
                      </span>
                      <span className="text-sky-300">
                        {activeParcel.statutory_section || "NH Act Section 3D"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial KPI Badges */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Compensation Disbursed
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      {activeParcel.compensation_disbursed_pct || 75}%
                    </span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Locked in Escrow
                    </span>
                    <span className="text-sm font-black text-amber-400">
                      {activeParcel.amount_locked || "₹0"}
                    </span>
                  </div>
                </div>

                {/* ML Predictions */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      ML Delay Prediction
                    </span>
                    <span className="text-sm font-black text-red-400">
                      +{activeParcel.predicted_delay_days || 0} Days
                    </span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Delay Probability
                    </span>
                    <span className="text-sm font-black text-amber-400">
                      {Math.round((activeParcel.delay_probability || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Click on any colored parcel along the RoW alignment to inspect
                its statutory title, legal stay, and ML prediction.
              </p>
            )}
          </div>

          {/* Authentic 120m Corridor Engineering Explanatory Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-300 shadow-xl">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="text-emerald-400">📐</span> Authentic 120m
              Corridor Engineering
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              In standard Indian highway engineering (NHAI / UPEIDA guidelines),
              the Right-of-Way is{" "}
              <b className="text-slate-200">120 metres wide</b> (60m on either
              side of the expressway centerline). These parcels represent true{" "}
              <b className="text-slate-200">
                100m to 180m linear cadastral strips
              </b>{" "}
              directly centered on the highway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
