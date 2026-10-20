type IconProps = { size?: number }

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

export function MailIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...strokeProps}>
      <path d="m22 7l-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
      <rect width="20" height="16" x="2" y="4" rx="2" />
    </svg>
  )
}

export function GithubIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...strokeProps}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5c.08-1.25-.27-2.48-1-3.5c.28-1.15.28-2.35 0-3.5c0 0-1 0-3 1.5c-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5c-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export function LinkedinIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...strokeProps}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6M2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

// Brand glyphs (simple-icons, monochrome currentColor) — lucide dropped brand icons
export function TelegramIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024q-.159.037-5.061 3.345q-.72.495-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789q.04-.324.893-.663q5.247-2.286 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635" />
    </svg>
  )
}

// Resume document glyph — the canonical shape lives in public/cv-icon.svg; keep the two in step.
// The owner's CV artwork (a 30-grid draft, spec follow-up 19) adapted to the bar's 24 grid: a
// page outline split on the left edge by a visible dash (4px endpoint gaps stay open under 2px
// round caps), a folded
// corner, and stroked CV lettering replacing the content lines — the only arrangement that
// keeps the lettering readable at the bar's size, because the page is otherwise empty.
// The translated aria-label on the trigger carries the action; the glyph stays aria-hidden.
export function ResumeIcon({ size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...strokeProps}>
      <path d="M14 2 H6 a2 2 0 0 0 -2 2 V6" />
      <path d="M4 10 V12" />
      <path d="M4 16 v4 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 V8 L14 2" />
      <path d="M14 2 v4 a2 2 0 0 0 2 2 h4" />
      <path d="M9.5 12 A3 3 0 0 0 9.5 18" />
      <path d="M12.5 12 L15 18 L17.5 12" />
    </svg>
  )
}
