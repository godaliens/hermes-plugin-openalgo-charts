// Stub mínimo do @hermes/plugin-sdk para o smoke test fora do app.
// Não é o SDK real: só o suficiente para o bundle avaliar, registrar e renderizar.
import { useSyncExternalStore, createElement } from 'react'

function makeAtom(initial) {
  let value = initial
  const subs = new Set()
  return {
    get: () => value,
    set: (next) => {
      value = next
      subs.forEach((fn) => fn())
    },
    subscribe: (fn) => {
      subs.add(fn)
      return () => subs.delete(fn)
    },
  }
}

export const atom = makeAtom
export function useValue(a) {
  return useSyncExternalStore(a.subscribe, a.get, a.get)
}

export const ROUTES_AREA = 'routes'
export const SIDEBAR_NAV_AREA = 'sidebarNav'
export const PALETTE_AREA = 'palette'
export const STATUSBAR_AREAS = { left: 'statusBar.left', right: 'statusBar.right' }

const notifications = []
export const host = {
  notify: (n) => notifications.push(n),
  navigate: (p) => notifications.push({ kind: 'navigate', message: p }),
  // ctx.storage é SINCRONO no SDK real: get(chave, default) devolve valor, set() retorna void.
  // Modelar como Promise aqui escondeu um bug real ("Cannot read properties of undefined (reading 'then')").
  storage: {
    _d: {},
    get(k, dflt = null) {
      return k in this._d ? this._d[k] : dflt
    },
    set(k, v) {
      this._d[k] = v
    },
    remove(k) {
      delete this._d[k]
    },
  },
  _notifications: notifications,
}

const simple = (tag) => (props) => {
  const { children, ...rest } = props || {}
  const clean = {}
  for (const [k, v] of Object.entries(rest)) {
    if (['onClick', 'onChange', 'onKeyDown', 'title', 'value', 'placeholder', 'style', 'size'].includes(k)) {
      clean[k] = v
    }
  }
  return createElement(tag, clean, children)
}

export const Badge = simple('span')
export const Button = simple('button')
export const Input = simple('input')
