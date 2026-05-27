import { useForm, type Resolver, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { InterviewType, InterviewResult } from '@/types'
import { applicationService } from '@/services/application.service'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useEffect } from 'react'
import CustomSelect, { type SelectOption } from '@/components/ui/CustomSelect'

const interviewTypeValues: InterviewType[] = ['HR_SCREEN', 'TECH_SCREEN', 'TECH_INTERVIEW', 'FINAL', 'OTHER']
const interviewResultValues: InterviewResult[] = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED']

const commonTimezones = [
  'UTC',
  'Europe/Moscow',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Tbilisi',
  'Asia/Yerevan',
  'Asia/Almaty',
  'Asia/Singapore',
  'Asia/Tokyo',
]

const getInterviewSchema = (t: TFunction) => z.object({
  applicationId: z.string().min(1, t('forms.validation.required')),
  type: z.enum(interviewTypeValues),
  scheduledAt: z.string().min(1, t('forms.validation.required')),
  timezone: z.string().min(1, t('forms.validation.required')),
  meetingLink: z.string().url(t('forms.validation.invalidUrl')).optional().or(z.literal('')),
  notes: z.string().optional(),
  result: z.enum(interviewResultValues).optional(),
})

export type InterviewFormValues = z.infer<ReturnType<typeof getInterviewSchema>>

interface InterviewFormProps {
  onSubmit: (values: InterviewFormValues) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<InterviewFormValues>
  isSubmitting?: boolean
  applicationId?: string // If provided, pre-select and disable application selection
}

export function InterviewForm({ onSubmit, onCancel, initialValues, isSubmitting, applicationId }: InterviewFormProps) {
  const { t } = useTranslation()
  const interviewSchema = getInterviewSchema(t)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')

  // Default to browser timezone if not provided
  const browserTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])

  // Combine common timezones with initial or browser timezone
  const timezoneOptions = useMemo(() => {
    const zones = new Set(commonTimezones)
    if (initialValues?.timezone) zones.add(initialValues.timezone)
    zones.add(browserTimezone)
    
    return Array.from(zones)
      .sort()
      .map(tz => ({ value: tz, label: tz }))
  }, [initialValues?.timezone, browserTimezone])

  // Fetch active applications for the dropdown
  const applicationsQuery = useQuery({
    queryKey: ['applications', 'active'],
    queryFn: () => applicationService.list({ page: 0, size: 100 }),
  })

  // Extract unique companies from applications
  const companies = useMemo(() => {
    if (!applicationsQuery.data?.content) return []
    const companyMap = new Map<string, { id: string; name: string }>()
    applicationsQuery.data.content.forEach((app) => {
      const company = app.vacancy?.company
      if (company?.id && company?.name) {
        companyMap.set(company.id, { id: company.id, name: company.name })
      }
    })
    return Array.from(companyMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [applicationsQuery.data?.content])

  // Filter vacancies by selected company
  const filteredVacancies = useMemo(() => {
    if (!applicationsQuery.data?.content || !selectedCompanyId) return []
    return applicationsQuery.data.content.filter((app) => {
      const company = app.vacancy?.company
      return company?.id === selectedCompanyId
    })
  }, [applicationsQuery.data?.content, selectedCompanyId])

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema) as unknown as Resolver<InterviewFormValues>,
    defaultValues: {
      applicationId: applicationId || '',
      type: 'TECH_INTERVIEW',
      result: 'PENDING',
      timezone: browserTimezone,
      ...initialValues,
    },
  })

  // Pre-select company when editing
  useEffect(() => {
    if (initialValues?.applicationId && applicationsQuery.data?.content) {
      const app = applicationsQuery.data.content.find(a => a.id === initialValues.applicationId)
      if (app?.vacancy?.company?.id) {
        setSelectedCompanyId(app.vacancy.company.id)
      }
    }
  }, [initialValues?.applicationId, applicationsQuery.data?.content])

  // Handle company selection - reset vacancy selection
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId)
    form.setValue('applicationId', '')
  }

  // Handle vacancy selection - find and set applicationId
  const handleVacancyChange = (applicationId: string) => {
    form.setValue('applicationId', applicationId)
  }

  const typeOptions: SelectOption[] = interviewTypeValues.map(v => ({
    value: v,
    label: t(`interviews.types.${v}`),
  }))

  const resultOptions: SelectOption[] = interviewResultValues.map(v => ({
    value: v,
    label: t(`interviews.results.${v}`),
  }))

  const companyOptions: SelectOption[] = [
    { value: '', label: t('interviews.form.selectCompany') },
    ...companies.map((company) => ({
      value: company.id,
      label: company.name,
    })),
  ]

  const vacancyOptions: SelectOption[] = [
    {
      value: '',
      label: selectedCompanyId ? t('interviews.form.selectVacancy') : t('interviews.form.selectCompanyFirst'),
    },
    ...filteredVacancies.map((app) => ({
      value: app.id,
      label: app.vacancy?.title || t('common.unknown'),
    })),
  ]

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="company" className="text-xs text-ink-dim">{t('interviews.form.company')}</label>
          <CustomSelect
            value={selectedCompanyId}
            onChange={handleCompanyChange}
            options={companyOptions}
            disabled={!!applicationId}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="vacancy" className="text-xs text-ink-dim">{t('interviews.form.vacancy')}</label>
          <CustomSelect
            value={form.watch('applicationId')}
            onChange={handleVacancyChange}
            options={vacancyOptions}
            disabled={!selectedCompanyId || !!applicationId}
            className="mt-1"
          />
          {form.formState.errors.applicationId && <p className="text-xs text-danger mt-1">{form.formState.errors.applicationId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="text-xs text-ink-dim">{t('interviews.form.type')}</label>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <CustomSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                options={typeOptions}
                className="mt-1"
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="result" className="text-xs text-ink-dim">{t('interviews.form.result')}</label>
          <Controller
            name="result"
            control={form.control}
            render={({ field }) => (
              <CustomSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                options={resultOptions}
                className="mt-1"
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="scheduledAt" className="text-xs text-ink-dim">{t('interviews.form.scheduledAt')}</label>
          <input
            id="scheduledAt"
            type="datetime-local"
            {...form.register('scheduledAt')}
            className="input mt-1"
          />
          {form.formState.errors.scheduledAt && <p className="text-xs text-danger mt-1">{form.formState.errors.scheduledAt.message}</p>}
        </div>
        <div>
          <label htmlFor="timezone" className="text-xs text-ink-dim">{t('interviews.form.timezone')}</label>
          <Controller
            name="timezone"
            control={form.control}
            render={({ field }) => (
              <CustomSelect
                value={field.value ?? ''}
                onChange={field.onChange}
                options={timezoneOptions}
                className="mt-1"
              />
            )}
          />
          {form.formState.errors.timezone && <p className="text-xs text-danger mt-1">{form.formState.errors.timezone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="meetingLink" className="text-xs text-ink-dim">{t('interviews.form.meetingLink')}</label>
        <input id="meetingLink" {...form.register('meetingLink')} className="input mt-1" placeholder="https://zoom.us/j/..." />
        {form.formState.errors.meetingLink && <p className="text-xs text-danger mt-1">{form.formState.errors.meetingLink.message}</p>}
      </div>

      <div>
        <label htmlFor="notes" className="text-xs text-ink-dim">{t('interviews.form.notes')}</label>
        <textarea id="notes" {...form.register('notes')} className="input mt-1 h-24 py-2" />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : (initialValues?.applicationId || initialValues?.type ? t('common.save') : t('common.create'))}
        </button>
      </div>
    </form>
  )
}
