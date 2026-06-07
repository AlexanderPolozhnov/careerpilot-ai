import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { settingsService } from '@/services/settings.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Cpu, Cloud, Key } from 'lucide-react'

interface Props {
  onNext: () => void
  onSkip: () => void
}

export function OnboardingStep3Ai({ onNext, onSkip }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: settingsService.getPreferences
  })
  
  const [mode, setMode] = useState<'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY'>('LOCAL')
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    if (preferences?.aiProviderMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(preferences.aiProviderMode)
    }
  }, [preferences])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!preferences) return
      
      const updateData = { ...preferences, aiProviderMode: mode } as unknown as import('@/services/settings.service').PreferencesRequest
      if (mode === 'BRING_YOUR_OWN_KEY' && apiKey) {
        updateData.openAiApiKey = apiKey
      }
      await settingsService.updatePreferences(updateData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
      onNext()
    }
  })

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{t('onboarding.step3Title')}</h2>
        <p className="text-ink-dim">{t('onboarding.step3Description')}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setMode('LOCAL')}
          className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
            mode === 'LOCAL' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-surface-hover'
          }`}
        >
          <Cpu className={`w-6 h-6 ${mode === 'LOCAL' ? 'text-primary' : 'text-ink-dim'}`} />
          <div>
            <div className="font-medium text-sm">{t('settings.aiProviderLocal')}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode('BRING_YOUR_OWN_KEY')}
          className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${
            mode === 'BRING_YOUR_OWN_KEY' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-surface-hover'
          }`}
        >
          <Key className={`w-6 h-6 ${mode === 'BRING_YOUR_OWN_KEY' ? 'text-primary' : 'text-ink-dim'}`} />
          <div>
            <div className="font-medium text-sm">{t('settings.aiProviderCustom')}</div>
          </div>
        </button>

        <button
          type="button"
          disabled
          className="p-4 rounded-xl border border-border flex flex-col items-center gap-2 text-center opacity-50 cursor-not-allowed"
        >
          <Cloud className="w-6 h-6 text-ink-dim" />
          <div>
            <div className="font-medium text-sm">{t('settings.aiProviderCloud')}</div>
            <div className="text-[10px] text-ink-dim mt-1">{t('settings.aiProviderCloudBadge')}</div>
          </div>
        </button>
      </div>

      {mode === 'BRING_YOUR_OWN_KEY' && (
        <div className="animate-in fade-in duration-300">
          <label className="text-xs text-ink-dim">{t('settings.openAiApiKey')}</label>
          <input
            type="password"
            className="input mt-1 w-full"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <button 
          type="button" 
          onClick={onSkip} 
          className="btn-secondary"
          disabled={mutation.isPending}
        >
          {t('onboarding.skip')}
        </button>
        <button 
          type="button" 
          onClick={() => mutation.mutate()} 
          className="btn-primary"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? t('common.loading') : t('onboarding.next')}
        </button>
      </div>
    </div>
  )
}
