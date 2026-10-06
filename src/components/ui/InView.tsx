import { motion, type MotionProps } from "motion/react"
import type { ReactNode } from "react"

interface InViewProps extends Omit<MotionProps, "children"> {
  children: ReactNode
  delay?: number
  threshold?: number
  className?: string
}

export function InView({
  children,
  delay = 0,
  threshold = 0.1,
  className,
  ...props
}: InViewProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
