import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OnboardingStep1Profile } from './OnboardingStep1Profile'
import { OnboardingStep2Vacancy } from './OnboardingStep2Vacancy'
import { OnboardingStep3Ai } from './OnboardingStep3Ai'
import { OnboardingStep4Done } from './OnboardingStep4Done'
import { settingsService } from '@/services/settings.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GraduationCap } from 'lucide-react'
import { isTelegramWebApp } from '@/lib/telegram'

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: settingsService.completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] })
    }
  })

  // Если Telegram WebApp, не показываем wizard и сразу завершаем онбординг
  if (isTelegramWebApp()) {
    if (!mutation.isPending && !mutation.isSuccess) {
      mutation.mutate()
    }
    return null
  }

  const nextStep = () => setStep((s) => Math.min(4, s + 1))

  const renderStep = () => {
    switch (step) {
      case 1:
        return <OnboardingStep1Profile onNext={nextStep} onSkip={nextStep} />
      case 2:
        return <OnboardingStep2Vacancy onNext={nextStep} onSkip={nextStep} />
      case 3:
        return <OnboardingStep3Ai onNext={nextStep} onSkip={nextStep} />
      case 4:
        return <OnboardingStep4Done onComplete={() => mutation.mutate()} isPending={mutation.isPending} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-surface/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header / Progress */}
        <div className="p-6 bg-surface-hover/30 border-b border-border flex flex-col items-center justify-center relative">
          <div className="absolute top-6 left-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex space-x-2 w-32 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-primary' : 'bg-ink-dim/20'
                }`}
              />
            ))}
          </div>
          <div className="text-[10px] text-ink-dim uppercase tracking-wider font-semibold mt-3">
            {t('onboarding.progress', { current: step, total: 4 })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
