import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { EmojiGhView } from './features/github-emojis'
import { readUiLanguage, translate } from './features/github-emojis/model/localization'

type ErrorBoundaryState = {
  error?: Error
}

function EmojiAppSkeleton() {
  const language = readUiLanguage()
  return (
    <div
      className="emoji-skeleton"
      role="status"
      aria-label={translate(language, 'loading')}
    >
      <main className="emoji-view" aria-busy="true">
        <div className="app-layout">
          <section className="search-panel" aria-hidden="true">
            <header className="app-header">
              <span className="skeleton-shimmer skeleton-title" />
              <span className="skeleton-shimmer skeleton-copy-status" />
              <span className="skeleton-shimmer skeleton-count desktop-total-count" />
            </header>
            <div className="search-controls">
              <span className="skeleton-shimmer skeleton-search" />
              <span className="skeleton-shimmer skeleton-settings" />
            </div>
            <span className="skeleton-shimmer skeleton-count mobile-total-count" />
          </section>

          <section className="emoji-results" aria-hidden="true">
            {['People', 'Animals', 'Emotes'].map((section) => (
              <div className="emoji-section" key={section}>
                <div className="skeleton-section-heading">
                  <span className="skeleton-shimmer skeleton-section-title" />
                  <span className="skeleton-shimmer skeleton-section-count" />
                </div>
                <div className="emoji-grid">
                  {Array.from({ length: 10 }, (_, index) => (
                    <span className="skeleton-shimmer skeleton-emoji" key={index} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {}

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GitHub emoji app failed to load:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      const language = readUiLanguage()
      return (
        <main className="emoji-view">
          <section className="empty-state" role="alert">
            <p>{translate(language, 'appLoadFailed')}</p>
            <p>{this.state.error.message}</p>
            <button type="button" onClick={() => window.location.reload()}>
              {translate(language, 'tryAgain')}
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

function GithubEmojiApp() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<EmojiAppSkeleton />}>
        <EmojiGhView />
      </Suspense>
    </AppErrorBoundary>
  )
}

export default GithubEmojiApp
