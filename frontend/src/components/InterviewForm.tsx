import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { InterviewType, InterviewResult } from '@/types'
import { applicationService } from '@/services/application.service'
import { useQuery } from '@tanstack/react-query'

const interviewTypeValues: InterviewType[] = ['PHONE', 'HR', 'TECHNICAL', 'SYSTEM_DESIGN', 'CULTURE_FIT', 'FINAL', 'OTHER']
const interviewResultValues: InterviewResult[] = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED']

const getInterviewSchema = (t: TFunction) => z.object({
  applicationId: z.string().min(1, t('forms.validation.required')),
  type: z.enum(interviewTypeValues),
  scheduledAt: z.string().min(1, t('forms.validation.required')),
  timezone: z.string().optional(),
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

  // Fetch active applications for the dropdown
  const applicationsQuery = useQuery({
    queryKey: ['applications', 'active'],
    queryFn: () => applicationService.list({ page: 0, size: 100 }),
  })

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema) as unknown as Resolver<InterviewFormValues>,
    defaultValues: {
      applicationId: applicationId || '',
      type: 'TECHNICAL',
      result: 'PENDING',
      ...initialValues,
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="applicationId" className="text-xs text-ink-dim">{t('interviews.form.application')}</label>
        <select
          id="applicationId"
          {...form.register('applicationId')}
          disabled={!!applicationId}
          className="select mt-1"
        >
          <option value="" className="select-option">
            {t('interviews.form.selectApplication')}
          </option>
          {applicationsQuery.data?.content.map((app) => {
            // Check for both board-style and list-style data structures
            const companyName = (app as any).vacancy?.company?.name || (app as any).companyName || t('common.unknown');
            const vacancyTitle = (app as any).vacancy?.title || (app as any).vacancyTitle || t('common.unknown');
            
            return (
              <option key={app.id} value={app.id} className="select-option">
                {companyName} - {vacancyTitle}
              </option>
            );
          })}
        </select>
        {form.formState.errors.applicationId && <p className="text-xs text-danger mt-1">{form.formState.errors.applicationId.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="text-xs text-ink-dim">{t('interviews.form.type')}</label>
          <select 
            id="type" 
            {...form.register('type')} 
            className="select mt-1"
          >
            {interviewTypeValues.map(v => (
              <option key={v} value={v} className="select-option">
                {t(`interviews.types.${v}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="result" className="text-xs text-ink-dim">{t('interviews.form.result')}</label>
          <select 
            id="result" 
            {...form.register('result')} 
            className="select mt-1"
          >
            {interviewResultValues.map(v => (
              <option key={v} value={v} className="select-option">
                {t(`interviews.results.${v}`)}
              </option>
            ))}
          </select>
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
          <input id="timezone" {...form.register('timezone')} className="input mt-1" placeholder="Europe/Moscow" />
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
          {isSubmitting ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}
