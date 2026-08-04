import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Winga Forex Bureau'
const DEFAULT_URL = typeof window !== 'undefined' ? window.location.origin : 'https://wingaforex.co.tz'
const DEFAULT_IMAGE = '/android-chrome-512x512.png'

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  description: 'Tanzania\'s most trusted forex exchange bureau offering competitive rates.',
  url: DEFAULT_URL,
  logo: `${DEFAULT_URL}/android-chrome-512x512.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+255740800820',
    contactType: 'Customer Service',
    areaServed: 'TZ',
    availableLanguage: ['English', 'Swahili'],
  },
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: 'Sokoine Road',
      addressLocality: 'Arusha',
      addressCountry: 'Tanzania',
    },
  ],
}

function Seo({
  title = 'Winga Forex Bureau – Best Rates Best Services',
  description = 'Winga Forex Bureau offers competitive forex exchange rates in Tanzania. Buy and sell USD, EUR, GBP, KES, UGX, RWF and more with fast, secure service.',
  path = '/',
  image = DEFAULT_IMAGE,
  noIndex = false,
}) {
  const url = `${DEFAULT_URL}${path}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
    </Helmet>
  )
}

export default Seo
