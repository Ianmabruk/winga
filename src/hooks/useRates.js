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
      logDebug('useRates-fetch', { branch: branchName, browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'ssr' })
      const rates = await loadRates(branchName)
      logDebug('useRates-receive', { branch: branchName, count: rates?.length || 0 })
      return rates
    },
    // Live data: never serve stale cache. Always fetch fresh.
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
    if (query.data && Array.isArray(query.data)) {
      setRatesData(query.data)
    }
  }, [query.data, setRatesData])

  return query
}

function logDebug(label, data) {
  const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.__WING_DEBUG__)
  if (!isDev) return
  console.log(`[useRates][${label}]`, data)
}
