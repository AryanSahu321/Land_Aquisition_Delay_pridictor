"""
Domain-Authentic Land Acquisition Data Generator & GIS Corridor Synthesizer
Strict compliance with Indian statutory frameworks:
- National Highways Act, 1956 (Sections 3A, 3D, 3G, 3E, 3H)
- RFCTLARR Act, 2013 (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement)
- State Revenue Records Mechanics (UP Bhulekh / Bhoomi Rashi portal standard)
"""

import json
import random
import numpy as np
import pandas as pd
from typing import List, Dict, Any

STATUTORY_STAGES = [
    "Section 3A (Notice of Intent)",
    "Section 3D (Declaration of Acquisition)",
    "Section 3G (Award of Compensation)",
    "Section 3E (Notice for Taking Possession)"
]

LAND_TYPES = [
    "Private Agricultural",
    "Private Commercial",
    "Forest Land",
    "Government Abadi"
]

TEHSIL_CODES = {
    "Soraon": "SOR",
    "Phulpur": "PHL",
    "Karchhana": "KCH",
    "Handia": "HND",
    "Pindra": "PND",
    "Raja Talab": "RJT",
    "Varanasi Sadar": "VNS",
    "Chunar": "CNR",
    "Mirzapur Sadar": "MZP",
    "Lalganj": "LLG"
}

DISTRICTS_TEHSILS = {
    "Prayagraj": ["Soraon", "Phulpur", "Handia", "Karchhana"],
    "Varanasi": ["Pindra", "Raja Talab", "Varanasi Sadar"],
    "Mirzapur": ["Chunar", "Mirzapur Sadar", "Lalganj"]
}

VILLAGES = [
    "Dahiyawan", "Mandor", "Sarai Gopal", "Bhagwanpur", "Kasidaha",
    "Chaukhamba", "Mohanpur", "Jalalpur", "Kalyanpur", "Rampur",
    "Bishunpur", "Chandpur", "Fatehpur", "Shivpur", "Taraon",
    "Saidpur", "Bikrampur", "Harishchandrapur", "Maharajganj", "Katra"
]

PROJECT_NAME = "NH-19 Expressway Expansion, Package 3 (Prayagraj-Varanasi Corridor)"
PROJECT_ID = "NH19-EXP-PKG3"

