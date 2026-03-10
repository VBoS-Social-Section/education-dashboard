import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { getCourtColor, sortCourtsByOrder } from '@/lib/court-colors'
import { cn } from '@/lib/utils'

interface MobileFilterFABProps {
  years: number[]
  selectedYears: number[]
  onYearsChange: (years: number[]) => void
  compareMode: boolean
  onCompareModeChange: (v: boolean) => void
  courts: readonly string[]
  selectedCourts: string[]
  onCourtsChange: (courts: string[]) => void
}

export function MobileFilterFAB({
  years,
  selectedYears,
  onYearsChange,
  compareMode,
  onCompareModeChange,
  courts,
  selectedCourts,
  onCourtsChange,
}: MobileFilterFABProps) {
  const [open, setOpen] = useState(false)
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
    if (checked) onYearsChange(years.length >= 2 ? years.slice(-2) : selectedYears.slice(-2))
  }
  const yearA = selectedYears[0] ?? years[0]
  const yearB = selectedYears[1] ?? years[1] ?? years[0]

  const toggleCourt = (court: string) => {
    const set = new Set(selectedCourts)
    if (set.has(court)) set.delete(court)
    else set.add(court)
    const next = [...set].filter((c) => courts.includes(c))
    onCourtsChange(next.length > 0 ? next : [])
  }

  const sortedCourts = sortCourtsByOrder([...courts])

  return (
    <>
      {/* FAB: visible on mobile/tablet (when sidebar is hidden) */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed right-6 z-40 flex size-14 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-[#422AFB] text-white hover:bg-[#5a3cff] active:scale-95 lg:hidden'
        )}
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
        aria-label="Open filters"
      >
        <SlidersHorizontal className="size-6" strokeWidth={2} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] rounded-t-2xl pb-8"
          showCloseButton={true}
        >
          <SheetHeader className="border-b border-border/60 pb-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Filter data by courts and year range.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 overflow-y-auto py-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Courts</p>
              <div className="flex flex-col gap-2">
                {sortedCourts.map((court) => (
                  <label
                    key={court}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 active:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedCourts.includes(court)}
                      onCheckedChange={() => toggleCourt(court)}
                    />
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: getCourtColor(court) }}
                      aria-hidden
                    />
                    <span className="text-sm font-medium">{court}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Years</p>
              <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Compare years</span>
                  <Switch checked={compareMode} onCheckedChange={handleCompareModeChange} aria-label="Compare two years" />
                </div>
                {compareMode && years.length >= 2 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs text-muted-foreground">Year A</p>
                      <Select
                        value={String(yearA)}
                        onValueChange={(v) => {
                          const a = Number(v)
                          const b = a === yearB ? years.find((y) => y !== a) ?? years[0] : yearB
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
                        value={String(yearB)}
                        onValueChange={(v) => {
                          const b = Number(v)
                          const a = b === yearA ? years.find((y) => y !== b) ?? years[0] : yearA
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
                ) : !compareMode ? (
                  <>
                    <p className="text-sm font-medium">
                      {selectedYears.length ? selectedYears.sort((a, b) => a - b).join(' – ') : 'Select years'}
                    </p>
                    {years.length > 1 ? (
                      <>
                        <Slider
                          min={0}
                          max={years.length - 1}
                          step={1}
                          value={sliderValue}
                          onValueChange={onSliderChange}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{years[0]}</span>
                          <span>{years[years.length - 1]}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Loading years…</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Need 2+ years to compare.</p>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
