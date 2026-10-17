import { useRef } from 'react'
import { useLocation } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { navPaths } from '@/data/navigation'
import { paletteIds, paletteMeta } from '@/data/palettes'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { RollingTextLink } from '@/components/ui/RollingTextLink'
import { SocialLinks } from '@/components/ui/SocialLinks'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { lang, setLang } = useLanguage()
  const { resolvedTheme, setTheme, palette, setPalette } = useTheme()
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={strings.nav.menuAria[lang]}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          onAnimationComplete={() => firstLinkRef.current?.focus()}
        >
          <div className="mobile-menu-inner">
            <nav className="mobile-menu-group" aria-label={strings.nav.groupMenu[lang]}>
              <span className="mobile-menu-heading">{strings.nav.groupMenu[lang]}</span>
              <ul className="mobile-menu-list">
                {navPaths.map((path, index) => {
                  const navKey = path === '/' ? 'home' : path.replace('/', '') as keyof typeof strings.nav
                  const active = path === location.pathname
                  return (
                    <motion.li
                      key={path}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: reduceMotion ? 0 : 0.05 + index * 0.04 }}
                    >
                      <RollingTextLink
                        to={path}
                        ref={index === 0 ? firstLinkRef : undefined}
                        ariaCurrent={active ? 'page' : undefined}
                        className={active ? 'mobile-menu-link active' : 'mobile-menu-link'}
                        onClick={onClose}
                      >
                        {strings.nav[navKey][lang]}
                      </RollingTextLink>
                    </motion.li>
                  )
                })}
              </ul>
            </nav>

            <div className="mobile-menu-group">
              <span className="mobile-menu-heading">{strings.nav.groupAppearance[lang]}</span>

              <div className="mobile-menu-segment">
                <span className="mobile-menu-segment-label">{strings.nav.themeGroup[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.themeGroup[lang]}>
                  <button
                    type="button"
                    className={resolvedTheme === 'dark' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={resolvedTheme === 'dark'}
                    onClick={() => setTheme('dark')}
                  >
                    {strings.nav.themeDark[lang]}
                  </button>
                  <button
                    type="button"
                    className={resolvedTheme === 'light' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={resolvedTheme === 'light'}
                    onClick={() => setTheme('light')}
                  >
                    {strings.nav.themeLight[lang]}
                  </button>
                </div>
              </div>

              <div className="mobile-menu-segment">
                <span className="mobile-menu-segment-label">{strings.nav.langGroup[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.langGroup[lang]}>
                  <button
                    type="button"
                    className={lang === 'en' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={lang === 'en'}
                    onClick={() => setLang('en')}
                  >
                    {strings.nav.langEn[lang]}
                  </button>
                  <button
                    type="button"
                    className={lang === 'vi' ? 'mobile-menu-segment-option active' : 'mobile-menu-segment-option'}
                    aria-pressed={lang === 'vi'}
                    onClick={() => setLang('vi')}
                  >
                    {strings.nav.langVi[lang]}
                  </button>
                </div>
              </div>

              <div className="mobile-menu-segment">
                <span className="mobile-menu-segment-label">{strings.nav.palette[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.palette[lang]}>
                  {paletteIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={palette === id ? 'mobile-menu-swatch-option active' : 'mobile-menu-swatch-option'}
                      aria-pressed={palette === id}
                      aria-label={paletteMeta[id].label[lang]}
                      title={paletteMeta[id].hint[lang]}
                      onClick={() => setPalette(id)}
                    >
                      <span className="nav-palette-preview" data-preview={id} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-menu-group">
              <span className="mobile-menu-heading">{strings.social.heading[lang]}</span>
              <SocialLinks />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
