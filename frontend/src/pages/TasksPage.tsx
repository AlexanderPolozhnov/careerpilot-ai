import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { taskService, type TaskRequest } from '@/services/task.service'
import type { Task, TaskPriority } from '@/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import { TaskForm } from '@/components/TaskForm'
import { ConfirmModal } from '@/components/ConfirmModal'
import { formatDateTime } from '@/lib/utils'
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export default function TasksPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [doneFilter, setDoneFilter] = useState<boolean | ''>('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'list'],
    queryFn: () => taskService.list({ page: 0, size: 100 }),
  })

  // Handle deep linking from search
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && tasksQuery.data?.content) {
      const task = tasksQuery.data.content.find(t => t.id === id)
      if (task) {
        setTimeout(() => {
          setEditingTask(task)
          setIsFormOpen(true)
          // Clear the param after opening to avoid re-opening
          const newParams = new URLSearchParams(searchParams)
          newParams.delete('id')
          setSearchParams(newParams, { replace: true })
        }, 0)
      }
    }
  }, [searchParams, tasksQuery.data, setSearchParams])

  const createMutation = useMutation({
    mutationFn: (values: TaskRequest) => taskService.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
      toast.success(t('common.success'))
      setIsFormOpen(false)
      setEditingTask(null)
    },
    onError: (error) => {
      console.error(error)
      toast.error(t('common.error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskRequest }) => taskService.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
      toast.success(t('common.success'))
      setIsFormOpen(false)
      setEditingTask(null)
    },
    onError: (error) => {
      console.error(error)
      toast.error(t('common.error'))
    },
  })

  const toggleDoneMutation = useMutation({
    mutationFn: (id: string) => taskService.toggleDone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
    },
    onError: (error) => {
      console.error(error)
      toast.error(t('common.error'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] })
      toast.success(t('common.success'))
    },
    onError: (error) => {
      console.error(error)
      toast.error(t('common.error'))
    },
  })

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const tasks = tasksQuery.data?.content ?? []
    return tasks.filter((task) => {
      if (priorityFilter && task.priority !== priorityFilter) return false
      if (doneFilter !== '' && task.done !== doneFilter) return false

      if (query) {
        const searchStr = `${task.title} ${task.description || ''}`.toLowerCase()
        if (!searchStr.includes(query.toLowerCase())) return false
      }

      return true
    })
  }, [tasksQuery.data?.content, priorityFilter, doneFilter, query])

  const tasks: Task[] = tasksQuery.data?.content ?? []

  // Sort by due date (overdue and nearest first), then by priority
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // Undone tasks first
      if (a.done !== b.done) return a.done ? 1 : -1

      // Then by due date
      if (a.dueAt && b.dueAt) {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      }
      if (a.dueAt) return -1
      if (b.dueAt) return 1

      // Then by priority (URGENT > HIGH > MEDIUM > LOW)
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [filteredTasks])

  const handleFormSubmit = async (values: TaskRequest) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleToggleDone = (task: Task) => {
    toggleDoneMutation.mutate(task.id)
  }

  const handleDelete = (id: string) => {
    setEditingTask(tasks.find(t => t.id === id) || null)
    setIsConfirmDeleteOpen(true)
  }

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  const priorityOptions: SelectOption[] = [
    { value: '', label: t('tasks.allPriorities') },
    { value: 'LOW', label: t('tasks.priorities.LOW'), color: '#6aafdb' },
    { value: 'MEDIUM', label: t('tasks.priorities.MEDIUM'), color: '#7dd3b0' },
    { value: 'HIGH', label: t('tasks.priorities.HIGH'), color: '#a78bfa' },
    { value: 'URGENT', label: t('tasks.priorities.URGENT'), color: '#e05a5a' },
  ]

  const statusOptions: SelectOption[] = [
    { value: '', label: t('tasks.allStatuses') },
    { value: 'false', label: t('tasks.status.pending') },
    { value: 'true', label: t('tasks.status.done') },
  ]

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT': return 'bg-rose-500/20 border-rose-500/30 text-rose-400 font-bold animate-pulse'
      case 'HIGH': return 'bg-red-500/10 border-red-500/20 text-red-400'
      case 'MEDIUM': return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      case 'LOW': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    }
  }

  return (
    <section className="space-y-6">
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false)
          setEditingTask(null)
        }}
        onConfirm={() => {
          if (editingTask) {
            deleteMutation.mutate(editingTask.id)
            setIsConfirmDeleteOpen(false)
            setEditingTask(null)
          }
        }}
        title={t('tasks.deleteTitle')}
        description={t('tasks.deleteConfirm')}
        isLoading={deleteMutation.isPending}
      />

      {/* Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => {
              setIsFormOpen(false)
              setEditingTask(null)
            }}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 animate-slide-up">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0c0c0e]/95 backdrop-blur-sm border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                {editingTask ? t('tasks.form.editTitle') : t('tasks.form.createTitle')}
              </h3>
              <button
                onClick={() => {
                  setIsFormOpen(false)
                  setEditingTask(null)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TaskForm
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingTask(null)
                }}
                initialValues={editingTask ? {
                  title: editingTask.title,
                  description: editingTask.description,
                  dueAt: editingTask.dueAt,
                  done: editingTask.done,
                  priority: editingTask.priority,
                  applicationId: editingTask.applicationId,
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
              {t('tasks.title')}
            </h1>
            <p className="text-sm text-[#6b7590] mt-0.5">
              {t('tasks.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7590]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('tasks.searchPlaceholder')}
              className="w-full h-10 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <CustomSelect
              value={priorityFilter}
              onChange={(val) => setPriorityFilter(val as TaskPriority | '')}
              options={priorityOptions}
              className="w-auto"
            />
            <CustomSelect
              value={doneFilter === '' ? '' : String(doneFilter)}
              onChange={(val) => setDoneFilter(val === '' ? '' : val === 'true')}
              options={statusOptions}
              className="w-auto"
            />

            {/* Results count */}
            <span className="px-3 py-1.5 text-xs font-medium text-[#6b7590] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-full">
              {t('tasks.tasksCount', { count: filteredTasks.length })}
            </span>

            {/* Add button */}
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              disabled={createMutation.isPending}
              className="h-10 px-4 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[13px] font-semibold rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-violet-400 transition-all duration-200 disabled:opacity-60"
            >
              <PlusIcon className="w-4 h-4" />
              {t('tasks.form.createTitle')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {tasksQuery.isLoading ? (
        <LoadingState message={t('common.loading')} />
      ) : tasksQuery.error ? (
        <ErrorState
          title={t('common.error')}
          message={tasksQuery.error instanceof Error ? tasksQuery.error.message : t('messages.errorMessage')}
        />
      ) : sortedTasks.length === 0 ? (
        <EmptyState title={t('tasks.emptyState')} description={t('tasks.emptyStateDescription')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`group relative flex flex-col p-5 rounded-2xl bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.06)] transition-all duration-300 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_32px_-8px_rgba(139,92,246,0.25)] ${task.done ? 'opacity-60' : ''}`}
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-violet-600/0 via-violet-500/50 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3
                    className={`text-[15px] font-semibold truncate group-hover:text-white transition-colors ${task.done ? 'line-through text-[#6b7590]' : 'text-[#e8eaed]'}`}
                    style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
                    title={task.title}
                  >
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-md border text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {t(`tasks.priorities.${task.priority}`)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleDone(task)}
                  disabled={toggleDoneMutation.isPending}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${task.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-[#6b7590] hover:text-white hover:bg-white/[0.1]'}`}
                  title={task.done ? t('tasks.markUndone') : t('tasks.markDone')}
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              {task.description && (
                <p
                  className={`text-[13px] leading-relaxed line-clamp-2 mb-4 ${task.done ? 'text-[#6b7590]' : 'text-[#8b8fa3]'}`}
                  title={task.description}
                >
                  {task.description}
                </p>
              )}

              {/* Due Date */}
              {task.dueAt && (
                <div className="flex items-center gap-2 text-xs text-[#8b8fa3] mb-4">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDateTime(task.dueAt)}
                </div>
              )}

              {/* Divider */}
              <div className="my-auto" />

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-auto">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-3 py-1.5 text-xs font-medium text-[#6b7590] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-all duration-200"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
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
