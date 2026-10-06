import { motion } from "motion/react"

interface SocialLink {
  label: string
  href: string
  icon: React.ReactNode
  "aria-label": string
}

interface SocialLinksProps {
  links: SocialLink[]
  className?: string
}

export function SocialLinks({ links, className = "" }: SocialLinksProps) {
  return (
    <div className={`social-links ${className}`}>
      {links.map((link) => (
        <motion.a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label={link["aria-label"]}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {link.icon}
          <span>{link.label}</span>
        </motion.a>
      ))}
    </div>
  )
}
