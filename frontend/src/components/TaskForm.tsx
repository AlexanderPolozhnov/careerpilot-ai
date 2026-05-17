import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { applicationService } from '@/services/application.service'
import type { Application } from '@/types'
import { useQuery } from '@tanstack/react-query'
import type { TaskRequest, TaskPriority } from '@/services/task.service'

interface TaskFormProps {
  onSubmit: (values: TaskRequest) => void
  onCancel: () => void
  initialValues?: Partial<TaskRequest>
  isSubmitting?: boolean
}

const priorityValues: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export function TaskForm({ onSubmit, onCancel, initialValues, isSubmitting }: TaskFormProps) {
  const { t } = useTranslation()
  const isEditing = !!initialValues?.title // Title is required, so if it exists, we are editing

  const { data: applications } = useQuery({
    queryKey: ['applications', 'list'],
    queryFn: () => applicationService.list({ page: 0, size: 100 }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const values: TaskRequest = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      dueAt: formData.get('dueAt') as string || undefined,
      done: !!formData.get('done'),
      priority: formData.get('priority') as TaskPriority,
      applicationId: formData.get('applicationId') as string || undefined,
    }

    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="text-xs text-ink-dim">
          {t('tasks.form.title')}
        </label>
        <input
          id="title"
          type="text"
          name="title"
          defaultValue={initialValues?.title}
          required
          maxLength={255}
          className="input mt-1"
          placeholder={t('tasks.form.titlePlaceholder')}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-xs text-ink-dim">
          {t('tasks.form.description')}
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialValues?.description}
          className="input mt-1 h-24 py-2 resize-y"
          placeholder={t('tasks.form.descriptionPlaceholder')}
        />
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueAt" className="text-xs text-ink-dim">
          {t('tasks.form.dueAt')}
        </label>
        <input
          id="dueAt"
          type="datetime-local"
          name="dueAt"
          defaultValue={initialValues?.dueAt}
          className="input mt-1"
        />
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="text-xs text-ink-dim">
          {t('tasks.form.priority')}
        </label>
        <select
          id="priority"
          name="priority"
          defaultValue={initialValues?.priority || 'MEDIUM'}
          required
          className="select mt-1"
        >
          {priorityValues.map(v => (
            <option key={v} value={v} className="select-option">
              {t(`tasks.priorities.${v}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Application */}
      <div>
        <label htmlFor="applicationId" className="text-xs text-ink-dim">
          {t('tasks.form.application')}
        </label>
        <select
          id="applicationId"
          name="applicationId"
          defaultValue={initialValues?.applicationId || ''}
          className="select mt-1"
        >
          <option value="" className="select-option">{t('tasks.form.noApplication')}</option>
          {applications?.content?.map((app: Application) => (
            <option key={app.id} value={app.id} className="select-option">
              {app.vacancy?.title || t('tasks.form.untitled')}
            </option>
          ))}
        </select>
      </div>

      {/* Done */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="done"
          id="done"
          defaultChecked={initialValues?.done}
          className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] text-violet-500 focus:ring-violet-500 focus:ring-offset-0"
        />
        <label htmlFor="done" className="text-xs text-ink-dim">
          {t('tasks.form.done')}
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-secondary"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
        >
          {isSubmitting ? t('common.loading') : (isEditing ? t('common.save') : t('common.create'))}
        </button>
      </div>
    </form>
  )
}
