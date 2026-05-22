import { useMemo } from 'react'
import { useForm, type Resolver, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { companyService } from '@/services/company.service'
import { LoadingState } from './LoadingState'
import type { TFunction } from 'i18next'
import CustomSelect, { type SelectOption } from '@/components/ui/CustomSelect'

const remoteTypeValues = ['REMOTE', 'HYBRID', 'ON_SITE'] as const
const contractTypeValues = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'] as const

const getVacancySchema = (t: TFunction) => z.object({
  title: z.string().min(3, t('forms.validation.minLength', { length: 3 })),
  companyId: z.string().min(1, t('vacancies.form.errors.companyRequired')),
  url: z.string().url(t('vacancies.form.errors.invalidUrl')).optional().or(z.literal('')),
  description: z.string().optional(),
  location: z.string().optional(),
  remote: z.enum(remoteTypeValues),
  contractType: z.enum(contractTypeValues),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryCurrency: z.string().optional(),
  deadline: z.string().optional(),
  tags: z.string().optional(),
})

export type VacancyFormValues = z.infer<ReturnType<typeof getVacancySchema>>

interface VacancyFormProps {
  onSubmit: (values: VacancyFormValues) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<VacancyFormValues>
  isSubmitting?: boolean
}

export function VacancyForm({ onSubmit, onCancel, initialValues, isSubmitting }: VacancyFormProps) {
  const { t } = useTranslation()
  const vacancySchema = getVacancySchema(t)

  const companiesQuery = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: () => companyService.list({ page: 0, size: 500 }),
  })

  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema) as unknown as Resolver<VacancyFormValues>,
    defaultValues: useMemo(() => ({
      remote: 'REMOTE',
      contractType: 'FULL_TIME',
      salaryCurrency: 'USD',
      ...initialValues,
      deadline: initialValues?.deadline ? initialValues.deadline.slice(0, 10) : undefined,
    }), [initialValues]),
  })

  if (companiesQuery.isLoading) {
    return <LoadingState message={t('companies.loading')} />
  }

  const companies = companiesQuery.data?.content ?? []

  const companyOptions: SelectOption[] = [
    { value: '', label: t('vacancies.form.selectCompany') },
    ...companies.map(c => ({ value: c.id, label: c.name })),
  ]

  const remoteOptions: SelectOption[] = remoteTypeValues.map(v => ({ value: v, label: v }))

  const contractTypeOptions: SelectOption[] = contractTypeValues.map(v => ({ value: v, label: v }))

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="text-xs text-ink-dim">{t('vacancies.form.title')}</label>
        <input id="title" {...form.register('title')} className="input mt-1" />
        {form.formState.errors.title && <p className="text-xs text-danger mt-1">{form.formState.errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="companyId" className="text-xs text-ink-dim">{t('vacancies.form.company')}</label>
        <Controller
          name="companyId"
          control={form.control}
          render={({ field }) => (
            <CustomSelect
              value={field.value ?? ''}
              onChange={field.onChange}
              options={companyOptions}
              className="mt-1"
            />
          )}
        />
        {form.formState.errors.companyId && <p className="text-xs text-danger mt-1">{form.formState.errors.companyId.message}</p>}
      </div>

      <div>
        <label htmlFor="url" className="text-xs text-ink-dim">{t('vacancies.form.url')}</label>
        <input id="url" {...form.register('url')} className="input mt-1" placeholder="https://" />
        {form.formState.errors.url && <p className="text-xs text-danger mt-1">{form.formState.errors.url.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-xs text-ink-dim">{t('vacancies.form.description')}</label>
        <textarea id="description" {...form.register('description')} className="input mt-1 h-24 py-2" />
      </div>

      <div>
        <label htmlFor="tags" className="text-xs text-ink-dim">{t('vacancies.form.tags')}</label>
        <input
          id="tags"
          {...form.register('tags')}
          className="input mt-1"
          placeholder={t('settings.skillsPlaceholder')}
        />
        <p className="text-[10px] text-ink-dim/50 mt-1">{t('settings.skillsHint')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="text-xs text-ink-dim">{t('vacancies.form.location')}</label>
          <input id="location" {...form.register('location')} className="input mt-1" />
        </div>
        <div>
          <label htmlFor="deadline" className="text-xs text-ink-dim">{t('vacancies.form.deadline')}</label>
          <input id="deadline" type="date" {...form.register('deadline')} className="input mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="remote" className="text-xs text-ink-dim">{t('vacancies.form.remote')}</label>
          <Controller
            name="remote"
            control={form.control}
            render={({ field }) => (
              <CustomSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                options={remoteOptions}
                className="mt-1"
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="contractType" className="text-xs text-ink-dim">{t('vacancies.form.contractType')}</label>
          <Controller
            name="contractType"
            control={form.control}
            render={({ field }) => (
              <CustomSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                options={contractTypeOptions}
                className="mt-1"
              />
            )}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-ink-dim">{t('vacancies.form.salary')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mt-1">
          <input {...form.register('salaryMin')} type="number" placeholder={t('vacancies.form.salaryMin')} className="input" />
          <input {...form.register('salaryMax')} type="number" placeholder={t('vacancies.form.salaryMax')} className="input" />
          <input {...form.register('salaryCurrency')} placeholder={t('vacancies.form.salaryCurrency')} className="input w-24" />
        </div>
      </div>


      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : (initialValues?.title ? t('common.save') : t('common.create'))}
        </button>
      </div>

    </form>
  )
}
