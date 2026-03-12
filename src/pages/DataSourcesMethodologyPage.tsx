import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Database, Sparkles, AlertCircle } from 'lucide-react'
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
    fetch(`${import.meta.env.BASE_URL}data/education-reports.json`)
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
        <Card className="border-[#4B6DEB]/30 bg-gradient-to-br from-[#4B6DEB]/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#4B6DEB]" />
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
              MoET Reports Used
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">Reports used:</p>
            <ul className="space-y-2">
              {reports.length === 0 ? (
                <li className="text-sm text-muted-foreground">Loading reports…</li>
              ) : (
                reports.map((r) => (
                  <li key={r.year} className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                    <span className="font-medium">{r.title}</span>
                    <span className="text-muted-foreground text-xs">Year {r.year}</span>
                  </li>
                ))
              )}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">PDFs are stored in <code>./annual report</code> or <code>./annual_reports</code> and processed by the extraction script.</p>
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
              Data is extracted from MoET (Ministry of Education and Training) Annual Statistical Report PDFs using a Python script (pdftotext + regex parsing). Metrics include enrolment by level (ECCE, Primary, Secondary, Senior Secondary), number of schools by type, and number of teachers by type. Tables 1, 3, and 4 from each report are parsed to build the dashboard CSVs.
            </p>
            <p className="text-sm text-muted-foreground">
              Assumptions: Education levels are standardized (ECCE, Primary, Secondary, Senior Secondary, Total). Year columns in the PDFs may span multiple years (e.g. 2022–2024); the script selects the value for the report year. Percentages and counts are as published unless otherwise noted.
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
            <p><strong className="text-foreground">Source:</strong> Figures are drawn from MoET Annual Statistical Reports (VEMIS/Open VEMIS). Data covers formal education: ECCE, Primary, and Secondary schools.</p>
            <p><strong className="text-foreground">Years covered:</strong> 2019, 2020, 2021, 2022, 2024. Not all years may have reports available in the source folder.</p>
            <p><strong className="text-foreground">School types:</strong> ECCE = Early Childhood Care and Education; Primary = Years 1–6; Secondary includes Junior (7–10) and Senior (11+). Some reports combine Junior and Senior Secondary.</p>
            <p><strong className="text-foreground">Private and church schools:</strong> MoET reports include both government and non-government schools. Some private schools may not submit data; these may appear as zero in source tables.</p>
            <p><strong className="text-foreground">Student-teacher ratio:</strong> Extracted when available in the reports. Not all years or levels may have STR data.</p>
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
