import { motion } from 'motion/react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { InView } from '@/components/ui/InView'
import { EditableText } from '@/components/ui/EditableText'
import { useI18n } from '@/i18n/provider'

export function AboutPage() {
  const { ui: s, content: c } = useI18n()
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
            title={s.about.heading}
            subtitle={s.about.subtitle}
            tag={s.about.heading}
          />
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
            {s.about.exploringTitlePage}
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
          <SectionHeading title={s.about.expertise} />
          <div className="expertise-grid">
            {c.skillGroups.map((group, i) => (
              <motion.div
                key={group.id}
                className="expertise-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <EditableText as="h3" path={`skills.${group.id}.title`} label={s.edit.fields.groupTitle}>
                  {group.title}
                </EditableText>
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
