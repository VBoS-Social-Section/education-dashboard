#!/usr/bin/env python3
"""
Extract education statistics from MoET annual report PDFs.
Looks in ./annual report or ./annual_reports for PDFs.
Output: data/education_*.csv and public/data/*.csv for dashboard.
"""

import csv
import json
import os
import re
import subprocess
from pathlib import Path

# Support both "annual report" and "annual_reports"
ROOT = Path(__file__).resolve().parent.parent
REPORTS_DIRS = [
    ROOT / "annual report",
    ROOT / "annual_reports",
]
DATA_DIR = ROOT / "data"
PUBLIC_DATA = ROOT / "public" / "data"

SCHOOL_TYPES = ["ECCE", "Primary", "Secondary", "Senior Secondary", "Total"]


def find_reports_dir() -> Path | None:
    for d in REPORTS_DIRS:
        if d.exists():
            return d
    return None


def extract_text_from_pdf(pdf_path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", "-layout", str(pdf_path), "-"],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        raise RuntimeError(f"pdftotext failed: {result.stderr}")
    return result.stdout


def extract_year_from_path(path: Path) -> int | None:
    """Extract 4-digit year from path (folder or filename)."""
    m = re.search(r"20\d{2}", str(path))
    return int(m.group()) if m else None


def find_pdfs() -> list[tuple[Path, int]]:
    found = []
    reports_dir = find_reports_dir()
    if not reports_dir:
        return found

    # Check subfolders (e.g. annual_reports/2024/*.pdf)
    for sub in reports_dir.iterdir():
        if sub.is_dir():
            year = extract_year_from_path(sub)
            if year and 2015 <= year <= 2030:
                for f in sub.glob("*.pdf"):
                    found.append((f, year))
        elif sub.suffix.lower() == ".pdf":
            year = extract_year_from_path(sub)
            if year and 2015 <= year <= 2030:
                found.append((sub, year))

    # Also check root of reports dir
    for f in reports_dir.glob("*.pdf"):
        year = extract_year_from_path(f)
        if year and 2015 <= year <= 2030:
            found.append((f, year))

    # Dedupe by year (keep first found)
    seen_years = set()
    unique = []
    for path, year in sorted(found, key=lambda x: (x[1], str(x[0]))):
        if year not in seen_years:
            seen_years.add(year)
            unique.append((path, year))
    return sorted(unique, key=lambda x: x[1])


def parse_number(s: str) -> str | int | float:
    s = str(s).strip().replace(",", "").replace(" ", "").replace("%", "")
    if not s:
        return ""
    try:
        if "." in s:
            return float(s)
        return int(s)
    except ValueError:
        return s


def _parse_year_range(block: str) -> list[int]:
    """Extract year range from table header, e.g. '2017 – 2019' -> [2017,2018,2019]."""
    m = re.search(r"(\d{4})\s*[–\-]\s*(\d{4})", block)
    if m:
        lo, hi = int(m.group(1)), int(m.group(2))
        return list(range(lo, hi + 1))
    years = re.findall(r"20\d{2}", block)
    return [int(y) for y in years]


def extract_tables_simple(text: str, year: int) -> list[dict]:
    """Extract enrolment, schools, teachers from summary tables using regex."""
    records = []
    t = text

    def add(inst: str, metric: str, value, unit: str = ""):
        if value != "" and value is not None and value != 0:
            records.append({
                "Institution": inst,
                "Year": year,
                "Metric": metric,
                "Value": value,
                "Unit": unit,
            })

    def parse_table_block(block: str, metric: str, types_and_patterns: list) -> None:
        years_list = _parse_year_range(block)
        year_idx = years_list.index(year) if year in years_list else (len(years_list) - 1 if years_list else -1)
        for stype, patterns in types_and_patterns:
            for pat in patterns:
                m = re.search(pat, block, re.MULTILINE | re.IGNORECASE)
                if m:
                    nums = [parse_number(x) for x in re.findall(r"[\d,]+", m.group(1))]
                    nums = [n for n in nums if isinstance(n, (int, float))]
                    if year_idx >= 0 and year_idx < len(nums):
                        add(stype, metric, nums[year_idx])
                    elif nums:
                        add(stype, metric, nums[-1])
                    break

    # Table 1: Enrolment - find block with actual data (ECCE + comma numbers, skip TOC)
    table1 = None
    for m in re.finditer(r"Table 1:.*?enrolment.*?school type.*?(?=Table 2:|Table 3:|Source:|\n\n\n)", t, re.DOTALL | re.IGNORECASE):
        if re.search(r"ECCE\s+[\d,]+", m.group(0)):
            table1 = m
            break
    if table1:
        block = table1.group(0)
        parse_table_block(block, "Enrolment", [
            ("ECCE", [r"^\s*ECCE\s+([\d,\s]+)"]),
            ("Primary", [r"Primary(?:\s*\([^)]+\))?\s+([\d,\s]+)", r"Primary School(?:\s*\([^)]+\))?\s+([\d,\s]+)"]),
            ("Secondary", [r"Secondary(?:\s*\([^)]+\))?\s+([\d,\s]+)", r"Secondary School(?:\s*\([^)]+\))?\s+([\d,\s]+)"]),
            ("Senior Secondary", [r"Senior Secondary(?:\s*\([^)]+\))?\s+([\d,\s]+)"]),
            ("Total", [r"^\s*Total\s+([\d,\s]+)"]),
        ])

    # Table 3: Schools - find block with actual data (skip TOC; ECCE schools < 2000)
    table3 = None
    for m in re.finditer(r"Table 3:.*?number of schools.*?(?=Table 4:|Source:|\n\n\n)", t, re.DOTALL | re.IGNORECASE):
        block = m.group(0)
        ecce_match = re.search(r"ECCE\s+([\d,\s]+)", block)
        if ecce_match:
            nums = [parse_number(x) for x in re.findall(r"[\d,]+", ecce_match.group(1))]
            nums = [n for n in nums if isinstance(n, (int, float))]
            if nums and max(nums) < 2000:  # Schools count, not enrolment
                table3 = m
                break
    if table3:
        block = table3.group(0)
        parse_table_block(block, "Schools", [
            ("ECCE", [r"^\s*ECCE\s+([\d,\s]+)"]),
            ("Primary", [r"Primary School(?:\s*\([^)]+\))?\s+([\d,\s]+)", r"Primary(?:\s*\([^)]+\))?\s+([\d,\s]+)"]),
            ("Secondary", [r"Secondary School(?:\s*\([^)]+\))?\s+([\d,\s]+)", r"Secondary(?:\s*\([^)]+\))?\s+([\d,\s]+)"]),
            ("Total", [r"^\s*Total\s+([\d,\s]+)"]),
        ])

    # Table 4: Teachers - find block with actual data (ECCE teachers ~1000-1500)
    table4 = None
    for m in re.finditer(r"Table 4:.*?number of teachers.*?(?=Table 5:|Table 6:|1\. STUDENT|Source:|\n\n\n)", t, re.DOTALL | re.IGNORECASE):
        block = m.group(0)
        ecce_match = re.search(r"ECCE\s+([\d,\s]+)", block)
        if ecce_match:
            nums = [parse_number(x) for x in re.findall(r"[\d,]+", ecce_match.group(1))]
            nums = [n for n in nums if isinstance(n, (int, float))]
            if nums and 500 < max(nums) < 5000:  # Teachers count
                table4 = m
                break
    if table4:
        block = table4.group(0)
        parse_table_block(block, "Teachers", [
            ("ECCE", [r"^\s*ECCE\s+([\d,\s]+)"]),
            ("Primary", [r"Primary(?:\s*\([^)]+\))?\s+([\d,\s]+)", r"Primary School(?:\s*\([^)]+\))?\s+([\d,\s]+)"]),
            ("Secondary", [r"Secondary(?:\s*\([^)]+\))?\s+([\d,\s]+)", r"Secondary School(?:\s*\([^)]+\))?\s+([\d,\s]+)"]),
            ("Total", [r"^\s*Total\s+([\d,\s]+)"]),
        ])

    # Gross Enrolment Rate (GER) by school type - find block with actual data (has year row with %)
    table27 = None
    for m in re.finditer(r"Table \d+:.*?Gross Enrolment Rate \(GER\).*?school type and sex.*?(?=Table \d+:|Source:|\n\n\n)", t, re.DOTALL | re.IGNORECASE):
        if re.search(r"20\d{2}\s+[\d.]+%", m.group(0)):  # Has data row
            table27 = m
            break
    if table27:
        block = table27.group(0)
        # Match rows: 2022  88.6%  89.5%  89.0%  1.01  119.1%  116.9%  118.0%  0.98  49.9%  57.1%  53.4%  1.14
        for row in re.finditer(r"(20\d{2})\s+([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.]+)", block):
            yr = int(row.group(1))
            if yr != year:
                continue
            e_total, e_gpi = parse_number(row.group(4)), parse_number(row.group(5))
            p_total, p_gpi = parse_number(row.group(8)), parse_number(row.group(9))
            s_total, s_gpi = parse_number(row.group(12)), parse_number(row.group(13))
            if isinstance(e_total, (int, float)):
                add("ECCE", "GER", e_total, "%")
            if isinstance(e_gpi, (int, float)) and 0.5 < e_gpi < 2:
                add("ECCE", "GPI", e_gpi)
            if isinstance(p_total, (int, float)):
                add("Primary", "GER", p_total, "%")
            if isinstance(p_gpi, (int, float)) and 0.5 < p_gpi < 2:
                add("Primary", "GPI", p_gpi)
            if isinstance(s_total, (int, float)):
                add("Secondary", "GER", s_total, "%")
            if isinstance(s_gpi, (int, float)) and 0.5 < s_gpi < 2:
                add("Secondary", "GPI", s_gpi)

    # Net Enrolment Rate (NER) by school type - must match "by school type in" (not "for each province in")
    table28 = None
    for m in re.finditer(r"Table \d+: Net Enrolment Rate \(NER\) and Gender Parity Index \(GPI\) by school type in \d{4} - \d{4}.*?(?=Table \d+:|Source:|\n\n\n)", t, re.DOTALL | re.IGNORECASE):
        if re.search(r"20\d{2}\s+[\d.]+%", m.group(0)):
            table28 = m
            break
    if table28:
        block = table28.group(0)
        for row in re.finditer(r"(20\d{2})\s+([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)\s+([\d.]+)", block):
            yr = int(row.group(1))
            if yr != year:
                continue
            e_total, e_gpi = parse_number(row.group(4)), parse_number(row.group(5))
            p_total, p_gpi = parse_number(row.group(8)), parse_number(row.group(9))
            s_total, s_gpi = parse_number(row.group(12)), parse_number(row.group(13))
            if isinstance(e_total, (int, float)):
                add("ECCE", "NER", e_total, "%")
            if isinstance(e_gpi, (int, float)) and 0.5 < e_gpi < 2:
                add("ECCE", "NER_GPI", e_gpi)
            if isinstance(p_total, (int, float)):
                add("Primary", "NER", p_total, "%")
            if isinstance(p_gpi, (int, float)) and 0.5 < p_gpi < 2:
                add("Primary", "NER_GPI", p_gpi)
            if isinstance(s_total, (int, float)):
                add("Secondary", "NER", s_total, "%")
            if isinstance(s_gpi, (int, float)) and 0.5 < s_gpi < 2:
                add("Secondary", "NER_GPI", s_gpi)

    # Teachers by sex/gender - find block with Male/Female ECCE data
    teachers_sex = None
    for m in re.finditer(r"Table \d+:.*?teachers by (?:sex|gender).*?in each school type.*?(?=Table \d+:|Source:|\n\n\n)", t, re.DOTALL | re.IGNORECASE):
        if re.search(r"Male\s+ECCE\s+[\d,]+", m.group(0)):
            teachers_sex = m
            break
    if teachers_sex:
        block = teachers_sex.group(0)
        years_list = _parse_year_range(block)
        year_idx = years_list.index(year) if year in years_list else (len(years_list) - 1 if years_list else -1)
        if year_idx >= 0:
            # Split at Female to get Male block only
            parts = re.split(r"\bFemale\b", block, maxsplit=1, flags=re.IGNORECASE)
            male_block = parts[0] if parts else block
            female_block = parts[1] if len(parts) > 1 else ""
            # Male ECCE, Primary, Secondary
            m_ecce = re.search(r"Male\s+ECCE\s+([\d,\s]+)", male_block, re.IGNORECASE)
            if m_ecce:
                nums = [parse_number(x) for x in re.findall(r"[\d,]+", m_ecce.group(1))]
                nums = [n for n in nums if isinstance(n, (int, float))]
                if year_idx < len(nums):
                    add("ECCE", "Teachers_Male", nums[year_idx])
            m_primary = re.search(r"Primary\s+school\s+(?:\([^)]+\)\s+)?([\d,\s]+)", male_block, re.IGNORECASE)
            if m_primary:
                nums = [parse_number(x) for x in re.findall(r"[\d,]+", m_primary.group(1))]
                nums = [n for n in nums if isinstance(n, (int, float))]
                if year_idx < len(nums):
                    add("Primary", "Teachers_Male", nums[year_idx])
            m_sec = re.search(r"Secondary\s+school\s+(?:\([^)]+\)\s+)?([\d,\s]+)", male_block, re.IGNORECASE)
            if m_sec:
                nums = [parse_number(x) for x in re.findall(r"[\d,]+", m_sec.group(1))]
                nums = [n for n in nums if isinstance(n, (int, float))]
                if year_idx < len(nums):
                    add("Secondary", "Teachers_Male", nums[year_idx])
            # Female ECCE, Primary, Secondary
            if female_block:
                f_ecce = re.search(r"ECCE\s+([\d,\s]+)", female_block, re.IGNORECASE)
                if f_ecce:
                    nums = [parse_number(x) for x in re.findall(r"[\d,]+", f_ecce.group(1))]
                    nums = [n for n in nums if isinstance(n, (int, float))]
                    if year_idx < len(nums):
                        add("ECCE", "Teachers_Female", nums[year_idx])
                f_primary = re.search(r"Primary\s+school\s+(?:\([^)]+\)\s+)?([\d,\s]+)", female_block, re.IGNORECASE)
                if f_primary:
                    nums = [parse_number(x) for x in re.findall(r"[\d,]+", f_primary.group(1))]
                    nums = [n for n in nums if isinstance(n, (int, float))]
                    if year_idx < len(nums):
                        add("Primary", "Teachers_Female", nums[year_idx])
                f_sec = re.search(r"Secondary\s+school\s+(?:\([^)]+\)\s+)?([\d,\s]+)", female_block, re.IGNORECASE)
                if f_sec:
                    nums = [parse_number(x) for x in re.findall(r"[\d,]+", f_sec.group(1))]
                    nums = [n for n in nums if isinstance(n, (int, float))]
                    if year_idx < len(nums):
                        add("Secondary", "Teachers_Female", nums[year_idx])

    # Student-Teacher Ratio - Table 69 (2024) or 61 (2022)
    str_section = re.search(
        r"Student [Tt]eacher [Rr]atio \(STR\).*?(?=Table \d+:|Source:|\Z)",
        t,
        re.DOTALL | re.IGNORECASE,
    )
    if str_section:
        block = str_section.group(0)
        # Find STR table - format varies, look for ECCE/Primary/Secondary with ratio
        for stype in ["ECCE", "Primary", "Secondary"]:
            m = re.search(rf"{re.escape(stype)}\s+([\d.]+)", block, re.IGNORECASE)
            if m:
                val = parse_number(m.group(1))
                if isinstance(val, (int, float)) and 1 < val < 200:  # Sanity check
                    add(stype, "StudentTeacherRatio", val)

    return records


def deduplicate(records: list[dict]) -> list[dict]:
    seen = set()
    out = []
    for r in records:
        key = (r["Institution"], r["Year"], r["Metric"])
        if key not in seen:
            seen.add(key)
            out.append(r)
    return out


def main():
    reports_dir = find_reports_dir()
    if not reports_dir:
        print(f"No reports folder found. Tried: {[str(d) for d in REPORTS_DIRS]}")
        print("Create 'annual report' or 'annual_reports' and add PDF reports.")
        return

    pdfs = find_pdfs()
    if not pdfs:
        print(f"No PDFs found in {reports_dir}")
        return

    all_records = []
    for pdf_path, year in pdfs:
        print(f"Processing {pdf_path.name} (year {year})...")
        try:
            text = extract_text_from_pdf(pdf_path)
            records = extract_tables_simple(text, year)
            all_records.extend(records)
        except Exception as e:
            print(f"  Error: {e}")

    all_records = deduplicate(all_records)

    if not all_records:
        print("No records extracted (pdftotext may be missing in CI). Keeping existing data.")
        return

    # Write education_metrics.csv (Court -> Institution for compatibility)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    metrics_path = DATA_DIR / "education_metrics.csv"
    with open(metrics_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["Institution", "Year", "Metric", "Value", "Unit"])
        w.writeheader()
        for r in all_records:
            w.writerow(r)
    print(f"Wrote {len(all_records)} records to {metrics_path}")

    # Also write Court,Year,Metric,Value,Unit for dashboard compatibility
    compat_path = DATA_DIR / "education_metrics_compat.csv"
    with open(compat_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Court", "Year", "Metric", "Value", "Unit"])
        for r in all_records:
            w.writerow([r["Institution"], r["Year"], r["Metric"], r["Value"], r["Unit"]])
    print(f"Wrote compat format to {compat_path}")

    # Generate yearly CSVs for dashboard
    PUBLIC_DATA.mkdir(parents=True, exist_ok=True)
    years = sorted(set(r["Year"] for r in all_records))
    for year in years:
        rows = [r for r in all_records if r["Year"] == year]
        out_path = PUBLIC_DATA / f"{year}.csv"
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["Court", "Year", "Metric", "Value", "Unit"])
            for r in rows:
                w.writerow([r["Institution"], r["Year"], r["Metric"], r["Value"], r["Unit"]])
        print(f"  Wrote {out_path} ({len(rows)} rows)")

    # years.json
    manifest = {"years": years, "lastUpdated": __import__("datetime").datetime.now().isoformat()[:10]}
    with open(PUBLIC_DATA / "years.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote public/data/years.json: {years}")


if __name__ == "__main__":
    main()
