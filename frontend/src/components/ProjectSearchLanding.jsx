import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Landmark,
  Globe2,
  Compass,
  ArrowRight,
  Database,
  Sparkles,
  FileCheck2,
  ShieldAlert,
  Clock,
  ChevronRight,
  Loader2,
  TrendingUp,
  MapPin,
} from "lucide-react";

export default function ProjectSearchLanding({ onProjectSelected }) {
  const [projectName, setProjectName] = useState("");
  const [agency, setAgency] = useState("");
  const [ministry, setMinistry] = useState("");
  const [governmentType, setGovernmentType] = useState("Central / Union Gov");

  const [options, setOptions] = useState({
    projects: [],
    agencies: [],
    ministries: [],
    government_types: ["Central / Union Gov", "State Gov", "Joint Venture"],
  });

  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanningStep, setScanningStep] = useState(0);
  const [error, setError] = useState(null);

  // Fetch search options on mount
  useEffect(() => {
    fetch("/api/v1/projects/search-options")
      .then((res) => res.json())
      .then((data) => {
        setOptions(data);
        if (data.agencies?.length > 0 && !agency) setAgency(data.agencies[0]);
        if (data.ministries?.length > 0 && !ministry)
          setMinistry(data.ministries[0]);
      })
      .catch((err) => console.error("Error fetching search options:", err));
  }, []);

  // Filter autocomplete suggestions
  useEffect(() => {
    if (!projectName.trim()) {
      setAutocompleteSuggestions([]);
      return;
    }
    const filtered = (options.projects || []).filter((p) =>
      p.toLowerCase().includes(projectName.toLowerCase()),
    );
    setAutocompleteSuggestions(filtered.slice(0, 6));
  }, [projectName, options.projects]);

  const featuredProjects = [
    {
      name: "Purvanchal Expressway",
      agency: "UPEIDA",
      ministry: "Dept of Infrastructure & Industrial Development (Govt of UP)",
      type: "State Gov",
      corridor: "Lucknow - Ghazipur (340.8 km)",
      badge: "High Priority",
    },
    {
      name: "Delhi-Amritsar-Katra Expressway (Jalandhar Spur NH-NE5A)",
      agency: "NHAI",
      ministry: "Ministry of Road Transport and Highways (MoRTH)",
      type: "Central Gov",
      corridor: "Delhi - Katra Corridor (670 km)",
      badge: "National Corridor",
    },
    {
      name: "Ganga Expressway",
      agency: "UPEIDA",
      ministry: "Dept of Infrastructure & Industrial Development (Govt of UP)",
      type: "State Gov",
      corridor: "Meerut - Prayagraj (594 km)",
      badge: "Mega Project",
    },
    {
      name: "Bengaluru Suburban Railway Project (BSRP)",
      agency: "K-RIDE",
      ministry:
        "Ministry of Railways & Infrastructure Dev Dept (Govt of Karnataka)",
      type: "Joint Venture",
      corridor: "Corridor 2: Mallige Line (148.1 km)",
      badge: "Urban Transit",
    },
    {
      name: "Delhi-Ghaziabad-Meerut RRTS Corridor (Namo Bharat)",
      agency: "NCRTC",
      ministry: "Ministry of Housing and Urban Affairs (MoHUA)",
      type: "Central Gov",
      corridor: "Sarai Kale Khan - Modipuram (82.1 km)",
      badge: "High Speed Rail",
    },
    {
      name: "Kochi Metro Rail Project Phase 1 (Aluva to Petta)",
      agency: "KMRL",
      ministry: "Ministry of Housing and Urban Affairs (MoHUA)",
      type: "Joint Venture",
      corridor: "Aluva to Petta (28.1 km)",
      badge: "Metro Rail",
    },
  ];

  const handleSelectFeatured = (proj) => {
    setProjectName(proj.name);
    setAgency(proj.agency);
    setMinistry(proj.ministry);
    setGovernmentType(
      proj.type === "Joint Venture"
        ? "Joint Venture"
        : proj.type === "State Gov"
          ? "State Gov"
          : "Central / Union Gov",
    );
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!projectName.trim()) {
      setError("Please enter or select a project name to analyze.");
      return;
    }

    setError(null);
    setAnalyzing(true);
    setScanningStep(1);

    // Visual scanning stepper animation
    setTimeout(() => setScanningStep(2), 300);
    setTimeout(() => setScanningStep(3), 600);

    try {
      const res = await fetch("/api/v1/projects/parse-and-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName.trim(),
          agency: agency || "NHAI",
          ministry:
            ministry || "Ministry of Road Transport and Highways (MoRTH)",
          government_type: governmentType || "Central / Union Gov",
        }),
      });

      if (!res.ok) {
        throw new Error(`Inference error: ${res.statusText}`);
      }

      const payload = await res.json();
      setTimeout(() => {
        setAnalyzing(false);
        onProjectSelected(payload);
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to analyze project. Please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-4 tracking-wide uppercase shadow-sm">
            <Compass className="w-3.5 h-3.5" />
            PM GatiShakti National Infrastructure Gateway
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Statutory Land Acquisition <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Delay Intelligence & Predictive ML
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Decoupled Machine Learning Engine reading directly from Central
            Database. Instant inference, NH Act statutory lifecycle progression,
            risk stratification, and prescriptive legal actions.
          </p>
        </div>

        {/* Main Search Gateway Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/30 backdrop-blur-xl mb-12">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Field 1: Project Name (Autocomplete) */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                1. Project Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="e.g. Purvanchal Expressway, Delhi-Amritsar-Katra Expressway, Ganga Expressway..."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
                {autocompleteSuggestions.length > 0 && showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
                    {autocompleteSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setProjectName(item);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-blue-600/20 hover:text-white flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium truncate">{item}</span>
                        <span className="text-[10px] text-slate-500">
                          Central DB
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fields 2, 3, 4: Agency, Ministry, Gov Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Field 2: Agency */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  2. Executing Agency
                </label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                >
                  {(
                    options.agencies || [
                      "NHAI",
                      "UPEIDA",
                      "DFCCIL",
                      "K-RIDE",
                      "PGCIL",
                      "KMRL",
                      "NCRTC",
                      "UPMRC",
                    ]
                  ).map((ag) => (
                    <option key={ag} value={ag}>
                      {ag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Ministry */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  3. Government Ministry
                </label>
                <select
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer truncate"
                >
                  {(
                    options.ministries || [
                      "Ministry of Road Transport and Highways (MoRTH)",
                      "Dept of Infrastructure & Industrial Development (Govt of UP)",
                      "Ministry of Railways",
                      "Ministry of Housing and Urban Affairs (MoHUA)",
                      "Ministry of Power",
                    ]
                  ).map((min) => (
                    <option key={min} value={min}>
                      {min}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: Government Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-amber-400" />
                  4. Government Level
                </label>
                <select
                  value={governmentType}
                  onChange={(e) => setGovernmentType(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Central / Union Gov">
                    Central / Union Gov
                  </option>
                  <option value="State Gov">State Gov</option>
                  <option value="Joint Venture">Joint Venture</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submission Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3 text-base disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Project via Central Database...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Project Risk & Delay Analysis</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Real-Time Processing Stepper */}
          {analyzing && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div
                  className={`p-3 rounded-lg border transition-all ${scanningStep >= 1 ? "bg-blue-500/10 border-blue-500/30 text-blue-300" : "bg-slate-950 border-slate-800 text-slate-600"}`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Central DB Lookup</span>
                  </div>
                  <p className="text-[10px] opacity-80">
                    Querying pre-extracted 43 statutory parameters (sub-15ms)...
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg border transition-all ${scanningStep >= 2 ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-600"}`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ensemble ML Inference</span>
                  </div>
                  <p className="text-[10px] opacity-80">
                    Running XGBoost + LightGBM soft-voting ensemble...
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg border transition-all ${scanningStep >= 3 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-slate-950 border-slate-800 text-slate-600"}`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>XAI & 7 Analytics Cards</span>
                  </div>
                  <p className="text-[10px] opacity-80">
                    Generating TreeSHAP waterfall & statutory SOPs...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick-Select Featured Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Featured Strategic Projects (1-Click Analysis)
            </h2>
            <span className="text-[11px] text-slate-500">
              Verified Central Repository
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProjects.map((p, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectFeatured(p)}
                className="group p-4 bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/90 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold">
                      {p.agency} &bull; {p.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {p.corridor}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-blue-300">
                  <span>Populate Search Form</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer System Banner */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-6 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>PM GatiShakti National Master Plan (NMP)</span>
          <span className="hidden sm:inline">&bull;</span>
          <span>
            RFCTLARR Act 2013 &amp; National Highways Act 1956 Statutory
            Framework
          </span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="text-emerald-400 font-mono">
            Central Database Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
