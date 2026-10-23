import { motion } from 'motion/react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { InView } from '@/components/ui/InView'
import { EditableText } from '@/components/ui/EditableText'
import { TagListEditor } from '@/components/ui/TagListEditor'
import { RecordControls, AddGhost } from '@/components/ui/RecordControls'
import { RecordSettings, ExperienceSettingsPanel } from '@/components/ui/RecordSettings'
import { useEdit } from '@/hooks/useEdit'
import { useI18n } from '@/i18n/provider'
import { useState } from 'react'

export function ExperiencePage() {
  const { ui: s, content: c } = useI18n()
  const edit = useEdit()
  const [settingsFor, setSettingsFor] = useState<string | null>(null)
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
              className={[
                'timeline-entry',
                exp.variant ? `timeline-entry-${exp.variant}` : '',
                edit ? 'edit-record-host' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
            >
              <div className="timeline-marker" />
              {edit && (
                <RecordControls
                  label={exp.title}
                  canUp={i > 0}
                  canDown={i < c.experiences.length - 1}
                  onUp={() => edit.moveItem('experience', '', i, i - 1)}
                  onDown={() => edit.moveItem('experience', '', i, i + 1)}
                  onDelete={() => edit.deleteRecord('experience', { id: exp.id })}
                  onSettings={() => setSettingsFor(exp.id)}
                />
              )}
              <div className="timeline-header">
                <EditableText as="div" className="timeline-title" path={`experience.${exp.id}.title`} label={s.edit.fields.expTitle}>
                  {exp.title}
                </EditableText>
                <EditableText as="div" className="timeline-company" path={`experience.${exp.id}.company`} label={s.edit.fields.company}>
                  {exp.company}
                </EditableText>
                <div className="timeline-meta">
                  <EditableText as="span" className="timeline-duration" path={`experience.${exp.id}.duration`} label={s.edit.fields.duration}>
                    {exp.duration}
                  </EditableText>
                  {exp.location && <span className="timeline-location">{exp.location}</span>}
                </div>
              </div>
              <TagListEditor
                arrayPath={`experience.${exp.id}.responsibilities`}
                items={exp.responsibilities}
                containerAs="ul"
                containerClassName="timeline-responsibilities"
                as="li"
                labelPrefix={`${exp.title} — ${s.edit.fields.responsibility}`}
                addLabel={s.edit.addResponsibility}
              />
            </motion.div>
          ))}
          {edit && <AddGhost label={s.edit.addExperience} onClick={() => edit.addRecord('experience')} />}
          <div className="timeline-tldr">
            <span className="timeline-tldr-marker" aria-hidden="true" />
            <span className="timeline-tldr-chip">{s.experience.tldr}</span>
            <EditableText as="p" className="timeline-tldr-text" path="profile.tldr" label={s.edit.fields.tldr}>
              {c.profile.tldr}
            </EditableText>
          </div>
          {edit && settingsFor && (
            <RecordSettings title={s.edit.settings} onClose={() => setSettingsFor(null)}>
              {(() => {
                const entry = c.experiences.find((e) => e.id === settingsFor)
                return entry ? <ExperienceSettingsPanel entry={entry} /> : null
              })()}
            </RecordSettings>
          )}
        </div>
      </motion.section>
    </InView>
  )
}
