import {Navigation} from './Navigation'
import {BackToTop} from '@/components/ui/BackToTop'
import {Footer} from './Footer'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navigation />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
