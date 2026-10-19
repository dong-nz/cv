import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { resumeUrlFor, resumeLanguages, resumeLanguageLabels } from '@/data/resume'
import { useLanguage } from '@/hooks/useLanguage'
import { strings } from '@/i18n/strings'

type ResumeDialogProps = {
  open: boolean
  close: () => void
  panelRef: React.RefObject<HTMLDivElement | null>
  dialogId: string
}

/**
 * The language picker. Mounted by every trigger with its own `dialogId` so `aria-controls` never
 * points at a duplicated id when two triggers are on the same page.
 */
export function ResumeDialog({ open, close, panelRef, dialogId }: ResumeDialogProps) {
  const { lang } = useLanguage()

  // Enter only, one frame late so the panel is on screen before it takes focus. AnimatePresence
  // keeps the open=true props on its exiting copy, so an onAnimationComplete handler fires again
  // when the exit animation ends and strands focus on <body> as the panel unmounts.
  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => panelRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open, panelRef])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="resume-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={close}
        >
          <motion.div
            ref={panelRef}
            id={dialogId}
            className="resume-modal"
            role="dialog"
            aria-modal="true"
            aria-label={strings.common.resumeModalAria[lang]}
            tabIndex={-1}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={event => event.stopPropagation()}
          >
            <div className="resume-modal-head">
              <h3>{strings.common.resumeModalTitle[lang]}</h3>
              <button
                type="button"
                className="resume-modal-close"
                aria-label={strings.common.resumeModalClose[lang]}
                onClick={close}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="resume-modal-hint">{strings.common.resumeModalHint[lang]}</p>
            <div className="resume-modal-options">
              {resumeLanguages.map(optionLang => (
                <a
                  key={optionLang}
                  className="resume-modal-option"
                  href={resumeUrlFor(optionLang)}
                  download
                  onClick={close}
                >
                  <span className="resume-modal-option-label">{resumeLanguageLabels[optionLang]}</span>
                  <span className="resume-modal-option-file">{resumeUrlFor(optionLang)}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
