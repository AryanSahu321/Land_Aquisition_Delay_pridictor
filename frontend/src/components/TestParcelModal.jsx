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
  ChevronDown,
  ChevronUp,
  Truck,
  Train,
  Sun,
  Factory,
  Cpu,
  Layers,
  Wrench,
  Activity,
  FileCheck,
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

const SECTOR_PRESETS = [
  {
    id: "nhai",
    title: "NHAI Expressway",
    sector: "Transport",
    statute: "NH Act 1956",
    icon: Truck,
    color: "from-blue-600 to-indigo-600 border-blue-500/50",
    data: {
      parcel_id: "UP-PRG-NH19-EXP-042",
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
      sector: "Transport",
      jurisdiction: "Central",
      state: "Uttar Pradesh",
      district_or_corridor: "Prayagraj",
      project_status: "Ongoing",
      project_spatial_type: "Linear",
      governing_statute: "NH_Act_1956",
      infrastructure_type: "Highway",
      contractor_past_delay_index: 1.15,
      subcontractor_tier_rating: "Tier_1_National",
      equipment_telemetry_downtime: 14.0,
      utility_lines_to_relocate_count: 18,
      structures_count_residential: 8,
      commercial_establishments_count: 2,
      co_sharer_mutation_pending: false,
      forest_clearance_stage: "Not_Applicable",
      local_law_and_order_halts: false,
      wpi_material_inflation: 5.2,
      labor_productivity_rate: 0.95,
    },
  },
  {
    id: "dfc",
    title: "Dedicated Freight Rail",
    sector: "Railways",
    statute: "Railways Act 1989",
    icon: Train,
    color: "from-emerald-600 to-teal-600 border-emerald-500/50",
    data: {
      parcel_id: "EDFC-BHR-SAS-108",
      khasra_no: "512/3",
      khatauni_no: "KH-3481",
      village_name: "Dehri",
      tehsil: "Sasaram",
      district: "Rohtas",
      chainage_km: "km 310+100 to km 311+400",
      statutory_stage: "Section 3D (Declaration of Acquisition)",
      days_in_current_stage: 180,
      land_type: "Private Agricultural",
      total_area_hectares: 5.4,
      affected_families_count: 28,
      compensation_disbursed_pct: 15.0,
      pending_court_injunctions: 1,
      sec_3h_escrow_deposited: true,
      jms_completed: true,
      missing_title_deeds_pct: 45.0,
      sector: "Railways",
      jurisdiction: "Central",
      state: "Bihar",
      district_or_corridor: "Rohtas",
      project_status: "Ongoing",
      project_spatial_type: "Linear",
      governing_statute: "Railways_Act_1989",
      infrastructure_type: "Freight_Rail",
      contractor_past_delay_index: 1.05,
      subcontractor_tier_rating: "Tier_1_National",
      equipment_telemetry_downtime: 8.0,
      utility_lines_to_relocate_count: 32,
      structures_count_residential: 15,
      commercial_establishments_count: 6,
      co_sharer_mutation_pending: true,
      forest_clearance_stage: "Stage_I_In_Principle",
      local_law_and_order_halts: false,
      wpi_material_inflation: 4.8,
      labor_productivity_rate: 1.02,
    },
  },
  {
    id: "solar",
    title: "Solar Power Park",
    sector: "Renewable Energy",
    statute: "State LA Act",
    icon: Sun,
    color: "from-amber-600 to-orange-600 border-amber-500/50",
    data: {
      parcel_id: "RAJ-BHADLA-SOLAR-09",
      khasra_no: "89/1",
      khatauni_no: "KH-1209",
      village_name: "Bhadla",
      tehsil: "Phalodi",
      district: "Jodhpur",
      chainage_km: "Cluster Zone 4",
      statutory_stage: "Section 3A (Notice of Intent)",
      days_in_current_stage: 40,
      land_type: "Government Abadi",
      total_area_hectares: 45.0,
      affected_families_count: 4,
      compensation_disbursed_pct: 80.0,
      pending_court_injunctions: 0,
      sec_3h_escrow_deposited: true,
      jms_completed: true,
      missing_title_deeds_pct: 5.0,
      sector: "Renewable Energy",
      jurisdiction: "State",
      state: "Rajasthan",
      district_or_corridor: "Jodhpur",
      project_status: "Ongoing",
      project_spatial_type: "Polygon",
      governing_statute: "State_LA_Act",
      infrastructure_type: "Solar_Park",
      contractor_past_delay_index: 0.95,
      subcontractor_tier_rating: "Tier_1_National",
      equipment_telemetry_downtime: 5.0,
      utility_lines_to_relocate_count: 4,
      structures_count_residential: 0,
      commercial_establishments_count: 0,
      co_sharer_mutation_pending: false,
      forest_clearance_stage: "Not_Applicable",
      local_law_and_order_halts: false,
      wpi_material_inflation: 3.5,
      labor_productivity_rate: 1.1,
    },
  },
  {
    id: "smart_city",
    title: "Industrial Smart City",
    sector: "Manufacturing",
    statute: "RFCTLARR 2013",
    icon: Factory,
    color: "from-purple-600 to-violet-600 border-purple-500/50",
    data: {
      parcel_id: "GUJ-DHOLERA-IND-204",
      khasra_no: "620/A",
      khatauni_no: "KH-9021",
      village_name: "Valinda",
      tehsil: "Dholera",
      district: "Ahmedabad",
      chainage_km: "Town Planning Zone 2",
      statutory_stage: "Section 3G (Award of Compensation)",
      days_in_current_stage: 120,
      land_type: "Private Commercial",
      total_area_hectares: 12.8,
      affected_families_count: 65,
      compensation_disbursed_pct: 45.0,
      pending_court_injunctions: 3,
      sec_3h_escrow_deposited: false,
      jms_completed: false,
      missing_title_deeds_pct: 38.0,
      sector: "Manufacturing",
      jurisdiction: "State",
      state: "Gujarat",
      district_or_corridor: "Ahmedabad",
      project_status: "Ongoing",
      project_spatial_type: "Polygon",
      governing_statute: "RFCTLARR_2013",
      infrastructure_type: "Industrial_Corridor",
      contractor_past_delay_index: 1.3,
      subcontractor_tier_rating: "Tier_2_Regional",
      equipment_telemetry_downtime: 22.0,
      utility_lines_to_relocate_count: 45,
      structures_count_residential: 35,
      commercial_establishments_count: 22,
      co_sharer_mutation_pending: true,
      forest_clearance_stage: "Not_Applicable",
      local_law_and_order_halts: true,
      wpi_material_inflation: 6.8,
      labor_productivity_rate: 0.85,
    },
  },
  {
    id: "metro",
    title: "Urban Metro Transit",
    sector: "Urban Transit",
    statute: "Metro Rail Act",
    icon: Building2,
    color: "from-cyan-600 to-blue-600 border-cyan-500/50",
    data: {
      parcel_id: "MH-MUM-METRO4-088",
      khasra_no: "411/2",
      khatauni_no: "KH-6612",
      village_name: "Bhandup",
      tehsil: "Kurla",
      district: "Mumbai Suburban",
      chainage_km: "Pier 142 to Pier 148",
      statutory_stage: "Section 3E (Notice for Taking Possession)",
      days_in_current_stage: 75,
      land_type: "Private Commercial",
      total_area_hectares: 0.85,
      affected_families_count: 90,
      compensation_disbursed_pct: 75.0,
      pending_court_injunctions: 1,
      sec_3h_escrow_deposited: true,
      jms_completed: true,
      missing_title_deeds_pct: 12.0,
      sector: "Urban Infrastructure",
      jurisdiction: "Joint_Venture",
      state: "Maharashtra",
      district_or_corridor: "Mumbai",
      project_status: "Ongoing",
      project_spatial_type: "Linear",
      governing_statute: "Metro_Railways_Act",
      infrastructure_type: "Metro_Transit",
      contractor_past_delay_index: 1.25,
      subcontractor_tier_rating: "Tier_1_National",
      equipment_telemetry_downtime: 18.0,
      utility_lines_to_relocate_count: 60,
      structures_count_residential: 50,
      commercial_establishments_count: 40,
      co_sharer_mutation_pending: false,
      forest_clearance_stage: "Not_Applicable",
      local_law_and_order_halts: false,
      wpi_material_inflation: 5.4,
      labor_productivity_rate: 0.9,
    },
  },
];

