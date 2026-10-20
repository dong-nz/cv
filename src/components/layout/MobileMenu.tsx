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
import { LanguageIcon } from '@/components/ui/LanguageIcon'
import { MoonIcon, SunIcon } from '@/components/ui/icons'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { lang, setLang } = useLanguage()
  const { resolvedTheme, setTheme, palette, setPalette } = useTheme()
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const sheetRef = useRef<HTMLDivElement>(null)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={sheetRef}
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-label={strings.nav.menuAria[lang]}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          onAnimationComplete={() => sheetRef.current?.focus()}
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
                <span className="mobile-menu-segment-label">{strings.nav.langGroup[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.langGroup[lang]}>
                  {/* Icons, not words — globe for English, red flag for Tiếng Việt — in the same
                      44px icon-only shape as the Theme color row. An icon cannot say which language
                      it is, so each option carries its own-language name in aria-label and title. */}
                  <button
                    type="button"
                    className={lang === 'en' ? 'mobile-menu-icon-option active' : 'mobile-menu-icon-option'}
                    aria-pressed={lang === 'en'}
                    aria-label={strings.nav.langEn[lang]}
                    title={strings.nav.langEn[lang]}
                    onClick={() => setLang('en')}
                  >
                    <LanguageIcon lang="en" />
                  </button>
                  <button
                    type="button"
                    className={lang === 'vi' ? 'mobile-menu-icon-option active' : 'mobile-menu-icon-option'}
                    aria-pressed={lang === 'vi'}
                    aria-label={strings.nav.langVi[lang]}
                    title={strings.nav.langVi[lang]}
                    onClick={() => setLang('vi')}
                  >
                    <LanguageIcon lang="vi" />
                  </button>
                </div>
              </div>

              <div className="mobile-menu-segment">
                <span className="mobile-menu-segment-label">{strings.nav.themeGroup[lang]}</span>
                <div className="mobile-menu-segment-options" role="group" aria-label={strings.nav.themeGroup[lang]}>
                  {/* Icons, not words — the bar's own line art: moon for dark, sun for light.
                      An icon alone cannot name a mode, so each option carries the translated
                      mode name in aria-label and title. */}
                  <button
                    type="button"
                    className={resolvedTheme === 'dark' ? 'mobile-menu-icon-option active' : 'mobile-menu-icon-option'}
                    aria-pressed={resolvedTheme === 'dark'}
                    aria-label={strings.nav.themeDark[lang]}
                    title={strings.nav.themeDark[lang]}
                    onClick={() => setTheme('dark')}
                  >
                    <MoonIcon />
                  </button>
                  <button
                    type="button"
                    className={resolvedTheme === 'light' ? 'mobile-menu-icon-option active' : 'mobile-menu-icon-option'}
                    aria-pressed={resolvedTheme === 'light'}
                    aria-label={strings.nav.themeLight[lang]}
                    title={strings.nav.themeLight[lang]}
                    onClick={() => setTheme('light')}
                  >
                    <SunIcon />
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
                      className={palette === id ? 'mobile-menu-icon-option active' : 'mobile-menu-icon-option'}
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
