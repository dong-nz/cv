interface SocialLink {
  label: string
  href: string
  icon: React.ReactNode
  'aria-label': string
}

interface SocialLinksProps {
  links: SocialLink[]
  className?: string
}

export function SocialLinks({ links, className = '' }: SocialLinksProps) {
  return (
    <div className={`social-links ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label={link['aria-label']}
        >
          {link.icon}
          <span>{link.label}</span>
        </a>
      ))}
    </div>
  )
}
