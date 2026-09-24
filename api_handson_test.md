# PM GatiShakti AI — API Gateway & Security Hands-On Testing Guide

**Document Standard:** SIH 2024 / Enterprise MoRTH Point 11 Standard  
**Target Audience:** Any Team Member Demonstrating Live to Judges  
**Production API Base URL:** `https://land-delay-api.onrender.com`  
**Frontend URL:** `http://localhost:5173`

---

## 📌 Executive Summary for the Team (Read This First!)

When presenting Point 11 to judges, **never type long payloads or waste time thinking of examples**.
Everything can be demonstrated either:

1. **Directly inside the Web UI in 1 click** (_Fastest & most visual for 5-minute pitches_)
2. **Via OpenAPI / Swagger UI (`/docs`)** (_When judges ask for API documentation & schema contracts_)
3. **Via Terminal / cURL** (_When technical judges want proof of cryptographic isolation & headers_)

---

## 🏆 DEMO TRACK 1: 1-Click Interactive Web UI (Best for SIH Judges)

### How to open the Gateway Modal:

1. On the web dashboard, look at the top navigation bar and click:  
   👉 **`⚡ API Gateway (Point 11)`** _(or scroll down to Card 8 on the project results page)_.
2. The modal will pop up with 3 tabs:
   - `Key Provisioning & Shield`
   - `Code Playground & SDK`
   - `OpenAPI & Swagger Sandbox`

---

### Test 1.1: Zero-Trust Statutory Scope RBAC Rejection (`HTTP 403 FORBIDDEN`)

> **Judge Question:** _"Can any government agency access all your AI models and sensitive land data if they have an API key?"_  
> **10-Second Pitch:** _"No, Sir. We enforce zero-trust statutory scope permissions (RBAC) under the MoRTH Data Governance Framework. If an agency only has GIS clearance, they are blocked at wire-speed from accessing our AI delay predictions."_

#### Steps to Execute:

1. Go to **Tab 1: `Key Provisioning & Shield`**.
2. Under **"Statutory Permissions & Scopes"**, check **ONLY** `gis:corridor` (uncheck all others).
3. Click **`Generate New Key`** _(Key generates instantly in 5 milliseconds!)_.
4. Switch to **Tab 2: `Code Playground & SDK`**.
5. In the **"Target API Endpoint & Required Statutory Scope"** grid:
   - Notice `AI Delay Risk Inference` shows **`🔒 Missing`**.
   - Click on the **`AI Delay Risk Inference (predict:delay)`** card.
6. Click the green button: **`Run Live Request (POST predict)`**.

#### Desired Output on Screen:

- **Status Badge:** `HTTP 403 FORBIDDEN (SCOPE/DOMAIN)`
- **Latency:** `~28ms`
- **Response JSON:**

```json
{
  "status_code": 403,
  "error": "INSUFFICIENT_STATUTORY_SCOPE",
  "detail": "Forbidden: Active API Key 'lpad_live_1b302b62...' lacks statutory permission 'predict:delay'.",
  "key_granted_scopes": ["gis:corridor"],
  "required_scope_for_endpoint": "predict:delay",
  "attempted_endpoint": "/api/v1/gateway/predict",
  "statutory_authority": "MoRTH Data Governance Framework 2024 & RFCTLARR Act 2013",
  "resolution": "To use 'AI Delay Risk Inference', navigate to the 'Key Provisioning & Shield' tab, enable the 'predict:delay' checkbox, and click 'Generate New Key'.",
  "security_shield": "Active RBAC Scope Enforcement"
}
```

---

### Test 1.2: Authorized Scope Handshake (`HTTP 200 OK`)

> **10-Second Pitch:** _"Now watch what happens when they call the endpoint they ARE authorized for (`gis:corridor`). It immediately delivers the full spatial alignment."_

#### Steps to Execute:

1. Stay on **Tab 2: `Code Playground & SDK`**.
2. In the **"Target API Endpoint"** selector, click **`GIS 120m RoW Alignment (gis:corridor)`** _(notice it shows `✓ Permitted`)_.
3. Click the green button: **`Run Live Request (GET gis)`**.

#### Desired Output on Screen:

- **Status Badge:** `HTTP 200 OK`
- **Security Check:** `🔒 Argon2id Cryptographic Handshake Verified`
- **Response JSON:**

