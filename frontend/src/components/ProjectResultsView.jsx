import React, { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Landmark,
  Globe2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Scale,
  ShieldCheck,
  FileText,
  MapPin,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Database,
  Send,
  Check,
  Info,
  Car,
  Globe,
  Server,
  Zap,
  Cpu,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import CorridorMap from "./CorridorMap";
import ApiGatewayModal from "./ApiGatewayModal";

export default function ProjectResultsView({ projectData, onBackToSearch }) {
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [feedbackStage, setFeedbackStage] = useState(
    projectData?.lifecycle_stages?.find((s) => s.is_current)?.stage_id ||
      "Section_3D/19_Declaration",
  );
  const [actualDays, setActualDays] = useState(
    projectData?.kpis?.actual_delay_days || 45,
  );
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  if (!projectData) return null;

  const {
    project,
    lifecycle_stages,
    kpis,
    statutory_liquidation,
    risk_stratification,
    package_breakdown,
    survival_curve,
    gis_corridor,
    xai_explanation,
    database_audit,
  } = projectData;

  const statLiq = statutory_liquidation || {
    is_physically_operational: true,
    civil_work_progress_pct: 100.0,
    physical_status: "100% Commissioned & Open to Traffic",
    physical_note:
      "Physical highway civil construction completed and operational under NH Act Section 3D(2) absolute vesting. Land disputes do not halt physical vehicular movement.",
    historical_escrow_delay_days: 1226,
    predicted_clearance_days: kpis?.predicted_delay_days || 158,
    predicted_clearance_window: "+98 to +158 Days",
    total_case_free_horizon_days: 1226 + (kpis?.predicted_delay_days || 158),
    pending_court_injunctions: kpis?.pending_court_injunctions || 14,
    escrow_amount_locked_cr: 412.5,
    statutory_reference_legal_rule:
      "Section 3D(2) vests land in Union for physical works; Section 3H(4) confines disputes to Court Escrow without stopping traffic.",
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    try {
      const res = await fetch("/api/v1/ml/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: project.project_id,
          statutory_stage: feedbackStage,
          actual_delay_days: parseInt(actualDays, 10),
          notes: feedbackNotes,
        }),
      });
      if (res.ok) {
        setFeedbackSuccess(true);
        setTimeout(() => setFeedbackSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // ECharts Option for Card 4: Comparative Package Delay Breakdown
  const packageChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      textStyle: { color: "#f8fafc", fontSize: 12 },
    },
    legend: {
      data: [
        "Legal Disputes (stays)",
        "Compensation Lag",
        "Title & Succession Defects",
        "Forest / Environmental",
      ],
      textStyle: { color: "#94a3b8", fontSize: 11 },
      top: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "14%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: (package_breakdown || []).map((p) => p.package_name),
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { color: "#cbd5e1", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "Delay Days",
      nameTextStyle: { color: "#64748b", fontSize: 10 },
      splitLine: { lineStyle: { color: "#1e293b" } },
      axisLabel: { color: "#94a3b8", fontSize: 10 },
    },
    series: [
      {
        name: "Legal Disputes (stays)",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#ef4444" },
        data: (package_breakdown || []).map((p) => p.legal_disputes_days),
      },
      {
        name: "Compensation Lag",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#f59e0b" },
        data: (package_breakdown || []).map((p) => p.compensation_lag_days),
      },
      {
        name: "Title & Succession Defects",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#38bdf8" },
        data: (package_breakdown || []).map((p) => p.missing_titles_days),
      },
      {
        name: "Forest / Environmental",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#10b981" },
        data: (package_breakdown || []).map((p) => p.environmental_forest_days),
      },
    ],
  };

  // ECharts Option for Card 5: Statutory Clearance Survival Curve S(t)
  const survivalChartOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const p = params[0];
        return `<b>Month ${p.name}</b><br/>Survival Probability S(t): ${(p.value * 100).toFixed(1)}%<br/>Dispute Clearance: ${((1 - p.value) * 100).toFixed(1)}%`;
      },
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      textStyle: { color: "#f8fafc", fontSize: 12 },
    },
    grid: {
      left: "4%",
      right: "4%",
      bottom: "6%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      name: "Months Elapsed (t)",
      nameLocation: "middle",
      nameGap: 24,
      nameTextStyle: { color: "#64748b", fontSize: 11 },
      data: (
        survival_curve?.timeline_months || [0, 3, 6, 9, 12, 18, 24, 30, 36]
      ).map(String),
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { color: "#cbd5e1", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      name: "Survival Probability S(t)",
      min: 0,
      max: 1.0,
      splitLine: { lineStyle: { color: "#1e293b" } },
      axisLabel: {
        color: "#94a3b8",
        formatter: (val) => `${(val * 100).toFixed(0)}%`,
      },
    },
    series: [
      {
        name: "Survival S(t)",
        type: "line",
        smooth: true,
        data: survival_curve?.survival_probability || [],
        lineStyle: { width: 3, color: "#6366f1" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(99, 102, 241, 0.45)" },
              { offset: 1, color: "rgba(99, 102, 241, 0.0)" },
            ],
          },
        },
        markLine: {
          symbol: "none",
          data: [
            {
              yAxis: 0.5,
              lineStyle: { type: "dashed", color: "#f59e0b" },
              label: {
                formatter: `Median Clearance: ${survival_curve?.median_clearance_months || 14} mos`,
                color: "#f59e0b",
                position: "insideEndTop",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600">
      {/* Top Sticky Project Overview Banner */}
      <div className="sticky top-16 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToSearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Search</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {project.project_name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {project.agency} &bull; {project.government_type}
                </span>
                {/* Dual-Track Quick Badges */}
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Civil: {statLiq.physical_status}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Scale className="w-3 h-3 text-amber-400" />
                  Legal: {statLiq.pending_court_injunctions} Escrow Stays
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {project.ministry} &bull; {project.corridor} ({project.total_km}{" "}
                km)
              </p>
            </div>
          </div>

          {/* Central DB Audit Tag */}
          <div className="flex items-center gap-2 text-[11px] bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Database Engine:</span>
            <span className="text-emerald-300 font-mono font-medium">
              Zero PDF Parsing Latency
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Query:</span>
            <span className="text-blue-300 font-mono">
              {database_audit?.query_latency_ms || 12}ms
            </span>
          </div>
        </div>
      </div>

      {/* Main Single-Scroll Stacked Cards Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* ================================================================= */}
        {/* DUAL-TRACK STATUTORY REALITY BANNER */}
        {/* ================================================================= */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mt-0.5">
                <Info className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    Infrastructure Reality Architecture
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <Car className="w-3 h-3 text-emerald-400" />
                    Physical Civil Status: {statLiq.physical_status}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                    <Scale className="w-3 h-3 text-amber-400" />
                    Statutory Legal Status: {
                      statLiq.pending_court_injunctions
                    }{" "}
                    Active Reference Stays (Sec 3H Escrow)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                  <span className="font-semibold text-emerald-300">
                    Vehicular traffic is moving at full capacity
                  </span>{" "}
                  because under{" "}
                  <span className="text-white font-mono font-semibold">
                    NH Act Section 3D(2)
                  </span>
                  , gazette notification vests land absolutely in the Central
                  Government free from all encumbrances. The system's predictive
                  delay model calculates the{" "}
                  <span className="font-semibold text-amber-300">
                    Statutory Legal Liquidation Horizon
                  </span>{" "}
                  (resolving title defects and disbursing court-held
                  compensation) to protect the exchequer from 9&ndash;15%
                  compounding penal interest.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Case-Free Horizon
                </div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  {statLiq.total_case_free_horizon_days}{" "}
                  <span className="text-xs text-slate-400 font-normal">
                    Days
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-[10px] text-slate-400 leading-tight">
                <div>
                  <span className="text-slate-200 font-mono">
                    {statLiq.historical_escrow_delay_days}d
                  </span>{" "}
                  in Escrow
                </div>
                <div>
                  <span className="text-emerald-400 font-mono">
                    +{statLiq.predicted_clearance_days}d
                  </span>{" "}
                  AI Residual
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ================================================================= */}
        {/* CARD 1: NH Act 1956 Statutory Lifecycle Progression */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>
                    NH Act 1956 / RFCTLARR 2013 Statutory Lifecycle Progression
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    7 Milestones
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Track statutory timeline boundaries, elapsed days, and Section
                  3D one-year lapsing threshold.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
            {(lifecycle_stages || []).map((stg, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  stg.is_current
                    ? "bg-blue-600/15 border-blue-500/60 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40"
                    : stg.status === "COMPLETED"
                      ? "bg-slate-950/60 border-slate-800/80"
                      : "bg-slate-950/30 border-slate-900 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      Step {idx + 1}
                    </span>
                    {stg.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : stg.is_current ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1 line-clamp-2">
                    {stg.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mb-3">
                    {stg.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Elapsed:</span>
                  <span
                    className={`font-mono font-bold ${stg.is_exceeded ? "text-red-400" : "text-slate-200"}`}
                  >
                    {stg.elapsed_days}d / {stg.statutory_limit_days}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 2: Executive Overview KPIs */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Executive Overview &amp; Statutory Key Performance Indicators
                </h2>
                <p className="text-[11px] text-slate-400">
                  Dual-track monitoring: Physical Civil Commissioning vs.
                  Statutory Reference Escrow Liquidation.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                NH Act § 3D(2) &amp; § 3H(4)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            {/* Tile 1: Civil Commissioning */}
            <div className="p-3.5 bg-slate-950/70 border border-emerald-500/30 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Civil Status
                  </span>
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-black text-emerald-300">
                  {statLiq.civil_work_progress_pct}% Done
                </div>
              </div>
              <p className="text-[10px] text-emerald-400/80 mt-2 font-medium">
                Open to Public Traffic
              </p>
            </div>

            {/* Tile 2: Historical Escrow Drag */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Escrow Stalling
                  </span>
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white">
                    {statLiq.historical_escrow_delay_days}
                  </span>
                  <span className="text-[10px] text-slate-400">days</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Stalled in District Court
              </p>
            </div>

            {/* Tile 3: AI Residual Clearance */}
            <div className="p-3.5 bg-slate-950/70 border border-amber-500/30 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    AI Clearance Horizon
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-amber-300">
                    +{statLiq.predicted_clearance_days}
                  </span>
                  <span className="text-[10px] text-slate-400">days</span>
                </div>
              </div>
              <p className="text-[10px] text-amber-400/80 mt-2">
                Window: {statLiq.predicted_clearance_window}
              </p>
            </div>

            {/* Tile 4: Total Case-Free Horizon */}
            <div className="p-3.5 bg-slate-950/70 border border-indigo-500/40 rounded-xl flex flex-col justify-between ring-1 ring-indigo-500/20">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-indigo-300">
                    Case-Free Horizon
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white">
                    {statLiq.total_case_free_horizon_days}
                  </span>
                  <span className="text-[10px] text-indigo-300">days</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {statLiq.historical_escrow_delay_days}d +{" "}
                {statLiq.predicted_clearance_days}d total
              </p>
            </div>

            {/* Tile 5: Escrow Funds Locked */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Escrow Locked
                  </span>
                  <Scale className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-white">
                    ₹{statLiq.escrow_amount_locked_cr}
                  </span>
                  <span className="text-[10px] text-slate-400">Cr</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                {kpis.compensation_disbursed_pct.toFixed(1)}% Disbursed
              </p>
            </div>

            {/* Tile 6: Active Court Stays */}
            <div className="p-3.5 bg-slate-950/70 border border-red-500/30 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Court Stays
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-red-400">
                    {statLiq.pending_court_injunctions}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    injunctions
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-red-300/80 mt-2">
                Sec 3H Reference Bench
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 3: Predictive Risk Stratification across Corridor */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Predictive Risk Stratification Across Corridor
                </h2>
                <p className="text-[11px] text-slate-400">
                  Classification model confidence, predicted risk band, and
                  corridor delay variance range.
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                risk_stratification.risk_category === "Critical"
                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                  : risk_stratification.risk_category === "Medium" ||
                      risk_stratification.risk_category === "Moderate"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {risk_stratification.risk_category} Risk Class
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            {/* Probability meter */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  Critical Delay Probability
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  {(risk_stratification.delay_probability * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-3">
                Model Confidence:{" "}
                <span className="text-blue-300 font-mono">
                  {(risk_stratification.confidence_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Expected delay range */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  95% Confidence Delay Horizon
                </span>
                <div className="text-2xl font-black text-white mt-1">
                  {risk_stratification.expected_delay_range[0]} &ndash;{" "}
                  {risk_stratification.expected_delay_range[1]} days
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-3">
                Variance bounded by Section 3H escrow and litigation risk.
              </div>
            </div>

            {/* Risk distribution bars */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-400 mb-2">
                Corridor Risk Distribution
              </span>
              <div className="space-y-2">
                {(risk_stratification.risk_distribution || []).map(
                  (dist, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">{dist.category}</span>
                        <span className="font-mono font-bold text-slate-200">
                          {dist.pct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${dist.pct}%`,
                            backgroundColor: dist.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Definitive Legal Closure Horizon Equation */}
          <div className="mt-5 p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                ∑
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                  Total Case-Free Liquidation Horizon Equation
                </span>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-white mt-1">
                  <span className="px-2.5 py-1 bg-blue-950/80 border border-blue-800 text-blue-300 rounded-lg font-mono">
                    {statLiq.historical_escrow_delay_days}d Historical Escrow
                    Stalling
                  </span>
                  <span className="text-slate-400 font-black">+</span>
                  <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-800 text-amber-300 rounded-lg font-mono">
                    {statLiq.predicted_clearance_days}d AI Clearance Horizon (
                    {statLiq.predicted_clearance_window})
                  </span>
                  <span className="text-slate-400 font-black">=</span>
                  <span className="px-3 py-1 bg-emerald-950/90 border border-emerald-600 text-emerald-300 rounded-lg font-mono font-black text-sm">
                    {statLiq.total_case_free_horizon_days} Days to Absolute
                    Case-Free Closure
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right shrink-0">
              <span className="text-[10px] text-slate-500 block">
                Statutory Grounding
              </span>
              <span className="text-[11px] font-mono font-semibold text-emerald-400">
                NH Act § 3D(2) &amp; § 3H(4)
              </span>
            </div>
          </div>

          {/* Statutory Grounding Note */}
          <div className="mt-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">
                Institutional Grounding for Administration &amp; Courts:
              </strong>{" "}
              Physical vehicular movement is not impeded because land ownership
              vests in the Union under Section 3D(2). The{" "}
              {statLiq.total_case_free_horizon_days}-day horizon definitively
              quantifies the duration required to liquidate the{" "}
              {statLiq.pending_court_injunctions} pending court stays and unlock
              ₹{statLiq.escrow_amount_locked_cr} Cr in escrow, terminating the
              accrual of 9&ndash;15% statutory penal interest.
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 4: Apache ECharts Comparative Package Delay Breakdown */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Apache ECharts &bull; Comparative Package Delay Breakdown
              </h2>
              <p className="text-[11px] text-slate-400">
                Segmented stacked delay analysis across project construction
                chainages.
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ReactECharts
              option={packageChartOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 5: Statutory Clearance & Environmental Dispute Survival Curve S(t) */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                5
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Statutory Clearance &amp; Environmental Dispute Survival Curve
                  S(t)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Kaplan-Meier survival analysis estimating time to full legal
                  dispute liquidation.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
              Median Horizon: {survival_curve.median_clearance_months} Months
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ReactECharts
              option={survivalChartOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 6: Interactive GIS Corridor & Cadastral Parcel Inspector */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
                6
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Interactive GIS Corridor &amp; Cadastral Parcel Inspector
                </h2>
                <p className="text-[11px] text-slate-400">
                  Geospatial Right-of-Way alignment, khasra parcels, and risk
                  categorization map.
                </p>
              </div>
            </div>
          </div>

          <div className="h-96 rounded-xl overflow-hidden border border-slate-800">
            <CorridorMap
              corridorGeojson={gis_corridor}
              selectedParcel={null}
              onSelectParcel={() => {}}
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 7: TreeSHAP Factor Attribution & Prescriptive Actions */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 font-bold text-xs">
              7
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                TreeSHAP Factor Attribution &amp; Statutory Prescriptive SOP
                Actions
              </h2>
              <p className="text-[11px] text-slate-400">
                Machine-learning explainability identifying root cause delay
                drivers, paired with concrete legal remedies.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: SHAP Factors */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                Root Cause Delay Drivers (SHAP Value Waterfall)
              </h3>
              <div className="space-y-2.5">
                {(xai_explanation?.factors || []).map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {f.feature_name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            f.impact_type === "delay_driver"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {f.impact_type === "delay_driver"
                            ? "+ Delay"
                            : "- Mitigator"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {f.description}
                      </p>
                    </div>
                    <div
                      className={`font-mono text-sm font-bold ${f.shap_value > 0 ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {f.shap_value > 0
                        ? `+${f.shap_value}d`
                        : `${f.shap_value}d`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Prescriptive SOP Actions */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Statutory Standard Operating Procedures (SOP)
              </h3>
              <div className="space-y-3">
                {(xai_explanation?.prescriptive_actions || []).map(
                  (action, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-400">
                          {action.legal_section}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            action.priority === "CRITICAL"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {action.priority} Priority &bull;{" "}
                          {action.target_timeline_days}d
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">
                        {action.action_title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {action.instruction}
                      </p>
                      <div className="text-[10px] text-slate-500 pt-1">
                        Enforcing Authority:{" "}
                        <span className="text-slate-300">
                          {action.statutory_authority}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 8: Government Data Lake & System Integration (Point 11) */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                8
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Government Data Lake &amp; System Integration Gateway
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Point 11 Standard
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  APIs for integration with existing land acquisition management
                  systems (NHAI Data Lake, PM GatiShakti, BhoomiRashi).
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsApiModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Provision Ministry API Key &amp; Swagger Docs</span>
            </button>
          </div>

          {/* 4 Active Integration Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    MoRTH BhoomiRashi
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  CONNECTED (RFC 7946)
                </span>
                <p className="text-[10px] text-slate-400">
                  Section 3A/3D Cadastral Ingestion Gateway
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Server className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    NHAI Central Data Lake
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  ACTIVE (Argon2id Key)
                </span>
                <p className="text-[10px] text-slate-400">
                  Sub-second ML Delay Inference &amp; SHAP
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    PM GatiShakti NMP
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  SYNCED (BISAG-N)
                </span>
                <p className="text-[10px] text-slate-400">
                  120m Corridor Right-of-Way GIS Buffers
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    PFMS Treasury DBT
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  SYNCED (Bank Mandate)
                </span>
                <p className="text-[10px] text-slate-400">
                  Direct Farmer Compensation &amp; Escrow Tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Continuous Active Learning Feedback Widget */}
        {/* ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Continuous Model Learning &amp; Milestone Actuals Feedback
                </h2>
                <p className="text-[11px] text-slate-400">
                  Log newly realized milestones to update the Central Database
                  and refine machine learning weights.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleFeedbackSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Achieved Statutory Milestone
              </label>
              <select
                value={feedbackStage}
                onChange={(e) => setFeedbackStage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
              >
                <option value="Section_3A_Notification">
                  Section 3A: Preliminary Notification
                </option>
                <option value="Section_3D/19_Declaration">
                  Section 3D: Final Acquisition Declaration
                </option>
                <option value="Section_3G/23_Award">
                  Section 3G: Award Declared
                </option>
                <option value="Section_3H_Compensation_Disbursed">
                  Section 3H: Compensation Disbursed
                </option>
                <option value="Physical_Possession_Taken">
                  Section 3E: Physical Possession Taken
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Actual Elapsed Days
              </label>
              <input
                type="number"
                value={actualDays}
                onChange={(e) => setActualDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                min="0"
                max="3000"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={feedbackSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {feedbackSubmitting ? (
                  <span>Logging to Central Database...</span>
                ) : feedbackSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Logged to Central DB!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Milestone Update</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Point 11: Developer & Government API Gateway Modal */}
        <ApiGatewayModal
          isOpen={isApiModalOpen}
          onClose={() => setIsApiModalOpen(false)}
        />
      </div>
    </div>
  );
}
