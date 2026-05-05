import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settings.service'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const queryClient = useQueryClient()
  const currentLanguage = i18n.language

  const toggleLanguage = async () => {
    const newLang = currentLanguage === 'ru' ? 'en' : 'ru'
    await i18n.changeLanguage(newLang)
    try {
      const prefs = await settingsService.getPreferences()
      await settingsService.updatePreferences({ ...prefs, language: newLang })
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
    } catch {
      // ignore — language already changed locally
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        'group inline-flex items-center gap-2 h-9 px-3 rounded-lg',
        'bg-white/[0.04] border border-white/[0.06]',
        'hover:bg-white/[0.06] hover:border-white/[0.08]',
        'transition-all duration-150 cursor-pointer'
      )}
      title={t('common.language')}
    >
      <Globe className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
      <span className="hidden sm:inline text-[13px] font-medium text-white/60 group-hover:text-white/80 transition-colors">
        {currentLanguage.toUpperCase()}
      </span>
    </button>
  )
}
