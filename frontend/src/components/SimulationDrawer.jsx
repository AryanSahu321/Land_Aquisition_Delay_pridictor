import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Sliders,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Building,
  CheckCircle2,
  HelpCircle,
  Award,
  ArrowRight,
  Gavel,
  RefreshCw,
} from "lucide-react";

export default function SimulationDrawer({
  isOpen,
  onClose,
  parcel,
  onApplyIntervention,
}) {
  if (!isOpen || !parcel) return null;

  // Baseline initial state
  const [baselineExplanation, setBaselineExplanation] = useState(null);
  const [baselinePrediction, setBaselinePrediction] = useState(null);
  const [loadingBaseline, setLoadingBaseline] = useState(true);

  // Evaluator Sandbox Simulation state
  const [simDisbursement, setSimDisbursement] = useState(
    parcel.compensation_disbursed_pct || 30.0,
  );
  const [simResolveStays, setSimResolveStays] = useState(false);
  const [simTitleCamp, setSimTitleCamp] = useState(false);
  const [simJmsDone, setSimJmsDone] = useState(parcel.jms_completed !== false);

  // Simulated optimistic results
  const [simPrediction, setSimPrediction] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);

  // Fetch baseline explanation on parcel change
  useEffect(() => {
    let isMounted = true;
    setLoadingBaseline(true);

    // Sync simulation sliders with initial parcel values
    setSimDisbursement(parcel.compensation_disbursed_pct || 30.0);
    setSimResolveStays(false);
    setSimTitleCamp(false);
    setSimJmsDone(parcel.jms_completed !== false);

    const payload = {
      parcel_id: parcel.parcel_id,
      khasra_no: parcel.khasra_no || "142/2",
      khatauni_no: parcel.khatauni_no || "KH-4921",
      statutory_stage:
        parcel.statutory_stage || "Section 3G (Award of Compensation)",
      days_in_current_stage: parcel.days_in_current_stage || 60,
      land_type: parcel.land_type || "Private Agricultural",
      total_area_hectares: parcel.total_area_hectares || 2.0,
      affected_families_count: parcel.affected_families_count || 10,
      compensation_disbursed_pct: parcel.compensation_disbursed_pct || 0.0,
      pending_court_injunctions: parcel.pending_court_injunctions || 0,
      sec_3h_escrow_deposited: parcel.sec_3h_escrow_deposited || false,
      jms_completed: parcel.jms_completed !== false,
      missing_title_deeds_pct: parcel.missing_title_deeds_pct || 0.0,
    };

    fetch("/api/v1/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setBaselineExplanation(data);
          setBaselinePrediction({
            predicted_delay_days: data.predicted_delay_days,
            delay_probability:
              data.predicted_delay_days > 65
                ? 0.82
                : data.predicted_delay_days >= 30
                  ? 0.52
                  : 0.22,
            risk_category:
              data.predicted_delay_days > 65
                ? "High"
                : data.predicted_delay_days >= 30
                  ? "Medium"
                  : "Low",
          });
          setLoadingBaseline(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch explanation:", err);
        if (isMounted) setLoadingBaseline(false);
      });

    return () => {
      isMounted = false;
    };
  }, [parcel]);

  // Trigger instant recalculation whenever simulation sliders/toggles change
  useEffect(() => {
    let isMounted = true;
    setLoadingSim(true);

    // If civil stays resolved via Section 3H escrow, set sec_3h_escrow_deposited to True
    // If title camp active, reduce missing deeds to 5%
    const simInjunctions = simResolveStays
      ? 0
      : parcel.pending_court_injunctions || 0;
    const simEscrow = simResolveStays
      ? true
      : parcel.sec_3h_escrow_deposited || false;
    const simMissingDeeds = simTitleCamp
      ? 4.0
      : parcel.missing_title_deeds_pct || 0.0;

    const simPayload = {
      parcel_id: parcel.parcel_id,
      khasra_no: parcel.khasra_no,
      statutory_stage: parcel.statutory_stage,
      days_in_current_stage: parcel.days_in_current_stage || 45,
      land_type: parcel.land_type,
      total_area_hectares: parcel.total_area_hectares,
      affected_families_count: parcel.affected_families_count,
      compensation_disbursed_pct: parseFloat(simDisbursement),
      pending_court_injunctions: simInjunctions,
      sec_3h_escrow_deposited: simEscrow,
      jms_completed: simJmsDone,
      missing_title_deeds_pct: simMissingDeeds,
    };

    fetch("/api/v1/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(simPayload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setSimPrediction(data);
          setLoadingSim(false);
        }
      })
      .catch((err) => {
        console.error("Simulation predict error:", err);
        if (isMounted) setLoadingSim(false);
      });

    return () => {
      isMounted = false;
    };
  }, [simDisbursement, simResolveStays, simTitleCamp, simJmsDone, parcel]);

  const baselineDays =
    baselineExplanation?.predicted_delay_days ??
    parcel.predicted_delay_days ??
    0;
  const simDays = simPrediction?.predicted_delay_days ?? baselineDays;
  const daysSaved = Math.max(0, baselineDays - simDays);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end transition-all">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {parcel.parcel_id}
              </span>
              <span className="text-xs text-slate-400">
                Khasra:{" "}
                <strong className="text-white">
                  {parcel.khasra_no || "142/2"}
                </strong>{" "}
                &bull; {parcel.village_name}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>XAI Attribution & "What-If" Simulation Sandbox</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Side-by-Side Intervention Comparison Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-5 rounded-xl border border-indigo-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Live Intervention Impact Comparison
              </span>
              {loadingSim && (
                <span className="text-[11px] text-blue-400 flex items-center gap-1 animate-pulse font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Recalculating
                  ML inference...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Before Card */}
              <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                  Baseline (Current Status)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-red-400">
                    +{baselineDays}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Days</span>
                </div>
                <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500">Risk:</span>
                  <span className="font-bold text-red-400">
                    {baselineExplanation?.predicted_delay_days > 65
                      ? "High (>65%)"
                      : "Medium (30-65%)"}
                  </span>
                </div>
              </div>

              {/* After Card */}
              <div className="bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-500/30">
                <span className="text-[11px] text-emerald-400 uppercase font-semibold block mb-1">
                  Post-Intervention Simulated
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">
                    +{simDays}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Days</span>
                </div>
                <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-300">
                  <span className="text-slate-500">Risk:</span>
                  <span
                    className={`font-bold ${simDays > 65 ? "text-red-400" : simDays >= 30 ? "text-amber-400" : "text-emerald-400"}`}
                  >
                    {simDays > 65 ? "High" : simDays >= 30 ? "Medium" : "Low"} (
                    {Math.round(
                      (simPrediction?.delay_probability || 0.2) * 100,
                    )}
                    %)
                  </span>
                </div>
              </div>
            </div>

            {/* Net Timeline Recovered Highlight */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Net RoW Timeline Recovered:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Administrative acceleration achieved
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">
                  +{daysSaved} Days
                </span>
                <span className="text-[10px] text-emerald-300 uppercase font-mono block">
                  Saved
                </span>
              </div>
            </div>
          </div>

          {/* Evaluator Interactive Sliders & Toggles */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Evaluator Administrative "What-If" Interventions</span>
            </h3>

            {/* Slider 1: Compensation Disbursement Target */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="text-slate-300 font-medium">
                  Compensation Disbursement Target:{" "}
                  <span className="text-blue-400 font-bold">
                    {simDisbursement}%
                  </span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Baseline: {parcel.compensation_disbursed_pct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={simDisbursement}
                onChange={(e) => setSimDisbursement(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0% (Notice)</span>
                <span>50% (Award Avg)</span>
                <span>100% (Sec 3E Ready)</span>
              </div>
            </div>

            {/* Toggle 2: Resolve Civil Court Stays (Section 3H Escrow) */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">
                  Resolve Civil Stays via Section 3H(4) Court Escrow
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Deposit funds to principal civil court & vacate interim
                  injunction under Sec 3E(1)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simResolveStays}
                  onChange={(e) => setSimResolveStays(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Toggle 3: Complete Title Verification Camp */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">
                  Deploy Revenue Lekhpal Squad for Title Mutation
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Fast-track Varashat legal heirship verification camp in
                  village chaupal
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simTitleCamp}
                  onChange={(e) => setSimTitleCamp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Toggle 4: Expedite Joint Measurement Survey (JMS) */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200 block">
                  Expedite DGPS & Drone Joint Measurement Survey (JMS)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Demarcate RoW boundaries and clear Section 3D declaration
                  prerequisite
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simJmsDone}
                  onChange={(e) => setSimJmsDone(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Module 3: XAI Factor Attribution Waterfall Bar Chart */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Explainable AI (SHAP) Factor Attribution Waterfall</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Baseline Mean: +
                {baselineExplanation?.baseline_expected_delay_days || 112}d
              </span>
            </div>

            {loadingBaseline ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                Computing SHAP factor attributions via TreeExplainer...
              </div>
            ) : (
              <div className="space-y-3">
                {/* Positive drivers (Factors Adding Delay) */}
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-red-400 block mb-2">
                    Bottlenecks Adding Delay Days (+)
                  </span>
                  <div className="space-y-2">
                    {baselineExplanation?.positive_drivers?.map(
                      (driver, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-200">
                              {driver.display_name}
                            </span>
                            <span className="font-mono font-bold text-red-400">
                              +{driver.impact_days} days
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                            <div
                              className="bg-red-500 h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, Math.max(8, driver.impact_days * 2.2))}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {driver.description}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Negative drivers (Factors Mitigating Delay) */}
                {baselineExplanation?.negative_drivers?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 block mb-2">
                      Mitigating Factors Accelerating Timeline (-)
                    </span>
                    <div className="space-y-2">
                      {baselineExplanation?.negative_drivers?.map(
                        (driver, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-200">
                                {driver.display_name}
                              </span>
                              <span className="font-mono font-bold text-emerald-400">
                                {driver.impact_days} days
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Math.max(8, Math.abs(driver.impact_days) * 2.5))}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              {driver.description}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Module 3: Statutory Prescriptive SOP Actions */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Gavel className="w-4 h-4 text-blue-400" />
              <span>Statutory Administrative SOP Recommendations</span>
            </h3>

            <div className="space-y-3">
              {baselineExplanation?.prescriptive_actions?.map((sop, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                    sop.priority === "CRITICAL"
                      ? "bg-red-950/30 border-red-800/40 text-red-200"
                      : sop.priority === "HIGH"
                        ? "bg-amber-950/30 border-amber-800/40 text-amber-200"
                        : "bg-blue-950/30 border-blue-800/40 text-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">
                      {sop.action_title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sop.priority === "CRITICAL"
                          ? "bg-red-500 text-white"
                          : sop.priority === "HIGH"
                            ? "bg-amber-500 text-black"
                            : "bg-blue-500 text-white"
                      }`}
                    >
                      {sop.priority} &bull; {sop.target_timeline_days}d SLA
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300">
                    Authority: {sop.statutory_authority} | Legal Basis:{" "}
                    {sop.legal_section}
                  </div>
                  <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                    {sop.instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
