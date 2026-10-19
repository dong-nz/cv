import { resumeAvailable } from '@/data/resume'
import { useLanguage } from '@/hooks/useLanguage'
import { useResumeDialog } from '@/hooks/useResumeDialog'
import { ResumeDialog } from '@/components/ui/ResumeDialog'
import { ResumeIcon } from '@/components/ui/icons'
import { strings } from '@/i18n/strings'

/**
 * Bar entry for the resume: an icon-only `.nav-control` in the brand group, right after the home
 * icon, opening the same language dialog the hero CTA opens. The icon is decorative — the
 * accessible name is the translated action in `aria-label`, the hint is the `title`.
 */
export function ResumeNavButton() {
  const { lang } = useLanguage()
  const { open, openDialog, close, containerRef, triggerRef, panelRef } = useResumeDialog()

  if (!resumeAvailable) return null
  return (
    <div ref={containerRef} className="nav-resume">
      <button
        ref={triggerRef}
        type="button"
        className={`nav-control nav-resume-trigger ${open ? 'open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="resume-modal-nav"
        aria-label={strings.nav.resume[lang]}
        title={strings.common.resumeModalHint[lang]}
        onClick={openDialog}
      >
        <ResumeIcon />
      </button>

      <ResumeDialog open={open} close={close} panelRef={panelRef} dialogId="resume-modal-nav" />
    </div>
  )
}
