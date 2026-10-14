import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'
import { Navigation } from './Navigation'
import { BackToTop } from '@/components/ui/BackToTop'
import { Footer } from './Footer'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { lang } = useLanguage()
  return (
    <>
      <a href="#main-content" className="skip-link">
        {strings.common.skipLink[lang]}
      </a>
      <Navigation />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
