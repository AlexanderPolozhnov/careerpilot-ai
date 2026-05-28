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
        'group relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150',
        'text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
      )}
    >
      <div className="relative">
        <Globe className="w-[18px] h-[18px]" />
        <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold bg-white/10 px-1 rounded border border-white/20 text-white/80">
          {currentLanguage.toUpperCase()}
        </span>
      </div>

      {/* Tooltip */}
      <span className="absolute top-full right-0 mt-2 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[#1a1a1e] border border-white/10 text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100] shadow-xl">
        {t('common.language')}: {currentLanguage === 'ru' ? t('common.russian') : t('common.english')}
      </span>
    </button>
  )
}
