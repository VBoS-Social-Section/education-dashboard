import { motion } from 'framer-motion'
import { Button } from './button'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
  delay?: number
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, delay = 0, className = '', ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.3, 
          delay,
          ease: "easeOut"
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <Button
          ref={ref}
          className={cn("transition-all duration-200", className)}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'
