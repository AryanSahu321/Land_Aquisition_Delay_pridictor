import json
import os
import re
from pathlib import Path
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PROJECTS_DB_DIR = DATA_DIR / "projects_db"
CSV_PATH = DATA_DIR / "data.csv"

# 14 Curated Featured Projects
FEATURED_PROJECTS = [
    {
        "project_name": "Purvanchal Expressway",
        "slug": "purvanchal_expressway",
        "agency": "UPEIDA",
        "ministry": "Dept of Infrastructure & Industrial Development (Govt of UP)",
        "government_type": "State Gov",
        "state": "Uttar Pradesh",
        "corridor": "Lucknow - Ghazipur via Azamgarh",
        "total_km": 340.8,
        "packages_count": 8
    },
    {
        "project_name": "Ganga Expressway",
        "slug": "ganga_expressway",
        "agency": "UPEIDA",
        "ministry": "Dept of Infrastructure & Industrial Development (Govt of UP)",
        "government_type": "State Gov",
        "state": "Uttar Pradesh",
        "corridor": "Meerut - Prayagraj via Badaun, Hardoi",
        "total_km": 594.0,
        "packages_count": 12
    },
    {
        "project_name": "Bundelkhand Expressway",
        "slug": "bundelkhand_expressway",
        "agency": "UPEIDA",
        "ministry": "Dept of Infrastructure & Industrial Development (Govt of UP)",
        "government_type": "State Gov",
        "state": "Uttar Pradesh",
        "corridor": "Etawah - Chitrakoot via Banda",
        "total_km": 296.0,
        "packages_count": 6
    },
    {
        "project_name": "Agra-Lucknow Expressway",
        "slug": "agra_lucknow_expressway",
        "agency": "UPEIDA",
        "ministry": "Dept of Infrastructure & Industrial Development (Govt of UP)",
        "government_type": "State Gov",
        "state": "Uttar Pradesh",
        "corridor": "Agra - Lucknow",
        "total_km": 302.2,
        "packages_count": 5
    },
    {
        "project_name": "Gorakhpur Link Expressway",
        "slug": "gorakhpur_link_expressway",
        "agency": "UPEIDA",
        "ministry": "Dept of Infrastructure & Industrial Development (Govt of UP)",
        "government_type": "State Gov",
        "state": "Uttar Pradesh",
        "corridor": "Gorakhpur - Azamgarh Purvanchal Junction",
        "total_km": 91.3,
        "packages_count": 4
    },
    {
        "project_name": "Delhi-Amritsar-Katra Expressway (Jalandhar Spur NH-NE5A)",
        "slug": "delhi_amritsar_katra_expressway",
        "agency": "NHAI",
        "ministry": "Ministry of Road Transport and Highways (MoRTH)",
        "government_type": "Central Gov",
        "state": "Punjab",
        "corridor": "Jalandhar - Nakodar - Amritsar Spur",
        "total_km": 670.0,
        "packages_count": 14
    },
    {
        "project_name": "4-Laning of Numaligarh to Jorhat Section",
        "slug": "numaligarh_jorhat_section",
        "agency": "NHIDCL",
        "ministry": "Ministry of Road Transport and Highways (MoRTH)",
        "government_type": "Central Gov",
        "state": "Assam",
        "corridor": "Numaligarh to Jorhat (NH-715 / Old NH-37)",
        "total_km": 51.4,
        "packages_count": 3
    },
    {
        "project_name": "Bengaluru Suburban Railway Project (BSRP)",
        "slug": "bsrp_bengaluru",
        "agency": "K-RIDE",
        "ministry": "Ministry of Railways & Infrastructure Dev Dept (Govt of Karnataka)",
        "government_type": "Joint (Central & State)",
        "state": "Karnataka",
        "corridor": "Corridor 2: Baiyappanahalli to Chikkabanavara (Mallige Line)",
        "total_km": 148.1,
        "packages_count": 4
    },
    {
        "project_name": "Delhi-Ghaziabad-Meerut RRTS Corridor (Namo Bharat)",
        "slug": "delhi_meerut_rrts",
        "agency": "NCRTC",
        "ministry": "Ministry of Housing and Urban Affairs (MoHUA)",
        "government_type": "Central Gov",
        "state": "Delhi & Uttar Pradesh",
        "corridor": "Sarai Kale Khan - Ghaziabad - Modipuram",
        "total_km": 82.1,
        "packages_count": 6
    },
    {
        "project_name": "Kochi Metro Rail Project Phase 1 (Aluva to Petta)",
        "slug": "kochi_metro_phase1",
        "agency": "KMRL",
        "ministry": "Ministry of Housing and Urban Affairs (MoHUA) & Govt of Kerala",
        "government_type": "Joint (Central & State)",
        "state": "Kerala",
        "corridor": "Aluva to Petta & Thripunithura",
        "total_km": 28.1,
        "packages_count": 4
    },
    {
        "project_name": "Lucknow Metro (North-South Corridor)",
        "slug": "lucknow_metro_ns",
        "agency": "UPMRC",
        "ministry": "Ministry of Housing and Urban Affairs (MoHUA) & Govt of UP",
        "government_type": "Joint (Central & State)",
        "state": "Uttar Pradesh",
        "corridor": "CCS Airport to Munshi Pulia",
        "total_km": 22.8,
        "packages_count": 3
    },
    {
        "project_name": "Kanpur Metro (Corridors 1 and 2)",
        "slug": "kanpur_metro",
        "agency": "UPMRC",
        "ministry": "Ministry of Housing and Urban Affairs (MoHUA) & Govt of UP",
        "government_type": "Joint (Central & State)",
        "state": "Uttar Pradesh",
        "corridor": "IIT Kanpur to Naubasta & Agriculture Univ to Barra-8",
        "total_km": 32.4,
        "packages_count": 5
    },
    {
        "project_name": "Transmission Scheme for Solar Energy Zones in Rajasthan (PGCIL/ISTS)",
        "slug": "pgcil_rajasthan_sez",
        "agency": "PGCIL",
        "ministry": "Ministry of Power",
        "government_type": "Central Gov",
        "state": "Rajasthan",
        "corridor": "Fatehgarh - Bhadla 765kV High Capacity Corridor",
        "total_km": 420.0,
        "packages_count": 5
    },
    {
        "project_name": "Subansiri Lower Hydroelectric Project (2000 MW)",
        "slug": "subansiri_hydroelectric",
        "agency": "NHPC",
        "ministry": "Ministry of Power",
        "government_type": "Central Gov",
        "state": "Arunachal Pradesh & Assam",
        "corridor": "Gerukamukh, Dhemaji & Lower Subansiri Basin",
        "total_km": 65.0,
        "packages_count": 4
    }
]


