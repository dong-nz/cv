import './App.css'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ThemeProvider } from '@/hooks/useTheme'
import { Layout } from '@/components/layout/Layout'
import { LanguageProvider } from '@/hooks/useLanguage'
import { HomePage } from '@/pages/HomePage'

// HomePage stays eager: it is the landing route and owns the LCP, so its code must
// already be in the entry chunk. The other six split out and load on navigation.
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const ExperiencePage = lazy(() => import('@/pages/ExperiencePage').then((m) => ({ default: m.ExperiencePage })))
const ProjectsListPage = lazy(() => import('@/pages/ProjectsListPage').then((m) => ({ default: m.ProjectsListPage })))
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })))
const PhilosophyPage = lazy(() => import('@/pages/PhilosophyPage').then((m) => ({ default: m.PhilosophyPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })))

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
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
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
