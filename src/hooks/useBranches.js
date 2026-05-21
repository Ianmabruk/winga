import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchBranches } from '../api/branches'
import { useForexStore } from '../store/useForexStore'

export const useBranches = () => {
  const { branches, selectedBranch, setBranches, setSelectedBranch } =
    useForexStore()

  const query = useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    staleTime: 5 * 60_000,  // 5 min — branches rarely change
    gcTime: 10 * 60_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  })

  useEffect(() => {
    if (!query.data?.length) return
    setBranches(query.data)
    // Auto-select first branch only if none is currently selected
    if (!selectedBranch) {
      setSelectedBranch(query.data[0])
    }
  }, [query.data, selectedBranch, setBranches, setSelectedBranch])

  return { ...query, branches, selectedBranch }
}
