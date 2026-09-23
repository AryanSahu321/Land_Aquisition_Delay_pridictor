# Production API Gateway & Government Integration Architecture (Point 11)

## Enterprise AI-as-a-Service (AIaaS) Integration Gateway for Indian Land Infrastructure

This document provides the complete, production-grade architectural specification for **Point 11 (APIs for integration with existing land acquisition management systems and government databases)**. It defines how external government platforms (NHAI Data Lake, PM GatiShakti, BhoomiRashi, and EPC ERPs) securely query our AI delay prediction engine in real time.

---

## 1. High-Level Architecture Overview

Rather than forcing government agencies to abandon multi-crore existing IT portals, our platform acts as an **AI-as-a-Service (AIaaS) API Gateway**:

```
 ┌───────────────────────────────────────────────────────────────────────────────────────┐
 │                               EXTERNAL CONSUMING AGENCIES                             │
 │   • NHAI Central Data Lake          • MoRTH BhoomiRashi Portal                        │
 │   • PM GatiShakti (BISAG-N)         • EPC Contractor ERPs (L&T, Tata Projects)        │
 └──────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
                     HTTPS REST Handshake [X-API-Key Header]
                                            │
 ┌──────────────────────────────────────────┴────────────────────────────────────────────┐
 │                  ENTERPRISE API GATEWAY SHIELD (FastAPI Security Engine)              │
 │                                                                                       │
 │   [1. Key Look-up] ──────► [2. Argon2id Hash Verify] ──► [3. Application Restrict]   │
 │       (Fast DB Prefix)         (RFC 9106 Memory-Hard)       (Domain URL vs Server IP) │
 │                                                                       │               │
 │   [4. Rate Limiter] ◄────── [5. Scope Authorization] ◄────────────────┘               │
 │       (Token Bucket)            (predict:delay, gis:corridor)                         │
 └──────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────┐
 │                   INTERNAL ML INFERENCE & GEOSPATIAL MICROSERVICES                    │
 │                                                                                       │
 │   • XGBoost + LightGBM Delay Predictor     • Kaplan-Meier Survival Analysis Engine    │
 │   • TreeSHAP Attribution Pipeline          • PyProj/Shapely 120m RoW Cadastral Engine │
 └──────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────┐
 │                   OUTPUT PAYLOAD & STATUTORY AUDIT LEDGER (Point 12)                  │
 │   Standard JSON / GeoJSON Response  +  SHA-256 Tamper-Proof Audit Transaction Log    │
 └───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Modern Cryptographic Security Architecture

### 2.1 Why Legacy SHA-256 is Inadequate

- **Vulnerability to ASIC/GPU Brute-Force**: Standard SHA-256 was designed in 2001. Modern Bitcoin ASICs and consumer Nvidia GPUs compute **billions of SHA-256 hashes per second**. If a database is dumped, plain SHA-256 hashes of API keys can be cracked rapidly.
- **Length-Extension Vulnerability**: SHA-256 uses the 1970s Merkle–Damgård construction, susceptible to length-extension attacks unless manually wrapped in HMAC constructions.

### 2.2 Modern Standard: Argon2id (RFC 9106)

Our platform adopts **Argon2id** (the official winner of the Password Hashing Competition and the current gold standard recommended by OWASP, IETF, and NIST):

- **Memory-Hard Algorithm**: Requires 64 MB of dedicated RAM per hash computation, completely paralyzing ASIC and GPU brute-force attacks.
- **Side-Channel Immunity**: Combines Argon2d (data-dependent memory access) and Argon2i (data-independent memory access) to neutralize timing and cache-based side-channel attacks.

### 2.3 The Two-Tier Key Pattern (Stripe & GitHub Standard)

Raw keys are structured into a public prefix and a high-entropy secret token:

$$\underbrace{\text{lpad\_live\_}}_{\text{Environment}}\underbrace{\text{9f83a2b7}}_{\text{Public Prefix (8 chars)}}\underbrace{\text{\_c4819d7e5b204f11a87e2b83441a...}}_{\text{Secret Token (64 chars)}}$$

1. **Database Lookup ($O(1)$)**: The gateway queries the database by the indexed `Public Prefix` (`lpad_live_9f83a2b7`).
2. **Cryptographic Validation**: The remaining 64-character secret is verified against the stored **Argon2id hash** using constant-time string comparison (`secrets.compare_digest`).

---

## 3. Application Restrictions: Web Referrer vs Server IP

Government agencies operate in two distinct calling environments. Our gateway implements Google Maps-style application restrictions:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CHOOSE APPLICATION RESTRICTION TYPE                             │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ (●) HTTP Referrers (Websites / Domains)  │ (○) Server IP Whitelisting (CIDR)           │
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ • Environment: Frontend Web Browser      │ • Environment: Backend Server / Cron Script │
│ • Caller IP: Dynamic (Airtel, Jio, Home) │ • Browser URL: NONE (Headless microservice) │
│ • Security Anchor: `Origin` / `Referer`  │ • Security Anchor: TCP Socket Source IP     │
│   e.g., `https://*.nhai.gov.in/*`        │   e.g., `164.100.24.15` (NIC Datacenter)    │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### 3.1 HTTP Referrer (URL) Restriction (Client-Side Calls)

