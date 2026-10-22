import { SectionHeading } from '@/components/ui/SectionHeading'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/InView'
import { useI18n } from '@/i18n/provider'

import { Link } from 'react-router'


const MotionLink = motion.create(Link)

export function ProjectsListPage() {
  const { ui: s, content: c } = useI18n()
  return (
    <InView>
      <motion.section
        className="section container-wide"
        aria-labelledby="projects-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <SectionHeading title={s.projects.all} tag={s.projects.all} />
        <div className="projects-grid">
          {c.projects.map((project, i) => (
            <MotionLink
              key={project.id}
              to={`/projects/${project.id}`}
              className="project-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <Badge variant="outline">
                  {s.projects.categories[project.category]}
                </Badge>
              </div>
              <p className="project-card-summary">{project.summary}</p>
              <div className="project-card-techs">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span key={tech} className="tag">
                    {tech}
                  </span>
                ))}
              </div>
              <span className="project-card-cta">{s.projects.viewDetails} →</span>
            </MotionLink>
          ))}
        </div>
      </motion.section>
    </InView>
  )
}
