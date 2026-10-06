import { motion } from "motion/react"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { skillGroups } from "@/data/skills"
import { InView } from "@/components/ui/InView"

export function Expertise() {
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
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        <SectionHeading title="Core Expertise" />
        <div className="expertise-grid">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.title}
              className="expertise-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: i * 0.1 },
                },
              }}
              whileHover={{ scale: 1.05, y: -2 }}
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
