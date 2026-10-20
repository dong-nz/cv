import { useCallback, useEffect, useRef, useState } from 'react'
import { useClickOutside } from '@/hooks/useClickOutside'

/**
 * Open/close state for the resume language dialog. Two triggers mount their own instance — the
 * hero CTA and the navigation bar icon — so each keeps its own refs and focus returns to the
 * control that opened the dialog.
 */
export function useResumeDialog() {
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    openRef.current = open
  }, [open])

  // The click-outside listener is live whether or not the dialog is open, so closing has to be
  // guarded: an outside click while closed must not pull focus to the trigger.
  const close = useCallback(() => {
    if (!openRef.current) return
    openRef.current = false
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  const openDialog = useCallback(() => setOpen(true), [])

  // The dialog panels portal themselves to document.body (the nav bar's backdrop-filter would
  // otherwise clip their fixed overlay to the bar), so the panel is no longer inside
  // containerRef — it is passed as the second watched ref so clicks in it are not "outside".
  useClickOutside(containerRef, close, panelRef)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, close])

  return { open, openDialog, close, containerRef, triggerRef, panelRef }
}
