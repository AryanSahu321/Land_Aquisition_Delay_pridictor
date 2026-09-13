# PM GatiShakti Land Acquisition Platform: System Architecture Blueprint

This document details the exact file-by-file breakdown of the distributed intelligence platform, explaining its ETL pipeline, machine learning engine, geospatial database, and frontend dashboards.

## File: `README.md`

**Architectural Role:** Master system documentation, statutory compliance guidelines (NH Act 1956 / RFCTLARR Act 2013), and execution instructions.

```text
# PM GatiShakti &bull; Enterprise Land Acquisition Intelligence Platform

### Distributed AI-Powered Decision Support System under NH Act 1956 & RFCTLARR Act 2013

A production-grade, distributed microservices architecture for predicting, visualizing, and mitigating land acquisition timeline risks across national highway corridors.

---

> [!CAUTION]
>
> ### STRICT REPOSITORY GOVERNANCE RULE:
>
> **DO NOT MAKE ANY CHANGES TO THE `1.codebase` FOLDER.**
> The `1.codebase` directory is strictly reserved as an external benchmark reference for automated AI audits. All application code, scripts, models, and UI components must reside exclusively in `backend/`, `frontend/`, `dags/`, or root configuration files.

---

## 🏛️ Statutory Compliance & Domain Grounding

The platform strictly enforces the administrative and legal mechanics of:

1. **National Highways Act, 1956:**
   - **Section 3A:** Preliminary Notice of Intention to Acquire
   - **Section 3D:** Declaration of Acquisition & Vesting in Union (subject to strict 1-year statutory lapse clock under Section 3D(1))
   - **Section 3G:** Determination of Compensation Award by CALA
   - **Section 3E:** 60-Day Notice for Taking Physical Possession (strictly requires >85% payment or Section 3H court escrow)
   - **Section 3H(4):** Reference Court Escrow Deposit to transfer civil litigation to court reference without halting highway civil works
2. **RFCTLARR Act, 2013:**
   - Mandatory Rehabilitation and Resettlement (R&R) entitlements
   - Solatium and multiplier calculations
3. **State Revenue Portals (UP Bhulekh / Bhoomi Rashi):**
   - Standard Khasra (`142/2`), Khatauni (`KH-4921`), and cadastral parcel identifiers (`UP-PRG-SOR-142-2`)

---

### 🏗️ Enterprise Technology Architecture

```
         [ External Sources: UP Bhulekh | Bhoomi Rashi | e-Courts Portals | Drone LiDAR & DGPS Shapefiles ]
                                                        |
                                                        v (Scheduled Pulls with Retry Logic)
         +------------------------------------------------------------------------------------------------+
         |                FOUNDATIONAL LAYER 1: DATA INGESTION, ETL & CLEANING PIPELINE                  |
         |  - Apache Airflow DAGs (`daily_litigation_ingest_dag.py`) orchestrating resilient extractions |
         |  - Entity Resolution: Fuzzy Levenshtein token matching (court litigants vs registry owners)     |
         |  - Milestone Normalization: Standardizes disparate state date formats into ISO 8601            |
         |  - Physical & Quantitative Bounds Sanitization: Clamps disbursement (0-100%) and area (>=0.01ha)|
         |  - Spatial Right-of-Way (RoW) Computing: 60m highway centerline overlap on cadastral parcels   |
         +------------------------------------------------------------------------------------------------+
                                                        |
                                                        v (Clean Handoff)
                                   [ PostgreSQL 16 + PostGIS Spatial Geometries ]
                                                        |
                               +------------------------+------------------------+
                               |                                                 |
                               v (Feature Vectors)                               v (In-Memory Cache & Broker)
                 [ Predictive & XAI Engine ]                             [ Redis 7 RAM Cache ]
             - XGBoost / LightGBM Regression/Classif                 - Sub-10ms high-risk query cache
             - Lifelines Cox Proportional Hazards                    - Celery task broker & results
             - TreeSHAP Factor Waterfall Attributions                - Fast project snapshot storage

... [Remaining content truncated for audit brevity] ...
```

---

## File: `docker-compose.yml`

**Architectural Role:** Production container orchestrator spinning up PostGIS, Redis, Celery, Airflow, and FastAPI microservices.

```text
version: "3.8"

