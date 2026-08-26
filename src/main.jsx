import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import ErrorBoundary from './components/ErrorBoundary'
import RouteDebugProbe from './components/RouteDebugProbe'
import './index.css'
import App from './App.jsx'
import { initRuntimeDebug } from './utils/runtimeDebug'
import { useForexStore } from './store/useForexStore'

initRuntimeDebug()

// Hydrate the centralized rate store from the server-injected bootstrap
// snapshot (window.__INITIAL_RATES__).  This ensures the LiveTicker and
// HeroSection rate cards render immediately on first paint, before any
// network request completes.
if (typeof window !== 'undefined' && window.__INITIAL_RATES__?.rates?.length > 0) {
  const initial = window.__INITIAL_RATES__
  useForexStore.getState().setRatesData(
    initial.rates,
    initial.stale || false,
    initial.stale ? 'Showing cached snapshot from server' : null,
    initial.providerTimestamp || null,
    false,
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      gcTime: 30_000,
      retry: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <HelmetProvider>
            <RouteDebugProbe />
            <App />
          </HelmetProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
