import { profile } from '@/data/profile'
import type { SocialId } from '@/types'

export const socialLinks: {
  id: SocialId
  href: string
  external: boolean
}[] = [
  { id: 'github', href: profile.githubUrl, external: true },
  { id: 'linkedin', href: profile.linkedinUrl, external: true },
  { id: 'email', href: `mailto:${profile.email}`, external: false },
]
