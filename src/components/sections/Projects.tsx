import { SectionHeading } from '@/components/ui/SectionHeading'
import { Link } from "react-router"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/Badge"
import { InView } from "@/components/ui/InView"
import { EditableText } from '@/components/ui/EditableText'
import { TagListEditor } from '@/components/ui/TagListEditor'
import { RecordControls } from '@/components/ui/RecordControls'
import { RecordSettings, ProjectSettingsPanel } from '@/components/ui/RecordSettings'
import { useEdit } from '@/hooks/useEdit'
import { useI18n } from '@/i18n/provider'
import { useState } from 'react'

const MotionLink = motion.create(Link)

export function Projects() {
  const { ui: s, content: c } = useI18n()
  const edit = useEdit()
  const [settingsFor, setSettingsFor] = useState<string | null>(null)
  const featured = c.projects.filter((p) => p.featured).slice(0, 4)

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
        <SectionHeading title={s.projects.featured} tag={s.projects.featured} />
        <Link
          to="/projects"
          className="section-cta"
        >
          {s.projects.viewAll} →
        </Link>
        <div className="projects-grid">
          {featured.map((project, i) => {
            // Structure paths are relative to the document array, so the
            // control writes address the record by its real index, not the
            // featured-subset index it happens to render at.
            const docIndex = c.projects.findIndex((p) => p.id === project.id)
            const card = (
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
                <div className="project-card-content">
                  <div className="project-card-header">
                    <EditableText as="h3" path={`projects.${project.id}.title`} label={s.edit.fields.title}>
                      {project.title}
                    </EditableText>
                    <Badge variant="outline">
                      {s.projects.categories[project.category]}
                    </Badge>
                  </div>
                  <EditableText as="p" className="project-card-summary" path={`projects.${project.id}.summary`} label={`${project.title} — ${s.edit.fields.summary}`}>
                    {project.summary}
                  </EditableText>
                  {edit ? (
                    <TagListEditor
                      doc="projects"
                      arrayPath={`[${docIndex}].technologies`}
                      items={project.technologies}
                      containerAs="div"
                      containerClassName="project-card-techs"
                      as="span"
                      itemClassName="tag"
                      labelPrefix={`${project.title} — ${s.edit.fields.technology}`}
                      addLabel={s.edit.addTechnology}
                    />
                  ) : (
                    <div className="project-card-techs">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span key={tech} className="tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {(edit || (project.metrics?.length ?? 0) > 0) && (
                    <TagListEditor
                      arrayPath={`projects.${project.id}.metrics`}
                      items={project.metrics ?? []}
                      containerAs="div"
                      containerClassName="project-card-metrics"
                      as="span"
                      itemClassName="achievement-metric"
                      labelPrefix={`${project.title} — ${s.edit.fields.metric}`}
                      addLabel={s.edit.addMetric}
                    />
                  )}
                  <span className="project-card-cta">{s.projects.viewDetails} →</span>
                </div>
              </MotionLink>
            )
            // A card body is a link; its controls sit beside it, in an
            // edit-mode shell that keeps the grid layout intact.
            return edit ? (
              <div key={project.id} className="edit-record-shell">
                <RecordControls
                  label={project.title}
                  onDelete={() => edit.deleteRecord('project', { id: project.id })}
                  onSettings={() => setSettingsFor(project.id)}
                />
                {card}
              </div>
            ) : (
              card
            )
          })}
        </div>
        {edit && settingsFor && (
          <RecordSettings title={s.edit.settings} onClose={() => setSettingsFor(null)}>
            {(() => {
              const project = c.projects.find((p) => p.id === settingsFor)
              return project ? <ProjectSettingsPanel project={project} /> : null
            })()}
          </RecordSettings>
        )}
      </motion.section>
    </InView>
  )
}
