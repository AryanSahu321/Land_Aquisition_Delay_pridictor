import React, { useState } from "react";
import {
  X,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Scale,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Key,
  Database,
  Building,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Send,
  Sparkles,
} from "lucide-react";

// Statutory Roles Data
const ROLES = {
  FIELD_REVENUE: {
    key: "FIELD_REVENUE",
    badge: "Tier 1: Cadastral Field Administration",
    id: "REV-UP-TEH-104",
    name: "Shri S. K. Verma",
    designation: "Tehsildar & Sub-Divisional Revenue Officer, Handia",
    powers: "State Revenue Code / NH Act Sec 3B",
    jurisdiction: "Tehsil Handia (32 Villages)",
    disbLimit: "Verification Authority Only",
    badgeColor: "emerald",
    icon: "📍",
    alerts: [
      {
        id: "ALT-FR-01",
        level: "CRITICAL",
        title: "Missing Khasra Mutation Deeds",
        msg: "14 parcels in Package 2 have disputed succession claims blocking CALA award notice.",
        time: "12m ago (Server Watchdog)",
        action: "Dispatch Field Kanoongo",
      },
      {
        id: "ALT-FR-02",
        level: "WARNING",
        title: "Joint Measurement Survey (JMS) Pending",
        msg: "Chainage km 28+200 boundary pillars unverified due to canal embankment overlap.",
        time: "2h ago (Server Watchdog)",
        action: "Schedule On-Site Survey",
      },
    ],
    recommendations: [
      {
        id: "REC-FR-01",
        title: "Convene Village Mutation Camp (Khasra #214-#228)",
        statute: "UP Revenue Code 2006, Sec 34",
        delayImpact: "-22 Days Delay",
        desc: "Conduct on-spot hearing for 8 co-sharer families to obtain amicable succession consent before Section 3D declaration.",
        actionText: "Review Camp Order & e-Sign",
        financialImpact: "₹0 (Administrative)",
        khasraList: "Khasra #214, #215, #218, #222, #228",
      },
      {
        id: "REC-FR-02",
        title: "Issue Cadastral Boundary Certification for Package 02",
        statute: "NH Act 1956, Section 3B",
        delayImpact: "-15 Days Delay",
        desc: "Certify unobstructed physical boundary demarcation for 8.4 km linear stretch to enable contractor earthworks.",
        actionText: "Review Certificate & e-Sign",
        financialImpact: "₹0 (Statutory Survey)",
        khasraList: "Chainage km 28+000 to km 36+400",
      },
    ],
  },

  CALA_TRIBUNAL: {
    key: "CALA_TRIBUNAL",
    badge: "Tier 2: Statutory Land Acquisition Tribunal",
    id: "CALA-UP-PRY-04",
    name: "Dr. R. K. Sharma, IAS",
    designation:
      "Competent Authority for Land Acquisition (CALA) & ADM (Revenue), Prayagraj",
    powers: "NH Act Sec 3C, 3D, 3G, 3H / RFCTLARR 2013",
    jurisdiction: "District Prayagraj & Mirzapur",
    disbLimit: "Up to ₹50 Crore / Statutory Order",
    badgeColor: "blue",
    icon: "⚖️",
    alerts: [
      {
        id: "ALT-CALA-01",
        level: "CRITICAL",
        title: "Statutory Section 3D Lapse Warning",
        msg: "Section 3A notification is at 310 days elapsed. 55 days remaining before statutory acquisition lapses under Section 3D(1)!",
        time: "5m ago (Server Watchdog)",
        action: "Review Draft Sec 3D Declaration",
      },
      {
        id: "ALT-CALA-02",
        level: "CRITICAL",
        title: "Objection Hearing Window Closing",
        msg: "23 statutory objections under Section 3C require final judicial disposal order within 7 days.",
        time: "1h ago (Server Watchdog)",
        action: "Summon CALA Hearing Bench",
      },
      {
        id: "ALT-CALA-03",
        level: "WARNING",
        title: "Section 3H Court Escrow Deposit Pending",
        msg: "₹18.4 Crore compensation contested in Reference Suit #84/2026 must be deposited into court escrow.",
        time: "4h ago (Server Watchdog)",
        action: "Issue PFMS Escrow Deposit Order",
      },
    ],
    recommendations: [
      {
        id: "REC-CALA-01",
        title: "Pass Final Section 3G Statutory Compensation Award",
        statute: "NH Act 1956, Section 3G(1)",
        delayImpact: "-38 Days Delay",
        desc: "Authorize formal compensation award of ₹18.45 Crore for 35 undisputed titles in Package 03 to enable physical possession under Section 3E.",
        actionText: "Review Award Order & e-Sign",
        financialImpact: "₹18,45,00,000",
        khasraList: "Package 03 (35 Undisputed Parcels)",
      },
      {
        id: "REC-CALA-02",
        title: "Order Section 3H(4) Court Escrow Transfer for Contested Plots",
        statute: "NH Act 1956, Section 3H(4)",
        delayImpact: "-45 Days Delay",
        desc: "Deposit contested compensation into District Principal Civil Court to legally extinguish landholder injunction and take immediate possession.",
        actionText: "Review Court Deposit Order & e-Sign",
        financialImpact: "₹4,20,00,000",
        khasraList: "Reference Suit #84/2026 (7 Contested Parcels)",
      },
    ],
  },

  NHAI_PD: {
    key: "NHAI_PD",
    badge: "Tier 3: Executive Infrastructure Director",
    id: "NHAI-PIU-VNS-01",
    name: "Er. V. P. Singh",
    designation: "Project Director, NHAI PIU Varanasi / Prayagraj Corridor",
    powers: "NHAI Act 1988 / EPC Contract Administration Rules",
    jurisdiction: "NH-19 & Purvanchal Spur (340.8 km)",
    disbLimit: "Commercial EPC Contracts & Legal Defenses",
    badgeColor: "purple",
    icon: "🏗️",
    alerts: [
      {
        id: "ALT-PD-01",
        level: "CRITICAL",
        title: "High Court Injunction Active on Chainage km 42",
        msg: "Farmer cooperative secured interim stay on Package 04. Contractor idling claims accumulating at ₹4.5 Lakh/day.",
        time: "18m ago (Server Watchdog)",
        action: "Instruct Legal Counsel",
      },
      {
        id: "ALT-PD-02",
        level: "WARNING",
        title: "Penal Interest Accrual Warning",
        msg: "₹412 Crore sitting in court escrow for 1,226 days. Accumulating ₹4.1 Cr/month in 15% statutory penal interest under Sec 34.",
        time: "3h ago (Server Watchdog)",
        action: "Expedite Title Scrutiny",
      },
    ],
    recommendations: [
      {
        id: "REC-PD-01",
        title: "File Urgent Counter-Affidavit in High Court (Stay Vacation)",
        statute: "Article 226 / NH Act Section 3D(2)",
        delayImpact: "-42 Days Delay",
        desc: "Submit Section 3D(2) Gazette Notification proving absolute statutory vesting to vacate stay order on Package 04.",
        actionText: "Review Counter-Affidavit & e-Sign",
        financialImpact: "₹5,00,000 (Legal Counsel)",
        khasraList: "High Court WP No. 1982/2026",
      },
      {
        id: "REC-PD-02",
        title: "Re-Sequence EPC Contractor Earthworks to Cleared Chainages",
        statute: "FIDIC / EPC Agreement Schedule G",
        delayImpact: "-28 Days Delay",
        desc: "Direct contractor machinery to shift from disputed km 42 to 100% encumbrance-free km 48-65 to avoid contractor idling claims.",
        actionText: "Review Engineer Variation Order & Sign",
        financialImpact: "Zero Financial Penalty",
        khasraList: "Chainage km 48+000 to km 65+000",
      },
    ],
  },

  MINISTRY_APEX: {
    key: "MINISTRY_APEX",
    badge: "Tier 4: Apex Policy & Inter-Ministerial Authority",
    id: "MORTH-SEC-DEL-01",
    name: "Shri A. K. Malhotra, IAS",
    designation: "Secretary, Ministry of Road Transport & Highways (MoRTH)",
    powers: "Cabinet Allocation of Business Rules / PM GatiShakti NPG",
    jurisdiction: "National Infrastructure Corridor Network",
    disbLimit: "National Project Budget Allocations",
    badgeColor: "red",
    icon: "🏛️",
    alerts: [
      {
        id: "ALT-MIN-01",
        level: "CRITICAL",
        title: "Corridor Horizon Exceeds Critical Threshold",
        msg: "Purvanchal Corridor projected delay +123 days exceeding FY milestone. Review required for Cabinet Committee on Infrastructure.",
        time: "30m ago (Server Watchdog)",
        action: "Schedule NPG Review",
      },
      {
        id: "ALT-MIN-02",
        level: "WARNING",
        title: "Stage-II Forest Clearance Pending in MoEFCC",
        msg: "24.5 Hectares forest land diversion proposal awaiting State Advisory Committee clearance for 180 days.",
        time: "5h ago (Server Watchdog)",
        action: "Issue Inter-Ministerial Memo",
      },
    ],
    recommendations: [
      {
        id: "REC-MIN-01",
        title:
          "Convene PM GatiShakti National Planning Group (NPG) Special Session",
        statute: "PM GatiShakti Framework 2021",
        delayImpact: "-55 Days Delay",
        desc: "Summon joint meeting with Ministry of Environment, Forest & Climate Change and Railway Board to grant unified clearance.",
        actionText: "Review NPG Memo & e-Sign",
        financialImpact: "Inter-Ministerial Accord",
        khasraList: "National Priority Corridor 12",
      },
      {
        id: "REC-MIN-02",
        title: "Sanction ₹50 Crore Advance Utility Shifting Revolving Fund",
        statute: "MoRTH Statutory Utility Policy 2023",
        delayImpact: "-35 Days Delay",
        desc: "Direct immediate state electricity transmission line relocation without waiting for EPC contractor milestone certification.",
        actionText: "Review Financial Sanction & e-Sign",
        financialImpact: "₹50,00,00,000",
        khasraList: "State Transmission Line Relocation",
      },
    ],
  },
};

