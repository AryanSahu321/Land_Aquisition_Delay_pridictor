import os
import pymupdf

os.makedirs('sih/assets', exist_ok=True)

slide4_svgs = {
    'feasibility_badge.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#0284C7"/>
      <!-- Technical Gears & Validation Check -->
      <circle cx="50" cy="50" r="28" fill="#E0F2FE" stroke="#38BDF8" stroke-width="3"/>
      <path d="M38 50 L46 58 L64 40" stroke="#0284C7" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <!-- Orbiting gear teeth marks -->
      <circle cx="50" cy="14" r="4" fill="#BAE6FD"/>
      <circle cx="50" cy="86" r="4" fill="#BAE6FD"/>
      <circle cx="14" cy="50" r="4" fill="#BAE6FD"/>
      <circle cx="86" cy="50" r="4" fill="#BAE6FD"/>
    </svg>""",

    'viability_badge.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#059669"/>
      <!-- Rupee Growth & Economic Viability -->
      <circle cx="50" cy="50" r="30" fill="#D1FAE5" stroke="#34D399" stroke-width="3"/>
      <!-- Indian Rupee Symbol -->
      <text x="34" y="58" font-family="Arial" font-size="28" font-weight="bold" fill="#047857">&#8377;</text>
      <!-- Ascending Growth Arrow -->
      <path d="M56 64 L72 36 M62 36 L72 36 L72 46" stroke="#047857" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>""",

    'challenge_badge.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#D97706"/>
      <!-- Risk Warning Shield -->
      <polygon points="50,22 78,74 22,74" fill="#FEF3C7" stroke="#F59E0B" stroke-width="3.5" stroke-linejoin="round"/>
      <line x1="50" y1="38" x2="50" y2="56" stroke="#B45309" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="50" cy="65" r="3" fill="#B45309"/>
    </svg>""",

    'governance_badge.png': """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="46" fill="#4F46E5"/>
      <!-- Scales of Justice / Statutory Law Balance -->
      <line x1="50" y1="26" x2="50" y2="74" stroke="#E0E7FF" stroke-width="4" stroke-linecap="round"/>
      <line x1="30" y1="36" x2="70" y2="36" stroke="#E0E7FF" stroke-width="4" stroke-linecap="round"/>
      <!-- Left Pan -->
      <path d="M22 52 L38 52 C38 58 22 58 22 52 Z" fill="#C7D2FE"/>
      <line x1="30" y1="36" x2="22" y2="52" stroke="#E0E7FF" stroke-width="2"/>
      <line x1="30" y1="36" x2="38" y2="52" stroke="#E0E7FF" stroke-width="2"/>
      <!-- Right Pan -->
      <path d="M62 52 L78 52 C78 58 62 58 62 52 Z" fill="#C7D2FE"/>
      <line x1="70" y1="36" x2="62" y2="52" stroke="#E0E7FF" stroke-width="2"/>
      <line x1="70" y1="36" x2="78" y2="52" stroke="#E0E7FF" stroke-width="2"/>
      <!-- Base -->
      <line x1="38" y1="74" x2="62" y2="74" stroke="#E0E7FF" stroke-width="4" stroke-linecap="round"/>
    </svg>"""
}

for name, svg_str in slide4_svgs.items():
    doc = pymupdf.open(stream=svg_str.encode('utf-8'), filetype='svg')
    pix = doc[0].get_pixmap(dpi=300)
    out_file = os.path.join('sih/assets', name)
    pix.save(out_file)
    print(f"Generated Slide 4 asset: {out_file} ({pix.width}x{pix.height})")

print("Slide 4 assets generated successfully!")
