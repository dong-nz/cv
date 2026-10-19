import { resumeUrlFor, resumeLanguages, resumeLanguageLabels } from '@/data/resume'
import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'

interface DownloadResumeDropdownProps {
  className?: string
  wrapperClassName?: string
  targetBlank?: boolean
}

export function DownloadResumeDropdown({ className, wrapperClassName, targetBlank = false }: DownloadResumeDropdownProps) {
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
    <div ref={ref} className={`download-resume-dropdown ${className ?? ''}`}>
      <div className="download-resume-shared-wrapper">
        <div className="download-resume-lazer-wrapper">
          <div className="download-resume-lazer-border" />
          <div className="download-resume-lazer-glow" />
          <div className="download-resume-lazer-inner">
            <button
              className={`download-resume-summary ${wrapperClassName ?? ''} ${open ? 'open' : ''}`}
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
              target={targetBlank ? '_blank' : undefined}
              className="download-resume-option"
            >
              {resumeLanguageLabels[lang]}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
