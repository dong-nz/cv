import { SectionHeading } from '@/components/ui/SectionHeading'
import { DownloadResume } from '@/components/sections/DownloadResume'
import { ContactLinks } from '@/components/ui/ContactLinks'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/InView'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
export function ContactPage() {
  const { lang } = useLanguage()
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
      <SectionHeading title={strings.contact.heading[lang]} tag={strings.common.contactTag[lang]} />
      <ContactLinks />
      <DownloadResume />
      </motion.section>
    </InView>
  )
}
