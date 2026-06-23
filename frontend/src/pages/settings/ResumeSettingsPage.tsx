import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Save, Sparkles } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { resumeService } from '@/services/resume.service'
import { toast } from '@/lib/toast'
import { useEffect, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'

interface ResumeFormData {
  rawText: string
  coverLetterTemplate: string
}

export default function ResumeSettingsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')

  const { data: resumeData, isLoading } = useQuery({
    queryKey: ['user-resume'],
    queryFn: () => resumeService.getMyResume()
  })

  const { data: resumesList } = useQuery({
    queryKey: ['resumes', 'list'],
    queryFn: () => resumeService.list()
  })

  const { handleSubmit, control, reset, setValue } = useForm<ResumeFormData>({
    defaultValues: {
      rawText: '',
      coverLetterTemplate: ''
    }
  })

  const handleExtract = () => {
    if (!selectedResumeId || !resumesList) return
    const selected = resumesList.find((r) => r.id === selectedResumeId)
    if (!selected) return

    // Clear form rawText value first
    setValue('rawText', '')

    // Wait short delay then populate text
    setTimeout(() => {
      if (selected.textContent) {
        setValue('rawText', selected.textContent)
        toast.success(t('settings.resume.extractSuccess', 'Текст резюме успешно извлечен'))
      } else {
        toast.warning(t('settings.resume.extractEmpty', 'Выбранное резюме не содержит текстового контента'))
      }
    }, 200)
  }

  useEffect(() => {
    if (resumeData) {
      reset({
        rawText: resumeData.rawText || '',
        coverLetterTemplate: resumeData.coverLetterTemplate || ''
      })
    }
  }, [resumeData, reset])

  const mutation = useMutation({
    mutationFn: (data: ResumeFormData) => resumeService.updateMyResume(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-resume'] })
      toast.success(t('settings.resume.success', 'Настройки резюме успешно сохранены'))
    },
    onError: (err) => {
      console.error(err)
      toast.error(t('settings.resume.error', 'Ошибка при сохранении настроек резюме'))
    }
  })

  const onSubmit = (data: ResumeFormData) => {
    mutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/app/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back', 'Назад')}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t('settings.resume.title', 'Настройки резюме и шаблона')}
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            {t(
              'settings.resume.description',
              'Укажите текстовую версию вашего резюме и шаблон сопроводительного письма. ИИ будет сверять их с новыми вакансиями и автоматически готовить письма.'
            )}
          </p>
        </div>
      </div>

      {/* Main card */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 backdrop-blur-md">
          <div className="space-y-6">
            {/* Raw Textarea */}
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <FileText className="h-4 w-4 text-primary-400" />
                  {t('settings.resume.labelRawText', 'Текст резюме')}
                </label>
                
                <div className="flex items-center gap-2 self-start md:self-auto bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {t('settings.resume.myResumes', 'Мои резюме')}:
                  </span>
                  {resumesList && resumesList.length > 0 ? (
                    <>
                      <CustomSelect
                        value={selectedResumeId}
                        onChange={(val) => setSelectedResumeId(val)}
                        options={resumesList.map((r) => ({
                          value: r.id,
                          label: r.name
                        }))}
                        placeholder={t('settings.resume.selectResumePlaceholder', 'Выберите резюме')}
                        className="w-[180px] sm:w-[220px]"
                      />
                      <button
                        type="button"
                        onClick={handleExtract}
                        disabled={!selectedResumeId}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                        {t('settings.resume.extractButton', 'Извлечь')}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-white/40">
                      {t('settings.resume.noResumesUploaded', 'Нет загруженных файлов. Добавьте их в настройках.')}
                    </span>
                  )}
                </div>
              </div>
              <Controller
                name="rawText"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={12}
                    className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder={t(
                      'settings.resume.placeholderRawText',
                      'Вставьте сюда весь текст вашего резюме (навыки, стек, опыт работы, проекты и образование)...'
                    )}
                  />
                )}
              />
            </div>

            {/* Cover Letter Template Textarea */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {t('settings.resume.labelCoverLetterTemplate', 'Шаблон сопроводительного письма')}
              </label>
              <Controller
                name="coverLetterTemplate"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={8}
                    className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder={t(
                      'settings.resume.placeholderCoverLetterTemplate',
                      'Здравствуйте! Меня заинтересовала ваша вакансия... Напишите примерный шаблон письма, который ИИ адаптирует под вакансию.'
                    )}
                  />
                )}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {mutation.isPending
                ? t('settings.resume.saving', 'Сохранение...')
                : t('settings.resume.save', 'Сохранить настройки')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
