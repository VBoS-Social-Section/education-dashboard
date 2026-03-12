import { LayoutDashboard, GraduationCap, School, TrendingUp, UserCircle, ClipboardList, Baby, BookOpen } from 'lucide-react'
import { THEME, GRADIENT, GRADIENT_SHADOW } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { MENU_LEVELS, getInstitutionColor, sortInstitutionsByOrder } from '@/lib/education-colors'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'

const DATA_ROUTES = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Enrolment', icon: GraduationCap },
  { name: 'Schools & Teachers', icon: School },
  { name: 'Performance', icon: TrendingUp },
  { name: 'Teachers by Sex', icon: UserCircle },
] as const

const METHODOLOGY_ROUTE = { name: 'Methodology', icon: ClipboardList } as const

const LEVEL_ICONS: Record<string, typeof Baby> = {
  ECCE: Baby,
  Primary: BookOpen,
  Secondary: School,
  'Senior Secondary': GraduationCap,
  Tertiary: School,
}

function formatLastUpdated(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

interface AppSidebarProps {
  activeTab: number
  onTabChange: (tab: number) => void
  years: number[]
  selectedYears: number[]
  onYearsChange: (years: number[]) => void
  selectedLevels: string[]
  onLevelsChange: (levels: string[]) => void
  compareMode: boolean
  onCompareModeChange: (v: boolean) => void
  open: boolean
  lastUpdated?: string | null
}

export function AppSidebar({ activeTab, onTabChange, years, selectedYears, onYearsChange, selectedLevels, onLevelsChange, compareMode, onCompareModeChange, open, lastUpdated }: AppSidebarProps) {
  const rawMin = years.indexOf(selectedYears[0] ?? years[0] ?? 0)
  const rawMax = years.indexOf(selectedYears[selectedYears.length - 1] ?? years[years.length - 1] ?? 0)
  const yearMinIdx = years.length > 0 ? Math.max(0, rawMin >= 0 ? rawMin : 0) : 0
  const yearMaxIdx = years.length > 0 ? Math.min(years.length - 1, rawMax >= 0 ? rawMax : years.length - 1) : 0
  const sliderValue: [number, number] = [yearMinIdx, Math.max(yearMinIdx, yearMaxIdx)]
  const onSliderChange = (v: number[]) => {
    const [lo, hi] = [Math.min(v[0], v[1]), Math.max(v[0], v[1])]
    onYearsChange(years.slice(lo, hi + 1))
  }
  const handleCompareModeChange = (checked: boolean) => {
    onCompareModeChange(checked)
    if (checked) {
      const sorted = [...selectedYears].sort((a, b) => a - b)
      const lastTwo = years.length >= 2 ? years.slice(-2) : sorted.slice(-2)
      onYearsChange(lastTwo.length === 2 ? lastTwo : (sorted.length >= 2 ? sorted.slice(-2) : years.slice(0, 2)))
    }
  }
  const compareYearA = selectedYears[0] ?? years[0]
  const compareYearB = selectedYears[1] ?? years[1] ?? years[0]
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-border/60 bg-teal-50/30 transition-transform duration-200',
        'lg:flex',
        !open && '-translate-x-full'
      )}
    >
      <div className="flex h-[70px] items-center border-b border-border/60 px-5">
        <span className="text-xl font-bold tracking-tight" style={{ color: THEME.primary }}>
          Education Dashboard
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-4">
        {DATA_ROUTES.map((route, i) => {
          const Icon = route.icon
          return (
            <button
              key={route.name}
              onClick={() => onTabChange(i)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                activeTab === i
                  ? 'bg-teal-500/10 text-teal-700'
                  : 'text-foreground/70 hover:bg-muted/80 hover:text-foreground'
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.5} />
              {route.name}
            </button>
          )
        })}
        <Separator className="my-5" />
        <button
          onClick={() => onTabChange(DATA_ROUTES.length)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
            activeTab === DATA_ROUTES.length
              ? 'bg-teal-500/10 text-teal-700'
              : 'text-foreground/70 hover:bg-muted/80 hover:text-foreground'
          )}
        >
          <METHODOLOGY_ROUTE.icon className="size-5 shrink-0" strokeWidth={1.5} />
          {METHODOLOGY_ROUTE.name}
        </button>
        <Separator className="my-5" />
        <div className="space-y-3">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Education Levels</p>
          <div className="flex flex-col gap-1.5 px-2">
            {sortInstitutionsByOrder([...MENU_LEVELS]).map((level) => (
              <label
                key={level}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...selectedLevels, level]
                      : selectedLevels.filter((l) => l !== level)
                    onLevelsChange(next.length > 0 ? next : ['ECCE', 'Primary', 'Secondary', 'Senior Secondary'])
                  }}
                />
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: getInstitutionColor(level) }}
                  aria-hidden
                />
                <span className="text-sm">{level}</span>
              </label>
            ))}
          </div>
        </div>
        <Separator className="my-5" />
        <div className="space-y-3">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Years</p>
          <div className="space-y-3 px-2">
          <p className="text-sm font-medium">
            Showing data for selected years
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Compare years</span>
            <Switch
              checked={compareMode}
              onCheckedChange={handleCompareModeChange}
              aria-label="Compare two years side by side"
            />
          </div>
          {compareMode && years.length >= 2 && (
            <div className="space-y-2">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Year A</p>
                <Select
                  value={String(compareYearA)}
                  onValueChange={(v) => {
                    const a = Number(v)
                    const b = a === compareYearB ? years.find((y) => y !== a) ?? years[0] : compareYearB
                    onYearsChange(a <= b ? [a, b] : [b, a])
                  }}
                >
                  <SelectTrigger className="w-full" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Year B</p>
                <Select
                  value={String(compareYearB)}
                  onValueChange={(v) => {
                    const b = Number(v)
                    const a = b === compareYearA ? years.find((y) => y !== b) ?? years[0] : compareYearA
                    onYearsChange(a <= b ? [a, b] : [b, a])
                  }}
                >
                  <SelectTrigger className="w-full" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        </div>
      </nav>
      <div className="p-4">
        <div
          className="flex flex-col gap-2 rounded-2xl p-4 text-white"
          style={{
            background: GRADIENT,
            boxShadow: GRADIENT_SHADOW,
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shrink-0">
            <GraduationCap className="size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold opacity-95">Data from MoET & NUV Reports</p>
            {lastUpdated && (
              <p className="mt-0.5 text-xs opacity-80">Last updated: {formatLastUpdated(lastUpdated)}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
