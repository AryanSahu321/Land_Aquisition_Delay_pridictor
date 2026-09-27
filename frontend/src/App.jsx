import React, { useState } from "react";
import ProjectSearchLanding from "./components/ProjectSearchLanding";
import ProjectResultsView from "./components/ProjectResultsView";
import ApiGatewayModal from "./components/ApiGatewayModal";
import GisCorridorModal from "./components/GisCorridorModal";
import RoleRbacModal from "./components/RoleRbacModal";
import { Compass, ArrowLeft, Database, ShieldCheck, Zap, Layers, Scale } from "lucide-react";

export default function App() {
  const [view, setView] = useState("search"); // 'search' | 'results'
  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const [isApiGatewayOpen, setIsApiGatewayOpen] = useState(false);
  const [isGisModalOpen, setIsGisModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const handleProjectSelected = (data) => {
    setSelectedProjectData(data);
    setView("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToSearch = () => {
    setView("search");
    setSelectedProjectData(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600">
      {/* Top Global Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 shadow-lg">
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
                  NHAI &bull; CALA &bull; MoRTH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Statutory Land Acquisition Intelligence &amp; Decision Support
                System
              </p>
            </div>
          </div>

          {/* Right Action: Interactive Prototypes + API Gateway Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Point 7: Interactive GIS Corridor Prototype Trigger */}
            <button
              onClick={() => setIsGisModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition hover:border-sky-500/50 cursor-pointer"
              title="Point 7: GIS Corridor & Cadastral Mapping Prototype"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">GIS Corridor</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Point 7
              </span>
            </button>

            {/* Points 8, 9, 12: Statutory Role RBAC & e-Sign Prototype Trigger */}
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition hover:border-emerald-500/50 cursor-pointer"
              title="Points 8, 9, 12: Statutory Role-Based Access, Alerts & e-Sign Prototype"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Role RBAC</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                8, 9, 12
              </span>
            </button>

            {/* Global Point 11 API Gateway Trigger */}
            <button
              onClick={() => setIsApiGatewayOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition hover:border-indigo-500/50 cursor-pointer"
              title="Point 11: Government & Developer API Integration Gateway"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">API Gateway</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Point 11
              </span>
            </button>

            {view === "results" ? (
              <button
                onClick={handleBackToSearch}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Search</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Central DB Ready</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {view === "search" ? (
          <ProjectSearchLanding onProjectSelected={handleProjectSelected} />
        ) : (
          <ProjectResultsView
            projectData={selectedProjectData}
            onBackToSearch={handleBackToSearch}
          />
        )}
      </main>

      {/* Point 7: Interactive GIS Corridor & Cadastral Mapping Modal */}
      <GisCorridorModal
        isOpen={isGisModalOpen}
        onClose={() => setIsGisModalOpen(false)}
      />

      {/* Points 8, 9, 12: Statutory Role RBAC, Autonomous Alerts & e-Sign Modal */}
      <RoleRbacModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Point 11: Developer & Government API Gateway Modal */}
      <ApiGatewayModal
        isOpen={isApiGatewayOpen}
        onClose={() => setIsApiGatewayOpen(false)}
      />
    </div>
  );
}

