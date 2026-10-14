import { useLanguage } from '@/hooks/useLanguage'

/**
 * React hook: select field by language. Must be called at component top level.
 */
export function useField<T>(value: T, valueEn: T | undefined): T {
  const { lang } = useLanguage()
  return lang === 'vi' ? value : (valueEn ?? value)
}

/**
 * React hook: select array field by language. Must be called at component top level.
 */
export function useFieldArray<T>(value: T[], valueEn: T[] | undefined): T[] {
  const { lang } = useLanguage()
  return lang === 'vi' ? value : (valueEn ?? value)
}
