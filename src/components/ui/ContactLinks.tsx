import { motion } from "motion/react"
import { useI18n } from "@/i18n/provider"
import { GithubIcon, LinkedinIcon, MailIcon, TelegramIcon } from "@/components/ui/icons"
import type { SocialId } from "@/types"

type ContactEntry = {
  id: SocialId
  href: string
  external: boolean
  labelKey: 'email' | 'github' | 'linkedin' | 'telegram'
  sub: string
  icon: React.ReactNode
}

export function ContactLinks() {
  const { ui: s, content: c } = useI18n()

  const entries: ContactEntry[] = [
    { id: 'email', href: `mailto:${c.profile.email}`, external: false, labelKey: 'email', sub: c.profile.email, icon: <MailIcon size={24} /> },
    { id: 'github', href: c.profile.githubUrl, external: true, labelKey: 'github', sub: `@${c.profile.githubHandle}`, icon: <GithubIcon size={24} /> },
    { id: 'linkedin', href: c.profile.linkedinUrl, external: true, labelKey: 'linkedin', sub: `@${c.profile.linkedinHandle}`, icon: <LinkedinIcon size={24} /> },
    { id: 'telegram', href: c.profile.telegramUrl, external: true, labelKey: 'telegram', sub: `@${c.profile.telegramHandle}`, icon: <TelegramIcon size={24} /> },
  ]

  return (
    <div className="contact-links">
      {entries.map((entry, i) => (
        <motion.a
          key={entry.id}
          href={entry.href}
          target={entry.external ? "_blank" : undefined}
          rel={entry.external ? "noopener noreferrer" : undefined}
          className="contact-link"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: i * 0.08 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {entry.icon}
          <div>
            <div className="link-label">{s.contact[entry.labelKey]}</div>
            <div className="contact-link-sub">{entry.sub}</div>
          </div>
        </motion.a>
      ))}
    </div>
  )
}
