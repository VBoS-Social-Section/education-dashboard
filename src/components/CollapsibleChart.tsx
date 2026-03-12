import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleChartProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  icon?: ReactNode
  badge?: ReactNode
  summary?: ReactNode
}

export function CollapsibleChart({ 
  title, 
  description, 
  children, 
  className = '',
  icon,
  badge,
  summary
}: CollapsibleChartProps) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200', className)}>
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold font-display text-foreground hover:text-primary transition-colors">
                {title}
              </h3>
              {badge && (
                <div className="flex-shrink-0">
                  {badge}
                </div>
              )}
            </div>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {summary && (
            <div className="text-xs text-muted-foreground">
              {summary}
            </div>
          )}
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <div className="animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      </div>
    </div>
  )
}

// Compact version for KPI cards
interface CollapsibleKPICardProps {
  title: string
  value: string | number
  description?: string
  children: ReactNode
  className?: string
  color?: string
}

export function CollapsibleKPICard({ 
  title, 
  value, 
  description, 
  children, 
  className = '',
  color = '#FF6B35'
}: CollapsibleKPICardProps) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200', className)}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0" 
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate">
              {title}
            </h4>
            <p className="text-lg font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 hover:text-foreground flex-shrink-0" />
      </div>
      
      <div className="px-4 pb-4">
        <div className="animate-in slide-in-from-top-2 duration-200 pt-2">
          {children}
        </div>
      </div>
    </div>
  )
}

// Grid container for responsive masonry layout
interface MasonryGridProps {
  children: ReactNode
  className?: string
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: string
}

export function MasonryGrid({ 
  children, 
  className = '',
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 'gap-4'
}: MasonryGridProps) {
  return (
    <div 
      className={cn(
        'grid',
        gap,
        `grid-cols-${columns.xs || 1}`,
        columns.sm && `sm:grid-cols-${columns.sm}`,
        columns.md && `md:grid-cols-${columns.md}`,
        columns.lg && `lg:grid-cols-${columns.lg}`,
        columns.xl && `xl:grid-cols-${columns.xl}`,
        className
      )}
    >
      {children}
    </div>
  )
}
