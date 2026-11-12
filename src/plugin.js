/**
 * openalgo-charts — Hermes DESKTOP plugin (página + ⌘K + chip na barra).
 *
 * Terminal de gráfico nativo sobre **OpenAlgo Charts 2.7.0** (Apache-2.0), usando o
 * tier `widget`: uma chamada entrega a moldura completa que o usuário espera —
 * barra superior (símbolo, intervalo, tipo de série, tema claro/escuro, settings,
 * indicadores, objetos, data, alertas), rail de desenhos à esquerda, linha de status,
 * diálogos, menu de contexto, atalhos com `?` e persistência de layout.
 *
 * Engine e tiers entram por **bundle** (esbuild): o loader do desktop aceita apenas
 * `@hermes/plugin-sdk`, `react` e `react/jsx-runtime` — nenhum outro especificador,
 * nem relativo. Por isso `npm run build` gera um `plugin.js` autocontido.
 *
 * Dados: 5 feeds públicos, sem chave, com CORS `*` (verificado em 11/11/2026),
 * plugados no widget pelo contrato `DataFeed` (getBars / subscribeBars / searchSymbols):
 *   binance             https://fapi.binance.com/fapi/v1/klines        + WS fstream
 *   hyperliquid         POST https://api.hyperliquid.xyz/info (candleSnapshot)
 *   hyperliquid-testnet POST https://api.hyperliquid-testnet.xyz/info
 *   aster               https://fapi.asterdex.com/fapi/v1/klines      (API estilo Binance)
 *   aster-testnet       https://fapi.asterdex-testnet.com/fapi/v1/klines
 *
 * BingX fica fora: a API pública responde 403 a qualquer request com header `Origin`.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { jsx, jsxs } from 'react/jsx-runtime'
import {
  PALETTE_AREA,
  ROUTES_AREA,
  SIDEBAR_NAV_AREA,
  STATUSBAR_AREAS,
  Button,
  atom,
  host,
  useValue,
} from '@hermes/plugin-sdk'

import { registerBuiltinIndicators } from '../vendor/openalgo-charts.indicators.mjs'
import { createWidget } from '../vendor/openalgo-charts.widget.mjs'

registerBuiltinIndicators()

const ID = 'openalgo-charts'
const ROUTE = '/openalgo-charts'
const STORAGE_WEB = 'webUrl'
const STORAGE_SOURCE = 'feedSource'
const POLL_MS = 12_000

const WEB_URLS = {
  tailnet: 'http://100.117.110.100:5000',
  local: 'http://127.0.0.1:5000',
}
const $webUrl = atom(WEB_URLS.tailnet)

/** feeds: sufixo do símbolo e como o live chega */
const SOURCES = [
  { id: 'binance', label: 'Binance', suffix: 'USDT', live: 'ws', exchange: 'BINANCE' },
  { id: 'hyperliquid', label: 'Hyperliquid', suffix: '', live: 'poll', exchange: 'HYPERLIQUID' },
  {
    id: 'hyperliquid-testnet',
    label: 'HL testnet',
    suffix: '',
    live: 'poll',
    exchange: 'HYPERLIQUID_TESTNET',
  },
  { id: 'aster', label: 'Aster', suffix: 'USDT', live: 'poll', exchange: 'ASTER' },
  {
    id: 'aster-testnet',
    label: 'Aster testnet',
    suffix: 'USDT',
    live: 'poll',
    exchange: 'ASTER_TESTNET',
  },
]

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d']
const BASES = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'LINK']

function sourceOf(id) {
  return SOURCES.find((s) => s.id === id) || SOURCES[0]
}

/** 'BTCUSDT' -> 'BTC' ; 'btc' -> 'BTC' */
function baseOf(symbol) {
  return String(symbol || 'BTC')
    .toUpperCase()
    .replace(/(USDT|USDC|USD)$/, '')
}

