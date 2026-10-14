import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ThemeProvider } from '@/hooks/useTheme'
import { Layout } from '@/components/layout/Layout'
import { LanguageProvider } from '@/hooks/useLanguage'
import {
  HomePage,
  AboutPage,
  ExperiencePage,
  ProjectsListPage,
  ProjectDetailPage,
  EngineeringPage,
  ContactPage,
} from '@/pages'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/engineering" element={<EngineeringPage />} />
              <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>
      </LanguageProvider>
    </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
