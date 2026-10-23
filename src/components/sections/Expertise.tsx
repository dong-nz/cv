import { motion } from "motion/react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { InView } from '@/components/ui/InView'
import { EditableText } from '@/components/ui/EditableText'
import { TagListEditor } from '@/components/ui/TagListEditor'
import { RecordControls, AddGhost } from '@/components/ui/RecordControls'
import { useEdit } from '@/hooks/useEdit'
import { useI18n } from '@/i18n/provider'

export function Expertise() {
  const { ui: s, content: c } = useI18n()
  const edit = useEdit()
  return (
    <InView>
      <motion.section
        className="section container-wide"
        aria-labelledby="expertise-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <SectionHeading title={s.expertise.heading} tag={s.expertise.heading} />
        <div className="expertise-grid">
          {c.skillGroups.map((group, i) => (
            <motion.div
              key={group.id}
              className={edit ? 'expertise-card edit-record-host' : 'expertise-card'}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {edit && (
                <RecordControls
                  label={group.title}
                  canUp={i > 0}
                  canDown={i < c.skillGroups.length - 1}
                  onUp={() => edit.moveItem('skills', '', i, i - 1)}
                  onDown={() => edit.moveItem('skills', '', i, i + 1)}
                  onDelete={() => edit.deleteRecord('skill-group', { id: group.id })}
                />
              )}
              <EditableText as="h3" path={`skills.${group.id}.title`} label={s.edit.fields.groupTitle}>
                {group.title}
              </EditableText>
              <TagListEditor
                doc="skills"
                arrayPath={`[${i}].skills`}
                items={group.skills}
                containerAs="ul"
                containerClassName="expertise-skills"
                as="li"
                itemClassName="expertise-skill"
                labelPrefix={`${group.title} — ${s.edit.fields.skill}`}
                addLabel={s.edit.addSkill}
              />
            </motion.div>
          ))}
          {edit && <AddGhost variant="card" label={s.edit.addSkillGroup} onClick={() => edit.addRecord('skill-group')} />}
        </div>
      </motion.section>
    </InView>
  )
}
