import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterBar } from '@/components/FilterBar'
import { SearchBar } from '@/components/SearchBar'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { applicationService } from '@/services/application.service'
import type { Application, ApplicationStatus } from '@/types'
import { cn } from '@/lib/utils'
import { ApiError } from '@/services/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, PointerSensor, closestCenter, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
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
        'card p-3 hover:border-border-strong transition-colors touch-none',
        isDragging && 'opacity-70 shadow-lg border-border-strong',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-ink truncate">{application.vacancy?.title ?? 'Vacancy'}</div>
          <div className="text-xs text-ink-dim mt-1 truncate">
            {application.vacancy?.company?.name ?? 'Company'} · {application.vacancy?.location ?? '—'}
          </div>
        </div>
        <StatusBadge status={application.status} kind="application" size="sm" />
      </div>
      {application.notes && <div className="text-xs text-ink-muted mt-2 line-clamp-3">{application.notes}</div>}
    </div>
  )
}

function ApplicationColumn({ status, items, label }: { status: ApplicationStatus; items: Application[]; label: string }) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      key={status}
      className={cn('lg:col-span-1 xl:col-span-1', status === 'TECH_INTERVIEW' || status === 'FINAL_ROUND' ? 'xl:col-span-2' : '')}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-ink uppercase tracking-wider">{label}</div>
        <span className="pill">{items.length}</span>
      </div>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-2 min-h-20 rounded-lg">
          {items.map((application) => (
            <SortableApplicationCard key={application.id} application={application} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default function ApplicationsPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [dragError, setDragError] = useState<string | null>(null)
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

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
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

  return (
    <section className="space-y-4">
      <FilterBar
        left={<SearchBar value={query} onValueChange={setQuery} placeholder={t('applications.searchPlaceholder')} />}
        right={<span className="pill">{filteredFlat.length} {t('applications.results')}</span>}
      />

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
        <>
          {dragError && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {dragError}
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-8">
              {STATUS_ORDER.map((s) => {
                const col = filteredBoard?.[s] ?? []
                return (
                  <ApplicationColumn key={s} status={s} items={col} label={t(STATUS_LABELS[s])} />
                )
              })}
            </div>
          </DndContext>
        </>
      )}
    </section>
  )
}
