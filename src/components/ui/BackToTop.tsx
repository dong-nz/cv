import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { strings } from '@/i18n/strings'
import { useLanguage } from '@/hooks/useLanguage'

const SCROLL_THRESHOLD = 300

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()
  const { lang } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="back-to-top"
          aria-label={strings.common.backToTop[lang]}
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="20"
            height="20"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}