def generate_synthetic_dataset(num_records: int = 220, seed: int = 42) -> List[Dict[str, Any]]:
    """
    Generates realistic synthetic statutory land acquisition parcel records
    adhering strictly to Indian statutory constraints, stage gates, and physical dependencies.
    """
    random.seed(seed)
    np.random.seed(seed)

    records = []
    districts = list(DISTRICTS_TEHSILS.keys())

    for i in range(1, num_records + 1):
        # District, Tehsil, Village
        district = random.choices(districts, weights=[0.45, 0.35, 0.20])[0]
        tehsil = random.choice(DISTRICTS_TEHSILS[district])
        village = random.choice(VILLAGES)
        tehsil_code = TEHSIL_CODES.get(tehsil, "REV")

        # Revenue records numbering (UP Bhulekh / Bhoomi Rashi format)
        main_khasra = random.randint(25, 680)
        sub_khasra = random.randint(1, 6)
        khasra_no = f"{main_khasra}/{sub_khasra}"
        khasra_sanitized = f"{main_khasra}-{sub_khasra}"
        khatauni_no = f"KH-{random.randint(1100, 8950)}"

        # Standard statutory parcel ID
        # Format: UP-PRG-{TEHSIL}-{KHASRA_SANITIZED}
        dist_code = district[:3].upper()
        parcel_id = f"UP-{dist_code}-{tehsil_code}-{khasra_sanitized}"

        # Linear chainage stationing along NH-19 (km 14+000 onwards)
        km_start = 14.0 + ((i - 1) * 0.300)
        km_len = round(random.uniform(0.180, 0.380), 3)
        km_end = km_start + km_len
        chainage_str = f"km {int(km_start)}+{int(round((km_start % 1) * 1000)):03d} to km {int(km_end)}+{int(round((km_end % 1) * 1000)):03d}"

        # 4-Stage Lifecycle Distribution
        # Section 3A (Notice of Intent) -> 3D (Declaration) -> 3G (Award) -> 3E (Possession)
        stage = random.choices(STATUTORY_STAGES, weights=[0.24, 0.32, 0.28, 0.16])[0]

        # Elapsed days in current statutory stage
        if stage == "Section 3A (Notice of Intent)":
            # Section 3D must be published within 365 days; test parcels nearing statutory lapse window
            days_in_current_stage = random.choices(
                [random.randint(20, 150), random.randint(151, 290), random.randint(295, 360)],
                weights=[0.50, 0.32, 0.18]
            )[0]
        elif stage == "Section 3D (Declaration of Acquisition)":
            days_in_current_stage = random.randint(30, 240)
        elif stage == "Section 3G (Award of Compensation)":
            days_in_current_stage = random.randint(45, 300)
        else: # Section 3E (Notice for Taking Possession)
            days_in_current_stage = random.randint(15, 90)

        # Land type distribution
        land_type = random.choices(LAND_TYPES, weights=[0.62, 0.16, 0.12, 0.10])[0]

        # Area and affected families count
        total_area_hectares = round(random.uniform(0.32, 4.65), 2)
        if land_type == "Private Commercial":
            affected_families_count = random.randint(5, 32)
        elif land_type == "Private Agricultural":
            affected_families_count = max(1, int(total_area_hectares * random.uniform(2.2, 5.5)))
        elif land_type == "Government Abadi":
            affected_families_count = random.randint(8, 38)
        else: # Forest Land
            affected_families_count = random.randint(0, 2)

        # Mandatory Statutory Survey Dependency (Joint Measurement Survey - JMS)
        # Section 3A allows pending JMS. Section 3D/3G legally requires completed JMS.
        # However, incomplete JMS may administratively stall progress to 3D/3G.
        if stage == "Section 3A (Notice of Intent)":
            jms_completed = random.random() < 0.45
        elif stage == "Section 3D (Declaration of Acquisition)":
            jms_completed = random.random() < 0.88  # ~12% have stalled survey defects
        else:
            jms_completed = random.random() < 0.98

        # Pending civil court injunctions (active judicial stays / writ petitions)
        if land_type == "Private Commercial":
            inj_weights = [0.42, 0.36, 0.16, 0.06]
        elif land_type == "Private Agricultural":
            inj_weights = [0.66, 0.22, 0.09, 0.03]
        elif land_type == "Forest Land":
            inj_weights = [0.88, 0.10, 0.02, 0.00]
        else:
            inj_weights = [0.58, 0.28, 0.11, 0.03]
        pending_court_injunctions = random.choices([0, 1, 2, 3], weights=inj_weights)[0]

        # Section 3H Escrow Deposit Flag (disputed compensation deposited in reference court)
        # If pending injunctions exist, has CALA deposited funds into Section 3H(4) escrow?
        if pending_court_injunctions > 0 and stage in ["Section 3G (Award of Compensation)", "Section 3E (Notice for Taking Possession)"]:
            sec_3h_escrow_deposited = random.random() < 0.42
        else:
            sec_3h_escrow_deposited = False

        # Missing title deeds / Succession mutation gaps (UP Revenue Code 2006)
        if land_type == "Private Agricultural":
            missing_title_deeds_pct = round(np.clip(random.gauss(26, 18), 0, 95), 1)
        elif land_type == "Private Commercial":
            missing_title_deeds_pct = round(np.clip(random.gauss(16, 14), 0, 80), 1)
        elif land_type == "Government Abadi":
            missing_title_deeds_pct = round(np.clip(random.gauss(46, 24), 0, 100), 1)
        else:
            missing_title_deeds_pct = 0.0

        # Stage-Gated Disbursement Precedents (Statutory Compliance Rule 1):
        # - Sec 3A & Sec 3D: strictly 0.0% (legally impossible before Sec 3G award)
        # - Sec 3G: partial disbursement (15.0% - 75.0%)
        # - Sec 3E: must be > 85.0% OR sec_3h_escrow_deposited = True (possession requires payment or escrow)
        if stage in ["Section 3A (Notice of Intent)", "Section 3D (Declaration of Acquisition)"]:
            compensation_disbursed_pct = 0.0
        elif stage == "Section 3G (Award of Compensation)":
            base_disb = random.uniform(15.0, 75.0)
            if pending_court_injunctions > 0 and not sec_3h_escrow_deposited:
                base_disb *= 0.45
            if missing_title_deeds_pct > 35:
                base_disb *= (1.0 - (missing_title_deeds_pct / 160.0))
            compensation_disbursed_pct = round(np.clip(base_disb, 5.0, 75.0), 1)
        else: # Section 3E (Notice for Taking Possession)
            if sec_3h_escrow_deposited:
                # With escrow deposited, remaining direct payment can be lower (40% to 92%)
                compensation_disbursed_pct = round(random.uniform(55.0, 95.0), 1)
            else:
                # Strictly > 85.0% to take legal possession
                compensation_disbursed_pct = round(random.uniform(85.5, 100.0), 1)

        # ----------------------------------------------------------------------
        # Statutory Ground-Truth Delay Engine (Domain-Compliant State Machine)
        # ----------------------------------------------------------------------
        # Base administrative processing duration by stage
        base_stage_delay = {
            "Section 3A (Notice of Intent)": 15,
            "Section 3D (Declaration of Acquisition)": 28,
            "Section 3G (Award of Compensation)": 38,
            "Section 3E (Notice for Taking Possession)": 10
        }[stage]

        delay = base_stage_delay

        # Rule 2: Mandatory Survey Dependency (JMS Incomplete)
        # Incomplete JMS halts 3D/3G declarations and adds +45 to +90 days
        if not jms_completed:
            delay += random.uniform(48.0, 88.0)
        else:
            delay -= random.uniform(6.0, 14.0)

        # Rule 3: Section 3D Statutory Sunset / 365-Day Lapse Clock
        # If Section 3A > 300 days without Section 3D, triggers statutory lapse emergency (+90 to +180 days)
        if stage == "Section 3A (Notice of Intent)" and days_in_current_stage > 300:
            delay += random.uniform(95.0, 175.0)
        elif stage == "Section 3A (Notice of Intent)" and days_in_current_stage > 220:
            delay += random.uniform(35.0, 65.0)

        # Rule 4: Litigation vs. Section 3H Escrow Dampener
        # - Civil stay without escrow: severe stall (+60 to +120 days per injunction)
        # - With Sec 3H escrow deposited: mitigated to +15 to +30 days
        if pending_court_injunctions > 0:
            if not sec_3h_escrow_deposited:
                delay += pending_court_injunctions * random.uniform(62.0, 115.0)
            else:
                delay += pending_court_injunctions * random.uniform(16.0, 28.0)

        # Rule 5: Forest Land Inter-Departmental Clearance (MoEFCC Stage-I/II approvals)
        # Automatic overhead (+60 to +140 days)
        if land_type == "Forest Land":
            delay += random.uniform(65.0, 135.0)

        # Rule 6: Missing Title Deeds & Heirship Verification
        if missing_title_deeds_pct > 50.0:
            delay += random.uniform(32.0, 58.0)
        elif missing_title_deeds_pct > 25.0:
            delay += random.uniform(14.0, 28.0)

        # Rule 7: Low Disbursement during Section 3G/3E
        if stage in ["Section 3G (Award of Compensation)", "Section 3E (Notice for Taking Possession)"]:
            if compensation_disbursed_pct < 30.0:
                delay += random.uniform(30.0, 55.0)
            elif compensation_disbursed_pct > 88.0:
                delay -= random.uniform(12.0, 22.0)

        # Administrative normal noise (+/- 4 days)
        delay += random.gauss(0, 4)
        actual_delay_days = max(0, int(round(delay)))

        records.append({
            "project_id": PROJECT_ID,
            "project_name": PROJECT_NAME,
            "parcel_id": parcel_id,
            "khasra_no": khasra_no,
            "khatauni_no": khatauni_no,
            "village_name": village,
            "village": village,  # compatibility alias
            "tehsil": tehsil,
            "district": district,
            "chainage_km": chainage_str,
            "statutory_stage": stage,
            "days_in_current_stage": days_in_current_stage,
            "land_type": land_type,
            "total_area_hectares": total_area_hectares,
            "area_hectares": total_area_hectares,  # compatibility alias
            "affected_families_count": affected_families_count,
            "compensation_disbursed_pct": compensation_disbursed_pct,
            "pending_court_injunctions": pending_court_injunctions,
            "sec_3h_escrow_deposited": sec_3h_escrow_deposited,
            "jms_completed": bool(jms_completed),
            "joint_measurement_survey_done": bool(jms_completed),  # compatibility alias
            "missing_title_deeds_pct": missing_title_deeds_pct,
            "actual_delay_days": actual_delay_days
        })

    return records


