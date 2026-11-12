/**
 * openalgo-charts — Hermes DESKTOP plugin (página + ⌘K).
 *
 * Gráfico de candles nativo sobre OpenAlgo Charts 2.7.0 (Apache-2.0),
 * vendorizado em ./vendor/ — sem CDN, sem build, sem npm install.
 *
 * Por que não um iframe da UI do OpenAlgo: ela manda `X-Frame-Options: DENY`.
 * A engine em si é um bundle ESM sem dependências, então roda aqui direto.
 *
 * FEEDS (públicos, sem chave, todos com CORS `*` — verificado em 11/11/2026):
 *   binance             https://fapi.binance.com/fapi/v1/klines        + WS fstream
 *   hyperliquid         POST https://api.hyperliquid.xyz/info (candleSnapshot)
 *   hyperliquid-testnet POST https://api.hyperliquid-testnet.xyz/info
 *   aster               https://fapi.asterdex.com/fapi/v1/klines      (API estilo Binance)
 *   aster-testnet       https://fapi.asterdex-testnet.com/fapi/v1/klines
 *
 * BingX NÃO entra: a API pública responde 403 a qualquer request com header
 * `Origin` (WAF), então exige proxy server-side — ver
 * ~/WorkSpace/wiki/procedures/openalgo-instalacao.md
 *
 * Live: WS só na Binance; Hyperliquid e Aster fazem polling de 12 s na última barra.
 *
 * Alertas: AlertController (cruzamento de preço, `onBarClose`), entregues como
 * toast + lista e persistidos em ctx.storage. Um alerta nunca envia ordem.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import {
  PALETTE_AREA,
  ROUTES_AREA,
  SIDEBAR_NAV_AREA,
  STATUSBAR_AREAS,
  Badge,
  Button,
  Input,
  atom,
  host,
  useValue,
} from '@hermes/plugin-sdk'

const ID = 'openalgo-charts'
const ROUTE = '/openalgo-charts'
const STORAGE_ALERTS = 'alerts'
const STORAGE_WEB = 'webUrl'
const POLL_MS = 12_000

// UI web do OpenAlgo. Loopback serve a VPS; o IP da tailnet serve o Mac, e o
// serviço escuta nos dois (gunicorn com dois --bind no unit).
const WEB_URLS = {
  tailnet: 'http://100.117.110.100:5000',
  local: 'http://127.0.0.1:5000',
}
const $webUrl = atom(WEB_URLS.tailnet)

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d']

const SOURCES = [
  { id: 'binance', label: 'Binance', suffix: 'USDT', live: 'ws' },
  { id: 'hyperliquid', label: 'Hyperliquid', suffix: '', live: 'poll' },
  { id: 'hyperliquid-testnet', label: 'HL testnet', suffix: '', live: 'poll' },
  { id: 'aster', label: 'Aster', suffix: 'USDT', live: 'poll' },
  { id: 'aster-testnet', label: 'Aster testnet', suffix: 'USDT', live: 'poll' },
]

const BASES = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE']

function sourceOf(id) {
  return SOURCES.find((s) => s.id === id) || SOURCES[0]
}

/** Binance/Aster usam BASEUSDT; Hyperliquid usa BASE. */
function symbolFor(sourceId, base) {
  const s = sourceOf(sourceId)
  return s.suffix ? `${base}${s.suffix}` : base
}

function intervalMs(interval) {
  const m = /^(\d+)([mhd])$/.exec(interval)
  if (!m) return 60_000
  const n = Number(m[1])
  const unit = m[2] === 'm' ? 60_000 : m[2] === 'h' ? 3_600_000 : 86_400_000
  return n * unit
}

// ── engine ─────────────────────────────────────────────────────────────────
// Import ESTÁTICO e relativo do bundle vendorizado (2.7.0, Apache-2.0, zero
// dependências). Estático de propósito: o loader do desktop recusa
// especificadores com esquema de URL (https:, file:) e o lint de admissão
// (`hermes plugins validate`) recusa qualquer import() dinâmico que não seja
// react/@hermes/plugin-sdk — inclusive o relativo. Import relativo estático
// passa nos dois e não depende de rede.
import { createChart, AlertController } from '../vendor/openalgo-charts.mjs'
import { registerBuiltinIndicators, BUILTIN_INDICATORS } from '../vendor/openalgo-charts.indicators.mjs'