services:
  # --------------------------------------------------------------------------
  # Spatial Database: PostgreSQL + PostGIS Extension
  # --------------------------------------------------------------------------
  postgres:
    image: postgis/postgis:16-3.4
    container_name: gatishakti_postgis
    environment:
      POSTGRES_DB: land_intelligence
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/init_postgis.sql:/docker-entrypoint-initdb.d/init_postgis.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - gatishakti_network

  # --------------------------------------------------------------------------
  # In-Memory Cache & Message Broker: Redis
  # --------------------------------------------------------------------------
  redis:
    image: redis:7-alpine
    container_name: gatishakti_redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - gatishakti_network

  # --------------------------------------------------------------------------
  # Distributed Backend: FastAPI Application Layer
  # --------------------------------------------------------------------------
  fastapi:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: gatishakti_api
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgrespassword@postgres:5432/land_intelligence
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/1
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

... [Remaining content truncated for audit brevity] ...
```

---

## File: `.gitignore`

**Architectural Role:** Excludes heavy local dependencies, virtual environments, and cached build artifacts from Git history.

```text
# Node.js / Frontend
node_modules/
dist/
frontend/dist/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python / Backend
__pycache__/
*.py[cod]
*$py.class
venv/
backend/venv/
env/
.venv/
*.log
.env

# Machine Learning / Data
*.pkl
*.joblib

# OS / Editor settings
.DS_Store
.vscode/
.idea/
```

---

## File: `backend/main.py`

**Architectural Role:** FastAPI core application gateway serving REST endpoints, managing startup ML model training, and handling live inference requests.

```text
"""
FastAPI Server for Indian Statutory Land Acquisition AI Platform
Supports:
- Live ML Training & Model Inference (<100ms)
- SHAP Feature Factor Breakdown (XAI Waterfall)
- Statutory SOP Prescriptive Action Engine (RFCTLARR 2013 & NH Act 1956)
- GIS Right-of-Way Corridor GeoJSON
- Role-Specific Filtered Analytics (NHAI PD, CALA/SLAO, DM)
"""

import os
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
import shap

from mock_data import (
    generate_synthetic_dataset,
    generate_corridor_geojson,
    STATUTORY_STAGES,
    LAND_TYPES,
    DISTRICTS_TEHSILS
)
from etl_pipeline import etl_pipeline

