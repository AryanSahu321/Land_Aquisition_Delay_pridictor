"""
Comprehensive PostGIS Spatial Seed Script:
Populates Supabase PostGIS with realistic alignments, milestones, and 120m intercepted cadastral parcels
for all major Indian infrastructure corridors in the Central Database.
"""

import json
import math
import psycopg2
from psycopg2.extras import Json

DB_URL = "postgresql://postgres.fyihanhtkoarqkpyutub:Aryan%40An1499@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

ALL_PROJECTS = [
    {
        "id": "PRJ-PURVANCHAL",
        "name": "Purvanchal Expressway",
        "state": "Uttar Pradesh",
        "length_km": 340.8,
        "packages": 8,
        "center": [26.25, 82.35],
        "zoom": 9,
        "alignment": [
            [26.755, 81.065], [26.702, 81.220], [26.635, 81.425], [26.540, 81.650],
            [26.475, 81.820], [26.380, 82.020], [26.315, 82.190], [26.260, 82.380],
            [26.195, 82.560], [26.120, 82.780], [26.080, 82.980], [26.025, 83.160],
            [25.960, 83.330], [25.880, 83.450], [25.790, 83.520], [25.680, 83.555],
            [25.585, 83.585]
        ],
        "milestones": [
            {"name": "📍 km 0: Chand Saray, Lucknow", "coords": [26.755, 81.065]},
            {"name": "📍 km 48: Haidargarh, Barabanki", "coords": [26.635, 81.425]},
            {"name": "📍 km 114: Kurebhar, Sultanpur", "coords": [26.380, 82.020]},
            {"name": "📍 km 178: Akhand Nagar, Ambedkar Nagar", "coords": [26.195, 82.560]},
            {"name": "📍 km 248: Rani Ki Sarai, Azamgarh", "coords": [26.025, 83.160]},
            {"name": "📍 km 294: Muhammadabad, Mau", "coords": [25.880, 83.450]},
            {"name": "📍 km 340.8: Haidaria, Ghazipur (Terminal)", "coords": [25.585, 83.585]}
        ],
        "parcels": [
            {"id": "PKG-01-PAR-101", "khasra": "Khasra #214/1A", "village": "Chand Saray", "district": "Lucknow", "pkg": "Package 1", "chainage": "km 04+250", "area": 1.45, "khatedar": "Rameshwar Prasad & 4 Co-sharers", "disbursed": 45.0, "locked": "₹38.5 Lakh", "stay": "Civil Court Suit #114/2024 (Succession)", "statute": "NH Act Sec 3H(4) Escrow Deposited", "delay": 52, "prob": 0.82, "risk": "CRITICAL", "lat": 26.745, "lon": 81.095},
            {"id": "PKG-01-PAR-102", "khasra": "Khasra #302", "village": "Gosainganj", "district": "Lucknow", "pkg": "Package 1", "chainage": "km 14+800", "area": 2.10, "khatedar": "Awadh Agro Logistics Corp", "disbursed": 92.0, "locked": "₹4.2 Lakh", "stay": "None (Clear Title)", "statute": "Section 3E Possession Handed Over", "delay": 8, "prob": 0.15, "risk": "LOW", "lat": 26.720, "lon": 81.168},
            {"id": "PKG-01-PAR-103", "khasra": "Khasra #88/B", "village": "Mohanlalganj", "district": "Barabanki", "pkg": "Package 1", "chainage": "km 28+100", "area": 0.95, "khatedar": "Dinanath Yadav & Sons", "disbursed": 68.0, "locked": "₹18.0 Lakh", "stay": "Mutation Verification Pending", "statute": "Section 3G Award Determined", "delay": 28, "prob": 0.48, "risk": "MODERATE", "lat": 26.680, "lon": 81.285},
            {"id": "PKG-02-PAR-201", "khasra": "Khasra #412", "village": "Haidargarh", "district": "Barabanki", "pkg": "Package 2", "chainage": "km 48+400", "area": 3.20, "khatedar": "Cooperative Farmers Trust", "disbursed": 30.0, "locked": "₹82.4 Lakh", "stay": "High Court Stay on Circle Rate Compensation", "statute": "Section 3H(4) Court Escrow Pending", "delay": 78, "prob": 0.89, "risk": "CRITICAL", "lat": 26.635, "lon": 81.425},
            {"id": "PKG-02-PAR-202", "khasra": "Khasra #119", "village": "Bhikharpur", "district": "Amethi", "pkg": "Package 2", "chainage": "km 64+150", "area": 1.10, "khatedar": "Shyam Sundar & Brothers", "disbursed": 98.0, "locked": "₹1.5 Lakh", "stay": "None", "statute": "Section 3E Possession Taken", "delay": 5, "prob": 0.12, "risk": "LOW", "lat": 26.565, "lon": 81.590},
            {"id": "PKG-02-PAR-203", "khasra": "Khasra #561", "village": "Inhauna", "district": "Amethi", "pkg": "Package 2", "chainage": "km 76+900", "area": 1.80, "khatedar": "Kamla Devi (Guardian)", "disbursed": 75.0, "locked": "₹24.0 Lakh", "stay": "Minor Succession Certificate Awaited", "statute": "Section 3G Award Notice Issued", "delay": 34, "prob": 0.55, "risk": "MODERATE", "lat": 26.525, "lon": 81.690},
            {"id": "PKG-03-PAR-301", "khasra": "Khasra #89/2", "village": "Kurebhar", "district": "Sultanpur", "pkg": "Package 3", "chainage": "km 96+200", "area": 2.40, "khatedar": "State Revenue Department", "disbursed": 100.0, "locked": "₹0", "stay": "None (Govt Land Transferred)", "statute": "Vested Absolutely in State u/s 3D(2)", "delay": 0, "prob": 0.05, "risk": "LOW", "lat": 26.445, "lon": 81.885},
            {"id": "PKG-03-PAR-302", "khasra": "Khasra #304/A", "village": "Dhanpatganj", "district": "Sultanpur", "pkg": "Package 3", "chainage": "km 114+400", "area": 1.75, "khatedar": "Brijesh Mishra & 8 Heirs", "disbursed": 40.0, "locked": "₹45.0 Lakh", "stay": "Reference Petition u/s 3H(4)", "statute": "Deposited in District Court Escrow", "delay": 62, "prob": 0.79, "risk": "CRITICAL", "lat": 26.380, "lon": 82.020},
            {"id": "PKG-04-PAR-401", "khasra": "Khasra #211", "village": "Kuwar", "district": "Sultanpur", "pkg": "Package 4", "chainage": "km 134+000", "area": 1.30, "khatedar": "Harishchandra Pandey", "disbursed": 80.0, "locked": "₹12.5 Lakh", "stay": "Title Boundary Mismatch (JMS Required)", "statute": "Section 3B Re-Survey Ordered", "delay": 25, "prob": 0.42, "risk": "MODERATE", "lat": 26.315, "lon": 82.190},
            {"id": "PKG-04-PAR-402", "khasra": "Khasra #67/1", "village": "Dostpur", "district": "Ambedkar Nagar", "pkg": "Package 4", "chainage": "km 156+700", "area": 2.80, "khatedar": "Ganga Bricks Corp", "disbursed": 35.0, "locked": "₹95.0 Lakh", "stay": "High Court Injunction on Structure Valuation", "statute": "Section 3G Valuation Contested", "delay": 85, "prob": 0.91, "risk": "CRITICAL", "lat": 26.260, "lon": 82.380},
            {"id": "PKG-05-PAR-501", "khasra": "Khasra #142", "village": "Akhand Nagar", "district": "Ambedkar Nagar", "pkg": "Package 5", "chainage": "km 178+300", "area": 1.60, "khatedar": "Abdul Latif & Co-owners", "disbursed": 70.0, "locked": "₹22.0 Lakh", "stay": "Partition Deed Registration Pending", "statute": "Section 3G Award Finalized", "delay": 32, "prob": 0.52, "risk": "MODERATE", "lat": 26.195, "lon": 82.560},
            {"id": "PKG-05-PAR-502", "khasra": "Khasra #55/3", "village": "Pawai Border", "district": "Azamgarh", "pkg": "Package 5", "chainage": "km 204+600", "area": 2.20, "khatedar": "Triveni Sahai & Heirs", "disbursed": 94.0, "locked": "₹5.1 Lakh", "stay": "None", "statute": "Section 3E Complete Handover", "delay": 6, "prob": 0.14, "risk": "LOW", "lat": 26.120, "lon": 82.780},
            {"id": "PKG-06-PAR-601", "khasra": "Khasra #428/B", "village": "Phoolpur Pawai", "district": "Azamgarh", "pkg": "Package 6", "chainage": "km 226+600", "area": 3.40, "khatedar": "Ram Naresh Singh & 12 Heirs", "disbursed": 25.0, "locked": "₹1.15 Crore", "stay": "Stay Order: Fruit-Bearing Tree Valuation Dispute", "statute": "Escrow Deposited in Azamgarh District Court", "delay": 95, "prob": 0.94, "risk": "CRITICAL", "lat": 26.080, "lon": 82.980},
            {"id": "PKG-06-PAR-602", "khasra": "Khasra #712", "village": "Rani Ki Sarai", "district": "Azamgarh", "pkg": "Package 6", "chainage": "km 248+100", "area": 1.90, "khatedar": "UPEIDA Acquired Land", "disbursed": 100.0, "locked": "₹0", "stay": "None", "statute": "Section 3E Complete Handover", "delay": 0, "prob": 0.08, "risk": "LOW", "lat": 26.025, "lon": 83.160},
            {"id": "PKG-07-PAR-701", "khasra": "Khasra #180/1", "village": "Jahanaganj", "district": "Azamgarh/Mau", "pkg": "Package 7", "chainage": "km 272+500", "area": 1.55, "khatedar": "Vikramaditya Sahai", "disbursed": 65.0, "locked": "₹28.5 Lakh", "stay": "Joint Measurement Survey Demarcation", "statute": "Section 3B/3G Transition", "delay": 30, "prob": 0.50, "risk": "MODERATE", "lat": 25.960, "lon": 83.330},
            {"id": "PKG-07-PAR-702", "khasra": "Khasra #329", "village": "Muhammadabad Gohna", "district": "Mau", "pkg": "Package 7", "chainage": "km 294+000", "area": 2.10, "khatedar": "Devendra Maurya & Sons", "disbursed": 78.0, "locked": "₹14.2 Lakh", "stay": "Missing Title Mutation", "statute": "Section 3G Verification", "delay": 22, "prob": 0.40, "risk": "MODERATE", "lat": 25.880, "lon": 83.450},
            {"id": "PKG-08-PAR-801", "khasra": "Khasra #512/3", "village": "Mardah", "district": "Ghazipur", "pkg": "Package 8", "chainage": "km 326+400", "area": 2.75, "khatedar": "Choudhary Khasra Syndicate", "disbursed": 20.0, "locked": "₹76.0 Lakh", "stay": "Injunction on NH-31 Junction Link", "statute": "Section 3H Court Escrow Deposited", "delay": 74, "prob": 0.86, "risk": "CRITICAL", "lat": 25.680, "lon": 83.555},
            {"id": "PKG-08-PAR-802", "khasra": "Khasra #84", "village": "Haidaria (Terminal)", "district": "Ghazipur", "pkg": "Package 8", "chainage": "km 340+500", "area": 3.80, "khatedar": "UPEIDA Infrastructure Depot", "disbursed": 100.0, "locked": "₹0", "stay": "None (Commissioned & Operational)", "statute": "Vested Absolutely in State", "delay": 0, "prob": 0.05, "risk": "LOW", "lat": 25.585, "lon": 83.585}
        ]
    },
    {
        "id": "PRJ-BUNDELKHAND",
        "name": "Bundelkhand Expressway",
        "state": "Uttar Pradesh",
        "length_km": 296.07,
        "packages": 6,
        "center": [25.75, 79.80],
        "zoom": 9,
        "alignment": [
            [25.215, 80.920], [25.350, 80.680], [25.540, 80.320], [25.720, 79.910],
            [25.920, 79.620], [26.350, 79.350], [26.780, 79.020]
        ],
        "milestones": [
            {"name": "📍 km 0: Bharatkoop, Chitrakoot", "coords": [25.215, 80.920]},
            {"name": "📍 km 50: Banda Bypass", "coords": [25.540, 80.320]},
            {"name": "📍 km 125: Maudaha, Hamirpur", "coords": [25.720, 79.910]},
            {"name": "📍 km 190: Orai, Jalaun", "coords": [25.920, 79.620]},
            {"name": "📍 km 250: Auraiya Interchange", "coords": [26.350, 79.350]},
            {"name": "📍 km 296: Kudrail, Etawah (Terminal)", "coords": [26.780, 79.020]}
        ],
        "parcels": [
            {"id": "BD-PKG01-01", "khasra": "Khasra #114", "village": "Bharatkoop", "district": "Chitrakoot", "pkg": "Package 1", "chainage": "km 08+200", "area": 2.1, "khatedar": "Kamadgiri Stone Quarry Syndicate", "disbursed": 35.0, "locked": "₹72.0 Lakh", "stay": "Mining Lease Compensation Dispute", "statute": "Section 3H Court Escrow Deposited", "delay": 65, "prob": 0.84, "risk": "CRITICAL", "lat": 25.230, "lon": 80.890},
            {"id": "BD-PKG01-02", "khasra": "Khasra #88/1", "village": "Banda Rural", "district": "Banda", "pkg": "Package 1", "chainage": "km 32+400", "area": 1.4, "khatedar": "Ramcharan Shukla", "disbursed": 90.0, "locked": "₹5.0 Lakh", "stay": "None", "statute": "Section 3E Complete", "delay": 5, "prob": 0.12, "risk": "LOW", "lat": 25.420, "lon": 80.550},
            {"id": "BD-PKG02-05", "khasra": "Khasra #302", "village": "Maudaha", "district": "Hamirpur", "pkg": "Package 2", "chainage": "km 110+000", "area": 2.8, "khatedar": "Hamirpur Farmers Union", "disbursed": 60.0, "locked": "₹34.0 Lakh", "stay": "Succession Claim Pending", "statute": "Section 3G Verification", "delay": 35, "prob": 0.52, "risk": "MODERATE", "lat": 25.680, "lon": 80.020},
            {"id": "BD-PKG03-08", "khasra": "Khasra #445", "village": "Orai North", "district": "Jalaun", "pkg": "Package 3", "chainage": "km 185+300", "area": 3.4, "khatedar": "Jalaun Agro Industrialists", "disbursed": 25.0, "locked": "₹88.0 Lakh", "stay": "High Court Injunction on Canal Crossing", "statute": "Section 3D(2) Vesting Applied", "delay": 80, "prob": 0.90, "risk": "CRITICAL", "lat": 25.900, "lon": 79.650},
            {"id": "BD-PKG05-11", "khasra": "Khasra #72", "village": "Auraiya Link", "district": "Auraiya", "pkg": "Package 5", "chainage": "km 242+100", "area": 1.8, "khatedar": "Surendra Yadav", "disbursed": 70.0, "locked": "₹19.0 Lakh", "stay": "Mutation Lag", "statute": "Section 3G Award Determined", "delay": 28, "prob": 0.45, "risk": "MODERATE", "lat": 26.300, "lon": 79.380},
            {"id": "BD-PKG06-14", "khasra": "Khasra #19", "village": "Kudrail Interchange", "district": "Etawah", "pkg": "Package 6", "chainage": "km 294+000", "area": 4.2, "khatedar": "UPEIDA Expressway Depot", "disbursed": 100.0, "locked": "₹0", "stay": "None (Fully Operational)", "statute": "Vested Absolutely in State", "delay": 0, "prob": 0.05, "risk": "LOW", "lat": 26.760, "lon": 79.030}
        ]
    },
    {
        "id": "PRJ-GANGA",
        "name": "Ganga Expressway",
        "state": "Uttar Pradesh",
        "length_km": 594.0,
        "packages": 12,
        "center": [27.20, 79.80],
        "zoom": 8,
        "alignment": [
            [28.980, 77.700], [28.730, 77.780], [28.580, 78.570], [28.030, 79.120],
            [27.880, 79.910], [27.390, 80.130], [26.540, 80.480], [26.220, 81.240],
            [25.900, 81.990], [25.430, 81.840]
        ],
        "milestones": [
            {"name": "📍 km 0: Meerut (Bijli Bamba)", "coords": [28.980, 77.700]},
            {"name": "📍 km 180: Badaun Crossing", "coords": [28.030, 79.120]},
            {"name": "📍 km 380: Hardoi Hub", "coords": [27.390, 80.130]},
            {"name": "📍 km 470: Unnao Expressway Link", "coords": [26.540, 80.480]},
            {"name": "📍 km 594: Prayagraj (Judapur Dando)", "coords": [25.430, 81.840]}
        ],
        "parcels": [
            {"id": "UP-GE-PKG01-01", "khasra": "Khasra #51/A", "village": "Bijli Bamba", "district": "Meerut", "pkg": "Package 1", "chainage": "km 06+100", "area": 2.8, "khatedar": "Tyagi Farmland Collective", "disbursed": 45.0, "locked": "₹68.0 Lakh", "stay": "Compensation Revision Plea", "statute": "Section 19 Award Disputed", "delay": 64, "prob": 0.84, "risk": "CRITICAL", "lat": 28.940, "lon": 77.720},
            {"id": "UP-GE-PKG04-09", "khasra": "Khasra #210", "village": "Binawar", "district": "Badaun", "pkg": "Package 4", "chainage": "km 176+400", "area": 1.5, "khatedar": "Ram Sevak & Heirs", "disbursed": 60.0, "locked": "₹26.0 Lakh", "stay": "Missing Land Title Mutation", "statute": "Section 3G Verification Lag", "delay": 32, "prob": 0.44, "risk": "MODERATE", "lat": 28.050, "lon": 79.100},
            {"id": "UP-GE-PKG08-16", "khasra": "Khasra #88/4", "village": "Safipur", "district": "Unnao", "pkg": "Package 8", "chainage": "km 465+000", "area": 3.2, "khatedar": "Agro Industrial Belt", "disbursed": 98.0, "locked": "₹0", "stay": "None (Civil Work 95% Done)", "statute": "Possession Fully Surrendered", "delay": 0, "prob": 0.05, "risk": "LOW", "lat": 26.560, "lon": 80.460},
            {"id": "UP-GE-PKG12-24", "khasra": "Khasra #602", "village": "Judapur Dando", "district": "Prayagraj", "pkg": "Package 12", "chainage": "km 592+300", "area": 4.1, "khatedar": "Prayagraj Terminal Authority", "disbursed": 100.0, "locked": "₹0", "stay": "None (Ready for Inauguration)", "statute": "Vested Absolutely in State", "delay": 0, "prob": 0.04, "risk": "LOW", "lat": 25.440, "lon": 81.830}
        ]
    },
    {
        "id": "PRJ-AGRA-LUCKNOW",
        "name": "Agra-Lucknow Expressway",
        "state": "Uttar Pradesh",
        "length_km": 302.22,
        "packages": 5,
        "center": [27.00, 79.50],
        "zoom": 9,
        "alignment": [
            [27.150, 78.050], [27.100, 78.420], [26.980, 78.950], [26.920, 79.520],
            [26.880, 80.150], [26.840, 80.750]
        ],
        "milestones": [
            {"name": "📍 km 0: Inner Ring Road, Agra", "coords": [27.150, 78.050]},
            {"name": "📍 km 60: Firozabad Glass Hub", "coords": [27.100, 78.420]},
            {"name": "📍 km 140: Mainpuri Toll Plaza", "coords": [26.980, 78.950]},
            {"name": "📍 km 210: Kannauj Perfume Corridor", "coords": [26.920, 79.520]},
            {"name": "📍 km 302: Sarojini Nagar, Lucknow (Terminal)", "coords": [26.840, 80.750]}
        ],
        "parcels": [
            {"id": "ALE-PKG01-01", "khasra": "Khasra #33", "village": "Etmadpur", "district": "Agra", "pkg": "Package 1", "chainage": "km 09+100", "area": 1.9, "khatedar": "Taj Gateway Holdings", "disbursed": 95.0, "locked": "₹0", "stay": "None", "statute": "Section 3E Vested", "delay": 0, "prob": 0.08, "risk": "LOW", "lat": 27.140, "lon": 78.100},
            {"id": "ALE-PKG03-07", "khasra": "Khasra #204", "village": "Kishni", "district": "Mainpuri", "pkg": "Package 3", "chainage": "km 138+200", "area": 2.5, "khatedar": "Shri Ram Agricultural Trust", "disbursed": 70.0, "locked": "₹18.0 Lakh", "stay": "Minor Heir Claim", "statute": "Section 3G Verification", "delay": 25, "prob": 0.45, "risk": "MODERATE", "lat": 26.970, "lon": 78.980},
            {"id": "ALE-PKG04-12", "khasra": "Khasra #811", "village": "Tirwa", "district": "Kannauj", "pkg": "Package 4", "chainage": "km 212+000", "area": 3.1, "khatedar": "Kannauj Fragrance Estate", "disbursed": 30.0, "locked": "₹75.0 Lakh", "stay": "High Court Injunction on Distilleries", "statute": "Court Escrow Deposited", "delay": 70, "prob": 0.88, "risk": "CRITICAL", "lat": 26.910, "lon": 79.550},
            {"id": "ALE-PKG05-18", "khasra": "Khasra #12", "village": "Mohan", "district": "Lucknow", "pkg": "Package 5", "chainage": "km 298+400", "area": 4.0, "khatedar": "UPEIDA Lucknow Hub", "disbursed": 100.0, "locked": "₹0", "stay": "None", "statute": "Operational Highway", "delay": 0, "prob": 0.05, "risk": "LOW", "lat": 26.850, "lon": 80.700}
        ]
    },
    {
        "id": "PRJ-RRTS-DELHI-MEERUT",
        "name": "Delhi-Ghaziabad-Meerut RRTS Corridor (Namo Bharat)",
        "state": "Delhi & Uttar Pradesh",
        "length_km": 82.15,
        "packages": 4,
        "center": [28.75, 77.45],
        "zoom": 10,
        "alignment": [
            [28.588, 77.255], [28.625, 77.310], [28.670, 77.435], [28.715, 77.520],
            [28.840, 77.580], [28.980, 77.710], [29.040, 77.725]
        ],
        "milestones": [
            {"name": "📍 km 0: Sarai Kale Khan Terminal, Delhi", "coords": [28.588, 77.255]},
            {"name": "📍 km 15: Anand Vihar ISBT Interchange", "coords": [28.625, 77.310]},
            {"name": "📍 km 34: Sahibabad Station", "coords": [28.670, 77.435]},
            {"name": "📍 km 52: Duhai Depot Station", "coords": [28.715, 77.520]},
            {"name": "📍 km 82: Modipuram Terminal, Meerut", "coords": [29.040, 77.725]}
        ],
        "parcels": [
            {"id": "RRTS-PKG01-01", "khasra": "Khasra #45/2", "village": "Sarai Kale Khan", "district": "South East Delhi", "pkg": "Package 1", "chainage": "km 02+100", "area": 0.8, "khatedar": "Delhi Development Authority", "disbursed": 100.0, "locked": "₹0", "stay": "None", "statute": "Inter-Agency Transfer Complete", "delay": 0, "prob": 0.04, "risk": "LOW", "lat": 28.595, "lon": 77.265},
            {"id": "RRTS-PKG02-05", "khasra": "Khasra #112", "village": "Sahibabad Industrial", "district": "Ghaziabad", "pkg": "Package 2", "chainage": "km 32+400", "area": 1.2, "khatedar": "UPSIDC Industrial Units", "disbursed": 40.0, "locked": "₹85.0 Lakh", "stay": "Commercial Leasehold Relocation Dispute", "statute": "RFCTLARR Schedule 2 Resettlement", "delay": 75, "prob": 0.89, "risk": "CRITICAL", "lat": 28.665, "lon": 77.425},
            {"id": "RRTS-PKG03-09", "khasra": "Khasra #305", "village": "Muradnagar", "district": "Ghaziabad", "pkg": "Package 3", "chainage": "km 54+100", "area": 1.5, "khatedar": "Chaudhary Agro Farmland", "disbursed": 65.0, "locked": "₹28.0 Lakh", "stay": "Pillar Footing Foundation Objection", "statute": "Section 19 Declaration", "delay": 35, "prob": 0.52, "risk": "MODERATE", "lat": 28.780, "lon": 77.550},
            {"id": "RRTS-PKG04-14", "khasra": "Khasra #88", "village": "Modipuram", "district": "Meerut", "pkg": "Package 4", "chainage": "km 80+500", "area": 2.6, "khatedar": "NCRTC Meerut Depot", "disbursed": 100.0, "locked": "₹0", "stay": "None (Operational)", "statute": "Possession Complete", "delay": 0, "prob": 0.05, "risk": "LOW", "lat": 29.030, "lon": 77.720}
        ]
    }
]

