# Role-Based Access, Predictive SOPs & Audit Trail Architecture

## Technical Specification for Points 8, 9, and 12

This document specifies the professional, enterprise-grade architecture for **Role-Based Access Control (RBAC)**, **Jurisdiction-Aware Prescriptive Recommendations (Point 9)**, **Automated Statutory Alerts (Point 8)**, and **Comprehensive Audit Trails (Point 12)** for the PM GatiShakti Statutory Land Acquisition Intelligence Platform.

---

## 1. The Core Philosophy: Statutory Separation of Powers

In Indian Administrative Law (National Highways Act 1956 & RFCTLARR Act 2013), an administrative officer can only execute actions permitted under their specific statutory jurisdiction:

- A **Field Revenue Inspector (Lekhpal)** cannot pass a compensation award under Section 3G.
- A **Competent Authority (CALA / ADM Land)** cannot unilaterally issue an inter-ministerial forest diversion order.
- An **NHAI Project Director** cannot adjudicate village succession or title dispute hearings.
- A **Ministry Secretary** does not personally verify village cadastral Khasra maps.

Therefore, our system couples **Role (Point 12)**, **Recommendations (Point 9)**, and **Alerts (Point 8)** into an integrated statutory state machine.

---

## 2. The 4-Tier Administrative Role Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 4: APEX POLICY & INTER-MINISTERIAL MONITORING                     │
│ Role: Ministry Secretary / PM GatiShakti Apex Nodal Officer            │
│ Statute: Government of India Allocation of Business Rules / PMGS NPG  │
│ Scope: Inter-ministerial coordination, Cabinet notes, Forest clearances│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TIER 3: INFRASTRUCTURE & EPC PROJECT EXECUTIVE                         │
│ Role: NHAI / UPEIDA Project Director (PD)                              │
│ Statute: NHAI Act 1988 & Contract Administration                       │
│ Scope: RoW handover to contractor, court counter-affidavits, escrow dep│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TIER 2: STATUTORY LAND ACQUISITION TRIBUNAL / CALA                     │
│ Role: Competent Authority for Land Acquisition (CALA / ADM Land)       │
│ Statute: NH Act 1956 (Sec 3C, 3D, 3G, 3H) / RFCTLARR 2013             │
│ Scope: Hearing objections, awarding compensation, releasing court money│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ TIER 1: GROUND REVENUE & CADASTRAL FIELD ADMINISTRATION                │
│ Role: Field Revenue Inspector / Tehsildar / Kanoongo                   │
│ Statute: State Revenue Code / NH Act 1956 Sec 3B                       │
│ Scope: Physical demarcation, Jamabandi mutation, heir succession check │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Role Specification Matrix

