import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
    if (typeof window !== 'undefined') {
      window.__WING_DEBUG__ = window.__WING_DEBUG__ || { events: [] }
      window.__WING_DEBUG__.events.push({
        event: 'error-boundary',
        payload: {
          message: error?.message,
          componentStack: info?.componentStack,
        },
        at: new Date().toISOString(),
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-[50vh] place-items-center">
          <div className="glass-surface max-w-md rounded-3xl p-8 text-center shadow-glass">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 text-2xl">
              ⚠
            </div>
            <h2 className="font-display text-xl text-slate-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-5 rounded-xl bg-skybrand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-skybrand-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
