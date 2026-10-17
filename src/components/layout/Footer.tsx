import { Link } from 'react-router'
import { profile } from '@/data/profile'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { footerPaths } from '@/data/navigation'
import { SocialLinks } from '@/components/ui/SocialLinks'

export function Footer() {
  const year = new Date().getFullYear()
  const { lang } = useLanguage()

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <p className="footer-text">
          &copy; {year} {profile.name}. {strings.footer.copyright[lang]}
        </p>

        <ul className="footer-links">
          {footerPaths.map((path) => {
            const key = path === '/' ? 'home' : path.replace('/', '') as keyof typeof strings.footer.links
            const label = strings.footer.links[key][lang]
            return (
              <li key={path}>
                <Link to={path} className="footer-link">
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <SocialLinks />
      </div>
    </footer>
  )
}
