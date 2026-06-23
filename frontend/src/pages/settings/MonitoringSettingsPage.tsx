import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Coins, Plus, Search, Trash2, X, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { monitoringService } from '@/services/monitoring.service'
import { toast } from '@/lib/toast'
import { formatRelative, cn } from '@/lib/utils'
import type { VacancyFilter } from '@/types'
import CustomSelect from '@/components/ui/CustomSelect'
import CustomMultiSelect from '@/components/ui/CustomMultiSelect'


interface FilterFormData {
  searchQuery: string
  targetSalary: number | ''
  experience: string
  employment: string
  schedule: string
  area: string
  onlyWithSalary: boolean
  pollingInterval: number
}

// Toggle Switch Component
function Toggle({ checked, onChange, disabled = false }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090d]',
        checked ? 'bg-violet-600' : 'bg-white/10',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-out',
          checked && 'translate-x-5'
        )}
      />
    </button>
  )
}

const getAreaLabel = (areaId: string, t: TFunction) => {
  switch (areaId) {
    case '1': return t('settings.monitoring.areaMoscow')
    case '2': return t('settings.monitoring.areaSpb')
    case '4': return t('settings.monitoring.areaNsk')
    case '3': return t('settings.monitoring.areaEkb')
    case '66': return t('settings.monitoring.areaNizhny')
    case '88': return t('settings.monitoring.areaKazan')
    case '1438': return t('settings.monitoring.areaKrasnodar')
    case '113': return t('settings.monitoring.areaRussia')
    case '40': return t('settings.monitoring.areaKazakhstan')
    case '16': return t('settings.monitoring.areaBelarus')
    case '97': return t('settings.monitoring.areaUzbekistan')
    case '28': return t('settings.monitoring.areaGeorgia')
    case '5': return t('settings.monitoring.areaArmenia')
    default: return areaId
  }
}

const getExperienceLabel = (exp: string, t: TFunction) => {
  if (!exp) return ''
  const key = `settings.monitoring.experience${exp.charAt(0).toUpperCase() + exp.slice(1)}`
  return t(key, exp)
}

const getEmploymentLabel = (emp: string, t: TFunction) => {
  if (!emp) return ''
  const key = `settings.monitoring.employment${emp.charAt(0).toUpperCase() + emp.slice(1)}`
  return t(key, emp)
}

const getScheduleLabel = (sch: string, t: TFunction) => {
  if (!sch) return ''
  const key = `settings.monitoring.schedule${sch.charAt(0).toUpperCase() + sch.slice(1)}`
  return t(key, sch)
}

