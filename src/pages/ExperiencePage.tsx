import { motion } from 'motion/react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { InView } from '@/components/ui/InView'
import { EditableText } from '@/components/ui/EditableText'
import { useI18n } from '@/i18n/provider'

export function ExperiencePage() {
  const { ui: s, content: c } = useI18n()
  return (
    <InView>
      <motion.section
        className="section container-content"
        aria-labelledby="experience-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <SectionHeading title={s.experience.heading} tag={s.common.experienceTag} />
        <div className="timeline">
          {c.experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              className={exp.variant ? `timeline-entry timeline-entry-${exp.variant}` : 'timeline-entry'}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
            >
              <div className="timeline-marker" />
              <div className="timeline-header">
                <EditableText as="div" className="timeline-title" path={`experience.${exp.id}.title`} label={s.edit.fields.expTitle}>
                  {exp.title}
                </EditableText>
                <div className="timeline-company">{exp.company}</div>
                <div className="timeline-meta">
                  <span className="timeline-duration">{exp.duration}</span>
                  {exp.location && <span className="timeline-location">{exp.location}</span>}
                </div>
              </div>
              <ul className="timeline-responsibilities">
                {exp.responsibilities.map((r, ri) => (
                  <EditableText
                    as="li"
                    key={ri}
                    path={`experience.${exp.id}.responsibilities[${ri}]`}
                    label={`${exp.title} — ${s.edit.fields.responsibility} ${ri + 1}`}
                  >
                    {r}
                  </EditableText>
                ))}
              </ul>
            </motion.div>
          ))}
          <div className="timeline-tldr">
            <span className="timeline-tldr-marker" aria-hidden="true" />
            <span className="timeline-tldr-chip">{s.experience.tldr}</span>
            <p className="timeline-tldr-text">{s.experience.tldrText}</p>
          </div>
        </div>
      </motion.section>
    </InView>
  )
}
