import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Dictionary, type Lang } from './content'

interface LangContextValue {
  lang: Lang
  t: Dictionary
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue>({
  lang: 'zh',
  t: translations.zh,
  setLang: () => {},
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh')
  const t = translations[lang]

  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  document.title = t.meta.title
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', t.meta.description)

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