function internalSymbol(sourceId, base) {
  return sourceOf(sourceId).suffix ? `${base}${sourceOf(sourceId).suffix}` : base
}

function intervalMs(interval) {
  const m = /^(\d+)([smhdw])$/i.exec(String(interval))
  if (!m) return 60_000
  const n = Number(m[1])
  const unit = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 }[
    m[2].toLowerCase()
  ]
  return n * unit
}

// ── feeds ──────────────────────────────────────────────────────────────────
async function binanceLike(hostUrl, symbol, interval, limit) {
  const url = `${hostUrl}/fapi/v1/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`klines HTTP ${res.status} em ${symbol} ${interval}`)
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

async function hyperliquidLike(hostUrl, coin, interval, limit) {
  const startTime = Date.now() - limit * intervalMs(interval)
  const res = await fetch(`${hostUrl}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'candleSnapshot', req: { coin, interval, startTime } }),
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

/** Um DataFeed por fonte, no contrato do engine (getBars/subscribeBars/searchSymbols). */
function makeFeed(sourceId, onNote) {
  const src = sourceOf(sourceId)

  async function load(symbol, interval, limit) {
    const base = baseOf(symbol)
    if (sourceId === 'binance') return binanceLike('https://fapi.binance.com', internalSymbol(sourceId, base), interval, limit)
    if (sourceId === 'aster') return binanceLike('https://fapi.asterdex.com', internalSymbol(sourceId, base), interval, limit)
    if (sourceId === 'aster-testnet') return binanceLike('https://fapi.asterdex-testnet.com', internalSymbol(sourceId, base), interval, limit)
    if (sourceId === 'hyperliquid') return hyperliquidLike('https://api.hyperliquid.xyz', base, interval, limit)
    return hyperliquidLike('https://api.hyperliquid-testnet.xyz', base, interval, limit)
  }

  return {
    async getBars(req) {
      const interval = req.interval === 'D' || req.interval === '1D' ? '1d' : req.interval === 'W' ? '1w' : req.interval
      const limit = Math.min(1500, Math.max(120, req.countBack || 500))
      const bars = await load(req.symbol, interval, limit)
      onNote && onNote(`${bars.length} barras`)
      return bars
    },

    subscribeBars(req, onBar) {
      const interval = req.interval === 'D' || req.interval === '1D' ? '1d' : req.interval === 'W' ? '1w' : req.interval
      // Binance tem stream de kline; as outras fontes fazem polling da última barra.
      if (src.live === 'ws' && sourceId === 'binance') {
        let ws = null
        let closed = false
        try {
          ws = new WebSocket(
            `wss://fstream.binance.com/ws/${internalSymbol(sourceId, baseOf(req.symbol)).toLowerCase()}@kline_${interval}`,
          )
          ws.onmessage = (evt) => {
            let msg
            try {
              msg = JSON.parse(evt.data)
            } catch (_) {
              return
            }
            const k = msg && (msg.k || (msg.data && msg.data.k))
            if (!k) return
            onBar({
              time: Math.floor(k.t / 1000),
              open: Number(k.o),
              high: Number(k.h),
              low: Number(k.l),
              close: Number(k.c),
              volume: Number(k.v),
            })
          }
        } catch (err) {
          onNote && onNote(`ws: ${err.message || err}`)
        }
        return () => {
          closed = true
          try {
            ws && ws.close()
          } catch (_) {}
          void closed
        }
      }

      const timer = setInterval(async () => {
        try {
          const tail = await load(req.symbol, interval, 2)
          const last = tail[tail.length - 1]
          if (last) onBar(last)
        } catch (_) {}
      }, POLL_MS)
      return () => clearInterval(timer)
    },

    async searchSymbols({ query }) {
      const q = String(query || '').toUpperCase()
      const list = q
        ? [...new Set([...BASES, q.replace(/[^A-Z0-9]/g, '')])].filter((s) => s.includes(q))
        : BASES
      return list.slice(0, 50).map((symbol) => ({
        symbol,
        exchange: src.exchange,
        name: `${symbol} perp`,
        assetClass: 'Cripto',
      }))
    },
  }
}

