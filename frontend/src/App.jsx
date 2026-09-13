import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import CorridorMap from "./components/CorridorMap";
import SimulationDrawer from "./components/SimulationDrawer";
import TestParcelModal from "./components/TestParcelModal";
import {
  Compass,
  Layers,
  Sliders,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MapPin,
} from "lucide-react";

export default function App() {
  const [role, setRole] = useState("Project Director (NHAI)");
  const [stats, setStats] = useState(null);
  const [corridorGeojson, setCorridorGeojson] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simulationParcel, setSimulationParcel] = useState(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' or 'corridor'
  const [loading, setLoading] = useState(true);

  // Load executive stats based on active role
  const fetchStats = (currentRole) => {
    fetch(`/api/v1/stats?role=${encodeURIComponent(currentRole)}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.error("Stats load error:", err));
  };

  // Load corridor GeoJSON
  const fetchCorridor = () => {
    fetch("/api/v1/corridor/geojson")
      .then((res) => res.json())
      .then((data) => {
        setCorridorGeojson(data);
        if (data?.features?.length > 0 && !selectedParcel) {
          setSelectedParcel(data.features[0].properties);
        }
      })
      .catch((err) => console.error("Corridor load error:", err));
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/v1/stats?role=${encodeURIComponent(role)}`).then((r) =>
        r.json(),
      ),
      fetch("/api/v1/corridor/geojson").then((r) => r.json()),
    ])
      .then(([statsData, corridorData]) => {
        setStats(statsData);
        setCorridorGeojson(corridorData);
        if (corridorData?.features?.length > 0) {
          // Default select the first parcel with highest risk or first in chainage
          const highRisk = corridorData.features.find(
            (f) => f.properties.risk_category === "High",
          );
          setSelectedParcel(
            highRisk
              ? highRisk.properties
              : corridorData.features[0].properties,
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Initial load error:", err);
        setLoading(false);
      });
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    fetchStats(newRole);
  };

  const handleOpenSimulation = (parcel) => {
    setSimulationParcel(parcel);
    setSimulationOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600">
      {/* Top Global Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  GatiShakti AI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  NHAI &bull; CALA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Statutory Land Acquisition Risk Intelligence
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Executive View
            </button>
            <button
              onClick={() => setActiveTab("corridor")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "corridor"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              GIS Corridor
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTestModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Test Parcel</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-600/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ML Service Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-sm">
              Connecting to GatiShakti Statutory Intelligence Pipeline...
            </p>
          </div>
        ) : (
          <>
            {/* View Tab 1: Executive Dashboard with Overview */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <Dashboard
                  stats={stats}
                  currentRole={role}
                  onRoleChange={handleRoleChange}
                  onOpenTestModal={() => setTestModalOpen(true)}
                  onSelectParcelFromCorridor={(parcel) => {
                    setSelectedParcel(parcel);
                    setActiveTab("corridor");
                  }}
                />

                {/* Embedded GIS Corridor Section */}
                <div className="pt-2">
                  <CorridorMap
                    corridorData={corridorGeojson}
                    selectedParcel={selectedParcel}
                    onSelectParcel={setSelectedParcel}
                    onOpenSimulation={handleOpenSimulation}
                  />
                </div>
              </div>
            )}

            {/* View Tab 2: Dedicated Full GIS Corridor View */}
            {activeTab === "corridor" && (
              <div className="space-y-6">
                <CorridorMap
                  corridorData={corridorGeojson}
                  selectedParcel={selectedParcel}
                  onSelectParcel={setSelectedParcel}
                  onOpenSimulation={handleOpenSimulation}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Evaluator "What-If" Simulation & XAI Drawer */}
      <SimulationDrawer
        isOpen={simulationOpen}
        onClose={() => setSimulationOpen(false)}
        parcel={simulationParcel}
      />

      {/* Evaluator Live Inference "Test a Parcel" Modal */}
      <TestParcelModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        onInspectExplanation={(testParcel) => {
          handleOpenSimulation(testParcel);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Ministry of Road Transport & Highways &bull; National Highways
            Authority of India (NHAI)
          </span>
          <span className="font-mono text-slate-400">
            RFCTLARR Act 2013 &bull; NH Act 1956 Sections 3A-3E
          </span>
        </div>
      </footer>
    </div>
  );
}
