"""
Verification script for statutory AI backend endpoints.
"""

import sys
from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("Health OK:", res.json())

    print("\n--- 2. Testing Section 3D Lapse Window Risk (Sec 3A > 300 days) ---")
    res = client.post("/api/v1/explain", json={
        "statutory_stage": "Section 3A (Notice of Intent)",
        "days_in_current_stage": 325,
        "land_type": "Private Agricultural",
        "total_area_hectares": 1.8,
        "affected_families_count": 8,
        "compensation_disbursed_pct": 0.0,
        "pending_court_injunctions": 0,
        "sec_3h_escrow_deposited": False,
        "jms_completed": True,
        "missing_title_deeds_pct": 10.0
    })
    assert res.status_code == 200
    explain_data = res.json()
    print("Predicted delay days:", explain_data["predicted_delay_days"])
    print("Primary bottleneck:", explain_data["primary_bottleneck"])
    drivers = [d["display_name"] for d in explain_data["positive_drivers"]]
    print("Positive Drivers:", drivers)
    assert any("Lapse" in d for d in drivers), "Section 3D Lapse Window Risk not cited in drivers!"

    print("\n--- 3. Testing Civil Stay without Sec 3H Escrow ---")
    res = client.post("/api/v1/explain", json={
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
    })
    assert res.status_code == 200
    drivers = [d["display_name"] for d in res.json()["positive_drivers"]]
    print("Drivers with Stay & No Escrow:", drivers)
    assert any("Civil Stay without Sec 3H Escrow" in d for d in drivers), "Stay without Escrow not cited!"

    print("\n--- 4. Testing JMS Incomplete Block ---")
    res = client.post("/api/v1/explain", json={
        "statutory_stage": "Section 3D (Declaration of Acquisition)",
        "days_in_current_stage": 60,
        "land_type": "Private Agricultural",
        "total_area_hectares": 1.5,
        "affected_families_count": 6,
        "compensation_disbursed_pct": 0.0,
        "pending_court_injunctions": 0,
        "sec_3h_escrow_deposited": False,
        "jms_completed": False,
        "missing_title_deeds_pct": 12.0
    })
    assert res.status_code == 200
    drivers = [d["display_name"] for d in res.json()["positive_drivers"]]
    print("Drivers with Incomplete JMS:", drivers)
    assert any("JMS Incomplete Block" in d for d in drivers), "JMS Incomplete Block not cited!"

    print("\n--- 5. Testing Forest Stage-II Clearance Pending ---")
    res = client.post("/api/v1/explain", json={
        "statutory_stage": "Section 3D (Declaration of Acquisition)",
        "days_in_current_stage": 60,
        "land_type": "Forest Land",
        "total_area_hectares": 3.5,
        "affected_families_count": 0,
        "compensation_disbursed_pct": 0.0,
        "pending_court_injunctions": 0,
        "sec_3h_escrow_deposited": False,
        "jms_completed": True,
        "missing_title_deeds_pct": 0.0
    })
    assert res.status_code == 200
    drivers = [d["display_name"] for d in res.json()["positive_drivers"]]
    print("Drivers with Forest Land:", drivers)
    assert any("Forest" in d for d in drivers), "Forest Clearance not cited!"

    print("\n--- 6. Testing Corridor GeoJSON ---")
    res = client.get("/api/v1/corridor/geojson")
    assert res.status_code == 200
    geo = res.json()
    print(f"Corridor features: {len(geo['features'])}")
    feat0 = geo["features"][0]["properties"]
    print("Parcel ID:", feat0["parcel_id"], "Khasra:", feat0.get("khasra_no"), "Delay:", feat0.get("predicted_delay_days"), "Bottleneck:", feat0.get("primary_bottleneck"))

    print("\n--- 7. Testing Role Filtering on Stats Endpoint ---")
    roles = [
        "Project Director (NHAI)",
        "Competent Authority Land Acquisition (CALA) / SLAO",
        "District Magistrate"
    ]
    for r in roles:
        res = client.get(f"/api/v1/stats?role={r}")
        assert res.status_code == 200
        data = res.json()
        print(f"Role: {r} -> {data['role_focus']['title']} | KPIs: {len(data['role_focus']['critical_kpis'])}")

    print("\nALL STATUTORY BACKEND COMPLIANCE TESTS PASSED!")

if __name__ == "__main__":
    run_tests()

