import { useForm, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { resumeService } from '@/services/resume.service'
import { toast } from '@/lib/toast'

const getResumeSchema = (t: TFunction) => z.object({
  name: z.string().min(2, t('forms.validation.minLength', { length: 2 })),
  fileUrl: z.union([z.literal(''), z.string().url(t('vacancies.form.errors.invalidUrl'))]).optional(),
  textContent: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export type ResumeFormValues = z.infer<ReturnType<typeof getResumeSchema>>

interface ResumeFormProps {
  onSubmit: (values: ResumeFormValues) => Promise<void>
  onCancel: () => void
  initialValues?: Partial<ResumeFormValues>
  isSubmitting?: boolean
}

export function ResumeForm({ onSubmit, onCancel, initialValues, isSubmitting }: ResumeFormProps) {
  const { t } = useTranslation()
  const resumeSchema = getResumeSchema(t)

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema) as unknown as Resolver<ResumeFormValues>,
    defaultValues: {
      isDefault: false,
      ...initialValues,
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const extractMutation = useMutation({
    mutationFn: resumeService.extractText,
    onSuccess: (data) => {
      form.setValue('textContent', data.text, { shouldValidate: true, shouldDirty: true })
      toast.success(t('settings.resumes.extractSuccess'))
    },
    onError: () => {
      toast.error(t('errors.extractFailed'))
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isAllowedExt = file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')
    if (!isAllowedExt || file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.resumes.uploadFormat'))
      return
    }
    extractMutation.mutate(file)
    e.target.value = '' // clear input
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-xs text-ink-dim">{t('settings.resumes.form.name')}</label>
        <input id="name" {...form.register('name')} className="input mt-1" />
        {form.formState.errors.name && <p className="text-xs text-danger mt-1">{form.formState.errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="fileUrl" className="text-xs text-ink-dim">{t('settings.resumes.form.fileUrl')}</label>
        <input id="fileUrl" {...form.register('fileUrl')} className="input mt-1" placeholder="https://"/>
        {form.formState.errors.fileUrl && <p className="text-xs text-danger mt-1">{form.formState.errors.fileUrl.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="textContent" className="text-xs text-ink-dim">{t('settings.resumes.form.textContent')}</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={extractMutation.isPending}
            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
            title={t('settings.resumes.uploadFormat')}
          >
            {extractMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {extractMutation.isPending ? t('settings.resumes.uploading') : t('settings.resumes.uploadFile')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />
        </div>
        <textarea id="textContent" {...form.register('textContent')} className="input h-32 py-2" disabled={extractMutation.isPending} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isDefault"
          type="checkbox"
          {...form.register('isDefault')}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50"
        />
        <label htmlFor="isDefault" className="text-sm text-white/70">
          {t('settings.resumes.makeDefault')}
        </label>
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
