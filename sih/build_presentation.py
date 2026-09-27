import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_sih_presentation(template_path, output_path):
    print(f"Loading base template from: {template_path}")
    prs = pptx.Presentation(template_path)
    
    # Common Palette
    COLOR_SIH_GREEN = RGBColor(0, 176, 80)     # #00B050
    COLOR_NAVY = RGBColor(26, 54, 93)           # #1A365D
    COLOR_DARK = RGBColor(30, 41, 59)           # #1E293B
    COLOR_SLATE = RGBColor(71, 85, 105)         # #475569
    COLOR_BLUE = RGBColor(37, 99, 235)          # #2563EB
    COLOR_AMBER = RGBColor(217, 119, 6)         # #D97706
    COLOR_RED = RGBColor(220, 38, 38)           # #DC2626
    COLOR_EMERALD = RGBColor(5, 150, 105)       # #059669
    COLOR_BG_LIGHT = RGBColor(248, 250, 252)    # #F8FAFC
    COLOR_BG_CARD = RGBColor(241, 245, 249)     # #F1F5F9
    COLOR_BORDER = RGBColor(203, 213, 225)      # #CBD5E1

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    print("Formatting Slide 1: Title Page...")
    slide1 = prs.slides[0]
    for shape in slide1.shapes:
        if shape.has_text_frame and "Problem Statement ID" in shape.text_frame.text:
            tf = shape.text_frame
            tf.clear()
            
            items = [
                ("Problem Statement ID : ", "26017"),
                ("Problem Statement Title: ", "Predictive Analytics System for Early Detection of Land Acquisition Delays"),
                ("Theme: ", "Smart Automation"),
                ("PS Category: ", "Software"),
                ("Team ID: ", "128333"),
                ("Team Name: ", "FusionX")
            ]
            
            for idx, (label, val) in enumerate(items):
                p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
                p.space_after = Pt(12)
                p.level = 0
                
                # Bullet
                r0 = p.add_run()
                r0.text = "•  "
                r0.font.name = "Arial"
                r0.font.size = Pt(15)
                r0.font.bold = True
                r0.font.color.rgb = RGBColor(0, 0, 0)
                
                # Label
                r1 = p.add_run()
                r1.text = label
                r1.font.name = "Arial"
                r1.font.size = Pt(15)
                r1.font.bold = True
                r1.font.color.rgb = RGBColor(0, 0, 0)
                
                # Value
                r2 = p.add_run()
                r2.text = val
                r2.font.name = "Arial"
                r2.font.size = Pt(15)
                r2.font.bold = False
                r2.font.color.rgb = COLOR_SIH_GREEN

    # =========================================================================
    # SLIDE 2: IDEA & PROPOSED SOLUTION
    # =========================================================================
    print("Formatting Slide 2: Idea & Proposed Solution...")
    slide2 = prs.slides[1]
    
    # 1. Update Title
    if slide2.shapes.title:
        slide2.shapes.title.text = "GATISHAKTI AI: PREDICTIVE LAND ACQUISITION DELAY SYSTEM"
        p = slide2.shapes.title.text_frame.paragraphs[0]
        p.font.name = "Times New Roman"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.alignment = PP_ALIGN.LEFT

    # Helper function to populate text box with bullets
    def populate_box(shape, bullet_items):
        tf = shape.text_frame
        tf.word_wrap = True
        tf.clear()
        for idx, (headline, body) in enumerate(bullet_items):
            p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
            p.space_after = Pt(4)
            p.level = 0
            
            r_head = p.add_run()
            r_head.text = f"• {headline}: "
            r_head.font.name = "Arial"
            r_head.font.size = Pt(10)
            r_head.font.bold = True
            r_head.font.color.rgb = COLOR_DARK
            
            r_body = p.add_run()
            r_body.text = body
            r_body.font.name = "Arial"
            r_body.font.size = Pt(9.5)
            r_body.font.bold = False
            r_body.font.color.rgb = COLOR_SLATE

    # Identify boxes on Slide 2
    for shape in slide2.shapes:
        if shape.name == "Rectangle: Rounded Corners 2":  # Under EXISTING PROBLEM
            shape.height = int(1.3 * 914400)
            populate_box(shape, [
                ("₹4,000+ Cr Escrow Lockup", "Sub-judice litigation under Section 3H stalls corridors for 1,200+ days, accruing 9–15% statutory penal interest under Sec 34 of RFCTLARR Act 2013."),
                ("Section 3D Statutory Lapse", "Section 3A notifications automatically lapse at Day 365 if Sec 3D declaration is not gazetted, resetting multi-year acquisition cycles."),
                ("Disconnected Data Silos", "Gazette notices, e-Courts stay orders, cadastral Khasra maps, and EPC contractor chainages operate in completely isolated silos."),
                ("Late Bottleneck Detection", "Nodal officers manually review physical paper files, discovering judicial stay injunctions only after EPC contractors file idling claims.")
            ])
            
        elif shape.name == "Rectangle: Rounded Corners 11":  # Under PROPOSED SOLUTION
            shape.top = int(2.95 * 914400)
            shape.height = int(1.3 * 914400)
            populate_box(shape, [
                ("Decoupled Central DB (<15ms)", "Direct ingestion of 47 statutory parameters across civil, revenue, and environmental domains—eliminating slow PDF OCR latency."),
                ("Dual-Track Reality Engine", "Distinguishes active physical civil progress (public traffic moving) from statutory court liquidation under NH Act Section 3D(2)."),
                ("TreeSHAP Explainable XAI", "Real-time factor attribution quantifying exact marginal day-impacts (+days delay / -days mitigator) for every corridor risk driver."),
                ("Prescriptive SOP Orders (Point 9)", "Automates pre-drafted Draft for Approval (DFA) legal notices under NH Act § 3D, § 3G (Awards), and § 3H (Escrow).")
            ])
            
        elif shape.name == "Rectangle: Rounded Corners 13":  # Under UVP
            shape.top = int(4.8 * 914400)
            shape.height = int(1.3 * 914400)
            populate_box(shape, [
                ("Constitutional HITL Architecture", "Adheres to Articles 77 & 166; integrates Aadhaar / Class-3 DSC e-Signing so empowered nodal officers retain full legal authority."),
                ("Multi-Tier 340.8 km RoW GIS", "Full interactive Purvanchal corridor: Macro Alignment → 8 Construction Packages → 18 Cadastral Parcel Strips with live choropleth."),
                ("Tamper-Proof Audit Trail (Point 12)", "Cryptographic SHA-256 block hashing permanently seals every administrative decision, ensuring CVC & CAG compliance.")
            ])

        elif shape.name == "Rectangle 22":  # Architecture Panel on Right
            # Clear text in container and populate with visual flow diagram
            shape.text_frame.clear()
            shape.fill.solid()
            shape.fill.fore_color.rgb = COLOR_BG_LIGHT
            shape.line.color.rgb = COLOR_BORDER
            
    # Add structured Architecture diagram boxes inside Rectangle 22 area
    arch_left = int(7.5 * 914400)
    arch_width = int(4.1 * 914400)
    
    stages = [
        ("1. Multi-Modal Data Ingestion", "Gazette PDFs • e-Courts WSDL • State Revenue (Jamabandi) • Drone DGPS", COLOR_BLUE),
        ("2. Decoupled Central Database", "47 Standardized Statutory Features • Missing Imputation • <15ms Query", COLOR_NAVY),
        ("3. Ensemble Predictive ML Core", "XGBoost 2.1 + LightGBM Regressors • Kaplan-Meier Survival Curves", COLOR_EMERALD),
        ("4. Explainable AI & Prescriptions", "TreeSHAP Attribution Waterfall • Prescriptive Statutory SOP Orders", COLOR_AMBER),
        ("5. 4-Tier Role RBAC & e-Sign", "Lekhpal → CALA → NHAI PD → Ministry • Aadhaar DSC • SHA-256 Ledger", COLOR_RED)
    ]
    
    for s_idx, (st_title, st_desc, st_color) in enumerate(stages):
        box_top = int((1.45 + s_idx * 0.94) * 914400)
        box_h = int(0.72 * 914400)
        
        box = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, arch_left + int(0.1*914400), box_top, arch_width - int(0.2*914400), box_h)
        box.fill.solid()
        box.fill.fore_color.rgb = RGBColor(255, 255, 255)
        box.line.color.rgb = st_color
        box.line.width = Pt(1.5)
        
        tf = box.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.space_after = Pt(1)
        r0 = p0.add_run()
        r0.text = st_title
        r0.font.name = "Arial"
        r0.font.size = Pt(10)
        r0.font.bold = True
        r0.font.color.rgb = st_color
        
        p1 = tf.add_paragraph()
        r1 = p1.add_run()
        r1.text = st_desc
        r1.font.name = "Arial"
        r1.font.size = Pt(8)
        r1.font.color.rgb = COLOR_DARK
        
        # Add connecting down arrow between boxes
        if s_idx < len(stages) - 1:
            arrow_top = box_top + box_h + int(0.01 * 914400)
            arrow = slide2.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, arch_left + int(1.95*914400), arrow_top, int(0.2*914400), int(0.18*914400))
            arrow.fill.solid()
            arrow.fill.fore_color.rgb = COLOR_SLATE
            arrow.line.fill.background()

    # =========================================================================
    # SLIDE 3: TECHNICAL APPROACH
    # =========================================================================
    print("Formatting Slide 3: Technical Approach...")
    slide3 = prs.slides[2]
    if slide3.shapes.title:
        slide3.shapes.title.text = "TECHNICAL APPROACH: DECOUPLED ML & STATUTORY XAI STACK"
        p = slide3.shapes.title.text_frame.paragraphs[0]
        p.font.name = "Times New Roman"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.alignment = PP_ALIGN.LEFT

    # Remove prompt TextBox 8
    for s in list(slide3.shapes):
        if s.name == "TextBox 8":
            sp_elem = s._element
            sp_elem.getparent().remove(sp_elem)

    # 1. Left Column: Core Technologies Used (Grid of 5 Badges)
    tech_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.2), Inches(5.6), Inches(5.2))
    tech_box.fill.solid()
    tech_box.fill.fore_color.rgb = COLOR_BG_LIGHT
    tech_box.line.color.rgb = COLOR_BORDER
    tf = tech_box.text_frame
    tf.word_wrap = True
    tf.clear()

    p_head = tf.paragraphs[0]
    p_head.space_after = Pt(8)
    r = p_head.add_run()
    r.text = "1. Core Technology Stack & Libraries"
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = COLOR_NAVY

    techs = [
        ("Machine Learning & XAI Core", "XGBoost 2.1 & LightGBM Ensemble (Gradient Boosted Trees), TreeSHAP (Marginal Attribution), Scikit-Learn (Pipelines, RobustScaler, Imputer), Lifelines (Kaplan-Meier Survival Analysis)."),
        ("Geospatial & Mapping (Point 7)", "Leaflet.js, React-Leaflet, GeoJSON standard, WGS84 EPSG:4326 Datum, CartoDB Voyager tiles, Turf.js for spatial intersection calculations."),
        ("High-Performance Backend (Point 11)", "Python 3.13, FastAPI (Asynchronous ASGI server), Pydantic v2 (Strict Schema Validation), SQLite / PostgreSQL-Ready Central DB, RESTful Integration Gateway."),
        ("Frontend & Interactive Analytics", "React 19, Vite 6, Tailwind CSS v3, Apache ECharts (Dynamic comparative dual-track & survival charts), Lucide React Vector Icons."),
        ("Statutory Audit & e-Sign (Point 12)", "SHA-256 Cryptographic Hash Engine, NIC Jan-Parichay / Aadhaar e-Authentication Bridge, Class-3 Digital Signature Certificate (DSC) Stamping.")
    ]

    for title, desc in techs:
        p = tf.add_paragraph()
        p.space_after = Pt(6)
        r0 = p.add_run()
        r0.text = f"• {title}: "
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_BLUE
        
        r1 = p.add_run()
        r1.text = desc
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_DARK

    # 2. Right Column: End-to-End Implementation Methodology (5-Step Process)
    method_box = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.4), Inches(1.2), Inches(6.0), Inches(5.2))
    method_box.fill.solid()
    method_box.fill.fore_color.rgb = COLOR_BG_LIGHT
    method_box.line.color.rgb = COLOR_BORDER
    tf2 = method_box.text_frame
    tf2.word_wrap = True
    tf2.clear()

    p_head2 = tf2.paragraphs[0]
    p_head2.space_after = Pt(8)
    r2 = p_head2.add_run()
    r2.text = "2. End-to-End Implementation Workflow"
    r2.font.name = "Arial"
    r2.font.size = Pt(13)
    r2.font.bold = True
    r2.font.color.rgb = COLOR_NAVY

    workflow_steps = [
        ("Step 1: Multi-Modal Ingestion & Normalization", "Central DB pre-extracts 47 statutory attributes across land, legal, and engineering categories. Maps regional variations (Khasra, Jamabandi, 7/12) into standard NH Act stages."),
        ("Step 2: Dual Ensemble Model Inference (<100ms)", "LightGBM + XGBoost regressors predict residual delay days (R²=0.89, RMSE=14.2d); classification head stratifies corridor risk into Critical (>90d), Moderate (30-90d), and Low (<30d)."),
        ("Step 3: TreeSHAP Marginal Factor Attribution", "Computes exact additive day impacts for each feature (court stays, compensation lag, missing deeds, environmental clearances) relative to base expected horizon (70.0d)."),
        ("Step 4: Geospatial Alignment & Package Stratification", "Aligns 340.8 km Purvanchal corridor into 8 construction packages and 18 RoW cadastral strips, rendering interactive choropleth maps and ECharts package delay breakdowns."),
        ("Step 5: Prescriptive SOP Orders & e-Sign Execution", "Translates model attributions into pre-drafted Drafts for Approval (DFA) under NH Act § 3D, § 3G, § 3H; enables 1-click Aadhaar DSC e-signing and SHA-256 audit ledger commitment.")
    ]

    for title, desc in workflow_steps:
        p = tf2.add_paragraph()
        p.space_after = Pt(6)
        r0 = p.add_run()
        r0.text = f"{title}\n"
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_EMERALD
        
        r1 = p.add_run()
        r1.text = f"   {desc}"
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_DARK

    # =========================================================================
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # =========================================================================
    print("Formatting Slide 4: Feasibility & Viability...")
    slide4 = prs.slides[3]
    if slide4.shapes.title:
        slide4.shapes.title.text = "FEASIBILITY AND VIABILITY: REGULATORY COMPLIANCE & RIGOR"
        p = slide4.shapes.title.text_frame.paragraphs[0]
        p.font.name = "Times New Roman"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.alignment = PP_ALIGN.LEFT

    # Remove prompt TextBox 8
    for s in list(slide4.shapes):
        if s.name == "TextBox 8":
            sp_elem = s._element
            sp_elem.getparent().remove(sp_elem)

    cols = [
        ("1. Feasibility Analysis", COLOR_BLUE, [
            ("Technical Feasibility", "Decoupled Central DB eliminates slow OCR parsing; queries execute in <15ms. Low-overhead CPU-optimized models run without requiring expensive GPU clusters."),
            ("Operational Feasibility", "Plug-and-play REST API Gateway (Point 11) integrates seamlessly into existing NIC systems (Bhoomi Rashi, PM GatiShakti NMP, PRAGATI portal)."),
            ("Financial Feasibility", "Built on 100% open-source software with zero proprietary recurring per-seat licensing fees, making national deployment highly cost-effective.")
        ]),
        ("2. Challenges & Statutory Risks", COLOR_AMBER, [
            ("State Revenue Nomenclature", "Diverse land record formats across Indian states (Khasra/Khatauni in UP, Jamabandi in Punjab, 7/12 in Maharashtra) create integration friction."),
            ("Sub-Judice Legal Stays", "Judicial stays under Section 3H escrow often remain stalled indefinitely in district courts without transparent tracking."),
            ("Bureaucratic Adoption Resistance", "Field revenue officers (CALA, Tehsildars) are cautious of black-box AI algorithms that fail to cite statutory legal provisions.")
        ]),
        ("3. Robust Mitigation Strategies", COLOR_EMERALD, [
            ("Universal Ontological Harmonizer", "Built-in semantic dictionary maps all state-specific revenue nomenclature into standard NH Act statutory milestone stages."),
            ("Section 3D(2) Vesting Separation", "Decouples physical civil works from court escrow disputes; carriageway works continue while compensation is adjudicated in court."),
            ("Explainable AI with Nodal Agency", "TreeSHAP explains exact reasons for delay, empowering the officer with full statutory authority via official digital signature (e-Sign).")
        ])
    ]

    col_w = Inches(3.7)
    gap = Inches(0.2)
    left_start = Inches(0.5)

    for c_idx, (col_title, col_color, col_points) in enumerate(cols):
        c_left = left_start + c_idx * (col_w + gap)
        box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(1.2), col_w, Inches(5.2))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_BG_LIGHT
        box.line.color.rgb = col_color
        box.line.width = Pt(1.5)
        
        tf = box.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.space_after = Pt(10)
        r0 = p0.add_run()
        r0.text = col_title
        r0.font.name = "Arial"
        r0.font.size = Pt(12)
        r0.font.bold = True
        r0.font.color.rgb = col_color
        
        for p_title, p_desc in col_points:
            p = tf.add_paragraph()
            p.space_after = Pt(8)
            
            r_pt = p.add_run()
            r_pt.text = f"• {p_title}:\n"
            r_pt.font.name = "Arial"
            r_pt.font.size = Pt(9.5)
            r_pt.font.bold = True
            r_pt.font.color.rgb = COLOR_DARK
            
            r_body = p.add_run()
            r_body.text = f"  {p_desc}"
            r_body.font.name = "Arial"
            r_body.font.size = Pt(8.5)
            r_body.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 5: IMPACT AND BENEFITS
    # =========================================================================
    print("Formatting Slide 5: Impact & Benefits...")
    slide5 = prs.slides[4]
    if slide5.shapes.title:
        slide5.shapes.title.text = "IMPACT AND BENEFITS: ACCELERATING NATIONAL INFRASTRUCTURE"
        p = slide5.shapes.title.text_frame.paragraphs[0]
        p.font.name = "Times New Roman"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.alignment = PP_ALIGN.LEFT

    # Remove prompt TextBox 8
    for s in list(slide5.shapes):
        if s.name == "TextBox 8":
            sp_elem = s._element
            sp_elem.getparent().remove(sp_elem)

    # 1. Left Box: Multi-Stakeholder Impact Matrix
    sh_box = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.2), Inches(5.6), Inches(5.2))
    sh_box.fill.solid()
    sh_box.fill.fore_color.rgb = COLOR_BG_LIGHT
    sh_box.line.color.rgb = COLOR_BORDER
    tf = sh_box.text_frame
    tf.word_wrap = True
    tf.clear()

    p_head = tf.paragraphs[0]
    p_head.space_after = Pt(8)
    r = p_head.add_run()
    r.text = "1. Impact Across Key Target Stakeholders"
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = COLOR_NAVY

    stakeholders = [
        ("NHAI Project Directors (PDs)", "Eliminates contractor idling compensation claims (saving ₹4.5 Lakh/day per package) by re-sequencing earthwork machinery to 100% encumbrance-free stretches."),
        ("Competent Authority for Land Acquisition (CALA)", "Autonomous 310-day statutory countdown watchdog prevents Section 3A notifications from lapsing under Section 3D(1); generates instant Section 3G awards."),
        ("Ministry of Road Transport (MoRTH) & NPG", "Gives executive leadership real-time visibility across national highway corridors for unified Cabinet notes, inter-ministerial forest clearances, and utility shifting funds."),
        ("Project Affected Families (Farmers & Landowners)", "Accelerates fair compensation payouts by 40% through direct PFMS bank transfer linkages; automates amicable village mutation dispute resolution camps.")
    ]

    for title, desc in stakeholders:
        p = tf.add_paragraph()
        p.space_after = Pt(7)
        r0 = p.add_run()
        r0.text = f"• {title}:\n"
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_BLUE
        
        r1 = p.add_run()
        r1.text = f"  {desc}"
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_DARK

    # 2. Right Box: Quantified Economic, Operational & Governance Value
    val_box = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.4), Inches(1.2), Inches(6.0), Inches(5.2))
    val_box.fill.solid()
    val_box.fill.fore_color.rgb = COLOR_BG_LIGHT
    val_box.line.color.rgb = COLOR_BORDER
    tf2 = val_box.text_frame
    tf2.word_wrap = True
    tf2.clear()

    p_head2 = tf2.paragraphs[0]
    p_head2.space_after = Pt(8)
    r2 = p_head2.add_run()
    r2.text = "2. Quantified National Economic & Governance Value"
    r2.font.name = "Arial"
    r2.font.size = Pt(13)
    r2.font.bold = True
    r2.font.color.rgb = COLOR_NAVY

    quant_values = [
        ("₹4,000+ Crore Escrow Unlocked", "Unlocks billions in stalled court escrow funds across national corridors, permanently terminating the accrual of 9% to 15% statutory penal interest under Section 34 of RFCTLARR Act 2013."),
        ("35% to 45% Timeline Compression", "Reduces average statutory land acquisition lifecycle from 32 months down to 18–22 months, directly preventing costly EPC highway contractor delay claims."),
        ("CVC & CAG Compliant Governance", "Cryptographic SHA-256 block hashing permanently seals every administrative decision, compensation release, and stay filing into an immutable, tamper-evident audit ledger."),
        ("Zero-Click Autonomous Alerts (Point 8)", "Backend statutory watchdog monitors project milestones 24/7 without human intervention, automatically dispatching SMS and official email alerts to nodal officers.")
    ]

    for title, desc in quant_values:
        p = tf2.add_paragraph()
        p.space_after = Pt(7)
        r0 = p.add_run()
        r0.text = f"• {title}:\n"
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        r0.font.bold = True
        r0.font.color.rgb = COLOR_EMERALD
        
        r1 = p.add_run()
        r1.text = f"  {desc}"
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_DARK

    # =========================================================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # =========================================================================
    print("Formatting Slide 6: Research & References...")
    slide6 = prs.slides[5]
    if slide6.shapes.title:
        slide6.shapes.title.text = "RESEARCH AND REFERENCES: STATUTORY & DATA CITATIONS"
        p = slide6.shapes.title.text_frame.paragraphs[0]
        p.font.name = "Times New Roman"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.alignment = PP_ALIGN.LEFT

    # Remove prompt TextBox 8
    for s in list(slide6.shapes):
        if s.name == "TextBox 8":
            sp_elem = s._element
            sp_elem.getparent().remove(sp_elem)

    ref_cols = [
        ("1. Statutory & Legal Authorities", COLOR_BLUE, [
            ("The National Highways Act, 1956", "Act No. 48 of 1956: Sections 3A (Preliminary Notification), 3B (Survey Demarcation), 3C (Objections), 3D (Declaration & Absolute Vesting), 3G (Award Determination), 3H (Deposit & Disbursement)."),
            ("The RFCTLARR Act, 2013", "Right to Fair Compensation & Transparency in Land Acquisition, Rehabilitation and Resettlement Act: First Schedule multipliers, Second Schedule R&R, Section 34 penal interest mandates."),
            ("PM GatiShakti National Master Plan", "Cabinet Secretariat & DPIIT (2021) guidelines for synchronized institutional planning, multi-modal infrastructure data layer, and inter-ministerial clearance coordination.")
        ]),
        ("2. Technical & AI Research", COLOR_EMERALD, [
            ("Lundberg & Lee (NeurIPS 2017)", "A Unified Approach to Interpreting Model Predictions: TreeSHAP algorithm providing local, game-theoretically optimal marginal feature attributions for ensemble models."),
            ("Chen & Guestrin (KDD 2016)", "XGBoost: A Scalable Tree Boosting System: High-efficiency gradient boosted decision tree implementation for structured tabular revenue data."),
            ("Kaplan & Meier (JASA 1958)", "Nonparametric estimation from incomplete observations: Survival analysis for statutory liquidation horizons and legal dispute resolution hazard curves."),
            ("NHAI / MoRTH Official Data", "Infrastructure Project Monitoring Division (IPMD) delay benchmarks and CAG Performance Audit Reports on National Highway Land Acquisition.")
        ]),
        ("3. Prototype & Deployment Links", COLOR_NAVY, [
            ("GitHub Source Code Repository", "Complete open repository with decoupled ML inference, ETL pipeline, and React frontend:\nhttps://github.com/AryanSahu321/Land_Aquisition_Delay_pridictor.git"),
            ("RESTful API Gateway (Point 11)", "Publicly accessible endpoints for government & developer integrations:\n• /api/v1/projects/parse-and-predict\n• /api/v1/projects/search-options\n• /api/v1/corridor/geojson"),
            ("Interactive Live Modules", "• All-in-One Dashboard (7 Stacked Cards)\n• Purvanchal 340.8 km GIS Corridor (Point 7)\n• 4-Tier Statutory Role RBAC & e-Sign (Points 8, 9, 12)")
        ])
    ]

    for c_idx, (col_title, col_color, col_points) in enumerate(ref_cols):
        c_left = left_start + c_idx * (col_w + gap)
        box = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(1.2), col_w, Inches(5.2))
        box.fill.solid()
        box.fill.fore_color.rgb = COLOR_BG_LIGHT
        box.line.color.rgb = col_color
        box.line.width = Pt(1.5)
        
        tf = box.text_frame
        tf.word_wrap = True
        tf.clear()
        
        p0 = tf.paragraphs[0]
        p0.space_after = Pt(10)
        r0 = p0.add_run()
        r0.text = col_title
        r0.font.name = "Arial"
        r0.font.size = Pt(12)
        r0.font.bold = True
        r0.font.color.rgb = col_color
        
        for p_title, p_desc in col_points:
            p = tf.add_paragraph()
            p.space_after = Pt(8)
            
            r_pt = p.add_run()
            r_pt.text = f"• {p_title}:\n"
            r_pt.font.name = "Arial"
            r_pt.font.size = Pt(9.5)
            r_pt.font.bold = True
            r_pt.font.color.rgb = COLOR_DARK
            
            r_body = p.add_run()
            r_body.text = f"  {p_desc}"
            r_body.font.name = "Arial"
            r_body.font.size = Pt(8.5)
            r_body.font.color.rgb = COLOR_SLATE

    # Save final presentation
    print(f"Saving presentation to: {output_path}")
    prs.save(output_path)
    print("Presentation successfully built and saved!")

if __name__ == "__main__":
    template = "sih/SIH-2026_template_backup.pptx"
    output = "sih/GatiShakti_AI_SIH2026_Presentation.pptx"
    build_sih_presentation(template, output)
    
    # Also update SIH-2026_template_backup.pptx itself so it is fully populated
    build_sih_presentation(template, template)
