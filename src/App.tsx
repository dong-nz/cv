import './App.css'
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { ThemeProvider } from '@/hooks/useTheme'
import { Layout } from '@/components/layout/Layout'
import { LanguageProvider } from '@/hooks/useLanguage'
import { I18nProvider } from '@/i18n/provider'
import { editRequested, hasEditFlag } from '@/i18n/edit-session'
import { HomePage } from '@/pages/HomePage'

// HomePage stays eager: it is the landing route and owns the LCP, so its code must
// already be in the entry chunk. The other six split out and load on navigation.
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ExperiencePage = lazy(() => import('@/pages/ExperiencePage').then((m) => ({ default: m.ExperiencePage })))
const ProjectsListPage = lazy(() => import('@/pages/ProjectsListPage').then((m) => ({ default: m.ProjectsListPage })))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })))
const PhilosophyPage = lazy(() => import('@/pages/PhilosophyPage').then((m) => ({ default: m.PhilosophyPage })))

const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })))

// Edit mode is lazy too: visitors never download the draft store, the panel
// or the save pipeline (spec-v4 §7 P3.4). The gate opens the shell on `?edit`
// or on a session that is already in the mode; the shell authenticates, or it
// closes the session again.
const EditModeShell = lazy(() => import('@/components/layout/EditModeShell'))

function MaybeEditMode({ children }: { children: ReactNode }) {
  const location = useLocation()
  // `?edit` opens edit mode; from there the session flag keeps it across every
  // navigation and every reload until the EditBar's Exit ends it. The flag and
  // the query test live in `edit-session.ts`, which carries no dependency on
  // the draft store, so this gate keeps the edit code out of the entry chunk.
  const editing = editRequested(location.search) || hasEditFlag()
  if (!editing) return <>{children}</>
  return (
    <Suspense fallback={null}>
      <EditModeShell>{children}</EditModeShell>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          {/* I18nProvider sits below LanguageProvider: it resolves the language
              through useLanguage and hands every consumer the UI/CONTENT of it. */}
          <I18nProvider>
            <MaybeEditMode>
              <Layout>
                {/* A null fallback keeps the shell (nav, footer) painted without reserving a
                    box that would shift the page when the route chunk lands. */}
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/experience" element={<ExperiencePage />} />
                    <Route path="/projects" element={<ProjectsListPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/philosophy" element={<PhilosophyPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                  </Routes>
                </Suspense>
              </Layout>
            </MaybeEditMode>
          </I18nProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
