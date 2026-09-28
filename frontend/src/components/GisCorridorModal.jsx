import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  X,
  Layers,
  MapPin,
  AlertTriangle,
  Scale,
  Sparkles,
  Maximize2,
  Minimize2,
  Building,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

// Alignment coordinates for 340.8 km Purvanchal Expressway
const ALIGNMENT = [
  [26.755, 81.065],
  [26.702, 81.22],
  [26.635, 81.425],
  [26.54, 81.65],
  [26.475, 81.82],
  [26.38, 82.02],
  [26.315, 82.19],
  [26.26, 82.38],
  [26.195, 82.56],
  [26.12, 82.78],
  [26.08, 82.98],
  [26.025, 83.16],
  [25.96, 83.33],
  [25.88, 83.45],
  [25.79, 83.52],
  [25.68, 83.555],
  [25.585, 83.585],
];

const PLACES = [
  ["Chand Saray", "Lucknow", "0"],
  ["Gosainganj", "Lucknow", "15"],
  ["Mohanlalganj", "Barabanki", "28"],
  ["Haidargarh", "Barabanki", "48"],
  ["Bhikharpur", "Amethi", "64"],
  ["Inhauna", "Amethi", "77"],
  ["Kurebhar", "Sultanpur", "96"],
  ["Dhanpatganj", "Sultanpur", "114"],
  ["Kuwar", "Sultanpur", "134"],
  ["Dostpur", "Ambedkar Nagar", "157"],
  ["Akhand Nagar", "Ambedkar Nagar", "178"],
  ["Pawai Border", "Azamgarh", "205"],
  ["Phoolpur Pawai", "Azamgarh", "227"],
  ["Rani Ki Sarai", "Azamgarh", "248"],
  ["Jahanaganj", "Azamgarh/Mau", "273"],
  ["Muhammadabad Gohna", "Mau", "294"],
  ["Mardah", "Ghazipur", "326"],
  ["Haidaria", "Ghazipur", "340.8"],
];

const RISK_SET = [
  "CRITICAL",
  "MODERATE",
  "MODERATE",
  "CRITICAL",
  "LOW",
  "MODERATE",
  "LOW",
  "CRITICAL",
  "MODERATE",
  "CRITICAL",
  "MODERATE",
  "LOW",
  "CRITICAL",
  "LOW",
  "MODERATE",
  "MODERATE",
  "CRITICAL",
  "LOW",
];

const PROBS = [
  0.82, 0.4, 0.48, 0.89, 0.12, 0.55, 0.05, 0.79, 0.42, 0.91, 0.52, 0.14, 0.94,
  0.08, 0.5, 0.4, 0.86, 0.05,
];

// 18 Cadastral Parcels along the RoW
const PARCELS = Array.from({ length: 18 }, (_, i) => {
  const coord = ALIGNMENT[Math.min(i, ALIGNMENT.length - 1)];
  const risk = RISK_SET[i];
  const prob = PROBS[i];
  const pkgNum = Math.floor(i / 3) + 1;
  return {
    id: `PKG-${String(pkgNum).padStart(2, "0")}-PAR-${100 + i + 1}`,
    khasra: `Khasra #${214 + i * 37}${i % 3 === 0 ? "/1A" : ""}`,
    khatauni: `KH-${4000 + i * 19}`,
    village: PLACES[i][0],
    district: PLACES[i][1],
    chainage: `km ${PLACES[i][2]}`,
    pkg: `Package ${pkgNum}`,
    center: coord,
    risk: risk,
    delayProb: prob,
    delayDays: Math.round(prob * 100),
    area: `${(1.1 + (i % 7) * 0.37).toFixed(2)} Hectares`,
    landType:
      i % 4 === 0
        ? "Private Agricultural"
        : i % 4 === 1
          ? "Commercial Fringe"
          : "Gram Sabha Common Land",
    khatedar: `Khatedar Group #${10 + i} (Succession Review)`,
    affectedFamilies: 8 + (i % 9) * 4,
    disbursedPct: risk === "LOW" ? 95 : 35 + ((i * 7) % 45),
    amountLocked:
      risk === "LOW" ? "₹0 Cr" : `₹${(1.2 + i * 0.45).toFixed(2)} Cr`,
    courtStay:
      risk === "CRITICAL"
        ? "Active Section 3H Court Injunction"
        : "No Injunction Recorded",
    statute:
      risk === "CRITICAL"
        ? "Section 3H Escrow / Reference Bench"
        : risk === "MODERATE"
          ? "Section 3G Determination"
          : "Section 3E Physical Possession",
    bottleneck:
      risk === "CRITICAL"
        ? "Contested Solatium Multiplier under Sec 3H"
        : risk === "MODERATE"
          ? "Heir Succession Mutation Stalled"
          : "Demarcation Cleared for EPC works",
  };
});