app = FastAPI(
    title="PM GatiShakti Land Acquisition AI Intelligence Engine",
    version="1.0.0",
    description="Statutory land acquisition risk prediction & prescriptive decision support under RFCTLARR 2013 & NH Act 1956"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------------
# Global In-Memory State & Model Cache
# ----------------------------------------------------------------------
DATA_STORE = {
    "records": [],
    "records_by_id": {},
    "corridor_geojson": {},
    "regressor": None,
    "classifier": None,
    "feature_names": [],
    "explainer": None,
    "expected_value": 0.0
}

... [Remaining content truncated for audit brevity] ...
```

---

## File: `backend/celery_app.py`

**Architectural Role:** Configures the asynchronous Celery background task queue using Redis as the message broker.

```text
"""
Celery Configuration for Distributed ML Task Execution
Uses Redis as message broker and results backend.
"""

import os
from celery import Celery

REDIS_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
REDIS_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

celery = Celery(
    "gatishakti_tasks",
    broker=REDIS_BROKER_URL,
    backend=REDIS_RESULT_BACKEND,
    include=["tasks"]
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 min max
    worker_prefetch_multiplier=1,
    broker_connection_retry_on_startup=True
)

```

---

## File: `backend/tasks.py`

**Architectural Role:** Defines heavy background workers that execute bulk XGBoost inferences and SHAP calculations asynchronously.

```text
"""
Distributed Celery Tasks for Asynchronous ML Inference & TreeSHAP Attribution
Recalculates high-volume bulk parcel updates and caches high-risk parcels in Redis.
"""

import json
import os
import time
import redis
import numpy as np
import pandas as pd
from celery_app import celery
from mock_data import STATUTORY_STAGES, LAND_TYPES

# Redis client for caching
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

def get_redis_client():
    try:
        return redis.from_url(REDIS_URL, decode_responses=True)
    except Exception as e:
        print(f"Warning: Redis not connected: {e}")
        return None

@celery.task(bind=True, name="tasks.recalculate_project_risks")
def recalculate_project_risks(self, project_id: str, updates: list):
    """
    Celery worker task:
    1. Receives bulk parcel updates
    2. Recalculates delay probabilities using XGBoost/RandomForest
    3. Computes TreeSHAP factor attributions
    4. Caches the updated high-risk parcel list directly in Redis for <10ms retrieval
    """
    start_time = time.perf_counter()
    total_records = len(updates)
    processed_results = []
    high_risk_parcels = []

    r_client = get_redis_client()

    for idx, item in enumerate(updates):
        parcel_id = item.get("parcel_id", f"PARCEL-{idx}")
        injunctions = int(item.get("pending_court_injunctions", 0))
        sec_3h = bool(item.get("sec_3h_escrow_deposited", False))
        disbursed = float(item.get("compensation_disbursed_pct", 50.0))
        jms_done = bool(item.get("jms_completed", True))
        missing_deeds = float(item.get("missing_title_deeds_pct", 0.0))
        stage = item.get("statutory_stage", "Section 3G (Award of Compensation)")
        days_in_stage = int(item.get("days_in_current_stage", 60))

        # Core statutory calculation
        base_delay = 25
        if not jms_done:
            base_delay += 60
        if injunctions > 0:
            base_delay += 20 if sec_3h else (injunctions * 75)
        if stage.startswith("Section 3A") and days_in_stage > 300:
            base_delay += 110
        if disbursed < 40 and "3G" in stage:
            base_delay += 35

... [Remaining content truncated for audit brevity] ...
```

---

## File: `backend/etl_pipeline.py`

**Architectural Role:** Layer 1 Data Ingestion Engine: Handles fuzzy string matching, milestone date normalization, bounds clamping, and RoW spatial overlap math.

```text
"""
Foundational Data Ingestion, ETL & Harmonization Pipeline
Pre-processing & Data Cleaning Layer for Land Acquisition Decision Support System.

Executes before data reaches the machine learning and predictive modules:
1. Automated Extraction with Error Handling & Retries (UP Bhulekh, Bhoomi Rashi, District Courts, Drone DGPS)
2. Data Harmonization, Entity Resolution (Levenshtein token matching) & Statutory Milestone Date Normalization
3. Spatial Computing & Right-of-Way Polygon Intersection
4. Clean Handoff to PostgreSQL/PostGIS and Predictive Engine (XGBoost, TreeSHAP, Lifelines)
"""

import os
import time
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class DataHarmonizationPipeline:
    """
    Data Harmonization & Cleaning Layer.
    Resolves data silos, typo discrepancies, date inconsistencies, and spatial geometry bounds.
    """
    def __init__(self):
        self.stats = {
            "total_extracted": 0,
            "entities_resolved": 0,
            "anomalies_repaired": 0,
            "dates_normalized": 0,
            "spatial_intersections_computed": 0,
            "last_run_timestamp": None,
            "status": "IDLE"
        }

    @staticmethod
    def fuzzy_name_match(name1: str, name2: str) -> float:
        """
        Entity Resolution: Computes similarity ratio between court record litigant
        and revenue titleholder name to bridge disjointed administrative data silos.
        """
        n1 = "".join(c.lower() for c in name1 if c.isalnum() or c.isspace()).strip()
        n2 = "".join(c.lower() for c in name2 if c.isalnum() or c.isspace()).strip()

        if n1 == n2:
            return 1.0

        # Token set overlap
        tokens1 = set(n1.split())
        tokens2 = set(n2.split())
        if not tokens1 or not tokens2:
            return 0.0

        intersection = len(tokens1.intersection(tokens2))
        union = len(tokens1.union(tokens2))
        jaccard = intersection / union


... [Remaining content truncated for audit brevity] ...
```

---

## File: `backend/survival_analysis.py`

**Architectural Role:** Lifelines Cox Proportional Hazards survival model computing time-to-clearance probabilities for right-censored administrative tasks.

```text
"""
Phase 4: Survival Analysis Modeling (Lifelines)
Applies Cox Proportional Hazards and Kaplan-Meier estimation to model
time-to-event dynamics and right-censored observations (e.g. ongoing clearances, utility shifts).
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List
from lifelines import CoxPHFitter, KaplanMeierFitter

class ClearanceSurvivalEngine:
    """
    Survival Analysis Engine for Statutory Clearances & Environmental Approvals.
    Handles right-censored cases where clearance is actively underway.
    """
    def __init__(self):
        self.cph = CoxPHFitter()
        self.kmf = KaplanMeierFitter()
        self.is_fitted = False
        self._fit_baseline_model()

    def _generate_clearance_dataset(self, n_samples: int = 120) -> pd.DataFrame:
        """
        Generates realistic statutory clearance duration data.
        T = duration in days
        E = event observed (1 = clearance granted / dispute resolved, 0 = right-censored ongoing)
        """
        np.random.seed(42)

        is_forest = np.random.binomial(1, 0.35, n_samples)
        affected_families = np.random.randint(1, 35, n_samples)
        has_injunction = np.random.binomial(1, 0.28, n_samples)
        disbursement_pct = np.random.uniform(10.0, 95.0, n_samples)

        # Baseline duration ~ 65 days
        # Forest land increases duration substantially (Hazard Ratio < 1 for resolution speed)
        durations = []
        events = []

        for f, fam, inj, disb in zip(is_forest, affected_families, has_injunction, disbursement_pct):
            base_t = np.random.exponential(scale=65)
            if f == 1:
                base_t += np.random.uniform(45, 95)
            if inj == 1:
                base_t += np.random.uniform(30, 70)
            if disb < 40:
                base_t += np.random.uniform(15, 35)

            observed_t = max(10, int(round(base_t)))

            # Right censoring: ~25% of cases are still ongoing (unresolved)
            is_censored = np.random.random() < 0.25
            if is_censored:
                # Observation stopped at current day
                t = min(observed_t, np.random.randint(25, 120))
                e = 0
            else:
                t = observed_t
                e = 1

... [Remaining content truncated for audit brevity] ...
```

---

## File: `backend/database.py`

**Architectural Role:** Establishes SQLAlchemy database session connectivity with PostgreSQL and PostGIS extensions.

```text
"""
Spatial Database Connection & Session Management
Supports PostgreSQL + PostGIS with graceful fallback to SQLite for local execution.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Environment variable with PostgreSQL default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./land_intelligence.db"
)

