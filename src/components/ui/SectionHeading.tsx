interface SectionHeadingProps {
  title: string
  subtitle?: string
  tag?: string
  id?: string
}

export function SectionHeading({ title, subtitle, tag, id }: SectionHeadingProps) {
  return (
    <div className="section-heading" id={id}>
      {tag && <span className="section-tag">{tag}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
