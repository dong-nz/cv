import { SectionHeading } from '@/components/ui/SectionHeading'
import { experiences } from '@/data/experience'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { useField, useFieldArray } from '@/i18n/useField'

export function ExperiencePage() {
  const { lang } = useLanguage()
  return (
    <section className="section container-content" aria-labelledby="experience-heading">
      <SectionHeading title={strings.experience.heading[lang]} tag={strings.common.experienceTag[lang]} />
      <div className="timeline">
        {experiences.map((exp) => (
          <div key={exp.id} className="timeline-entry">
            <div className="timeline-marker" />
            <div className="timeline-header">
              <div className="timeline-title">{useField(exp.title, exp.titleEn)}</div>
              <div className="timeline-company">{exp.company}</div>
              <div className="timeline-duration">{exp.duration}</div>
              {exp.location && (
                <div className="timeline-duration">{exp.location}</div>
              )}
            </div>
            <ul className="timeline-responsibilities">
              {useFieldArray(exp.responsibilities, exp.responsibilitiesEn).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {exp.achievements?.map((achievement) => (
              <div key={achievement.id} className="achievement">
                <div className="achievement-title">{achievement.title}</div>
                <div className="achievement-context">{useField(achievement.context, achievement.contextEn)}</div>
                <div className="achievement-impact">
                  {useField(achievement.impact, achievement.impactEn)}
                </div>
                {achievement.metrics && achievement.metrics.length > 0 && (
                  <div className="achievement-metrics">
                    {achievement.metrics.map((m) => (
                      <span key={m} className="achievement-metric">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
                <div className="achievement-techs">
                  {achievement.technologies.map((tech) => (
                    <span key={tech} className="tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
