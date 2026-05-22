import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchRates } from '../api/rates'
import { useForexStore } from '../store/useForexStore'

const REFRESH_INTERVAL = Number(import.meta.env.VITE_APP_REFRESH_INTERVAL) || 15_000

const getEffectiveRefreshInterval = () => {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!conn) return REFRESH_INTERVAL
  if (conn.saveData) return Math.max(REFRESH_INTERVAL, 30_000)
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
    return Math.max(REFRESH_INTERVAL, 30_000)
  }
  return REFRESH_INTERVAL
}

/**
 * Real-time exchange rates from Winga API.
 * - Auto-refreshes every 15 seconds
 * - Pauses when browser tab is inactive (refetchIntervalInBackground: false)
 * - Resumes automatically when tab becomes active
 * - Preserves previous rates during refresh via placeholderData
 * - Detects and highlights changed values via the store
 */
export const useRates = () => {
  const { selectedBranch, setRatesData } = useForexStore()
  const branchName = selectedBranch?.branch_name

  const query = useQuery({
    queryKey: ['rates', branchName],
    queryFn: () => fetchRates(branchName),
    enabled: !!branchName,
    refetchInterval: getEffectiveRefreshInterval(),
    refetchIntervalInBackground: false, // ⏸ pause when tab inactive, ▶ resume on focus
    staleTime: 5_000,
    gcTime: 60_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
    // Keep showing previous data while new fetch is in flight
    placeholderData: (prev) => prev,
    // Deduplicate rapid refetch triggers
    notifyOnChangeProps: ['data', 'error', 'isLoading'],
  })

  useEffect(() => {
    if (query.data?.length) {
      setRatesData(query.data)
    }
  }, [query.data, setRatesData])

  return query
}
