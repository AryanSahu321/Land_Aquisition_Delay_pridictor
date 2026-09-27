import os
import pymupdf

os.makedirs('sih/assets', exist_ok=True)

slide5_svgs = {
    'economic_impact.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#1E3A8A"/>
      <circle cx="50" cy="50" r="34" fill="#DBEAFE"/>
      <!-- Rupee Currency & Highway Capital -->
      <text x="32" y="60" font-family="Arial" font-size="30" font-weight="bold" fill="#1D4ED8">&#8377;</text>
      <path d="M58 64 L74 36 M64 36 L74 36 L74 46" stroke="#2563EB" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>""",

    'governance_impact.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#065F46"/>
      <circle cx="50" cy="50" r="34" fill="#D1FAE5"/>
      <!-- Sovereign Pillar / Law Building -->
      <polygon points="50,26 26,38 74,38" fill="#047857"/>
      <rect x="30" y="40" width="6" height="24" fill="#047857"/>
      <rect x="42" y="40" width="6" height="24" fill="#047857"/>
      <rect x="52" y="40" width="6" height="24" fill="#047857"/>
      <rect x="64" y="40" width="6" height="24" fill="#047857"/>
      <rect x="24" y="66" width="52" height="6" rx="2" fill="#047857"/>
    </svg>""",

    'social_impact.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#92400E"/>
      <circle cx="50" cy="50" r="34" fill="#FEF3C7"/>
      <!-- Farmer Welfare / Handshake -->
      <circle cx="36" cy="38" r="8" fill="#B45309"/>
      <circle cx="64" cy="38" r="8" fill="#B45309"/>
      <path d="M24 64 C24 52 32 48 40 48 C44 48 48 50 50 53 C52 50 56 48 60 48 C68 48 76 52 76 64 Z" fill="#D97706"/>
      <!-- Golden Coin in Center -->
      <circle cx="50" cy="65" r="9" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
    </svg>""",

    'nhai_pd_icon.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#0284C7"/>
      <!-- Highway Engineering Compass & Road -->
      <polygon points="50,22 34,76 50,64 66,76" fill="#FFFFFF"/>
      <line x1="50" y1="22" x2="50" y2="64" stroke="#0284C7" stroke-width="2.5"/>
    </svg>""",

    'cala_icon.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#EA580C"/>
      <!-- Cadastral Map & Revenue Gavel -->
      <rect x="28" y="26" width="44" height="48" rx="4" fill="#FFEDD5"/>
      <line x1="36" y1="40" x2="64" y2="40" stroke="#EA580C" stroke-width="3" stroke-linecap="round"/>
      <line x1="36" y1="52" x2="64" y2="52" stroke="#EA580C" stroke-width="3" stroke-linecap="round"/>
      <circle cx="60" cy="62" r="8" fill="#C2410C"/>
      <path d="M57 62 L59 64 L64 59" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>""",

    'morth_icon.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#059669"/>
      <!-- Apex National Star / Emblem -->
      <polygon points="50,20 57,36 74,38 62,50 66,68 50,59 34,68 38,50 26,38 43,36" fill="#FFFFFF"/>
      <circle cx="50" cy="46" r="6" fill="#047857"/>
    </svg>""",

    'table_check.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <circle cx="20" cy="20" r="18" fill="#10B981"/>
      <path d="M12 20 L17 25 L28 14" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>""",

    'table_cross.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <circle cx="20" cy="20" r="18" fill="#EF4444"/>
      <path d="M14 14 L26 26 M26 14 L14 26" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    </svg>"""
}

for name, svg_str in slide5_svgs.items():
    doc = pymupdf.open(stream=svg_str.encode('utf-8'), filetype='svg')
    pix = doc[0].get_pixmap(dpi=300)
    out_file = os.path.join('sih/assets', name)
    pix.save(out_file)
    print(f"Generated Slide 5 asset: {out_file} ({pix.width}x{pix.height})")

print("All Slide 5 assets generated successfully!")
