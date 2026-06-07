import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isTelegramWebApp } from '@/lib/telegram'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const { t } = useTranslation()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isTelegramWebApp() || !deferredPrompt) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <button onClick={handleInstall} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-dim hover:text-ink hover:bg-surface-elevated rounded-lg transition-colors">
      <Download className="w-4 h-4" />
      <span>{t('common.installApp')}</span>
    </button>
  )
}
