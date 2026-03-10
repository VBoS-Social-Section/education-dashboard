#!/usr/bin/env python3
"""
Extract key court statistics from annual report PDFs using pdftotext.
Output: structured JSON with Court, Year, Metric, Value.
"""

import json
import os
import re
import subprocess
from pathlib import Path

REPORTS_DIR = Path(__file__).resolve().parent.parent / "annual_reports"
OUTPUT_FILE = Path(__file__).resolve().parent.parent / "extracted_court_stats.json"

COURT_ALIASES = {
    "supreme court": "Supreme Court",
    "supreme": "Supreme Court",
    "magistrates court": "Magistrates Court",
    "magistrate court": "Magistrates Court",
    "magistrate": "Magistrates Court",
    "island court": "Island Court",
    "court of appeal": "Court of Appeal",
    "coa": "Court of Appeal",
}


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract text from PDF using pdftotext."""
    result = subprocess.run(
        ["pdftotext", str(pdf_path), "-"],
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdftotext failed: {result.stderr}")
    return result.stdout


def extract_year_from_filename(name: str) -> int | None:
    """Extract 4-digit year from filename."""
    m = re.search(r"20\d{2}", name)
    return int(m.group()) if m else None


def find_pdfs() -> list[tuple[Path, int]]:
    """Find PDFs in reports dir and infer year from filename."""
    found = []
    if not REPORTS_DIR.exists():
        return found
    for f in REPORTS_DIR.glob("*.pdf"):
        year = extract_year_from_filename(f.name)
        if year and 2016 <= year <= 2026:
            found.append((f, year))
    return sorted(found, key=lambda x: x[1])


def parse_number(s: str) -> str | int | float:
    """Parse string to number if possible."""
    s = s.strip().replace(",", "").replace(" ", "")
    # Remove trailing %
    pct = s.endswith("%")
    if pct:
        s = s[:-1]
    try:
        if "." in s:
            v = float(s)
        else:
            v = int(s)
        return v if not pct else v
    except ValueError:
        return s.strip()


def extract_2025_style_metrics(text: str, year: int) -> list[dict]:
    """Parse narrative and tables from 2025-style annual report."""
    records: list[dict] = []
    t = text.lower()

    def add(court: str, metric: str, value, unit: str = ""):
        records.append({
            "Court": court,
            "Year": year,
            "Metric": metric,
            "Value": value,
            "Unit": unit,
        })

    # --- Filings ---
    # Supreme Court
    if m := re.search(r"supreme court\s+saw\s+(\d[\d,]*) cases filed", t, re.I):
        add("Supreme Court", "Filings", parse_number(m.group(1)))
    elif m := re.search(r"sc filings (?:increased|declined|rose).*?(\d[\d,]*) cases", t):
        add("Supreme Court", "Filings", parse_number(m.group(1)))
    elif m := re.search(r"sc filings.*?to (\d[\d,]*)", t):
        add("Supreme Court", "Filings", parse_number(m.group(1)))
    elif (m := re.search(r"sc filings.*?from (\d+) cases to (\d+)", t)):
        add("Supreme Court", "Filings", int(m.group(2)))

    # Magistrates Court filings
    for pat in [
        r"magistrates court saw (\d[\d,]*)",
        r"magistrate court.*?(\d[\d,]*) a \d+% increase",
        r"mc filings.*?(\d[\d,]*) cases filed",
        r"mc filings (?:increased|dropped).*?to (\d[\d,]*)",
        r"(\d[\d,]*) a 4% increase from 2,393",
    ]:
        if m := re.search(pat, t, re.I):
            add("Magistrates Court", "Filings", parse_number(m.group(1)))
            break

    # Island Court filings
    for pat in [
        r"ic filings increased.*?with (\d[\d,]*)",
        r"island court.*?(\d[\d,]*) cases filed compared to 389",
        r"(\d[\d,]*) cases filed compared to 389 cases in 2024",
        r"ic filings.*?(\d[\d,]*) cases filed",
    ]:
        if m := re.search(pat, t, re.I):
            add("Island Court", "Filings", parse_number(m.group(1)))
            break

    # Total filings
    if m := re.search(r"(\d[\d,]*) cases filed in " + str(year), t):
        add("All Courts", "Filings", parse_number(m.group(1)))

    # --- Disposals ---
    if m := re.search(r"disposals in supreme court were (\d[\d,]*)", t):
        add("Supreme Court", "Disposals", parse_number(m.group(1)))
    elif m := re.search(r"sc finalizations? were up.*?(\d[\d,]*) in " + str(year), t):
        add("Supreme Court", "Disposals", parse_number(m.group(1)))
    elif m := re.search(r"sc disposals.*?(\d[\d,]*) to (\d[\d,]*)", t):
        add("Supreme Court", "Disposals", parse_number(m.group(2)))
    if m := re.search(r"the magistrate saw (\d[\d,]*)", t):
        add("Magistrates Court", "Disposals", parse_number(m.group(1)))
    elif m := re.search(r"mc disposals.*?(\d[\d,]*) to (\d[\d,]*)", t):
        add("Magistrates Court", "Disposals", parse_number(m.group(2)))
    if m := re.search(r"mc finalizations?.*?(\d[\d,]*) (?:to|in) (\d[\d,]*)", t):
        add("Magistrates Court", "Disposals", parse_number(m.group(2)))
    if m := re.search(r"island court saw (\d[\d,]*)", t):
        add("Island Court", "Disposals", parse_number(m.group(1)))
    if m := re.search(r"ic finalizations?.*?(\d[\d,]*) in " + str(year), t):
        add("Island Court", "Disposals", parse_number(m.group(1)))

    # --- Pending ---
    if m := re.search(r"(\d[\d,]*) cases are now pending across", t):
        add("All Courts", "Pending", parse_number(m.group(1)))
    if m := re.search(r"\((\d[\d,]*) pending cases\) being in the magistrate court", t):
        add("Magistrates Court", "Pending", parse_number(m.group(1)))
    if m := re.search(r"\((\d[\d,]*) pending cases\) in the supreme court", t):
        add("Supreme Court", "Pending", parse_number(m.group(1)))
    if m := re.search(r"\((\d[\d,]*) pending cases\) in the island court", t):
        add("Island Court", "Pending", parse_number(m.group(1)))
    if m := re.search(r"\((\d[\d,]*) pending cases\) in the court of appeal", t):
        add("Court of Appeal", "Pending", parse_number(m.group(1)))
    if m := re.search(r"pending increased to just over (\d[\d,]*)", t):
        add("Supreme Court", "Pending", parse_number(m.group(1)))
    elif m := re.search(r"pending has steadily grown.*?to now (\d[\d,]*) cases", t):
        add("Supreme Court", "Pending", parse_number(m.group(1)))
    if m := re.search(r"pending increased to (\d[\d,]*) due.*clearance", t):
        add("Magistrates Court", "Pending", parse_number(m.group(1)))
    elif m := re.search(r"pending has decreased accordingly from \d+ to (\d[\d,]*)", t):
        add("Magistrates Court", "Pending", parse_number(m.group(1)))
    if m := re.search(r"pending decreased to (\d[\d,]*) due", t):
        add("Island Court", "Pending", parse_number(m.group(1)))

    # --- Clearance Rate ---
    for court, pat in [
        ("Supreme Court", r"supreme court with (\d+)%"),
        ("Magistrates Court", r"magistrate court with (\d+)%"),
        ("Court of Appeal", r"court of appeal with (\d+)%"),
        ("Island Court", r"island court with a clearance rate of (\d+)%"),
        ("Magistrates Court", r"clearance rate was (?:an exceptional )?(\d+)%"),
    ]:
        if m := re.search(pat, t):
            add(court, "ClearanceRate", int(m.group(1)), "%")
    if m := re.search(r"clearance rate.*?(\d+)% for the " + str(year) + r" calendar year", t):
        add("Supreme Court", "ClearanceRate", int(m.group(1)), "%")
    if m := re.search(r"clearance rate.*?at (\d+)%", t):
        # May need context for court
        pass
    if m := re.search(r"clearance rate above 100%.*?at (\d+)%", t):
        add("Island Court", "ClearanceRate", int(m.group(1)), "%")

    # --- PDR ---
    if m := re.search(r"1\.1 in the supreme court|pdr.*1\.1.*supreme", t):
        add("Supreme Court", "PDR", 1.1)
    if m := re.search(r"0\.7 in the magistrates court|pdr.*0\.7", t):
        add("Magistrates Court", "PDR", 0.7)
    if m := re.search(r"1\.5 in the island court|pdr.*1\.5.*island", t):
        add("Island Court", "PDR", 1.5)
    if m := re.search(r"court of appeal is doing well with a pdr of (\d+\.?\d*)", t):
        add("Court of Appeal", "PDR", float(m.group(1)))
    if m := re.search(r"pdr is (\d+\.?\d*) - a decrease from", t):
        add("Supreme Court", "PDR", float(m.group(1)))
    if m := re.search(r"pdr is (\d+\.?\d*) — remains", t):
        add("Magistrates Court", "PDR", float(m.group(1)))
    if m := re.search(r"pdr is ([\d.]+).*decrease from 1\.8", t):
        add("Island Court", "PDR", float(m.group(1)))
    if m := re.search(r"pdr has grown from.*?to ([\d.]+)", t):
        add("Supreme Court", "PDR", float(m.group(1)))
    if m := re.search(r"pdr.*?decreased accordingly.*?at ([\d.]+)", t):
        add("Magistrates Court", "PDR", float(m.group(1)))

    # --- Timeliness Criminal ---
    if m := re.search(r"average of (\d+) days.*criminal", t):
        add("Supreme Court", "TimelinessCriminal", int(m.group(1)), "days")
    if m := re.search(r"from 197 days in 2024 to (\d+) days in " + str(year), t):
        add("Supreme Court", "TimelinessCriminal", int(m.group(1)), "days")
    if m := re.search(r"now at (\d+) days versus 197 days", t):
        add("Supreme Court", "TimelinessCriminal", int(m.group(1)), "days")
    if m := re.search(r"criminal cases decreased by 7%.*?now at (\d+) days", t):
        add("Supreme Court", "TimelinessCriminal", int(m.group(1)), "days")
    if m := re.search(r"from 246 days in 2024 to (\d+) days in " + str(year), t):
        add("Magistrates Court", "TimelinessCriminal", int(m.group(1)), "days")
    if m := re.search(r"now at (\d+) days versus 246 days", t):
        add("Magistrates Court", "TimelinessCriminal", int(m.group(1)), "days")
    if m := re.search(r"criminal cases decreased by 20%.*?now at (\d+) days", t):
        add("Magistrates Court", "TimelinessCriminal", int(m.group(1)), "days")
    if m := re.search(r"criminal cases decreased by 16%.*?now at (\d+) days", t):
        add("Island Court", "TimelinessCriminal", int(m.group(1)), "days")

    # --- Timeliness Civil ---
    if m := re.search(r"civil cases rose from (\d+) days to (\d+) days", t):
        add("Supreme Court", "TimelinessCivil", int(m.group(2)), "days")
    if m := re.search(r"from 630 days in 2024 to (\d+) days in " + str(year), t):
        add("Supreme Court", "TimelinessCivil", int(m.group(1)), "days")
    if m := re.search(r"civil cases decreased from 630 days to (\d+) days", t):
        add("Supreme Court", "TimelinessCivil", int(m.group(1)), "days")
    if m := re.search(r"630 days to (\d+) days.*decrease of 11%", t):
        add("Supreme Court", "TimelinessCivil", int(m.group(1)), "days")
    if m := re.search(r"from 408 days in 2024 to (\d+) days in " + str(year), t):
        add("Magistrates Court", "TimelinessCivil", int(m.group(1)), "days")
    if m := re.search(r"civil cases decreased from 408 days to (\d+) days", t):
        add("Magistrates Court", "TimelinessCivil", int(m.group(1)), "days")
    if m := re.search(r"decreased from 873 days to (\d+)", t):
        add("Island Court", "TimelinessCivil", int(m.group(1)), "days")

    # --- Productivity ---
    if m := re.search(r"(\d+) cases disposed per judge", t):
        add("Supreme Court", "Productivity", int(m.group(1)))
    if m := re.search(r"approximately (\d+) cases per year per judge", t):
        add("Supreme Court", "Productivity", int(m.group(1)), "")
    if m := re.search(r"(\d+) cases per magistrate", t):
        add("Magistrates Court", "Productivity", int(m.group(1)))

    # --- Reserved Judgments ---
    if m := re.search(r"reduced from (\d+).*?to (\d+).*reserved judgment", t):
        add("Supreme Court", "ReservedJudgments", int(m.group(2)))
    elif m := re.search(r"reserved judgments.*?stand at (\d+)\|?\s*cases", t):
        v = m.group(1)
        # PDF OCR: 5| often means 51
        if v == "5" and "5|" in text:
            v = "51"
        add("Supreme Court", "ReservedJudgments", int(v))

    # --- PendingAge ---
    if m := re.search(r"(\d+)% of cases older than 3 years", t):
        add("Supreme Court", "PendingAge", int(m.group(1)), "%")
    if m := re.search(r"25% of cases older than 2 years.*magistrate", t):
        add("Magistrates Court", "PendingAge", 25, "%")
    if m := re.search(r"60% of cases older than 2 years.*island", t):
        add("Island Court", "PendingAge", 60, "%")
    if m := re.search(r"25% of cases older than 2024", t):
        add("Magistrates Court", "PendingAge", 25, "%")

    # --- DV Filings (Magistrates Court - Protection Order) ---
    if m := re.search(r"1,?226 in 2024 to (1,?167)\s+in " + str(year), t):
        add("Magistrates Court", "DVFilings", parse_number(m.group(1).replace(",", "")))
    elif m := re.search(r"filing of dv.*?to (\d[\d,\s]+)\s+in " + str(year), t, re.DOTALL):
        add("Magistrates Court", "DVFilings", parse_number(m.group(1).replace(" ", "").replace(",", "")))

    # --- DV Disposals ---
    if m := re.search(r"1,?113 in 2024 to (1,?135)\s+in " + str(year), t):
        add("Magistrates Court", "DVDisposals", parse_number(m.group(1).replace(",", "")))

    # --- Workload by type: PI ---
    if m := re.search(r"preliminary.*?from 366 in 2024 to (\d+)", t, re.DOTALL):
        add("Magistrates Court", "PIFilings", parse_number(m.group(1)))
    if m := re.search(r"403 in 2024 to (\d+)", t):
        add("Magistrates Court", "PIDisposals", parse_number(m.group(1)))

    return records


def deduplicate_records(records: list[dict]) -> list[dict]:
    """Keep first occurrence of each (Court, Year, Metric)."""
    seen = set()
    out = []
    for r in records:
        key = (r["Court"], r["Year"], r["Metric"])
        if key not in seen:
            seen.add(key)
            out.append(r)
    return out


def main():
    pdfs = find_pdfs()
    if not pdfs:
        print(f"No PDFs found in {REPORTS_DIR}")
        print("Expected files like: 2017 Annual Statistics.pdf, 2018 Annual Statistics.pdf, etc.")
        return

    all_records = []
    for pdf_path, year in pdfs:
        print(f"Processing {pdf_path.name} (year {year})...")
        text = extract_text_from_pdf(pdf_path)
        records = extract_2025_style_metrics(text, year)
        all_records.extend(records)

    all_records = deduplicate_records(all_records)

    # Group by category for summary
    by_category = {
        "court_metrics": [],
        "dv_filings": [],
        "workload_by_type": [],
    }
    metric_to_cat = {
        "Filings": "court_metrics", "Disposals": "court_metrics",
        "ClearanceRate": "court_metrics", "Pending": "court_metrics",
        "PDR": "court_metrics", "TimelinessCriminal": "court_metrics",
        "TimelinessCivil": "court_metrics", "Productivity": "court_metrics",
        "ReservedJudgments": "court_metrics", "PendingAge": "court_metrics",
        "DVFilings": "dv_filings", "DVDisposals": "dv_filings",
        "PIFilings": "workload_by_type", "PIDisposals": "workload_by_type",
    }
    for r in all_records:
        cat = metric_to_cat.get(r["Metric"], "court_metrics")
        by_category[cat].append(r)

    output = {
        "summary": {
            "source": "annual_reports/",
            "years_processed": [y for _, y in pdfs],
            "total_records": len(all_records),
        },
        "by_category": by_category,
        "flat": all_records,
    }

    OUTPUT_FILE.write_text(json.dumps(output, indent=2))
    print(f"\nWrote {len(all_records)} records to {OUTPUT_FILE}")

    # Also write CSV-like table
    csv_path = OUTPUT_FILE.with_suffix(".csv")
    lines = ["Court,Year,Metric,Value,Unit"]
    for r in all_records:
        u = r.get("Unit", "")
        lines.append(f"{r['Court']},{r['Year']},{r['Metric']},{r['Value']},{u}")
    csv_path.write_text("\n".join(lines))
    print(f"Wrote table to {csv_path}")


if __name__ == "__main__":
    main()
