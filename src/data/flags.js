/** ISO 3166-1 alpha-2 country code mapped per currency code */
export const currencyFlags = {
  USD: 'https://flagcdn.com/us.svg',
  EUR: 'https://flagcdn.com/eu.svg',
  GBP: 'https://flagcdn.com/gb.svg',
  AED: 'https://flagcdn.com/ae.svg',
  CHF: 'https://flagcdn.com/ch.svg',
  CNY: 'https://flagcdn.com/cn.svg',
  JPY: 'https://flagcdn.com/jp.svg',
  CAD: 'https://flagcdn.com/ca.svg',
  AUD: 'https://flagcdn.com/au.svg',
  ZAR: 'https://flagcdn.com/za.svg',
  SAR: 'https://flagcdn.com/sa.svg',
  KES: 'https://flagcdn.com/ke.svg',
  TZS: 'https://flagcdn.com/tz.svg',
  UGX: 'https://flagcdn.com/ug.svg',
  RWF: 'https://flagcdn.com/rw.svg',
  INR: 'https://flagcdn.com/in.svg',
  KWD: 'https://flagcdn.com/kw.svg',
  BHD: 'https://flagcdn.com/bh.svg',
  QAR: 'https://flagcdn.com/qa.svg',
  OMR: 'https://flagcdn.com/om.svg',
  MYR: 'https://flagcdn.com/my.svg',
  SGD: 'https://flagcdn.com/sg.svg',
  NOK: 'https://flagcdn.com/no.svg',
  SEK: 'https://flagcdn.com/se.svg',
  DKK: 'https://flagcdn.com/dk.svg',
  HKD: 'https://flagcdn.com/hk.svg',
  NZD: 'https://flagcdn.com/nz.svg',
}

/** Fallback flag for unknown currencies */
export const getFlagUrl = (code) =>
  currencyFlags[code] || 'https://flagcdn.com/un.svg'