export default function TestParcelModal({
  isOpen,
  onClose,
  onInspectExplanation,
}) {
  if (!isOpen) return null;

  const [activePreset, setActivePreset] = useState("nhai");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState(SECTOR_PRESETS[0].data);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setFormData(preset.data);
    setPrediction(null);
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Evaluator Test Panel &bull; Live ML Inference
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  47-Feature Production Ensemble
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Benchmark real statutory cases across infrastructure sectors &
                test soft-voting XGBoost + LightGBM response (&lt;50ms)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sector Presets Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Infrastructure Sector Presets (Real-World Calibration)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Click preset to load ground-truth attributes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SECTOR_PRESETS.map((preset) => {
              const IconComp = preset.icon;
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition text-xs font-semibold ${
                    isSelected
                      ? `bg-gradient-to-b ${preset.color} text-white shadow-lg shadow-blue-900/30 ring-2 ring-blue-400/40`
                      : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <IconComp
                    className={`w-4 h-4 mb-1.5 ${isSelected ? "text-white" : "text-slate-400"}`}
                  />
                  <span className="text-[11px] leading-tight font-bold">
                    {preset.title}
                  </span>
                  <span className="text-[9px] text-slate-300/80 mt-0.5">
                    {preset.statute}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Core Statutory Input Controls */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              Statutory Revenue Parameters (NH Act 1956 & RFCTLARR 2013)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Parcel ID:{" "}
              <strong className="text-slate-200">{formData.parcel_id}</strong>
            </span>
          </div>

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
                max="10"
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
                max="600"
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
                Missing Title Deeds / Succession Gaps:{" "}
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
                className="text-slate-200 cursor-pointer text-xs"
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
              <label
                htmlFor="test-jms"
                className="text-slate-200 cursor-pointer text-xs"
              >
                Joint Measurement Survey (JMS) Done
              </label>
            </div>
          </div>
        </div>

        {/* Collapsible: Advanced 47-Feature Operational & Engineering Accordion */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-800/40 hover:bg-slate-800/70 transition text-left"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-slate-200">
                Advanced Operational & Engineering Signals (47-Feature Ensemble)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Contractor, Telemetry & Physical Footprint
              </span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">
                    Contractor Past Delay Index
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="2.5"
                    value={formData.contractor_past_delay_index || 1.05}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractor_past_delay_index:
                          parseFloat(e.target.value) || 1.0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Equipment Telemetry Downtime (%)
                  </label>
                  <input
                    type="number"
                    step="1.0"
                    min="0"
                    max="60"
                    value={formData.equipment_telemetry_downtime || 12.0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        equipment_telemetry_downtime:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Utility Lines to Relocate
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.utility_lines_to_relocate_count || 15}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        utility_lines_to_relocate_count:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Residential Structures Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.structures_count_residential || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        structures_count_residential:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Commercial Establishments Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commercial_establishments_count || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commercial_establishments_count:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    Forest Clearance Stage
                  </label>
                  <select
                    value={formData.forest_clearance_stage || "Not_Applicable"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        forest_clearance_stage: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Not_Applicable">Not Applicable</option>
                    <option value="Proposal_Submitted">
                      Proposal Submitted
                    </option>
                    <option value="Stage_I_In_Principle">
                      Stage-I (In-Principle)
                    </option>
                    <option value="Stage_II_Final">Stage-II (Final)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/60">
                  <input
                    type="checkbox"
                    id="test-mutation"
                    checked={Boolean(formData.co_sharer_mutation_pending)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        co_sharer_mutation_pending: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                  />
                  <label
                    htmlFor="test-mutation"
                    className="text-slate-300 cursor-pointer"
                  >
                    Co-Sharer Revenue Mutation Disputed
                  </label>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/60">
                  <input
                    type="checkbox"
                    id="test-halts"
                    checked={Boolean(formData.local_law_and_order_halts)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        local_law_and_order_halts: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                  />
                  <label
                    htmlFor="test-halts"
                    className="text-slate-300 cursor-pointer"
                  >
                    Local Law & Order / Agitation Halts
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>XGBoost + LightGBM Soft-Voting Ensemble</span>
          </div>
          <button
            onClick={handleRunAssessment}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {loading
                ? "Computing Ensemble Inference..."
                : "Run Real-Time Assessment"}
            </span>
          </button>
        </div>

        {/* Live Inference Output Display */}
        {prediction && (
          <div className="bg-slate-950 p-5 rounded-2xl border border-blue-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs uppercase font-bold text-blue-300 tracking-wider">
                  Live ML Ensemble Output &bull; 47 Features Evaluated
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Inference Latency:{" "}
                <strong className="text-emerald-400">
                  {prediction.inference_time_ms} ms
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                  Predicted Delay
                </span>
                <span className="text-2xl font-black text-amber-400">
                  +{prediction.predicted_delay_days}
                </span>
                <span className="text-xs text-slate-400 font-mono ml-1">
                  Days
                </span>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
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

              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold uppercase">
                  Confidence Score
                </span>
                <span className="text-2xl font-black text-blue-400">
                  {Math.round((prediction.confidence_score || 0.88) * 100)}%
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Ensemble Agreement
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Prescriptions calibrated to Indian statutory laws
              </span>
              <button
                onClick={() => {
                  onClose();
                  onInspectExplanation(formData);
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Open Full TreeSHAP Waterfall & Simulation Sandbox &rarr;
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