export default function MonitoringSettingsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const experienceOptions = [
    { value: '', label: t('settings.monitoring.experienceAny', 'Любой опыт') },
    { value: 'noExperience', label: t('settings.monitoring.experienceNoExperience', 'Нет опыта') },
    { value: 'between1And3', label: t('settings.monitoring.experienceBetween1And3', 'От 1 года до 3 лет') },
    { value: 'between3And6', label: t('settings.monitoring.experienceBetween3And6', 'От 3 до 6 лет') },
    { value: 'moreThan6', label: t('settings.monitoring.experienceMoreThan6', 'Более 6 лет') }
  ]

  const employmentOptions = [
    { value: '', label: t('settings.monitoring.employmentAny', 'Любая занятость') },
    { value: 'full', label: t('settings.monitoring.employmentFull', 'Полная занятость') },
    { value: 'part', label: t('settings.monitoring.employmentPart', 'Частичная занятость') },
    { value: 'project', label: t('settings.monitoring.employmentProject', 'Проектная работа') },
    { value: 'volunteer', label: t('settings.monitoring.employmentVolunteer', 'Волонтерство') },
    { value: 'probation', label: t('settings.monitoring.employmentProbation', 'Стажировка') }
  ]

  const scheduleOptions = [
    { value: '', label: t('settings.monitoring.scheduleAny', 'Любой график') },
    { value: 'fullDay', label: t('settings.monitoring.scheduleFullDay', 'Полный день') },
    { value: 'shift', label: t('settings.monitoring.scheduleShift', 'Сменный график') },
    { value: 'flexible', label: t('settings.monitoring.scheduleFlexible', 'Гибкий график') },
    { value: 'remote', label: t('settings.monitoring.scheduleRemote', 'Удаленная работа') },
    { value: 'flyInFlyOut', label: t('settings.monitoring.scheduleFlyInFlyOut', 'Вахтовый метод') }
  ]

  const areaOptions = [
    { value: '', label: t('settings.monitoring.areaAny', 'Везде (любой регион)') },
    { value: '113', label: t('settings.monitoring.areaRussia', 'Россия (вся страна)') },
    { value: '113,40,16', label: t('settings.monitoring.areaCIS', 'Россия, Казахстан, Беларусь') },
    { value: '40', label: t('settings.monitoring.areaKazakhstan', 'Казахстан (вся страна)') },
    { value: '16', label: t('settings.monitoring.areaBelarus', 'Беларусь (вся страна)') },
    { value: '97', label: t('settings.monitoring.areaUzbekistan', 'Узбекистан (вся страна)') },
    { value: '28', label: t('settings.monitoring.areaGeorgia', 'Грузия (вся страна)') },
    { value: '5', label: t('settings.monitoring.areaArmenia', 'Армения (вся страна)') },
    { value: '1,2', label: t('settings.monitoring.areaCapitals', 'Москва + Санкт-Петербург') },
    { value: '1', label: t('settings.monitoring.areaMoscow', 'Москва') },
    { value: '2', label: t('settings.monitoring.areaSpb', 'Санкт-Петербург') },
    { value: '4', label: t('settings.monitoring.areaNsk', 'Новосибирск') },
    { value: '3', label: t('settings.monitoring.areaEkb', 'Екатеринбург') },
    { value: '66', label: t('settings.monitoring.areaNizhny', 'Нижний Новгород') },
    { value: '88', label: t('settings.monitoring.areaKazan', 'Казань') },
    { value: '1438', label: t('settings.monitoring.areaKrasnodar', 'Краснодар') }
  ]

  const pollingIntervalOptions = [
    { value: '30', label: t('settings.monitoring.pollingIntervalMin30', '30 минут (по умолчанию)') },
    { value: '60', label: t('settings.monitoring.pollingIntervalHour1', '1 час') },
    { value: '120', label: t('settings.monitoring.pollingIntervalHour2', '2 часа') },
    { value: '240', label: t('settings.monitoring.pollingIntervalHour4', '4 часа') },
    { value: '720', label: t('settings.monitoring.pollingIntervalHour12', '12 часов') },
    { value: '1440', label: t('settings.monitoring.pollingIntervalDay1', '24 часа') }
  ]

  const { data: filters, isLoading } = useQuery({
    queryKey: ['monitoring-filters'],
    queryFn: () => monitoringService.getFilters()
  })

  const { handleSubmit, control, reset, formState: { errors } } = useForm<FilterFormData>({
    defaultValues: {
      searchQuery: '',
      targetSalary: '',
      experience: '',
      employment: '',
      schedule: '',
      area: '',
      onlyWithSalary: false,
      pollingInterval: 30
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      searchQuery: string
      targetSalary: number | null
      experience?: string
      employment?: string
      schedule?: string
      area?: string
      onlyWithSalary?: boolean
      pollingInterval?: number
    }) => monitoringService.createFilter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-filters'] })
      toast.success(t('settings.monitoring.createSuccess', 'Фильтр успешно добавлен'))
      setIsModalOpen(false)
      reset()
    },
    onError: (err) => {
      console.error(err)
      toast.error(t('settings.monitoring.error', 'Произошла ошибка'))
    }
  })

  const toggleMutation = useMutation({
    mutationFn: (args: {
      id: string
      searchQuery: string
      targetSalary: number | null
      isActive: boolean
      experience?: string
      employment?: string
      schedule?: string
      area?: string
      onlyWithSalary?: boolean
      pollingInterval?: number
    }) =>
      monitoringService.updateFilter(args.id, {
        searchQuery: args.searchQuery,
        targetSalary: args.targetSalary,
        isActive: args.isActive,
        experience: args.experience,
        employment: args.employment,
        schedule: args.schedule,
        area: args.area,
        onlyWithSalary: args.onlyWithSalary,
        pollingInterval: args.pollingInterval
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-filters'] })
      toast.success(t('settings.monitoring.updateSuccess', 'Статус фильтра успешно обновлен'))
    },
    onError: (err) => {
      console.error(err)
      toast.error(t('settings.monitoring.error', 'Произошла ошибка'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => monitoringService.deleteFilter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-filters'] })
      toast.success(t('settings.monitoring.deleteSuccess', 'Фильтр удален'))
    },
    onError: (err) => {
      console.error(err)
      toast.error(t('settings.monitoring.error', 'Произошла ошибка'))
    }
  })

  const onSubmit = (data: FilterFormData) => {
    createMutation.mutate({
      searchQuery: data.searchQuery.trim(),
      targetSalary: data.targetSalary === '' ? null : Number(data.targetSalary),
      experience: data.experience || undefined,
      employment: data.employment || undefined,
      schedule: data.schedule || undefined,
      area: data.area || undefined,
      onlyWithSalary: data.onlyWithSalary,
      pollingInterval: Number(data.pollingInterval)
    })
  }

  const handleToggle = (filter: VacancyFilter) => {
    toggleMutation.mutate({
      id: filter.id,
      searchQuery: filter.searchQuery,
      targetSalary: filter.targetSalary,
      isActive: !filter.isActive,
      experience: filter.experience,
      employment: filter.employment,
      schedule: filter.schedule,
      area: filter.area,
      onlyWithSalary: filter.onlyWithSalary,
      pollingInterval: filter.pollingInterval
    })
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('settings.monitoring.deleteConfirm', 'Вы уверены, что хотите удалить этот фильтр?'))) {
      deleteMutation.mutate(id)
    }
  }

  const getIntervalLabel = (interval?: number) => {
    if (!interval) return t('settings.monitoring.pollingIntervalMin30')
    switch (interval) {
      case 15: return t('settings.monitoring.pollingIntervalMin15')
      case 30: return t('settings.monitoring.pollingIntervalMin30')
      case 60: return t('settings.monitoring.pollingIntervalHour1')
      case 120: return t('settings.monitoring.pollingIntervalHour2')
      case 240: return t('settings.monitoring.pollingIntervalHour4')
      case 720: return t('settings.monitoring.pollingIntervalHour12')
      case 1440: return t('settings.monitoring.pollingIntervalDay1')
      default: return `${interval} мин`
    }
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
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t('settings.monitoring.title', 'Умный автопоиск вакансий')}
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-xl">
            {t(
              'settings.monitoring.description',
              'Настройте поисковые фильтры. Наш сервис будет регулярно опрашивать вакансии на hh.ru, отбирать лучшие и присылать вам уведомления в Telegram.'
            )}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t('settings.monitoring.addFilter', 'Добавить фильтр')}
        </button>
      </div>

      {/* Filters List */}
      {filters && filters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className={`rounded-2xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between ${
                filter.isActive
                  ? 'border-white/[0.08] bg-white/[0.03]'
                  : 'border-white/[0.03] bg-white/[0.01] opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg mt-0.5 ${filter.isActive ? 'bg-primary-500/10 text-primary-400' : 'bg-gray-800 text-gray-500'}`}>
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-100 truncate">{filter.searchQuery}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {filter.targetSalary ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                            <Coins className="h-2.5 w-2.5" />
                            от {filter.targetSalary.toLocaleString()} ₽
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/[0.03] text-gray-500 text-[10px] border border-white/[0.05]">
                            Зарплата любая
                          </span>
                        )}
                        {filter.experience && filter.experience.split(',').filter(Boolean).map((exp) => (
                          <span key={exp} className="inline-flex items-center px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-medium border border-violet-500/20">
                            {getExperienceLabel(exp, t)}
                          </span>
                        ))}
                        {filter.employment && filter.employment.split(',').filter(Boolean).map((emp) => (
                          <span key={emp} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20">
                            {getEmploymentLabel(emp, t)}
                          </span>
                        ))}
                        {filter.schedule && filter.schedule.split(',').filter(Boolean).map((sch) => (
                          <span key={sch} className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/20">
                            {getScheduleLabel(sch, t)}
                          </span>
                        ))}
                        {filter.area && filter.area.split(',').filter(Boolean).map((areaId) => (
                          <span key={areaId} className="inline-flex items-center px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-medium border border-rose-500/20">
                            {getAreaLabel(areaId, t)}
                          </span>
                        ))}
                        {filter.onlyWithSalary && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[10px] font-medium border border-teal-500/20">
                            {t('settings.monitoring.onlyWithSalary')}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] text-white/40 text-[10px] border border-white/[0.05]">
                          <Clock className="h-2.5 w-2.5" />
                          {getIntervalLabel(filter.pollingInterval)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <div className="ml-3 flex-shrink-0">
                    <Toggle checked={filter.isActive} onChange={() => handleToggle(filter)} />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {t('settings.monitoring.lastPolled', 'Последняя проверка')}:{' '}
                    {filter.lastPolledAt ? formatRelative(filter.lastPolledAt) : t('settings.monitoring.neverPolled', 'еще не выполнялась')}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.05] flex justify-end">
                <button
                  onClick={() => handleDelete(filter.id)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                  title={t('common.delete', 'Удалить')}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center bg-white/[0.01]">
          <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            {t('settings.monitoring.empty', 'У вас пока нет активных фильтров мониторинга.')}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t('settings.monitoring.addFilter', 'Добавить фильтр')}
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0b0f] flex flex-col max-h-[85vh] shadow-2xl relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-100">
                {t('settings.monitoring.modalTitle', 'Новый фильтр автопоиска')}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  reset()
                }}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
                {/* 1. Поисковый запрос */}
                <div>
                  <label className="text-xs text-ink-dim">
                    {t('settings.monitoring.searchQuery', 'Поисковый запрос')} *
                  </label>
                  <Controller
                    name="searchQuery"
                    control={control}
                    rules={{ required: t('settings.monitoring.queryRequired', 'Поисковый запрос обязателен') }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="input mt-1"
                        placeholder={t('settings.monitoring.searchQueryPlaceholder', 'Например: Frontend React Developer')}
                      />
                    )}
                  />
                  {errors.searchQuery && (
                    <span className="text-xs text-red-400 mt-1 block">{errors.searchQuery.message}</span>
                  )}
                </div>

                {/* 2. Минимальная зарплата */}
                <div>
                  <label className="text-xs text-ink-dim">
                    {t('settings.monitoring.targetSalary', 'Минимальная зарплата (₽)')}
                  </label>
                  <Controller
                    name="targetSalary"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        className="input mt-1"
                        placeholder={t('settings.monitoring.targetSalaryPlaceholder', 'Например: 120000')}
                      />
                    )}
                  />
                </div>

                {/* 3. Опыт работы */}
                <div>
                  <label className="text-xs text-ink-dim">
                    {t('settings.monitoring.experience', 'Опыт работы')}
                  </label>
                  <Controller
                    name="experience"
                    control={control}
                    render={({ field }) => (
                      <CustomMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={experienceOptions}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

                {/* 4. Тип занятости */}
                <div>
                  <label className="text-xs text-ink-dim">
                    {t('settings.monitoring.employment', 'Тип занятости')}
                  </label>
                  <Controller
                    name="employment"
                    control={control}
                    render={({ field }) => (
                      <CustomMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={employmentOptions}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

                {/* 5. График работы */}
                <div>
                  <label className="text-xs text-ink-dim">
                    {t('settings.monitoring.schedule', 'График работы')}
                  </label>
                  <Controller
                    name="schedule"
                    control={control}
                    render={({ field }) => (
                      <CustomMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={scheduleOptions}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

                {/* 6. География поиска */}
                <div>
                  <label className="text-xs text-ink-dim">
                    {t('settings.monitoring.area', 'География поиска')}
                  </label>
                  <Controller
                    name="area"
                    control={control}
                    render={({ field }) => (
                      <CustomMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={areaOptions}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

                {/* 7. Интервал опроса */}
                <div>
                  <label className="text-xs text-ink-dim">
                    {t('settings.monitoring.pollingInterval', 'Интервал опроса')}
                  </label>
                  <Controller
                    name="pollingInterval"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={String(field.value)}
                        onChange={(val) => field.onChange(Number(val))}
                        options={pollingIntervalOptions}
                        className="mt-1"
                      />
                    )}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Controller
                    name="onlyWithSalary"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <input
                        id="onlyWithSalary"
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/50"
                      />
                    )}
                  />
                  <label htmlFor="onlyWithSalary" className="text-sm text-white/70">
                    {t('settings.monitoring.onlyWithSalary', 'Только с указанием зарплаты')}
                  </label>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="border-t border-white/[0.08] p-6 bg-[#0a0b0f] rounded-b-2xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    reset()
                  }}
                  className="btn-secondary"
                >
                  {t('settings.monitoring.cancel', 'Отмена')}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? t('common.loading', 'Загрузка...') : t('settings.monitoring.create', 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
