import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface AnimatedChartProps {
  children: ReactNode
  title?: string
  delay?: number
  className?: string
}

export function AnimatedChart({ children, title, delay = 0, className = '' }: AnimatedChartProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const containerVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      className={`space-y-4 ${className}`}
    >
      {title && (
        <motion.h3 
          variants={itemVariants}
          className="text-lg font-semibold font-display text-foreground"
        >
          {title}
        </motion.h3>
      )}
      <motion.div
        variants={itemVariants}
        className="bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// Animated bar chart component for loading effects
export function AnimatedBarChart({ data, colors }: { data: number[], colors: string[] }) {
  const maxData = Math.max(...data)
  
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((value, index) => (
        <motion.div
          key={index}
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: `${(value / maxData) * 100}%`, 
            opacity: 1 
          }}
          transition={{ 
            duration: 0.8, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          className="flex-1 rounded-t-md"
          style={{ backgroundColor: colors[index % colors.length] }}
        />
      ))}
    </div>
  )
}

// Animated KPI card with number counting effect
export function AnimatedKPICard({ 
  value, 
  label, 
  color, 
  delay = 0 
}: { 
  value: number
  label: string
  color: string
  delay?: number 
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (isVisible && displayValue < value) {
      const increment = value / 50
      const timer = setTimeout(() => {
        setDisplayValue(prev => Math.min(prev + increment, value))
      }, 20)
      return () => clearTimeout(timer)
    }
  }, [isVisible, displayValue, value])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut"
      }}
      className="bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="space-y-2">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '2rem' }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
          className="h-1 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div className="text-2xl font-bold font-primary text-foreground">
          {Math.round(displayValue).toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {label}
        </div>
      </div>
    </motion.div>
  )
}