registerBuiltinIndicators()

const ENGINE_LABEL = 'vendor openalgo-charts 2.7.0'
const STORAGE_IND = 'indicators'

// O tier de indicadores exporta BUILTIN_INDICATORS (112 descritores; array ou mapa
// indexado, dependendo do build). Normaliza uma vez e ordena por nome.
const CATALOG = (Array.isArray(BUILTIN_INDICATORS)
  ? BUILTIN_INDICATORS
  : Object.values(BUILTIN_INDICATORS || {})
)
  .filter((d) => d && d.id)
  .sort((a, b) => String(a.name).localeCompare(String(b.name)))

// Duas instancias do mesmo estudo (EMA 9 e 21) sao entradas separadas: o id repete,
// os inputs mudam. `inputs: {}` = defaults do descritor.
const DEFAULT_INDICATORS = [
  { id: 'ema', inputs: { length: 9 } },
  { id: 'ema', inputs: { length: 21 } },
  { id: 'rsi', inputs: { length: 14 } },
]

// ── feeds ──────────────────────────────────────────────────────────────────
async function fetchBars(sourceId, base, interval, limit = 400) {
  if (sourceId === 'binance' || sourceId === 'aster' || sourceId === 'aster-testnet') {
    const host =
      sourceId === 'binance'
        ? 'https://fapi.binance.com'
        : sourceId === 'aster'
          ? 'https://fapi.asterdex.com'
          : 'https://fapi.asterdex-testnet.com'
    const url = `${host}/fapi/v1/klines?symbol=${base}USDT&interval=${interval}&limit=${limit}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`${sourceId} klines HTTP ${res.status}`)
    const rows = await res.json()
    return rows.map((r) => ({
      time: Math.floor(r[0] / 1000),
      open: Number(r[1]),
      high: Number(r[2]),
      low: Number(r[3]),
      close: Number(r[4]),
      volume: Number(r[5]),
    }))
  }

  // Hyperliquid: POST /info com candleSnapshot (ms, ordem ascendente)
  const host =
    sourceId === 'hyperliquid-testnet'
      ? 'https://api.hyperliquid-testnet.xyz'
      : 'https://api.hyperliquid.xyz'
  const startTime = Date.now() - limit * intervalMs(interval)
  const res = await fetch(`${host}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'candleSnapshot', req: { coin: base, interval, startTime } }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`hyperliquid info HTTP ${res.status}`)
  const rows = await res.json()
  if (!Array.isArray(rows)) throw new Error('hyperliquid: resposta inesperada')
  return rows
    .map((r) => ({
      time: Math.floor(r.t / 1000),
      open: Number(r.o),
      high: Number(r.h),
      low: Number(r.l),
      close: Number(r.c),
      volume: Number(r.v),
    }))
    .sort((a, b) => a.time - b.time)
}

const $lastPrice = atom(0)

