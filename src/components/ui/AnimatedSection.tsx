import { motion } from "motion/react"
import { InView } from "@/components/ui/InView"
import type { ReactNode } from "react"

interface AnimatedSectionProps {
  direction?: "up" | "right" | "left"
  delay?: number
  children: ReactNode
}

function getDirection(direction: 'up' | 'right' | 'left') {
  switch (direction) {
    case 'up': return { y: [40, 0], opacity: [0, 1] }
    case 'right': return { x: [-40, 0], opacity: [0, 1] }
    case 'left': return { x: [40, 0], opacity: [0, 1] }
  }
}

export function AnimatedSection({
  direction = "up",
  delay = 0,
  children,
}: AnimatedSectionProps) {
  const { y, opacity } = getDirection(direction)
  return (
    <InView>
      <motion.div
        initial={{ y, opacity }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -50px 0px" }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {children}
      </motion.div>
    </InView>
  )
}
