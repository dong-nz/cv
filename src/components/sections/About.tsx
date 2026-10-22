import { SectionHeading } from '@/components/ui/SectionHeading'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/InView'
import { Tag } from '@/components/ui/Tag'
import { EditableText } from '@/components/ui/EditableText'
import { useI18n } from '@/i18n/provider'
export function About() {
  const { ui: s, content: c } = useI18n()
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
        <SectionHeading title={s.about.heading} tag={s.about.heading} />
        <EditableText
          as="p"
          className="prose-lede lede-wide"
          path="profile.bio"
          label={s.edit.fields.bio}
          multiline
        >
          {c.profile.bio}
        </EditableText>

        <h3 className="subheading">
          {s.about.engineeringTitle}
        </h3>
        <div className="philosophy-grid">
          {c.profile.philosophy.map((point, i) => (
            <motion.div
              key={point.id}
              className="philosophy-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <EditableText as="h3" path={`profile.philosophy.${point.id}.title`} label={s.edit.fields.pointTitle}>
                {point.title}
              </EditableText>
              <EditableText as="p" path={`profile.philosophy.${point.id}.description`} label={s.edit.fields.pointDescription} multiline>
                {point.description}
              </EditableText>
              <div className="philosophy-keywords">
                {point.keywords.map((kw) => (
                  <Tag key={kw}>{kw}</Tag>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <h3 className="subheading">
          {s.about.exploringTitle}
        </h3>
        <div className="interests-list">
          {c.profile.currentInterests.map((interest) => (
            <Tag key={interest} accent>
              {interest}
            </Tag>
          ))}
        </div>
      </motion.section>
    </InView>
  )
}
