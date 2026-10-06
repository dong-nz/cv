import { resumeAvailable } from '@/data/resume'
import { Button } from '@/components/ui/Button'
import { SocialLinks } from '@/components/ui/SocialLinks'
import { profile } from '@/data/profile'

const socialLinks = [
  {
    label: 'GitHub',
    href: profile.githubUrl,
    'aria-label': 'View GitHub profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: profile.linkedinUrl,
    'aria-label': 'View LinkedIn profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: `mailto:${profile.email}`,
    'aria-label': 'Send email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4l-10 8L2 4" />
      </svg>
    ),
  },
]

export function Hero() {
  return (
    <section className="hero container-wide" aria-labelledby="hero-heading">
      <div className="hero-content">
        <h1 id="hero-heading" className="hero-name">
          {profile.name}
        </h1>
        <p className="hero-title">{profile.title}</p>
        <p className="hero-tagline">{profile.tagline}</p>
        <div className="hero-cta">
          <Button href="/projects" variant="primary">
            View Projects
          </Button>
          {resumeAvailable && (
            <Button href="/resume.pdf" variant="secondary" download>
              Download Resume
            </Button>
          )}
          <Button href="/contact" variant="secondary">
            Contact Me
          </Button>
        </div>
        <SocialLinks links={socialLinks} />
      </div>
      <div className="hero-visual">
        <div className="hero-graphic">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Abstract system diagram */}
            <circle cx="200" cy="200" r="160" stroke="var(--border)" strokeWidth="1" />
            <circle cx="200" cy="200" r="100" stroke="var(--border)" strokeWidth="1" />
            <circle cx="200" cy="200" r="40" stroke="var(--accent)" strokeWidth="2" opacity="0.6" />

            {/* Nodes */}
            <circle cx="200" cy="80" r="8" fill="var(--accent)" opacity="0.8" />
            <circle cx="320" cy="200" r="8" fill="var(--accent)" opacity="0.8" />
            <circle cx="200" cy="320" r="8" fill="var(--accent)" opacity="0.8" />
            <circle cx="80" cy="200" r="8" fill="var(--accent)" opacity="0.8" />

            {/* Connections */}
            <line x1="200" y1="88" x2="200" y2="160" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />
            <line x1="312" y1="200" x2="240" y2="200" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />
            <line x1="200" y1="312" x2="200" y2="240" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />
            <line x1="88" y1="200" x2="160" y2="200" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />

            {/* Diagonal connections */}
            <line x1="206" y1="86" x2="314" y2="194" stroke="var(--accent)" strokeWidth="0.5" opacity="0.2" />
            <line x1="314" y1="206" x2="206" y2="314" stroke="var(--accent)" strokeWidth="0.5" opacity="0.2" />
            <line x1="194" y1="314" x2="86" y2="206" stroke="var(--accent)" strokeWidth="0.5" opacity="0.2" />
            <line x1="86" y1="194" x2="194" y2="86" stroke="var(--accent)" strokeWidth="0.5" opacity="0.2" />

            {/* Center label */}
            <text x="200" y="205" textAnchor="middle" fill="var(--accent)" fontSize="14" fontFamily="monospace">
              core
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}
