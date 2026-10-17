import { useParams, Link } from 'react-router'
import { motion, type Transition } from 'motion/react'
import { Badge } from '@/components/ui/Badge'
import { Tag } from '@/components/ui/Tag'
import { InView } from '@/components/ui/InView'
import { projects } from '@/data/projects'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { useField } from '@/i18n/useField'

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const itemTransition = (delay: number): Transition => ({
  duration: 0.45,
  ease: 'easeOut',
  delay,
})

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLanguage()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <InView>
        <motion.section
          className="section container-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={sectionVariants}
        >
          <h2>{strings.projectDetail.notFound[lang]}</h2>
          <p>
            <Link to="/projects">{strings.projectDetail.backToProjects[lang]} ←</Link>
          </p>
        </motion.section>
      </InView>
    )
  }

  return (
    <InView>
      <motion.section
        className="section container-content"
        aria-labelledby="project-title"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <Link to="/projects" className="back-link">
          {strings.projectDetail.backToProjects[lang]} ←
        </Link>

        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={itemTransition(0)}
        >
          <h1 id="project-title" style={{ flex: 1 }}>{project.title}</h1>
          <Badge variant="outline">{strings.projects.categories[project.category][lang]}</Badge>
        </motion.div>

        <motion.p
          className="prose-lede"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={itemTransition(0.08)}
        >
          {useField(project.summary, project.summaryEn)}
        </motion.p>

        <div className="prose">
          {project.metrics && project.metrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={itemTransition(0.16)}
            >
              <h3>{strings.projectDetail.impact[lang]}</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {project.metrics.map((m) => (
                  <span key={m} className="achievement-metric">
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={itemTransition(0.24)}
          >
            <h3>{strings.projectDetail.role[lang]}</h3>
            <p>{project.role}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={itemTransition(0.32)}
          >
            <h3>{strings.projectDetail.technologies[lang]}</h3>
            <div className="philosophy-keywords">
              {project.technologies.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </motion.div>

          {project.sections && project.sections.length > 0 && (
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={itemTransition(0.4)}
              >
                {strings.projectDetail.experiments[lang]}
              </motion.h3>
              {project.sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  className="project-section"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={itemTransition(0.48 + idx * 0.08)}
                >
                  <h4>{useField(section.title, section.titleEn)}</h4>
                  <p>{useField(section.content, section.contentEn)}</p>
                  <Tag accent>{section.type}</Tag>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </InView>
  )
}
