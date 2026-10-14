import { resumeAvailable, resumeUrlFor, resumeLanguages } from '@/data/resume'
import type { Language } from '@/types'
import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'

const langLabels: Record<Language, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
}

function DownloadButton({ lang }: { lang: Language }) {
  const { lang: currentLang } = useLanguage()
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
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 2a1 1 0 0 1 1 1v9.586l2.707-2.707a1 1 0 1 1 1.414 1.414l-4.5 4.5a1 1 0 0 1-1.414 0l-4.5-4.5a1 1 0 1 1 1.414-1.414L11 12.586V3a1 1 0 0 1 1-1zm-7 16a1 1 0 1 1 0 2h14a1 1 0 1 1 0-2H5z" />
      </svg>
      <div>
        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{strings.common.resumeDownload[currentLang]}</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{langLabels[lang]}</div>
      </div>
    </a>
  )
}

function DownloadDropdown() {
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const listener = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [open])

  return (
    <div ref={ref} className="download-resume-dropdown">
      <div className="download-resume-shared-wrapper">
        <div className="download-resume-lazer-wrapper">
          <div className="download-resume-lazer-border" />
          <div className="download-resume-lazer-glow" />
          <div className="download-resume-lazer-inner">
            <button
              className={`download-resume-summary ${open ? 'open' : ''}`}
              onClick={() => setOpen(!open)}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M12 3v10m0 0l-3-3m3 3l3-3" />
                <path d="M3 17h18" />
              </svg>
              <span>{strings.common.resumeDownload[lang]}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" className="chevron">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
        <div className={`download-resume-options ${open ? 'open' : ''}`}>
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
      </div>
    </div>
  )
}

export function DownloadResume() {
  if (!resumeAvailable) return null

  return (
    <div style={{ marginTop: '32px' }}>
      {resumeLanguages.length > 1 ? (
        <DownloadDropdown />
      ) : (
        <DownloadButton lang={resumeLanguages[0]} />
      )}
    </div>
  )
}