- When an officer views an embedded widget inside `https://bhoomirashi.gov.in`, their browser connects to our API directly.
- Because the officer’s personal IP changes across mobile data and Wi-Fi, the gateway inspects the browser-verified `Referer` and `Origin` headers.
- Requests originating from unauthorized hostnames (or `localhost`) are instantly rejected with `403 Forbidden: Referrer Restricted`.

### 3.2 Server IP Whitelisting (Server-to-Server Calls)

- When NHAI’s central server in Delhi executes a nightly Python batch script (`cron job`), no browser exists and HTTP headers can be easily spoofed via cURL.
- The gateway validates the physical **TCP socket IP**. An attacker cannot spoof an IP over a TCP 3-way handshake over the public internet, ensuring only whitelisted NIC cloud subnets (`164.100.0.0/16`) can execute batch predictions.

---

## 4. Rate Limiting & Denial-of-Service Protection

To prevent model starvation and DDoS attacks, the gateway enforces a **Token Bucket Rate Limiting Algorithm**:

| Tier Name                           | Quota                | Burst Limit   | Target Agency                      |
| :---------------------------------- | :------------------- | :------------ | :--------------------------------- |
| **Tier 1: CALA District Office**    | 60 requests / min    | 10 req / sec  | District Land Acquisition Officers |
| **Tier 2: State Highway Authority** | 300 requests / min   | 30 req / sec  | State PWD / UPEIDA / MSRDC         |
| **Tier 3: MoRTH / NHAI Central HQ** | 1,200 requests / min | 100 req / sec | PM GatiShakti & Central Data Lake  |

When limits are exceeded, the API responds with `HTTP 429 Too Many Requests` and standard telemetry headers:

- `X-RateLimit-Limit: 60`
- `X-RateLimit-Remaining: 0`
- `Retry-After: 42` (seconds until token replenish)

---

## 5. UI/UX Developer Portal Specification (SIH Strategy)

To maximize scoring during the Smart India Hackathon (SIH) jury evaluation, the developer portal is exposed via two intuitive entry points:

### 5.1 Navigation Placement

1. **Top Navbar Quick Action**: A dedicated `[⚡ API Gateway (Point 11)]` button in the main header navigation.
2. **Card 8 in Project Results View**: An executive integration summary card:
   - Status indicators for _BhoomiRashi Ingestion_, _PM GatiShakti GIS Link_, and _PFMS DBT Pipeline_.
   - Primary Action: **"Provision Ministry API Key & View SDK"**.

### 5.2 The 3-Tab Developer Console Modal

