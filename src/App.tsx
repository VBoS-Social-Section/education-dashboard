import { useCallback, useEffect, useState } from 'react'
import Papa from 'papaparse'
import type { StatRow } from './types'
import { AppSidebar } from './components/layout/AppSidebar'
import { AppSidebarSheet } from './components/layout/AppSidebarSheet'
import { MobileFilterFAB } from './components/layout/MobileFilterFAB'
import { HeroBanner } from './components/HeroBanner'
import { InstallPWAButton } from './components/InstallPWAButton'
import { AppFooter } from './components/layout/AppFooter'
import { PageIndicators } from './components/PageIndicators'
import { OverviewPage } from './pages/OverviewPage'
import { EnrolmentPage } from './pages/EnrolmentPage'
import { SchoolsTeachersPage } from './pages/SchoolsTeachersPage'
import { PerformancePage } from './pages/PerformancePage'
import { OutcomesPage } from './pages/OutcomesPage'
import { OtherMetricsPage } from './pages/OtherMetricsPage'
import { DataSourcesMethodologyPage } from './pages/DataSourcesMethodologyPage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const SECTION_NAMES = [
  'Overview',
  'Enrolment',
  'Schools & Teachers',
  'Performance',
  'Trends',
  'Other Metrics',
  'Methodology',
] as const

export const INSTITUTIONS = [
  'ECCE',
  'Primary',
  'Secondary',
  'Senior Secondary',
  'Total',
] as const

function parseValue(val: string): number | null {
  if (val == null || val === '' || String(val).toLowerCase() === 'na') return null
  const n = parseFloat(String(val))
  return Number.isNaN(n) ? null : n
}

const BASE = import.meta.env.BASE_URL

async function loadYearData(year: number): Promise<StatRow[]> {
  const res = await fetch(`${BASE}data/${year}.csv`)
  if (!res.ok) throw new Error(`Failed to load ${year}.csv`)
  const text = await res.text()
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  return (parsed.data ?? []).map((r) => ({
    Court: r.Court ?? '',
    Year: r.Year ?? String(year),
    Metric: r.Metric ?? '',
    Value: r.Value ?? '',
    Unit: r.Unit ?? '',
  }))
}

async function loadAvailableYears(): Promise<{ years: number[]; lastUpdated?: string }> {
  const res = await fetch(`${BASE}data/years.json`)
  if (!res.ok) return { years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] }
  const json = (await res.json()) as { years?: number[]; lastUpdated?: string }
  return { years: json.years ?? [], lastUpdated: json.lastUpdated }
}

export default function App() {
  const [years, setYears] = useState<number[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedCourts, setSelectedCourts] = useState<string[]>(() => [...INSTITUTIONS])
  const [compareMode, setCompareMode] = useState(false)
  const [data, setData] = useState<StatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const filteredData = data.filter((r) => selectedCourts.includes(r.Court))

  const loadYears = useCallback(async () => {
    try {
      const res = await loadAvailableYears()
      const y = res.years
      setYears(y)
      setLastUpdated(res.lastUpdated ?? null)
      setSelectedYears((prev) => (prev.length === 0 && y.length > 0 ? (y.length >= 3 ? y.slice(-3) : y) : prev))
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    loadYears()
  }, [loadYears])

  useEffect(() => {
    if (selectedYears.length === 0) {
      setData([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all(selectedYears.map(loadYearData))
      .then((arr) => {
        if (cancelled) return
        setData(arr.flat())
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedYears])

  const getValue = useCallback((court: string, metric: string, year?: number): number | null => {
    const row = filteredData.find((r) => r.Court === court && r.Metric === metric && (year == null || r.Year === String(year)))
    return row ? parseValue(row.Value) : null
  }, [filteredData])

  const getRowsByMetric = useCallback(
    (metric: string) =>
      filteredData.filter((r) => r.Metric === metric).map((r) => ({ ...r, valueNum: parseValue(r.Value) })),
    [filteredData]
  )

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        years={years}
        selectedYears={selectedYears}
        onYearsChange={setSelectedYears}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        courts={INSTITUTIONS}
        selectedCourts={selectedCourts}
        onCourtsChange={setSelectedCourts}
        open={sidebarOpen}
        lastUpdated={lastUpdated}
      />

      <div
        className={`flex flex-1 flex-col transition-[padding] duration-200 ${sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-0'}`}
      >
        <main className="flex-1 p-4 lg:p-6">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 items-center gap-2">
              <div className="lg:hidden">
                <AppSidebarSheet
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  lastUpdated={lastUpdated}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="hidden border-border/60 bg-white shadow-sm hover:bg-muted/50 lg:flex"
                onClick={() => setSidebarOpen((v) => !v)}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
              </Button>
            </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Pages</span>
                  <ChevronRight className="size-4" />
                  <span>{SECTION_NAMES[activeTab]}</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">{SECTION_NAMES[activeTab]}</h1>
              </div>
              <div className="flex items-center gap-2">
                <InstallPWAButton />
                <HeroBanner lastUpdated={lastUpdated} placement="icon" />
              </div>
            </div>
            <HeroBanner lastUpdated={lastUpdated} placement="banner" />
          </div>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50 shadow-sm">
              <CardContent className="pt-6">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex justify-center py-16">
              <div className="size-10 animate-spin rounded-full border-2 border-[#7551ff] border-t-transparent" />
            </div>
          )}

          {!loading && activeTab < 6 && selectedYears.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select at least one year to view data.</p>
              </CardContent>
            </Card>
          )}

          {!loading && activeTab < 6 && selectedYears.length > 0 && selectedCourts.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select at least one court to view data.</p>
              </CardContent>
            </Card>
          )}

          {!loading && activeTab < 6 && selectedYears.length > 0 && selectedCourts.length > 0 && filteredData.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No data available for the selected filters.</p>
              </CardContent>
            </Card>
          )}

          {!loading && data.length > 0 && activeTab < 6 && (
            <>
              {activeTab !== 0 && <PageIndicators data={filteredData} activeTab={activeTab} compareMode={compareMode} selectedYears={selectedYears} />}
              <div className="grid gap-6 xl:grid-cols-1">
                {activeTab === 0 && <OverviewPage data={filteredData} selectedYears={selectedYears} compareMode={compareMode} getValue={getValue} onNavigateToMethodology={() => setActiveTab(6)} />}
                {activeTab === 1 && <EnrolmentPage data={filteredData} selectedYears={selectedYears} compareMode={compareMode} getValue={getValue} />}
                {activeTab === 2 && <SchoolsTeachersPage data={filteredData} selectedYears={selectedYears} compareMode={compareMode} getValue={getValue} />}
                {activeTab === 3 && <PerformancePage data={filteredData} selectedYears={selectedYears} compareMode={compareMode} getValue={getValue} />}
                {activeTab === 4 && <OutcomesPage data={filteredData} selectedYears={selectedYears} compareMode={compareMode} getValue={getValue} getRowsByMetric={getRowsByMetric} />}
                {activeTab === 5 && <OtherMetricsPage data={filteredData} selectedYears={selectedYears} compareMode={compareMode} getValue={getValue} />}
              </div>
            </>
          )}
          {activeTab === 6 && (
            <div className="grid gap-6 xl:grid-cols-1">
              <DataSourcesMethodologyPage embedded />
            </div>
          )}
        </main>
        <AppFooter />
      </div>

      <MobileFilterFAB
        years={years}
        selectedYears={selectedYears}
        onYearsChange={setSelectedYears}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        courts={INSTITUTIONS}
        selectedCourts={selectedCourts}
        onCourtsChange={setSelectedCourts}
      />
    </div>
  )
}
