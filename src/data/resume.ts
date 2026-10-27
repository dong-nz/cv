import type { Language } from '@/types'

export const resumeAvailable = true

export const resumeLanguages: Language[] = ['en', 'vi']
export const resumeLanguageLabels: Record<Language, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
}

// QR codes embedded in the resume header — images exported from the
// Telegram/Zalo apps, stored in public/resume-qr/ (owner-provided assets)
export const resumeQr: { id: string; file: string; label: string }[] = [
  { id: 'telegram', file: 'telegram.jpg', label: 'Telegram' },
  { id: 'zalo', file: 'zalo.jpg', label: 'Zalo' },
]

export const resumeFileNameFor = (lang: Language): string => `resume-${lang}.pdf`

export const resumeUrlFor = (lang: Language): string => `/${resumeFileNameFor(lang)}`
