import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Database, ExternalLink, Sparkles, AlertCircle } from 'lucide-react'
import { GLOSSARY } from '@/glossary'

interface Report {
  year: number
  title: string
  url?: string
  file?: string
}

interface DataSourcesMethodologyPageProps {
  embedded?: boolean
}

export function DataSourcesMethodologyPage({ embedded }: DataSourcesMethodologyPageProps) {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}annual-reports/reports.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setReports)
      .catch(() => setReports([]))
  }, [])

  return (
    <div className={embedded ? 'mx-auto max-w-3xl' : ''}>
      <p className="mb-6 text-sm text-muted-foreground">
        Data is extracted from Vanuatu Ministry of Education and Training (MoET) Annual Statistical Reports in the <code>./annual report</code> folder. Reports cover enrolment, schools, and teachers across ECCE, Primary, Secondary, and Senior Secondary levels.
      </p>

      <div className="space-y-6">
        <Card className="border-[#7551ff]/30 bg-gradient-to-br from-[#7551ff]/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#7551ff]" />
              What&apos;s New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Mar 2025:</strong> Education dashboard customized from court dashboard. Data extracted from MoET Statistical Reports (Tables 1, 3, 4) for enrolment, schools, and teachers by level.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              PDFs Used (Annual Reports)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">Reports used:</p>
            <ul className="space-y-2">
              {reports.length === 0 ? (
                <li className="text-sm text-muted-foreground">Loading reports…</li>
              ) : (
                reports.map((r) => {
                  const href = r.file
                    ? `${import.meta.env.BASE_URL}annual-reports/${r.file}`
                    : r.url ?? '#'
                  return (
                    <li key={r.year} className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                      <span className="font-medium">{r.title}</span>
                      <a
                        href={href}
                        target={r.url ? '_blank' : undefined}
                        rel={r.url ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1.5 text-[#422AFB] hover:underline"
                      >
                        View PDF
                        {r.url && <ExternalLink className="size-3.5" />}
                      </a>
                    </li>
                  )
                })
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              Extraction Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Data was extracted from Vanautu Courts annual report PDFs using a Python script (pdftotext + regex parsing). Metrics include filings, disposals, clearance rates, pending cases, timeliness, attendance, productivity, outcomes, and workload by type and location. Extracted values are verified against the PDFs and merged into the dashboard data CSVs.
            </p>
            <p className="text-sm text-muted-foreground">
              Assumptions: Court names are standardized (Court of Appeal, Supreme Court, Magistrates Court, Island Court). Island Court has no criminal/civil outcome data. Percentages and rates are as published unless otherwise noted.
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/50 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-amber-600 dark:text-amber-500" />
              Data Notes &amp; Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Source alignment:</strong> Figures are drawn from Vanuatu Judiciary Annual Reports (PDFs) for 2017–2025. Where PDF values differed from earlier estimates, the dashboard has been aligned to the PDFs.</p>
            <p><strong className="text-foreground">Years covered:</strong> 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025. 2017 and 2019 were previously missing and are now included.</p>
            <p><strong className="text-foreground">Domestic violence / protection orders:</strong> DV filings and disposals are from the PDFs (e.g. 2025: 1,167 filings, 1,135 disposals; 2024: 1,226 / 1,113). Earlier years may have been estimated before verification.</p>
            <p><strong className="text-foreground">Charge orders:</strong> The &quot;charge orders&quot; metric may not match &quot;criminal registered&quot; in the PDFs. If you notice mismatches, the definition in the source reports may differ and is under review.</p>
            <p><strong className="text-foreground">Gender breakdown:</strong> The 2025 report states that gender breakdown will be published on the website. The dashboard uses prior-year patterns (about 63% male) for 2025 until official figures are available.</p>
            <p><strong className="text-foreground">Island Court:</strong> Island Court has no outcome data, attendance rates, productivity, or reserved judgments in the PDFs. These appear as &quot;—&quot; in the dashboard.</p>
            <p><strong className="text-foreground">Earlier reports (2017–2018, 2020):</strong> PDF values applied. 2017 and 2018 Supreme Court filings were rescanned from PDFs (SC 2017→689, 2018→712). 2020 uses the corrected Annual Report: SC 866 filings, 1,181 disposals, 136% clearance, 806 pending; MC 2,231/2,278, 102% clearance; IC 383/372.</p>
            <p><strong className="text-foreground">2025 context:</strong> Port Vila Magistrates Court had reduced capacity in early 2025 due to the December 2024 earthquake. This may affect 2025 Magistrates figures.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Glossary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {Object.entries(GLOSSARY).map(([term, def]) => (
                <div key={term} className="border-b border-border/60 pb-2 last:border-0 last:pb-0">
                  <dt className="font-medium text-foreground">{term}</dt>
                  <dd className="mt-0.5 text-muted-foreground">{def}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
