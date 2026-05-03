import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ErrorState } from './ErrorState'
import i18n from '@/i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      const t = (key: string) => i18n.t(key)

      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
          <ErrorState
            title={t('errors.boundaryTitle')}
            message={t('errors.boundaryMessage')}
            onRetry={this.handleReload}
          />
        </div>
      )
    }

    return this.props.children
  }
}
