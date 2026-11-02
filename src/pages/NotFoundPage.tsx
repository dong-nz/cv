import { Link } from 'react-router'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/InView'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useI18n } from '@/i18n/provider'

// The in-app 404 (spec-v8 §2.1): what a visitor sees when the SPA itself
// navigates to a dead link (dev server, preview, or a stale internal link).
// Direct hits on unknown URLs are answered by nginx with a real 404 and the
// generated dist/404.html — this page is the client-side counterpart, sharing
// the same ui/common notFound text.
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export function NotFoundPage() {
  const { ui: s } = useI18n()

  return (
    <InView>
      <motion.section
        className="section container-content"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <SectionHeading level="h1" title={s.common.notFoundTitle} />
        <div className="page-body">
          <p>{s.common.notFoundBody}</p>
          <p>
            <Link to="/">{s.common.notFoundHome}</Link>
          </p>
        </div>
      </motion.section>
    </InView>
  )
}
