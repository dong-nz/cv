import { motion } from "motion/react"

export function OpenToWorkBadge() {
  return (
    <motion.div
      className="otw-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      role="status"
      aria-label="Open to work"
    >
      <svg className="otw-spring" viewBox="0 0 60 120">
        <motion.path
          d="M 30 0 C 50 5, 50 15, 30 20 C 10 25, 10 35, 30 40 C 50 45, 50 55, 30 60 C 10 65, 10 75, 30 80 C 50 85, 50 95, 30 100 C 10 105, 10 115, 30 120 L 30 125"
          stroke="var(--accent)"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <motion.div
        className="otw-badge"
        animate={{ rotate: [-8, 8, -8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>#OpenToWork</span>
      </motion.div>
    </motion.div>
  )
}
