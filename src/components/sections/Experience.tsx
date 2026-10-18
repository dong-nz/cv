import { SectionHeading } from '@/components/ui/SectionHeading'
import { motion } from "motion/react"
import { experiences } from "@/data/experience"
import { InView } from "@/components/ui/InView"
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { field } from '@/i18n/field'

export function Experience() {
  const { lang } = useLanguage()
  return (
    <InView>
      <motion.section
        className="section container-wide"
        aria-labelledby="experience-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <SectionHeading title={strings.experience.heading[lang]} tag={strings.experience.heading[lang]} />
        <div className="page-body">
        <div className="timeline">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              className={exp.variant ? `timeline-entry timeline-entry-${exp.variant}` : 'timeline-entry'}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.08 }}
            >
              <div className="timeline-marker" />
              <div className="timeline-header">
                <div className="timeline-title">
                  {field(lang, exp.title, exp.titleEn)}
                </div>
                <div className="timeline-company">{exp.company}</div>
                <div className="timeline-meta">
                  <span className="timeline-duration">{exp.duration}</span>
                  {exp.location && (
                    <span className="timeline-location">{exp.location}</span>
                  )}
                </div>
              </div>
              <ul className="timeline-responsibilities">
                {field(lang, exp.responsibilities, exp.responsibilitiesEn).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        <div className="timeline-tldr">
          <span className="timeline-tldr-marker" aria-hidden="true" />
          <span className="timeline-tldr-chip">{strings.experience.tldr[lang]}</span>
          <p className="timeline-tldr-text">{strings.experience.tldrText[lang]}</p>
        </div>
        </div>
        </div>
      </motion.section>
    </InView>
  )
}
