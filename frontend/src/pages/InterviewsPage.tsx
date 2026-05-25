import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { interviewService, type InterviewFormValues } from '@/services/interview.service'
import type { Interview, InterviewType, InterviewResult } from '@/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import { InterviewForm } from '@/components/InterviewForm'
import { ConfirmModal } from '@/components/ConfirmModal'
import CustomSelect, { type SelectOption } from '@/components/ui/CustomSelect'

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  )
}

export default function InterviewsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<InterviewType | ''>('')
  const [resultFilter, setResultFilter] = useState<InterviewResult | ''>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)

  const interviewsQuery = useQuery({
    queryKey: ['interviews', 'list'],
    queryFn: () => interviewService.list({ page: 0, size: 100 }),
  })

  // Handle deep linking from search
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && interviewsQuery.data?.content) {
      const interview = interviewsQuery.data.content.find(i => i.id === id)
      if (interview) {
        setTimeout(() => {
          setEditingInterview(interview)
          setIsFormOpen(true)
          // Clear the param after opening to avoid re-opening
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('id')
          setSearchParams(newParams, { replace: true })
        }, 0)
      }
    }
  }, [searchParams, interviewsQuery.data, setSearchParams])

  const createMutation = useMutation({
    mutationFn: (values: InterviewFormValues) => interviewService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success(t('common.success'))
      setIsFormOpen(false)
      setEditingInterview(null)
    },
    onError: (error) => {
      console.error(error)
      toast.error(t('common.error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: InterviewFormValues }) => interviewService.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success(t('common.success'))
      setIsFormOpen(false)
      setEditingInterview(null)
    },
    onError: (error) => {
      console.error(error)
      toast.error(t('common.error'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => interviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success(t('common.success'))
    },
    onError: (error) => {
      console.error(error)
      toast.error(t('common.error'))
    },
  })

  const exportMutation = useMutation({
    mutationFn: (id: string) => interviewService.exportIcs(id),
    onSuccess: () => {
      toast.success(t('common.success'))
    },
    onError: (error) => {
      console.error(error)
      toast.error(error instanceof Error ? error.message : t('common.error'))
    },
  })

  // Filter interviews
  const filteredInterviews = useMemo(() => {
    const interviews = interviewsQuery.data?.content ?? []
    return interviews.filter((i) => {
      if (typeFilter && i.type !== typeFilter) return false
      if (resultFilter && i.result !== resultFilter) return false

      if (query) {
        const searchStr = `${i.companyName || ''} ${i.vacancyTitle || ''} ${i.notes || ''}`.toLowerCase()
        if (!searchStr.includes(query.toLowerCase())) return false
      }

      return true
    })
  }, [interviewsQuery.data?.content, typeFilter, resultFilter, query])

  const interviews: Interview[] = interviewsQuery.data?.content ?? []

  // Sort by date (nearest first)
  const sortedInterviews = useMemo(() => {
    return [...filteredInterviews].sort((a, b) => {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    })
  }, [filteredInterviews])

  const handleFormSubmit = async (values: InterviewFormValues) => {
    if (editingInterview) {
      await updateMutation.mutateAsync({ id: editingInterview.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    setEditingInterview(interviews.find(i => i.id === id) || null)
    setIsConfirmDeleteOpen(true)
  }

  const interviewTypeValues: InterviewType[] = ['HR_SCREEN', 'TECH_SCREEN', 'TECH_INTERVIEW', 'FINAL', 'OTHER']
  const interviewResultValues: InterviewResult[] = ['PENDING', 'PASSED', 'FAILED', 'CANCELLED']

  const typeOptions: SelectOption[] = [
    { value: '', label: t('interviews.allTypes') },
    ...interviewTypeValues.map(v => ({ value: v, label: t(`interviews.types.${v}`) })),
  ]

  const resultOptions: SelectOption[] = [
    { value: '', label: t('interviews.allResults') },
    ...interviewResultValues.map(v => ({ value: v, label: t(`interviews.results.${v}`) })),
  ]

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  return (
    <section className="space-y-6">
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false)
          setEditingInterview(null)
        }}
        onConfirm={() => {
          if (editingInterview) {
            deleteMutation.mutate(editingInterview.id)
            setIsConfirmDeleteOpen(false)
            setEditingInterview(null)
          }
        }}
        title={t('interviews.deleteTitle')}
        description={t('interviews.deleteConfirm')}
        isLoading={deleteMutation.isPending}
      />

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => {
              setIsFormOpen(false)
              setEditingInterview(null)
            }}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 animate-slide-up">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0c0c0e]/95 backdrop-blur-sm border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                {editingInterview ? t('interviews.form.editTitle') : t('interviews.form.createTitle')}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingInterview(null)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <InterviewForm
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingInterview(null)
                }}
                initialValues={editingInterview ? {
                  applicationId: editingInterview.applicationId,
                  type: editingInterview.type,
                  scheduledAt: editingInterview.scheduledAt,
                  timezone: editingInterview.timezone,
                  meetingLink: editingInterview.meetingLink,
                  notes: editingInterview.notes,
                  result: editingInterview.result,
                } : undefined}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
              {t('interviews.title')}
            </h1>
            <p className="text-sm text-[#6b7590] mt-0.5">
              {t('interviews.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7590]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('interviews.searchPlaceholder')}
              className="w-full h-10 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <CustomSelect
              value={typeFilter}
              onChange={(val) => setTypeFilter(val as InterviewType | '')}
              options={typeOptions}
              className="w-auto"
            />
            <CustomSelect
              value={resultFilter}
              onChange={(val) => setResultFilter(val as InterviewResult | '')}
              options={resultOptions}
              className="w-auto"
            />

            {/* Results count */}
            <span className="px-3 py-1.5 text-xs font-medium text-[#6b7590] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-full">
              {t('interviews.interviewsCount', { count: filteredInterviews.length })}
            </span>

            {/* Add button */}
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              disabled={createMutation.isPending}
              className="h-10 px-4 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[13px] font-semibold rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-violet-400 transition-all duration-200 disabled:opacity-60"
            >
              <PlusIcon className="w-4 h-4" />
              {t('interviews.addInterview')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {interviewsQuery.isLoading ? (
        <LoadingState message={t('common.loading')} />
      ) : interviewsQuery.error ? (
        <ErrorState
          title={t('common.error')}
          message={interviewsQuery.error instanceof Error ? interviewsQuery.error.message : t('messages.errorMessage')}
        />
      ) : sortedInterviews.length === 0 ? (
        <EmptyState title={t('interviews.emptyState')} description={t('interviews.emptyStateDescription')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedInterviews.map((interview) => (
            <div
              key={interview.id}
              className="group relative flex flex-col p-5 rounded-2xl bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.06)] transition-all duration-300 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_32px_-8px_rgba(139,92,246,0.25)]"
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-violet-600/0 via-violet-500/50 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3
                    className="text-[15px] font-semibold text-[#e8eaed] truncate group-hover:text-white transition-colors"
                    style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
                    title={interview.companyName || interview.vacancyTitle || t('interviews.single')}
                  >
                    {interview.companyName || interview.vacancyTitle || t('interviews.single')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6b7590]">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-400">
                      {t(`interviews.types.${interview.type}`)}
                    </span>
                    {interview.result && (
                      <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${interview.result === 'PASSED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        interview.result === 'FAILED' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          interview.result === 'CANCELLED' ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                        {t(`interviews.results.${interview.result}`)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-xs text-[#8b8fa3] mb-4">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(interview.scheduledAt).toLocaleString()}
              </div>

              {/* Meeting Link */}
              {interview.meetingLink && (
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors mb-4"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  {t('interviews.meetingLink')}
                </a>
              )}

              {/* Notes */}
              {interview.notes && (
                <p
                  className="text-[13px] text-[#8b8fa3] leading-relaxed line-clamp-2 mb-4"
                  title={interview.notes}
                >
                  {interview.notes}
                </p>
              )}

              {/* Divider */}
              <div className="my-auto" />

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    exportMutation.mutate(interview.id)
                  }}
                  disabled={exportMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium text-[#6b7590] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-all duration-200 disabled:opacity-50"
                  title={t('interviews.exportIcs')}
                >
                  {exportMutation.isPending && exportMutation.variables === interview.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CalendarIcon className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(interview)}
                  className="px-3 py-1.5 text-xs font-medium text-[#6b7590] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-all duration-200"
                  title={t('common.edit')}
                >
                  <EditIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(interview.id)}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium text-[#6b7590] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-60"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
