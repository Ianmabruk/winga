import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForexStore } from '../store/useForexStore'
import { loadRates } from '../services/wingaForexService'

const REFRESH_INTERVAL = Number(import.meta.env.VITE_APP_REFRESH_INTERVAL) || 15_000

export const useRates = () => {
  const { selectedBranch, setRatesData } = useForexStore()
  const branchName = selectedBranch?.branch_name || 'HEAD OFFICE'

  const query = useQuery({
    queryKey: ['live-rates', branchName],
    queryFn: async () => {
      logDebug('useRates-fetch', {
        branch: branchName,
        url: `${import.meta.env.VITE_API_URL || ''}/api/rates/live?branch_name=${encodeURIComponent(branchName)}`,
      })
      const result = await loadRates(branchName)
      const rates = result?.rates || []
      logDebug('useRates-receive', {
        branch: branchName,
        count: rates?.length || 0,
        status: 'success',
        isProviderStale: result?.stale || false,
        staleTimestamp: result?.staleTimestamp || false,
        staleReason: result?.staleReason || null,
        lastUpdate: new Date().toISOString(),
      })
      return { rates, stale: result?.stale || false, staleTimestamp: result?.staleTimestamp || false, staleReason: result?.staleReason || null, providerTimestamp: result?.providerTimestamp || null }
    },
    staleTime: 0,
    gcTime: 30_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    throwOnError: false,
  })

  useEffect(() => {
    if (query.data?.rates && Array.isArray(query.data.rates)) {
      setRatesData(query.data.rates, query.data.stale || false, query.data.staleReason || null, query.data.providerTimestamp || null, query.data.staleTimestamp || false)
    }
  }, [query.data, setRatesData])

  // Chrome bfcache (back-forward cache) fix: when Chrome restores a page from
  // bfcache, React Query's refetchInterval timer is paused and the component
  // does NOT remount. Without this listener, Chrome shows stale data from the
  // last visit until the user manually refreshes. Firefox/Safari handle this
  // more aggressively via refetchOnWindowFocus.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handlePageshow = (event) => {
      if (event.persisted) {
        logDebug('bfcache-restore', { branch: branchName })
        query.refetch()
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        logDebug('tab-visible', { branch: branchName, isFetching: query.isFetching })
        if (!query.isFetching) {
          query.refetch()
        }
      }
    }

    window.addEventListener('pageshow', handlePageshow)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('pageshow', handlePageshow)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [query, branchName])

  return query
}

function logDebug(label, data) {
  const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.__WING_DEBUG__)
  if (!isDev) return
  console.log(`[useRates][${label}]`, data)
}
