import type { Language, Palette } from '@/types'

export const paletteIds: Palette[] = ['red', 'blue']

export const paletteMeta: Record<Palette, { label: Record<Language, string>; hint: Record<Language, string> }> = {
  red:  { label: { en: 'Red',  vi: 'Đỏ' },         hint: { en: 'warm neutral', vi: 'trung tính ấm' } },
  blue: { label: { en: 'Blue', vi: 'Xanh dương' }, hint: { en: 'cool neutral', vi: 'trung tính lạnh' } },
}
