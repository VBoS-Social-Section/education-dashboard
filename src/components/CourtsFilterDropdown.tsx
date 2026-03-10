import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { getCourtColor, sortCourtsByOrder } from '@/lib/court-colors'
import { getInstitutionColor, sortInstitutionsByOrder } from '@/lib/education-colors'
import { cn } from '@/lib/utils'

interface CourtsFilterDropdownProps {
  courts: readonly string[]
  selectedCourts: string[]
  onCourtsChange: (courts: string[]) => void
  className?: string
}

export function CourtsFilterDropdown({
  courts,
  selectedCourts,
  onCourtsChange,
  className,
}: CourtsFilterDropdownProps) {
  const isEducation = courts.some((c) => ['ECCE', 'Primary', 'Secondary', 'Total'].includes(c))
  const sortedCourts = isEducation ? sortInstitutionsByOrder([...courts]) : sortCourtsByOrder([...courts])
  const getColor = (c: string) => (isEducation ? getInstitutionColor(c) : getCourtColor(c))
  const toggleCourt = (court: string) => {
    const set = new Set(selectedCourts)
    if (set.has(court)) set.delete(court)
    else set.add(court)
    const next = [...set].filter((c) => courts.includes(c))
    onCourtsChange(next.length > 0 ? next : [])
  }
  const label =
    selectedCourts.length === 0
      ? isEducation ? 'Select levels' : 'Select courts'
      : selectedCourts.length === courts.length
        ? isEducation ? 'All levels' : 'All courts'
        : `${selectedCourts.length} level${selectedCourts.length === 1 ? '' : 's'} selected`
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            'h-9 w-full justify-between border-border/60 bg-white px-3 text-sm font-normal shadow-sm hover:bg-muted/50',
            className
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="ml-1 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
        <div className="flex flex-col gap-0.5">
          {sortedCourts.map((court) => (
            <label
              key={court}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={selectedCourts.includes(court)}
                onCheckedChange={() => toggleCourt(court)}
              />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: getColor(court) }}
                aria-hidden
              />
              <span className="truncate">{court}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
