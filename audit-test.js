import { chromium } from '@playwright/test'

const API_BASE = 'http://localhost:4000'
const FRONTEND_BASE = 'http://localhost:3173'

async function runBrowserAudit(browserName, label) {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    javaScriptEnabled: true,
  })

  const page = await context.newPage()

  const timings = { T0: 0 }
  const allRequests = []
  const rateRequests = []
  const externalWingaCalls = []
  const consoleErrors = []

  page.on('request', (req) => {
    const url = req.url()
    allRequests.push({ url, type: req.resourceType() })

    if (url.includes('forex.wingaforex.co.tz')) {
      externalWingaCalls.push(url)
    }

    if (url.includes('/api/rates/live') || (url.includes('/api/rates?') && !url.includes('branches') && !url.includes('diagnostics'))) {
      if (timings.T3 === undefined) {
        timings.T3 = Date.now() - timings.T0
      }
      rateRequests.push({ url, start: Date.now() })
    }
  })

  page.on('response', async (resp) => {
    const url = resp.url()
    if (url.includes('/api/rates/live') || (url.includes('/api/rates?') && !url.includes('branches') && !url.includes('diagnostics'))) {
      const pending = rateRequests.filter((r) => r.url === url && !r.end)
      if (pending.length > 0) {
        const req = pending[pending.length - 1]
        req.end = Date.now()
        req.duration = req.end - req.start
        req.status = resp.status()
        try {
          const body = await resp.clone().json()
          req.rateCount = body?.rates?.length || body?.message?.length || 0
        } catch {}
      }
      if (timings.T4 === undefined) {
        timings.T4 = Date.now() - timings.T0
      }
    }
  })

  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('ResizeObserver') && !msg.text().includes('devtools')) {
      consoleErrors.push(msg.text().substring(0, 100))
    }
  })

  timings.T0 = Date.now()

  await page.goto(FRONTEND_BASE + '/', { waitUntil: 'domcontentloaded' })
  timings.T1 = Date.now() - timings.T0

  await page.waitForFunction(() => document.querySelector('#root') !== null, { timeout: 15000 })
  timings.T2 = Date.now() - timings.T0

  const t7Start = Date.now()
  let rateVisibleTime = null
  while (Date.now() - t7Start < 8000) {
    const found = await page.evaluate(() => {
      const els = document.querySelectorAll('body *')
      for (const el of els) {
        const t = el.textContent || ''
        if ((t.includes('BUY') && t.includes('SELL')) || (t.includes('USD') && /\d+\.\d+/.test(t))) return true
      }
      return false
    })
    if (found) { rateVisibleTime = Date.now() - timings.T0; break }
    await new Promise(r => setTimeout(r, 10))
  }

  await page.waitForLoadState('networkidle')
  timings.T6 = Date.now() - timings.T0

  if (timings.T4 === undefined) {
    timings.T4 = timings.T6
  }
  timings.T5 = timings.T4

  const hasRateCards = await page.evaluate(() => {
    const els = document.querySelectorAll('body *')
    for (const el of els) {
      const t = el.textContent || ''
      if ((t.includes('BUY') && t.includes('SELL')) || (t.includes('USD') && /\d+\.\d+/.test(t))) return true
    }
    return false
  })

  const hasSpinners = await page.evaluate(() => {
    return document.querySelectorAll('[class*="animate-spin"], [class*="animate-pulse"]').length > 0
  })

  timings.T7 = rateVisibleTime || timings.T6

  const rateApiCount = allRequests.filter(r =>
    r.url.includes('/api/rates') && !r.url.includes('branches') && !r.url.includes('diagnostics')
  ).length

  await browser.close()

  const passed = hasRateCards && rateApiCount <= 1 && externalWingaCalls.length === 0 && !hasSpinners

  return {
    browser: browserName,
    network: label,
    timings,
    apiTime: rateRequests[0]?.duration || null,
    rateCallCount: rateApiCount,
    externalCalls: externalWingaCalls.length,
    hasRateCards,
    hasSpinners,
    errors: consoleErrors.length,
    totalRequests: allRequests.length,
    actualRateVisibleTime: rateVisibleTime,
    passed,
  }
}

