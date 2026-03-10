import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const DATA_ROUTES = [
  'Overview',
  'Enrolment',
  'Schools & Teachers',
  'Performance',
  'Teachers by Sex',
] as const

const METHODOLOGY_ROUTE = 'Methodology' as const

function formatLastUpdated(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

interface AppSidebarSheetProps {
  activeTab: number
  onTabChange: (tab: number) => void
  lastUpdated?: string | null
}

export function AppSidebarSheet({
  activeTab,
  onTabChange,
  lastUpdated: propLastUpdated,
}: AppSidebarSheetProps) {
  const [open, setOpen] = useState(false)
  const [fetchedLastUpdated, setFetchedLastUpdated] = useState<string | null>(null)
  const lastUpdated = propLastUpdated ?? fetchedLastUpdated

  useEffect(() => {
    if (propLastUpdated !== undefined) return
    fetch(`${import.meta.env.BASE_URL}data/years.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setFetchedLastUpdated(json?.lastUpdated ?? null))
      .catch(() => {})
  }, [propLastUpdated])

  const handleSelect = (i: number) => {
    onTabChange(i)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-border/60 bg-white shadow-sm hover:bg-muted/50"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <SheetDescription className="sr-only">Choose a page to view. Use the filter button to change education levels and years.</SheetDescription>
        <div className="flex h-full flex-col bg-white">
          <div className="flex h-[70px] items-center border-b border-border/60 px-5">
            <span className="text-xl font-bold tracking-tight text-teal-700">
              Education Dashboard
            </span>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-4">
            {DATA_ROUTES.map((name, i) => (
              <button
                key={name}
                onClick={() => handleSelect(i)}
                className={`block w-full rounded-xl px-3 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === i ? 'bg-teal-500/10 text-teal-700' : 'hover:bg-muted/80'
                }`}
              >
                {name}
              </button>
            ))}
            <Separator className="my-5" />
            <button
              onClick={() => handleSelect(DATA_ROUTES.length)}
              className={`block w-full rounded-xl px-3 py-3 text-left text-sm font-medium transition-all ${
                activeTab === DATA_ROUTES.length ? 'bg-teal-500/10 text-teal-700' : 'hover:bg-muted/80'
              }`}
            >
              {METHODOLOGY_ROUTE}
            </button>
            <p className="mt-4 px-2 text-xs text-muted-foreground">
              Use the filter button below to change education levels and years.
            </p>
          </nav>
          <div className="p-4">
            <div
              className="flex flex-col gap-2 rounded-2xl p-4 text-white"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #059669 50%, #0ea5e9 100%)',
                boxShadow: '0 4px 14px 0 rgba(13, 148, 136, 0.35)',
              }}
            >
              <p className="text-sm font-semibold opacity-95">Data from MoET Annual Reports</p>
              {lastUpdated && (
                <p className="text-xs opacity-80">Last updated: {formatLastUpdated(lastUpdated)}</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
