const PRECISION = 1000000

const safeRound = (value, decimals = 6) => {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export const convertCurrency = ({
  amount,
  fromRate,
  toRate,
  feePercent = 0.4,
  commissionPercent = 0.15,
}) => {
  const raw = ((amount * fromRate) / toRate) * PRECISION
  const grossConverted = raw / PRECISION
  const spread = safeRound(amount * 0.005, 6)
  const fee = safeRound((grossConverted * feePercent) / 100, 6)
  const commission = safeRound((grossConverted * commissionPercent) / 100, 6)
  const net = safeRound(grossConverted - fee - commission - spread, 6)

  return {
    grossConverted: safeRound(grossConverted, 6),
    spread,
    fee,
    commission,
    net: Math.max(net, 0),
  }
}

export const movementFromRates = (buy, sell) => {
  if (!buy || !sell) return 0
  return safeRound(((sell - buy) / buy) * 100, 3)
}

export const formatMoney = (value, currency) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 6,
  }).format(value)
