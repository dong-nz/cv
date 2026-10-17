import { motion } from 'motion/react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { InView } from '@/components/ui/InView'
import { profile } from '@/data/profile'
import { skillGroups } from '@/data/skills'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { useField } from '@/i18n/useField'

export function AboutPage() {
  const { lang } = useLanguage()
  return (
    <>
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
          <SectionHeading
            title={strings.about.heading[lang]}
            subtitle={strings.about.subtitle[lang]}
            tag={strings.about.heading[lang]}
          />
          <p className="prose-lede lede-wide">
            {useField(profile.bio, profile.bioEn)}
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
                <h3>{point.title}</h3>
                <p>{point.description}</p>
                <div className="philosophy-keywords">
                  {point.keywords.map((kw) => (
                    <Tag key={kw}>{kw}</Tag>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <h3 className="subheading">
            {strings.about.exploringTitlePage[lang]}
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
      <InView>
        <motion.section
          className="section container-wide"
          aria-labelledby="expertise-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
        >
          <SectionHeading title={strings.about.expertise[lang]} />
          <div className="expertise-grid">
            {skillGroups.map((group, i) => (
              <motion.div
                key={group.title}
                className="expertise-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3>{useField(group.title, group.titleEn)}</h3>
                <ul className="expertise-skills">
                  {group.skills.map((skill: string) => (
                    <li key={skill} className="expertise-skill">
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </InView>
    </>
  )
}
