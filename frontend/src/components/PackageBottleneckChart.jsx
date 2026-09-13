import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
  BarChart3,
  Info,
  Sliders,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function PackageBottleneckChart() {
  const [packagesData, setPackagesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/packages/bottlenecks")
      .then((res) => res.json())
      .then((data) => {
        setPackagesData(data.packages || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading package bottlenecks:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-96 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-500" />
        <span>Loading ECharts Comparative Package Analytics...</span>
      </div>
    );
  }

  const packageNames = packagesData.map((p) => p.package_name);
  const legalDisputes = packagesData.map((p) => p.legal_disputes_days);
  const compensationLag = packagesData.map((p) => p.compensation_lag_days);
  const missingTitles = packagesData.map((p) => p.missing_titles_days);
  const forestClearance = packagesData.map((p) => p.forest_clearance_days);

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "#0f172a",
      borderColor: "#334155",
      borderWidth: 1,
      textStyle: {
        color: "#f8fafc",
        fontFamily: "Inter, sans-serif",
      },
      formatter: function (params) {
        let title = `<div style="font-weight:bold;margin-bottom:6px;color:#93c5fd;">${params[0].name} (NH-19 Alignment)</div>`;
        let total = 0;
        let details = params
          .map((item) => {
            total += item.value;
            return `<div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;margin-bottom:3px;">
            <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${item.color};margin-right:6px;"></span>${item.seriesName}</span>
            <strong style="color:#ffffff;">+${item.value} days</strong>
          </div>`;
          })
          .join("");
        return `${title}${details}<div style="margin-top:6px;padding-top:6px;border-top:1px solid #334155;font-weight:bold;display:flex;justify-content:space-between;"><span>Total Timeline Delay:</span><span style="color:#fbbf24;">+${total} days</span></div>`;
      },
    },
    legend: {
      data: [
        "Legal Disputes (Civil Stays)",
        "Compensation Lag",
        "Missing Title Deeds",
        "Forest & Env Clearance",
      ],
      textStyle: {
        color: "#cbd5e1",
        fontSize: 12,
      },
      top: "0%",
      icon: "roundRect",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "14%",
      top: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: packageNames,
      axisLine: {
        lineStyle: {
          color: "#334155",
        },
      },
      axisLabel: {
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: "bold",
      },
    },
    yAxis: {
      type: "value",
      name: "Delay Days (+)",
      nameTextStyle: {
        color: "#94a3b8",
        fontSize: 11,
        padding: [0, 0, 0, 10],
      },
      splitLine: {
        lineStyle: {
          color: "#1e293b",
        },
      },
      axisLabel: {
        color: "#94a3b8",
        formatter: "{value} d",
      },
    },
    dataZoom: [
      {
        type: "slider",
        show: true,
        start: 0,
        end: 100,
        height: 20,
        bottom: "2%",
        borderColor: "#334155",
        fillerColor: "rgba(59, 130, 246, 0.2)",
        handleStyle: {
          color: "#3b82f6",
        },
        textStyle: {
          color: "#94a3b8",
        },
      },
      {
        type: "inside",
        start: 0,
        end: 100,
      },
    ],
    series: [
      {
        name: "Legal Disputes (Civil Stays)",
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        itemStyle: {
          color: "#ef4444", // Red
          borderRadius: [0, 0, 0, 0],
        },
        data: legalDisputes,
      },
      {
        name: "Compensation Lag",
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        itemStyle: {
          color: "#3b82f6", // Blue
        },
        data: compensationLag,
      },
      {
        name: "Missing Title Deeds",
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        itemStyle: {
          color: "#eab308", // Yellow
        },
        data: missingTitles,
      },
      {
        name: "Forest & Env Clearance",
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        itemStyle: {
          color: "#f97316", // Orange
          borderRadius: [4, 4, 0, 0],
        },
        data: forestClearance,
      },
    ],
  };

  return (
    <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>
              Apache ECharts &bull; Comparative Package Delay Breakdown
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Cumulative delay days across 10 Highway Packages, segmented by AI
            TreeSHAP factor attributions
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Info className="w-4 h-4 text-blue-400" />
          <span>
            Click any legend item to isolate; drag bottom slider to zoom
            packages
          </span>
        </div>
      </div>

      {/* ECharts Container */}
      <div className="h-[380px] w-full">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>

      {/* Highlights summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
        <div className="bg-red-950/20 border border-red-800/30 p-2.5 rounded-lg">
          <span className="text-red-400 font-semibold block">
            Top Delay Driver
          </span>
          <span className="text-white font-bold text-sm">
            Civil Court Injunctions (42%)
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Section 3H escrow recommended
          </span>
        </div>
        <div className="bg-blue-950/20 border border-blue-800/30 p-2.5 rounded-lg">
          <span className="text-blue-400 font-semibold block">
            Second Driver
          </span>
          <span className="text-white font-bold text-sm">
            Compensation Lag (26%)
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Tehsil camps required
          </span>
        </div>
        <div className="bg-yellow-950/20 border border-yellow-800/30 p-2.5 rounded-lg">
          <span className="text-yellow-400 font-semibold block">
            Third Driver
          </span>
          <span className="text-white font-bold text-sm">
            Missing Title Deeds (18%)
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Lekhpal Varashat drive
          </span>
        </div>
        <div className="bg-orange-950/20 border border-orange-800/30 p-2.5 rounded-lg">
          <span className="text-orange-400 font-semibold block">
            Critical Chokepoint
          </span>
          <span className="text-white font-bold text-sm">
            Package 5 (+95 days)
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Requires priority intervention
          </span>
        </div>
      </div>
    </div>
  );
}
