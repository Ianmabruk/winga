import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useForexStore } from '../store/useForexStore'
import { loadRates } from '../services/wingaForexService'

const REFRESH_INTERVAL = Number(import.meta.env.VITE_APP_REFRESH_INTERVAL) || 15_000

const inFlightPromises = new Map()

const getInitialRates = () => {
  if (typeof window === 'undefined') return undefined
  const initial = window.__INITIAL_RATES__
  if (!initial || !Array.isArray(initial.rates) || initial.rates.length === 0) return undefined
  return {
    rates: initial.rates,
    stale: initial.stale || false,
    staleTimestamp: false,
    staleReason: initial.stale ? 'Showing cached snapshot from server' : null,
    providerTimestamp: initial.providerTimestamp || null,
    source: initial.source || 'bootstrap',
    lastUpdated: initial.updated_at || null,
  }
}

export const useRates = () => {
  const { selectedBranch, setRatesData } = useForexStore()
  const branchName = selectedBranch?.branch_name || 'HEAD OFFICE'

  const query = useQuery({
    queryKey: ['live-rates', branchName],
    queryFn: async () => {
      const key = `rates:${branchName}`

      if (inFlightPromises.has(key)) {
        return inFlightPromises.get(key)
      }

      const promise = loadRates(branchName)
        .then((result) => {
          inFlightPromises.delete(key)
          const rates = result?.rates || []
          return {
            rates,
            stale: result?.stale || false,
            staleTimestamp: result?.staleTimestamp || false,
            staleReason: result?.staleReason || null,
            providerTimestamp: result?.providerTimestamp || null,
            source: result?.source || 'cache',
            lastUpdated: result?.lastUpdated || null,
          }
        })
        .catch((err) => {
          inFlightPromises.delete(key)
          throw err
        })

      inFlightPromises.set(key, promise)
      return promise
    },
    staleTime: REFRESH_INTERVAL,
    gcTime: 30_000,
    retry: 0,
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    throwOnError: false,
    initialData: getInitialRates(),
  })

  const prevDataRef = useRef(query.data)

  useEffect(() => {
    if (query.isSuccess && query.data?.rates && Array.isArray(query.data.rates)) {
      const prev = prevDataRef.current
      if (prev?.rates !== query.data.rates) {
        setRatesData(
          query.data.rates,
          query.data.stale || false,
          query.data.staleReason || null,
          query.data.providerTimestamp || null,
          query.data.staleTimestamp || false,
        )
      }
      prevDataRef.current = query.data
    }
  }, [query.isSuccess, query.data, setRatesData])

  useEffect(() => {
    if (query.isError && query.error) {
      logDebug('fetch-error', { message: query.error?.message || String(query.error) })
    }
  }, [query.isError, query.error])

  return query
}

function logDebug(label, data) {
  const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.__WING_DEBUG__)
  if (!isDev) return
  console.log(`[useRates][${label}]`, data)
}
