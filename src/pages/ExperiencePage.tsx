import { SectionHeading } from '@/components/ui/SectionHeading'
import { experiences } from '@/data/experience'

export function ExperiencePage() {
  return (
    <section className="section container-content" aria-labelledby="experience-heading">
      <SectionHeading title="Experience" tag="03 - Experience" />
      <div className="timeline">
        {experiences.map((exp) => (
          <div key={exp.id} className="timeline-entry">
            <div className="timeline-marker" />
            <div className="timeline-header">
              <div className="timeline-title">{exp.title}</div>
              <div className="timeline-company">{exp.company}</div>
              <div className="timeline-duration">{exp.duration}</div>
              {exp.location && (
                <div className="timeline-duration">{exp.location}</div>
              )}
            </div>
            <ul className="timeline-responsibilities">
              {exp.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {exp.achievements?.map((achievement) => (
              <div key={achievement.id} className="achievement">
                <div className="achievement-title">{achievement.title}</div>
                <div className="achievement-context">{achievement.context}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {achievement.impact}
                </div>
                {achievement.metrics && achievement.metrics.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
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
