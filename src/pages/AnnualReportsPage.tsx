import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppFooter } from '@/components/layout/AppFooter'
import { FileText } from 'lucide-react'

interface Report {
  year: number
  title: string
  url: string
}

interface AnnualReportsPageProps {
  embedded?: boolean
}

export function AnnualReportsPage({ embedded }: AnnualReportsPageProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}annual-reports/reports.json`)
      .then((r) => r.ok ? r.json() : [])
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const content = (
    <>
      <p className="mb-6 text-muted-foreground">
        Annual reports and statistics from the Vanuatu Judiciary (courts.gov.vu).
      </p>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="size-10 animate-spin rounded-full border-2 border-[#7551ff] border-t-transparent" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No reports yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No reports configured. Add entries to <code className="rounded bg-muted px-1">public/annual-reports/reports.json</code> with <code className="rounded bg-muted px-1">url</code> pointing to courts.gov.vu.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.year} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#422AFB]/15">
                    <FileText className="size-5" style={{ color: '#422AFB' }} />
                  </div>
                  {r.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#422AFB] px-4 py-2 text-sm font-medium text-white hover:bg-[#7551ff]"
                >
                  <FileText className="size-4" />
                  Download PDF
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )

  if (embedded) {
    return (
      <div className="mx-auto max-w-2xl">
        {content}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background p-4 lg:p-6">
      <div className="mx-auto max-w-2xl flex-1">
        <h1 className="mb-2 text-2xl font-bold" style={{ color: '#422AFB' }}>
          Annual Reports
        </h1>
        {content}
      </div>
      <AppFooter compact />
    </div>
  )
}