def compute_intercept_coords(alignment, target_lat, target_lon, length_m=200, width_m=120):
    meters_per_deg_lat = 111132.0
    meters_per_deg_lon = 111320.0 * math.cos(math.radians(target_lat))
    best_dist = float("inf")
    best_center = [target_lat, target_lon]
    best_tangent = (1.0, 0.0)

    for i in range(len(alignment) - 1):
        p1 = alignment[i]
        p2 = alignment[i + 1]
        dx = (p2[1] - p1[1]) * meters_per_deg_lon
        dy = (p2[0] - p1[0]) * meters_per_deg_lat
        seg_len_sq = dx * dx + dy * dy
        if seg_len_sq < 1e-6:
            continue
        tx = (target_lon - p1[1]) * meters_per_deg_lon
        ty = (target_lat - p1[0]) * meters_per_deg_lat
        t = max(0.0, min(1.0, (tx * dx + ty * dy) / seg_len_sq))
        proj_lat = p1[0] + t * (p2[0] - p1[0])
        proj_lon = p1[1] + t * (p2[1] - p1[1])
        d_sq = ((target_lon - proj_lon) * meters_per_deg_lon)**2 + ((target_lat - proj_lat) * meters_per_deg_lat)**2
        if d_sq < best_dist:
            best_dist = d_sq
            best_center = [round(proj_lat, 6), round(proj_lon, 6)]
            seg_len = math.sqrt(seg_len_sq)
            best_tangent = (dx / seg_len, dy / seg_len)

    tx, ty = best_tangent
    nx, ny = -ty, tx
    half_l = length_m / 2.0
    half_w = width_m / 2.0
    c_lat, c_lon = best_center
    m_lon = 111320.0 * math.cos(math.radians(c_lat))

    corners_m = [
        (+half_l * tx + half_w * nx, +half_l * ty + half_w * ny),
        (+half_l * tx - half_w * nx, +half_l * ty - half_w * ny),
        (-half_l * tx - half_w * nx, -half_l * ty - half_w * ny),
        (-half_l * tx + half_w * nx, -half_l * ty + half_w * ny),
    ]
    poly_coords = []
    for ox, oy in corners_m:
        pt_lon = c_lon + (ox / m_lon)
        pt_lat = c_lat + (oy / meters_per_deg_lat)
        poly_coords.append((round(pt_lon, 6), round(pt_lat, 6)))
    poly_coords.append(poly_coords[0])

    return best_center, poly_coords

