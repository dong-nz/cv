import { motion } from "motion/react"
import { socialLinks } from "@/data/social"
import { useI18n } from "@/i18n/provider"
import { GithubIcon, LinkedinIcon, MailIcon, TelegramIcon } from "@/components/ui/icons"
import type { SocialId } from "@/types"

const icons: Record<SocialId, React.ReactNode> = {
  github: <GithubIcon size={20} />,
  linkedin: <LinkedinIcon size={20} />,
  email: <MailIcon size={20} />,
  telegram: <TelegramIcon size={20} />,
}

export function SocialLinks() {
  const { ui: s } = useI18n()

  return (
    <div className="social-links">
      {socialLinks.map((link) => (
        <motion.a
          key={link.id}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          className="social-link"
          aria-label={s.social.aria[link.id]}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {icons[link.id]}
        </motion.a>
      ))}
    </div>
  )
}
