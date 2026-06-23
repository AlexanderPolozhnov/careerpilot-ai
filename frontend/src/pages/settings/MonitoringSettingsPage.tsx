import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Coins, Plus, Search, Trash2, X, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { monitoringService } from '@/services/monitoring.service'
import { toast } from '@/lib/toast'
import { formatRelative, cn } from '@/lib/utils'
import type { VacancyFilter } from '@/types'

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

export default function MonitoringSettingsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)

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
                        {filter.experience && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-medium border border-violet-500/20">
                            {t(`settings.monitoring.experience${filter.experience.charAt(0).toUpperCase() + filter.experience.slice(1)}`)}
                          </span>
                        )}
                        {filter.employment && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20">
                            {t(`settings.monitoring.employment${filter.employment.charAt(0).toUpperCase() + filter.employment.slice(1)}`)}
                          </span>
                        )}
                        {filter.schedule && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/20">
                            {t(`settings.monitoring.schedule${filter.schedule.charAt(0).toUpperCase() + filter.schedule.slice(1)}`)}
                          </span>
                        )}
                        {filter.area && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-medium border border-rose-500/20">
                            {filter.area === '1' && t('settings.monitoring.areaMoscow')}
                            {filter.area === '2' && t('settings.monitoring.areaSpb')}
                            {filter.area === '1,2' && t('settings.monitoring.areaCapitals')}
                            {filter.area === '4' && t('settings.monitoring.areaNsk')}
                            {filter.area === '3' && t('settings.monitoring.areaEkb')}
                            {filter.area === '66' && t('settings.monitoring.areaNizhny')}
                            {filter.area === '88' && t('settings.monitoring.areaKazan')}
                            {filter.area === '1438' && t('settings.monitoring.areaKrasnodar')}
                            {filter.area === '113' && t('settings.monitoring.areaRussia')}
                            {filter.area === '40' && t('settings.monitoring.areaKazakhstan')}
                            {filter.area === '16' && t('settings.monitoring.areaBelarus')}
                            {filter.area === '97' && t('settings.monitoring.areaUzbekistan')}
                            {filter.area === '28' && t('settings.monitoring.areaGeorgia')}
                            {filter.area === '5' && t('settings.monitoring.areaArmenia')}
                            {filter.area === '113,40,16' && t('settings.monitoring.areaCIS')}
                          </span>
                        )}
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
                      <select {...field} className="select mt-1">
                        <option value="">{t('settings.monitoring.areaAny', 'Любой')}</option>
                        <option value="noExperience">{t('settings.monitoring.experienceNoExperience', 'Нет опыта')}</option>
                        <option value="between1And3">{t('settings.monitoring.experienceBetween1And3', 'От 1 года до 3 лет')}</option>
                        <option value="between3And6">{t('settings.monitoring.experienceBetween3And6', 'От 3 до 6 лет')}</option>
                        <option value="moreThan6">{t('settings.monitoring.experienceMoreThan6', 'Более 6 лет')}</option>
                      </select>
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
                      <select {...field} className="select mt-1">
                        <option value="">{t('settings.monitoring.areaAny', 'Любой')}</option>
                        <option value="full">{t('settings.monitoring.employmentFull', 'Полная занятость')}</option>
                        <option value="part">{t('settings.monitoring.employmentPart', 'Частичная занятость')}</option>
                        <option value="project">{t('settings.monitoring.employmentProject', 'Проектная работа')}</option>
                        <option value="volunteer">{t('settings.monitoring.employmentVolunteer', 'Волонтерство')}</option>
                        <option value="probation">{t('settings.monitoring.employmentProbation', 'Стажировка')}</option>
                      </select>
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
                      <select {...field} className="select mt-1">
                        <option value="">{t('settings.monitoring.areaAny', 'Любой')}</option>
                        <option value="fullDay">{t('settings.monitoring.scheduleFullDay', 'Полный день')}</option>
                        <option value="shift">{t('settings.monitoring.scheduleShift', 'Сменный график')}</option>
                        <option value="flexible">{t('settings.monitoring.scheduleFlexible', 'Гибкий график')}</option>
                        <option value="remote">{t('settings.monitoring.scheduleRemote', 'Удаленная работа')}</option>
                        <option value="flyInFlyOut">{t('settings.monitoring.scheduleFlyInFlyOut', 'Вахтовый метод')}</option>
                      </select>
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
                      <select {...field} className="select mt-1">
                        <option value="">{t('settings.monitoring.areaAny', 'Везде (любой регион)')}</option>
                        {/* Страны и группы */}
                        <option value="113">{t('settings.monitoring.areaRussia', 'Россия (вся страна)')}</option>
                        <option value="113,40,16">{t('settings.monitoring.areaCIS', 'Россия, Казахстан, Беларусь')}</option>
                        <option value="40">{t('settings.monitoring.areaKazakhstan', 'Казахстан (вся страна)')}</option>
                        <option value="16">{t('settings.monitoring.areaBelarus', 'Беларусь (вся страна)')}</option>
                        <option value="97">{t('settings.monitoring.areaUzbekistan', 'Узбекистан (вся страна)')}</option>
                        <option value="28">{t('settings.monitoring.areaGeorgia', 'Грузия (вся страна)')}</option>
                        <option value="5">{t('settings.monitoring.areaArmenia', 'Армения (вся страна)')}</option>
                        {/* Популярные города и комбинации */}
                        <option value="1,2">{t('settings.monitoring.areaCapitals', 'Москва + Санкт-Петербург')}</option>
                        <option value="1">{t('settings.monitoring.areaMoscow', 'Москва')}</option>
                        <option value="2">{t('settings.monitoring.areaSpb', 'Санкт-Петербург')}</option>
                        <option value="4">{t('settings.monitoring.areaNsk', 'Новосибирск')}</option>
                        <option value="3">{t('settings.monitoring.areaEkb', 'Екатеринбург')}</option>
                        <option value="66">{t('settings.monitoring.areaNizhny', 'Нижний Новгород')}</option>
                        <option value="88">{t('settings.monitoring.areaKazan', 'Казань')}</option>
                        <option value="1438">{t('settings.monitoring.areaKrasnodar', 'Краснодар')}</option>
                      </select>
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
                      <select {...field} className="select mt-1" onChange={(e) => field.onChange(Number(e.target.value))}>
                        <option value={30}>{t('settings.monitoring.pollingIntervalMin30', '30 минут (по умолчанию)')}</option>
                        <option value={60}>{t('settings.monitoring.pollingIntervalHour1', '1 час')}</option>
                        <option value={120}>{t('settings.monitoring.pollingIntervalHour2', '2 часа')}</option>
                        <option value={240}>{t('settings.monitoring.pollingIntervalHour4', '4 часа')}</option>
                        <option value={720}>{t('settings.monitoring.pollingIntervalHour12', '12 часов')}</option>
                        <option value={1440}>{t('settings.monitoring.pollingIntervalDay1', '24 часа')}</option>
                      </select>
                    )}
                  />
                </div>

                {/* 8. Только с указанной ЗП */}
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
