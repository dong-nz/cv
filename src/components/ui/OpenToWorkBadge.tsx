import { profile } from '@/data/profile'

export function OpenToWorkBadge() {
  return (
    <div className="otw-badge" role="status" aria-label="Open to work">
      <svg
        className="otw-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16"
        height="16"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="otw-title">Open to Work</span>
      <span className="otw-subtitle">{profile.title}</span>
    </div>
  )
}
