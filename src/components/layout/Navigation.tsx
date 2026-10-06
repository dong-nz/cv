import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { useTheme } from '@/hooks/useTheme'
import { RollingTextLink } from '@/components/ui/RollingTextLink'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Experience', path: '/experience' },
  { label: 'Projects', path: '/projects' },
  { label: 'Engineering', path: '/engineering' },
  { label: 'Contact', path: '/contact' },
]

export function Navigation() {
  const { cycleTheme, resolvedTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            Portfolio
          </Link>

          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.path}>
                <RollingTextLink
                  to={item.path}
                  className={item.path === location.pathname ? 'nav-link active' : 'nav-link'}
                >
                  {item.label}
                </RollingTextLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button
              className="theme-toggle"
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

            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} role="dialog" aria-label="Mobile navigation">
        <ul className="mobile-menu-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <RollingTextLink
                to={item.path}
                className={item.path === location.pathname ? 'mobile-menu-link active' : 'mobile-menu-link'}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </RollingTextLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
