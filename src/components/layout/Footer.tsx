import { Link } from 'react-router'
import { useI18n } from '@/i18n/provider'
import { footerPaths } from '@/data/navigation'
import { SocialLinks } from '@/components/ui/SocialLinks'

export function Footer() {
  const year = new Date().getFullYear()
  const { ui: s, content: c } = useI18n()

  // The display name is localized (D6): the English footer now names "Dong
  // Nguyen" instead of carrying the Vietnamese name in both languages.
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <p className="footer-text">
          &copy; {year} {c.profile.name}. {s.footer.copyright}
        </p>

        <ul className="footer-links">
          {footerPaths.map((path) => {
            const key = path === '/' ? 'home' : path.replace('/', '') as keyof typeof s.footer.links
            const label = s.footer.links[key]

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
