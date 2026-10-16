import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { profile } from '@/data/profile'
import { skillGroups } from '@/data/skills'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { useField } from '@/i18n/useField'

export function AboutPage() {
  const { lang } = useLanguage()
  return (
    <>
    <AnimatedSection>
      <section className="section container-content" aria-labelledby="about-heading">
        <SectionHeading
          title={strings.about.heading[lang]}
          subtitle={strings.about.subtitle[lang]}
          tag={strings.about.heading[lang]}
        />
        <div className="page-body">
          <p className="prose-lede">
            {useField(profile.bio, profile.bioEn)}
          </p>

          <h3 className="subheading">
            {strings.about.engineeringTitle[lang]}
          </h3>
          <div className="philosophy-grid">
            {profile.philosophy.map((point) => (
              <div key={point.title} className="philosophy-card">
                <h3>{point.title}</h3>
                <p>{point.description}</p>
                <div className="philosophy-keywords">
                  {point.keywords.map((kw) => (
                    <Tag key={kw}>{kw}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h3 className="subheading">
            {strings.about.exploringTitlePage[lang]}
          </h3>
          <div className="interests-list">
            {profile.currentInterests.map((interest) => (
              <Tag key={interest} accent>
                {interest}
              </Tag>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
    <AnimatedSection>
      <section className="section container-wide" aria-labelledby="expertise-heading">
        <SectionHeading title={strings.about.expertise[lang]} />
        <div className="expertise-grid">
          {skillGroups.map((group) => (
            <div key={group.title} className="expertise-card">
              <h3>{useField(group.title, group.titleEn)}</h3>
              <ul className="expertise-skills">
                {group.skills.map((skill: string) => (
                  <li key={skill} className="expertise-skill">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </AnimatedSection>
    </>
  )
}