# For SQLite, enable check_same_thread=False
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency generator for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

```

---

## File: `backend/models.py`

**Architectural Role:** Relational and spatial database schema models mapping parcels, administrative logs, and geometric polygon coordinates.

```text
"""
SQLAlchemy Models for Land Acquisition Decision Support System
Integrates tabular administrative records with spatial polygon geometries.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from database import Base

class Project(Base):
    """Highway or Linear Infrastructure Project Entity."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String(50), unique=True, index=True, nullable=False)
    project_name = Column(String(255), nullable=False)
    highway_number = Column(String(50), default="NH-19")
    package_number = Column(String(50), default="Package 3")
    total_length_km = Column(Float, default=64.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    parcels = relationship("Parcel", back_populates="project", cascade="all, delete-orphan")


class Parcel(Base):
    """
    Cadastral / Revenue Land Parcel linked with geographic polygon data.
    Enforces RFCTLARR Act 2013 and National Highways Act 1956 schema attributes.
    """
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String(50), ForeignKey("projects.project_id"), nullable=False, index=True)
    parcel_id = Column(String(80), unique=True, index=True, nullable=False)
    khasra_no = Column(String(50), nullable=False, index=True)
    khatauni_no = Column(String(50), nullable=False)
    village_name = Column(String(100), nullable=False, index=True)
    tehsil = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    chainage_km = Column(String(80), nullable=False)

    # Statutory Lifecycle State
    statutory_stage = Column(String(80), nullable=False)
    days_in_current_stage = Column(Integer, default=30)
    land_type = Column(String(80), nullable=False)
    total_area_hectares = Column(Float, nullable=False)
    affected_families_count = Column(Integer, default=1)

... [Remaining content truncated for audit brevity] ...
```

---

## File: `backend/mock_data.py`

**Architectural Role:** Generates domain-authentic synthetic records adhering to real regional tehsils (Prayagraj, Varanasi, Mirzapur).

```text
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

... [Remaining content truncated for audit brevity] ...
```

---

## File: `backend/seed_data.py`

**Architectural Role:** Database initialization script that populates initial statutory records.

```text
"""
Seed data generator script for Land Acquisition Intelligence Platform.
Generates domain-authentic datasets adhering to:
- NH Act 1956 (Sections 3A, 3D, 3G, 3E, 3H)
- RFCTLARR Act 2013
- UP Bhulekh / Bhoomi Rashi revenue format

Outputs:
- data/parcels.json (and parcels_200.json)
- data/corridor.geojson (and corridor_25.geojson)
"""

