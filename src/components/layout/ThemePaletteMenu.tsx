import { useCallback, useRef, useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import { useClickOutside } from '@/hooks/useClickOutside'
import { paletteIds, paletteMeta } from '@/data/palettes'
import { strings } from '@/i18n/strings'

interface ThemePaletteMenuProps {
  variant: 'nav' | 'sheet'
}

export function ThemePaletteMenu({ variant }: ThemePaletteMenuProps) {
  const { palette, setPalette } = useTheme()
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useClickOutside(containerRef, close)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    close()
    triggerRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`nav-palette nav-palette-${variant}`} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={`nav-palette-trigger ${open ? 'open' : ''}`}
        aria-expanded={open}
        aria-controls={`palette-menu-${variant}`}
        aria-label={`${strings.nav.palette[lang]}: ${paletteMeta[palette].label[lang]}`}
        title={strings.nav.paletteAria[lang]}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="nav-palette-swatch" aria-hidden="true" />
        <span className="nav-palette-group">{strings.nav.palette[lang]}</span>
        <span className="nav-palette-current">{paletteMeta[palette].label[lang]}</span>
        <svg
          className="chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div id={`palette-menu-${variant}`} className={`nav-palette-panel ${open ? 'open' : ''}`}>
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