```json
{
  "status": "SUCCESS",
  "gateway_authenticated": true,
  "scope_verified": "gis:corridor",
  "caller_agency": "National Highways Authority of India (NHAI)",
  "key_prefix": "lpad_live_1b302b62",
  "corridor_alignment": "Purvanchal Expressway RoW Corridor (Ch. 0+000 to Ch. 340+800)",
  "row_width_meters": 120,
  "geojson_standard": "RFC 7946 Polygon & MultiLineString",
  "spatial_features_count": 18,
  "intersections": [
    {
      "type": "Reserve Forest (Faizabad Div)",
      "intersection_km": 4.2,
      "status": "Stage-1 Clearance Under MoEFCC"
    },
    {
      "type": "Ganga Canal Aqueduct Crossings",
      "intersection_km": 1.1,
      "status": "Irrigation Dept MoA Executed"
    }
  ]
}
```

---

### Test 1.3: BhoomiRashi Cadastral Land Parcel Records (`HTTP 200 OK`)

> **Judge Question:** _"Does your API integrate with BhoomiRashi or State Land Revenue Bhulekh databases?"_  
> **10-Second Pitch:** _"Yes! Under scope `cadastral:read`, we query Khasra land parcels, solatium multipliers under RFCTLARR Section 30, and PFMS disbursement status."_

#### Steps to Execute:

1. Go to **Tab 1**, check **`cadastral:read`**, and click **`Generate New Key`**.
2. Go to **Tab 2**, click **`BhoomiRashi Cadastral Registry`** card.
3. Click **`Run Live Request`**.

#### Desired Output on Screen:

- **Status Badge:** `HTTP 200 OK`
- **Response JSON:**

```json
{
  "status": "SUCCESS",
  "gateway_authenticated": true,
  "scope_verified": "cadastral:read",
  "land_registry_source": "BhoomiRashi & State Rev. Dept (UP Bhulekh)",
  "total_parcels_audited": 4,
  "parcels": [
    {
      "khasra_no": "142/1-Ka",
      "village": "Sultanpur Khas",
      "tehsil": "Kadipur",
      "area_hectares": 1.45,
      "solatium_multiplier": "2.0x (RFCTLARR Sec 30)",
      "compensation_status": "DISBURSED_PFMS_DBT",
      "possession_handed_over": true
    },
    {
      "khasra_no": "142/2-Kha",
      "village": "Sultanpur Khas",
      "solatium_multiplier": "1.0x (Urban RFCTLARR)",
      "compensation_status": "SECTION_3H_DEPOSITED_DISTRICT_COURT",
      "court_case": "SLP-4921/2023 High Court Stay Pending",
      "possession_handed_over": false
    }
  ]
}
```

---

### Test 1.4: Google Maps-Style Domain / Referrer Restriction (`HTTP 403`)

> **Judge Question:** _"What prevents a rogue hacker website from stealing this key from a browser and draining your AI quota?"_  
> **10-Second Pitch:** _"Just like the Google Maps API, our key is restricted to official government domains (`_.nhai.gov.in`, `_.morth.nic.in`). Any unauthorized origin is immediately blocked with HTTP 403."_

#### Steps to Execute:

1. In **Tab 2**, look at the **"Test Case"** selector buttons.
2. Click **`🛡️ Blocked Domain (403)`**.
3. Click **`Run Live Request`**.

#### Desired Output on Screen:

- **Status Badge:** `HTTP 403 FORBIDDEN`
- **Response JSON:**

```json
{
  "detail": "Forbidden: Domain 'https://hacker-unauthorized-site.com' is not an authorized HTTP Referrer for this key.",
  "status_code": 403,
  "enforced_rule": "Google Maps-Style HTTP Referrer Restriction (*.nhai.gov.in, *.morth.nic.in, localhost*)",
  "caller_origin": "https://hacker-unauthorized-site.com",
  "security_action": "TERMINATED_BY_GATEWAY_SHIELD"
}
```

---

### Test 1.5: Cryptographic Key Tampering Check (`HTTP 401 UNAUTHORIZED`)

> **10-Second Pitch:** _"Keys are protected using Argon2id (RFC 9106) memory-hard encryption. If an attacker tampers with even a single byte of the key secret, the cryptographic handshake fails instantly."_

