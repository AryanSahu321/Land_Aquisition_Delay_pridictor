import sys
import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

def build_slide_5():
    prs = Presentation('sih/SIH-2026_template_backup.pptx')
    slide = prs.slides[4]
    
    # Identify persistent template shapes (Title, Picture 10, Footers)
    keep_shapes = []
    remove_shapes = []
    
    for s in slide.shapes:
        if s.name == 'Title 1' or s.name == 'Picture 10' or 'Placeholder' in s.name or s.name == 'Rectangle 9':
            keep_shapes.append(s)
        else:
            remove_shapes.append(s)
            
    for s in remove_shapes:
        sp = s._element
        sp.getparent().remove(sp)
        
    # Configure Slide Title
    if slide.shapes.title:
        title = slide.shapes.title
        title.text = "IMPACTS & BENEFITS"
        for p in title.text_frame.paragraphs:
            p.font.name = "Arial"
            p.font.size = Pt(24)
            p.font.bold = True
            p.font.color.rgb = RGBColor(0, 51, 102) # Navy #003366
            p.alignment = PP_ALIGN.LEFT
            
    # Slide dimensions: 13.333" x 7.5"
    top_y = Inches(1.15)
    
    # =============================================================
    # 1. TOP-LEFT: 3 IMPACT NARRATIVES (SIHex2 Style)
    # =============================================================
    left_x = Inches(0.48)
    narrative_w = Inches(7.50)
    narrative_h = Inches(3.30)
    
    # Container box for left impact narratives
    box_narrative = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, top_y, narrative_w, narrative_h)
    box_narrative.fill.solid()
    box_narrative.fill.fore_color.rgb = RGBColor(255, 255, 255)
    box_narrative.line.color.rgb = RGBColor(203, 213, 225)
    box_narrative.line.width = Pt(1.2)
    
    narratives = [
        ("economic_impact.png",
         "The Economic & Infrastructure Impact : ",
         "Stalled national highway projects lock up over ₹4,000+ Crore in Section 3H escrow litigation and incur massive contractor idling claims. GatiShakti AI compresses acquisition cycles by 35%–45%, directly unfreezing capital and accelerating national logistics commissioning.",
         RGBColor(30, 58, 138)),
        ("governance_impact.png",
         "Statutory & Governance Transformation : ",
         "Enforces zero Section 3D statutory lapses by deploying an autonomous 310-day countdown watchdog. Constitutional HITL architecture preserves sovereign officer authority under Articles 77 & 166 via Aadhaar DSC e-Sign, backed by an immutable SHA-256 ledger ready for CAG & CVC scrutiny.",
         RGBColor(6, 95, 70)),
        ("social_impact.png",
         "Social & Landowner Empowerment : ",
         "Resolves farmer compensation disputes under Section 3H transparently. Automated Draft for Approval (DFA) SOP notices eliminate multi-year procedural delays, ensuring timely, dispute-free direct-benefit disbursements to affected rural families.",
         RGBColor(146, 64, 14))
    ]
    
    item_y_start = top_y + Inches(0.12)
    item_gap = Inches(1.02)
    
    for i, (icon_name, title_txt, body_txt, theme_col) in enumerate(narratives):
        cur_y = item_y_start + i * item_gap
        
        # Icon Picture
        icon_path = os.path.join('sih/assets', icon_name)
        slide.shapes.add_picture(icon_path, left_x + Inches(0.16), cur_y + Inches(0.04), width=Inches(0.48), height=Inches(0.48))
        
        # Narrative Text Box
        t_box = slide.shapes.add_textbox(left_x + Inches(0.72), cur_y, narrative_w - Inches(0.85), Inches(0.92))
        tf = t_box.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP
        tf.margin_left = Inches(0.02)
        tf.margin_right = Inches(0.02)
        tf.margin_top = Inches(0.02)
        
        p = tf.paragraphs[0]
        
        r_bullet = p.add_run()
        r_bullet.text = "•  "
        r_bullet.font.name = "Arial"
        r_bullet.font.size = Pt(9.5)
        r_bullet.font.bold = True
        r_bullet.font.color.rgb = theme_col
        
        r_title = p.add_run()
        r_title.text = title_txt
        r_title.font.name = "Arial"
        r_title.font.size = Pt(9.5)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(15, 23, 42)
        
        r_desc = p.add_run()
        r_desc.text = body_txt
        r_desc.font.name = "Arial"
        r_desc.font.size = Pt(8.5)
        r_desc.font.color.rgb = RGBColor(51, 65, 85)

    # =============================================================
    # 2. TOP-RIGHT: COMPARATIVE FEATURE TABLE (SIHex2 Style)
    # =============================================================
    tbl_x = Inches(8.12)
    tbl_w = Inches(4.72)
    tbl_h = Inches(3.30)
    
    # Table Outer Card
    tbl_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tbl_x, top_y, tbl_w, tbl_h)
    tbl_card.fill.solid()
    tbl_card.fill.fore_color.rgb = RGBColor(255, 255, 255)
    tbl_card.line.color.rgb = RGBColor(15, 23, 42) # Dark Slate
    tbl_card.line.width = Pt(1.5)
    
    # Table Header Banner (Dark Charcoal)
    hdr_tbl = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, tbl_x, top_y, tbl_w, Inches(0.36))
    hdr_tbl.fill.solid()
    hdr_tbl.fill.fore_color.rgb = RGBColor(26, 32, 44)
    hdr_tbl.line.fill.background()
    
    # Header Columns
    tf_th = hdr_tbl.text_frame
    tf_th.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_th.margin_left = Inches(0.12)
    p_th = tf_th.paragraphs[0]
    p_th.text = "Feature Comparison                         Existing Silos    GatiShakti AI"
    p_th.font.name = "Arial"
    p_th.font.size = Pt(8.5)
    p_th.font.bold = True
    p_th.font.color.rgb = RGBColor(255, 255, 255)
    
    # Table Rows
    table_rows = [
        ("Predictive Delay ML Scoring", False, True),
        ("Sec 3D 365-Day Lapse Watchdog", False, True),
        ("Decoupled Central DB (<15ms)", False, True),
        ("Dual-Track Reality Engine (Sec 3D2)", False, True),
        ("Statutory Factor XAI (TreeSHAP)", False, True),
        ("Automated Prescriptive DFA SOPs", False, True),
        ("Constitutional HITL & Aadhaar DSC", False, True),
        ("CAG / CVC Tamper-Proof Audit", False, True)
    ]
    
    row_start_y = top_y + Inches(0.38)
    row_height = Inches(0.35)
    
    for i, (feat_name, is_exist, is_ours) in enumerate(table_rows):
        ry = row_start_y + i * row_height
        
        # Alternating background band
        if i % 2 == 1:
            band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, tbl_x + Inches(0.02), ry, tbl_w - Inches(0.04), row_height)
            band.fill.solid()
            band.fill.fore_color.rgb = RGBColor(248, 250, 252)
            band.line.fill.background()
            
        # Divider line
        div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, tbl_x, ry + row_height, tbl_w, Inches(0.01))
        div.fill.solid()
        div.fill.fore_color.rgb = RGBColor(226, 232, 240)
        div.line.fill.background()
        
        # Feature Name
        f_box = slide.shapes.add_textbox(tbl_x + Inches(0.10), ry + Inches(0.04), Inches(2.65), Inches(0.28))
        tf_f = f_box.text_frame
        tf_f.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_f.margin_top = Inches(0.01)
        tf_f.margin_left = Inches(0.02)
        p = tf_f.paragraphs[0]
        p.text = feat_name
        p.font.name = "Arial"
        p.font.size = Pt(7.5)
        p.font.color.rgb = RGBColor(30, 41, 59)
        
        # Existing Status Icon
        icon_exist = 'sih/assets/table_check.png' if is_exist else 'sih/assets/table_cross.png'
        slide.shapes.add_picture(icon_exist, tbl_x + Inches(3.08), ry + Inches(0.07), width=Inches(0.20), height=Inches(0.20))
        
        # GatiShakti AI Status Icon
        slide.shapes.add_picture('sih/assets/table_check.png', tbl_x + Inches(4.08), ry + Inches(0.07), width=Inches(0.20), height=Inches(0.20))

    # =============================================================
    # 3. MIDDLE BANNER: HOW GATISHAKTI AI DELIVERS VALUE (SIHex2 style)
    # =============================================================
    banner_y = Inches(4.55)
    banner_h = Inches(0.32)
    banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, banner_y, Inches(12.36), banner_h)
    banner.fill.solid()
    banner.fill.fore_color.rgb = RGBColor(241, 245, 249)
    banner.line.color.rgb = RGBColor(203, 213, 225)
    banner.line.width = Pt(1)
    
    tf_b = banner.text_frame
    tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_b = tf_b.paragraphs[0]
    p_b.text = "HOW GATISHAKTI AI DELIVERS MULTI-STAKEHOLDER VALUE"
    p_b.font.name = "Arial"
    p_b.font.size = Pt(10.5)
    p_b.font.bold = True
    p_b.font.color.rgb = RGBColor(30, 41, 59)
    p_b.alignment = PP_ALIGN.CENTER

    # =============================================================
    # 4. BOTTOM HALF: 3 STAKEHOLDER CARDS (SIHex2 3-Mode Style)
    # =============================================================
    bot_y = Inches(4.95)
    bot_h = Inches(1.82)
    card_w = Inches(3.96)
    gap = Inches(0.24)
    
    modes_data = [
        ("nhai_pd_icon.png",
         "MODE 1: NHAI PROJECT DIRECTOR (PD)",
         RGBColor(0, 112, 192), # Vibrant Blue
         [
             ("For : ", "Highway corridor civil works & contract delivery"),
             ("Process : ", "Corridor RoW tracking ➔ Auto delay alerts ➔ SOP issuance"),
             ("Time Saved : ", "4 to 8 months saved per 40 km construction package"),
             ("Impact Metric : ", "Saves ₹4.5 Cr/month in idling compensation claims"),
             ("Best For : ", "EPC contractor coordination & physical road execution")
         ]),
        ("cala_icon.png",
         "MODE 2: CALA & REVENUE NODAL OFFICERS",
         RGBColor(234, 88, 12), # Vibrant Orange
         [
             ("For : ", "Competent Authority for Land Acquisition & Revenue inquiries"),
             ("Process : ", "Cadastral plot mapping ➔ TreeSHAP bottleneck analysis ➔ DSC e-Sign"),
             ("Time Saved : ", "65% faster Section 3D & 3G DFA notice preparation"),
             ("Impact Metric : ", "Zero statutory lapses across 156 corridor villages"),
             ("Best For : ", "Khasra verification, award inquiry & statutory compliance")
         ]),
        ("morth_icon.png",
         "MODE 3: MoRTH & NATIONAL APEX LEADERSHIP",
         RGBColor(5, 150, 105), # Vibrant Green
         [
             ("For : ", "Ministry Leadership & Network Planning Group (NMP)"),
             ("Process : ", "Macro corridor analytics ➔ Multi-modal telemetry ➔ Fund clearance"),
             ("Time Saved : ", "Real-time national telemetry replacing monthly physical reviews"),
             ("Impact Metric : ", "₹4,000+ Crore in stalled escrow funds unfrozen"),
             ("Best For : ", "National infrastructure prioritization & CAG/CVC audit compliance")
         ])
    ]
    
    for i, (icon_file, m_title, m_border, m_points) in enumerate(modes_data):
        cx = left_x + i * (card_w + gap)
        
        # Card Shape
        card_m = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, bot_y, card_w, bot_h)
        card_m.fill.solid()
        card_m.fill.fore_color.rgb = RGBColor(255, 255, 255)
        card_m.line.color.rgb = m_border
        card_m.line.width = Pt(1.5)
        
        # Header Badge Inside Card
        hdr_m = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.08), bot_y + Inches(0.08), card_w - Inches(0.16), Inches(0.30))
        hdr_m.fill.solid()
        hdr_m.fill.fore_color.rgb = m_border
        hdr_m.line.fill.background()
        
        # Icon inside header badge
        icon_p = os.path.join('sih/assets', icon_file)
        slide.shapes.add_picture(icon_p, cx + Inches(0.12), bot_y + Inches(0.10), width=Inches(0.24), height=Inches(0.24))
        
        tf_hm = hdr_m.text_frame
        tf_hm.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_hm.margin_left = Inches(0.32)
        p_hm = tf_hm.paragraphs[0]
        p_hm.text = m_title
        p_hm.font.name = "Arial"
        p_hm.font.size = Pt(8.5)
        p_hm.font.bold = True
        p_hm.font.color.rgb = RGBColor(255, 255, 255)
        
        # Text Body inside card
        txt_m = slide.shapes.add_textbox(cx + Inches(0.10), bot_y + Inches(0.40), card_w - Inches(0.20), bot_h - Inches(0.45))
        tf_tm = txt_m.text_frame
        tf_tm.word_wrap = True
        tf_tm.vertical_anchor = MSO_ANCHOR.TOP
        tf_tm.margin_left = Inches(0.04)
        tf_tm.margin_right = Inches(0.04)
        tf_tm.margin_top = Inches(0.02)
        
        for j, (lbl_txt, desc_txt) in enumerate(m_points):
            p_pt = tf_tm.paragraphs[0] if j == 0 else tf_tm.add_paragraph()
            p_pt.space_after = Pt(2)
            
            r_b = p_pt.add_run()
            r_b.text = "•  "
            r_b.font.name = "Arial"
            r_b.font.size = Pt(7.5)
            r_b.font.bold = True
            r_b.font.color.rgb = m_border
            
            r_l = p_pt.add_run()
            r_l.text = lbl_txt
            r_l.font.name = "Arial"
            r_l.font.size = Pt(7.5)
            r_l.font.bold = True
            r_l.font.color.rgb = RGBColor(15, 23, 42)
            
            r_d = p_pt.add_run()
            r_d.text = desc_txt
            r_d.font.name = "Arial"
            r_d.font.size = Pt(7.2)
            r_d.font.color.rgb = RGBColor(51, 65, 85)

    prs.save('sih/SIH-2026_template_backup.pptx')
    prs.save('sih/GatiShakti_AI_SIH2026_Presentation.pptx')
    print("Slide 5 built successfully in both PPTX files!")

if __name__ == '__main__':
    build_slide_5()