// Initial Immutable Audit Trail Log
const INITIAL_AUDIT_LOGS = [
  {
    id: "AUD-2026-0922-8812",
    time: "2026-09-22 14:40:15",
    officer: "Dr. R. K. Sharma, IAS (CALA)",
    role: "CALA_TRIBUNAL",
    section: "Section 3G(1)",
    action:
      "Approved Section 3G compensation award for ₹18.45 Cr across 35 undisputed khasra parcels in Package 03.",
    hash: "a8f9c1b72e50d8329f648d1c8e9b4077f2409f87428e3b1c67d3e09a47ef012a",
    status: "IMMUTABLE_COMMITTED",
  },
  {
    id: "AUD-2026-0923-3491",
    time: "2026-09-23 11:15:42",
    officer: "Er. V. P. Singh (NHAI PD)",
    role: "NHAI_PD",
    section: "Section 3D(2)",
    action:
      "Dispatched High Court counter-affidavit pleading absolute vesting under NH Act Section 3D(2) for km 42.",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    status: "IMMUTABLE_COMMITTED",
  },
  {
    id: "AUD-2026-0924-1004",
    time: "2026-09-24 09:20:08",
    officer: "S. K. Verma (Tehsildar)",
    role: "FIELD_REVENUE",
    section: "UP Rev Code Sec 34",
    action:
      "Executed 14 co-sharer mutation endorsements at Handia Tehsil Camp; updated Jamabandi registry.",
    hash: "7d4a13b689a712fbc45e22981048bca61201994821a8cd39fe81023847291a82",
    status: "IMMUTABLE_COMMITTED",
  },
];

