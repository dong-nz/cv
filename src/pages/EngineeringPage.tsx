import { Tag } from '@/components/ui/Tag'
import { profile } from '@/data/profile'

export function EngineeringPage() {
  return (
    <section className="section container-content" aria-labelledby="engineering-heading">
      <h2 id="engineering-heading" style={{ marginBottom: '24px' }}>
        Engineering
      </h2>

      {['Architecture', 'AI / ML', 'Experiments'].map((category) => (
        <div key={category} style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px', color: 'var(--text-primary)' }}>
            {category}
          </h3>
          {/* Placeholder for expanded content */}
          <p style={{ color: 'var(--text-secondary)' }}>
            Content coming soon. This section will showcase deep technical exploration in {category.toLowerCase()}.
          </p>
          <div className="philosophy-keywords" style={{ marginTop: '16px' }}>
            {profile.currentInterests.filter((i) => i.includes(category)).map((kw) => (
              <Tag key={kw} accent>{kw}</Tag>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