// Helper component to center map smoothly
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 11, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function GisCorridorModal({ isOpen, onClose }) {
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [selectedPkg, setSelectedPkg] = useState("ALL");
  const [selectedParcel, setSelectedParcel] = useState(PARCELS[0]);
  const [mapCenter, setMapCenter] = useState([26.25, 82.35]);
  const [mapZoom, setMapZoom] = useState(9);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter parcels
  const filteredParcels = PARCELS.filter((p) => {
    const matchRisk = filterRisk === "ALL" ? true : p.risk === filterRisk;
    const matchPkg = selectedPkg === "ALL" ? true : p.pkg === selectedPkg;
    return matchRisk && matchPkg;
  });

  const criticalCount = PARCELS.filter((p) => p.risk === "CRITICAL").length;
  const moderateCount = PARCELS.filter((p) => p.risk === "MODERATE").length;
  const clearedCount = PARCELS.filter((p) => p.risk === "LOW").length;

  const handleParcelClick = (p) => {
    setSelectedParcel(p);
    setMapCenter(p.center);
    setMapZoom(13);
  };

  const handlePackageZoom = (pkgName) => {
    setSelectedPkg(pkgName);
    if (pkgName === "ALL") {
      setMapCenter([26.25, 82.35]);
      setMapZoom(9);
    } else {
      const pkgParcels = PARCELS.filter((p) => p.pkg === pkgName);
      if (pkgParcels.length > 0) {
        setMapCenter(pkgParcels[0].center);
        setMapZoom(12);
        setSelectedParcel(pkgParcels[0]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        className={`w-full ${
          isFullScreen ? "h-[98vh] max-w-none" : "max-w-7xl h-[90vh]"
        } bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all duration-200`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm shadow-md">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Point 7: GIS Corridor &amp; Cadastral Parcel Explorer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  340.8 km &bull; 120m RoW &bull; 18 Strips
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Purvanchal Expressway Corridor &bull; Multi-tier Zoom: Macro
                Alignment &rarr; Package Bounds &rarr; Khasra Strips
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              title="Close GIS Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & KPI Stats */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Total RoW:</span>
              <span className="font-bold text-white">18 Parcels</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/40 text-red-300 border border-red-800/40">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
              <span>{criticalCount} Critical</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/40">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{moderateCount} Moderate</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{clearedCount} Cleared</span>
            </div>
          </div>

          {/* Risk Filters & Package Chooser */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {["ALL", "CRITICAL", "MODERATE", "LOW"].map((rk) => (
                <button
                  key={rk}
                  onClick={() => setFilterRisk(rk)}
                  className={`px-2 py-1 rounded-md font-semibold transition ${
                    filterRisk === rk
                      ? rk === "CRITICAL"
                        ? "bg-red-600 text-white"
                        : rk === "MODERATE"
                          ? "bg-amber-600 text-white"
                          : rk === "LOW"
                            ? "bg-emerald-600 text-white"
                            : "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {rk === "ALL" ? "All Risk" : rk}
                </button>
              ))}
            </div>

            <select
              value={selectedPkg}
              onChange={(e) => handlePackageZoom(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer"
            >
              <option value="ALL">Corridor: All 8 Packages</option>
              {Array.from({ length: 6 }, (_, i) => (
                <option key={i + 1} value={`Package ${i + 1}`}>
                  Package {i + 1} (Chainage km {i * 50} - {(i + 1) * 50})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Area: Map + Side Inspector */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Map View Frame */}
          <div className="lg:col-span-8 relative h-full w-full bg-slate-950">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <MapViewController center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* 340.8 km Macro Expressway Line */}
              <Polyline
                positions={ALIGNMENT}
                pathOptions={{
                  color: "#38bdf8",
                  weight: 5,
                  opacity: 0.85,
                  dashArray: "8, 6",
                }}
              />

              {/* Cadastral RoW Strip Circles */}
              {filteredParcels.map((p) => {
                const isSelected = selectedParcel && selectedParcel.id === p.id;
                const markerColor =
                  p.risk === "CRITICAL"
                    ? "#ef4444"
                    : p.risk === "MODERATE"
                      ? "#f59e0b"
                      : "#10b981";

                return (
                  <CircleMarker
                    key={p.id}
                    center={p.center}
                    radius={isSelected ? 11 : 8}
                    pathOptions={{
                      fillColor: markerColor,
                      color: isSelected ? "#ffffff" : markerColor,
                      weight: isSelected ? 3 : 1.5,
                      fillOpacity: 0.9,
                    }}
                    eventHandlers={{
                      click: () => handleParcelClick(p),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                      <div className="text-xs p-1">
                        <strong className="text-sky-300 block">
                          {p.khasra}
                        </strong>
                        <span>
                          {p.village}, {p.district} ({p.chainage})
                        </span>
                        <div
                          className="mt-1 font-bold"
                          style={{ color: markerColor }}
                        >
                          {p.risk} Risk &bull; +{p.delayDays} Days
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Floating Map Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-xl text-xs space-y-1.5">
              <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>Purvanchal 340.8 km RoW</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span>Critical Injunction (&gt;65% prob)</span>
              </div>
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Moderate Valuation (30-65% prob)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Cleared &bull; Possession Delivered</span>
              </div>
            </div>
          </div>

          {/* Side Cadastral Inspector Panel */}
          <div className="lg:col-span-4 h-full bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
            {selectedParcel ? (
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      {selectedParcel.pkg} &bull; {selectedParcel.chainage}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                        selectedParcel.risk === "CRITICAL"
                          ? "bg-red-500/20 text-red-300 border-red-500/40"
                          : selectedParcel.risk === "MODERATE"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {selectedParcel.risk} RISK &bull; +
                      {selectedParcel.delayDays} DAYS
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    {selectedParcel.khasra}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedParcel.village}, {selectedParcel.district} District
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {selectedParcel.khatauni} &bull; ID: {selectedParcel.id}
                  </div>
                </div>

                {/* Primary Delay Metrics */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">
                      ML Predicted Delay Horizon
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-400">
                        +{selectedParcel.delayDays}
                      </span>
                      <span className="text-xs text-slate-400 font-mono ml-1">
                        Days
                      </span>
                    </div>
                  </div>

                  {/* Primary Bottleneck */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      Primary Statutory Bottleneck
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-950/60 text-red-300 border border-red-800/40">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{selectedParcel.bottleneck}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Revenue Specs */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                    <span className="text-slate-400">Statutory Milestone:</span>
                    <span className="font-semibold text-white">
                      {selectedParcel.statute}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                    <span className="text-slate-400">Land Classification:</span>
                    <span className="font-semibold text-slate-200">
                      {selectedParcel.landType}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                    <span className="text-slate-400">
                      Acquisition Footprint:
                    </span>
                    <span className="font-mono text-slate-200">
                      {selectedParcel.area} ({selectedParcel.affectedFamilies}{" "}
                      families)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                    <span className="text-slate-400">
                      Compensation Disbursed:
                    </span>
                    <span className="font-mono font-bold text-sky-400">
                      {selectedParcel.disbursedPct}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-300">
                    <span className="text-slate-400">
                      Funds in Court Escrow:
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {selectedParcel.amountLocked}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span className="text-slate-400">
                      Judicial Stay Status:
                    </span>
                    <span
                      className={`font-semibold ${
                        selectedParcel.risk === "CRITICAL"
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {selectedParcel.courtStay}
                    </span>
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="pt-2">
                  <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>
                      Statutory vesting under{" "}
                      <strong>NH Act Section 3D(2)</strong> is legally complete.
                      Escrow deposits under Section 3H(4) allow immediate
                      physical carriageway civil works.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-3">
                <MapPin className="w-10 h-10 text-slate-600 stroke-[1.5]" />
                <h4 className="font-bold text-slate-200 text-sm">
                  Select Any RoW Parcel
                </h4>
                <p className="text-xs text-slate-500">
                  Click on any parcel along the 340.8 km corridor to inspect
                  cadastral Khasra attributes, statutory milestone status, and
                  ML delay horizon.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
              Purvanchal Alignment Datum &bull; WGS84 EPSG:4326 &bull; MoRTH GIS
              Node
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