#### Steps to Execute:

1. In **Tab 2**, click the **`🚫 Tampered Key (401)`** test case button.
2. Click **`Run Live Request`**.

#### Desired Output on Screen:

- **Status Badge:** `HTTP 401 UNAUTHORIZED`
- **Response JSON:**

```json
{
  "detail": "Unauthorized: Invalid or revoked API Key Token (Argon2id Check Failed)",
  "status_code": 401,
  "hint": "Tampered key 'lpad_live_fake_tampered_key_999' rejected by Gateway shield.",
  "cryptographic_engine": "Argon2id (RFC 9106) Memory-Hard Verification"
}
```

---

### Test 1.6: Token Bucket Rate Limiting Burst Protection (`HTTP 429`)

> **10-Second Pitch:** _"To prevent denial-of-service on our ML GPUs, we implement Token Bucket Rate Limiting (RFC 6585) tailored to administrative tiers: 60 req/min for CALA districts, 300 for State PWDs, and 1,200 for Central MoRTH."_

#### Steps to Execute:

1. In **Tab 2**, click **`⏱️ Rate Limit (429)`**.
2. Click **`Run Live Request`**.

#### Desired Output on Screen:

- **Status Badge:** `HTTP 429 RATE LIMITED`
- **Response JSON:**

```json
{
  "detail": "Rate limit quota exceeded for Central MoRTH (1,200 req/min).",
  "status_code": 429,
  "retry_after_seconds": 38,
  "quota_policy": "Token Bucket Rate Limiting (RFC 6585)",
  "hint": "Burst capacity exhausted. Request throttled to protect ML model server from denial of service."
}
```

---

## 🌐 DEMO TRACK 2: Live Swagger UI & OpenAPI 3.0 Sandbox (`/docs`)

### How to open Swagger:

