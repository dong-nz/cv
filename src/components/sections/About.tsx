import { SectionHeading } from '@/components/ui/SectionHeading'
import { InView } from '@/components/ui/InView'
import { Tag } from '@/components/ui/Tag'
import { profile } from '@/data/profile'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { useField } from '@/i18n/useField'
export function About() {
  const { lang } = useLanguage()
  return (
    <InView>
    <section className="section container-wide" aria-labelledby="about-heading">
      <SectionHeading title={strings.about.heading[lang]} tag={strings.about.heading[lang]} />
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
          {strings.about.exploringTitle[lang]}
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
    </InView>
  )
}
