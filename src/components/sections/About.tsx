import { SectionHeading } from '@/components/ui/SectionHeading'
import { InView } from '@/components/ui/InView'
import { Tag } from '@/components/ui/Tag'
import { profile } from '@/data/profile'

export function About() {
  return (
    <InView>
    <section className="section container-wide" aria-labelledby="about-heading">
      <SectionHeading title="About Me" />
      <div style={{ maxWidth: '700px' }}>
        <p style={{ fontSize: '18px', marginBottom: '32px' }}>
          {profile.bio}
        </p>

        <h3 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>
          How I Think About Engineering
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

        <h3 style={{ fontSize: '20px', marginTop: '32px', marginBottom: '12px', color: 'var(--text-primary)' }}>
          What I'm Exploring
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
