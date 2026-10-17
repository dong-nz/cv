import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { navPaths } from '@/data/navigation'
import { RollingTextLink } from '@/components/ui/RollingTextLink'
import { ThemePaletteMenu } from '@/components/layout/ThemePaletteMenu'
import { MobileMenu } from '@/components/layout/MobileMenu'

export function Navigation() {
  const { cycleTheme, resolvedTheme } = useTheme()
  const { lang, toggleLang } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setMobileOpen(false)
    // The hamburger is display:none above 1024px — focusing it there would drop focus to <body>.
    if (triggerRef.current?.offsetParent) triggerRef.current.focus()
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    const covered = [
      document.getElementById('main-content'),
      document.querySelector('.footer'),
      document.querySelector('.back-to-top'),
    ]
    covered.forEach((el) => el?.setAttribute('inert', ''))
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      covered.forEach((el) => el?.removeAttribute('inert'))
      document.removeEventListener('keydown', handleKey)
    }
  }, [mobileOpen, closeMenu])

  // The sheet only exists at <=1024px; crossing upward must close it so aria-expanded stays honest.
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 1024px)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setMobileOpen(false)
    }
    mobile.addEventListener('change', handleChange)
    return () => mobile.removeEventListener('change', handleChange)
  }, [])

  return (
    <>
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-bracket">&#123;</span>
            <span className="logo-text">CV</span>
            <span className="logo-bracket">&#125;</span>
          </Link>

          <ul className="nav-menu">
            {navPaths.map((path) => {
              const navKey = path === '/' ? 'home' : path.replace('/', '') as keyof typeof strings.nav
              const label = strings.nav[navKey][lang]
              return (
                <li key={path}>
                  <RollingTextLink
                    to={path}
                    ariaCurrent={path === location.pathname ? 'page' : undefined}
                    className={path === location.pathname ? 'nav-link active' : 'nav-link'}
                  >
                    {label}
                  </RollingTextLink>
                </li>
              )
            })}
          </ul>

          <div className="nav-actions">
            <button
              className="nav-control lang-toggle"
              onClick={toggleLang}
              aria-label="Switch language"
              title={`Switch to ${lang === 'en' ? 'Tiếng Việt' : 'English'}`}
            >
              {lang === 'en' ? 'VI' : 'EN'}
            </button>

            <button
              className="nav-control theme-toggle"
              onClick={cycleTheme}
              aria-label={`Switch theme (currently ${resolvedTheme})`}
              title={`Theme: ${resolvedTheme}`}
            >
              {resolvedTheme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <ThemePaletteMenu />

            <button
              ref={triggerRef}
              className="mobile-menu-btn"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? strings.nav.closeMenu[lang] : strings.nav.openMenu[lang]}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.svg
                    key="close"
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.18 }}
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="menu"
                    width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.18 }}
                  >
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={closeMenu} />
    </>
  )
}
