import { motion } from "motion/react"
import { experiences } from "@/data/experience"
import { InView } from "@/components/ui/InView"

export function Experience() {
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
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        <motion.h2
          id="experience-heading"
          style={{ marginBottom: "48px" }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
          }}
        >
          Experience
        </motion.h2>
        <div className="timeline">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.id}
              className="timeline-entry"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: i * 0.15 },
                },
              }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
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
                  <div className="achievement-title">
                    {achievement.title}
                  </div>
                  <div className="achievement-context">
                    {achievement.context}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    {achievement.impact}
                  </div>
                  {achievement.metrics &&
                    achievement.metrics.length > 0 && (
                      <div style={{ marginBottom: "8px" }}>
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
            </motion.div>
          ))}
        </div>
      </motion.section>
    </InView>
  )
}
