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

export interface BulkUpdateItem {
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
