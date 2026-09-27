import os
import pymupdf

os.makedirs('sih/assets', exist_ok=True)

# Dictionary of high-fidelity, authentic SVGs for tech logos, step icons, and architectural graphics
svg_assets = {
    # -------------------------------------------------------------
    # 1. REAL TECH STACK LOGOS
    # -------------------------------------------------------------
    'python_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <linearGradient id="py_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#387EB8"/>
          <stop offset="100%" stop-color="#366994"/>
        </linearGradient>
        <linearGradient id="py_yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFE873"/>
          <stop offset="100%" stop-color="#FFD43B"/>
        </linearGradient>
      </defs>
      <!-- Blue Snake -->
      <path d="M59.5 12 C35.4 12 36.8 22.5 36.8 22.5 L36.8 33.4 L60.2 33.4 L60.2 36.7 L26.2 36.7 C15.5 36.7 6.2 43.1 6.2 59.8 C6.2 76.5 15.6 77.2 21.6 77.2 L28.2 77.2 L28.2 67.9 C28.2 57.3 37.3 48.2 48 48.2 L71.5 48.2 C79.2 48.2 85.5 41.8 85.5 34 L85.5 22.5 C85.5 13.8 77.1 12 59.5 12 Z M47.8 20.3 C51.3 20.3 54.1 23.1 54.1 26.6 C54.1 30.1 51.3 32.9 47.8 32.9 C44.3 32.9 41.5 30.1 41.5 26.6 C41.5 23.1 44.3 20.3 47.8 20.3 Z" fill="url(#py_blue)"/>
      <!-- Yellow Snake -->
      <path d="M60.5 108 C84.6 108 83.2 97.5 83.2 97.5 L83.2 86.6 L59.8 86.6 L59.8 83.3 L93.8 83.3 C104.5 83.3 113.8 76.9 113.8 60.2 C113.8 43.5 104.4 42.8 98.4 42.8 L91.8 42.8 L91.8 52.1 C91.8 62.7 82.7 71.8 72 71.8 L48.5 71.8 C40.8 71.8 34.5 78.2 34.5 86 L34.5 97.5 C34.5 106.2 42.9 108 60.5 108 Z M72.2 99.7 C68.7 99.7 65.9 96.9 65.9 93.4 C65.9 89.9 68.7 87.1 72.2 87.1 C75.7 87.1 78.5 89.9 78.5 93.4 C78.5 96.9 75.7 99.7 72.2 99.7 Z" fill="url(#py_yellow)"/>
    </svg>""",

    'fastapi_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="#009688"/>
      <!-- Lightning bolt -->
      <polygon points="65,18 32,64 57,64 53,102 88,54 63,54" fill="#FFFFFF"/>
    </svg>""",

    'react_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="20" fill="#20232A"/>
      <ellipse cx="60" cy="60" rx="46" ry="17" fill="none" stroke="#61DAFB" stroke-width="4.5" transform="rotate(0 60 60)"/>
      <ellipse cx="60" cy="60" rx="46" ry="17" fill="none" stroke="#61DAFB" stroke-width="4.5" transform="rotate(60 60 60)"/>
      <ellipse cx="60" cy="60" rx="46" ry="17" fill="none" stroke="#61DAFB" stroke-width="4.5" transform="rotate(120 60 60)"/>
      <circle cx="60" cy="60" r="8" fill="#61DAFB"/>
    </svg>""",

    'xgboost_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="20" fill="#2B3E50"/>
      <!-- Decision Tree Branches -->
      <circle cx="60" cy="30" r="12" fill="#E65100"/>
      <line x1="60" y1="30" x2="35" y2="65" stroke="#FFA726" stroke-width="4"/>
      <line x1="60" y1="30" x2="85" y2="65" stroke="#FFA726" stroke-width="4"/>
      <circle cx="35" cy="65" r="10" fill="#FB8C00"/>
      <circle cx="85" cy="65" r="10" fill="#FB8C00"/>
      <line x1="35" y1="65" x2="22" y2="95" stroke="#FFCC80" stroke-width="3"/>
      <line x1="35" y1="65" x2="48" y2="95" stroke="#FFCC80" stroke-width="3"/>
      <line x1="85" y1="65" x2="72" y2="95" stroke="#FFCC80" stroke-width="3"/>
      <line x1="85" y1="65" x2="98" y2="95" stroke="#FFCC80" stroke-width="3"/>
      <circle cx="22" cy="95" r="7" fill="#43A047"/>
      <circle cx="48" cy="95" r="7" fill="#E53935"/>
      <circle cx="72" cy="95" r="7" fill="#43A047"/>
      <circle cx="98" cy="95" r="7" fill="#43A047"/>
    </svg>""",

    'lightgbm_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="20" fill="#0D47A1"/>
      <!-- Fast Tree Leaves / Speed Rays -->
      <path d="M60 20 L85 55 L70 55 L95 85 L65 85 L65 102 L55 102 L55 85 L25 85 L50 55 L35 55 Z" fill="#FFD54F"/>
      <polygon points="65,15 45,50 62,50 55,80 85,42 68,42" fill="#FFFFFF" opacity="0.9"/>
    </svg>""",

    'shap_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="20" fill="#1E293B"/>
      <!-- SHAP Waterfall Bars -->
      <rect x="20" y="30" width="40" height="14" rx="4" fill="#EF4444"/>
      <rect x="55" y="48" width="35" height="14" rx="4" fill="#3B82F6"/>
      <rect x="40" y="66" width="48" height="14" rx="4" fill="#EF4444"/>
      <rect x="68" y="84" width="32" height="14" rx="4" fill="#10B981"/>
      <!-- Connector line -->
      <line x1="60" y1="20" x2="60" y2="105" stroke="#94A3B8" stroke-dasharray="3,3" stroke-width="2"/>
    </svg>""",

    'leaflet_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="20" fill="#F8FAFC"/>
      <!-- Green Leaf -->
      <path d="M35 85 C35 85 45 92 65 85 C85 78 95 50 95 25 C70 25 42 35 35 55 C28 75 35 85 35 85 Z" fill="#74AC00"/>
      <path d="M35 85 C48 68 62 52 95 25" stroke="#507800" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>""",

    'postgresql_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="54" fill="#336791"/>
      <!-- Elephant Head Silhouette -->
      <path d="M38 78 C32 78 30 70 30 60 C30 45 42 34 60 34 C76 34 88 44 88 58 C88 72 78 80 66 80 L66 90 L56 90 L56 78 Z" fill="#FFFFFF"/>
      <circle cx="48" cy="48" r="4" fill="#336791"/>
      <path d="M42 66 C48 68 56 68 62 66" stroke="#336791" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M66 58 C72 60 76 68 76 74" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>""",

    'sha256_logo.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" rx="20" fill="#312E81"/>
      <!-- Shield -->
      <path d="M60 20 L92 34 C92 65 78 88 60 98 C42 88 28 65 28 34 Z" fill="#4F46E5" stroke="#818CF8" stroke-width="3"/>
      <!-- Padlock -->
      <rect x="46" y="52" width="28" height="24" rx="4" fill="#FBBF24"/>
      <path d="M52 52 L52 42 C52 37 55 34 60 34 C65 34 68 37 68 42 L68 52" fill="none" stroke="#FBBF24" stroke-width="4"/>
      <circle cx="60" cy="64" r="3" fill="#1E1B4B"/>
    </svg>""",

    # -------------------------------------------------------------
    # 2. IMPLEMENTATION PROCESS STEP ICONS (6 STEPS)
    # -------------------------------------------------------------
    'step1_ingest.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#00695C"/>
      <!-- Document & Ingestion Arrow -->
      <rect x="32" y="24" width="36" height="46" rx="4" fill="#E0F2F1"/>
      <line x1="40" y1="36" x2="60" y2="36" stroke="#004D40" stroke-width="3" stroke-linecap="round"/>
      <line x1="40" y1="46" x2="60" y2="46" stroke="#004D40" stroke-width="3" stroke-linecap="round"/>
      <line x1="40" y1="56" x2="52" y2="56" stroke="#004D40" stroke-width="3" stroke-linecap="round"/>
      <circle cx="68" cy="68" r="16" fill="#26A69A"/>
      <path d="M68 60 L68 76 M62 70 L68 76 L74 70" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>""",

    'step2_centraldb.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#263238"/>
      <!-- 3-Tier Database Cylinder -->
      <ellipse cx="50" cy="32" rx="25" ry="9" fill="#90A4AE"/>
      <path d="M25 32 L25 50 C25 55 36 59 50 59 C64 59 75 55 75 50 L75 32 Z" fill="#78909C"/>
      <ellipse cx="50" cy="50" rx="25" ry="9" fill="#90A4AE"/>
      <path d="M25 50 L25 68 C25 73 36 77 50 77 C64 77 75 73 75 68 L75 50 Z" fill="#607D8B"/>
      <ellipse cx="50" cy="68" rx="25" ry="9" fill="#90A4AE"/>
      <!-- Fast lightning indicator -->
      <polygon points="56,40 44,56 50,56 46,68 58,52 52,52" fill="#FFD54F"/>
    </svg>""",

    'step3_ml.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#E65100"/>
      <!-- Neural AI Nodes -->
      <circle cx="30" cy="35" r="7" fill="#FFE0B2"/>
      <circle cx="30" cy="65" r="7" fill="#FFE0B2"/>
      <circle cx="52" cy="28" r="7" fill="#FFF3E0"/>
      <circle cx="52" cy="50" r="8" fill="#FFFFFF"/>
      <circle cx="52" cy="72" r="7" fill="#FFF3E0"/>
      <circle cx="74" cy="40" r="7" fill="#FFE0B2"/>
      <circle cx="74" cy="62" r="7" fill="#FFE0B2"/>
      <line x1="30" y1="35" x2="52" y2="28" stroke="#FFE0B2" stroke-width="2.5"/>
      <line x1="30" y1="35" x2="52" y2="50" stroke="#FFE0B2" stroke-width="2.5"/>
      <line x1="30" y1="65" x2="52" y2="50" stroke="#FFE0B2" stroke-width="2.5"/>
      <line x1="30" y1="65" x2="52" y2="72" stroke="#FFE0B2" stroke-width="2.5"/>
      <line x1="52" y1="28" x2="74" y2="40" stroke="#FFE0B2" stroke-width="2.5"/>
      <line x1="52" y1="50" x2="74" y2="40" stroke="#FFE0B2" stroke-width="2.5"/>
      <line x1="52" y1="50" x2="74" y2="62" stroke="#FFE0B2" stroke-width="2.5"/>
      <line x1="52" y1="72" x2="74" y2="62" stroke="#FFE0B2" stroke-width="2.5"/>
    </svg>""",

    'step4_shap.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#33691E"/>
      <!-- Magnifying Glass with Chart Inside -->
      <circle cx="44" cy="44" r="22" fill="#DCEDC8" stroke="#FFFFFF" stroke-width="4"/>
      <line x1="60" y1="60" x2="78" y2="78" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
      <!-- Mini Waterfall bars inside lens -->
      <rect x="32" y="36" width="12" height="6" fill="#D32F2F"/>
      <rect x="42" y="44" width="16" height="6" fill="#1976D2"/>
      <rect x="36" y="52" width="14" height="6" fill="#388E3C"/>
    </svg>""",

    'step5_dfa.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#BF360C"/>
      <!-- Legal Gazette Draft Scroll -->
      <rect x="28" y="22" width="44" height="56" rx="4" fill="#FFCCBC"/>
      <line x1="36" y1="34" x2="64" y2="34" stroke="#D84315" stroke-width="3" stroke-linecap="round"/>
      <line x1="36" y1="44" x2="64" y2="44" stroke="#D84315" stroke-width="3" stroke-linecap="round"/>
      <line x1="36" y1="54" x2="56" y2="54" stroke="#D84315" stroke-width="3" stroke-linecap="round"/>
      <!-- Red Seal Stamp -->
      <circle cx="62" cy="64" r="10" fill="#D50000"/>
      <polygon points="62,58 64,62 68,62 65,65 66,69 62,67 58,69 59,65 56,62 60,62" fill="#FFFFFF"/>
    </svg>""",

    'step6_esign.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#880E4F"/>
      <!-- Digital Signature Certificate & Aadhaar DSC -->
      <circle cx="50" cy="46" r="18" fill="#F8BBD0"/>
      <path d="M42 46 L47 51 L58 40" stroke="#880E4F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <!-- Lock base -->
      <rect x="36" y="62" width="28" height="18" rx="4" fill="#F48FB1"/>
      <path d="M42 62 L42 56 C42 51 45 48 50 48 C55 48 58 51 58 56 L58 62" fill="none" stroke="#F48FB1" stroke-width="3.5"/>
      <circle cx="50" cy="71" r="2.5" fill="#880E4F"/>
    </svg>""",

    # -------------------------------------------------------------
    # 3. ARCHITECTURE VISUAL ASSETS (ZONES 1, 2, 4)
    # -------------------------------------------------------------
    'officer_avatar.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#1E3A8A"/>
      <!-- Nodal Officer Cap & Face -->
      <circle cx="50" cy="40" r="16" fill="#FDE68A"/>
      <path d="M26 80 C26 64 36 56 50 56 C64 56 74 64 74 80 Z" fill="#3B82F6"/>
      <!-- Tie & Collar -->
      <polygon points="50,56 44,68 50,78 56,68" fill="#EF4444"/>
      <!-- Government Officer Badge -->
      <polygon points="34,68 36,74 42,74 38,77 40,83 34,79 28,83 30,77 26,74 32,74" fill="#F59E0B"/>
    </svg>""",

    'cloud_portals.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80">
      <path d="M35 65 L90 65 C102 65 112 55 112 43 C112 32 103 23 92 23 C90 12 80 4 68 4 C57 4 48 10 44 20 C41 18 37 17 33 17 C20 17 10 27 10 40 C10 54 21 65 35 65 Z" fill="#60A5FA"/>
      <circle cx="48" cy="42" r="5" fill="#FFFFFF"/>
      <circle cx="68" cy="36" r="6" fill="#FFFFFF"/>
      <circle cx="86" cy="44" r="5" fill="#FFFFFF"/>
      <line x1="48" y1="42" x2="68" y2="36" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="68" y1="36" x2="86" y2="44" stroke="#FFFFFF" stroke-width="2"/>
    </svg>""",

    'ai_brain.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <!-- AI Brain with Neural Tracks -->
      <circle cx="50" cy="50" r="46" fill="#00838F"/>
      <!-- Left Brain Hemisphere -->
      <path d="M47 25 C35 25 24 35 24 50 C24 64 34 74 47 75 Z" fill="#4DD0E1"/>
      <!-- Right Brain Hemisphere -->
      <path d="M53 25 C65 25 76 35 76 50 C76 64 66 74 53 75 Z" fill="#80DEEA"/>
      <line x1="50" y1="22" x2="50" y2="78" stroke="#006064" stroke-width="3"/>
      <!-- Circuit Nodes -->
      <circle cx="34" cy="40" r="4" fill="#004D40"/>
      <circle cx="34" cy="60" r="4" fill="#004D40"/>
      <circle cx="66" cy="40" r="4" fill="#004D40"/>
      <circle cx="66" cy="60" r="4" fill="#004D40"/>
      <line x1="34" y1="40" x2="50" y2="45" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="34" y1="60" x2="50" y2="55" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="66" y1="40" x2="50" y2="45" stroke="#FFFFFF" stroke-width="2"/>
      <line x1="66" y1="60" x2="50" y2="55" stroke="#FFFFFF" stroke-width="2"/>
    </svg>""",

    'gis_map_route.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="240" height="100">
      <rect width="240" height="100" rx="8" fill="#1E293B"/>
      <!-- Cadastral Grid lines -->
      <line x1="0" y1="25" x2="240" y2="25" stroke="#334155" stroke-width="1"/>
      <line x1="0" y1="50" x2="240" y2="50" stroke="#334155" stroke-width="1"/>
      <line x1="0" y1="75" x2="240" y2="75" stroke="#334155" stroke-width="1"/>
      <line x1="60" y1="0" x2="60" y2="100" stroke="#334155" stroke-width="1"/>
      <line x1="120" y1="0" x2="120" y2="100" stroke="#334155" stroke-width="1"/>
      <line x1="180" y1="0" x2="180" y2="100" stroke="#334155" stroke-width="1"/>
      <!-- Purvanchal 340.8 km Express Corridor Route (Thick Glowing Line) -->
      <path d="M15 75 Q60 30 110 55 T225 25" stroke="#10B981" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M15 75 Q60 30 110 55 T225 25" stroke="#34D399" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Milestone Pins (Packages) -->
      <circle cx="15" cy="75" r="5" fill="#EF4444" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="80" cy="40" r="5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="140" cy="62" r="5" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="225" cy="25" r="5" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
      <text x="12" y="94" font-family="Arial" font-size="9" font-weight="bold" fill="#F1F5F9">Pkg 1 (Ch 0)</text>
      <text x="180" y="42" font-family="Arial" font-size="9" font-weight="bold" fill="#34D399">Pkg 8 (Ch 340.8)</text>
    </svg>"""
}

for name, svg_str in svg_assets.items():
    doc = pymupdf.open(stream=svg_str.encode('utf-8'), filetype='svg')
    pix = doc[0].get_pixmap(dpi=300)
    out_file = os.path.join('sih/assets', name)
    pix.save(out_file)
    print(f"Generated {out_file} ({pix.width}x{pix.height})")

print("All asset icons successfully generated!")
