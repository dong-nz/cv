import { useParams, Link } from 'react-router'
import { motion, type Transition } from 'motion/react'
import { Badge } from '@/components/ui/Badge'
import { Tag } from '@/components/ui/Tag'
import { EditableText } from '@/components/ui/EditableText'
import { InView } from '@/components/ui/InView'
import { useI18n } from '@/i18n/provider'
import { TagListEditor } from '@/components/ui/TagListEditor'
import { RecordControls, AddGhost } from '@/components/ui/RecordControls'
import { RecordSettings, ProjectSettingsPanel } from '@/components/ui/RecordSettings'
import { useEdit } from '@/hooks/useEdit'
import { useState } from 'react'
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
  const { ui: s, content: c } = useI18n()
  const edit = useEdit()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const project = c.projects.find((p) => p.id === id)
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
          <h2>{s.projectDetail.notFound}</h2>
          <p>
            <Link to="/projects">{s.projectDetail.backToProjects} ←</Link>
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
          {s.projectDetail.backToProjects} ←
        </Link>

        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={itemTransition(0)}
        >
          <EditableText as="h1" id="project-title" style={{ flex: 1 }} path={`projects.${project.id}.title`} label={s.edit.fields.title}>
            {project.title}
          </EditableText>
          <Badge variant="outline">{s.projects.categories[project.category]}</Badge>
          {edit && (
            <RecordControls
              label={project.title}
              onDelete={() => edit.deleteRecord('project', { id: project.id })}
              onSettings={() => setSettingsOpen(true)}
            />
          )}
        </motion.div>

        <EditableText
          as={motion.p}
          className="prose-lede"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={itemTransition(0.08)}
          path={`projects.${project.id}.summary`}
          label={`${project.title} — ${s.edit.fields.summary}`}
          multiline
        >
          {project.summary}
        </EditableText>

        <div className="prose">
          {(edit || (project.metrics?.length ?? 0) > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={itemTransition(0.16)}
            >
              <h3>{s.projectDetail.impact}</h3>
              <TagListEditor
                arrayPath={`projects.${project.id}.metrics`}
                items={project.metrics ?? []}
                containerAs="div"
                containerClassName="project-metrics"
                as="span"
                itemClassName="achievement-metric"
                labelPrefix={`${project.title} — ${s.edit.fields.metric}`}
                addLabel={s.edit.addMetric}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={itemTransition(0.24)}
          >
            <h3>{s.projectDetail.role}</h3>
            <EditableText as="p" path={`projects.${project.id}.role`} label={s.edit.fields.projectRole}>
              {project.role}
            </EditableText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={itemTransition(0.32)}
          >
            <h3>{s.projectDetail.technologies}</h3>
            <TagListEditor
              doc="projects"
              arrayPath={`[${c.projects.findIndex((p) => p.id === project.id)}].technologies`}
              items={project.technologies}
              containerAs="div"
              containerClassName="philosophy-keywords"
              as={Tag}
              labelPrefix={`${project.title} — ${s.edit.fields.technology}`}
              addLabel={s.edit.addTechnology}
            />
          </motion.div>

          {(edit || (project.sections?.length ?? 0) > 0) && (
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={itemTransition(0.4)}
              >
                {s.projectDetail.experiments}
              </motion.h3>
              {project.sections.map((section, idx) => (
                <motion.div
                  key={section.id}
                  className={edit ? 'project-section edit-record-host' : 'project-section'}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={itemTransition(0.48 + idx * 0.08)}
                >
                  {edit && (
                    <RecordControls
                      label={section.title}
                      canUp={idx > 0}
                      canDown={idx < (project.sections?.length ?? 0) - 1}
                      onUp={() => edit.moveItem('projects', `[${c.projects.findIndex((p) => p.id === project.id)}].sections`, idx, idx - 1)}
                      onDown={() => edit.moveItem('projects', `[${c.projects.findIndex((p) => p.id === project.id)}].sections`, idx, idx + 1)}
                      onDelete={() => edit.deleteRecord('section', { id: section.id, projectId: project.id })}
                    />
                  )}
                  <EditableText as="h4" path={`projects.${project.id}.sections.${section.id}.title`} label={`${section.title} — ${s.edit.fields.sectionTitle}`}>
                    {section.title}
                  </EditableText>
                  <EditableText as="p" path={`projects.${project.id}.sections.${section.id}.content`} label={`${section.title} — ${s.edit.fields.sectionContent}`} multiline>
                    {section.content}
                  </EditableText>
                  <Tag accent>{section.type}</Tag>
                </motion.div>
              ))}
              {edit && (
                <AddGhost
                  label={s.edit.addSection}
                  onClick={() => edit.addRecord('section', { projectId: project.id })}
                />
              )}
            </div>
          )}
        </div>
        {edit && settingsOpen && (
          <RecordSettings title={s.edit.settings} onClose={() => setSettingsOpen(false)}>
            <ProjectSettingsPanel project={project} />
          </RecordSettings>
        )}
      </motion.section>
    </InView>
  )
}
