import { resumeAvailable, resumeUrlFor, resumeLanguages } from '@/data/resume'
import type { Language } from '@/types'

const langLabels: Record<Language, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
}

function DownloadButton({ lang }: { lang: Language }) {
  return (
    <a
      href={resumeUrlFor(lang)}
      download
      className="contact-link"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <div>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Download Resume</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{langLabels[lang]}</div>
      </div>
    </a>
  )
}

function DownloadDropdown() {
  return (
    <details className="download-resume-dropdown">
      <summary className="download-resume-summary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Download Resume</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="chevron">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="download-resume-options">
        {resumeLanguages.map(lang => (
          <a
            key={lang}
            href={resumeUrlFor(lang)}
            download
            className="download-resume-option"
          >
            {langLabels[lang]}
          </a>
        ))}
      </div>
    </details>
  )
}

export function DownloadResume() {
  if (!resumeAvailable) return null

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Desktop: dropdown */}
      <div className="download-resume-desktop">
        <DownloadDropdown />
      </div>
      {/* Mobile: 2 buttons */}
      <div className="download-resume-mobile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resumeLanguages.map(lang => (
            <DownloadButton key={lang} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  )
}
