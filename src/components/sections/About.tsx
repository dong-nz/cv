import { SectionHeading } from '@/components/ui/SectionHeading'
import { motion } from 'motion/react'
import { InView } from '@/components/ui/InView'
import { Tag } from '@/components/ui/Tag'
import { EditableText } from '@/components/ui/EditableText'
import { TagListEditor } from '@/components/ui/TagListEditor'
import { RecordControls, AddGhost } from '@/components/ui/RecordControls'
import { useEdit } from '@/hooks/useEdit'
import { useI18n } from '@/i18n/provider'
export function About() {
  const { ui: s, content: c } = useI18n()
  const edit = useEdit()
  return (
    <InView>
      <motion.section
        className="section container-wide"
        aria-labelledby="about-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
      >
        <SectionHeading title={s.about.heading} tag={s.about.heading} />
        <EditableText
          as="p"
          className="prose-lede lede-wide"
          path="profile.bio"
          label={s.edit.fields.bio}
          multiline
        >
          {c.profile.bio}
        </EditableText>

        <h3 className="subheading">
          {s.about.engineeringTitle}
        </h3>
        <div className="philosophy-grid">
          {c.profile.philosophy.map((point, i) => (
            <motion.div
              key={point.id}
              className={edit ? 'philosophy-card edit-record-host' : 'philosophy-card'}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              {edit && (
                <RecordControls
                  label={point.title}
                  canUp={i > 0}
                  canDown={i < c.profile.philosophy.length - 1}
                  onUp={() => edit.moveItem('profile', 'philosophy', i, i - 1)}
                  onDown={() => edit.moveItem('profile', 'philosophy', i, i + 1)}
                  onDelete={() => edit.deleteRecord('philosophy', { id: point.id })}
                />
              )}
              <EditableText as="h3" path={`profile.philosophy.${point.id}.title`} label={s.edit.fields.pointTitle}>
                {point.title}
              </EditableText>
              <EditableText as="p" path={`profile.philosophy.${point.id}.description`} label={s.edit.fields.pointDescription} multiline>
                {point.description}
              </EditableText>
              <TagListEditor
                arrayPath={`profile.philosophy.${point.id}.keywords`}
                items={point.keywords}
                containerAs="div"
                containerClassName="philosophy-keywords"
                as={Tag}
                labelPrefix={`${point.title} — ${s.edit.fields.pointKeywords}`}
                addLabel={s.edit.addKeyword}
              />
            </motion.div>
          ))}
          {edit && <AddGhost variant="card" label={s.edit.addPhilosophy} onClick={() => edit.addRecord('philosophy')} />}
        </div>

        <h3 className="subheading">
          {s.about.exploringTitle}
        </h3>
        <TagListEditor
          arrayPath="profile.currentInterests"
          items={c.profile.currentInterests}
          containerAs="div"
          containerClassName="interests-list"
          as={Tag}
          accent
          labelPrefix={s.edit.fields.interests}
          addLabel={s.edit.addInterest}
        />
      </motion.section>
    </InView>
  )
}
