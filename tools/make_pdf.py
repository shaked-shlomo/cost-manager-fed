#!/usr/bin/env python3
"""Build the submission PDF: team details + every code file.

Reused from the previous course's submission and adapted for this project.
Two preflight checks were added because the renderer fails silently in two
ways that are invisible until a human opens the graded document:
a character outside latin-1 becomes "?", and a line wider than the page is
clipped rather than wrapped, so its tail is simply lost.
"""
import os
import sys

from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

BASE = "/Users/shaked/Developer/clientside"
OUT = "/Users/shaked/Developer/clientside/shaked_shlomo.pdf"

PAGE = landscape(letter)          # 792 x 612
W, H = PAGE
M = 32                            # margin
CODE_FONT, CODE_SIZE, CODE_LEAD = "Courier", 8, 9.8
USABLE_W = W - 2 * M

# ----- content -----
TITLE = "Cost Manager Front End"
SUBTITLE = "Final Project in Front-End Development"
MANAGER = "Shaked Shlomo"
MEMBERS = [
    # first, last, id, mobile, email
    ("Shaked", "Shlomo", "322857525", "0503605445", "shlomoshaked5@gmail.com"),
    ("Muhammad", "Egbaria", "207929019", "0505890299", "egm621349@gmail.com"),
]

# Prerequisite P6. The build refuses to run while this is still the placeholder,
# because a missing or dead video link is a listed reject code (VIDEO, CLICKABLE)
# and it is the single easiest thing to forget at submission time.
VIDEO_URL = "PASTE_THE_UNLISTED_YOUTUBE_URL_HERE"

TOOLS = (
    "We used three collaboration tools throughout the project. Google Meet hosted our remote "
    "working sessions, where we walked through the requirements document together, agreed the "
    "design decisions, shared screens while debugging, and recorded the demonstration video. "
    "GitHub was our version control and code collaboration platform: we worked from one shared "
    "repository, committed our own work, and kept a full history of how the project developed. "
    "Slack kept us in day-to-day contact between sessions for quick questions, coordinating who "
    "was working on which part, and sharing links. Together these let us divide the work and "
    "stay synchronized while developing remotely."
)

# Code files, in a logical review order: build setup, then the library, then
# the application from the entry point outwards, then the standalone test files.
FILES = [
    "index.html",
    "vite.config.js",
    "package.json",
    "public/rates.json",
    "src/main.jsx",
    "src/App.jsx",
    "src/theme/theme.js",
    "src/db/constants.js",
    "src/db/db.js",
    "src/api/settings.js",
    "src/api/rates.js",
    "src/state/AppStateContext.jsx",
    "src/components/Layout/AppLayout.jsx",
    "src/components/Layout/RatesStatus.jsx",
    "src/components/Layout/ErrorBoundary.jsx",
    "src/components/common/ErrorMessage.jsx",
    "src/components/Forms/AddCostForm.jsx",
    "src/components/Forms/PeriodSelector.jsx",
    "src/components/Forms/SettingsForm.jsx",
    "src/components/Report/ReportView.jsx",
    "src/components/Report/ReportTable.jsx",
    "src/components/Charts/ChartsView.jsx",
    "src/components/Charts/CategoryPieChart.jsx",
    "src/components/Charts/MonthlyBarChart.jsx",
    "vanilla-test/db.js",
    "vanilla-test/test.html",
    "vanilla-test/selftest.js",
    "vanilla-test/selftest.html",
    "README.md",
]

# Courier 8pt on landscape letter fits 152 characters between the margins.
# 150 leaves a little room rather than sitting exactly on the boundary.
MAX_LINE = 150

PLACEHOLDER_VIDEO = "PASTE_THE_UNLISTED_YOUTUBE_URL_HERE"


def preflight():
    """Refuse to build until the source is safe for this renderer."""
    problems = []

    # A link that is still the placeholder would ship as a dead link.
    if VIDEO_URL == PLACEHOLDER_VIDEO and "--draft" not in sys.argv:
        problems.append(
            "VIDEO_URL is still the placeholder. Set it to the unlisted YouTube "
            "link, or pass --draft to build a copy for checking only."
        )

    for rel in FILES:
        path = os.path.join(BASE, rel)
        if not os.path.exists(path):
            problems.append(rel + " is listed in FILES but does not exist")
            continue
        with open(path, encoding="utf-8") as fh:
            for number, line in enumerate(fh.read().split("\n"), start=1):
                # A long line is clipped at the page edge, not wrapped, so the
                # rest of it silently disappears from the graded document.
                if len(line) > MAX_LINE:
                    problems.append(
                        "%s:%d is %d chars (max %d)" % (rel, number, len(line), MAX_LINE)
                    )
                # latin() replaces anything outside latin-1 with "?", which is
                # how an em dash became a question mark in the last submission.
                try:
                    line.encode("latin-1")
                except UnicodeEncodeError:
                    problems.append("%s:%d has a non latin-1 character" % (rel, number))

    if problems:
        for problem in problems:
            print(problem)
        raise SystemExit("preflight failed with %d problem(s)" % len(problems))
    print("preflight passed: %d files, all latin-1 and within %d columns"
          % (len(FILES), MAX_LINE))


