import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const toRatesMap = (arr) =>
  arr.reduce((acc, r) => {
    acc[r.currency_code] = r
    return acc
  }, {})

const toLegacyRates = (arr) =>
  arr.reduce((acc, r) => {
    acc[r.currency_code] = { buy: r.buying_rate, sell: r.selling_rate }
    return acc
  }, {})

export const useForexStore = create(
  persist(
    (set, get) => ({
      branches: [],
      selectedBranch: null,

      setBranches: (branches) => set({ branches }),
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),

      ratesData: [],
      ratesMap: {},
      previousRatesMap: {},
      changedCurrencies: [],
      lastUpdated: null,
      staleData: false,
      staleReason: null,
      providerTimestamp: null,

      rates: {},

    setRatesData: (ratesData, stale = false, staleReason = null, providerTimestamp = null) => {
          const safeRatesData = Array.isArray(ratesData) ? ratesData : []
          if (!safeRatesData.length) {
            const existing = get().ratesData
            if (existing && existing.length > 0) {
              set({ lastUpdated: get().lastUpdated })
            }
            return
          }
          const prevMap = get().ratesMap
          const newMap = toRatesMap(safeRatesData)

           const changed = safeRatesData
            .filter((r) => {
              const prev = prevMap[r.currency_code]
              if (!prev) return false
              return (
                prev.buying_rate !== r.buying_rate ||
                prev.selling_rate !== r.selling_rate
              )
            })
            .map((r) => r.currency_code)

          const staleFlag = stale === true || safeRatesData.some((r) => r.stale === true)

          set({
            ratesData: safeRatesData,
            ratesMap: newMap,
            previousRatesMap: prevMap,
            changedCurrencies: changed,
            lastUpdated: new Date().toISOString(),
            staleData: staleFlag,
            staleReason: staleFlag ? (staleReason || 'Provider data is outdated. Showing latest verified database rates.') : null,
            providerTimestamp: providerTimestamp || null,
            rates: toLegacyRates(safeRatesData),
          })

          if (changed.length > 0) {
            setTimeout(() => set({ changedCurrencies: [] }), 2500)
          }
        },

      setRates: (rates) => set({ rates }),

      favorites: ['USD', 'EUR', 'GBP'],
      searchQuery: '',
      alerts: [],

      toggleFavorite: (code) =>
        set((state) => ({
          favorites: state.favorites.includes(code)
            ? state.favorites.filter((c) => c !== code)
            : [...state.favorites, code],
        })),

      setSearchQuery: (q) => set({ searchQuery: q }),

      addAlert: (alert) =>
        set((state) => ({ alerts: [...state.alerts, alert] })),
    }),
    {
      name: 'winga-forex-store',
      partialize: (state) => ({
        selectedBranch: state.selectedBranch,
        favorites: state.favorites,
      }),
    },
  ),
)