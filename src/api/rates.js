/**
 * Exchange Rates API
 * GET https://forex.wingaforex.co.tz/api/method/forex_bureau.vsd_forex_bureau.doctype.branch.api.get_exchange_rates?branch_name=<branchname>
 */
import wingaClient from './client'

const ENDPOINT =
  '/api/method/forex_bureau.vsd_forex_bureau.doctype.branch.api.get_exchange_rates'

/**
 * Fetch exchange rates for a given branch.
 * Rates are sorted ascending by currency_sequence per API spec.
 * Returns empty array if API returns { message: [] }.
 *
 * @param {string} branchName - e.g. "HEAD OFFICE"
 * @returns {Promise<Rate[]>}
 */
export const fetchRates = async (branchName) => {
  if (!branchName) throw new Error('branchName is required')

  const { data } = await wingaClient.get(ENDPOINT, {
    params: { branch_name: branchName },
  })

  const rates = Array.isArray(data?.message) ? data.message : []

  // Sort by currency_sequence ascending (per API spec §7.1)
  return [...rates].sort(
    (a, b) => (a.currency_sequence ?? 999) - (b.currency_sequence ?? 999),
  )
}
