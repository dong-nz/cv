import { motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { useClickOutside } from '@/hooks/useClickOutside'
import { paletteIds, paletteMeta } from '@/data/palettes'
import { strings } from '@/i18n/strings'

export function ThemePaletteMenu() {
  const { palette, setPalette } = useTheme()
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useClickOutside(containerRef, close)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Only while the submenu is open: React's synthetic stopPropagation() stops the native
    // event too, so an unconditional call would also swallow a host's own Escape handling.
    if (event.key !== 'Escape' || !open) return
    event.stopPropagation()
    close()
    triggerRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="nav-palette" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={`nav-control nav-palette-trigger ${open ? 'open' : ''}`}
        aria-expanded={open}
        aria-controls="palette-menu"
        aria-label={`${strings.nav.palette[lang]}: ${paletteMeta[palette].label[lang]}`}
        title={strings.nav.paletteAria[lang]}
        onClick={() => setOpen((prev) => !prev)}
      >
        {/* Rotation tracks the submenu: 90° while it is open, back to 0° on selection, Escape or
            a pointer-down outside. Reduced motion is handled globally by
            `motion.config.reducedMotion = 'user'` (src/main.tsx:7-9) — the angle changes without
            animating. No CSS transition on `.nav-palette-swatch`: motion owns the transform. */}
        <motion.span
          className="nav-palette-swatch"
          aria-hidden="true"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      </button>

      <div id="palette-menu" className={`nav-palette-panel ${open ? 'open' : ''}`}>
        {paletteIds.map((id) => (
          <button
            key={id}
            type="button"
            className={`nav-palette-option ${id === palette ? 'active' : ''}`}
            aria-current={id === palette ? 'true' : undefined}
            onClick={() => {
              setPalette(id)
              setOpen(false)
            }}
          >
            <span className="nav-palette-preview" data-preview={id} aria-hidden="true" />
            <span className="nav-palette-name">{paletteMeta[id].label[lang]}</span>
            <span className="nav-palette-hint">{paletteMeta[id].hint[lang]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
