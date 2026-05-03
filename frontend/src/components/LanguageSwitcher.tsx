import {useTranslation} from 'react-i18next'
import {Globe} from 'lucide-react'
import {cn} from '@/lib/utils'
import {useQueryClient} from '@tanstack/react-query'
import {settingsService} from '@/services/settings.service'

export function LanguageSwitcher() {
    const {i18n, t} = useTranslation()
    const queryClient = useQueryClient()
    const currentLanguage = i18n.language

    const toggleLanguage = async () => {
        const newLang = currentLanguage === 'ru' ? 'en' : 'ru'
        await i18n.changeLanguage(newLang)
        try {
            const prefs = await settingsService.getPreferences()
            await settingsService.updatePreferences({...prefs, language: newLang})
            queryClient.invalidateQueries({queryKey: ['preferences']})
        } catch {
            // ignore — language already changed locally
        }
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
            <Globe className="w-4 h-4 text-ink-dim"/>
            <span className="hidden sm:inline">{currentLanguage.toUpperCase()}</span>
        </button>
    )
}
