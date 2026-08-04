// Using wingaForexService directly - no backend API required
import { loadRates } from '../services/wingaForexService'

export const fetchRates = async (branchName = 'HEAD OFFICE') => {
  const rates = await loadRates(branchName)
  return rates
}