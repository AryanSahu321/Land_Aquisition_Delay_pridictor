/**
 * Strict TypeScript Type Definitions for Enterprise Land Acquisition Intelligence Platform
 * Validates AI predictions, SHAP attributions, Lifelines survival curves, and GIS payloads.
 */

export type StatutoryStage =
  | "Section 3A (Notice of Intent)"
  | "Section 3D (Declaration of Acquisition)"
  | "Section 3G (Award of Compensation)"
  | "Section 3E (Notice for Taking Possession)";

export type RiskCategory = "Low" | "Medium" | "High";

export type LandClassification =
  | "Private Agricultural"
  | "Private Commercial"
  | "Forest Land"
  | "Government Abadi";

export interface ParcelPrediction {
  parcel_id: string;
  khasra_no: string;
  predicted_delay_days: number;
  delay_probability: number; // 0.0 to 1.0
  risk_category: RiskCategory;
  inference_time_ms: number;
  confidence_score: number;
}

export interface SHAPDriver {
  feature: string;
  display_name: string;
  impact_days: number;
  direction: "increase" | "decrease";
  description: string;
}

export interface StatutorySOPAction {
  statutory_authority: string;
  legal_section: string;
  action_title: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  instruction: string;
  target_timeline_days: number;
}

export interface ExplainResponse {
  parcel_id: string;
  khasra_no?: string;
  baseline_expected_delay_days: number;
  predicted_delay_days: number;
  positive_drivers: SHAPDriver[];
  negative_drivers: SHAPDriver[];
  primary_bottleneck: string;
  prescriptive_actions: StatutorySOPAction[];
  prescriptions?: StatutorySOPAction[];
}

export interface PackageBottleneck {
  package_id: string;
  package_name: string;
  package_full: string;
  total_delay_days: number;
  legal_disputes_days: number;
  compensation_lag_days: number;
  missing_titles_days: number;
  forest_clearance_days: number;
}

export interface SurvivalHazardRatios {
  forest_land_hazard_ratio: number;
  civil_stay_hazard_ratio: number;
  low_disbursement_hazard_ratio: number;
  median_clearance_days_forest: number;
  median_clearance_days_non_forest: number;
}

export interface SurvivalCurveData {
  timeline_days: number[];
  survival_probabilities: number[];
  resolution_probabilities: number[];
  hazard_ratios: SurvivalHazardRatios;
  prob_exceeding_90_days: number;
  interpretation: string;
}

export type SectorPreset =
  | "NHAI Expressway"
  | "Dedicated Freight Corridor"
  | "Ultra-Mega Solar Power Park"
  | "Industrial Smart City"
  | "Urban Metro Transit";

export interface ParcelAttributes47 {
  parcel_id?: string;
  khasra_no?: string;
  khatauni_no?: string;
  village_name?: string;
  tehsil?: string;
  district?: string;
  chainage_km?: string;
  statutory_stage: string;
  days_in_current_stage?: number;
  land_type: string;
  total_area_hectares: number;
  affected_families_count: number;
  compensation_disbursed_pct: number;
  pending_court_injunctions: number;
  sec_3h_escrow_deposited?: boolean;
  jms_completed?: boolean;
  missing_title_deeds_pct: number;
  // Extended 47-Feature Attributes
  sector?: string;
  jurisdiction?: string;
  state?: string;
  district_or_corridor?: string;
  project_status?: string;
  project_spatial_type?: string;
  governing_statute?: string;
  infrastructure_type?: string;
  co_sharer_mutation_pending?: boolean;
  competent_authority_fund_liquidity?: number;
  forest_clearance_stage?: string;
  utility_lines_to_relocate_count?: number;
  is_critical_path_asset?: boolean;
  structures_count_residential?: number;
  commercial_establishments_count?: number;
  public_structure_obstruction?: string | null;
  active_environmental_protests?: string | null;
  labor_union_strike_days?: number;
  local_law_and_order_halts?: boolean;
  contractor_past_delay_index?: number;
  subcontractor_tier_rating?: string;
  equipment_telemetry_downtime?: number;
  labor_productivity_rate?: number;
  wpi_material_inflation?: number;
  regional_labor_availability?: string;
  material_lead_time_days?: number;
  monsoon_disruption_probability?: number;
  soil_bearing_capacity_variance?: number;
  groundwater_table_depth?: number;
  treasury_invoice_clearance_lag?: number;
  digital_record_fidelity_score?: number;
}

export interface BulkUpdateItem extends Partial<ParcelAttributes47> {
  parcel_id: string;
  khasra_no?: string;
  statutory_stage?: StatutoryStage;
  days_in_current_stage?: number;
  land_type?: LandClassification;
  total_area_hectares?: number;
  affected_families_count?: number;
  compensation_disbursed_pct?: number;
  pending_court_injunctions?: number;
  sec_3h_escrow_deposited?: boolean;
  jms_completed?: boolean;
  missing_title_deeds_pct?: number;
}

export interface BulkUpdatePayload {
  project_id: string;
  updates: BulkUpdateItem[];
}
