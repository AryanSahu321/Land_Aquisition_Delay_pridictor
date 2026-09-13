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
                               |                                                 ^
                               |                                                 | (Async recalculated results)
                               v                                                 |
                     [ Celery Distributed Workers: Bulk ML Recalculations & Predictions ]
                                                        |
                                                        v
                                     [ High-Speed FastAPI Gatekeeper Layer ]
                                                        |
                                                        v (RESTful JSON APIs)
                                  [ Vite + React + TypeScript + Apache ECharts + Leaflet ]
                               |                                 |                                 |
                     [ Executive Dashboard ]           [ ECharts Comparative ]           [ Lifelines Survival ]
                 - Multi-tier role switcher        - Stacked bar chart across        - CoxPH S(t) clearance
                   (NHAI PD, CALA, DM)               Packages 1 to 10                  curve over 0-180 days
                 - Real-time ETL Health & Sync     - Segmented by SHAP bottlenecks   - Hazard ratio multipliers
                 - NH Act 1956 Lifecycle Funnel      (Legal, Disb, Titles, Forest)     (Forest HR = 2.41x)
```

---

## 🚀 Key Modules & Architecture Breakdown

### 1. Foundational Data Ingestion, ETL & Cadastral Cleaning Pipeline (Pre-ML Layer)

- **Automated Extraction with Resilient Retries**: Scheduled Airflow workflows pull uncleaned updates, stay orders, and drone coordinates from State Revenue Portals (UP Bhulekh), Bhoomi Rashi (MoRTH), and District Court portals with automated retry and exponential backoff.
- **Entity Resolution Engine (`fuzzy_name_match`)**: Bridges administrative data silos by performing Levenshtein token-set similarity matching between court litigation names and revenue titleholders (e.g. "Ram Prasad Singh" vs. "Rama Parsad Sing").
- **Statutory Milestone Date Normalization (`normalize_statutory_dates`)**: Resolves mismatched state portal date formats (`DD/MM/YYYY`, `DD-Mon-YYYY`, `YYYY.MM.DD`) into clean ISO 8601 (`YYYY-MM-DD`).
- **Physical Bounds Sanitization (`sanitize_numerical_bounds`)**: Eliminates data corruption by strictly clamping quantitative attributes (e.g., compensation disbursed between 0.0% and 100.0%, non-negative injunction counts, positive area).
- **Spatial Right-of-Way (RoW) Overlap Computing (`compute_spatial_row_intersection`)**: Calculates exact physical acreage overlap between the planned 60m highway RoW corridor and private farm cadastral polygon boundaries to detect landlocked severances.
- **Observability Endpoints**:
  - `GET /api/v1/etl/status`: Exposes live status of all external sources and pipeline throughput metrics.
  - `POST /api/v1/etl/trigger-sync`: Triggers immediate re-ingestion, harmonization, and spatial calculation.

### 2. Spatial Database & Orchestration (PostGIS & Airflow)

- **`docker-compose.yml`**: Production container stack orchestrating PostGIS 16, Redis 7, Celery Workers, FastAPI, and Apache Airflow.
- **`backend/models.py`**: SQLAlchemy models linking tabular administrative records (compensation status, stays) with geographic polygon geometries.
- **`dags/daily_litigation_ingest_dag.py`**: Apache Airflow DAG executing scheduled extraction from court portals and revenue databases, performing spatial cleaning, and loading to PostGIS.

### 3. Asynchronous ML Inference Backend (FastAPI, Celery & Redis)

- **`POST /api/v1/projects/bulk-update`**: Accepts high-volume batch updates from state portals and dispatches them asynchronously to Celery in <20ms.
- **`backend/tasks.py`**: Celery worker recalculating delay probabilities with XGBoost and generating TreeSHAP factor attributions.
- **`GET /api/v1/projects/{project_id}/high-risk`**: Caches high-risk parcel lists in Redis RAM and serves responses in under 10 milliseconds.

### 4. Survival Analysis Modeling (Lifelines Cox Proportional Hazards)

- **`backend/survival_analysis.py`**: Models time-to-event dynamics for right-censored observation data (ongoing environmental clearances and utility relocations).
- **`GET /api/v1/survival/clearance-curve`**: Returns empirical survival curve data $S(t)$ and hazard ratios (e.g. Forest Land HR = 2.41, 69% probability of exceeding 90 days).

### 5. Strongly-Typed Frontend Visualizations (React, TypeScript & Apache ECharts)

- **`frontend/src/types/landAcquisition.ts`**: Strict TypeScript interfaces validating AI payloads, predictions, and survival curve data.
- **`frontend/src/components/Dashboard.jsx`**: Executive dashboard with role switcher, statutory funnel, and Layer 1 ETL Ingestion Pipeline health monitoring card.
- **`frontend/src/components/PackageBottleneckChart.jsx`**: High-performance Apache ECharts stacked bar chart comparing Packages 1 to 10, color-segmented by SHAP bottlenecks:
  - 🔴 Red: Civil Court Injunctions
  - 🔵 Blue: Compensation Disbursement Lag
  - 🟡 Yellow: Missing Title Deeds
  - 🟠 Orange: Forest & Environmental Clearances
- **`frontend/src/components/SurvivalCurveChart.jsx`**: ECharts interactive survival curve with covariate toggles and 90-day statutory threshold marker.
- **`frontend/src/components/CorridorHeatmap.jsx`**: Spatial density halo visualization highlighting acquisition chokepoint clusters along the highway alignment.

---

## 💻 How to Run the System

### Option A: Local Virtual Environment Execution

#### 1. Backend Server (Terminal 1)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

- API Documentation (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

#### 2. Frontend Server (Terminal 2)

```powershell
cd frontend
npm run dev
```

- Open [http://localhost:5173](http://localhost:5173) in your browser.

#### 3. Run Automated Enterprise Test Suite

```powershell
.\backend\venv\Scripts\python.exe backend/test_api.py
```

---

### Option B: Production Distributed Stack (Docker Compose)

To launch the full containerized microservices stack (PostGIS + Redis + Celery + FastAPI + Airflow):

```bash
docker-compose up -d --build
```

- FastAPI Gateway: [http://localhost:8000](http://localhost:8000)
- Apache Airflow Webserver: [http://localhost:8080](http://localhost:8080)
- PostgreSQL / PostGIS: `localhost:5432` (db: `land_intelligence`)
- Redis Cache: `localhost:6379`
