import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/context/useAuth'
import { mockNotifications, mockUser } from '@/mock/data'
import { cn, formatRelative } from '@/lib/utils'

const settingsSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  location: z.string().optional(),
  weeklyDigest: z.boolean(),
  interviewReminders: z.boolean(),
  aiProviderMode: z.enum(['LOCAL', 'CLOUD', 'BRING_YOUR_OWN_KEY']),
  language: z.enum(['ru', 'en']),
})

type SettingsValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const u = user ?? mockUser
  const [saved, setSaved] = useState(false)

  const defaults: SettingsValues = useMemo(
    () => ({
      name: u.name,
      email: u.email,
      location: 'Remote',
      weeklyDigest: true,
      interviewReminders: true,
      aiProviderMode: 'CLOUD',
      language: (i18n.language as 'ru' | 'en') || 'ru',
    }),
    [u.email, u.name, i18n.language],
  )

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaults,
  })

  const handleLanguageChange = (newLanguage: 'ru' | 'en') => {
    i18n.changeLanguage(newLanguage)
    form.setValue('language', newLanguage)
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5">
            <div className="text-sm font-semibold text-ink">{t('settings.profile')}</div>
            <p className="text-sm text-ink-muted mt-1">{t('settings.profileDescription')}</p>

            {saved && (
              <div className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-ink">
                {t('settings.saved')}
              </div>
            )}

            <form
              className="mt-5 space-y-4"
              onSubmit={form.handleSubmit(async () => {
                setSaved(false)
                await new Promise((r) => setTimeout(r, 250))
                setSaved(true)
              })}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-ink-dim">{t('settings.name')}</label>
                  <input className="input mt-1" {...form.register('name')} />
                  {form.formState.errors.name?.message && (
                    <p className="text-xs text-danger mt-1">{String(form.formState.errors.name.message)}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-ink-dim">{t('settings.email')}</label>
                  <input className="input mt-1" {...form.register('email')} />
                  {form.formState.errors.email?.message && (
                    <p className="text-xs text-danger mt-1">{String(form.formState.errors.email.message)}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-dim">{t('settings.location')}</label>
                <input className="input mt-1" {...form.register('location')} placeholder={t('settings.locationPlaceholder')} />
              </div>

              <button
                type="submit"
                className={cn(
                  'inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim transition-colors',
                  form.formState.isSubmitting && 'opacity-70',
                )}
              >
                {t('settings.saveSettings')}
              </button>
            </form>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold text-ink">{t('settings.notifications')}</div>
            <p className="text-sm text-ink-muted mt-1">{t('settings.notificationsDescription')}</p>

            <div className="mt-5 space-y-3">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-1/30 px-3 py-2.5">
                <div>
                  <div className="text-sm text-ink">{t('settings.weeklyDigest')}</div>
                  <div className="text-xs text-ink-dim mt-1">{t('settings.weeklyDigest')}</div>
                </div>
                <input type="checkbox" {...form.register('weeklyDigest')} />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-1/30 px-3 py-2.5">
                <div>
                  <div className="text-sm text-ink">{t('settings.interviewReminders')}</div>
                  <div className="text-xs text-ink-dim mt-1">{t('settings.interviewReminders')}</div>
                </div>
                <input type="checkbox" {...form.register('interviewReminders')} />
              </label>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold text-ink">{t('settings.language')}</div>
            <p className="text-sm text-ink-muted mt-1">{t('settings.selectLanguage')}</p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleLanguageChange('ru')}
                className={cn(
                  'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors',
                  i18n.language === 'ru'
                    ? 'bg-accent/12 border-accent/30 text-ink font-semibold'
                    : 'border-border hover:bg-surface-2/60 text-ink-muted'
                )}
              >
                🇷🇺 Русский
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={cn(
                  'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors',
                  i18n.language === 'en'
                    ? 'bg-accent/12 border-accent/30 text-ink font-semibold'
                    : 'border-border hover:bg-surface-2/60 text-ink-muted'
                )}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <div className="text-sm font-semibold text-ink">{t('settings.aiProvider')}</div>
            <p className="text-sm text-ink-muted mt-1">Mode placeholders for backend integration.</p>
            <div className="mt-4">
              <label className="text-xs text-ink-dim">{t('settings.aiProviderMode')}</label>
              <select className="input mt-1" {...form.register('aiProviderMode')}>
                <option value="CLOUD">{t('settings.aiProviderCloud')}</option>
                <option value="LOCAL">{t('settings.aiProviderLocal')}</option>
                <option value="BRING_YOUR_OWN_KEY">{t('settings.aiProviderCustom')}</option>
              </select>
              <div className="mt-3 text-xs text-ink-dim">
                Backend TODO: store this in user preferences and apply to AI endpoints.
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">Recent notifications</div>
                <p className="text-sm text-ink-muted mt-1">Mock feed.</p>
              </div>
              <span className="pill">{mockNotifications.filter((n) => !n.read).length} new</span>
            </div>
            <div className="mt-4 space-y-2">
              {mockNotifications.slice(0, 5).map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-surface-1/30 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm text-ink truncate">{n.title}</div>
                      <div className="text-xs text-ink-dim mt-1 truncate">{n.body}</div>
                    </div>
                    <div className="text-xs text-ink-dim shrink-0">{formatRelative(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
