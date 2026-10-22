import { motion } from "motion/react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { InView } from '@/components/ui/InView'
import { useI18n } from '@/i18n/provider'

export function Expertise() {
  const { ui: s, content: c } = useI18n()
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
              className="expertise-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3>{group.title}</h3>
              <ul className="expertise-skills">
                {group.skills.map((skill) => (
                  <li key={skill} className="expertise-skill">
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </InView>
  )
}
