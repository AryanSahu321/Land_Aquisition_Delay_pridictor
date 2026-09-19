import React, { useState } from "react";
import ProjectSearchLanding from "./components/ProjectSearchLanding";
import ProjectResultsView from "./components/ProjectResultsView";
import { Compass, ArrowLeft, Database, ShieldCheck } from "lucide-react";

export default function App() {
  const [view, setView] = useState("search"); // 'search' | 'results'
  const [selectedProjectData, setSelectedProjectData] = useState(null);

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

          {/* Right Action: Back to Search if in Results view */}
          <div className="flex items-center gap-3">
            {view === "results" ? (
              <button
                onClick={handleBackToSearch}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Search</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Central Database Ready</span>
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
    </div>
  );
}
