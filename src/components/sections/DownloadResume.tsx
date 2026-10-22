import { resumeAvailable } from '@/data/resume'
import { useI18n } from '@/i18n/provider'
import { useResumeDialog } from '@/hooks/useResumeDialog'
import { ResumeDialog } from '@/components/ui/ResumeDialog'


export function DownloadResume() {
  const { ui: s } = useI18n()
  const { open, openDialog, close, containerRef, triggerRef, panelRef } = useResumeDialog()

  if (!resumeAvailable) return null

  return (
    <div ref={containerRef} className="download-resume">
      <div className="download-resume-lazer-wrapper">
        <div className="download-resume-lazer-border" />
        <div className="download-resume-lazer-glow" />
        <div className="download-resume-lazer-inner">
          <button
            ref={triggerRef}
            type="button"
            className={`download-resume-summary ${open ? 'open' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="resume-modal"
            title={s.common.resumeModalHint}
            onClick={openDialog}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
              <path d="M12 3v10m0 0l-3-3m3 3l3-3" />
              <path d="M3 17h18" />
            </svg>
            <span>{s.common.resumeDownload}</span>
          </button>
        </div>
      </div>

      <ResumeDialog open={open} close={close} panelRef={panelRef} dialogId="resume-modal" />
    </div>
  )
}
