import { useBranches } from '../hooks/useBranches'

export default function DeferredBranches() {
  useBranches()
  return null
}
