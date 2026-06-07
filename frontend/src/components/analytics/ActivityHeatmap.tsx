import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ActivityHeatmapItem } from '@/types'

interface Props {
  data: ActivityHeatmapItem[]
}

export const ActivityHeatmap: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation()

  const weeks = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    const result: Array<Array<ActivityHeatmapItem | null>> = []
    let currentWeek: Array<ActivityHeatmapItem | null> = []
    
    const firstDate = new Date(sortedData[0].date)
    const firstDayOfWeek = firstDate.getDay() // 0 = Sunday, 1 = Monday
    
    const emptyDaysAtStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    
    for (let i = 0; i < emptyDaysAtStart; i++) {
      currentWeek.push(null)
    }
    
    sortedData.forEach((item) => {
      currentWeek.push(item)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    })
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      result.push(currentWeek)
    }
    
    return result
  }, [data])

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-zinc-800/50'
    if (count <= 2) return 'bg-emerald-900/40 text-emerald-400'
    if (count <= 5) return 'bg-emerald-700/60 text-emerald-300'
    if (count <= 8) return 'bg-emerald-500/80 text-emerald-100'
    return 'bg-emerald-400 text-white'
  }

  return (
    <div className="border border-white/[0.06] bg-white/[0.02] p-6 rounded-2xl w-full">
      <h3 className="text-lg font-medium text-white mb-4">{t('analytics.activityHeatmap', 'Активность')}</h3>
      
      <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide pb-2">
        <div className="flex min-w-max gap-1">
          {/* Y-axis labels */}
          <div className="flex flex-col gap-1 pr-2 text-[10px] text-zinc-500">
            {['Пн', '', 'Ср', '', 'Пт', '', ''].map((label, i) => (
              <div key={i} className="w-4 h-3 flex items-center justify-end leading-none">
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  if (!day) {
                    return <div key={dayIndex} className="w-3 h-3 rounded-sm bg-transparent" />
                  }
                  
                  const countLabel = t('analytics.actionsCount', { count: day.count, defaultValue: '{{count}} действий' })
                  const title = `${countLabel} (${day.date})`
                  
                  return (
                    <div
                      key={dayIndex}
                      title={title}
                      className={`w-3 h-3 rounded-sm transition-colors duration-200 hover:ring-1 hover:ring-white/30 cursor-pointer ${getColorClass(day.count)}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-zinc-400">
        <span>{t('analytics.activityLess', 'Меньше')}</span>
        <div className="flex gap-1">
          <div className={`w-3 h-3 rounded-sm ${getColorClass(0)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColorClass(1)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColorClass(3)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColorClass(6)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColorClass(9)}`} />
        </div>
        <span>{t('analytics.activityMore', 'Больше')}</span>
      </div>
    </div>
  )
}
