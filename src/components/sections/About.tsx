import { SectionHeading } from '@/components/ui/SectionHeading'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/InView'
import { Tag } from '@/components/ui/Tag'
import { profile } from '@/data/profile'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { field } from '@/i18n/field'
export function About() {
  const { lang } = useLanguage()
  return (
    <InView>
      <motion.section
        className="section container-wide"
        aria-labelledby="about-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <SectionHeading title={strings.about.heading[lang]} tag={strings.about.heading[lang]} />
        <p className="prose-lede lede-wide">
          {field(lang, profile.bio, profile.bioEn)}
        </p>

        <h3 className="subheading">
          {strings.about.engineeringTitle[lang]}
        </h3>
        <div className="philosophy-grid">
          {profile.philosophy.map((point, i) => (
            <motion.div
              key={point.title}
              className="philosophy-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3>{field(lang, point.title, point.titleEn)}</h3>
              <p>{field(lang, point.description, point.descriptionEn)}</p>
              <div className="philosophy-keywords">
                {point.keywords.map((kw) => (
                  <Tag key={kw}>{kw}</Tag>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <h3 className="subheading">
          {strings.about.exploringTitle[lang]}
        </h3>
        <div className="interests-list">
          {profile.currentInterests.map((interest) => (
            <Tag key={interest} accent>
              {interest}
            </Tag>
          ))}
        </div>
      </motion.section>
    </InView>
  )
}
