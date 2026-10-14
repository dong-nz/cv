import {createContext, useCallback, useContext, useEffect, useState} from 'react'

type Language = 'en' | 'vi'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
}

const STORAGE_KEY = 'portfolio-lang'

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'vi') {
      return stored
    }
  } catch {
    // localStorage unavailable
  }
  // Detect browser language
  return navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage)

  // Set <html lang> during render (synchronous, before paint)
  document.documentElement.setAttribute('lang', lang)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // localStorage unavailable
    }
  }, [lang])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'en' ? 'vi' : 'en'))
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
