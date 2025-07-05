"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getLanguageByCountry, getTranslations } from "@/lib/languages"

interface LanguageContextType {
  language: string
  translations: any
  setLanguage: (lang: string) => void
  setCountry: (country: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState("en")
  const [translations, setTranslations] = useState(getTranslations("en"))

  useEffect(() => {
    // Load saved language or detect from browser
    const savedLanguage = localStorage.getItem("preferredLanguage")
    if (savedLanguage) {
      setLanguage(savedLanguage)
      setTranslations(getTranslations(savedLanguage))
    } else {
      // Auto-detect from browser language
      const browserLang = navigator.language.split("-")[0]
      const detectedLang = ["en", "es", "fr", "de", "pt", "ar", "zh"].includes(browserLang) ? browserLang : "en"
      setLanguage(detectedLang)
      setTranslations(getTranslations(detectedLang))
    }
  }, [])

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang)
    setTranslations(getTranslations(lang))
    localStorage.setItem("preferredLanguage", lang)
  }

  const handleSetCountry = (countryCode: string) => {
    const detectedLang = getLanguageByCountry(countryCode)
    if (detectedLang !== language) {
      handleSetLanguage(detectedLang)
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        translations,
        setLanguage: handleSetLanguage,
        setCountry: handleSetCountry,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