preflight()

c = canvas.Canvas(OUT, pagesize=PAGE)
pageno = [1]


def latin(s):
    return s.encode("latin-1", "replace").decode("latin-1")


def footer():
    c.setFont("Helvetica", 7)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawCentredString(W / 2, 16, str(pageno[0]))
    c.setFillColorRGB(0, 0, 0)


def end_page():
    footer()
    c.showPage()
    pageno[0] += 1


# ---------- header page ----------
y = H - M - 6
c.setFont("Helvetica-Bold", 20)
c.drawString(M, y, TITLE)
y -= 22
c.setFont("Helvetica", 12)
c.setFillColorRGB(0.35, 0.35, 0.35)
c.drawString(M, y, SUBTITLE)
c.setFillColorRGB(0, 0, 0)
y -= 30

c.setFont("Helvetica-Bold", 13)
c.drawString(M, y, "Development Team Manager")
y -= 18
c.setFont("Helvetica", 12)
c.drawString(M + 12, y, MANAGER)
y -= 28

c.setFont("Helvetica-Bold", 13)
c.drawString(M, y, "Team Members")
y -= 20
c.setFont("Helvetica", 11)
for first, last, idn, mob, mail in MEMBERS:
    line = f"{first} {last}    |    ID: {idn}    |    Mobile: {mob}    |    Email: {mail}"
    c.drawString(M + 12, y, latin(line))
    y -= 17
y -= 14

c.setFont("Helvetica-Bold", 13)
c.drawString(M, y, "Project Demonstration Video")
y -= 18
c.setFont("Helvetica", 12)
label = "YouTube (unlisted): "
c.drawString(M + 12, y, label)
lx = M + 12 + c.stringWidth(label, "Helvetica", 12)
c.setFillColorRGB(0, 0, 0.8)
c.drawString(lx, y, VIDEO_URL)
uw = c.stringWidth(VIDEO_URL, "Helvetica", 12)
c.linkURL(VIDEO_URL, (lx, y - 3, lx + uw, y + 12), relative=0)
c.setFillColorRGB(0, 0, 0)
y -= 30

c.setFont("Helvetica-Bold", 13)
c.drawString(M, y, "Collaboration Tools (summary)")
y -= 18
c.setFont("Helvetica", 11)
for wl in simpleSplit(TOOLS, "Helvetica", 11, USABLE_W - 12):
    c.drawString(M + 12, y, latin(wl))
    y -= 15
y -= 18

c.setFont("Helvetica-Oblique", 9)
c.setFillColorRGB(0.4, 0.4, 0.4)
c.drawString(M, y, "The following pages contain all source code files of the project, each labeled with its path.")
c.setFillColorRGB(0, 0, 0)
end_page()

# ---------- project structure page ----------
BOTTOM = M + 6


def build_tree(paths):
    root = {}
    for p in paths:
        node = root
        for part in p.split("/"):
            node = node.setdefault(part, {})
    return root


def render_tree(node, prefix=""):
    out = []
    items = list(node.items())
    for i, (name, child) in enumerate(items):
        last = i == len(items) - 1
        connector = "`-- " if last else "|-- "
        out.append(prefix + connector + name + ("/" if child else ""))
        if child:
            out.extend(render_tree(child, prefix + ("    " if last else "|   ")))
    return out


tree_lines = ["cost-manager-fed/"] + render_tree(build_tree(FILES))
yy = H - M - 4
c.setFont("Helvetica-Bold", 14)
c.drawString(M, yy, "Project Structure")
yy -= 8
c.setStrokeColorRGB(0.7, 0.7, 0.7)
c.line(M, yy, W - M, yy)
c.setStrokeColorRGB(0, 0, 0)
yy -= 18
c.setFont("Courier", 9)
for tl in tree_lines:
    if yy < BOTTOM:
        end_page()
        yy = H - M - 4
        c.setFont("Courier", 9)
    c.drawString(M, yy, latin(tl))
    yy -= 10
end_page()

# ---------- code pages ----------
for rel in FILES:
    path = os.path.join(BASE, rel)
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().split("\n")

    def header(cont=False):
        yy = H - M - 4
        c.setFont("Helvetica-Bold", 11)
        suffix = "  (continued)" if cont else ""
        c.drawString(M, yy, latin(rel + suffix))
        yy -= 6
        c.setStrokeColorRGB(0.7, 0.7, 0.7)
        c.line(M, yy, W - M, yy)
        c.setStrokeColorRGB(0, 0, 0)
        return yy - 12

    yy = header(False)
    c.setFont(CODE_FONT, CODE_SIZE)
    for ln in lines:
        if yy < BOTTOM:
            end_page()
            yy = header(True)
            c.setFont(CODE_FONT, CODE_SIZE)
        c.drawString(M, yy, latin(ln.expandtabs(2)))
        yy -= CODE_LEAD
    end_page()

c.save()
print("wrote", OUT, "pages:", pageno[0] - 1)
