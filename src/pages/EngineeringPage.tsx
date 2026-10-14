import { SectionHeading } from '@/components/ui/SectionHeading'
import { Tag } from '@/components/ui/Tag'
import { profile } from '@/data/profile'

import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
const engineeringCategoryKeys = ['architecture', 'ai_ml', 'experiments'] as const
export function EngineeringPage() {
  const { lang } = useLanguage()
  return (
    <section className="section container-content" aria-labelledby="engineering-heading">
      <SectionHeading title={strings.engineering.heading[lang]} tag={strings.engineering.heading[lang]} />

      {engineeringCategoryKeys.map((catKey) => (
        <div key={catKey} style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px', color: 'var(--text-primary)' }}>
            {strings.engineering.categories[catKey][lang]}
          </h3>
          {/* Placeholder for expanded content */}
          <p style={{ color: 'var(--text-secondary)' }}>
            {strings.engineering.comingSoon[lang].replace('%s', strings.engineering.categories[catKey][lang])}
          </p>
          <div className="philosophy-keywords" style={{ marginTop: '16px' }}>
            {profile.currentInterests.filter((i) => i.includes(catKey)).map((kw) => (
              <Tag key={kw} accent>{kw}</Tag>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
