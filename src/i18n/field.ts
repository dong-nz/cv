import type { Language } from '@/types'

/**
 * Select one value from a bilingual pair. Plain function, not a hook: `lang` is
 * read once at component top level with `useLanguage()`, so `field` is safe
 * inside `.map()` callbacks.
 *
 * Convention: `value` is the Vietnamese value, `valueEn` the English one. When a
 * pair has no English variant yet, `valueEn` is undefined and both languages
 * render `value`.
 */
export function field<T>(lang: Language, value: T, valueEn: T | undefined): T {
  return lang === 'vi' ? value : (valueEn ?? value)
}
