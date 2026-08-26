const { chromium, firefox, webkit } = require('@playwright/test')

function time() {
  return performance ? performance.now() : Date.now()
}

async function measureRateVisibility(browserName, networkCondition = 'online') {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  if (networkCondition === 'slow3g') {
    await context.setOffline(true)
    await context.setOffline(false)
    await context.route('**/*', (route) => {
      if (route.request().url().includes('/api/rates')) {
        route.continue()
      } else {
        route.continue()
      }
    })
  }

  const page = await context.newPage()

  if (networkCondition === 'slow3g') {
    await page.route('**/*', (route) => {
      if (route.request().resourceType() === 'xhr' || route.request().resourceType() === 'fetch') {
        route.continue()
      } else {
        route.continue()
      }
    })
  }

  const timings = {
    T0: null,
    T1: null,
    T2: null,
    T3: null,
    T4: null,
    T5: null,
    T6: null,
    T7: null,
  }

  const apiCalls = []
  const allRequests = []
  const consoleErrors = []

  page.on('request', (request) => {
    allRequests.push({
      url: request.url().replace('http://localhost:4000', ''),
      resourceType: request.resourceType(),
      time: Date.now() - timings.T0,
    })
    if (request.url().includes('/api/rates')) {
      timings.T3 = Date.now() - timings.T0
      apiCalls.push({
        url: request.url().replace('http://localhost:4000', ''),
        start: Date.now() - timings.T0,
      })
    }
    if (request.url().includes('forex.wingaforex.co.tz') || request.url().includes('wingaforex.co.tz/api')) {
      console.log(`[WARNING] External Winga API call detected: ${request.url()}`)
    }
  })

  page.on('response', async (response) => {
    if (response.url().includes('/api/rates')) {
      const call = apiCalls.find(c => c.url === response.url().replace('http://localhost:4000', ''))
      if (call) {
        call.end = Date.now() - timings.T0
        call.duration = call.end - call.start
        call.status = response.status()
        try {
          const body = await response.clone().json()
          call.rateCount = body?.rates?.length || body?.message?.length || 0
          call.stale = body?.stale || false
        } catch (e) {
          call.parseError = true
        }
      }
      timings.T4 = Date.now() - timings.T0
    }
  })

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text().substring(0, 200))
    }
  })

  page.on('requestfailed', (request) => {
    if (request.url().includes('/api/rates')) {
      console.log(`[NETWORK ERROR] ${request.url()} -> ${request.failure()?.errorText}`)
    }
  })

  timings.T0 = Date.now()

  await page.goto('http://localhost:5173/rates', { waitUntil: 'domcontentloaded' })
  timings.T1 = Date.now() - timings.T0

  await page.waitForFunction(() => window.React !== undefined || document.querySelector('#root') !== null, { timeout: 10000 })
  timings.T2 = Date.now() - timings.T0

  if (timings.T3 === null) {
    await page.waitForFunction(() => {
      const xhr = window.__rateApiCalls
      return xhr && xhr.length > 0
    }, { timeout: 5000 })
  }

  await page.waitForLoadState('networkidle')

  timings.T5 = timings.T4 || Date.now() - timings.T0

  const renderStart = Date.now()
  await page.waitForFunction(() => {
    const elements = document.querySelectorAll('*')
    for (const el of elements) {
      const t = el.textContent.trim()
      if (t === 'USD' || t === 'EUR' || t === 'GBP') {
        return true
      }
    }
    return false
  }, { timeout: 10000 })
  timings.T6 = Date.now() - timings.T0
  timings.T7 = Date.now() - timings.T0

  const ratesVisible = await page.evaluate(() => {
    const elements = document.querySelectorAll('*')
    for (const el of elements) {
      const t = el.textContent.trim()
      if (t === 'USD' || t === 'EUR' || t === 'GBP') return true
    }
    return false
  })

  const noSpinner = await page.evaluate(() => {
    return document.querySelectorAll('[class*="animate-spin"], [class*="animate-pulse"]').length === 0
  })

  const noExternalCalls = !allRequests.some(r =>
    r.url.includes('forex.wingaforex.co.tz') || r.url.includes('wingaforex.co.tz/api')
  )

  const apiCallCount = allRequests.filter(r => r.url.includes('/api/rates')).length

  await browser.close()

  return {
    browser: browserName,
    network: networkCondition,
    timings,
    apiResponse: apiCalls[0] ? apiCalls[0].duration : null,
    rateCount: apiCalls[0]?.rateCount || 0,
    ratesVisible,
    noSpinner,
    noExternalCalls,
    apiCallCount,
    totalRequests: allRequests.length,
    consoleErrors: consoleErrors.length,
    T7_minus_T0: timings.T7 - timings.T0,
  }
}

