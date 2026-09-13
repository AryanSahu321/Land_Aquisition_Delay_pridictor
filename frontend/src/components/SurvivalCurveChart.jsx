import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
  Activity,
  Clock,
  ShieldAlert,
  Sparkles,
  Trees,
  CheckCircle2,
} from "lucide-react";

export default function SurvivalCurveChart() {
  const [isForest, setIsForest] = useState(true);
  const [hasInjunction, setHasInjunction] = useState(false);
  const [survivalData, setSurvivalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/v1/survival/clearance-curve?is_forest=${isForest}&has_injunction=${hasInjunction}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setSurvivalData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Survival curve fetch error:", err);
        setLoading(false);
      });
  }, [isForest, hasInjunction]);

  if (loading || !survivalData) {
    return (
      <div className="h-96 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400">
        <div className="animate-spin w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
        <span>Calculating Lifelines Cox Proportional Hazards Curve...</span>
      </div>
    );
  }

  const timeline = survivalData.timeline_days || [];
  const survProbs = (survivalData.survival_probabilities || []).map((p) =>
    Math.round(p * 100),
  );
  const resolProbs = (survivalData.resolution_probabilities || []).map((p) =>
    Math.round(p * 100),
  );

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      textStyle: { color: "#f8fafc", fontFamily: "Inter, sans-serif" },
      formatter: function (params) {
        const day = params[0].name;
        const unres = params[0].value;
        const res = params[1] ? params[1].value : 100 - unres;
        return `
          <div style="font-weight:bold;color:#34d399;margin-bottom:4px;">Timeline: ${day} Days Elapsed</div>
          <div style="font-size:12px;color:#f87171;">&bull; P(Clearance Still Delayed): <strong>${unres}%</strong></div>
          <div style="font-size:12px;color:#38bdf8;">&bull; P(Dispute Resolved by Day ${day}): <strong>${res}%</strong></div>
        `;
      },
    },
    legend: {
      data: [
        "Probability Still Unresolved (Survival S(t))",
        "Probability Resolved by Day t",
      ],
      textStyle: { color: "#cbd5e1", fontSize: 12 },
      top: "0%",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      name: "Elapsed Days (t)",
      nameTextStyle: { color: "#94a3b8", fontSize: 11 },
      data: timeline.map((d) => `${d}d`),
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { color: "#94a3b8" },
    },
    yAxis: {
      type: "value",
      name: "Probability (%)",
      max: 100,
      min: 0,
      nameTextStyle: { color: "#94a3b8", fontSize: 11 },
      splitLine: { lineStyle: { color: "#1e293b" } },
      axisLabel: { color: "#94a3b8", formatter: "{value}%" },
    },
    series: [
      {
        name: "Probability Still Unresolved (Survival S(t))",
        type: "line",
        smooth: true,
        data: survProbs,
        lineStyle: { color: "#ef4444", width: 3 },
        itemStyle: { color: "#ef4444" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(239, 68, 68, 0.35)" },
              { offset: 1, color: "rgba(239, 68, 68, 0.02)" },
            ],
          },
        },
        markLine: {
          symbol: "none",
          data: [
            {
              xAxis: "90d",
              lineStyle: { color: "#f59e0b", type: "dashed", width: 2 },
              label: {
                show: true,
                formatter: "90-Day Critical SLA Threshold",
                color: "#f59e0b",
                position: "insideEndTop",
              },
            },
          ],
        },
      },
      {
        name: "Probability Resolved by Day t",
        type: "line",
        smooth: true,
        data: resolProbs,
        lineStyle: { color: "#38bdf8", width: 2.5, type: "dotted" },
        itemStyle: { color: "#38bdf8" },
      },
    ],
  };

  return (
    <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Lifelines &bull; Cox Proportional Hazards
            </span>
            <span className="text-xs text-slate-400">
              Right-Censored Time-to-Event Modeling
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>
              Statutory Clearance & Environmental Dispute Survival Curve S(t)
            </span>
          </h3>
        </div>

        {/* Covariate interactive toggles */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isForest}
              onChange={(e) => setIsForest(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
            />
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Trees className="w-3.5 h-3.5" /> Forest Land (MoEFCC)
            </span>
          </label>
          <span className="text-slate-600">|</span>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={hasInjunction}
              onChange={(e) => setHasInjunction(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 bg-slate-800 border-slate-700"
            />
            <span className="font-semibold text-red-400">
              Civil Court Injunction
            </span>
          </label>
        </div>
      </div>

      {/* Dynamic Hazard Ratio Callout */}
      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-600/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-slate-200">
            <strong>CoxPH Interpretation:</strong> {survivalData.interpretation}
          </span>
        </div>
        <div className="text-right">
          <span className="text-emerald-400 font-mono font-bold text-sm">
            HR ={" "}
            {isForest
              ? survivalData.hazard_ratios?.forest_land_hazard_ratio
              : "1.0"}
            x
          </span>
          <span className="block text-[10px] text-slate-400">
            Hazard Multiplier
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[360px] w-full">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>

      {/* Statistical metrics footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block">
            P(Exceeding 90-day threshold):
          </span>
          <span className="text-xl font-bold text-amber-400">
            {Math.round(survivalData.prob_exceeding_90_days * 100)}%
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            High risk of contractor downtime
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block">
            Median Clearance Turnaround:
          </span>
          <span className="text-xl font-bold text-white">
            {isForest
              ? survivalData.hazard_ratios?.median_clearance_days_forest
              : survivalData.hazard_ratios
                  ?.median_clearance_days_non_forest}{" "}
            Days
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Parivesh 2.0 portal SLA
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400 block">Prescribed Action:</span>
          <span className="text-xs font-semibold text-emerald-400 block mt-1">
            {isForest
              ? "Deprioritize paving sequencing; transfer non-forest CAMPA fund."
              : "Clearance on track for 60-day target."}
          </span>
        </div>
      </div>
    </div>
  );
}
