import io
import os
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

def generate_pdf_report(analysis_results: Dict[str, Any]) -> bytes:
    """
    Generates a professional PDF report from analysis results.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    COLOR_PRIMARY = colors.HexColor("#4F46E5")  # Indigo 600
    COLOR_DARK = colors.HexColor("#1E293B")     # Slate 800
    COLOR_MUTED = colors.HexColor("#64748B")    # Slate 500
    COLOR_BG_LIGHT = colors.HexColor("#F8FAFC") # Slate 50
    COLOR_EXACT = colors.HexColor("#EF4444")    # Red 500
    COLOR_PARAPHRASE = colors.HexColor("#F59E0B")# Amber 500
    COLOR_HIGH = colors.HexColor("#F97316")     # Orange 500
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=COLOR_PRIMARY,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=COLOR_MUTED,
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=COLOR_DARK,
        spaceBefore=12,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=COLOR_DARK,
        leading=14
    )

    badge_style = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.white,
        alignment=1
    )

    story = []

    # Header / Branding
    story.append(Paragraph("TEXTTRACE AI", title_style))
    story.append(Paragraph("Plagiarism & Paraphrase Analysis Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=COLOR_PRIMARY, spaceAfter=15))

    metrics = analysis_results.get("metrics", {})
    doc_a = analysis_results.get("document_a_name", "Document A")
    doc_b = analysis_results.get("document_b_name", "Document B")
    date_str = datetime.now().strftime("%B %d, %Y - %H:%M:%S")

    # Document & Metadata Info Table
    meta_data = [
        [Paragraph("<b>Document A:</b>", body_style), Paragraph(doc_a, body_style)],
        [Paragraph("<b>Document B:</b>", body_style), Paragraph(doc_b, body_style)],
        [Paragraph("<b>Analysis Date:</b>", body_style), Paragraph(date_str, body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[110, 420])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # Executive Metrics Section
    story.append(Paragraph("Similarity Overview", section_heading))
    
    overall_score = metrics.get("overall_similarity", 0.0)
    exact_pct = metrics.get("exact_match_pct", 0.0)
    high_pct = metrics.get("high_similarity_pct", 0.0)
    para_pct = metrics.get("paraphrase_pct", 0.0)
    rel_pct = metrics.get("related_pct", 0.0)
    orig_pct = metrics.get("original_pct", 0.0)

    metric_summary_data = [
        [
            Paragraph(f"<b>Overall Similarity</b><br/><font size=16 color='{COLOR_PRIMARY.hexval()}'><b>{overall_score}%</b></font>", body_style),
            Paragraph(f"<b>Exact Match</b><br/><font size=13 color='{COLOR_EXACT.hexval()}'><b>{exact_pct}%</b></font>", body_style),
            Paragraph(f"<b>Paraphrased</b><br/><font size=13 color='{COLOR_PARAPHRASE.hexval()}'><b>{para_pct}%</b></font>", body_style),
            Paragraph(f"<b>High Similarity</b><br/><font size=13 color='{COLOR_HIGH.hexval()}'><b>{high_pct}%</b></font>", body_style),
            Paragraph(f"<b>Original</b><br/><font size=13 color='#10B981'><b>{orig_pct}%</b></font>", body_style),
        ]
    ]
    metric_table = Table(metric_summary_data, colWidths=[106, 106, 106, 106, 106])
    metric_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BACKGROUND', (0,0), (-1,-1), COLOR_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(metric_table)
    story.append(Spacer(1, 12))

    # AI Summary Box
    summary_text = analysis_results.get("analysis_summary", "")
    if summary_text:
        story.append(Paragraph("AI Executive Summary", section_heading))
        summary_p = Paragraph(f"<i>{summary_text}</i>", body_style)
        summary_table = Table([[summary_p]], colWidths=[530])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#C7D2FE")),
            ('PADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 15))

    # Suspicious Matches Section
    suspicious = analysis_results.get("suspicious_matches", [])
    if suspicious:
        story.append(Paragraph(f"Top Flagged Sentence Pairs ({len(suspicious)})", section_heading))
        
        table_data = [
            [
                Paragraph("<b>Classification & Score</b>", body_style),
                Paragraph("<b>Document A Sentence</b>", body_style),
                Paragraph("<b>Document B Sentence</b>", body_style)
            ]
        ]
        
        for item in suspicious[:12]:  # Top 12 suspicious matches for PDF size safety
            sem = int(round(item["semantic_similarity"] * 100))
            lex = int(round(item["lexical_similarity"] * 100))
            cls = item["classification"]
            
            score_desc = f"<b>{cls}</b><br/>Semantic: {sem}%<br/>Lexical: {lex}%"
            
            table_data.append([
                Paragraph(score_desc, body_style),
                Paragraph(item["source_text"], body_style),
                Paragraph(item["target_text"], body_style)
            ])

        match_table = Table(table_data, colWidths=[130, 200, 200])
        match_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
            ('TEXTCOLOR', (0,0), (-1,0), COLOR_DARK),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(match_table)
        story.append(Spacer(1, 15))

    # Methodology & Limitations Footer
    story.append(KeepTogether([
        Paragraph("Methodology & Limitations", section_heading),
        Paragraph(
            "Analysis was conducted using sentence-level transformer embeddings (<i>all-MiniLM-L6-v2</i>) "
            "combined with TF-IDF character n-gram lexical comparisons. Cosine similarity score thresholds "
            "categorize matches into Exact, High Similarity, Paraphrase, and Related indicators. "
            "These indicators highlight textual and semantic overlap for review and do not constitute an "
            "automated legal or academic judgment.",
            ParagraphStyle('LimitationText', parent=body_style, fontSize=8.5, textColor=COLOR_MUTED, leading=12)
        )
    ]))

    doc.build(story)
    return buffer.getvalue()
