import type { Language } from '@/types'

/* Both icons are line drawings in the bar's stroke language — currentColor, no fills — so the
   language control sits beside the house, the sun/moon and the palette swatch without importing a
   colour the palette has to argue with.

   Flag: a 21×17.5 band at 1.5/3.25 — drawn 23×19.5 with the 2px stroke, against the globe's 22×22.
   Width is already at the limit (the globe's own stroke spans 1..23), so every further size step has
   to come from height, and height is what drags it off the constitutional 2:3 (1.5 → 1.2). The star
   is deliberately under the flag's own construction (0.6 × band height): radius 3.6, drawn ≈ 8.3
   units ≈ 36% × 41% of the band.

   The star's stroke is 1.5, not 2: an outline star at this size only keeps a visible interior if
   the ink is thin — the gap across its inner pentagon is 2(0.309·R − strokeWidth/2), so 2px ink at
   R=3.6 would close the middle into a blob. Round joins, not miter: a 36° tip throws a miter spike
   3.24 × strokeWidth/2 past the vertex, which would draw the star bigger than its own radius. */
const FLAG_STAR = '12,8.4 12.81,10.89 15.42,10.89 13.31,12.42 14.12,14.91 12,13.38 9.88,14.91 10.69,12.42 8.58,10.89 11.19,10.89'

export function LanguageIcon({ lang }: { lang: Language }) {
  if (lang === 'vi') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <rect x="1.5" y="3.25" width="21" height="17.5" rx="2" />
        <polygon points={FLAG_STAR} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
    </svg>
  )
}