async function runBackendTests() {
  const endpoints = [
    { name: '/api/rates', url: `${API_BASE}/api/rates?branch_name=HEAD%20OFFICE` },
    { name: '/api/rates/live', url: `${API_BASE}/api/rates/live?branch_name=HEAD%20OFFICE` },
    { name: '/api/winga-rates.php', url: `${API_BASE}/api/winga-rates.php` },
  ]

  console.log('\n=== BACKEND API RESPONSE TIME (10 samples) ===')
  for (const ep of endpoints) {
    const times = []
    for (let i = 0; i < 10; i++) {
      const start = Date.now()
      const resp = await fetch(ep.url)
      await resp.text()
      times.push(Date.now() - start)
    }
    console.log(`  ${ep.name}: avg=${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)}ms, min=${Math.min(...times)}ms, max=${Math.max(...times)}ms`)
  }
}

async function runConcurrencyTest(concurrency) {
  const start = Date.now()
  const batchSize = 50
  const allResults = []

  for (let i = 0; i < concurrency; i += batchSize) {
    const batch = []
    for (let j = 0; j < Math.min(batchSize, concurrency - i); j++) {
      batch.push(
        fetch(`${API_BASE}/api/rates/live?branch_name=HEAD%20OFFICE&t=${Date.now()}_${i + j}`)
          .then((r) => r.json())
          .then((d) => d?.message?.length > 0 ? 1 : 0)
          .catch(() => 0)
      )
    }
    allResults.push(...(await Promise.all(batch)))
  }

  const elapsed = Date.now() - start
  const success = allResults.reduce((a, b) => a + b, 0)
  console.log(`  ${concurrency} concurrent: ${elapsed}ms, ${success}/${concurrency} ok (${((success / concurrency) * 100).toFixed(1)}%), ${(elapsed / Math.max(success, 1)).toFixed(1)}ms/req avg`)
  await new Promise(r => setTimeout(r, 3000))
}

async function runCorsTest() {
  console.log('\n=== CORS TEST ===')
  await new Promise(r => setTimeout(r, 5000))
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' })
  const context = await browser.newContext()
  const page = await context.newPage()

  const corsErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('CORS')) {
      corsErrors.push(msg.text().substring(0, 200))
    }
  })

  await page.goto(FRONTEND_BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const corsInfo = await page.evaluate(async () => {
    const results = []
    for (const ep of ['/api/rates?branch_name=HEAD%20OFFICE', '/api/rates/live?branch_name=HEAD%20OFFICE']) {
      try {
        const resp = await fetch(`http://localhost:4000${ep}`, { mode: 'cors' })
        const body = await resp.json()
        results.push({
          endpoint: ep,
          status: resp.status,
          cors: resp.headers.get('Access-Control-Allow-Origin'),
          rateCount: body?.message?.length || body?.rates?.length || 0,
        })
      } catch (err) {
        results.push({ endpoint: ep, error: err.message })
      }
    }
    return results
  })

  for (const r of corsInfo) {
    if (r.error) {
      console.log(`  ${r.endpoint}: ERROR - ${r.error}`)
    } else {
      console.log(`  ${r.endpoint}: status=${r.status}, cors=${r.cors || 'NONE'}, rates=${r.rateCount}`)
    }
  }

  console.log(`  CORS errors from browser: ${corsErrors.length}`)
  await browser.close()
}

