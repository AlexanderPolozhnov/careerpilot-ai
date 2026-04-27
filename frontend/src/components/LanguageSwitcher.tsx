import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation()
    const currentLanguage = i18n.language

    const toggleLanguage = () => {
        const newLang = currentLanguage === 'ru' ? 'en' : 'ru'
        i18n.changeLanguage(newLang)
    }

    return (
        <button
            type="button"
            onClick={toggleLanguage}
            className={cn(
                'inline-flex items-center gap-2 rounded-xl border border-border',
                'bg-surface-2/70 px-3 py-2 hover:bg-surface-2 transition-colors',
                'text-sm font-medium text-ink cursor-pointer',
            )}
            title={t('common.language')}
        >
            <Globe className="w-4 h-4 text-ink-dim" />
            <span className="hidden sm:inline">{currentLanguage.toUpperCase()}</span>
        </button>
    )
}
