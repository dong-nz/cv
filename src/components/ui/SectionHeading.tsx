import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  // The caller supplies the subtitle element (a plain <p>, or an EditableText
  // bound to `profile.subtitle` in edit mode) — SectionHeading only places it.
  subtitle?: ReactNode
  tag?: string
  id?: string
  // spec-v8 §4: every standalone page renders its main heading as h1 — this
  // is the single place page headings are produced. Sections inside a page
  // (and the homepage's sections) keep the default h2.
  level?: 'h1' | 'h2'
}

export function SectionHeading({ title, subtitle, tag, id, level = 'h2' }: SectionHeadingProps) {
  const Heading = level
  return (
    <div className="section-heading" id={id}>
      {tag && <span className="section-tag">{tag}</span>}
      <Heading>{title}</Heading>
      {subtitle}
    </div>
  )
}