def generate_pdf_3a(filepath: Path, proj: dict, row: dict):
    doc = SimpleDocTemplate(str(filepath), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'GazetteHeader',
        parent=styles['Heading1'],
        fontSize=13,
        leading=16,
        alignment=1, # Center
        textColor=colors.HexColor('#1e293b')
    )
    sub_header_style = ParagraphStyle(
        'GazetteSubHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.HexColor('#64748b')
    )
    body_style = ParagraphStyle(
        'GazetteBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )
    label_style = ParagraphStyle(
        'GazetteLabel',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#334155')
    )

    story = []
    
    # Gazette Top Banner
    story.append(Paragraph("THE GAZETTE OF INDIA : EXTRAORDINARY [PART II—SEC. 3(ii)]", header_style))
    story.append(Paragraph(f"MINISTRY: {proj['ministry'].upper()} | {proj['government_type'].upper()}", sub_header_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=12))
    
    story.append(Paragraph(f"<b>NOTIFICATION UNDER SECTION 3A / PRELIMINARY STATUTORY NOTICE</b>", header_style))
    story.append(Paragraph(f"Project Reference: {proj['project_name']} (Agency: {proj['agency']})", sub_header_style))
    story.append(Spacer(1, 10))
    
    intro_text = (
        f"S.O. {1000 + hash(proj['slug']) % 8999}(E).— WHEREAS it appears to the Competent Authority that the land specified in the schedule "
        f"annexed hereto is urgently required for a public purpose, namely the execution and expansion of <b>{proj['project_name']}</b> "
        f"across the designated corridor ({proj['corridor']}) within the State of {proj['state']} under governing statute <b>{row.get('governing_statute', 'National Highways Act 1956')}</b>."
    )
    story.append(Paragraph(intro_text, body_style))
    story.append(Spacer(1, 10))

    # Parameter Table
    table_data = [
        [Paragraph("<b>Parameter Field</b>", label_style), Paragraph("<b>Statutory Ground Truth / Extracted Metric</b>", label_style)],
        [Paragraph("Project ID", body_style), Paragraph(str(row.get("project_id", "PRJ-IND-01")), body_style)],
        [Paragraph("Project Name", body_style), Paragraph(str(proj["project_name"]), body_style)],
        [Paragraph("Executing Agency", body_style), Paragraph(str(proj["agency"]), body_style)],
        [Paragraph("Governing Statute", body_style), Paragraph(str(row.get("governing_statute", "NH Act 1956")), body_style)],
        [Paragraph("Current Statutory Stage", body_style), Paragraph(str(row.get("statutory_stage", "Section_3A_Notification")), body_style)],
        [Paragraph("Days Elapsed in Current Stage", body_style), Paragraph(f"{int(float(row.get('days_in_current_stage', 45)))} days", body_style)],
        [Paragraph("Total Land Area (Hectares)", body_style), Paragraph(f"{float(row.get('total_area_hectares', 120.5)):.2f} Ha", body_style)],
        [Paragraph("Land Classification Type", body_style), Paragraph(str(row.get("land_type", "Private_Agricultural")), body_style)],
        [Paragraph("Affected Families Count", body_style), Paragraph(f"{int(float(row.get('affected_families_count', 140)))} families", body_style)],
        [Paragraph("Corridor Alignment Length", body_style), Paragraph(f"{proj['total_km']} km ({proj['packages_count']} Construction Packages)", body_style)]
    ]
    t = Table(table_data, colWidths=[200, 340])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))

    notice_concl = (
        "Any person interested in the land may, within twenty-one days from the date of publication of this notification in the Official Gazette, "
        "object to the use of the land for the purpose aforesaid under Section 3C. Objections received will be arbitrated by the Competent Authority for Land Acquisition (CALA)."
    )
    story.append(Paragraph(notice_concl, body_style))
    doc.build(story)


