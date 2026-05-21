/** Winga Forex Bureau — Tanzania (TZS base) */
export const supportedCurrencies = [
  'USD', 'EUR', 'GBP', 'AED', 'CHF', 'CNY', 'JPY',
  'CAD', 'ZAR', 'SAR', 'INR', 'KES', 'UGX', 'RWF',
  'BHD', 'KWD', 'QAR', 'OMR', 'MYR', 'SGD', 'AUD',
]

/**
 * Fallback exchange-rate data in Winga API format (TZS per 1 unit of foreign currency).
 * Used when no API data has loaded yet.
 */
export const buildFallbackRatesData = () => [
  { branch_name: 'HEAD OFFICE', currency_code: 'USD', currency_name: 'USD', currency_actual_name: 'US DOLLARS',         currency_sequence: 1,  buying_rate: 2680,   selling_rate: 2720,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'EUR', currency_name: 'EUR', currency_actual_name: 'EURO',               currency_sequence: 2,  buying_rate: 2940,   selling_rate: 2990,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'GBP', currency_name: 'GBP', currency_actual_name: 'BRITISH POUNDS',    currency_sequence: 3,  buying_rate: 3380,   selling_rate: 3440,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'AED', currency_name: 'AED', currency_actual_name: 'UAE DIRHAMS',       currency_sequence: 4,  buying_rate: 729,    selling_rate: 741,   effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'CHF', currency_name: 'CHF', currency_actual_name: 'SWISS FRANCS',      currency_sequence: 5,  buying_rate: 3140,   selling_rate: 3200,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'CNY', currency_name: 'CNY', currency_actual_name: 'CHINESE YUAN',      currency_sequence: 6,  buying_rate: 368,    selling_rate: 378,   effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'JPY', currency_name: 'JPY', currency_actual_name: 'JAPANESE YEN',      currency_sequence: 7,  buying_rate: 17.8,   selling_rate: 18.5,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'CAD', currency_name: 'CAD', currency_actual_name: 'CANADIAN DOLLARS',  currency_sequence: 8,  buying_rate: 1960,   selling_rate: 2000,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'AUD', currency_name: 'AUD', currency_actual_name: 'AUSTRALIAN DOLLARS',currency_sequence: 9,  buying_rate: 1720,   selling_rate: 1760,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'SAR', currency_name: 'SAR', currency_actual_name: 'SAUDI RIYALS',      currency_sequence: 10, buying_rate: 714,    selling_rate: 728,   effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'ZAR', currency_name: 'ZAR', currency_actual_name: 'SOUTH AFRICAN RAND',currency_sequence: 11, buying_rate: 146,    selling_rate: 152,   effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'KES', currency_name: 'KES', currency_actual_name: 'KENYAN SHILLINGS',  currency_sequence: 12, buying_rate: 20.5,   selling_rate: 21.2,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'UGX', currency_name: 'UGX', currency_actual_name: 'UGANDAN SHILLINGS', currency_sequence: 13, buying_rate: 0.72,   selling_rate: 0.76,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'INR', currency_name: 'INR', currency_actual_name: 'INDIAN RUPEES',     currency_sequence: 14, buying_rate: 32,     selling_rate: 33.5,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'KWD', currency_name: 'KWD', currency_actual_name: 'KUWAITI DINAR',     currency_sequence: 15, buying_rate: 8750,   selling_rate: 8900,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'BHD', currency_name: 'BHD', currency_actual_name: 'BAHRAINI DINAR',    currency_sequence: 16, buying_rate: 7120,   selling_rate: 7260,  effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'QAR', currency_name: 'QAR', currency_actual_name: 'QATARI RIYAL',      currency_sequence: 17, buying_rate: 736,    selling_rate: 750,   effective_date_and_time: null },
  { branch_name: 'HEAD OFFICE', currency_code: 'SGD', currency_name: 'SGD', currency_actual_name: 'SINGAPORE DOLLARS', currency_sequence: 18, buying_rate: 2010,   selling_rate: 2050,  effective_date_and_time: null },
]

/** Legacy compat — keep for components that still use the old { USD: { buy, sell } } shape */
export const fallbackRates = buildFallbackRatesData().reduce((acc, r) => {
  acc[r.currency_code] = { buy: r.buying_rate, sell: r.selling_rate }
  return acc
}, {})
