import { SectionHeading } from '@/components/ui/SectionHeading'
import { skillGroups } from '@/data/skills'

export function Expertise() {
  return (
    <section className="section container-wide" aria-labelledby="expertise-heading">
      <SectionHeading title="Core Expertise" />
      <div className="expertise-grid">
        {skillGroups.map((group) => (
          <div key={group.title} className="expertise-card">
            <h3>{group.title}</h3>
            <ul className="expertise-skills">
              {group.skills.map((skill) => (
                <li key={skill} className="expertise-skill">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