def seed_all():
    print("Connecting to Supabase PostGIS...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    for pdata in ALL_PROJECTS:
        proj_id = pdata["id"]
        proj_name = pdata["name"]
        print(f"Seeding '{proj_name}' with {len(pdata['parcels'])} parcels...")

        line_wkt = "LINESTRING(" + ", ".join([f"{pt[1]} {pt[0]}" for pt in pdata["alignment"]]) + ")"

        cur.execute("""
            INSERT INTO gis_projects (project_id, project_name, state, length_km, packages, center_lat, center_lon, zoom, alignment_geom, milestones)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, ST_GeomFromText(%s, 4326), %s)
            ON CONFLICT (project_id) DO UPDATE SET
                project_name = EXCLUDED.project_name,
                length_km = EXCLUDED.length_km,
                alignment_geom = EXCLUDED.alignment_geom,
                milestones = EXCLUDED.milestones;
        """, (
            proj_id, proj_name, pdata["state"], pdata["length_km"], pdata["packages"],
            pdata["center"][0], pdata["center"][1], pdata["zoom"],
            line_wkt, Json(pdata["milestones"])
        ))

        for p in pdata["parcels"]:
            snapped_center, poly_coords = compute_intercept_coords(
                pdata["alignment"], p["lat"], p["lon"], length_m=220, width_m=120
            )
            pt_wkt = f"POINT({snapped_center[1]} {snapped_center[0]})"
            poly_wkt = "POLYGON((" + ", ".join([f"{c[0]} {c[1]}" for c in poly_coords]) + "))"

            cur.execute("""
                INSERT INTO gis_parcels (
                    parcel_id, project_id, khasra_no, village_name, district, package_name,
                    chainage_km, total_area_hectares, land_type, khatedar, court_stay,
                    statutory_section, compensation_disbursed_pct, amount_locked,
                    predicted_delay_days, delay_probability, risk_category,
                    center_geom, polygon_geom
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    ST_GeomFromText(%s, 4326), ST_GeomFromText(%s, 4326)
                ) ON CONFLICT (parcel_id) DO UPDATE SET
                    court_stay = EXCLUDED.court_stay,
                    delay_probability = EXCLUDED.delay_probability,
                    risk_category = EXCLUDED.risk_category,
                    center_geom = EXCLUDED.center_geom,
                    polygon_geom = EXCLUDED.polygon_geom;
            """, (
                p["id"], proj_id, p["khasra"], p["village"], p["district"], p["pkg"],
                p["chainage"], p["area"], p.get("landType", "Private Agricultural"),
                p["khatedar"], p["stay"], p["statute"], p["disbursed"], p["locked"],
                p["delay"], p["prob"], p["risk"],
                pt_wkt, poly_wkt
            ))

    conn.commit()
    cur.execute("SELECT COUNT(*) FROM gis_projects;")
    p_cnt = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM gis_parcels;")
    parc_cnt = cur.fetchone()[0]
    print(f"SUCCESS: Supabase PostGIS now stores {p_cnt} corridors and {parc_cnt} cadastral parcels!")
    conn.close()

if __name__ == "__main__":
    seed_all()
