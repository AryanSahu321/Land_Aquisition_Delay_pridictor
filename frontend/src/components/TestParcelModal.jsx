import React, { useState } from "react";
import {
  X,
  Sliders,
  Play,
  Clock,
  AlertTriangle,
  CheckCircle,
  Scale,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";

const STAGES = [
  "Section 3A (Notice of Intent)",
  "Section 3D (Declaration of Acquisition)",
  "Section 3G (Award of Compensation)",
  "Section 3E (Notice for Taking Possession)",
];

const LAND_TYPES = [
  "Private Agricultural",
  "Private Commercial",
  "Forest Land",
  "Government Abadi",
];

export default function TestParcelModal({
  isOpen,
  onClose,
  onInspectExplanation,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    parcel_id: "EVAL-TEST-001",
    khasra_no: "305/1",
    khatauni_no: "KH-7120",
    village_name: "Kasidaha",
    tehsil: "Soraon",
    district: "Prayagraj",
    chainage_km: "km 22+400 to km 22+850",
    statutory_stage: "Section 3G (Award of Compensation)",
    days_in_current_stage: 95,
    land_type: "Private Agricultural",
    total_area_hectares: 2.75,
    affected_families_count: 14,
    compensation_disbursed_pct: 35.0,
    pending_court_injunctions: 2,
    sec_3h_escrow_deposited: false,
    jms_completed: true,
    missing_title_deeds_pct: 30.0,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunAssessment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      console.error("Assessment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Evaluator Test Panel &bull; Live ML Inference
              </h3>
              <p className="text-xs text-slate-400">
                Adjust statutory revenue parameters and test live RandomForest
                model response (&lt;100ms)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Controls Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Statutory Lifecycle Stage
            </label>
            <select
              value={formData.statutory_stage}
              onChange={(e) =>
                setFormData({ ...formData, statutory_stage: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Land Classification
            </label>
            <select
              value={formData.land_type}
              onChange={(e) =>
                setFormData({ ...formData, land_type: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500"
            >
              {LAND_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Active Civil Court Injunctions (Stays):{" "}
              <span className="text-red-400 font-bold">
                {formData.pending_court_injunctions}
              </span>
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={formData.pending_court_injunctions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pending_court_injunctions: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Compensation Disbursed:{" "}
              <span className="text-blue-400 font-bold">
                {formData.compensation_disbursed_pct}%
              </span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={formData.compensation_disbursed_pct}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  compensation_disbursed_pct: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Days in Current Stage:{" "}
              <span className="text-amber-400 font-bold">
                {formData.days_in_current_stage}d
              </span>
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.days_in_current_stage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  days_in_current_stage: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Missing Title Deeds / Heirship Gaps:{" "}
              <span className="text-amber-400 font-bold">
                {formData.missing_title_deeds_pct}%
              </span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.missing_title_deeds_pct}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  missing_title_deeds_pct: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              id="test-escrow"
              checked={formData.sec_3h_escrow_deposited}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sec_3h_escrow_deposited: e.target.checked,
                })
              }
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
            />
            <label
              htmlFor="test-escrow"
              className="text-slate-200 cursor-pointer"
            >
              Section 3H(4) Court Escrow Deposited
            </label>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              id="test-jms"
              checked={formData.jms_completed}
              onChange={(e) =>
                setFormData({ ...formData, jms_completed: e.target.checked })
              }
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
            />
            <label htmlFor="test-jms" className="text-slate-200 cursor-pointer">
              Joint Measurement Survey (JMS) Completed
            </label>
          </div>
        </div>

        {/* Run Assessment Action */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-slate-400 font-mono">
            Real-Time Inference: &lt;100ms
          </span>
          <button
            onClick={handleRunAssessment}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/25 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {loading ? "Computing Inference..." : "Run Real-Time Assessment"}
            </span>
          </button>
        </div>

        {/* Live Inference Output Display */}
        {prediction && (
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-blue-300">
                Live Machine Learning Output
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Inference Time: {prediction.inference_time_ms} ms
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">
                  Predicted Delay
                </span>
                <span className="text-2xl font-black text-amber-400">
                  +{prediction.predicted_delay_days}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">
                  Days
                </span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">
                  Delay Risk Probability
                </span>
                <span
                  className={`text-2xl font-black ${
                    prediction.risk_category === "High"
                      ? "text-red-400"
                      : prediction.risk_category === "Medium"
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {Math.round(prediction.delay_probability * 100)}%
                </span>
                <span className="text-xs text-slate-400 ml-1">
                  ({prediction.risk_category})
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  onInspectExplanation(formData);
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Open Full XAI Waterfall & Simulation Sandbox for this Parcel
                  &rarr;
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