Clicking either entry point opens an interactive modal with three tabs:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MINISTRY & DEVELOPER API GATEWAY                                │
├──────────────────────────────┬──────────────────────────────┬──────────────────────────┤
│ 🔑 Tab 1: Key Provisioning   │ 💻 Tab 2: Code Snippets (SDK)│ 📖 Tab 3: Swagger UI     │
├──────────────────────────────┴──────────────────────────────┴──────────────────────────┤
│                                                                                        │
│  Agency: [ National Highways Authority of India (NHAI)                               ▼]│
│  Environment: (●) Production (Live)   (○) Sandbox Testing                              │
│                                                                                        │
│  Statutory Scopes:                                                                     │
│  [✔] predict:delay       [✔] gis:corridor       [✔] cadastral:read                     │
│                                                                                        │
│  Security Restrictions:                                                                │
│  (●) HTTP Referrer: [ https://*.nhai.gov.in/*, https://*.morth.nic.in/*              ] │
│  ( ) IP Whitelist:  [ e.g., 164.100.24.15                                            ] │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Generated Key: lpad_live_9f83a2b7_c4819d7e5b204f11a87e2b83441a... [ 📋 Copy Key ] │  │
│  │  🔒 Encrypted using Argon2id (RFC 9106) Memory-Hard Hashing                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
│  [ 🚀 Open Interactive Swagger Explorer (/docs) ↗ ]   [ 📥 Download Postman JSON ]     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. REST API Endpoint Contracts (OpenAPI 3.0)

### 6.1 Endpoint: Predict Project Delay & Risk

- **Route**: `POST /api/v1/predict/delay`
- **Headers**: `X-API-Key: lpad_live_...`
- **Request Body**:

```json
{
  "project_name": "Gorakhpur Link Expressway",
  "state": "Uttar Pradesh",
  "total_km": 91.3,
  "packages_count": 2,
  "disbursed_pct": 52.0,
  "court_cases_count": 8,
  "forest_clearance_stage": "STAGE_1_PENDING"
}
```

- **Response Body (`HTTP 200 OK`)**:

```json
{
  "status": "success",
  "project_id": "PRJ-UP-GLX-02",
  "timestamp": "2026-09-23T22:50:00Z",
  "ml_prediction": {
    "delay_probability": 0.814,
    "risk_grade": "CRITICAL",
    "predicted_delay_days": 68,
    "survival_horizon_6m": "44.2% clearance probability",
    "top_risk_drivers": [
      { "factor": "forest_clearance_lag", "impact_days": "+34 days" },
      { "factor": "court_stay_arbitration", "impact_days": "+22 days" },
      { "factor": "pfms_escrow_delay", "impact_days": "+12 days" }
    ]
  },
  "prescriptive_sop": {
    "immediate_statutory_action": "Issue D.O. Letter to DFO for Stage-1 Forest Diversion under Van Adhiniyam",
    "responsible_authority": "Project Director (NHAI / UPEIDA)",
    "statutory_mandate": "RFCTLARR Act 2013 / Forest Conservation Act"
  }
}
```

### 6.2 Endpoint: Query 120m Corridor GeoJSON

- **Route**: `GET /api/v1/corridor/{project_id}/row-gis`
- **Headers**: `X-API-Key: lpad_live_...`
- **Response Body (`HTTP 200 OK`)**: Standard **RFC 7946 GeoJSON FeatureCollection** containing the centerline line string and individual 120m Khasra polygon strips with embedded delay metrics.

---

## 7. Statutory Audit Trail & Compliance (Point 12 Synergy)

In compliance with **MeitY & CERT-In guidelines for Government Data Interoperability**, every single API transaction writes an immutable record to the audit ledger:

```json
{
  "audit_event_id": "AUD-API-2026-9912",
  "timestamp": "2026-09-23T22:50:00.124Z",
  "agency_id": "NHAI-HQ-CENTRAL",
  "key_prefix": "lpad_live_9f83a2b7",
  "endpoint": "POST /api/v1/predict/delay",
  "caller_ip": "164.100.24.15",
  "http_status": 200,
  "ml_latency_ms": 38.4,
  "sha256_payload_hash": "a4f8e71239c09b83a..."
}
```

---

## 8. SIH Pitch & Demonstration Script (30 Seconds)

When presenting Point 11 to the hackathon jury:

> _"Judges, government ministries like MoRTH or NHAI will never discard their multi-crore existing IT portals to use an external website._
>
> _To solve this, our platform functions as an **Enterprise AI-as-a-Service (AIaaS) API Gateway**:_
> _1. An IT engineer from NHAI opens our **Developer Portal**, selects their agency, and provisions an **Argon2id (RFC 9106) memory-hard encrypted API key**._
> _2. They enforce **Google Maps-style domain restrictions** (`_.nhai.gov.in`) or **NIC Server IP whitelisting** so the key cannot be abused if leaked.*
*3. With 4 lines of Python or cURL, their existing dashboard receives live delay predictions, survival curves, and prescriptive SOPs in under 40 milliseconds.*
*4. And here is our live **OpenAPI Swagger UI (`/docs`)\*_ where any ministry engineer can test the live endpoints right now."_
