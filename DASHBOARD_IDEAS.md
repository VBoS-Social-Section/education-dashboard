# Education Dashboard Inspiration & Ideas

From AI-generated dashboards (Gemini, ChatGPT), best practices, and MoET report structure.

---

## Layout & Design Inspiration

### From AI Dashboards (Gemini, etc.) and Modern Education Dashboards

1. **Hero / Overview Section**
   - Large headline metric (e.g. total enrolment) with trend arrow
   - Quick summary cards in a row (4–6 KPIs)
   - Short narrative text explaining the data

2. **Grid-Based Card Layout**
   - 2–3 column responsive grid
   - Each chart in its own card with title and optional subtitle
   - Consistent spacing and hierarchy

3. **Interactive Widgets**
   - Year selector (already have)
   - Level comparison (already have)
   - Optional: province filter, language filter

4. **Traffic / Status Indicators**
   - Green / Amber / Red for GER, NER, GPI vs targets
   - Simple “at risk” / “on track” labels

5. **Modular Sections**
   - Group charts by theme: “Enrolment”, “Access & Equity”, “Resources”, “Performance”
   - Collapsible sections for dense data

6. **Visual Hierarchy**
   - Clear section titles (e.g. “Overview”, “Enrolment by Level”, “Equity Indicators”)
   - Breadcrumbs for navigation

---

## Data Ideas from MoET Reports

Reports typically have 70+ tables. Below are ideas we can extract and display.

### Currently Extracted

- Enrolment (ECCE, Primary, Secondary, Senior Secondary, Tertiary, Total)
- Schools (ECCE, Primary, Secondary, Total)
- Teachers (ECCE, Primary, Secondary, Total)
- GER, NER, GPI, NER_GPI (ECCE, Primary, Secondary)
- Teachers_Male, Teachers_Female (some years)
- StudentTeacherRatio (ECCE, Primary, Secondary)
- Tertiary enrolment (NUV)

### Not Yet Extracted (from report structure)

| Table / Concept | Description | Possible Metrics |
|-----------------|-------------|------------------|
| **Enrolment by gender** | Male/female enrolment by level | Enrolment_Male, Enrolment_Female |
| **Enrolment by school authority** | Government, church, private | Enrolment by authority type |
| **Enrolment by province** | Shefa, Tafea, Malampa, etc. | Enrolment by province |
| **Enrolment by rural/urban** | Location | Enrolment_Rural, Enrolment_Urban |
| **Enrolment by language of instruction** | Anglophone, Francophone, Vernacular | Enrolment by language |
| **School counts by province** | Schools per province | Schools by province |
| **Enrolment by age** | Age categories | Enrolment by age band |
| **Grant allocations** | Funding | Grant amounts |
| **Student–teacher ratio by province** | STR by province | STR by province |

### MoET Report Tables (Typical)

- **Table 1**: Enrolment by school type ✓
- **Table 3**: Number of schools ✓
- **Table 4**: Number of teachers ✓
- **Table 27**: GER by school type and sex ✓
- **Table 28**: NER and GPI by school type ✓
- **Teachers by sex** ✓
- **Student–teacher ratio** ✓
- **Provincial digest** – enrolment by province, school type
- **Language of instruction** – Anglophone, Francophone, Vernacular
- **School authority** – Government, Church, etc.

---

## Chart & Visualization Ideas

### From Best Practices

1. **Enrolment over time** - Line or bar chart ✓
2. **Schools over time** - Bar chart ✓
3. **Teachers over time** - Bar chart ✓
4. **Enrolment by sex** - Stacked bar (male/female) – NEW
5. **Pie chart** - Enrolment share by level (ECCE, Primary, Secondary, etc.)
6. **Heat map** - Province × level (enrolment or schools)
7. **Treemap** - Enrolment by province
8. **Gauge / speedometer** - GER or NER vs target
9. **Trend lines** - Multi-year trend with optional forecast
10. **Comparison table** - Year A vs Year B side by side

### Equity Indicators

- **Gender parity** – GPI by level
- **Provincial equity** – Enrolment per capita by province
- **Access by language** – Anglophone vs Francophone vs Vernacular

---

## Suggested Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Level] Education Dashboard                    [Year] [Filters] |
├─────────────────────────────────────────────────────────────────┤
│  HERO: 4–6 key stats (Enrolment, Schools, Teachers, GER, NER)  │
├─────────────────────────────────────────────────────────────────┤
│  SECTION: Enrolment & Access                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Enrolment   │ │ Enrolment   │ │ Enrolment   │             │
│  │ over time   │ │ by sex      │ │ by level    │             │
│  │ (bar)       │ │ (stacked)   │ │ (pie)       │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  SECTION: Resources & Capacity                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Schools     │ │ Teachers    │ │ Student–     │             │
│  │ over time   │ │ by sex      │ │ teacher     │             │
│  │             │ │             │ │ ratio       │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  SECTION: Performance Indicators                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ GER          │ │ NER          │ │ GPI          │             │
│  │ (bar)        │ │ (bar)        │ │ (bar)        │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

1. **Quick wins**
   - Add section headers (Enrolment, Resources, Performance)
   - Group charts by theme
   - Enrolment by sex (if extractable from reports)

2. **Medium effort**
   - Extract enrolment by province
   - Add pie chart for enrolment share by level
   - Use Highcharts for all charts (consistent with existing components)

3. **Larger effort**
   - Province breakdowns and heat maps
   - Traffic-light indicators for GER/NER
   - Provincial digest integration

---

## References

- [MoET Statistical Digest](https://moet.gov.vu/index.php?id=moet-statistical-digest) – Vanuatu education data
- [Analytikus – Higher Education Dashboards](https://www.analytikus.com/post/practical-guide-for-higher-education-building-learning-dashboards-which-metrics-to-use)
- California School Dashboard – traffic-light indicators
- Kentucky Equity Dashboard – equity metrics
- NCES Equity in Education Dashboard – federal equity indicators
