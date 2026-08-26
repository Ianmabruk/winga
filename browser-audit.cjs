const { chromium } = require('@playwright/test')

;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' })
  const results = []

  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
    const page = await context.newPage()

    const timings = { T0: 0 }
    const rateRequests = []
    const externalCalls = []
    const allRequests = []
    let consoleErrors = []

    page.on('request', (req) => {
      const url = req.url()
      allRequests.push(url)
      if (url.includes('forex.wingaforex.co.tz')) externalCalls.push(url)
      if (url.includes('/api/rates/live')) {
        if (timings.T3 === undefined) timings.T3 = Date.now() - timings.T0
        rateRequests.push({ url, start: Date.now() })
      }
    })

    page.on('response', (resp) => {
      const url = resp.url()
      if (url.includes('/api/rates/live')) {
        const pending = rateRequests.filter(r => r.url === url && !r.end)
        if (pending.length > 0) {
          const req = pending[pending.length - 1]
          req.end = Date.now()
          req.duration = req.end - req.start
        }
        if (timings.T4 === undefined) timings.T4 = Date.now() - timings.T0
      }
    })

    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('ResizeObserver')) consoleErrors.push(msg.text().substring(0, 100))
    })

    timings.T0 = Date.now()
    await page.goto('http://localhost:3173/', { waitUntil: 'domcontentloaded' })
    timings.T1 = Date.now() - timings.T0

    await page.waitForFunction(() => document.querySelector('#root') !== null, { timeout: 15000 })
    timings.T2 = Date.now() - timings.T0

    const t7Start = Date.now()
    let rateVisible = null
    while (Date.now() - t7Start < 10000) {
      const found = await page.evaluate(() => {
        const els = document.querySelectorAll('body *')
        for (const el of els) {
          const t = el.textContent || ''
          if ((t.includes('BUY') && t.includes('SELL')) || (t.includes('USD') && /\d+\.\d+/.test(t))) return true
        }
        return false
      })
      if (found) { rateVisible = Date.now() - timings.T0; break }
      await new Promise(r => setTimeout(r, 5))
    }

    if (timings.T4 === undefined) timings.T4 = rateVisible

    const rateCalls = allRequests.filter(r => r.includes('/api/rates/live')).length
    const hasSpinners = await page.evaluate(() =>
      document.querySelectorAll('[class*="animate-spin"], [class*="animate-pulse"]').length > 0
    )

    results.push({
      run,
      T1: timings.T1,
      T2: timings.T2,
      T3: timings.T3,
      T4: timings.T4,
      T7: rateVisible,
      apiMs: rateRequests[0]?.duration || 'N/A',
      rateCalls,
      externalCalls: externalCalls.length,
      hasSpinners,
      errors: consoleErrors.length,
    })

    await context.close()
  }

  await browser.close()

  console.log('=== BROWSER PERFORMANCE (3 runs) ===')
  for (const r of results) {
    console.log(`\n  Run ${r.run}:`)
    console.log(`    T1 (HTML):      ${r.T1}ms`)
    console.log(`    T2 (React):     ${r.T2}ms`)
    console.log(`    T3 (API start): ${r.T3}ms`)
    console.log(`    T4 (API resp):  ${r.T4}ms`)
    console.log(`    T7 (Rates vis): ${r.T7}ms`)
    console.log(`    API latency:    ${r.apiMs}ms`)
    console.log(`    Rate calls:     ${r.rateCalls}`)
    console.log(`    Ext calls:      ${r.externalCalls}`)
    console.log(`    Spinners:       ${r.hasSpinners}`)
    console.log(`    Errors:         ${r.errors}`)
    console.log(`    T4->T7 gap:      ${r.T7 - r.T4}ms`)
  }

  const avgT4T7 = results.reduce((s, r) => s + (r.T7 - r.T4), 0) / results.length
  const avgT7 = results.reduce((s, r) => s + r.T7, 0) / results.length
  console.log(`\n=== SUMMARY ===`)
  console.log(`Avg T4->T7 (API->visible): ${avgT4T7.toFixed(0)}ms`)
  console.log(`Avg T7 (total visibility): ${avgT7.toFixed(0)}ms`)
})().catch(console.error)
