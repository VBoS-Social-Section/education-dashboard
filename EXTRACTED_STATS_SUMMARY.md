# Court Statistics Extraction Summary

**Source:** PDFs in `annual_reports/` (2017–2025)  
**Method:** `pdftotext` + regex parsing via `scripts/extract_pdf_stats.py`

## Note on Charge Orders

The requested **charge_orders** metric was not found in the annual report PDFs. The existing `data/charge_orders.csv` in this project comes from another data source.

## Extracted Records

| Court | Year | Metric | Value | Unit |
|-------|------|--------|-------|------|
| Supreme Court | 2017 | Filings | 689 | |
| Supreme Court | 2017 | Disposals | 693 | |
| Magistrates Court | 2017 | Filings | 2065 | |
| Magistrates Court | 2017 | Disposals | 2478 | |
| Magistrates Court | 2017 | Pending | 910 | |
| Magistrates Court | 2017 | ClearanceRate | 120 | % |
| Supreme Court | 2017 | PDR | 1.7 | |
| Magistrates Court | 2017 | PDR | 0.4 | |
| Supreme Court | 2018 | Filings | 712 | |
| Supreme Court | 2018 | Disposals | 717 | |
| Supreme Court | 2018 | PDR | 1.7 | |
| Supreme Court | 2019 | Filings | 766 | |
| Supreme Court | 2019 | Disposals | 710 | |
| Supreme Court | 2019 | ClearanceRate | 97 | % |
| Supreme Court | 2019 | PDR | 1.7 | |
| Supreme Court | 2019 | TimelinessCivil | 767 | days |
| Supreme Court | 2019 | Productivity | 90 | |
| Supreme Court | 2020 | Filings | 866 | |
| Supreme Court | 2020 | Disposals | 709 | |
| Magistrates Court | 2020 | Filings | 2231 | |
| Magistrates Court | 2020 | Disposals | 2278 | |
| Magistrates Court | 2020 | Pending | 614 | |
| Magistrates Court | 2020 | PDR | 0.7 | |
| All Courts | 2021 | Pending | 2387 | |
| Magistrates Court | 2021 | Productivity | 273 | |
| Island Court | 2022 | Filings | 345 | |
| All Courts | 2022 | Pending | 2465 | |
| All Courts | 2023 | Pending | 2949 | |
| Magistrates Court | 2023 | PDR | 0.7 | |
| All Courts | 2024 | Pending | 3113 | |
| Magistrates Court | 2024 | PDR | 0.7 | |
| Supreme Court | 2025 | Filings | 958 | |
| Supreme Court | 2025 | Disposals | 933 | |
| Supreme Court | 2025 | Productivity | 109 | |
| Supreme Court | 2025 | ReservedJudgments | 51 | |
| Magistrates Court | 2025 | Filings | 2492 | |
| Magistrates Court | 2025 | Disposals | 2215 | |
| Magistrates Court | 2025 | Pending | 1536 | |
| Magistrates Court | 2025 | ClearanceRate | 89 | % |
| Magistrates Court | 2025 | PDR | 0.7 | |
| Magistrates Court | 2025 | TimelinessCriminal | 197 | days |
| Magistrates Court | 2025 | Productivity | 269 | |
| Magistrates Court | 2025 | DVFilings | 1167 | |
| Magistrates Court | 2025 | DVDisposals | 1135 | |
| Magistrates Court | 2025 | PIFilings | 400 | |
| Magistrates Court | 2025 | PIDisposals | 320 | |
| Island Court | 2025 | Filings | 399 | |
| Island Court | 2025 | Disposals | 418 | |
| Island Court | 2025 | Pending | 622 | |
| Island Court | 2025 | TimelinessCivil | 524 | days |
| Court of Appeal | 2025 | Pending | 26 | |
| Court of Appeal | 2025 | ClearanceRate | 93 | % |
| All Courts | 2025 | Filings | 3932 | |
| All Courts | 2025 | Pending | 3227 | |

## Output Files

- **`extracted_court_stats.json`** – Full structured data with `by_category` and `flat`
- **`extracted_court_stats.csv`** – Table format (Court, Year, Metric, Value, Unit)

## Re-running Extraction

```bash
python3 scripts/extract_pdf_stats.py
```
