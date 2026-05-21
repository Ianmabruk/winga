import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildFallbackRatesData } from '../data/currencies'

/** Transform rate array → { USD: rateObj, EUR: rateObj, ... } */
const toRatesMap = (arr) =>
  arr.reduce((acc, r) => {
    acc[r.currency_code] = r
    return acc
  }, {})

/** Legacy compat: { USD: { buy, sell }, ... } */
const toLegacyRates = (arr) =>
  arr.reduce((acc, r) => {
    acc[r.currency_code] = { buy: r.buying_rate, sell: r.selling_rate }
    return acc
  }, {})

export const useForexStore = create(
  persist(
    (set, get) => ({
      // ─── Branches ───────────────────────────────────────────────────────
      branches: [],
      selectedBranch: null,

      setBranches: (branches) => set({ branches }),
      setSelectedBranch: (branch) => set({ selectedBranch: branch }),

      // ─── Rates (raw API format) ──────────────────────────────────────────
      ratesData: buildFallbackRatesData(),
      ratesMap: toRatesMap(buildFallbackRatesData()),
      previousRatesMap: {},
      changedCurrencies: [],
      lastUpdated: null,

      // Legacy compat for existing components
      rates: toLegacyRates(buildFallbackRatesData()),

      setRatesData: (ratesData) => {
        if (!ratesData?.length) return
        const prevMap = get().ratesMap
        const newMap = toRatesMap(ratesData)

        // Detect changed currencies for flash animations
        const changed = ratesData
          .filter((r) => {
            const prev = prevMap[r.currency_code]
            if (!prev) return false
            return (
              prev.buying_rate !== r.buying_rate ||
              prev.selling_rate !== r.selling_rate
            )
          })
          .map((r) => r.currency_code)

        set({
          ratesData,
          ratesMap: newMap,
          previousRatesMap: prevMap,
          changedCurrencies: changed,
          lastUpdated: new Date().toISOString(),
          rates: toLegacyRates(ratesData), // legacy compat
        })

        // Auto-clear change indicators after animation completes
        if (changed.length > 0) {
          setTimeout(() => set({ changedCurrencies: [] }), 2500)
        }
      },

      // Legacy compat setter (used by old components)
      setRates: (rates) => set({ rates }),

      // ─── UI state ────────────────────────────────────────────────────────
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
        // Only persist UI preferences, not API data
        selectedBranch: state.selectedBranch,
        favorites: state.favorites,
      }),
    },
  ),
)
