import json
import logging
from pathlib import Path
from typing import Dict, Any, List

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
WEIGHTS_FILE = DATA_DIR / "document_ranking_weights.json"

DEFAULT_RANKING_WEIGHTS = {
    "Gazette_Sec3D_Declaration": {
        "priority_score": 0.95,
        "historical_latency_ms": 120,
        "statutory_field_yield": ["total_area_hectares", "missing_title_deeds_pct", "co_sharer_mutation_pending", "forest_clearance_stage", "is_critical_path_asset"],
        "total_scans": 1
    },
    "CALA_Award_Disbursement_Order": {
        "priority_score": 0.92,
        "historical_latency_ms": 110,
        "statutory_field_yield": ["compensation_disbursed_pct", "pending_court_injunctions", "sec_3h_escrow_deposited", "competent_authority_fund_liquidity"],
        "total_scans": 1
    },
    "Gazette_Sec3A_Notification": {
        "priority_score": 0.88,
        "historical_latency_ms": 130,
        "statutory_field_yield": ["statutory_stage", "days_in_current_stage", "total_area_hectares", "affected_families_count", "land_type"],
        "total_scans": 1
    },
    "DPR_Executive_Summary": {
        "priority_score": 0.82,
        "historical_latency_ms": 180,
        "statutory_field_yield": ["structures_count_residential", "commercial_establishments_count", "monsoon_disruption_probability", "soil_bearing_capacity_variance", "contractor_past_delay_index"],
        "total_scans": 1
    },
    "Flash_Report_MoSPI": {
        "priority_score": 0.80,
        "historical_latency_ms": 190,
        "statutory_field_yield": ["actual_delay_days", "project_status", "days_in_current_stage"],
        "total_scans": 1
    },
    "QPISR_Status_Report": {
        "priority_score": 0.78,
        "historical_latency_ms": 210,
        "statutory_field_yield": ["utility_lines_to_relocate_count", "joint_measurement_survey_done", "compensation_disbursed_pct"],
        "total_scans": 1
    },
    "Resettlement_Plan_ADB_WB": {
        "priority_score": 0.75,
        "historical_latency_ms": 250,
        "statutory_field_yield": ["affected_families_count", "structures_count_residential", "compensation_disbursed_pct"],
        "total_scans": 1
    },
    "General_Document": {
        "priority_score": 0.50,
        "historical_latency_ms": 300,
        "statutory_field_yield": [],
        "total_scans": 1
    }
}


class AdaptiveDocumentRanker:
    """
    Self-improving engine that ranks document parsing priority based on
    parameter yield, accuracy, and extraction latency.
    """
    def __init__(self, weights_path: Path = WEIGHTS_FILE):
        self.weights_path = weights_path
        self.weights: Dict[str, Any] = self._load_weights()

    def _load_weights(self) -> Dict[str, Any]:
        if self.weights_path.exists():
            try:
                with open(self.weights_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logging.warning(f"Could not read {self.weights_path}: {e}. Initializing defaults.")
        
        # Save defaults
        self.weights_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.weights_path, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_RANKING_WEIGHTS, f, indent=2)
        return DEFAULT_RANKING_WEIGHTS.copy()

    def save_weights(self):
        try:
            with open(self.weights_path, "w", encoding="utf-8") as f:
                json.dump(self.weights, f, indent=2)
        except Exception as e:
            logging.error(f"Failed to save document ranking weights: {e}")

    def get_priority_score(self, doc_type: str) -> float:
        return self.weights.get(doc_type, {}).get("priority_score", 0.50)

    def sort_documents_by_priority(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sorts candidate document files so high-yield documents are parsed first."""
        return sorted(
            documents,
            key=lambda d: self.get_priority_score(d.get("doc_type", "General_Document")),
            reverse=True
        )

    def update_metrics(self, doc_type: str, latency_ms: float, fields_found_count: int):
        """Updates moving average latency and priority score for a document type."""
        if doc_type not in self.weights:
            self.weights[doc_type] = {
                "priority_score": 0.60,
                "historical_latency_ms": latency_ms,
                "statutory_field_yield": [],
                "total_scans": 1
            }
        
        entry = self.weights[doc_type]
        scans = entry.get("total_scans", 1) + 1
        entry["total_scans"] = scans
        
        # Exponential moving average for latency
        prev_latency = entry.get("historical_latency_ms", latency_ms)
        entry["historical_latency_ms"] = round(0.8 * prev_latency + 0.2 * latency_ms, 1)
        
        # Priority increases with yield, decreases with high latency
        speed_factor = max(0.2, min(1.0, 500.0 / max(entry["historical_latency_ms"], 50.0)))
        yield_factor = min(1.0, fields_found_count / 8.0)
        entry["priority_score"] = round(0.7 * entry.get("priority_score", 0.5) + 0.3 * (0.6 * yield_factor + 0.4 * speed_factor), 3)
        
        self.save_weights()

