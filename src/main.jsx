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

initRuntimeDebug()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Live forex data must never be served from cache across browsers.
      // Chrome's HTTP cache is more aggressive than Firefox/Safari, so we
      // enforce zero stale time at the React Query layer as well.
      staleTime: 0,
      gcTime: 30_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnMount: true,
      refetchOnWindowFocus: true,
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