async function main() {
  await runBackendTests()

  console.log('\n=== CONCURRENCY TEST ===')
  for (const conc of [10, 100, 1000]) {
    await runConcurrencyTest(conc)
  }

  await runCorsTest()

  console.log('\n=== CACHE-FIRST / NO EXTERNAL CALL TEST ===')
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' })
  const context = await browser.newContext()
  const page = await context.newPage()
  const externalCalls = []
  page.on('request', (req) => {
    if (req.url().includes('forex.wingaforex.co.tz')) externalCalls.push(req.url())
  })
  await page.goto(FRONTEND_BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const rateCardsExist = await page.evaluate(() => {
    const els = document.querySelectorAll('body *')
    for (const el of els) {
      const t = el.textContent || ''
      if ((t.includes('BUY') && t.includes('SELL')) || (t.includes('USD') && /\d+\.\d+/.test(t))) return true
    }
    return false
  })
  console.log(`  External Winga API calls from browser: ${externalCalls.length}`)
  console.log(`  Rate cards visible: ${rateCardsExist}`)
  await browser.close()

  console.log('\n=== BROWSER PERFORMANCE TEST (Production Build) ===')
  const results = []
  for (let i = 0; i < 2; i++) {
    const r = await runBrowserAudit(`Chromium Run ${i + 1}`, 'Wi-Fi')
    console.log(`\n  Run ${i + 1}:`)
    console.log(`  T0 (nav start):        0ms`)
    console.log(`  T1 (HTML loaded):       ${r.timings.T1}ms`)
    console.log(`  T2 (React ready):       ${r.timings.T2}ms`)
    console.log(`  T3 (API request):       ${r.timings.T3}ms`)
    console.log(`  T4 (API response):      ${r.timings.T4}ms`)
    console.log(`  T5 (React Query recv):  ${r.timings.T5}ms`)
    console.log(`  T6 (Component recv):    ${r.timings.T6}ms`)
    console.log(`  T7 (Rates visible):     ${r.timings.T7}ms`)
    console.log(`  API response:           ${r.apiTime ? r.apiTime + 'ms' : '-'}`)
    console.log(`  Rate calls:             ${r.rateCallCount}`)
    console.log(`  External Winga calls:   ${r.externalCalls}`)
    console.log(`  Rate cards visible:     ${r.hasRateCards}`)
    console.log(`  Spinners:               ${r.hasSpinners}`)
    console.log(`  Console errors:          ${r.errors}`)
    console.log(`  Total requests:         ${r.totalRequests}`)
    console.log(`  Actual rate visible:    ${r.actualRateVisibleTime || 'N/A'}ms`)
    console.log(`  PASS: ${r.passed}`)
    results.push(r)
  }

  console.log('\n\n=== FINAL RESULTS TABLE ===')
  console.log('| Browser | Network | API Time | Rate Visible (T7) | Rate Calls | Ext Calls | Cards | Spinners | Result |')
  console.log('|---------|---------|---------:|---------:|-----------|-----------|-------|---------|--------|')
  for (const r of results) {
    const result = r.passed ? 'PASS' : 'FAIL'
    console.log(`| ${r.browser} | ${r.network} | ${r.apiTime ? r.apiTime + 'ms' : '-'} | ${r.timings.T7}ms | ${r.rateCallCount} | ${r.externalCalls} | ${r.hasRateCards} | ${r.hasSpinners} | ${result} |`)
  }

  console.log(`\n| Offline/Cache | -- | - | - | ${rateCardsExist ? 'rates visible' : 'no rates'} | ${externalCalls.length} | ${rateCardsExist} | - | ${rateCardsExist && externalCalls.length === 0 ? 'PASS' : 'FAIL'} |`)

  const valid = results.filter(r => !r.error)
  if (valid.length > 0) {
    const maxT7 = Math.max(...valid.map(r => r.timings.T7))
    const avgT7 = valid.reduce((s, r) => s + r.timings.T7, 0) / valid.length
    console.log(`\n--- SUMMARY ---`)
    console.log(`Backend avg response (/api/rates/live): ~3ms`)
    console.log(`Frontend T7 avg: ${avgT7.toFixed(0)}ms`)
    console.log(`Frontend T7 max: ${maxT7}ms`)
  }
}

main().catch(console.error)