import os
import json
from pathlib import Path
from mock_data import generate_synthetic_dataset, generate_corridor_geojson

def main():
    output_dir = Path(__file__).resolve().parent / "data"
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Generating 220 statutory land acquisition records with authentic legal mechanics...")
    records = generate_synthetic_dataset(num_records=220, seed=42)

    # Save to both parcels.json and parcels_200.json for compatibility
    for filename in ["parcels.json", "parcels_200.json"]:
        records_file = output_dir / filename
        with open(records_file, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)
        print(f"Saved {len(records)} records to {records_file}")

    print("Generating 25-parcel contiguous GeoJSON right-of-way corridor...")
    corridor_geojson = generate_corridor_geojson(records, count=25)

    for filename in ["corridor.geojson", "corridor_25.geojson"]:
        geojson_file = output_dir / filename
        with open(geojson_file, "w", encoding="utf-8") as f:
            json.dump(corridor_geojson, f, indent=2)
        print(f"Saved GeoJSON corridor to {geojson_file}")

if __name__ == "__main__":
    main()
```

---

## File: `backend/test_api.py`

**Architectural Role:** Automated regression and endpoint test suite validating API response times and predictive accuracy.

```text
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

... [Remaining content truncated for audit brevity] ...
```

---

## File: `dags/daily_litigation_ingest_dag.py`

**Architectural Role:** Apache Airflow DAG orchestrating scheduled midnight extractions from state revenue portals and e-courts.

```text
"""
Apache Airflow Production DAG: Automated Ingestion, ETL & Data Cleaning Pipeline
Master Orchestration Layer for Land Acquisition Decision Support System.

Workflow:
1. Extract: Pulls raw, uncleaned records from State Revenue Portals (UP Bhulekh, Bhoomi Rashi),
   District Civil Court portals, and DGPS drone survey coordinates with automated retries.
2. Cleanse & Harmonize: Executes entity resolution (matching court litigant names with registry owners),
   normalizes date formats across statutory milestones (3A, 3D, 3G, 3E), and validates numerical bounds.
3. Spatial PostGIS Computing: Calculates physical overlap acreage between highway Right-of-Way (RoW)
   and farm polygons to compute acquired area and residual severance.
4. Clean Handoff: Upserts into PostgreSQL / PostGIS and triggers Celery asynchronous ML predictive engine.
"""

from datetime import datetime, timedelta
import json
import logging
import urllib.request
import urllib.error
from airflow import DAG
from airflow.operators.python import PythonOperator

default_args = {
    "owner": "pm_gatishakti_dataops",
    "depends_on_past": False,
    "start_date": datetime(2026, 1, 1),
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 3,
    "retry_delay": timedelta(minutes=3),
}

dag = DAG(
    "land_acquisition_master_etl_pipeline",
    default_args=default_args,
    description="Automated Extraction, Data Harmonization, Entity Resolution, PostGIS Spatial Computing & ML Handoff",
    schedule_interval="0 1 * * *",  # Run 1:00 AM daily
    catchup=False,
    max_active_runs=1,
    tags=["land_acquisition", "airflow", "etl", "postgis", "entity_resolution", "mlops"],
)

# --------------------------------------------------------------------------
# Step 1: Automated Extraction with Error Handling & Retries
# --------------------------------------------------------------------------
def extract_state_revenue_portal(**kwargs):
    """
    Extracts raw uncleaned cadastral parcel records from State Revenue APIs (e.g. UP Bhulekh).
    Includes automatic retries for unstable government endpoints.
    """
    logging.info("Connecting to State Revenue API (UP Bhulekh / Bhoomi Rashi)...")
    # Simulated extraction delta
    raw_parcels = [
        {
            "parcel_id": "UP-PRG-SOR-142-2",
            "khasra_no": "142/2 ",
            "village": "dahiyawan",
            "tehsil": "Soraon",
            "district": "Prayagraj",
            "owner_name": "Ram Prasad Singh",

... [Remaining content truncated for audit brevity] ...
```

---

## File: `frontend/package.json`

**Architectural Role:** Node.js configuration file defining frontend dependencies (React, Vite, Tailwind CSS, Leaflet, ECharts).

```text
{
  "name": "gatishakti-land-acquisition-ai",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "echarts": "^6.1.0",
    "echarts-for-react": "^3.0.6",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.475.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.16",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^6.1.0"
  }
}
```

---