- Inside the Modal, switch to **Tab 3: `OpenAPI & Swagger Sandbox`**.
- Click the blue button: **`[Launch Full Swagger UI]`** _(or open directly: [`https://land-delay-api.onrender.com/docs`](https://land-delay-api.onrender.com/docs))_.

---

### Test 2.1: Spatial RoW Corridor GeoJSON (0 Inputs Required)

1. Click on **`GET /api/v1/corridor/geojson`**.
2. Click the white **`Try it out`** button on the right.
3. Click the big blue **`Execute`** button.
4. **Desired Output:**
   - **Code:** `200`
   - **Response Body:** Real RFC 7946 GeoJSON FeatureCollection with 25 parcel boundary polygons and live risk choropleth colors.

---

### Test 2.2: Live AI Model Inference (`POST /api/v1/projects/parse-and-predict`)

> **Note on Output Length:**  
> - By default, this endpoint powers the entire web application and returns data for **all 7 dashboard cards** (including 25 GeoJSON map polygon coordinates, 8 package breakdowns, and TreeSHAP trees).  
> - To get the **clean, compact 20-line integration payload**, set the `compact` query parameter to **`true`**!

1. Click on **`POST /api/v1/projects/parse-and-predict`**.
2. Click **`Try it out`**.
3. Under Parameters $\rightarrow$ **`compact`**, select or type: **`true`**.
4. In the **Request body** text area, paste this pre-tested example:

```json
{
  "project_name": "Purvanchal Expressway",
  "total_km": 340.8,
  "packages_count": 8
}
```

5. Click **`Execute`**.
6. **Desired Compact Output (`Code: 200`):**

```json
{
  "status": "SUCCESS",
  "project": {
    "project_name": "Purvanchal Expressway",
    "total_km": 340.8,
    "packages_count": 8
  },
  "risk_stratification": {
    "overall_delay_probability": 0.591,
    "risk_category": "Medium"
  },
  "statutory_liquidation": {
    "predicted_clearance_days": 123,
    "predicted_clearance_window": "+98 to +158 Days"
  },
  "statutory_milestones": [
    { "stage_id": "Section_3A_Notification", "status": "COMPLETED" },
    { "stage_id": "Section_3B_Survey", "status": "COMPLETED" },
    { "stage_id": "Section_3C_Objections", "status": "COMPLETED" },
    { "stage_id": "Section_3D/19_Declaration", "status": "COMPLETED" }
  ]
}
```

*(If you leave `compact` as `false`, it returns the full 800-line dataset with all 25 map parcel polygons for the Leaflet satellite map!)*

---

### Test 2.3: Actuarial Survival Clearance Curve (`GET /api/v1/survival/clearance-curve`)

1. Click on **`GET /api/v1/survival/clearance-curve`**.
2. Click **`Try it out`** $\rightarrow$ Click **`Execute`** _(No parameters needed!)_.
3. **Desired Output:**
   - **Code:** `200`
   - **Response Body:** Full Kaplan-Meier actuarial distribution (`timeline_days`, `survival_probability`, `at_risk_count`, `statutory_deadline_marker`).

---

### Test 2.4: Live Gateway Health & Telemetry (`GET /api/v1/gateway/stats`)

1. Click on **`GET /api/v1/gateway/stats`**.
2. Click **`Try it out`** $\rightarrow$ Click **`Execute`**.
3. **Desired Output:**
   - **Code:** `200`
   - **Response Body:**

```json
{
  "status": "ONLINE",
  "gateway_version": "v1.4.2",
  "supported_standards": [
    "Argon2id (RFC 9106) Memory-Hard Encryption",
    "RFC 7946 GeoJSON Standard",
    "Google Maps-Style Domain Wildcard Isolation",
    "Token Bucket Rate Limiting (HTTP 429)"
  ],
  "active_integrations": [
    {
      "system": "MoRTH BhoomiRashi",
      "status": "CONNECTED",
      "protocol": "REST + GeoJSON"
    },
    {
      "system": "NHAI Data Lake",
      "status": "ACTIVE",
      "protocol": "Argon2id API Key"
    },
    {
      "system": "PM GatiShakti NMP (BISAG-N)",
      "status": "SYNCED",
      "protocol": "Spatial OGC WFS"
    }
  ]
}
```

---

## 💻 DEMO TRACK 3: Terminal / cURL Commands (For Deep Technical Judges)

If an evaluator opens PowerShell or Bash and asks: _"Can I curl your API from my terminal?"_  
Copy and run these exact commands:

### Command 1: Test Live AI Delay Prediction (200 OK)

```bash
curl -X POST "https://land-delay-api.onrender.com/api/v1/projects/parse-and-predict" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Purvanchal Expressway",
    "total_km": 340.8,
    "packages_count": 8
  }'
```

**Expected Response:** `HTTP 200 OK` with JSON delay breakdown and TreeSHAP factors.

---

### Command 2: Test GeoJSON RoW Corridor

```bash
curl -X GET "https://land-delay-api.onrender.com/api/v1/corridor/geojson"
```

**Expected Response:** `HTTP 200 OK` with GeoJSON FeatureCollection.

---

### Command 3: Test Rate Limiting Header Telemetry

```bash
curl -i -X GET "https://land-delay-api.onrender.com/api/v1/gateway/stats"
```

**Expected Response:** HTTP 200 showing `server: cloudflare`, `x-render-origin-server: uvicorn`.

---

## 🎯 60-Second SIH Presentation Script (Memorize This!)

| Time            | Action                                                                                | What to Say                                                                                                                    |
| :-------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| **0:00 - 0:15** | Click **`⚡ API Gateway`**                                                            | _"Under Point 11, we built an Enterprise AI-as-a-Service Gateway for NHAI and PM GatiShakti with Argon2id encryption."_        |
| **0:15 - 0:30** | Click **`AI Delay Risk Inference`** with `[gis:corridor]` key $\rightarrow$ Click Run | _"Notice our Zero-Trust RBAC: a GIS agency key is rejected from ML delay predictions in 28ms with HTTP 403."_                  |
| **0:30 - 0:45** | Click **`GIS 120m RoW Alignment`** $\rightarrow$ Click Run                            | _"When they query the endpoint they are permitted for, it immediately returns HTTP 200 with RFC 7946 GeoJSON."_                |
| **0:45 - 1:00** | Switch to **Tab 3** $\rightarrow$ Click **Launch Swagger UI**                         | _"All endpoints adhere to OpenAPI 3.0 standards, allowing any state PWD or central ministry to integrate in under 5 minutes."_ |

---

_Created and verified for PM GatiShakti Land Acquisition AI Intelligence Engine (SIH 2024)._
