import React from "react";
import {
  ShieldAlert,
  Clock,
  TrendingUp,
  FileText,
  AlertTriangle,
  Scale,
  LandPlot,
  Users,
  CheckCircle2,
  Building2,
  Flame,
  ArrowRight,
  Compass,
  Sliders,
  Sparkles,
} from "lucide-react";

const ROLES = [
  "Project Director (NHAI)",
  "Competent Authority Land Acquisition (CALA) / SLAO",
  "District Magistrate",
];

export default function Dashboard({
  stats,
  currentRole,
  onRoleChange,
  onOpenTestModal,
  onSelectParcelFromCorridor,
}) {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
        <p>Loading Statutory Intelligence Analytics...</p>
      </div>
    );
  }

  const { summary, role_focus, stage_breakdown, district_breakdown } = stats;

  return (
    <div className="space-y-6">
      {/* Top Header & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow-xl backdrop-blur">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wide uppercase">
              RFCTLARR 2013 &bull; NH Act 1956 Compliant
            </span>
            <span className="text-xs text-slate-400">
              Package 3 (km 14+000 - 78+000)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>PM GatiShakti National Portal</span>
            <span className="text-blue-400 font-mono text-base font-normal">
              | Land Acquisition Decision Support
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Prayagraj &ndash; Varanasi Expressway RoW Corridor Intelligence
            Engine
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-700/80">
          <div className="text-right">
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              Administrative Lens
            </span>
            <span className="text-xs font-semibold text-blue-300">
              Switch Governance Role
            </span>
          </div>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-slate-800 hover:bg-slate-750 text-white font-medium text-sm px-3.5 py-2 rounded-md border border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            {ROLES.map((role) => (
              <option
                key={role}
                value={role}
                className="bg-slate-900 text-white"
              >
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role-Specific Lens Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/50 p-5 rounded-xl border border-blue-800/40 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              <h2 className="text-lg font-semibold text-blue-200">
                {role_focus?.title}
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Objective:{" "}
              <span className="text-white">
                {role_focus?.primary_objective}
              </span>
            </p>
            <div className="text-xs text-amber-200 bg-amber-950/40 border border-amber-600/30 px-3 py-1.5 rounded-md mt-2 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Priority Statutory Action:</strong>{" "}
                {role_focus?.top_action}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenTestModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md transition shadow-blue-500/20 hover:scale-[1.02]"
            >
              <Sliders className="w-4 h-4" />
              <span>Test a Parcel (Live ML)</span>
            </button>
          </div>
        </div>

        {/* Role KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          {role_focus?.critical_kpis?.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 p-3 rounded-lg border border-slate-800"
            >
              <span className="text-[11px] text-slate-400 uppercase tracking-wide block">
                {kpi.label}
              </span>
              <span
                className={`text-base font-bold mt-0.5 block ${
                  kpi.status === "critical"
                    ? "text-red-400"
                    : kpi.status === "alert"
                      ? "text-amber-400"
                      : kpi.status === "positive"
                        ? "text-emerald-400"
                        : kpi.status === "warning"
                          ? "text-yellow-400"
                          : "text-blue-300"
                }`}
              >
                {kpi.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Milestone Lifecycle Funnel (NH Act 1956) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <LandPlot className="w-4 h-4 text-blue-400" />
            <span>NH Act 1956 Statutory Lifecycle Progression</span>
          </h3>
          <span className="text-xs text-slate-400">
            Total: {summary?.total_parcels} parcels &bull;{" "}
            {summary?.total_area_hectares} ha
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stage_breakdown &&
            Object.entries(stage_breakdown).map(
              ([stageName, stageData], idx) => {
                const shortName =
                  stageName.split(" ")[0] + " " + stageName.split(" ")[1];
                const subTitle = stageName.includes("Notice of Intent")
                  ? "Survey & Objections"
                  : stageName.includes("Declaration")
                    ? "Vesting in Union"
                    : stageName.includes("Award")
                      ? "Compensation Determination"
                      : "Physical Possession";
                const isPossession = stageName.includes("3E");
                const isNotice = stageName.includes("3A");

                return (
                  <div
                    key={stageName}
                    className={`p-4 rounded-xl border transition relative overflow-hidden ${
                      isPossession
                        ? "bg-slate-900/90 border-emerald-500/40 hover:border-emerald-500/70"
                        : isNotice
                          ? "bg-slate-900/90 border-amber-500/40 hover:border-amber-500/70"
                          : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                        Step {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {stageData.count} Parcels
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="font-bold text-white text-sm">
                        {shortName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {subTitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block">
                          Acquired Area
                        </span>
                        <span className="font-semibold text-slate-200">
                          {stageData.area_ha} ha
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block">
                          Avg Slippage
                        </span>
                        <span
                          className={`font-semibold ${stageData.avg_delay > 60 ? "text-red-400" : stageData.avg_delay > 30 ? "text-amber-400" : "text-emerald-400"}`}
                        >
                          +{stageData.avg_delay} d
                        </span>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
        </div>
      </div>

      {/* Executive Key Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium tracking-wide">
              Avg Timeline Delay
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              +{summary?.avg_predicted_delay_days}
            </span>
            <span className="text-xs text-slate-400 font-mono">Days</span>
          </div>
          <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Weighted across packages
          </span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium tracking-wide">
              Compensation Disbursed
            </span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary?.compensation_disbursed_pct}%
            </span>
            <span className="text-xs text-slate-400 font-mono">PFMS</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${summary?.compensation_disbursed_pct || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium tracking-wide">
              Civil Injunctions
            </span>
            <Scale className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary?.pending_court_injunctions}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Active Stays
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-red-400">
              {summary?.unmitigated_court_stays} unescrowed
            </span>
            <span className="text-emerald-400">
              {summary?.escrowed_court_stays} Sec 3H safe
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-medium tracking-wide">
              JMS Survey Done
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {summary?.jms_completed_pct}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Boundary Demarcated
            </span>
          </div>
          <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            DGPS / Drone Verified
          </span>
        </div>
      </div>

      {/* Risk Distribution Breakdown */}
      <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 shadow">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Predictive Risk Stratification across Corridor
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-emerald-950/30 border border-emerald-600/30 p-3 rounded-lg">
            <div className="text-xs text-emerald-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Low Risk (&lt;30% prob)
            </div>
            <div className="text-2xl font-bold text-white">
              {summary?.risk_distribution?.Low || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Parcels on Track
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-600/30 p-3 rounded-lg">
            <div className="text-xs text-amber-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Moderate Risk (30-65%)
            </div>
            <div className="text-2xl font-bold text-white">
              {summary?.risk_distribution?.Medium || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Under Administrative Watch
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-600/30 p-3 rounded-lg">
            <div className="text-xs text-red-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              Critical Risk (&gt;65% prob)
            </div>
            <div className="text-2xl font-bold text-white">
              {summary?.risk_distribution?.High || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Direct Corridor Blockers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
