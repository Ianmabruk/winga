function asBool(value) {
  return String(value).toLowerCase() === 'true'
}

function report(event, payload) {
  if (!window.__WING_DEBUG__) {
    window.__WING_DEBUG__ = {
      startedAt: new Date().toISOString(),
      events: [],
    }
  }

  window.__WING_DEBUG__.events.push({
    event,
    payload,
    at: new Date().toISOString(),
  })
}

export function initRuntimeDebug() {
  const debugEnabled = import.meta.env.DEV || asBool(import.meta.env.VITE_DEBUG)

  const build = {
    id: typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'unknown',
    time: typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : 'unknown',
    mode: import.meta.env.MODE,
  }

  window.__WING_BUILD__ = build
  report('boot', build)

  if (debugEnabled) {
    console.info('[WING][build]', build)
  }

  window.addEventListener('error', (event) => {
    const payload = {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    }
    report('window-error', payload)
    console.error('[WING][window-error]', payload)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason)
    report('unhandled-rejection', { reason })
    console.error('[WING][unhandled-rejection]', reason)
  })
}

export function reportRouteChange(pathname) {
  report('route-change', { pathname })
}
