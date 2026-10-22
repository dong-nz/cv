import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  // The caller supplies the subtitle element (a plain <p>, or an EditableText
  // bound to `profile.subtitle` in edit mode) — SectionHeading only places it.
  subtitle?: ReactNode
  tag?: string
  id?: string
}

export function SectionHeading({ title, subtitle, tag, id }: SectionHeadingProps) {
  return (
    <div className="section-heading" id={id}>
      {tag && <span className="section-tag">{tag}</span>}
      <h2>{title}</h2>
      {subtitle}
    </div>
  )
}
