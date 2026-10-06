import { Navigation } from './Navigation'
import { Footer } from './Footer'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navigation />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
