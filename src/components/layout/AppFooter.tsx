interface AppFooterProps {
  /** Optional: use compact layout for standalone pages */
  compact?: boolean
}

export function AppFooter({ compact }: AppFooterProps) {
  return (
    <footer
      className={
        compact
          ? 'mt-auto border-t border-border/60 py-4 text-center text-xs text-muted-foreground'
          : 'mt-auto border-t border-border/60 px-4 py-4 lg:px-6 text-center text-sm text-muted-foreground'
      }
    >
      <p>© {new Date().getFullYear()} Vanuatu Bureau of Statistics</p>
      <p className="mt-1 text-xs opacity-80">What&apos;s new: Feb 2026 — 2025 Annual Statistics, DV trends, comparison mode, trend lines</p>
    </footer>
  )
}