| Role Key        | Official Designation                                           | Jurisdiction & Statute                  | Specific Statutory Powers                                                                                                                          | Filtered Alerts (Point 8)                                                                                                                                        | Prescriptive SOP Actions (Point 9)                                                                                                        |
| :-------------- | :------------------------------------------------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `FIELD_REVENUE` | **Field Revenue Inspector / Tehsildar**                        | State Land Revenue Code / NH Act Sec 3B | • Cadastral ground survey<br/>• Khasra title deed verification<br/>• Co-sharer mutation resolution                                                 | • Missing title deeds in Package 2<br/>• Co-sharer inheritance dispute flagged<br/>• Aadhaar/bank mismatch for 14 families                                       | • Organize Village Mutation Camp<br/>• Issue Physical Demarcation Certificate<br/>• Expedite Jamabandi succession records                 |
| `CALA_TRIBUNAL` | **Competent Authority for Land Acquisition (CALA / ADM Land)** | NH Act 1956 Sec 3C, 3D, 3G, 3H          | • Quasi-judicial hearing of objections (Sec 3C)<br/>• Compensation award determination (Sec 3G)<br/>• Escrow disbursement / court deposit (Sec 3H) | • 🔴 Statutory Lapse: Sec 3A reaches 310 days (55d left for Sec 3D)<br/>• Objection hearings pending beyond 21 days<br/>• Section 3G awards pending disbursement | • Issue Section 3D Statutory Declaration<br/>• Formulate & Sign Section 3G Award (₹18.4 Cr)<br/>• Order Section 3H Court Escrow Deposit   |
| `NHAI_PD`       | **NHAI / UPEIDA Project Director (PD)**                        | NHAI Act 1988 / EPC Contract Rules      | • Commercial contract variation approval<br/>• Filing High Court counter-affidavits<br/>• RoW handover and contractor staging                      | • 🔴 Court Stay Order on Chainage km 42<br/>• 🟡 Penal Interest Bleed (>₹4 Cr/mo under Sec 34)<br/>• Package 4 contractor downtime > 45 days                     | • Authorize High Court Counter-Affidavit<br/>• Re-sequence Contractor to Dispute-Free km<br/>• File Section 3H(4) Court Vacation Petition |
| `MINISTRY_APEX` | **Ministry Secretary / PM GatiShakti Nodal**                   | PM GatiShakti NPG / MoRTH / MoEFCC      | • Inter-ministerial coordination<br/>• Stage-II Forest Clearance escalation<br/>• State utility shifting fund release                              | • Corridor milestone delayed by >90 days<br/>• Stage-II Forest Clearance stuck in MoEFCC >180d<br/>• Railway crossing GAD approval pending                       | • Convene PM GatiShakti NPG Meeting<br/>• Issue Inter-Ministerial Fast-Track Memo<br/>• Sanction ₹50 Cr Special Utility Grant             |

---

---

## 4. Operational Reality: Automated Alerts vs Human Escalation (Point 8)

### How Point 8 Operates Autonomously in Production:

A common misconception is that an IAS officer must manually log in and click a button to send an alert. **In production, the exact opposite is true:**

1. **24/7 Autonomous Background Watchdog**:
   - The backend runs a stateless, autonomous statutory event engine (scheduled daemon / database change-data-capture).
   - It continuously checks statutory countdowns (e.g. `days_in_stage`), court escrow records, and corridor risk scores.
2. **Zero-Click Autonomous Push**:
   - The moment a condition triggers (e.g. Section 3A reaches **Day 300**, or a High Court stay order is registered under Section 3H), **the server autonomously fires the alert**:
     - **Push Notification**: Dispatched directly to the officer's in-app notification center.
     - **NIC Sandes Gateway**: Automated SMS dispatch to the designated nodal officer's registered mobile number.
     - **Official Gov Email**: Instant memo transmitted to the officer's `@nic.in` address.
3. **The Role of the UI Action Button on the Alert**:
   - The button displayed on each alert card (e.g., _"Schedule NPG Review"_ or _"Instruct Legal Counsel"_) is the **Officer's Response / Escalation Action** after receiving the alert.
   - The alert was already delivered automatically; the button allows the official to take immediate administrative action on it with 1 click.

---

## 5. Constitutional Reality: How Government Orders Work (Point 9 & Human-in-the-Loop)

### Can an AI Algorithm Issue a Government Order (GO)?

**NO! An algorithm can NEVER legally issue a statutory order or gazette notification.**

Under **Articles 77 and 166 of the Constitution of India**:

- All executive action of the Government of India or a State must be expressed to be taken in the name of the **President of India** or the **Governor of the State**.
- Orders must be authenticated by a competent officer (Secretary, District Magistrate, CALA).
- An AI algorithm ordering the confiscation of land, fixing compensation awards, or releasing public treasury funds would be **ultra vires, illegal, and unconstitutional**.

### The Professional GovTech Solution: AI Decision-Support with e-Office Integration

