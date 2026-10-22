import { SectionHeading } from '@/components/ui/SectionHeading'
import { ContactLinks } from '@/components/ui/ContactLinks'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/InView'
import { useI18n } from '@/i18n/provider'
export function ContactPage() {
  const { ui: s } = useI18n()
  return (
    <InView>
      <motion.section
        className="section container-content"
        aria-labelledby="contact-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
      <SectionHeading title={s.contact.heading} tag={s.common.contactTag} />
      <ContactLinks />
      </motion.section>
    </InView>
  )
}
