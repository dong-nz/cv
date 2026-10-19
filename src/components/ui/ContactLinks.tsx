import { motion } from "motion/react"
import { profile } from "@/data/profile"
import { useLanguage } from "@/hooks/useLanguage"
import { strings } from "@/i18n/strings"
import { GithubIcon, LinkedinIcon, MailIcon, TelegramIcon } from "@/components/ui/icons"
import type { Language, SocialId } from "@/types"

type ContactEntry = {
  id: SocialId
  href: string
  external: boolean
  labelKey: 'email' | 'github' | 'linkedin' | 'telegram'
  sub: Record<Language, string>
  icon: React.ReactNode
}

const entries: ContactEntry[] = [
  { id: 'email', href: `mailto:${profile.email}`, external: false, labelKey: 'email', sub: { en: profile.email, vi: profile.email }, icon: <MailIcon size={24} /> },
  { id: 'github', href: profile.githubUrl, external: true, labelKey: 'github', sub: { en: `@${profile.githubHandle}`, vi: `@${profile.githubHandle}` }, icon: <GithubIcon size={24} /> },
  { id: 'linkedin', href: profile.linkedinUrl, external: true, labelKey: 'linkedin', sub: { en: `@${profile.linkedinHandle}`, vi: `@${profile.linkedinHandle}` }, icon: <LinkedinIcon size={24} /> },
  { id: 'telegram', href: profile.telegramUrl, external: true, labelKey: 'telegram', sub: { en: `@${profile.telegramHandle}`, vi: `@${profile.telegramHandle}` }, icon: <TelegramIcon size={24} /> },
]

export function ContactLinks() {
  const { lang } = useLanguage()

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
            <div className="link-label">{strings.contact[entry.labelKey][lang]}</div>
            <div className="contact-link-sub">{entry.sub[lang]}</div>
          </div>
        </motion.a>
      ))}
    </div>
  )
}
