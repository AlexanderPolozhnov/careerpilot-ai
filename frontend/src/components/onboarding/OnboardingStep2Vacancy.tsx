import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { vacancyService } from '@/services/vacancy.service'
import { companyService } from '@/services/company.service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Props {
  onNext: () => void
  onSkip: () => void
}

export function OnboardingStep2Vacancy({ onNext, onSkip }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!title || !companyName) return
      
      const companyRes = await companyService.list({ search: companyName, size: 1 })
      let companyId = companyRes.content[0]?.id
      
      if (!companyId) {
        const newCompany = await companyService.create({ name: companyName })
        companyId = newCompany.id
      }
      
      await vacancyService.create({
        title,
        companyId,
        remote: 'HYBRID',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      onNext()
    }
  })

  const handleNext = () => {
    if (!title || !companyName) {
      onSkip()
      return
    }
    mutation.mutate()
  }

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{t('onboarding.step2Title')}</h2>
        <p className="text-ink-dim">{t('onboarding.step2Description')}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs text-ink-dim">{t('vacancies.form.title')}</label>
          <input
            className="input mt-1 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Frontend Engineer"
          />
        </div>
        <div>
          <label className="text-xs text-ink-dim">{t('vacancies.form.company')}</label>
          <input
            className="input mt-1 w-full"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Google"
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
          onClick={handleNext} 
          className="btn-primary"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? t('common.loading') : t('onboarding.next')}
        </button>
      </div>
    </div>
  )
}
