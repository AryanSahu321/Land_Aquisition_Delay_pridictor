# PM GatiShakti &bull; Statutory Land Acquisition AI Platform

### Decision Support System under NH Act 1956 & RFCTLARR Act 2013

An end-to-end, full-stack intelligence platform designed for Indian highway infrastructure projects (NH-19 Expressway Expansion Package 3, Prayagraj–Varanasi Corridor). The platform replaces static spreadsheets and black-box estimates with machine learning inference (<100ms), SHAP factor attribution waterfalls, and statutory Standard Operating Procedure (SOP) recommendations.

---

## 🏛️ Statutory Compliance Framework

The system strictly enforces the legal and administrative mechanics of:

1. **National Highways Act, 1956:**
   - **Section 3A:** Notice of Intent to Acquire Land
   - **Section 3D:** Declaration of Acquisition & Vesting in Central Government (subject to 1-year mandatory lapse sunset under Section 3D(1))
   - **Section 3G:** Determination of Compensation Award by CALA
   - **Section 3E:** 60-Day Notice for Taking Physical Possession (strictly requires >85% payment or Section 3H escrow)
   - **Section 3H(4):** Reference Court Escrow Deposit to transfer civil litigation to court without stalling highway construction
2. **RFCTLARR Act, 2013:**
   - Rehabilitation and Resettlement (R&R) entitlements
   - Market value multiplication factors & solatium
3. **UP Bhulekh / Bhoomi Rashi Revenue Records:**
   - Standard Khasra (`142/2`, `305/1`), Khatauni (`KH-4921`), and Tehsil codes (`UP-PRG-SOR-142-2`)

---

## 🚀 Key Modules

| Module                                      | Component                                        | Description                                                                                                                                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Domain-Authentic Data & Lifecycle**    | `backend/mock_data.py`<br>`backend/seed_data.py` | 220 realistic revenue records across 3 adjacent districts (Prayagraj, Varanasi, Mirzapur) with stage-gated disbursement rules, 365-day lapse clock, and legal dependencies.                                                                                            |
| **2. Predictive Machine Learning Engine**   | `backend/main.py`<br>`POST /api/v1/predict`      | `RandomForestRegressor` and `RandomForestClassifier` running live sub-100ms inference to output predicted delay days, calibrated risk probability, and risk tier (Low <30%, Medium 30-65%, High >65%).                                                                 |
| **3. Explainable AI (XAI) & Prescriptions** | `backend/main.py`<br>`POST /api/v1/explain`      | TreeExplainer feature attributions citing statutory bottlenecks: `JMS Incomplete Block`, `Section 3D Lapse Window Risk`, `Civil Stay without Sec 3H Escrow`, and `Forest Stage-II Clearance Pending`, paired with actionable SOPs.                                     |
| **4. Interactive GIS Corridor & Map**       | `frontend/components/CorridorMap.jsx`            | 25-parcel contiguous right-of-way corridor rendered with Leaflet and color-coded risk choropleth (🟢 Low, 🟡 Moderate, 🔴 Critical Blocker).                                                                                                                           |
| **5. "What-If" Simulation Sandbox**         | `frontend/components/SimulationDrawer.jsx`       | Real-time administrative sandbox with sliders & toggles (Disbursement target, Sec 3H Escrow, Lekhpal title mutation, JMS completion), dynamic side-by-side comparison, and **Net Timeline Saved** counter.                                                             |
| **6. Multi-Role Governance Switcher**       | `frontend/components/Dashboard.jsx`              | Custom executive views for: <br>&bull; **Project Director (NHAI):** RoW delivery & possession ready packages<br>&bull; **CALA / SLAO:** Sec 3G awards & PFMS disbursements<br>&bull; **District Magistrate:** Inter-departmental coordination & revenue lekhpal squads |

---

## 💻 Quickstart Instructions

### 1. Start FastAPI Backend

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

- API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### 2. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

- Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Statutory Test Suite

```bash
python backend/test_api.py
```