In enterprise GovTech (like **NIC e-Office** and **Bhoomi Rashi**), the platform functions as an **AI-Assisted Decision Support System (DSS)** following a 4-step Human-in-the-Loop (HITL) lifecycle:

```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1: AI RISK DETECTION & STATUTORY PRESCRIPTION (Point 9)           │
│ The ML model identifies the corridor bottleneck and recommends:        │
│ "Disbursing ₹18.45 Cr for 35 undisputed titles will save 38 delay days.│
│ Recommended Action: Pass Section 3G Statutory Award."                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 2: AI PRE-DRAFTING ("Draft for Approval" / DFA Legal Note-Sheet)   │
│ Instead of an officer spending days drafting legal notices, the AI     │
│ pre-populates the official Draft Government Order, citing exact Khasra │
│ parcel numbers, Gazette notifications, and statutory valuation tables. │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 3: HUMAN SCRUTINY & DIGITAL SIGNATURE (e-Sign / Class-3 DSC)      │
│ The empowered officer (CALA / IAS) reviews the pre-drafted legal order,│
│ verifies facts, and applies their official Digital Signature (DSC).    │
│ Without this human digital signature, NO order is legally issued.      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 4: DISPATCH & IMMUTABLE STATUTORY AUDIT LEDGER (Point 12)         │
│ Once e-signed, the order is gazetted, transmitted to PFMS for bank     │
│ release, and permanently committed to the immutable audit trail.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. How the "Sign-In & Role Switching" System Works (UX Flow)

### A. Evaluator / Demo Experience (Zero-Friction Role Switcher)

To prevent judges and evaluators from getting stuck at a login screen:

1. **Persistent Top Bar Switcher**:
   A prominent dropdown in the navbar displays:
   `👤 Active Official: [Competent Authority (CALA) ▾]`.
2. **Instant Persona Switching**:
   Clicking any of the 4 roles instantly transforms the interface:
   - Changes the active officer badge & legal jurisdiction.
   - Re-filters the Notification Center (Point 8) to that officer's priority alerts.
   - Filters the Prescriptive Recommendations (Point 9) to actions within that officer's authority.
   - Adjusts the Audit Trail to log actions under that officer's credential.

### B. Formal Enterprise Sign-In Modal (NIC SSO / Jan-Parichay Simulation)

A "Sign In" button in the corner opens an official Gov portal modal with:

- Standard NIC Gov credentials (`user@nic.in`).
- **"Quick Demo Login"** buttons for each role so anyone can test one-click authentication.

---

## 7. Comprehensive Statutory Audit Trail (Point 12)

Every action executed by an officer produces an immutable audit record:

```json
{
  "audit_id": "AUD-2026-0922-8812",
  "timestamp": "2026-09-22T14:40:15Z",
  "officer_name": "Dr. R. K. Sharma, IAS",
  "designation": "Competent Authority for Land Acquisition (CALA)",
  "agency": "CALA / District Administration, Prayagraj",
  "role_key": "CALA_TRIBUNAL",
  "project_id": "UPEIDA/PE/2018",
  "statutory_act": "National Highways Act, 1956",
  "statutory_section": "Section 3G(1)",
  "action_code": "APPROVE_COMPENSATION_AWARD",
  "action_description": "Approved Section 3G compensation award for ₹18.45 Crore across 35 undisputed khasra parcels in Package 03.",
  "financial_impact_inr": 184500000.0,
  "status": "EXECUTED",
  "sha256_integrity_hash": "a8f9c1b72e50d8329f648d1c8e9b4077f2409f87428e3b1c67d3e09a47ef012a"
}
```

---

## 6. Verification and Rollout Plan

1. **Step 1**: Review the interactive `role_demo.html` demo to experience the role switching, alert filtering, and audit trail logging in your browser.
2. **Step 2**: Upon user confirmation ("Proceed"), implement the backend state machine in `backend/` and wire the role switcher into the React frontend `frontend/src/components/ProjectResultsView.jsx`.
