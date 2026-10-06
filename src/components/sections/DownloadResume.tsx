import { resumeAvailable } from '@/data/resume'

export function DownloadResume() {
  if (!resumeAvailable) return null

  return (
    <div style={{ marginTop: '32px' }}>
      <a href="/resume.pdf" download className="contact-link" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Download Resume</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>PDF</div>
        </div>
      </a>
    </div>
  )
}
