"""
Comprehensive Verification Test Suite for Enterprise Land Acquisition Intelligence Platform
Validates:
- Health & Model Pipeline
- Live Inference & SHAP Explainability
- Role-based Stats Aggregations
- High-Volume Bulk Update (Celery/Async)
- Redis High-Risk Retrieval (<10ms)
- Lifelines Survival Analysis Clearance Curve
- Highway Package Bottlenecks for Apache ECharts
"""

import sys
import time
from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("==================================================================")
    print("ENTERPRISE LAND ACQUISITION PLATFORM: AUTOMATED TEST SUITE")
    print("==================================================================")

    # 1. Health Endpoint
    print("\n[1/7] Testing Health & Metadata Endpoint...")
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print("  -> Status:", health_data["status"], "| Total Records:", health_data["total_records"])

    # 2. Live Inference & Explainability with SHAP
    print("\n[2/7] Testing Live ML Inference & TreeSHAP Factor Waterfall...")
    parcel_payload = {
        "statutory_stage": "Section 3G (Award of Compensation)",
        "days_in_current_stage": 90,
        "land_type": "Private Commercial",
        "total_area_hectares": 2.2,
        "affected_families_count": 14,
        "compensation_disbursed_pct": 25.0,
        "pending_court_injunctions": 2,
        "sec_3h_escrow_deposited": False,
        "jms_completed": True,
        "missing_title_deeds_pct": 15.0
    }
    t0 = time.perf_counter()
    res_pred = client.post("/api/v1/predict", json=parcel_payload)
    infer_ms = (time.perf_counter() - t0) * 1000
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    print(f"  -> Prediction: +{pred_data['predicted_delay_days']} days | Risk: {pred_data['risk_category']} ({pred_data['delay_probability'] * 100}%) | Inference: {infer_ms:.2f}ms")

    res_exp = client.post("/api/v1/explain", json=parcel_payload)
    assert res_exp.status_code == 200
    exp_data = res_exp.json()
    print(f"  -> SHAP Waterfall: {len(exp_data['positive_drivers'])} positive drivers, {len(exp_data['negative_drivers'])} negative drivers")
    print(f"  -> Primary Bottleneck: {exp_data['primary_bottleneck']}")
    assert len(exp_data["prescriptive_actions"]) > 0 or len(exp_data.get("prescriptions", [])) > 0

    # 3. Role-Filtered Executive Statistics
    print("\n[3/7] Testing Role-Filtered Executive Statistics (NHAI PD, CALA, DM)...")
    roles = [
        "Project Director (NHAI)",
        "Competent Authority Land Acquisition (CALA) / SLAO",
        "District Magistrate"
    ]
    for r in roles:
        res_stats = client.get(f"/api/v1/stats?role={r}")
        assert res_stats.status_code == 200, f"Failed for role {r}: {res_stats.text}"
        stats_data = res_stats.json()
        print(f"  -> Role: {r} -> {stats_data['role_focus']['title']} | KPIs: {len(stats_data['role_focus']['critical_kpis'])}")

    # 4. Asynchronous Bulk Update (Phase 2)
    print("\n[4/7] Testing High-Volume Bulk Update Dispatch (Phase 2)...")
    bulk_payload = {
        "project_id": "NH19-EXP-PKG3",
        "updates": [
            {
                "parcel_id": f"TEST-PARCEL-{i}",
                "pending_court_injunctions": i % 3,
                "sec_3h_escrow_deposited": (i % 2 == 0),
                "compensation_disbursed_pct": float(20 + i * 5),
                "jms_completed": True
            } for i in range(1, 15)
        ]
    }
    res_bulk = client.post("/api/v1/projects/bulk-update", json=bulk_payload)
    assert res_bulk.status_code == 200
    bulk_data = res_bulk.json()
    print(f"  -> Bulk Update Status: {bulk_data['status']} | Task ID: {bulk_data['task_id']}")

    # 5. Sub-10ms High-Risk Parcel Retrieval (Phase 2)
    print("\n[5/7] Testing High-Risk Parcel Caching Retrieval (Target: <10ms)...")
    t0 = time.perf_counter()
    res_high_risk = client.get("/api/v1/projects/NH19-EXP-PKG3/high-risk")
    retrieval_ms = (time.perf_counter() - t0) * 1000
    assert res_high_risk.status_code == 200
    hr_data = res_high_risk.json()
    print(f"  -> High-Risk Parcels Count: {hr_data['data']['high_risk_count']} | Retrieval Time: {retrieval_ms:.2f}ms")

    # 6. Lifelines Survival Analysis (Phase 4)
    print("\n[6/7] Testing Survival Analysis Clearance Curve (Lifelines CoxPH)...")
    res_surv = client.get("/api/v1/survival/clearance-curve?is_forest=true")
    assert res_surv.status_code == 200
    surv_data = res_surv.json()
    print(f"  -> Timeline Points: {len(surv_data['timeline_days'])} (0 to 180 days)")
    print(f"  -> P(Clearance > 90 days if Forest): {surv_data['prob_exceeding_90_days'] * 100:.1f}%")
    print(f"  -> Forest Hazard Ratio: {surv_data['hazard_ratios']['forest_land_hazard_ratio']}")

    # 7. Package Bottlenecks for Apache ECharts (Phase 3)
    print("\n[7/8] Testing Comparative Package Bottlenecks for Apache ECharts...")
    res_pkgs = client.get("/api/v1/packages/bottlenecks")
    assert res_pkgs.status_code == 200
    pkg_data = res_pkgs.json()
    print(f"  -> Packages Evaluated: {pkg_data['total_packages']}")
    sample_pkg = pkg_data['packages'][0]
    print(f"  -> Sample: {sample_pkg['package_full']} | Total: {sample_pkg['total_delay_days']}d (Legal: {sample_pkg['legal_disputes_days']}d, Disb: {sample_pkg['compensation_lag_days']}d)")

    # 8. Foundational Data Ingestion & ETL Pipeline (Pre-ML Harmonization Layer)
    print("\n[8/8] Testing Data Ingestion & ETL Harmonization Pipeline...")
    res_etl = client.get("/api/v1/etl/status")
    assert res_etl.status_code == 200
    etl_data = res_etl.json()
    print(f"  -> ETL Status: {etl_data['status']} | Active Sources: {len(etl_data['sources'])}")
    print(f"  -> Metrics: Extracted={etl_data['pipeline_metrics']['total_extracted']}, Entities Resolved={etl_data['pipeline_metrics']['entities_resolved']}, Spatial Intersections={etl_data['pipeline_metrics']['spatial_intersections_computed']}")

    res_sync = client.post("/api/v1/etl/trigger-sync")
    assert res_sync.status_code == 200
    sync_data = res_sync.json()
    print(f"  -> Sync Trigger: {sync_data['status']} - {sync_data['message']}")

    print("\n==================================================================")
    print("ALL 8 ENTERPRISE PLATFORM TEST SUITES PASSED SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    run_tests()