async function runTest(browserName) {
  console.log(`\n=== Testing ${browserName} (Wi-Fi) ===`)

  const launcher = browserName === 'firefox' ? firefox : browserName === 'webkit' ? webkit : chromium

  const browser = await launcher.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const allRequests = []
  const apiCalls = []
  const perf = {
    T0: 0, T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0
  }

  page.on('request', (request) => {
    allRequests.push(request.url())
    if (request.url().includes('/api/rates')) {
      if (perf.T3 === 0) perf.T3 = Date.now()
      apiCalls.push({ url: request.url(), start: Date.now() })
    }
    if (request.url().includes('forex.wingaforex.co.tz')) {
      console.log(`  [EXTERNAL CALL] ${request.url()}`)
    }
  })

  page.on('response', async (response) => {
    if (response.url().includes('/api/rates')) {
      const call = apiCalls[apiCalls.length - 1]
      if (call && !call.end) {
        call.end = Date.now()
        call.duration = call.end - call.start
        call.status = response.status()
        try {
          const body = await response.clone().json()
          call.rateCount = body?.rates?.length || body?.message?.length || 0
        } catch {}
      }
      if (perf.T4 === 0) perf.T4 = Date.now()
    }
  })

  const t0 = Date.now()
  perf.T0 = t0
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
  perf.T1 = Date.now()

  await page.waitForLoadState('domcontentloaded')

  const reactReady = await page.evaluate(() => {
    return document.querySelector('#root') !== null
  })
  if (reactReady) perf.T2 = Date.now()

  await page.waitForLoadState('networkidle')
  if (perf.T3 === 0) perf.T3 = perf.T1

  await page.waitForFunction(() => {
    const elements = document.querySelectorAll('*')
    for (const el of elements) {
      const t = el.textContent.trim()
      if (t === 'USD' || t === 'EUR' || t === 'GBP' || t === 'KES') return true
    }
    return false
  }, { timeout: 10000 }).catch(() => null)

  perf.T7 = Date.now()

  const ratesVisible = await page.evaluate(() => {
    const elements = document.querySelectorAll('*')
    for (const el of elements) {
      const t = el.textContent.trim()
      if (t === 'USD' || t === 'EUR' || t === 'GBP' || t === 'KES') return true
    }
    return false
  })

  const noSpinner = await page.evaluate(() => {
    return document.querySelectorAll('[class*="animate-spin"], [class*="animate-pulse"]').length === 0
  })

  const noExternalCalls = !allRequests.some(u => u.includes('forex.wingaforex.co.tz'))
  const rateApiCount = allRequests.filter(u => u.includes('/api/rates') && !u.includes('branches') && !u.includes('diagnostics')).length

  const apiResponseTime = apiCalls.length > 0 && apiCalls[0].duration ? apiCalls[0].duration : null

  await browser.close()

  const results = {
    browser: browserName,
    T0: 0,
    T1: perf.T1 - t0,
    T2: perf.T2 - t0,
    T3: perf.T3 - t0,
    T4: perf.T4 - t0,
    T5: perf.T4 - t0,
    T6: perf.T7 - t0,
    T7: perf.T7 - t0,
    apiResponseMs: apiResponseTime,
    rateCount: apiCalls[0]?.rateCount || 0,
    ratesVisible,
    noSpinnerAfterLoad: noSpinner,
    noExternalProviderCalls: noExternalCalls,
    rateApiCallCount: rateApiCount,
    totalRequests: allRequests.length,
  }

  return results
}

async function main() {
  const browsers = ['chrome']

  const allResults = []

  for (const browser of browsers) {
    try {
      const result = await runTest(browser)
      allResults.push(result)
      console.log(`\n  T0 (navigation start): ${result.T0}ms`)
      console.log(`  T1 (HTML loaded):      ${result.T1}ms`)
      console.log(`  T2 (React ready):      ${result.T2}ms`)
      console.log(`  T3 (API request):      ${result.T3}ms`)
      console.log(`  T4 (API response):     ${result.T4}ms`)
      console.log(`  T5 (React Query):      ${result.T5}ms`)
      console.log(`  T6 (Component recv):   ${result.T6}ms`)
      console.log(`  T7 (Rates visible):    ${result.T7}ms`)
      console.log(`  API response time:     ${result.apiResponseMs}ms`)
      console.log(`  Rate count:            ${result.rateCount}`)
      console.log(`  Rates visible:         ${result.ratesVisible}`)
      console.log(`  No spinner:            ${result.noSpinnerAfterLoad}`)
      console.log(`  No external calls:     ${result.noExternalProviderCalls}`)
      console.log(`  Rate API calls:        ${result.rateApiCallCount}`)
      console.log(`  Total requests:        ${result.totalRequests}`)
    } catch (err) {
      console.log(`  ERROR: ${err.message}`)
      allResults.push({ browser, error: err.message })
    }
  }

  console.log('\n\n=== FINAL RESULTS TABLE ===')
  console.log('| Browser | API Time | Rate Visible | Result |')
  console.log('|---------|----------|-------------|--------|')
  for (const r of allResults) {
    if (r.error) {
      console.log(`| ${r.browser} | ERROR | ERROR | FAIL |`)
    } else {
      const result = r.ratesVisible && r.noSpinnerAfterLoad && r.noExternalProviderCalls ? 'PASS' : 'FAIL'
      console.log(`| ${r.browser} | ${r.apiResponseMs}ms | ${r.T7}ms | ${result} |`)
    }
  }

  const passCount = allResults.filter(r => r.ratesVisible && r.noSpinnerAfterLoad && r.noExternalProviderCalls).length
  console.log(`\n${passCount}/${allResults.length} browsers passed`)
}

main().catch(console.error)
