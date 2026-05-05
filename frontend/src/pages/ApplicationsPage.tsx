import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { applicationService } from '@/services/application.service'
import type { Application, ApplicationStatus } from '@/types'
import { cn } from '@/lib/utils'
import { ApiError } from '@/services/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const STATUS_ORDER: ApplicationStatus[] = [
  'NEW',
  'SAVED',
  'APPLIED',
  'HR_SCREEN',
  'TECH_INTERVIEW',
  'FINAL_ROUND',
  'OFFER',
  'REJECTED',
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  'NEW': 'applications.new',
  'SAVED': 'applications.saved',
  'APPLIED': 'applications.applied',
  'HR_SCREEN': 'applications.hrScreen',
  'TECH_INTERVIEW': 'applications.techInterview',
  'FINAL_ROUND': 'applications.finalRound',
  'OFFER': 'applications.offer',
  'REJECTED': 'applications.rejected',
}

// Status color mapping for visual hierarchy
const STATUS_COLORS: Record<ApplicationStatus, { bg: string; border: string; text: string; dot: string }> = {
  'NEW': { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', dot: 'bg-slate-400' },
  'SAVED': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-400' },
  'APPLIED': { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', dot: 'bg-violet-400' },
  'HR_SCREEN': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' },
  'TECH_INTERVIEW': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'FINAL_ROUND': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
  'OFFER': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'REJECTED': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
}

type BoardData = Record<ApplicationStatus, Application[]>

const BOARD_QUERY_KEY = ['applications', 'board'] as const

function findContainerByApplicationId(board: BoardData, id: string): ApplicationStatus | null {
  for (const status of STATUS_ORDER) {
    if ((board[status] ?? []).some((application) => application.id === id)) {
      return status
    }
  }
  return null
}

function resolveOverStatus(board: BoardData, overId: string): ApplicationStatus | null {
  if ((STATUS_ORDER as string[]).includes(overId)) {
    return overId as ApplicationStatus
  }
  return findContainerByApplicationId(board, overId)
}

function moveToDifferentStatus(
  board: BoardData,
  activeId: string,
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus,
  overId: string,
): BoardData {
  const fromItems = [...(board[fromStatus] ?? [])]
  const toItems = [...(board[toStatus] ?? [])]
  const activeIndex = fromItems.findIndex((item) => item.id === activeId)
  if (activeIndex < 0) {
    return board
  }

  const [movingItem] = fromItems.splice(activeIndex, 1)
  const updatedItem: Application = { ...movingItem, status: toStatus }
  const overIndex = toItems.findIndex((item) => item.id === overId)
  const targetIndex = overIndex >= 0 ? overIndex : toItems.length
  toItems.splice(targetIndex, 0, updatedItem)

  return {
    ...board,
    [fromStatus]: fromItems,
    [toStatus]: toItems,
  }
}

function ApplicationCardBody({ application, isDragging = false }: { application: Application; isDragging?: boolean }) {
  const statusColors = STATUS_COLORS[application.status]
  
  return (
    <div className={cn('space-y-3', isDragging && 'opacity-90')}>
      {/* Header with company avatar and status */}
      <div className="flex items-start gap-3">
        {/* Company avatar */}
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-[#8b8fa3]">
            {(application.vacancy?.company?.name ?? 'C').charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] font-medium text-[#e8eaed] leading-snug line-clamp-2">
            {application.vacancy?.title ?? 'Vacancy'}
          </h4>
          <p className="text-[12px] text-[#6b7590] mt-0.5 truncate">
            {application.vacancy?.company?.name ?? 'Company'}
          </p>
        </div>
      </div>
      
      {/* Meta info row */}
      <div className="flex items-center gap-2 flex-wrap">
        {application.vacancy?.location && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6b7590]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {application.vacancy.location}
          </span>
        )}
        {application.createdAt && (
          <span className="text-[11px] text-[#4a4e5a]">
            {new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
      
      {/* Notes snippet */}
      {application.notes && (
        <div className="pt-2 border-t border-[rgba(255,255,255,0.04)]">
          <p className="text-[11px] text-[#6b7590] line-clamp-2 leading-relaxed italic">
            "{application.notes}"
          </p>
        </div>
      )}
      
      {/* Status indicator */}
      <div className="flex items-center justify-between pt-1">
        <div className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide',
          statusColors.bg, statusColors.text
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', statusColors.dot)} />
          {application.status.replace('_', ' ')}
        </div>
        
        {/* Drag handle indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-[#4a4e5a]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

function SortableApplicationCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'group relative p-3.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]',
        'hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)]',
        'transition-all duration-200 touch-none cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30 scale-[0.98]',
      )}
      {...attributes}
      {...listeners}
    >
      <ApplicationCardBody application={application} />
    </div>
  )
}

function ApplicationColumn({ status, items, label }: { status: ApplicationStatus; items: Application[]; label: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const statusColors = STATUS_COLORS[status]

  return (
    <div key={status} className="w-[300px] shrink-0 snap-start flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', statusColors.dot)} />
          <h3 className="text-[13px] font-semibold text-[#e8eaed] tracking-tight">{label}</h3>
        </div>
        <span className={cn(
          'min-w-[22px] h-[22px] flex items-center justify-center px-1.5 rounded-md text-[11px] font-medium',
          items.length > 0 ? 'bg-[rgba(255,255,255,0.06)] text-[#8b8fa3]' : 'text-[#4a4e5a]'
        )}>
          {items.length}
        </span>
      </div>
      
      {/* Column content */}
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 space-y-2.5 min-h-[120px] rounded-xl p-2.5',
            'bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.04)]',
            'transition-all duration-200',
            isOver && 'border-violet-500/40 bg-violet-500/5 shadow-[0_0_20px_-4px_rgba(139,92,246,0.15)]',
          )}
        >
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-[12px] text-[#4a4e5a] italic">
              Drop here
            </div>
          ) : (
            items.map((application) => (
              <SortableApplicationCard key={application.id} application={application} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function ApplicationsPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [dragError, setDragError] = useState<string | null>(null)
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const boardQuery = useQuery({
    queryKey: BOARD_QUERY_KEY,
    queryFn: () => applicationService.board(),
  })
  const board = boardQuery.data ?? null

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationService.updateStatus(id, { status }),
    onMutate: async ({ id, status }) => {
      setDragError(null)
      await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY })
      const previousBoard = queryClient.getQueryData<BoardData>(BOARD_QUERY_KEY)
      if (!previousBoard) {
        return { previousBoard }
      }
      queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (current) => {
        if (!current) return current
        const fromStatus = findContainerByApplicationId(current, id)
        if (!fromStatus || fromStatus === status) {
          return current
        }
        return moveToDifferentStatus(current, id, fromStatus, status, status)
      })
      return { previousBoard }
    },
    onError: (error, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_QUERY_KEY, context.previousBoard)
      }
      const errorMessage =
        error instanceof ApiError
          ? error.status === 403
            ? t('messages.errorMessage')
            : error.message
          : t('messages.errorMessage')
      setDragError(errorMessage)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY })
    },
  })

  const itemsFlat = useMemo(() => {
    if (!board) return []
    return STATUS_ORDER.flatMap((s) => board[s] ?? [])
  }, [board])

  const filteredFlat = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return itemsFlat
    return itemsFlat.filter((a) => {
      const v = a.vacancy
      const hay = `${v?.title ?? ''} ${v?.company?.name ?? ''} ${a.status}`.toLowerCase()
      return hay.includes(q)
    })
  }, [itemsFlat, query])

  const filteredBoard = useMemo(() => {
    if (!board) return null
    const ids = new Set(filteredFlat.map((a) => a.id))
    return STATUS_ORDER.reduce((acc, s) => {
      acc[s] = (board[s] ?? []).filter((a) => ids.has(a.id))
      return acc
    }, {} as Record<ApplicationStatus, Application[]>)
  }, [board, filteredFlat])

  const activeApplication = useMemo(() => {
    if (!activeApplicationId || !board) return null
    for (const status of STATUS_ORDER) {
      const match = (board[status] ?? []).find((item) => item.id === activeApplicationId)
      if (match) return match
    }
    return null
  }, [activeApplicationId, board])

  const handleDragStart = (event: DragStartEvent) => {
    setDragError(null)
    setActiveApplicationId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
    setActiveApplicationId(null)
    if (!board || !overId || activeId === overId) {
      return
    }

    const sourceStatus = findContainerByApplicationId(board, activeId)
    const targetStatus = resolveOverStatus(board, overId)
    if (!sourceStatus || !targetStatus) {
      return
    }

    if (sourceStatus === targetStatus) {
      queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (current) => {
        if (!current) return current
        const currentItems = current[sourceStatus] ?? []
        const oldIndex = currentItems.findIndex((item) => item.id === activeId)
        const newIndex = currentItems.findIndex((item) => item.id === overId)
        if (oldIndex < 0 || oldIndex === newIndex) {
          return current
        }
        const targetIndex = newIndex < 0 ? currentItems.length - 1 : newIndex
        return {
          ...current,
          [sourceStatus]: arrayMove(currentItems, oldIndex, targetIndex),
        }
      })
      return
    }

    statusMutation.mutate({ id: activeId, status: targetStatus })
  }

  const handleDragCancel = () => {
    setActiveApplicationId(null)
  }

  // Stats for the header
  const stats = useMemo(() => {
    if (!board) return { total: 0, active: 0, offers: 0 }
    const total = itemsFlat.length
    const offers = (board['OFFER'] ?? []).length
    const rejected = (board['REJECTED'] ?? []).length
    const active = total - rejected
    return { total, active, offers }
  }, [board, itemsFlat])

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div className="space-y-6">
        {/* Title and description */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                  {t('applications.title')}
                </h1>
                <p className="text-[13px] text-[#6b7590]">{t('applications.description')}</p>
              </div>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center px-4">
              <div className="text-lg font-semibold text-[#e8eaed]">{stats.total}</div>
              <div className="text-[11px] text-[#6b7590] uppercase tracking-wide">Total</div>
            </div>
            <div className="w-px h-8 bg-[rgba(255,255,255,0.06)]" />
            <div className="text-center px-4">
              <div className="text-lg font-semibold text-violet-400">{stats.active}</div>
              <div className="text-[11px] text-[#6b7590] uppercase tracking-wide">Active</div>
            </div>
            <div className="w-px h-8 bg-[rgba(255,255,255,0.06)]" />
            <div className="text-center px-4">
              <div className="text-lg font-semibold text-emerald-400">{stats.offers}</div>
              <div className="text-[11px] text-[#6b7590] uppercase tracking-wide">Offers</div>
            </div>
          </div>
        </div>
        
        {/* Search and filters bar */}
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7590] pointer-events-none">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('applications.searchPlaceholder')}
              className="w-full h-10 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[13px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
            />
          </div>
          
          {/* Results count */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-[13px] text-[#6b7590]">{filteredFlat.length}</span>
            <span className="text-[13px] text-[#4a4e5a]">{t('applications.results')}</span>
          </div>
          
          {/* View options placeholder */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <button className="w-8 h-8 rounded-md bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#e8eaed]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-[#6b7590] hover:text-[#8b8fa3] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {dragError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {dragError}
        </div>
      )}

      {/* Board content */}
      {boardQuery.isLoading ? (
        <LoadingState message={t('applications.loading')} />
      ) : boardQuery.error ? (
        <ErrorState
          title={t('applications.error')}
          message={boardQuery.error instanceof Error ? boardQuery.error.message : t('messages.errorMessage')}
        />
      ) : filteredFlat.length === 0 ? (
        <EmptyState title={t('applications.noApplications')} description={t('applications.description')} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {/* Kanban board */}
          <div className="relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0b] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0b] to-transparent z-10 pointer-events-none" />
            
            {/* Scrollable columns */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[rgba(255,255,255,0.1)] hover:scrollbar-thumb-[rgba(255,255,255,0.15)]">
              {STATUS_ORDER.map((s) => {
                const col = filteredBoard?.[s] ?? []
                return (
                  <ApplicationColumn key={s} status={s} items={col} label={t(STATUS_LABELS[s])} />
                )
              })}
            </div>
          </div>
          
          {/* Drag overlay */}
          <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            {activeApplication ? (
              <div className="w-[300px] p-3.5 rounded-xl bg-[#18181b] border border-violet-500/40 shadow-2xl shadow-violet-500/20">
                <ApplicationCardBody application={activeApplication} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </section>
  )
}