def generate_pdf_3d(filepath: Path, proj: dict, row: dict):
    doc = SimpleDocTemplate(str(filepath), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'GazetteHeader',
        parent=styles['Heading1'],
        fontSize=13,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#1e293b')
    )
    sub_header_style = ParagraphStyle(
        'GazetteSubHeader',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.HexColor('#64748b')
    )
    body_style = ParagraphStyle(
        'GazetteBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )
    label_style = ParagraphStyle(
        'GazetteLabel',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#334155')
    )

    story = []
    story.append(Paragraph("THE GAZETTE OF INDIA : STATUTORY DECLARATION VESTING", header_style))
    story.append(Paragraph(f"MINISTRY: {proj['ministry'].upper()} | EXECUTING AUTHORITY: {proj['agency'].upper()}", sub_header_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceAfter=12))
    
    story.append(Paragraph(f"<b>FINAL DECLARATION UNDER SECTION 3D / SECTION 19 ACQUISITION DECLARATION</b>", header_style))
    story.append(Spacer(1, 10))

    dec_text = (
        f"In pursuance of sub-section (1) of Section 3D of the National Highways Act 1956 / RFCTLARR 2013, the Central/State Government hereby declares that the lands "
        f"specified in the schedule below are acquired for <b>{proj['project_name']}</b>. Consequently, upon publication, "
        f"the land shall vest absolutely in the Government free from all encumbrances. All pending co-sharer mutation disputes "
        f"and missing title deeds are subject to summary adjudication by the Competent Authority."
    )
    story.append(Paragraph(dec_text, body_style))
    story.append(Spacer(1, 10))

    table_data = [
        [Paragraph("<b>Statutory Parcel Metric</b>", label_style), Paragraph("<b>Audit / Gazette Certified Value</b>", label_style)],
        [Paragraph("Total Acquired Cadastral Area", body_style), Paragraph(f"{float(row.get('total_area_hectares', 120.5)):.2f} Hectares", body_style)],
        [Paragraph("Missing Title Deeds Percentage", body_style), Paragraph(f"{float(row.get('missing_title_deeds_pct', 8.5)):.1f}%", body_style)],
        [Paragraph("Co-Sharer Mutation Pending", body_style), Paragraph("TRUE (Pending Tehsildar Clearance)" if str(row.get('co_sharer_mutation_pending', 0)) in ['1', 'True', 'true'] else "FALSE (Clear Record)", body_style)],
        [Paragraph("Forest Clearance Stage", body_style), Paragraph(str(row.get("forest_clearance_stage", "Stage_I_Granted")), body_style)],
        [Paragraph("Utility Lines to Relocate", body_style), Paragraph(f"{int(float(row.get('utility_lines_to_relocate_count', 12)))} overhead/pipeline utilities", body_style)],
        [Paragraph("Critical Path Asset Status", body_style), Paragraph("YES (Critical Right-of-Way Corridor)" if str(row.get('is_critical_path_asset', 1)) in ['1', 'True', 'true'] else "NO", body_style)],
        [Paragraph("Joint Measurement Survey (JMS)", body_style), Paragraph("COMPLETED (100% Boundary Demarcated)", body_style)],
    ]
    t = Table(table_data, colWidths=[220, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ecfdf5')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#a7f3d0')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))
    doc.build(story)


