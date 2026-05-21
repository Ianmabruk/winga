import { useEffect, useRef } from 'react'

export default function TradingViewEmbed({ symbol = 'FX_IDC:USDKES' }) {
  const container = useRef(null)

  useEffect(() => {
    if (!container.current) return undefined
    container.current.innerHTML = ''

    const widget = document.createElement('div')
    widget.className = 'tradingview-widget-container__widget'

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: '15',
      timezone: 'Africa/Nairobi',
      theme: 'light',
      style: '1',
      locale: 'en',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    })

    container.current.appendChild(widget)
    container.current.appendChild(script)

    return () => {
      if (container.current) container.current.innerHTML = ''
    }
  }, [symbol])

  return (
    <div className="tradingview-widget-container h-[360px] w-full overflow-hidden rounded-2xl border border-skybrand-100 bg-white">
      <div ref={container} className="h-full w-full" />
    </div>
  )
}