// ── widget ─────────────────────────────────────────────────────────────────
function TerminalView(props) {
  const { sourceId, onNote } = props
  const boxRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return undefined
    let widget = null
    // Container próprio: nada de innerHTML (o widget monta e desmonta o subtree dele;
    // aqui só anexamos e removemos um filho, sem injetar marcação).
    const mount = document.createElement('div')
    mount.style.cssText = 'flex:1;min-height:0;display:flex;position:relative'
    el.appendChild(mount)
    try {
      widget = createWidget(mount, {
        feed: makeFeed(sourceId, onNote),
        symbol: 'BTC',
        exchange: sourceOf(sourceId).exchange,
        interval: '15m',
        intervals: INTERVALS,
        chartType: 'candlestick',
        theme: 'dark',
        timezone: 'America/Sao_Paulo',
        panels: true,
        shortcutsEditor: true,
      })
      if (widget.ready && typeof widget.ready.then === 'function') {
        widget.ready
          .then(() => onNote && onNote('pronto'))
          .catch((err) => setError(String((err && err.message) || err)))
      }
    } catch (err) {
      setError(String((err && err.message) || err))
      return undefined
    }
    return () => {
      try {
        widget && widget.destroy()
      } catch (_) {}
      try {
        mount.remove()
      } catch (_) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId])

  if (error) {
    return jsxs('div', {
      style: { padding: 16, fontSize: 12, lineHeight: 1.6, color: 'var(--ui-text-secondary)' },
      children: [
        jsx('div', {
          style: { color: 'var(--ui-red, #e5484d)', fontWeight: 600, marginBottom: 6 },
          children: 'Widget do gráfico não montou',
        }),
        jsx('pre', {
          style: { whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'var(--ui-font-mono, monospace)' },
          children: error,
        }),
      ],
    })
  }

  return jsx('div', {
    ref: boxRef,
    style: { flex: 1, minHeight: 0, position: 'relative', display: 'flex' },
  })
}

// ── página ─────────────────────────────────────────────────────────────────
function OpenAlgoPage(props) {
  const { storage } = props
  const [sourceId, setSourceId] = useState(() => {
    try {
      const saved = storage.get(STORAGE_SOURCE, null)
      if (saved && SOURCES.some((s) => s.id === saved)) return saved
    } catch (_) {}
    return 'binance'
  })
  const [note, setNote] = useState('')

  const pickSource = useCallback(
    (id) => {
      setSourceId(id)
      try {
        storage.set(STORAGE_SOURCE, id)
      } catch (_) {}
    },
    [storage],
  )

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
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderBottom: '1px solid var(--ui-stroke-secondary)',
        },
        children: [
          jsx('span', {
            style: { fontSize: 11, color: 'var(--ui-text-quaternary)' },
            children: 'fonte',
          }),
          ...SOURCES.map((s) =>
            jsx(
              'button',
              {
                key: s.id,
                onClick: () => pickSource(s.id),
                style: segStyle(s.id === sourceId),
                children: s.label,
              },
              s.id,
            ),
          ),
          jsx('span', {
            style: { marginLeft: 'auto', fontSize: 10, color: 'var(--ui-text-quaternary)' },
            children: note,
          }),
        ],
      }),
      jsx('div', {
        style: { flex: 1, minHeight: 0, position: 'relative', display: 'flex' },
        children: jsx(TerminalView, { sourceId, onNote: setNote }),
      }),
    ],
  })
}

// ── chip na barra de informações ───────────────────────────────────────────
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
          label: 'OpenAlgo Charts: abrir terminal de gráfico',
          keywords: ['openalgo', 'chart', 'grafico', 'candles', 'binance', 'hyperliquid', 'aster'],
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

// Button mantido no import para o lint de superfície (uso opcional futuro)
void Button
