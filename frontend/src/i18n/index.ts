import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import ruTranslations from './locales/ru.json'
import enTranslations from './locales/en.json'

const DEFAULT_LANGUAGE = 'ru'
const STORAGE_KEY = 'careerpilot_language'

// Get saved language from localStorage or use default
const getSavedLanguage = (): string => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE
}

i18next
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ruTranslations },
            en: { translation: enTranslations },
        },
        lng: getSavedLanguage(),
        fallbackLng: DEFAULT_LANGUAGE,
        interpolation: {
            escapeValue: false,
        },
    })

// Save language preference when it changes
i18next.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lng)
    }
})

export default i18next
