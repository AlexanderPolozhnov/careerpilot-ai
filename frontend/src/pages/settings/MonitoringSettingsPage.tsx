import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Coins, Plus, Search, Trash2, X, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { monitoringService } from '@/services/monitoring.service'
import { toast } from '@/lib/toast'
import { formatRelative } from '@/lib/utils'

interface FilterFormData {
  searchQuery: string
  targetSalary: number | ''
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
      targetSalary: ''
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: { searchQuery: string; targetSalary: number | null }) => monitoringService.createFilter(data),
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
    mutationFn: (args: { id: string; isActive: boolean }) => monitoringService.updateFilter(args.id, { isActive: args.isActive }),
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
      targetSalary: data.targetSalary === '' ? null : Number(data.targetSalary)
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate({ id, isActive: !currentStatus })
  }

  const handleDelete = (id: string) => {
    if (window.confirm(t('settings.monitoring.deleteConfirm', 'Вы уверены, что хотите удалить этот фильтр?'))) {
      deleteMutation.mutate(id)
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
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${filter.isActive ? 'bg-primary-500/10 text-primary-400' : 'bg-gray-800 text-gray-500'}`}>
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-100 line-clamp-1">{filter.searchQuery}</h3>
                      {filter.targetSalary ? (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-emerald-400 font-medium">
                          <Coins className="h-3 w-3" />
                          <span>от {filter.targetSalary.toLocaleString()} ₽</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Зарплата не указана</span>
                      )}
                    </div>
                  </div>

                  {/* Switch */}
                  <button
                    onClick={() => handleToggle(filter.id, filter.isActive)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      filter.isActive ? 'bg-primary-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        filter.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
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
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-gray-950 p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsModalOpen(false)
                reset()
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-100 mb-6">
              {t('settings.monitoring.modalTitle', 'Новый фильтр автопоиска')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
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
                      className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                      placeholder={t('settings.monitoring.searchQueryPlaceholder', 'Например: Frontend React Developer')}
                    />
                  )}
                />
                {errors.searchQuery && (
                  <span className="text-xs text-red-400 mt-1 block">{errors.searchQuery.message}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  {t('settings.monitoring.targetSalary', 'Минимальная зарплата (₽)')}
                </label>
                <Controller
                  name="targetSalary"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                      placeholder={t('settings.monitoring.targetSalaryPlaceholder', 'Например: 120000')}
                    />
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    reset()
                  }}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {t('settings.monitoring.cancel', 'Отмена')}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createMutation.isPending ? t('common.saving', 'Сохранение...') : t('settings.monitoring.create', 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
