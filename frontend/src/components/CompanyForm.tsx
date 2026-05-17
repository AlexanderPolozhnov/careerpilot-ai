import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { CompanySize } from '@/types'

const companySizeValues: CompanySize[] = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']

const getCompanySchema = (t: TFunction) => z.object({
  name: z.string().min(2, t('forms.validation.minLength', { length: 2 })),
  website: z.string().url(t('forms.validation.invalidUrl')).optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.enum(['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  linkedinUrl: z.string().url(t('forms.validation.invalidUrl')).optional().or(z.literal('')),
})

export type CompanyFormValues = z.infer<ReturnType<typeof getCompanySchema>>

interface CompanyFormProps {
  onSubmit: (values: CompanyFormValues) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<CompanyFormValues>
  isSubmitting?: boolean
}

export function CompanyForm({ onSubmit, onCancel, initialValues, isSubmitting }: CompanyFormProps) {
  const { t } = useTranslation()
  const companySchema = getCompanySchema(t)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema) as unknown as Resolver<CompanyFormValues>,
    defaultValues: {
      ...initialValues,
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-xs text-ink-dim">{t('companies.form.name')}</label>
        <input id="name" {...form.register('name')} className="input mt-1" />
        {form.formState.errors.name && <p className="text-xs text-danger mt-1">{form.formState.errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="website" className="text-xs text-ink-dim">{t('companies.form.website')}</label>
          <input id="website" {...form.register('website')} className="input mt-1" placeholder="https://" />
          {form.formState.errors.website && <p className="text-xs text-danger mt-1">{form.formState.errors.website.message}</p>}
        </div>
        <div>
          <label htmlFor="industry" className="text-xs text-ink-dim">{t('companies.form.industry')}</label>
          <input id="industry" {...form.register('industry')} className="input mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="size" className="text-xs text-ink-dim">{t('companies.form.size')}</label>
          <select id="size" {...form.register('size')} className="select mt-1">
            <option value="" className="select-option">{t('companies.form.selectSize')}</option>
            {companySizeValues.map(v => <option key={v} value={v} className="select-option">{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="text-xs text-ink-dim">{t('companies.form.location')}</label>
          <input id="location" {...form.register('location')} className="input mt-1" />
        </div>
      </div>

      <div>
        <label htmlFor="linkedinUrl" className="text-xs text-ink-dim">{t('companies.form.linkedinUrl')}</label>
        <input id="linkedinUrl" {...form.register('linkedinUrl')} className="input mt-1" placeholder="https://linkedin.com/company/..." />
        {form.formState.errors.linkedinUrl && <p className="text-xs text-danger mt-1">{form.formState.errors.linkedinUrl.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="text-xs text-ink-dim">{t('companies.form.description')}</label>
        <textarea id="description" {...form.register('description')} className="input mt-1 h-24 py-2" />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : (initialValues?.name ? t('common.save') : t('common.create'))}
        </button>
      </div>

    </form>
  )
}
