import { useCallback, useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import type { StatRow, Sdg4Seed } from './types'
import { AppSidebar } from './components/layout/AppSidebar'
import { AppSidebarSheet } from './components/layout/AppSidebarSheet'
import { MobileFilterFAB } from './components/layout/MobileFilterFAB'
import { HeroBanner } from './components/HeroBanner'
import { InstallPWAButton } from './components/InstallPWAButton'
import { AppFooter } from './components/layout/AppFooter'
import { OverviewPage } from './pages/OverviewPage'
import { EnrolmentPage } from './pages/EnrolmentPage'
import { SchoolsTeachersPage } from './pages/SchoolsTeachersPage'
import { PerformancePage } from './pages/PerformancePage'
import { TeachersDetailPage } from './pages/TeachersDetailPage'
import { DataSourcesMethodologyPage } from './pages/DataSourcesMethodologyPage'
import { VanstaPage } from './pages/VanstaPage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, CircleHelp, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { MENU_LEVELS, RAW_SECONDARY_COURTS } from '@/lib/education-colors'
import { GuidedSpotlightTour } from '@/components/GuidedSpotlightTour'
import { getMoetTourSteps, METHODOLOGY_TAB_INDEX } from '@/config/moet-guided-tours'

const DATA_ROUTES = ['Overview', 'Enrolment', 'Schools & Teachers', 'Performance', 'Teachers by Sex', 'VANSTA'] as const

/** Index of VANSTA tab (separate from MoET annual data) */
const VANSTA_TAB_INDEX = DATA_ROUTES.length - 1

export const INSTITUTIONS = ['ECCE', 'Primary', 'Secondary', 'Tertiary', 'Total'] as const

const SECONDARY_SOURCES = RAW_SECONDARY_COURTS as readonly string[]

const SUM_METRICS = new Set([
  'Enrolment',
  'Schools',
  'Teachers',
  'Teachers_Male',
  'Teachers_Female',
  'Enrolment_Male',
  'Enrolment_Female',
])

const WEIGHTED_RATE_METRICS = new Set(['GER', 'NER', 'GPI', 'NER_GPI'])

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

async function loadSdg4Seed(): Promise<Sdg4Seed | null> {
  try {
    const res = await fetch(`${BASE}data/seed_sdg4.json`)
    if (!res.ok) return null
    return (await res.json()) as Sdg4Seed
  } catch {
    return null
  }
}

export default function App() {
  const [years, setYears] = useState<number[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [data, setData] = useState<StatRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['ECCE', 'Primary', 'Secondary'])
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedAuthority, setSelectedAuthority] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [sdg4Seed, setSdg4Seed] = useState<Sdg4Seed | null>(null)
  const [moetTourOpen, setMoetTourOpen] = useState(false)

  const guidedTourSteps = useMemo(() => getMoetTourSteps(activeTab), [activeTab])
  const showGuidedHelp =
    activeTab === VANSTA_TAB_INDEX ||
    (!loading &&
      ((activeTab < VANSTA_TAB_INDEX && selectedYears.length > 0) || activeTab === METHODOLOGY_TAB_INDEX))

  useEffect(() => {
    setMoetTourOpen(false)
  }, [activeTab])

  const loadYears = useCallback(async () => {
    try {
      const res = await loadAvailableYears()
      const y = res.years
      setYears(y)
      setLastUpdated(res.lastUpdated ?? null)
      setSelectedYears((prev) => (prev.length === 0 && y.length > 0 ? y : prev))
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  useEffect(() => {
    loadYears()
  }, [loadYears])

  useEffect(() => {
    loadSdg4Seed().then(setSdg4Seed)
  }, [])

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

  const filteredData = useMemo(() => {
    return data.filter((r) => {
      if (r.Court === 'Total') return true
      if (selectedLevels.includes(r.Court)) return true
      if (selectedLevels.includes('Secondary') && SECONDARY_SOURCES.includes(r.Court)) return true
      return false
    })
  }, [data, selectedLevels])

  const getRaw = useCallback(
    (court: string, metric: string, year?: number): number | null => {
      const row = filteredData.find((r) => r.Court === court && r.Metric === metric && (year == null || r.Year === String(year)))
      return row ? parseValue(row.Value) : null
    },
    [filteredData]
  )

  const getValue = useCallback(
    (court: string, metric: string, year?: number): number | null => {
      if (court !== 'Secondary') {
        return getRaw(court, metric, year)
      }

      if (SUM_METRICS.has(metric)) {
        let sum = 0
        let any = false
        for (const c of SECONDARY_SOURCES) {
          const v = getRaw(c, metric, year)
          if (v != null) {
            sum += v
            any = true
          }
        }
        return any ? sum : null
      }

      if (metric === 'StudentTeacherRatio') {
        let enrol = 0
        let eAny = false
        for (const c of SECONDARY_SOURCES) {
          const v = getRaw(c, 'Enrolment', year)
          if (v != null) {
            enrol += v
            eAny = true
          }
        }
        let teachers = 0
        let tAny = false
        for (const c of SECONDARY_SOURCES) {
          const v = getRaw(c, 'Teachers', year)
          if (v != null) {
            teachers += v
            tAny = true
          }
        }
        if (eAny && tAny && enrol > 0 && teachers > 0) return enrol / teachers
        return null
      }

      if (WEIGHTED_RATE_METRICS.has(metric)) {
        let num = 0
        let den = 0
        for (const c of SECONDARY_SOURCES) {
          const rate = getRaw(c, metric, year)
          const enrol = getRaw(c, 'Enrolment', year)
          if (rate != null && enrol != null && enrol > 0) {
            num += rate * enrol
            den += enrol
          }
        }
        if (den > 0) return num / den
        for (const c of SECONDARY_SOURCES) {
          const rate = getRaw(c, metric, year)
          if (rate != null) return rate
        }
        return null
      }

      let sum = 0
      let any = false
      for (const c of SECONDARY_SOURCES) {
        const v = getRaw(c, metric, year)
        if (v != null) {
          sum += v
          any = true
        }
      }
      return any ? sum : null
    },
    [getRaw]
  )

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        years={years}
        selectedYears={selectedYears}
        onYearsChange={setSelectedYears}
        selectedLevels={selectedLevels}
        onLevelsChange={setSelectedLevels}
        selectedProvince={selectedProvince}
        onProvinceChange={setSelectedProvince}
        selectedAuthority={selectedAuthority}
        onAuthorityChange={setSelectedAuthority}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        open={sidebarOpen}
        lastUpdated={lastUpdated}
      />

      <div
        className={`flex flex-1 flex-col transition-[padding] duration-200 ${sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-0'}`}
      >
        <main className="flex-1 bg-[#F0F1F2] p-4 lg:p-6">
          {showGuidedHelp && guidedTourSteps.length > 0 && (
            <GuidedSpotlightTour open={moetTourOpen} onOpenChange={setMoetTourOpen} steps={guidedTourSteps} />
          )}
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
              <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Pages</span>
                    <ChevronRight className="size-4" />
                    <span>{activeTab < DATA_ROUTES.length ? DATA_ROUTES[activeTab] : 'Methodology'}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{activeTab < DATA_ROUTES.length ? DATA_ROUTES[activeTab] : 'Methodology'}</h1>
                </div>
                {showGuidedHelp && guidedTourSteps.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-2 border-[#4B6DEB]/40 bg-white shadow-sm"
                    onClick={() => setMoetTourOpen(true)}
                    aria-label="Open guided help for this page"
                  >
                    <CircleHelp className="size-4 text-[#4B6DEB]" />
                    Guided help
                  </Button>
                )}
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

          {loading && activeTab !== VANSTA_TAB_INDEX && (
            <div className="flex justify-center py-16">
              <div className="size-10 animate-spin rounded-full border-2 border-[#4B6DEB] border-t-transparent" />
            </div>
          )}

          {activeTab === VANSTA_TAB_INDEX && <VanstaPage />}

          {!loading && activeTab < DATA_ROUTES.length && activeTab !== VANSTA_TAB_INDEX && selectedYears.length === 0 && (
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Select at least one year to view data.</p>
              </CardContent>
            </Card>
          )}

          {!loading && filteredData.length > 0 && activeTab < VANSTA_TAB_INDEX && selectedYears.length > 0 && (
            <>
              {activeTab === 0 && (
                <OverviewPage
                  data={filteredData}
                  selectedYears={selectedYears}
                  compareMode={compareMode}
                  getValue={getValue}
                  sdg4Seed={sdg4Seed}
                  selectedProvince={selectedProvince}
                  onNavigateToMethodology={() => setActiveTab(DATA_ROUTES.length)}
                />
              )}
              {activeTab === 1 && (
                <EnrolmentPage
                  data={filteredData}
                  selectedYears={selectedYears}
                  compareMode={compareMode}
                  getValue={getValue}
                  sdg4Seed={sdg4Seed}
                  selectedProvince={selectedProvince}
                  selectedAuthority={selectedAuthority}
                  selectedLocation={selectedLocation}
                />
              )}
              {activeTab === 2 && (
                <SchoolsTeachersPage data={filteredData} selectedYears={selectedYears} compareMode={compareMode} getValue={getValue} />
              )}
              {activeTab === 3 && (
                <PerformancePage
                  data={filteredData}
                  selectedYears={selectedYears}
                  compareMode={compareMode}
                  getValue={getValue}
                  sdg4Seed={sdg4Seed}
                  selectedProvince={selectedProvince}
                />
              )}
              {activeTab === 4 && (
                <TeachersDetailPage data={filteredData} selectedYears={selectedYears} getValue={getValue} />
              )}
            </>
          )}
          {activeTab === DATA_ROUTES.length && (
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
        courts={[...MENU_LEVELS]}
        selectedCourts={selectedLevels}
        onCourtsChange={setSelectedLevels}
        showMoetFilters={activeTab !== VANSTA_TAB_INDEX}
      />
    </div>
  )
}
