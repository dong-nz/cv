interface SectionHeadingProps {
  title: string
  subtitle?: string
  id?: string
}

export function SectionHeading({ title, subtitle, id }: SectionHeadingProps) {
  return (
    <div className="section-heading" id={id}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
