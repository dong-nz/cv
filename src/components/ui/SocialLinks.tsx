import { motion } from "motion/react"
import { socialLinks } from "@/data/social"
import { useLanguage } from "@/hooks/useLanguage"
import { strings } from "@/i18n/strings"
import { GithubIcon, LinkedinIcon, MailIcon, TelegramIcon } from "@/components/ui/icons"
import type { SocialId } from "@/types"

const icons: Record<SocialId, React.ReactNode> = {
  github: <GithubIcon size={20} />,
  linkedin: <LinkedinIcon size={20} />,
  email: <MailIcon size={20} />,
  telegram: <TelegramIcon size={20} />,
}

export function SocialLinks() {
  const { lang } = useLanguage()

  return (
    <div className="social-links">
      {socialLinks.map((link) => (
        <motion.a
          key={link.id}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          className="social-link"
          aria-label={strings.social.aria[link.id][lang]}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {icons[link.id]}
        </motion.a>
      ))}
    </div>
  )
}
