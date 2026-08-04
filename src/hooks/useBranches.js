import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForexStore } from '../store/useForexStore'
import { loadBranches } from '../services/wingaForexService'

const DEFAULT_BRANCH = { branch_name: 'HEAD OFFICE' }

export const useBranches = () => {
  const { branches, selectedBranch, setBranches, setSelectedBranch } = useForexStore()

  const query = useQuery({
    queryKey: ['winga-branches'],
    queryFn: async () => {
      const result = await loadBranches()
      return result
    },
    staleTime: 30_000,
    gcTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useEffect(() => {
    if (Array.isArray(query.data) && query.data.length > 0) {
      setBranches(query.data)
      if (!selectedBranch) {
        const headOffice = query.data.find((b) => b.branch_name === 'HEAD OFFICE') || query.data[0]
        setSelectedBranch(headOffice)
      }
    } else if (query.error) {
      setBranches([DEFAULT_BRANCH])
      setSelectedBranch(DEFAULT_BRANCH)
    }
  }, [query.data, query.error, selectedBranch, setBranches, setSelectedBranch])

  return { ...query, branches, selectedBranch }
}
