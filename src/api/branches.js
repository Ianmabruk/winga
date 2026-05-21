/**
 * Branches API
 * GET https://forex.wingaforex.co.tz/api/method/forex_bureau.vsd_forex_bureau.doctype.branch.api.get_branches
 */
import wingaClient from './client'

const ENDPOINT =
  '/api/method/forex_bureau.vsd_forex_bureau.doctype.branch.api.get_branches'

/**
 * Fetch all visible branches.
 * Branches with suspend_display_on_app === 1 are filtered out automatically.
 * @returns {Promise<Branch[]>}
 */
export const fetchBranches = async () => {
  const { data } = await wingaClient.get(ENDPOINT)
  const branches = Array.isArray(data?.message) ? data.message : []
  // Hide suspended branches per API spec
  return branches.filter((b) => !b.suspend_display_on_app)
}