def generate_corridor_geojson(records: List[Dict[str, Any]], count: int = 25) -> Dict[str, Any]:
    """
    Generates a 25-parcel contiguous right-of-way corridor aligned along
    the NH-19 alignment (Prayagraj-Handia-Varanasi). Returns standard GeoJSON FeatureCollection.
    """
    start_lat = 25.4520
    start_lon = 81.8700
    features = []

    corridor_records = records[:count]
    half_width = 0.00030
    step_lon = 0.0042
    step_lat = 0.0009

    for idx, rec in enumerate(corridor_records):
        p_lat = start_lat + (idx * step_lat) + (0.0002 * np.sin(idx / 3.0))
        p_lon = start_lon + (idx * step_lon)

        p_lat_next = start_lat + ((idx + 1) * step_lat) + (0.0002 * np.sin((idx + 1) / 3.0))
        p_lon_next = start_lon + ((idx + 1) * step_lon)

        c1 = [round(p_lon, 6), round(p_lat + half_width, 6)]
        c2 = [round(p_lon_next, 6), round(p_lat_next + half_width, 6)]
        c3 = [round(p_lon_next, 6), round(p_lat_next - half_width, 6)]
        c4 = [round(p_lon, 6), round(p_lat - half_width, 6)]
        polygon_coords = [[c1, c2, c3, c4, c1]]

        feature = {
            "type": "Feature",
            "id": rec["parcel_id"],
            "geometry": {
                "type": "Polygon",
                "coordinates": polygon_coords
            },
            "properties": {
                **rec,
                "center_lat": round((p_lat + p_lat_next) / 2, 6),
                "center_lon": round((p_lon + p_lon_next) / 2, 6),
                "sequence_no": idx + 1
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "metadata": {
            "corridor_name": "NH-19 Expressway Expansion Package 3 Right-of-Way Corridor",
            "statutory_act": "National Highways Act, 1956 & RFCTLARR Act, 2013",
            "total_parcels": count,
            "center_lat": 25.463,
            "center_lon": 81.922,
            "zoom": 13
        },
        "features": features
    }
