import type { Language } from '@/types'

export const resumeAvailable = true

export const resumeLanguages: Language[] = ['en', 'vi']

export const resumeUrlFor = (lang: Language): string =>
  lang === 'en' ? '/resume.pdf' : `/resume-${lang}.pdf`