def generate_pdf_dpr(filepath: Path, proj: dict, row: dict):
    doc = SimpleDocTemplate(str(filepath), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'DPRHeader',
        parent=styles['Heading1'],
        fontSize=13,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#0f172a')
    )
    sub_header_style = ParagraphStyle(
        'DPRSub',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.HexColor('#475569')
    )
    body_style = ParagraphStyle(
        'DPRBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )
    label_style = ParagraphStyle(
        'DPRLabel',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#334155')
    )

    story = []
    story.append(Paragraph("DETAILED PROJECT REPORT (DPR) — ENGINEERING & RO-W SUMMARY", header_style))
    story.append(Paragraph(f"PREPARED FOR: {proj['agency'].upper()} | PROJECT: {proj['project_name'].upper()}", sub_header_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6366f1'), spaceAfter=12))

    story.append(Paragraph(f"<b>ENGINEERING GEOTECHNICAL & CIVIL OBSTRUCTION AUDIT</b>", header_style))
    story.append(Spacer(1, 8))

    table_data = [
        [Paragraph("<b>Engineering Parameter</b>", label_style), Paragraph("<b>Field Survey Specification</b>", label_style)],
        [Paragraph("Residential Structures in RoW", body_style), Paragraph(f"{int(float(row.get('structures_count_residential', 24)))} structures", body_style)],
        [Paragraph("Commercial Establishments", body_style), Paragraph(f"{int(float(row.get('commercial_establishments_count', 8)))} establishments", body_style)],
        [Paragraph("Public Structures / Places of Worship", body_style), Paragraph("PRESENT (Requires Sensitive Relocation)" if str(row.get('public_structure_obstruction', 0)) in ['1', 'True', 'true'] else "NONE", body_style)],
        [Paragraph("Active Environmental Protests", body_style), Paragraph("ACTIVE OPPOSITION RECORDED" if str(row.get('active_environmental_protests', 0)) in ['1', 'True', 'true'] else "NONE / STABLE", body_style)],
        [Paragraph("Contractor Past Delay Index", body_style), Paragraph(f"{float(row.get('contractor_past_delay_index', 0.15)):.2f} (Scale: 0.0 - 1.0)", body_style)],
        [Paragraph("Subcontractor Tier Rating", body_style), Paragraph(f"{str(row.get('subcontractor_tier_rating', 'Tier_1_National')).replace('_', ' ')}", body_style)],
        [Paragraph("Monsoon Disruption Probability", body_style), Paragraph(f"{float(row.get('monsoon_disruption_probability', 0.42)) * 100:.1f}%", body_style)],
        [Paragraph("Soil Bearing Capacity Variance", body_style), Paragraph(f"{float(row.get('soil_bearing_capacity_variance', 0.12)):.2f} kN/m² variance", body_style)],
        [Paragraph("Groundwater Table Depth", body_style), Paragraph(f"{float(row.get('groundwater_table_depth', 5.4)):.1f} meters BGL", body_style)],
        [Paragraph("Regional Labor Availability Index", body_style), Paragraph(str(row.get('regional_labor_availability', 'Adequate')).replace('_', ' '), body_style)],
        [Paragraph("WPI Material Inflation Index", body_style), Paragraph(f"{float(row.get('wpi_material_inflation', 0.06)) * 100:.1f}%", body_style)]
    ]
    t = Table(table_data, colWidths=[220, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eef2ff')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#c7d2fe')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))
    doc.build(story)


def generate_pdf_cala(filepath: Path, proj: dict, row: dict):
    doc = SimpleDocTemplate(str(filepath), pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    header_style = ParagraphStyle(
        'CALAHeader',
        parent=styles['Heading1'],
        fontSize=13,
        leading=16,
        alignment=1,
        textColor=colors.HexColor('#0f172a')
    )
    sub_header_style = ParagraphStyle(
        'CALASub',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.HexColor('#475569')
    )
    body_style = ParagraphStyle(
        'CALABody',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )
    label_style = ParagraphStyle(
        'CALALabel',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#334155')
    )

    story = []
    story.append(Paragraph("OFFICE OF THE COMPETENT AUTHORITY FOR LAND ACQUISITION (CALA)", header_style))
    story.append(Paragraph(f"COMPENSATION ARBITRATION & ESCROW DISBURSEMENT ORDER", sub_header_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#f59e0b'), spaceAfter=12))

    story.append(Paragraph(f"<b>SECTION 3G/3H AWARD LIQUIDATION AUDIT REPORT</b>", header_style))
    story.append(Paragraph(f"Project: {proj['project_name']} | Nodal Officer / CALA District Collectorate", sub_header_style))
    story.append(Spacer(1, 10))

    disbursed_pct = float(row.get('compensation_disbursed_pct', 78.4))
    injunctions = int(float(row.get('pending_court_injunctions', 3)))
    escrow = str(row.get('sec_3h_escrow_deposited', 1)) in ['1', 'True', 'true']
    liquidity = float(row.get('competent_authority_fund_liquidity', 0.85))

    table_data = [
        [Paragraph("<b>Financial & Litigation Parameter</b>", label_style), Paragraph("<b>CALA Audit Record</b>", label_style)],
        [Paragraph("Compensation Disbursed Percentage", body_style), Paragraph(f"<b>{disbursed_pct:.1f}%</b> of total compensation deposited", body_style)],
        [Paragraph("Pending Civil Court Injunctions", body_style), Paragraph(f"<b>{injunctions} active injunction(s)</b> pending in District/High Court", body_style)],
        [Paragraph("Section 3H Escrow Deposited", body_style), Paragraph("DEPOSITED IN ESCROW ACCOUNT" if escrow else "DEFICIT / PENDING ESCROW DEPOSIT", body_style)],
        [Paragraph("Competent Authority Fund Liquidity", body_style), Paragraph(f"{liquidity * 100:.1f}% liquidity ratio available", body_style)],
        [Paragraph("Treasury Invoice Clearance Lag", body_style), Paragraph(f"{int(float(row.get('treasury_invoice_clearance_lag', 22)))} days average turnaround", body_style)],
        [Paragraph("Digital Record Fidelity Score", body_style), Paragraph(f"{float(row.get('digital_record_fidelity_score', 0.88)) * 100:.1f}% verified on Bhulekh / Bhoomi Rashi", body_style)],
        [Paragraph("Historical Baseline Delay Benchmark", body_style), Paragraph(f"{int(float(row.get('actual_delay_days', 120)))} recorded delay days", body_style)]
    ]
    t = Table(table_data, colWidths=[220, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#fffbeb')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#fde68a')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))
    doc.build(story)


def main():
    print(f"Loading data from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    
    # Pre-index by project_name
    projects_index = []
    
    for proj in FEATURED_PROJECTS:
        slug = proj["slug"]
        proj_dir = PROJECTS_DB_DIR / slug
        proj_dir.mkdir(parents=True, exist_ok=True)
        
        # Find matching row in data.csv
        match = df[df["project_name"] == proj["project_name"]]
        if len(match) > 0:
            row = match.iloc[0].to_dict()
        else:
            # Fallback to closest match
            fuzzy = df[df["project_name"].str.contains(proj["project_name"][:15], case=False, na=False)]
            if len(fuzzy) > 0:
                row = fuzzy.iloc[0].to_dict()
            else:
                row = df.iloc[0].to_dict()
                row["project_name"] = proj["project_name"]

        # 4 Standard Statutory PDF Documents per Project
        pdf_3a_path = proj_dir / "Gazette_Sec3A_Notification.pdf"
        pdf_3d_path = proj_dir / "Gazette_Sec3D_Declaration.pdf"
        pdf_dpr_path = proj_dir / "DPR_Executive_Summary.pdf"
        pdf_cala_path = proj_dir / "CALA_Award_Disbursement_Order.pdf"

        print(f"Generating PDFs for {proj['project_name']} ({slug})...")
        generate_pdf_3a(pdf_3a_path, proj, row)
        generate_pdf_3d(pdf_3d_path, proj, row)
        generate_pdf_dpr(pdf_dpr_path, proj, row)
        generate_pdf_cala(pdf_cala_path, proj, row)

        doc_meta = [
            {
                "doc_type": "Gazette_Sec3A_Notification",
                "filename": "Gazette_Sec3A_Notification.pdf",
                "title": "Section 3A Statutory Intent Notification",
                "statutory_authority": "Ministry of Road Transport and Highways / Central Gazette",
                "key_parameters": ["total_area_hectares", "affected_families_count", "statutory_stage", "days_in_current_stage", "land_type"]
            },
            {
                "doc_type": "Gazette_Sec3D_Declaration",
                "filename": "Gazette_Sec3D_Declaration.pdf",
                "title": "Section 3D Statutory Vesting Declaration",
                "statutory_authority": "Revenue Dept / Competent Authority",
                "key_parameters": ["missing_title_deeds_pct", "co_sharer_mutation_pending", "forest_clearance_stage", "utility_lines_to_relocate_count", "is_critical_path_asset"]
            },
            {
                "doc_type": "DPR_Executive_Summary",
                "filename": "DPR_Executive_Summary.pdf",
                "title": "Detailed Project Report (DPR) RoW & Engineering Summary",
                "statutory_authority": "Technical Consultant / Executing Agency",
                "key_parameters": ["structures_count_residential", "commercial_establishments_count", "public_structure_obstruction", "active_environmental_protests", "monsoon_disruption_probability", "soil_bearing_capacity_variance"]
            },
            {
                "doc_type": "CALA_Award_Disbursement_Order",
                "filename": "CALA_Award_Disbursement_Order.pdf",
                "title": "CALA Award & Compensation Disbursement Order",
                "statutory_authority": "District Collector / Competent Authority (CALA)",
                "key_parameters": ["compensation_disbursed_pct", "pending_court_injunctions", "sec_3h_escrow_deposited", "competent_authority_fund_liquidity", "actual_delay_days"]
            }
        ]

        proj_entry = {
            **proj,
            "project_id": row.get("project_id", f"PRJ-{slug[:6].upper()}"),
            "statutory_stage": row.get("statutory_stage", "Section_3D/19_Declaration"),
            "days_in_current_stage": int(float(row.get("days_in_current_stage", 60))),
            "actual_delay_days": int(float(row.get("actual_delay_days", 140))),
            "compensation_disbursed_pct": float(row.get("compensation_disbursed_pct", 75.0)),
            "pending_court_injunctions": int(float(row.get("pending_court_injunctions", 2))),
            "total_area_hectares": float(row.get("total_area_hectares", 150.0)),
            "documents": doc_meta,
            "raw_features": row
        }
        projects_index.append(proj_entry)

    index_path = PROJECTS_DB_DIR / "index.json"
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(projects_index, f, indent=2, default=str)
    
    print(f"Successfully generated database index and statutory documents for {len(projects_index)} projects at {PROJECTS_DB_DIR}")

if __name__ == "__main__":
    main()