export default function RoleRbacModal({ isOpen, onClose }) {
  const [activeRoleKey, setActiveRoleKey] = useState("CALA_TRIBUNAL");
  const [selectedActionForSign, setSelectedActionForSign] = useState(null);
  const [otpInput, setOtpInput] = useState("729184");
  const [isSigning, setIsSigning] = useState(false);
  const [signedActionIds, setSignedActionIds] = useState(new Set());
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState(new Set());

  if (!isOpen) return null;

  const currentRole = ROLES[activeRoleKey];

  const handleAcknowledgeAlert = (alertId) => {
    setAcknowledgedAlertIds((prev) => new Set([...prev, alertId]));
  };

  const handleOpenSignModal = (rec) => {
    setSelectedActionForSign(rec);
  };

  const handleExecuteESign = () => {
    if (!selectedActionForSign) return;
    setIsSigning(true);

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toISOString().replace("T", " ").substring(0, 19);
      const randomHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");

      const newLog = {
        id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        time: timeStr,
        officer: `${currentRole.name} (${currentRole.designation.split("&")[0].trim()})`,
        role: currentRole.key,
        section: selectedActionForSign.statute,
        action: `Executed statutory order: "${selectedActionForSign.title}" (${selectedActionForSign.financialImpact}). Applied Aadhaar e-Sign DSC.`,
        hash: randomHash,
        status: "IMMUTABLE_COMMITTED",
      };

      setAuditLogs((prev) => [newLog, ...prev]);
      setSignedActionIds(
        (prev) => new Set([...prev, selectedActionForSign.id]),
      );
      setIsSigning(false);
      setSelectedActionForSign(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-7xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header with Role Tabs */}
        <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Statutory Role-Based Access Control, Autonomous Alerts &amp;
                  e-Sign
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Points 8, 9 &amp; 12
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statutory Separation of Powers &bull; NH Act 1956 &bull;
                RFCTLARR Act 2013 &bull; Human-in-the-Loop Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Tier Role Switcher Navigation Bar */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active Official:
            </span>
            {Object.values(ROLES).map((r) => (
              <button
                key={r.key}
                onClick={() => setActiveRoleKey(r.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                  activeRoleKey === r.key
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-750"
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.name}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  (
                  {r.key === "FIELD_REVENUE"
                    ? "Lekhpal"
                    : r.key === "CALA_TRIBUNAL"
                      ? "CALA"
                      : r.key === "NHAI_PD"
                        ? "NHAI PD"
                        : "Ministry"}
                  )
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>NIC SSO Verified &bull; Section Separation Enforced</span>
          </div>
        </div>

        {/* Active Official Profile Card */}
        <div className="px-5 py-3 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  {currentRole.badge}
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  ID: {currentRole.id}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">
                {currentRole.name} &mdash;{" "}
                <span className="text-slate-300 font-normal text-sm">
                  {currentRole.designation}
                </span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Statutory Jurisdiction
                </span>
                <span className="font-semibold text-slate-200">
                  {currentRole.jurisdiction}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Disbursement Ceiling
                </span>
                <span className="font-bold text-emerald-400">
                  {currentRole.disbLimit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main Grid: Point 8 Alerts (Left) + Point 9 SOP Actions (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Point 8 Autonomous Statutory Alerts */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔔</span>
                    <h3 className="font-bold text-white text-sm">
                      Automated Statutory Alerts (Point 8)
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/30">
                    {currentRole.alerts.length} Actionable
                  </span>
                </div>

                {/* Autonomous Server Watchdog Explanation */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-[11px] text-indigo-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold">
                      100% Autonomous Server Watchdog Engine
                    </strong>
                    Evaluated autonomously by backend statutory daemons without
                    human intervention. Automatically pushes notifications to
                    registered official NIC Sandes &amp; Gov Email registry.
                  </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-3">
                  {currentRole.alerts.map((al) => {
                    const isAck = acknowledgedAlertIds.has(al.id);
                    return (
                      <div
                        key={al.id}
                        className={`p-3.5 rounded-xl border transition ${
                          al.level === "CRITICAL"
                            ? "bg-red-950/20 border-red-800/40"
                            : "bg-amber-950/20 border-amber-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              al.level === "CRITICAL"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {al.level} ALERT
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {al.time}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">
                          {al.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                          {al.msg}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">
                            Officer Response Action:
                          </span>
                          {isAck ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Action Dispatched
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcknowledgeAlert(al.id)}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                            >
                              {al.action} &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Point 9 Prescriptive SOP Recommendations */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-white text-sm">
                      Prescriptive Statutory SOP Orders (Point 9 &bull; HITL)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Aadhaar e-Sign Enabled
                  </span>
                </div>

                {/* HITL Constitutional Notice */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 flex items-start gap-2.5">
                  <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">
                      Constitutional Human-in-the-Loop Safeguard:
                    </strong>
                    Under Articles 77 and 166 of the Constitution of India, an
                    algorithm cannot unilaterally issue a Government Order. The
                    AI generates pre-drafted Draft for Approval (DFA)
                    note-sheets; the empowered nodal officer scrutinizes and
                    affixes their official Digital Signature.
                  </div>
                </div>

                {/* Prescriptive Recommendations Cards */}
                <div className="space-y-4">
                  {currentRole.recommendations.map((rec) => {
                    const isSigned = signedActionIds.has(rec.id);
                    return (
                      <div
                        key={rec.id}
                        className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded">
                            {rec.statute}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              {rec.delayImpact}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {rec.financialImpact}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {rec.desc}
                          </p>
                          <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                            Target Jurisdiction: {rec.khasraList}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Required Action:
                          </span>
                          {isSigned ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-lg">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              e-Signed &amp; Committed to Ledger
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenSignModal(rec)}
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>{rec.actionText}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Point 12: Comprehensive Tamper-Evident Immutable Audit Trail */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Point 12: Immutable Statutory Audit Trail &amp; Cryptographic
                  Ledger
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                SHA-256 Ledger: {auditLogs.length} Committed Blocks
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Every statutory decision, compensation award, and e-signed order
              is hashed with SHA-256 and permanently stored with officer
              credentials to satisfy Central Vigilance Commission (CVC) &amp;
              CAG audit mandates.
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Audit ID / Timestamp</th>
                    <th className="px-4 py-3">Authorized Official</th>
                    <th className="px-4 py-3">Statute / Section</th>
                    <th className="px-4 py-3">Action Description</th>
                    <th className="px-4 py-3">SHA-256 Integrity Block Hash</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-900/50 transition"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-white">{log.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {log.time}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        {log.officer}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sky-400 font-bold">
                        {log.section}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans text-xs max-w-md">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[10px] text-slate-400">
                        {log.hash.substring(0, 16)}...{log.hash.substring(48)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Committed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Interactive Aadhaar / Class-3 DSC e-Sign Modal */}
        {selectedActionForSign && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Official e-Sign &bull; Class-3 Digital Signature
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      NIC Jan-Parichay / Aadhaar e-Authentication Bridge
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActionForSign(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Legal Draft Details */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-sky-400 font-bold">
                      {selectedActionForSign.statute}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {selectedActionForSign.delayImpact}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedActionForSign.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedActionForSign.desc}
                  </p>
                  <div className="pt-1.5 border-t border-slate-800 flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Financial Quantum:</span>
                    <span className="text-white font-bold">
                      {selectedActionForSign.financialImpact}
                    </span>
                  </div>
                </div>

                {/* Signer Identity */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signing Authority:</span>
                    <span className="font-bold text-white">
                      {currentRole.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Designation:</span>
                    <span className="text-slate-300">
                      {currentRole.designation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate Datum:</span>
                    <span className="font-mono text-indigo-400">
                      CCA India Class-3 DSC (Exp 2028)
                    </span>
                  </div>
                </div>

                {/* 6-Digit OTP Simulation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Aadhaar / NIC e-Sign 6-Digit Security PIN / OTP
                  </label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-emerald-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    maxLength={6}
                  />
                  <span className="text-[10px] text-slate-400 block text-center">
                    Demo pre-filled with official token. Click below to execute
                    statutory order.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedActionForSign(null)}
                    className="w-1/2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteESign}
                    disabled={isSigning}
                    className="w-1/2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    {isSigning ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authenticate &amp; e-Sign</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
