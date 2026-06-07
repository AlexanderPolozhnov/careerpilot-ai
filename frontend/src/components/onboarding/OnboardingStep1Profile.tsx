import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/useAuth'
import { profileService } from '@/services/profile.service'
import { settingsService } from '@/services/settings.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface Props {
  onNext: () => void
  onSkip: () => void
}

export function OnboardingStep1Profile({ onNext, onSkip }: Props) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileService.getMe
  })
  
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.name) setName(user.name)
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (profile?.headline) setHeadline(profile.headline)
  }, [profile])

  const mutation = useMutation({
    mutationFn: async () => {
      const promises = []
      if (name && name !== user?.name) {
        promises.push(settingsService.updateMe({ name, email: user?.email || '' }))
      }
      if (headline && headline !== profile?.headline) {
        promises.push(profileService.updateMe({ headline }))
      }
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      onNext()
    }
  })

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{t('onboarding.step1Title')}</h2>
        <p className="text-ink-dim">{t('onboarding.step1Description')}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-ink-dim">{t('auth.name')}</label>
          <input
            className="input mt-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="text-xs text-ink-dim">{t('settings.headline')}</label>
          <input
            className="input mt-1 w-full"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder={t('settings.headlinePlaceholder')}
          />
        </div>
      </div>

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
