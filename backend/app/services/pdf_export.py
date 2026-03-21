"""PDF export service — generates analysis report PDFs."""

from io import BytesIO

from fpdf import FPDF

from app.models.job_analysis import JobAnalysis


class ReportPDF(FPDF):
    """Custom PDF with header/footer for NextHire reports."""

    def __init__(self, title: str):
        super().__init__()
        self.report_title = title

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "NextHire Analysis Report", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(99, 102, 241)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def section_title(self, title: str):
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(55, 48, 107)
        self.cell(0, 10, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def subsection(self, title: str):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(80, 80, 80)
        self.cell(0, 7, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body_text(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet_list(self, items: list[str]):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(60, 60, 60)
        left_margin = self.l_margin
        for item in items:
            safe = _safe(item)
            self.set_x(left_margin + 4)
            self.cell(4, 5.5, "-")
            self.multi_cell(self.w - self.r_margin - self.get_x(), 5.5, safe)
        self.ln(2)

    def score_badge(self, score: float):
        """Render a colored score indicator."""
        if score >= 70:
            r, g, b = 34, 197, 94
        elif score >= 40:
            r, g, b = 245, 158, 11
        else:
            r, g, b = 239, 68, 68

        self.set_font("Helvetica", "B", 28)
        self.set_text_color(r, g, b)
        self.cell(0, 14, f"{score:.0f}/100", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)


def _safe(text: str | None) -> str:
    """Sanitize text for PDF output (replace problematic chars)."""
    if not text:
        return ""
    return (
        text.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2013", "-")
        .replace("\u2014", "--")
        .replace("\u2026", "...")
        .replace("\u2022", "-")
        .replace("\u00a0", " ")
    )


def generate_analysis_pdf(analysis: JobAnalysis) -> bytes:
    """Generate a PDF report from a JobAnalysis record."""
    title = f"{analysis.job_title or 'Position'} @ {analysis.company_name or 'Company'}"
    pdf = ReportPDF(title)
    pdf.alias_nb_pages()
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 10, _safe(title))
    pdf.ln(3)

    # Score
    pdf.section_title("ATS Compatibility Score")
    if analysis.overall_score is not None:
        pdf.score_badge(analysis.overall_score)
    else:
        pdf.body_text("Score not available")

    # Match Analysis
    match = analysis.match_result or {}
    llm_analysis = match.get("llm_analysis", {})

    if llm_analysis.get("overall_assessment"):
        pdf.section_title("Overall Assessment")
        pdf.body_text(_safe(llm_analysis["overall_assessment"]))

    # Scores detail
    keyword_match = match.get("keyword_match", {})
    semantic = match.get("semantic_score")
    if semantic is not None or keyword_match.get("match_percentage") is not None:
        pdf.subsection("Score Breakdown")
        if semantic is not None:
            pdf.body_text(f"Semantic Similarity: {semantic:.1%}")
        kw_pct = keyword_match.get("match_percentage")
        if kw_pct is not None:
            pdf.body_text(f"Keyword Match: {kw_pct:.1f}%")

    # Strengths
    strengths = llm_analysis.get("strengths", [])
    if strengths:
        pdf.section_title("Strengths")
        pdf.bullet_list([_safe(s) for s in strengths])

    # Weaknesses
    weaknesses = llm_analysis.get("weaknesses", [])
    if weaknesses:
        pdf.section_title("Weaknesses")
        pdf.bullet_list([_safe(w) for w in weaknesses])

    # Gap Analysis
    gaps = analysis.gap_analysis or {}
    critical_gaps = gaps.get("critical_gaps", [])
    if critical_gaps:
        pdf.section_title("Critical Gaps")
        for gap in critical_gaps:
            importance = gap.get("importance", "medium")
            skill = _safe(gap.get("skill", ""))
            suggestion = _safe(gap.get("suggestion", ""))
            pdf.set_font("Helvetica", "B", 10)
            pdf.set_text_color(80, 80, 80)
            pdf.cell(0, 6, f"[{importance.upper()}] {skill}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(100, 100, 100)
            pdf.multi_cell(0, 5, suggestion)
            pdf.ln(2)

    # Quick Wins
    quick_wins = gaps.get("quick_wins", [])
    if quick_wins:
        pdf.section_title("Quick Wins")
        pdf.bullet_list([_safe(q) for q in quick_wins])

    # ATS Tips
    ats_tips = llm_analysis.get("ats_tips", [])
    if ats_tips:
        pdf.section_title("ATS Tips")
        pdf.bullet_list([_safe(t) for t in ats_tips])

    # Matched Skills
    matched = keyword_match.get("matched", [])
    missing = keyword_match.get("missing", [])
    if matched or missing:
        pdf.section_title("Skills Overview")
        if matched:
            pdf.subsection("Matched Skills")
            pdf.body_text(", ".join(_safe(s) for s in matched))
        if missing:
            pdf.subsection("Missing Skills")
            pdf.body_text(", ".join(_safe(s) for s in missing))

    buf = BytesIO()
    pdf.output(buf)
    return buf.getvalue()
