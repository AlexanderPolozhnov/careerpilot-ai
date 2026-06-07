import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  onComplete: () => void
  isPending: boolean
}

export function OnboardingStep4Done({ onComplete, isPending }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center items-center py-6">
      <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-150">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      
      <div className="space-y-2 max-w-sm">
        <h2 className="text-2xl font-semibold tracking-tight">{t('onboarding.step4Title')}</h2>
        <p className="text-ink-dim">{t('onboarding.step4Description')}</p>
      </div>

      <div className="pt-4 w-full max-w-[200px]">
        <button 
          type="button" 
          onClick={onComplete} 
          className="btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? t('common.loading') : t('onboarding.finish')}
        </button>
      </div>
    </div>
  )
}
