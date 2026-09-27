import os
import pymupdf

os.makedirs('sih/assets', exist_ok=True)

slide6_svgs = {
    'github_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#181717"/>
      <path d="M50 18 C32.3 18 18 32.3 18 50 C18 64.1 27.2 76.1 39.9 80.4 C41.5 80.7 42.1 79.7 42.1 78.9 C42.1 78.1 42.1 76.1 42.1 73.4 C33.2 75.3 31.3 69.1 31.3 69.1 C29.9 65.4 27.8 64.4 27.8 64.4 C24.9 62.4 28 62.5 28 62.5 C31.2 62.7 32.9 65.8 32.9 65.8 C35.8 70.7 40.4 69.3 42.2 68.5 C42.5 66.4 43.3 65 44.3 64.1 C37.2 63.3 29.7 60.5 29.7 48.3 C29.7 44.8 30.9 42 32.9 39.8 C32.6 39 31.5 35.8 33.2 31.4 C33.2 31.4 35.9 30.5 42 34.7 C44.6 34 47.3 33.6 50 33.6 C52.7 33.6 55.4 34 58 34.7 C64.1 30.5 66.8 31.4 66.8 31.4 C68.5 35.8 67.4 39 67.1 39.8 C69.1 42 70.3 44.8 70.3 48.3 C70.3 60.6 62.8 63.3 55.6 64.1 C56.8 65.1 57.9 67.2 57.9 70.4 C57.9 75 57.9 78.6 57.9 78.9 C57.9 79.7 58.5 80.7 60.1 80.4 C72.8 76.1 82 64.1 82 50 C82 32.3 67.7 18 50 18 Z" fill="#FFFFFF"/>
    </svg>""",

    'api_docs_icon.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#009688"/>
      <!-- REST API / Cloud OpenAPI Brackets -->
      <path d="M38 34 L24 50 L38 66" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M62 34 L76 50 L62 66" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="56" y1="30" x2="44" y2="70" stroke="#80CBC4" stroke-width="4.5" stroke-linecap="round"/>
    </svg>""",

    'statutory_book_icon.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#1E3A8A"/>
      <!-- Law Book & Gazette Seal -->
      <path d="M26 30 C26 26 36 24 50 28 C64 24 74 26 74 30 L74 72 C74 72 64 68 50 72 C36 68 26 72 26 72 Z" fill="#DBEAFE" stroke="#3B82F6" stroke-width="2"/>
      <line x1="50" y1="28" x2="50" y2="72" stroke="#1D4ED8" stroke-width="3"/>
      <!-- Golden Scales on Cover -->
      <circle cx="50" cy="46" r="6" fill="#F59E0B"/>
    </svg>""",

    # UI Mockup 1: Purvanchal 340.8 km Interactive RoW GIS Map (Dark Modern UI)
    'ui_gis_corridor.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
      <rect width="600" height="360" rx="12" fill="#0F172A"/>
      <!-- Top App Bar -->
      <rect width="600" height="42" fill="#1E293B"/>
      <circle cx="22" cy="21" r="6" fill="#EF4444"/>
      <circle cx="38" cy="21" r="6" fill="#F59E0B"/>
      <circle cx="54" cy="21" r="6" fill="#10B981"/>
      <text x="75" y="26" font-family="Arial" font-size="12" font-weight="bold" fill="#F8FAFC">GatiShakti AI GIS — Purvanchal 340.8 km RoW Alignment</text>
      <rect x="470" y="10" width="115" height="22" rx="4" fill="#334155"/>
      <text x="480" y="25" font-family="Arial" font-size="10" font-weight="bold" fill="#38BDF8">EPSG:4326 WGS84</text>
      
      <!-- Map Canvas Area -->
      <rect x="15" y="55" width="570" height="290" rx="8" fill="#1E293B"/>
      <!-- Cadastral Grid lines -->
      <line x1="15" y1="120" x2="585" y2="120" stroke="#334155" stroke-width="1"/>
      <line x1="15" y1="190" x2="585" y2="190" stroke="#334155" stroke-width="1"/>
      <line x1="15" y1="260" x2="585" y2="260" stroke="#334155" stroke-width="1"/>
      <line x1="150" y1="55" x2="150" y2="345" stroke="#334155" stroke-width="1"/>
      <line x1="300" y1="55" x2="300" y2="345" stroke="#334155" stroke-width="1"/>
      <line x1="450" y1="55" x2="450" y2="345" stroke="#334155" stroke-width="1"/>
      
      <!-- Purvanchal Expressway Corridor Path (Glowing Cyan/Emerald Line) -->
      <path d="M40 280 C140 180 260 220 380 140 S500 110 560 90" stroke="#10B981" stroke-width="10" fill="none" opacity="0.3"/>
      <path d="M40 280 C140 180 260 220 380 140 S500 110 560 90" stroke="#10B981" stroke-width="4" fill="none"/>
      
      <!-- 8 Construction Packages Pins -->
      <circle cx="40" cy="280" r="8" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
      <text x="30" y="305" font-family="Arial" font-size="10" font-weight="bold" fill="#F8FAFC">Pkg 1 (Ch 0.0)</text>
      
      <circle cx="160" cy="210" r="7" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <text x="145" y="195" font-family="Arial" font-size="9" font-weight="bold" fill="#FCD34D">Pkg 3 (Barabanki)</text>
      
      <circle cx="310" cy="180" r="7" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
      <text x="290" y="205" font-family="Arial" font-size="9" font-weight="bold" fill="#93C5FD">Pkg 5 (Sultanpur)</text>
      
      <circle cx="450" cy="120" r="7" fill="#8B5CF6" stroke="#FFFFFF" stroke-width="2"/>
      <text x="435" y="105" font-family="Arial" font-size="9" font-weight="bold" fill="#C4B5FD">Pkg 7 (Azamgarh)</text>
      
      <circle cx="560" cy="90" r="8" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
      <text x="495" y="80" font-family="Arial" font-size="10" font-weight="bold" fill="#6EE7B7">Pkg 8 (Ch 340.8 Ghazipur)</text>
      
      <!-- Floating HUD Panel (Telemetry) -->
      <rect x="30" y="70" width="180" height="75" rx="6" fill="#0F172A" opacity="0.9" stroke="#475569" stroke-width="1"/>
      <text x="40" y="90" font-family="Arial" font-size="11" font-weight="bold" fill="#38BDF8">Corridor Telemetry</text>
      <text x="40" y="110" font-family="Arial" font-size="9.5" fill="#E2E8F0">Total Length: 340.8 km</text>
      <text x="40" y="126" font-family="Arial" font-size="9.5" fill="#E2E8F0">Packages: 8 | Villages: 156</text>
      <text x="40" y="140" font-family="Arial" font-size="9.5" font-weight="bold" fill="#34D399">Acquisition Status: 94.2%</text>
    </svg>""",

    # UI Mockup 2: GatiShakti AI Predictive Delay & TreeSHAP Dashboard (Dark Modern UI)
    'ui_predictive_dashboard.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
      <rect width="600" height="360" rx="12" fill="#0B132B"/>
      <!-- Top App Bar -->
      <rect width="600" height="42" fill="#1C2541"/>
      <circle cx="22" cy="21" r="6" fill="#EF4444"/>
      <circle cx="38" cy="21" r="6" fill="#F59E0B"/>
      <circle cx="54" cy="21" r="6" fill="#10B981"/>
      <text x="75" y="26" font-family="Arial" font-size="12" font-weight="bold" fill="#FFFFFF">GatiShakti AI Analytics — Delay Prediction & TreeSHAP XAI</text>
      
      <!-- KPI Metric Cards (Row 1) -->
      <rect x="20" y="55" width="170" height="65" rx="6" fill="#1C2541" stroke="#3A506B" stroke-width="1"/>
      <text x="32" y="76" font-family="Arial" font-size="10" fill="#94A3B8">Predicted Delay</text>
      <text x="32" y="104" font-family="Arial" font-size="22" font-weight="bold" fill="#F87171">+74 Days</text>
      
      <rect x="205" y="55" width="180" height="65" rx="6" fill="#1C2541" stroke="#3A506B" stroke-width="1"/>
      <text x="217" y="76" font-family="Arial" font-size="10" fill="#94A3B8">Sec 3D Countdown</text>
      <text x="217" y="104" font-family="Arial" font-size="22" font-weight="bold" fill="#FBBF24">Day 285 / 365</text>
      
      <rect x="400" y="55" width="180" height="65" rx="6" fill="#1C2541" stroke="#3A506B" stroke-width="1"/>
      <text x="412" y="76" font-family="Arial" font-size="10" fill="#94A3B8">Escrow Capital Locked</text>
      <text x="412" y="104" font-family="Arial" font-size="20" font-weight="bold" fill="#34D399">&#8377;148.5 Cr</text>
      
      <!-- TreeSHAP Feature Attribution Chart (Bottom Left) -->
      <rect x="20" y="130" width="320" height="210" rx="8" fill="#1C2541" stroke="#3A506B" stroke-width="1"/>
      <text x="32" y="152" font-family="Arial" font-size="11" font-weight="bold" fill="#6EE7B7">TreeSHAP Bottleneck Attribution (Days)</text>
      
      <!-- Bars -->
      <text x="32" y="178" font-family="Arial" font-size="9" fill="#E2E8F0">Sec 3H Court Escrow Stays</text>
      <rect x="180" y="167" width="130" height="14" rx="3" fill="#EF4444"/>
      <text x="260" y="178" font-family="Arial" font-size="9" font-weight="bold" fill="#FFFFFF">+42 Days</text>
      
      <text x="32" y="206" font-family="Arial" font-size="9" fill="#E2E8F0">Gram Sabha Quorum Delay</text>
      <rect x="180" y="195" width="75" height="14" rx="3" fill="#F97316"/>
      <text x="215" y="206" font-family="Arial" font-size="9" font-weight="bold" fill="#FFFFFF">+18 Days</text>
      
      <text x="32" y="234" font-family="Arial" font-size="9" fill="#E2E8F0">Forest Clearance (Stage 2)</text>
      <rect x="180" y="223" width="55" height="14" rx="3" fill="#FBBF24"/>
      <text x="195" y="234" font-family="Arial" font-size="9" font-weight="bold" fill="#FFFFFF">+12 Days</text>
      
      <text x="32" y="262" font-family="Arial" font-size="9" fill="#E2E8F0">Kadastral Map Discrepancy</text>
      <rect x="180" y="251" width="35" height="14" rx="3" fill="#38BDF8"/>
      <text x="188" y="262" font-family="Arial" font-size="9" font-weight="bold" fill="#FFFFFF">+6 Days</text>
      
      <!-- Prescriptive Legal SOP Order Panel (Bottom Right) -->
      <rect x="355" y="130" width="225" height="210" rx="8" fill="#1C2541" stroke="#3A506B" stroke-width="1"/>
      <text x="368" y="152" font-family="Arial" font-size="11" font-weight="bold" fill="#FBBF24">Prescriptive Legal DFA SOP</text>
      <rect x="368" y="166" width="200" height="120" rx="4" fill="#0B132B"/>
      <text x="376" y="184" font-family="Arial" font-size="8.5" font-weight="bold" fill="#93C5FD">DRAFT STATUTORY NOTICE (§ 3D)</text>
      <text x="376" y="200" font-family="Arial" font-size="7.5" fill="#E2E8F0">To: CALA / District Magistrate</text>
      <text x="376" y="214" font-family="Arial" font-size="7.5" fill="#CBD5E1">Action: Immediate Sec 3D gazette</text>
      <text x="376" y="228" font-family="Arial" font-size="7.5" fill="#CBD5E1">issuance for Pkg 3 before Day 310.</text>
      <text x="376" y="246" font-family="Arial" font-size="7.5" font-weight="bold" fill="#34D399">HITL: Aadhaar DSC Verified</text>
      <rect x="368" y="296" width="200" height="28" rx="4" fill="#2563EB"/>
      <text x="415" y="314" font-family="Arial" font-size="9.5" font-weight="bold" fill="#FFFFFF">Approve &amp; e-Sign (DSC)</text>
    </svg>"""
}

for name, svg_str in slide6_svgs.items():
    doc = pymupdf.open(stream=svg_str.encode('utf-8'), filetype='svg')
    pix = doc[0].get_pixmap(dpi=300)
    out_file = os.path.join('sih/assets', name)
    pix.save(out_file)
    print(f"Generated Slide 6 asset: {out_file} ({pix.width}x{pix.height})")

print("All Slide 6 assets generated successfully!")
