interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  accent?: boolean
  className?: string
  // EditableText/TagListEditor attach editing props to the element they render
  // through (ref, contentEditable, key/blur handlers) — Tag must forward them
  // or the element never becomes editable in edit mode (React 19: ref is a prop).
  ref?: React.Ref<HTMLSpanElement>
}

export function Tag({ children, accent = false, className = '', ref, ...rest }: TagProps) {
  return (
    <span ref={ref} className={`tag ${accent ? 'tag-accent' : ''} ${className}`} {...rest}>
      {children}
    </span>
  )
}