// ── chart ──────────────────────────────────────────────────────────────────
function ChartView(props) {
  const { base, sourceId, interval, alertsApi, indicatorApi, initialIndicators, onTrigger, bump } = props
  const boxRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('carregando motor…')
  const [series, setSeries] = useState(null)
  const [indCount, setIndCount] = useState(0)

  // 1. instância do chart
  useEffect(() => {
    if (!boxRef.current) return undefined
    let chart
    try {
      chart = createChart(boxRef.current)
    } catch (err) {
      setError(err.message || String(err))
      return undefined
    }
    chartRef.current = chart
    const s = chart.addSeries('candlestick')
    seriesRef.current = s
    setSeries(s)
    // Aplicador exposto para a pagina: troca o conjunto inteiro de estudos.
    // removeIndicator(id) usa o instanceId devolvido por addIndicator/indicators().
    const applyIndicators = (sel) => {
      try {
        for (const inst of chart.indicators()) {
          try {
            chart.removeIndicator(inst.id)
          } catch (_) {}
        }
      } catch (_) {}
      let n = 0
      for (const entry of sel || []) {
        try {
          chart.addIndicator(entry.id, entry.inputs || {})
          n += 1
        } catch (err) {
          console.warn('[openalgo-charts] addIndicator falhou', entry.id, err)
        }
      }
      setIndCount(n)
    }
    if (indicatorApi) indicatorApi.apply = applyIndicators
    applyIndicators(initialIndicators || DEFAULT_INDICATORS)
    const alerts = new AlertController(chart)
    if (alertsApi) {
      alertsApi.add = (cfg) => alerts.add(cfg)
      alertsApi.list = () => alerts.list()
      alertsApi.remove = (id) => alerts.remove(id)
      alertsApi.setContext = (c) => {
        try {
          chart.setDataContext(c)
        } catch (err) {
          console.warn('[openalgo-charts] setDataContext failed', err)
        }
      }
    }
    const off = chart.on('alert:triggered', (payload) => {
      const ev = payload || {}
      const price = typeof ev.price === 'number' ? ev.price : null
      const title = ev.title || 'alerta'
      host.notify({
        kind: 'success',
        message: `OpenAlgo alerta · ${title}${price == null ? '' : ' @ ' + price}`,
      })
      if (onTrigger) onTrigger({ title, price, time: ev.time ?? null, symbol: base, interval })
    })
    setStatus('pronto')
    return () => {
      try {
        off && off()
      } catch (_) {}
      try {
        chart.destroy()
      } catch (_) {}
      chartRef.current = null
      seriesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3. dados + feed ao vivo
  useEffect(() => {
    if (!series || !base) return undefined
    const src = sourceOf(sourceId)
    let cancelled = false
    let ws = null
    let timer = null

    setStatus(`carregando ${symbolFor(sourceId, base)} ${interval}…`)
    fetchBars(sourceId, base, interval)
      .then((bars) => {
        if (cancelled || !bars.length) return
        series.setData(bars)
        $lastPrice.set(bars[bars.length - 1].close)
        try {
          chartRef.current && chartRef.current.timeScale.fitContent(160)
        } catch (_) {}
        if (alertsApi && alertsApi.setContext) {
          alertsApi.setContext({
            symbol: symbolFor(sourceId, base),
            exchange: src.label.toUpperCase(),
            interval,
          })
        }
        setStatus(`${bars.length} barras · ${src.live === 'ws' ? 'live ws' : 'poll 12s'}`)
        if (src.live === 'ws') connect()
        else startPolling()
      })
      .catch((err) => {
        if (!cancelled) setStatus(`erro: ${err.message || err}`)
      })

    function connect() {
      try {
        ws = new WebSocket(
          `wss://fstream.binance.com/ws/${symbolFor(sourceId, base).toLowerCase()}@kline_${interval}`,
        )
        ws.onmessage = (evt) => {
          let msg
          try {
            msg = JSON.parse(evt.data)
          } catch (_) {
            return
          }
          const k = msg && (msg.k || (msg.data && msg.data.k))
          if (!k || !seriesRef.current) return
          const bar = {
            time: Math.floor(k.t / 1000),
            open: Number(k.o),
            high: Number(k.h),
            low: Number(k.l),
            close: Number(k.c),
            volume: Number(k.v),
          }
          try {
            seriesRef.current.update(bar)
          } catch (_) {}
          $lastPrice.set(bar.close)
        }
        ws.onclose = () => {
          if (cancelled) return
          setStatus('live · reconectando em 5s')
          setTimeout(() => !cancelled && connect(), 5000)
        }
      } catch (err) {
        setStatus(`ws erro: ${err.message || err}`)
      }
    }

    function startPolling() {
      timer = setInterval(async () => {
        if (cancelled || !seriesRef.current) return
        try {
          const tail = await fetchBars(sourceId, base, interval, 2)
          const last = tail[tail.length - 1]
          if (!last) return
          seriesRef.current.update(last)
          $lastPrice.set(last.close)
        } catch (_) {}
      }, POLL_MS)
    }

    return () => {
      cancelled = true
      try {
        ws && ws.close()
      } catch (_) {}
      if (timer) clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, base, sourceId, interval, bump])

  if (error) {
    return jsxs('div', {
      style: { padding: 16, color: 'var(--ui-text-secondary)', fontSize: 12, lineHeight: 1.6 },
      children: [
        jsx('div', {
          style: { color: 'var(--ui-red, #e5484d)', fontWeight: 600, marginBottom: 6 },
          children: 'Motor de gráfico indisponível',
        }),
        jsx('pre', {
          style: { whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--ui-font-mono, monospace)' },
          children: error,
        }),
        jsx('div', {
          style: { marginTop: 8, opacity: 0.8 },
          children:
            'Se a mensagem citar CSP ou "Failed to fetch dynamically imported module", o app bloqueia import dinâmico — a cópia vendorizada em ./vendor deve ser usada.',
        }),
      ],
    })
  }

  return jsxs('div', {
    style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
    children: [
      jsx('div', { ref: boxRef, style: { flex: 1, minHeight: 0, position: 'relative' } }),
      jsx('div', {
        style: {
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          padding: '4px 8px',
          fontSize: 11,
          color: 'var(--ui-text-quaternary)',
          borderTop: '1px solid var(--ui-stroke-secondary)',
        },
        children: [
          jsx('span', { children: status }),
          jsx('span', { children: `${indCount} indicadores` }),
          jsx('span', {
            style: { marginLeft: 'auto' },
            children: ENGINE_LABEL,
          }),
        ],
      }),
    ],
  })
}

// ── página ─────────────────────────────────────────────────────────────────
function OpenAlgoPage(props) {
  const { storage } = props
  const [base, setBase] = useState('BTC')
  const [sourceId, setSourceId] = useState('binance')
  const [interval, setInterval] = useState('1m')
  const [draft, setDraft] = useState('BTC')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('crossingUp')
  const [bump, setBump] = useState(0)
  const [triggered, setTriggered] = useState([])
  const [armed, setArmed] = useState([])
  const alertsApi = useRef({})
  const indicatorApi = useRef({})
  const lastPrice = useValue($lastPrice)
  const [indicators, setIndicators] = useState(() => {
    try {
      const saved = storage.get(STORAGE_IND, null)
      if (Array.isArray(saved)) return saved
    } catch (_) {}
    return DEFAULT_INDICATORS
  })
  const [showPicker, setShowPicker] = useState(false)
  const [filter, setFilter] = useState('')

  // aplica a selecao no chart e persiste
  useEffect(() => {
    if (indicatorApi.current.apply) indicatorApi.current.apply(indicators)
    try {
      storage.set(STORAGE_IND, indicators)
    } catch (_) {}
  }, [indicators])

  const toggleIndicator = useCallback((id) => {
    setIndicators((prev) =>
      prev.some((x) => x.id === id) ? prev.filter((x) => x.id !== id) : [...prev, { id, inputs: {} }],
    )
  }, [])

  useEffect(() => {
    // ctx.storage é SINCRONO: get(chave, default) devolve o valor, set() nao devolve promessa.
    try {
      const saved = storage.get(STORAGE_ALERTS, null)
      if (Array.isArray(saved)) setTriggered(saved.slice(0, 30))
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onTrigger = useCallback((ev) => {
    setTriggered((prev) => {
      const next = [ev, ...prev].slice(0, 30)
      try {
        storage.set(STORAGE_ALERTS, next)
      } catch (_) {}
      return next
    })
  }, [])

  const addAlert = useCallback(() => {
    const px = Number(price)
    if (!Number.isFinite(px) || px <= 0) {
      host.notify({ kind: 'error', message: 'Preço inválido para o alerta' })
      return
    }
    const api = alertsApi.current
    if (!api || !api.add) {
      host.notify({ kind: 'error', message: 'Gráfico ainda não está pronto' })
      return
    }
    const label = `${symbolFor(sourceId, base)} ${condition} ${px}`
    try {
      const rec = api.add({
        title: label,
        source: { kind: 'price', price: px },
        condition,
        policy: 'onBarClose',
        repeat: 'once',
      })
      setArmed((prev) => [{ id: rec && rec.id, title: label }, ...prev])
      setPrice('')
      host.notify({ kind: 'success', message: 'Alerta armado' })
    } catch (err) {
      host.notify({ kind: 'error', message: `Falha ao armar: ${err.message || err}` })
    }
  }, [price, condition, sourceId, base])

  const applySymbol = useCallback(() => {
    const s = draft.trim().toUpperCase().replace(/USDT$/, '')
    if (!/^[A-Z0-9]{2,12}$/.test(s)) {
      host.notify({ kind: 'error', message: 'Símbolo inválido (ex.: BTC)' })
      return
    }
    setBase(s)
    setBump((n) => n + 1)
  }, [draft])

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderBottom: '1px solid var(--ui-stroke-secondary)',
    flexWrap: 'wrap',
  }
  const segStyle = (active) => ({
    padding: '3px 9px',
    borderRadius: 5,
    fontSize: 11,
    cursor: 'pointer',
    border: '1px solid var(--ui-stroke-secondary)',
    background: active ? 'var(--ui-accent)' : 'transparent',
    color: active ? '#fff' : 'var(--ui-text-secondary)',
  })

  return jsxs('div', {
    style: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
    children: [
      jsxs('div', {
        style: rowStyle,
        children: [
          jsx('span', {
            style: { fontSize: 12, fontWeight: 600, color: 'var(--ui-text-secondary)' },
            children: 'OpenAlgo Charts',
          }),
          jsx(Input, {
            value: draft,
            onChange: (e) => setDraft(e?.target?.value ?? e),
            onKeyDown: (e) => e.key === 'Enter' && applySymbol(),
            style: { width: 90 },
            placeholder: 'BTC',
          }),
          jsx(Button, { size: 'sm', onClick: applySymbol, children: 'Carregar' }),
          jsx('div', {
            style: { display: 'flex', gap: 4 },
            children: BASES.slice(0, 4).map((b) =>
              jsx(
                'button',
                {
                  key: b,
                  onClick: () => {
                    setDraft(b)
                    setBase(b)
                    setBump((n) => n + 1)
                  },
                  style: segStyle(b === base),
                  children: b,
                },
                b,
              ),
            ),
          }),
          jsx('div', {
            style: { display: 'flex', gap: 4, marginLeft: 8 },
            children: INTERVALS.map((iv) =>
              jsx(
                'button',
                {
                  key: iv,
                  onClick: () => {
                    setInterval(iv)
                    setBump((n) => n + 1)
                  },
                  style: segStyle(iv === interval),
                  children: iv,
                },
                iv,
              ),
            ),
          }),
          jsxs('div', {
            style: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 },
            children: [
              jsx(Badge, { children: lastPrice ? lastPrice.toFixed(2) : '—' }),
              jsx('span', {
                style: { fontSize: 10, color: 'var(--ui-text-quaternary)' },
                children: 'público · sem chave',
              }),
            ],
          }),
        ],
      }),
      jsxs('div', {
        style: { ...rowStyle, paddingTop: 4, paddingBottom: 4 },
        children: [
          jsx('span', {
            style: { fontSize: 10, color: 'var(--ui-text-quaternary)' },
            children: 'feed',
          }),
          ...SOURCES.map((s) =>
            jsx(
              'button',
              {
                key: s.id,
                onClick: () => {
                  setSourceId(s.id)
                  setBump((n) => n + 1)
                },
                style: segStyle(s.id === sourceId),
                children: s.label,
              },
              s.id,
            ),
          ),
          jsxs('button', {
            onClick: () => setShowPicker((v) => !v),
            style: { ...segStyle(showPicker), marginLeft: 'auto' },
            children: [`indicadores (${indicators.length})`],
          }),
        ],
      }),
      showPicker
        ? jsxs('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '8px 12px',
              borderBottom: '1px solid var(--ui-stroke-secondary)',
              maxHeight: 210,
            },
            children: [
              jsxs('div', {
                style: { display: 'flex', gap: 8, alignItems: 'center' },
                children: [
                  jsx(Input, {
                    value: filter,
                    onChange: (e) => setFilter(e?.target?.value ?? e),
                    placeholder: 'filtrar por nome (ex.: supertrend, vwap)',
                    style: { width: 260 },
                  }),
                  jsx('span', {
                    style: { fontSize: 10, color: 'var(--ui-text-quaternary)' },
                    children: `${CATALOG.length} built-ins · ${indicators.length} ativos`,
                  }),
                  jsx(Button, {
                    size: 'sm',
                    onClick: () => setIndicators(DEFAULT_INDICATORS),
                    children: 'padrão',
                  }),
                  jsx(Button, {
                    size: 'sm',
                    onClick: () => setIndicators([]),
                    children: 'limpar',
                  }),
                ],
              }),
              jsx('div', {
                style: { overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '2px 10px' },
                children: CATALOG.filter((d) => {
                  const q = filter.trim().toLowerCase()
                  if (!q) return true
                  return `${d.id} ${d.name} ${d.category || ''}`.toLowerCase().includes(q)
                })
                  .slice(0, 60)
                  .map((d) => {
                    const on = indicators.some((x) => x.id === d.id)
                    return jsxs(
                      'label',
                      {
                        key: d.id,
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          cursor: 'pointer',
                          color: on ? 'var(--ui-text-secondary)' : 'var(--ui-text-quaternary)',
                          minWidth: 128,
                        },
                        children: [
                          jsx('input', {
                            type: 'checkbox',
                            checked: on,
                            onChange: () => toggleIndicator(d.id),
                          }),
                          jsx('span', { children: d.name }),
                          jsx('span', {
                            style: { fontSize: 9, opacity: 0.6 },
                            children: d.placement === 'onchart' ? 'preço' : 'painel',
                          }),
                        ],
                      },
                      d.id,
                    )
                  }),
              }),
            ],
          })
        : null,
      jsx('div', {
        style: { flex: 1, minHeight: 0, position: 'relative' },
        children: jsx(ChartView, {
          base,
          sourceId,
          interval,
          bump,
          alertsApi: alertsApi.current,
          indicatorApi: indicatorApi.current,
          initialIndicators: indicators,
          onTrigger,
        }),
      }),
      jsxs('div', {
        style: {
          ...rowStyle,
          borderBottom: 'none',
          borderTop: '1px solid var(--ui-stroke-secondary)',
        },
        children: [
          jsx('span', {
            style: { fontSize: 11, color: 'var(--ui-text-secondary)' },
            children: 'Alerta de preço',
          }),
          jsx(Input, {
            value: price,
            onChange: (e) => setPrice(e?.target?.value ?? e),
            placeholder: lastPrice ? String(Math.round(lastPrice)) : '100000',
            style: { width: 110 },
          }),
          jsx('select', {
            value: condition,
            onChange: (e) => setCondition(e.target.value),
            style: {
              fontSize: 11,
              padding: '3px 6px',
              borderRadius: 5,
              background: 'transparent',
              color: 'var(--ui-text-secondary)',
              border: '1px solid var(--ui-stroke-secondary)',
            },
            children: [
              jsx('option', { value: 'crossingUp', children: 'cruza acima' }),
              jsx('option', { value: 'crossingDown', children: 'cruza abaixo' }),
              jsx('option', { value: 'greaterThan', children: 'maior que' }),
              jsx('option', { value: 'lessThan', children: 'menor que' }),
            ],
          }),
          jsx(Button, { size: 'sm', onClick: addAlert, children: 'Armar' }),
          jsxs('span', {
            style: { fontSize: 10, color: 'var(--ui-text-quaternary)' },
            children: [
              armed.length ? `${armed.length} armado(s)` : 'nenhum armado',
              triggered.length ? ` · ${triggered.length} disparado(s)` : '',
            ],
          }),
          jsx('div', {
            style: {
              marginLeft: 'auto',
              fontSize: 10,
              color: 'var(--ui-text-quaternary)',
              maxWidth: '48%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            children: triggered[0]
              ? `último: ${triggered[0].title}${triggered[0].price ? ' @ ' + triggered[0].price : ''}`
              : 'avaliação no fechamento da barra (onBarClose)',
          }),
        ],
      }),
    ],
  })
}

// ── botão na barra de informações ──────────────────────────────────────────
// Abre a UI web do OpenAlgo no navegador do sistema (ctx.os.openExternal).
// O ponto à esquerda é sonda de disponibilidade: `no-cors` resolve quando o
// host responde, rejeita quando não há rede/porta fechada (resposta opaca,
// então não dá para ler status — basta saber que respondeu).
function OpenAlgoChip(props) {
  const { onOpen } = props
  const url = useValue($webUrl)
  const [state, setState] = useState('unknown')

  useEffect(() => {
    let alive = true
    const ping = async () => {
      try {
        await fetch(url, { mode: 'no-cors', cache: 'no-store' })
        if (alive) setState('up')
      } catch (_) {
        if (alive) setState('down')
      }
    }
    ping()
    const timer = setInterval(ping, 30_000)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [url])

  const color =
    state === 'up'
      ? 'var(--ui-green, #3fb950)'
      : state === 'down'
        ? 'var(--ui-red, #e5484d)'
        : 'var(--ui-text-quaternary)'

  return jsxs('button', {
    onClick: onOpen,
    title: `Abrir ${url} no navegador`,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '1px 7px',
      fontSize: 11,
      cursor: 'pointer',
      border: '1px solid var(--ui-stroke-secondary)',
      borderRadius: 5,
      background: 'transparent',
      color: 'var(--ui-text-secondary)',
    },
    children: [
      jsx('span', {
        style: { width: 6, height: 6, borderRadius: 3, background: color, display: 'inline-block' },
      }),
      jsx('span', { children: 'OpenAlgo' }),
    ],
  })
}

// ── registro ───────────────────────────────────────────────────────────────
export default {
  id: ID,
  name: 'OpenAlgo Charts',
  register(ctx) {
    // Abre a UI web do OpenAlgo no navegador padrão do sistema.
    const openWeb = () => {
      const url = $webUrl.get()
      try {
        const res = ctx.os && ctx.os.openExternal ? ctx.os.openExternal(url) : null
        if (res && typeof res.then === 'function') {
          res.then((ok) => {
            if (!ok) host.notify({ kind: 'error', message: `Não consegui abrir ${url}` })
          })
        } else if (!res) {
          host.notify({ kind: 'error', message: 'openExternal indisponível neste host' })
        }
      } catch (err) {
        host.notify({ kind: 'error', message: `Falha ao abrir: ${err.message || err}` })
      }
    }

    // Restaura a URL escolhida e registra a contribuição da barra.
    try {
      const saved = ctx.storage.get(STORAGE_WEB, null)
      if (saved === WEB_URLS.local || saved === WEB_URLS.tailnet) $webUrl.set(saved)
    } catch (_) {}

    ctx.register({
      id: 'status',
      area: STATUSBAR_AREAS.right,
      order: 150,
      render: () => jsx(OpenAlgoChip, { onOpen: openWeb }),
    })

    ctx.registerMany([
      {
        id: 'page',
        area: ROUTES_AREA,
        data: { path: ROUTE },
        render: () => jsx(OpenAlgoPage, { storage: ctx.storage }),
      },
      {
        id: 'nav',
        area: SIDEBAR_NAV_AREA,
        data: { path: ROUTE, label: 'OpenAlgo', codicon: 'project', order: 30 },
      },
      {
        id: 'cmd',
        area: PALETTE_AREA,
        data: {
          id: 'openalgo-charts.open',
          label: 'OpenAlgo Charts: abrir gráfico',
          keywords: [
            'openalgo',
            'chart',
            'grafico',
            'candles',
            'binance',
            'hyperliquid',
            'aster',
            'alertas',
            'indicadores',
          ],
          run: () => host.navigate(ROUTE),
        },
      },
      {
        id: 'cmd-web',
        area: PALETTE_AREA,
        data: {
          id: 'openalgo-charts.web',
          label: 'OpenAlgo: abrir UI web no navegador',
          keywords: ['openalgo', 'abrir', 'navegador', 'browser', 'web', 'plataforma'],
          run: openWeb,
        },
      },
      {
        id: 'cmd-url',
        area: PALETTE_AREA,
        data: {
          id: 'openalgo-charts.url',
          label: 'OpenAlgo: alternar URL (tailnet / local)',
          keywords: ['openalgo', 'url', 'tailnet', 'local', 'endereco'],
          run: () => {
            const next = $webUrl.get() === WEB_URLS.local ? WEB_URLS.tailnet : WEB_URLS.local
            $webUrl.set(next)
            try {
              ctx.storage.set(STORAGE_WEB, next)
            } catch (_) {}
            host.notify({ kind: 'success', message: `OpenAlgo: ${next}` })
          },
        },
      },
    ])
  },
}
