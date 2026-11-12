// src/plugin.js
import { useCallback, useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
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
  useValue
} from "@hermes/plugin-sdk";

// vendor/openalgo-charts.mjs
var i = { None: 0, Cursor: 1, Light: 2, Full: 3 };
var s = class {
  constructor(e = i.None) {
    Object.defineProperty(this, "_globalLevel", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_panes", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_timeScaleOps", { enumerable: true, configurable: true, writable: true, value: [] }), this._globalLevel = e;
  }
  get globalLevel() {
    return this._globalLevel;
  }
  invalidateGlobal(e) {
    e > this._globalLevel && (this._globalLevel = e);
  }
  invalidatePane(e, t) {
    var i2, s2;
    this._panes.set(e, (i2 = this._panes.get(e), s2 = t, void 0 === i2 ? { ...s2 } : { level: Math.max(i2.level, s2.level), autoScale: i2.autoScale || s2.autoScale }));
  }
  paneInvalidation(e) {
    return this._panes.get(e);
  }
  panes() {
    return this._panes;
  }
  addTimeScaleOp(e) {
    this._timeScaleOps.push(e);
  }
  timeScaleOps() {
    return this._timeScaleOps;
  }
  isEmpty() {
    return this._globalLevel === i.None && 0 === this._panes.size && 0 === this._timeScaleOps.length;
  }
  merge(e) {
    this.invalidateGlobal(e._globalLevel);
    for (const [t, i2] of e._panes) this.invalidatePane(t, i2);
    e._timeScaleOps.length > 0 && (this._timeScaleOps = this._timeScaleOps.concat(e._timeScaleOps));
  }
};
var r = () => {
};
var n = class {
  constructor(e, t, i2 = r) {
    Object.defineProperty(this, "_onFrame", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_schedule", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_cancel", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_handle", { enumerable: true, configurable: true, writable: true, value: null }), this._onFrame = e, this._schedule = t, this._cancel = i2;
  }
  get scheduled() {
    return null !== this._handle;
  }
  requestFrame() {
    if (null !== this._handle) return;
    this._handle = -1;
    const e = this._schedule(() => {
      this._handle = null, this._onFrame();
    });
    null !== this._handle && (this._handle = e);
  }
  stop() {
    null !== this._handle && (this._cancel(this._handle), this._handle = null);
  }
};
function o(e, t, i2) {
  return e < t ? t : e > i2 ? i2 : e;
}
function l(e, t) {
  return t <= 0 ? e : Math.round(e / t) * t;
}
function h(e, t, i2) {
  return { width: Math.round(e * i2), height: Math.round(t * i2) };
}
function c(e, t) {
  return Math.round(e * t) / t;
}
var d = class {
  constructor(e, t) {
    Object.defineProperty(this, "element", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "ctx", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_mediaWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_mediaHeight", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_dpr", { enumerable: true, configurable: true, writable: true, value: 1 }), Object.defineProperty(this, "_deviceWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_deviceHeight", { enumerable: true, configurable: true, writable: true, value: 0 }), this.element = e.createElement("canvas");
    const i2 = this.element.getContext("2d");
    if (null === i2) throw new Error("openalgo-charts: 2D canvas context is not available");
    this.ctx = i2;
    const s2 = this.element.style;
    s2.position = "absolute", s2.top = "0", s2.left = "0", s2.width = "100%", s2.height = "100%", s2.zIndex = String(t);
  }
  get mediaWidth() {
    return this._mediaWidth;
  }
  get mediaHeight() {
    return this._mediaHeight;
  }
  get pixelRatio() {
    return this._dpr;
  }
  resize(e, t, i2) {
    if (e === this._mediaWidth && t === this._mediaHeight && i2 === this._dpr) return;
    this._mediaWidth = e, this._mediaHeight = t, this._dpr = i2;
    const s2 = h(e, t, i2);
    this.element.width = this._snapsTo(this._deviceWidth, e * i2) ?? s2.width, this.element.height = this._snapsTo(this._deviceHeight, t * i2) ?? s2.height, this.element.style.width = `${e}px`, this.element.style.height = `${t}px`;
  }
  setDeviceSize(e, t) {
    const i2 = this._reported(e, this._mediaWidth * this._dpr), s2 = this._reported(t, this._mediaHeight * this._dpr);
    return null === i2 || null === s2 ? (this.forgetDeviceSize(), false) : (this._deviceWidth = i2, this._deviceHeight = s2, (this.element.width !== i2 || this.element.height !== s2) && (this.element.width = i2, this.element.height = s2, true));
  }
  forgetDeviceSize() {
    this._deviceWidth = 0, this._deviceHeight = 0;
  }
  _reported(e, t) {
    return Number.isInteger(e) && e > 0 && Math.abs(e - t) <= 1 ? e : null;
  }
  _snapsTo(e, t) {
    return e > 0 && Math.abs(e - t) < 1 ? e : null;
  }
  clearBitmap() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0), this.ctx.clearRect(0, 0, this.element.width, this.element.height);
  }
};
function u(e) {
  const t = Math.floor(Math.log10(e)), i2 = e / Math.pow(10, t);
  for (const e2 of [1, 2, 2.5, 5]) if (e2 > i2 * (1 + 1e-9)) return e2 * Math.pow(10, t);
  return 10 * Math.pow(10, t);
}
function _(e, t, i2) {
  const s2 = Math.ceil(e / i2) * i2, r2 = Math.floor(t / i2) * i2;
  return Math.round((r2 - s2) / i2) + 1;
}
function p(e, t, i2 = 6) {
  if (!isFinite(e) || !isFinite(t) || t <= e) return [Number.isFinite(e) ? e : 0];
  let s2 = function(e2) {
    if (e2 <= 0) return 0;
    const t2 = Math.floor(Math.log10(e2)), i3 = e2 / Math.pow(10, t2);
    let s3;
    return s3 = i3 < 1.5 ? 1 : i3 < 3 ? 2 : i3 < 7 ? 5 : 10, s3 * Math.pow(10, t2);
  }((t - e) / Math.max(1, i2 - 1));
  if (!(s2 > 0)) return [e];
  for (let r3 = 0; r3 < 20 && _(e, t, s2) > i2; r3++) s2 = u(s2);
  const r2 = Math.ceil(e / s2) * s2, n2 = Math.floor(t / s2) * s2, o2 = [], a = Math.round((n2 - r2) / s2) + 1;
  for (let e2 = 0; e2 < a && e2 < 1e3; e2++) {
    const t2 = r2 + e2 * s2;
    o2.push(Math.abs(t2) < s2 / 1e6 ? 0 : t2);
  }
  return o2;
}
function f(e) {
  return e <= 0 || !isFinite(e) ? 2 : e >= 1 ? 0 : Math.min(8, Math.ceil(-Math.log10(e)));
}
var m = ["linear", "logarithmic", "percentage", "indexed-to-100"];
function b(e) {
  return "percentage" === e || "indexed-to-100" === e;
}
var g = { marginTop: 0.1, marginBottom: 0.1, minMove: 0, minPrecision: 0, mode: "linear", inverted: false };
function v(e, t, i2, s2) {
  if (!isFinite(e) || !isFinite(t)) return { min: 0, max: 1 };
  if (t <= e) {
    const i3 = Math.abs(t) > 0 ? 0.05 * Math.abs(t) : 0.5;
    return { min: e - i3, max: t + i3 };
  }
  const r2 = (t - e) / Math.max(1 - i2 - s2, 0.01);
  return { min: e - r2 * s2, max: t + r2 * i2 };
}
function y(e, t, i2, s2, r2) {
  if (!("logarithmic" === e && t > 0 && i2 > t && isFinite(i2))) return v(t, i2, s2, r2);
  const n2 = v(Math.log10(t), Math.log10(i2), s2, r2);
  return { min: Math.pow(10, n2.min), max: Math.pow(10, n2.max) };
}
var w = class {
  constructor(e = {}) {
    Object.defineProperty(this, "_options", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_height", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_min", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_max", { enumerable: true, configurable: true, writable: true, value: 1 }), Object.defineProperty(this, "_autoScale", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "_scaled", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_baseline", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_fixedRange", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_fixedRangeOwner", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_manualRangeOverride", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_priceFormatter", { enumerable: true, configurable: true, writable: true, value: null }), this._options = { ...g, ...e };
  }
  get options() {
    return this._options;
  }
  setOptions(e) {
    this._options = { ...this._options, ...e }, b(this._options.mode) || (this._baseline = null);
  }
  setHeight(e) {
    this._height = e;
  }
  get height() {
    return this._height;
  }
  setPriceRange(e) {
    this._manualRangeOverride = true, this._writePriceRange(e);
  }
  setComputedRange(e) {
    this._writePriceRange(e);
  }
  _writePriceRange(e) {
    this._min = e.min, this._max = e.max, this._scaled = true;
  }
  get scaled() {
    return this._scaled;
  }
  setBaseline(e) {
    this._baseline = e;
  }
  get baseline() {
    return this._baseline;
  }
  priceRange() {
    return { min: this._min, max: this._max };
  }
  get autoScale() {
    return this._autoScale;
  }
  setAutoScale(e) {
    this._manualRangeOverride = !e, e && null !== this._fixedRange ? this._writePriceRange(this._fixedRange) : this._autoScale = e;
  }
  setFixedRange(e) {
    this._fixedRangeOwner = null, this._fixedRange = null === e ? null : { ...e }, null !== e && (this._manualRangeOverride = true, this._autoScale = false, this._writePriceRange(e));
  }
  setOwnedFixedRange(e, t) {
    return this._fixedRangeOwner === e && this._manualRangeOverride ? (this._fixedRange = { ...t }, true) : !(this._manualRangeOverride || !(this._fixedRangeOwner === e || null === this._fixedRange && this._autoScale)) && (this._fixedRangeOwner = e, this._fixedRange = { ...t }, this._autoScale = false, this._writePriceRange(t), true);
  }
  clearOwnedFixedRange(e) {
    return !!this.ownsFixedRange(e) && (this._fixedRangeOwner = null, this._fixedRange = null, this._manualRangeOverride || (this._autoScale = true), true);
  }
  ownsFixedRange(e) {
    return this._fixedRangeOwner === e && null !== this._fixedRange;
  }
  ownedFixedRangeState(e) {
    return this.ownsFixedRange(e) ? { manual: this._manualRangeOverride } : null;
  }
  hasConfiguration() {
    return this._manualRangeOverride || null !== this._fixedRange || null !== this._priceFormatter || Object.keys(g).some((e) => this._options[e] !== g[e]);
  }
  get fixedRange() {
    return null === this._fixedRange ? null : { ...this._fixedRange };
  }
  reset() {
    this._autoScale && (this._min = 0, this._max = 1, this._scaled = false, this._baseline = null);
  }
  scaleAroundCenter(e) {
    this._manualRangeOverride = true;
    const t = (this._min + this._max) / 2, i2 = (this._max - this._min) / 2 * e;
    this._min = t - i2, this._max = t + i2, this._autoScale = false;
  }
  scaleAtY(e, t) {
    if (!this._scaled || this._height <= 0 || !Number.isFinite(t) || t <= 0) return;
    const i2 = this._t(this._min), s2 = this._t(this._max), r2 = this._t(this.yToPrice(e)), n2 = this._tInv(r2 + (i2 - r2) * t), o2 = this._tInv(r2 + (s2 - r2) * t);
    Number.isFinite(n2) && Number.isFinite(o2) && o2 > n2 && (this.setPriceRange({ min: n2, max: o2 }), this._autoScale = false);
  }
  panByPixels(e) {
    if (this._height <= 0 || 0 === e) return;
    const t = this._t(this._min), i2 = this._t(this._max), s2 = i2 - t;
    if (!(s2 > 0)) return;
    const r2 = s2 * ((this._options.inverted ? -e : e) / this._height);
    this._min = this._tInv(t + r2), this._max = this._tInv(i2 + r2), this._manualRangeOverride = true, this._autoScale = false;
  }
  autoscale(e, t, i2 = 1) {
    if (null !== this._fixedRange) return this._writePriceRange(this._fixedRange), false;
    const s2 = y(this._options.mode, e, t, this._options.marginTop, this._options.marginBottom), r2 = this._t(this._min), n2 = this._t(this._max), a = this._t(s2.min), l2 = this._t(s2.max), h2 = n2 - r2, c2 = l2 - a, d2 = Math.max(Math.abs((a - r2) / h2), Math.abs((l2 - n2) / h2)) * this._height;
    if (!this._scaled || i2 >= 1 || !Number.isFinite(i2) || !(h2 > 0) || !(c2 > 0) || d2 < 0.1) return this._writePriceRange(s2), false;
    const u2 = o(i2, 0, 1), _3 = (1 - u2) / h2 + u2 / c2, p2 = ((1 - u2) * r2 / h2 + u2 * a / c2) / _3;
    return this._writePriceRange({ min: this._tInv(p2), max: this._tInv(p2 + 1 / _3) }), true;
  }
  _rebase() {
    const e = this._options.mode;
    if ("percentage" !== e && "indexed-to-100" !== e) return null;
    const t = this._baseline;
    return null !== t && isFinite(t) && t > 0 ? t : null;
  }
  _t(e) {
    if ("logarithmic" === this._options.mode) return Math.log10(Math.max(1e-10, e));
    const t = this._rebase();
    if (null === t) return e;
    const i2 = e / t * 100;
    return "percentage" === this._options.mode ? i2 - 100 : i2;
  }
  _tInv(e) {
    if ("logarithmic" === this._options.mode) return Math.pow(10, e);
    const t = this._rebase();
    return null === t ? e : ("percentage" === this._options.mode ? e + 100 : e) * t / 100;
  }
  priceToY(e) {
    const t = this._t(this._min), i2 = this._t(this._max) - t;
    if (i2 <= 0) return this._height / 2;
    const s2 = (this._t(e) - t) / i2;
    return this._options.inverted ? this._height * s2 : this._height * (1 - s2);
  }
  yToPrice(e) {
    const t = this._t(this._min), i2 = this._t(this._max) - t, s2 = this._options.inverted ? e / this._height : 1 - e / this._height;
    return this._tInv(t + s2 * i2);
  }
  precision() {
    if (null !== this._rebase()) return Math.max(2, f((this._t(this._max) - this._t(this._min)) / 100));
    if (this._options.minMove > 0) return f(this._options.minMove);
    const e = f((this._max - this._min) / 100), t = Math.max(Math.abs(this._min), Math.abs(this._max));
    return !Number.isFinite(t) || t >= 1e4 ? e : Math.max(this._options.minPrecision, e);
  }
  ticks(e = 6) {
    return null === this._rebase() ? p(this._min, this._max, e) : p(this._t(this._min), this._t(this._max), e).map((e2) => this._tInv(e2));
  }
  snapToTick(e) {
    const t = this._options.minMove;
    return t <= 0 ? e : Math.round(e / t) * t;
  }
  setPriceFormatter(e) {
    this._priceFormatter = e;
  }
  format(e) {
    if (null !== this._rebase()) {
      const t = this.precision(), i2 = this._t(e);
      if ("indexed-to-100" === this._options.mode) return i2.toFixed(t);
      const s2 = Number(i2.toFixed(t));
      return `${s2 > 0 ? "+" : ""}${(0 === s2 ? 0 : i2).toFixed(t)}%`;
    }
    return null !== this._priceFormatter ? this._priceFormatter(e) : e.toFixed(this.precision());
  }
  clampY(e) {
    return o(e, 0, this._height);
  }
};
var x = { barSpacing: 8, minBarSpacing: 1, maxBarSpacing: 80, rightOffset: 4 };
var S = class {
  constructor(e = {}) {
    Object.defineProperty(this, "_barSpacing", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_rightOffset", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_minBarSpacing", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_maxBarSpacing", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_width", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_baseIndex", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_onChange", { enumerable: true, configurable: true, writable: true, value: null });
    const t = { ...x, ...e };
    this._barSpacing = t.barSpacing, this._rightOffset = t.rightOffset, this._minBarSpacing = t.minBarSpacing, this._maxBarSpacing = t.maxBarSpacing;
  }
  setWidth(e) {
    this._width = e;
  }
  get width() {
    return this._width;
  }
  get barSpacing() {
    return this._barSpacing;
  }
  setBarSpacing(e) {
    const t = this.visibleRange();
    this._barSpacing = this.constrainBarSpacing(e), this._notifyChange(t);
  }
  constrainBarSpacing(e) {
    return o(e, this._minBarSpacing, this._maxBarSpacing);
  }
  get rightOffset() {
    return this._rightOffset;
  }
  setRightOffset(e) {
    const t = this.visibleRange();
    this._rightOffset = e, this._notifyChange(t);
  }
  setBaseIndex(e) {
    this._baseIndex = e;
  }
  _rightEdgeIndex() {
    return this._baseIndex + this._rightOffset;
  }
  indexToX(e) {
    return this._width - (this._rightEdgeIndex() - e) * this._barSpacing;
  }
  xToIndex(e) {
    return this._rightEdgeIndex() - (this._width - e) / this._barSpacing;
  }
  visibleRange() {
    const e = this._rightEdgeIndex();
    return { from: e - this._width / this._barSpacing, to: e };
  }
  getVisibleLogicalRange() {
    return this.visibleRange();
  }
  setVisibleLogicalRange(e) {
    if (this._width <= 0) return;
    const t = e.to - e.from;
    if (!(t > 0)) return;
    const i2 = this.visibleRange();
    this._barSpacing = this.constrainBarSpacing(this._width / t), this._rightOffset = e.to - this._baseIndex, this._onChange?.(i2);
  }
  setChangeHandler(e) {
    this._onChange = e;
  }
  _notifyChange(e) {
    const t = this.visibleRange();
    e.from === t.from && e.to === t.to || this._onChange?.(e);
  }
  scrollByPixels(e) {
    this.setRightOffset(this._rightOffset - e / this._barSpacing);
  }
  zoomAtX(e, t) {
    const i2 = this.visibleRange(), s2 = this.xToIndex(e), r2 = this._barSpacing;
    if (this._barSpacing = this.constrainBarSpacing(r2 * t), this._barSpacing === r2) return;
    const n2 = s2 + (this._width - e) / this._barSpacing;
    this._rightOffset = n2 - this._baseIndex, this._notifyChange(i2);
  }
  fitContent(e) {
    if (e <= 0 || this._width <= 0) return;
    const t = this.visibleRange();
    this._baseIndex = e - 1, this._rightOffset = x.rightOffset;
    const i2 = this._width / (e + this._rightOffset);
    this._barSpacing = this.constrainBarSpacing(i2), this._notifyChange(t);
  }
};
var P = 86400;
function O(e) {
  return e.sort((e2, t) => e2 - t), e[e.length - 1 >> 1];
}
function k(e, t, i2) {
  let s2 = 0;
  for (; s2 < i2; ) {
    const r2 = s2 + i2 + 1 >> 1;
    e[r2] <= t ? s2 = r2 : i2 = r2 - 1;
  }
  return s2;
}
function I(e) {
  const t = e.slots, i2 = t.length - 1;
  let s2 = NaN;
  if (i2 < 4096) try {
    s2 = e.next();
  } catch {
    s2 = null;
  }
  null !== s2 && s2 > t[i2] ? t.push(s2) : (e.next = null, null !== s2 && Number.isNaN(s2) && i2 > 0 && (e.step = (t[i2] - t[0]) / i2));
}
function M(e, t) {
  const i2 = e.slots;
  for (; i2.length <= t && e.next; ) I(e);
  const s2 = i2.length - 1;
  return t <= s2 ? i2[t] : i2[s2] + (t - s2) * e.step;
}
var T = [];
function C(e, t, i2, s2, r2) {
  const n2 = Math.max(0, Math.floor(i2)), o2 = Math.min(e.baseIndex, Math.ceil(s2));
  if (o2 < n2 || 0 === t.length) return false;
  const a = e.indexToTime(n2), l2 = e.indexToTime(o2);
  if (void 0 === a || void 0 === l2) return false;
  let h2 = 0, c2 = t.length;
  for (; h2 < c2; ) {
    const e2 = h2 + c2 >> 1;
    t[e2].time < a ? h2 = e2 + 1 : c2 = e2;
  }
  return r2.start = h2, r2.lastTime = l2, true;
}
var j = { start: 0, lastTime: 0 };
function A(e, t, i2) {
  const s2 = e.seriesBars(t);
  if (C(e, s2, i2, i2, j)) for (let t2 = j.start; t2 < s2.length; t2++) {
    const i3 = s2[t2];
    if (i3.time > j.lastTime) return;
    if (void 0 !== e.timeToIndex(i3.time)) return i3;
  }
}
var L = class {
  constructor() {
    Object.defineProperty(this, "_series", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_sortedTimes", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_indexByTime", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_timeRefs", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_nextId", { enumerable: true, configurable: true, writable: true, value: 1 }), Object.defineProperty(this, "_version", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_calendar", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_future", { enumerable: true, configurable: true, writable: true, value: null });
  }
  setSessionCalendar(e) {
    this._calendar = e, this._future = null;
  }
  get sessionCalendar() {
    return this._calendar;
  }
  createSeries() {
    const e = this._nextId++;
    return this._series.set(e, { bars: [] }), e;
  }
  removeSeries(e) {
    const t = this._series.get(e);
    void 0 !== t && (this._replaceBars(t, []), this._series.delete(e));
  }
  setSeriesData(e, t) {
    const i2 = this._series.get(e);
    if (void 0 === i2) throw new Error(`openalgo-charts: unknown series ${e}`);
    this._replaceBars(i2, function(e2) {
      let t2 = true;
      for (let i4 = 1; i4 < e2.length && t2; i4++) t2 = e2[i4].time > e2[i4 - 1].time;
      if (t2) return e2.slice();
      const i3 = e2.slice().sort((e3, t3) => e3.time - t3.time);
      let s2 = 0;
      for (let e3 = 0; e3 < i3.length; e3++) s2 > 0 && i3[e3].time === i3[s2 - 1].time ? i3[s2 - 1] = i3[e3] : i3[s2++] = i3[e3];
      return i3.length = s2, i3;
    }(t));
  }
  addBars(e, t) {
    const i2 = this._series.get(e);
    if (void 0 === i2) throw new Error(`openalgo-charts: unknown series ${e}`);
    if (0 === t.length) return;
    const s2 = /* @__PURE__ */ new Map();
    for (const e2 of i2.bars) s2.set(e2.time, e2);
    for (const e2 of t) s2.set(e2.time, e2);
    this._replaceBars(i2, Array.from(s2.values()).sort((e2, t2) => e2.time - t2.time));
  }
  update(e, t) {
    const i2 = this._series.get(e);
    if (void 0 === i2) throw new Error(`openalgo-charts: unknown series ${e}`);
    const s2 = i2.bars, r2 = s2[s2.length - 1];
    if (void 0 === r2 || t.time > r2.time) {
      s2.push(t);
      const e2 = this._sortedTimes.length, i3 = e2 > 0 ? this._sortedTimes[e2 - 1] : void 0, r3 = this._retain(t.time);
      return void 0 === i3 || t.time > i3 ? (this._appendTime(t.time), "append") : r3 ? (this._rebuild([t.time], false), "insert") : "replace";
    }
    if (t.time === r2.time) return s2[s2.length - 1] = t, "replace";
    const n2 = function(e2, t2) {
      let i3 = 0, s3 = e2.length - 1;
      for (; i3 <= s3; ) {
        const r3 = i3 + s3 >> 1, n3 = e2[r3].time;
        if (n3 === t2) return r3;
        if (n3 < t2) i3 = r3 + 1;
        else {
          if (!(n3 > t2)) break;
          s3 = r3 - 1;
        }
      }
      return e2.findIndex((e3) => e3.time === t2);
    }(s2, t.time);
    return n2 >= 0 ? (s2[n2] = t, "replace") : (this.addBars(e, [t]), "insert");
  }
  _appendTime(e) {
    this._indexByTime.has(e) || (this._indexByTime.set(e, this._sortedTimes.length), this._sortedTimes.push(e), this._version++);
  }
  get length() {
    return this._sortedTimes.length;
  }
  get baseIndex() {
    return this._sortedTimes.length - 1;
  }
  indexToTime(e) {
    return this._sortedTimes[e];
  }
  timeToIndex(e) {
    return this._indexByTime.get(e);
  }
  indexToTimeFloat(e) {
    const t = this._sortedTimes, i2 = t.length;
    if (0 === i2) return NaN;
    if (1 === i2) return t[0];
    if (e <= 0) return t[0] + e * (t[1] - t[0]);
    if (e >= i2 - 1) {
      const t2 = this._plan(), s3 = e - (i2 - 1), r2 = Math.floor(s3), n2 = M(t2, r2);
      return s3 === r2 ? n2 : n2 + (s3 - r2) * (M(t2, r2 + 1) - n2);
    }
    const s2 = Math.floor(e);
    return t[s2] + (e - s2) * (t[s2 + 1] - t[s2]);
  }
  timeToIndexFloat(e) {
    const t = this._sortedTimes, i2 = t.length;
    if (0 === i2) return NaN;
    if (1 === i2) return 0;
    if (e <= t[0]) {
      const i3 = t[1] - t[0];
      return i3 > 0 ? (e - t[0]) / i3 : 0;
    }
    if (e >= t[i2 - 1]) {
      const t2 = this._plan(), s3 = t2.slots;
      for (; t2.next && s3[s3.length - 1] <= e; ) I(t2);
      const r2 = s3.length - 1;
      if (e >= s3[r2]) return i2 - 1 + r2 + (e - s3[r2]) / t2.step;
      const n2 = k(s3, e, r2);
      return i2 - 1 + n2 + (e - s3[n2]) / (s3[n2 + 1] - s3[n2]);
    }
    const s2 = k(t, e, i2 - 1);
    return s2 + (e - t[s2]) / (t[s2 + 1] - t[s2]);
  }
  _plan() {
    const e = this._sortedTimes, t = Math.max(0, e.length - 1 - 64);
    let i2 = this._future;
    if (null !== i2 && i2.version !== this._version && i2.tail.length === e.length - t && i2.tail.every((i3, s2) => i3 === e[t + s2]) && (i2.version = this._version), null === i2 || i2.version !== this._version) {
      const s2 = e.slice(t), r2 = O(function(e2) {
        const t2 = [];
        for (let i3 = 1; i3 < e2.length; i3++) t2.push(e2[i3] - e2[i3 - 1]);
        return t2;
      }(s2));
      let n2 = null;
      try {
        this._calendar && (n2 = function(e2, t2, i3) {
          let s3 = 0;
          const r3 = (e3) => ++s3 > 512 ? void 0 : t2.sessionFrom(e3);
          let n3 = r3(e2[0]);
          if (!n3) return null;
          const o2 = [], a = [n3.open];
          let l2 = n3.open - e2[0];
          for (let t3 = 1; t3 < e2.length; t3++) {
            if (e2[t3] < n3.close) o2.push(e2[t3] - e2[t3 - 1]);
            else if (!(n3 = r3(e2[t3]))) return null;
            a.push(n3.open), l2 = Math.max(l2, n3.open - e2[t3]);
          }
          const h2 = e2[e2.length - 1];
          let c2 = n3, d2 = h2;
          if (o2.length > 0) {
            const t3 = O(o2);
            if (l2 >= t3) return null;
            const i4 = (e3, i5) => {
              const s5 = ((e3 - i5) % t3 + t3) % t3;
              return s5 > 1e-6 && t3 - s5 > 1e-6 ? s5 - t3 : 0;
            }, s4 = /* @__PURE__ */ new Map();
            for (let t4 = 0; t4 < e2.length; t4++) s4.set(a[t4] % P, i4(e2[t4], a[t4]));
            const n4 = i4(h2, c2.open);
            return () => {
              let e3 = d2 + t3;
              for (; e3 >= c2.close; ) {
                const t4 = r3(c2.close);
                if (!t4) return null === t4 ? null : NaN;
                c2 = t4;
                const i5 = t4.open + (s4.get(t4.open % P) ?? n4);
                i5 > d2 && (e3 = i5);
              }
              return d2 = e3;
            };
          }
          if (i3 >= 172800 || l2 >= P) return null;
          const u2 = h2 - c2.open;
          return () => {
            for (const e4 = c2.date; c2.date === e4; ) {
              const e5 = r3(c2.close);
              if (!e5) return null === e5 ? null : NaN;
              c2 = e5;
            }
            const e3 = c2.open + u2;
            return e3 > d2 ? d2 = e3 : null;
          };
        }(s2, this._calendar, r2));
      } catch {
      }
      i2 = this._future = { version: this._version, tail: s2, slots: [s2[s2.length - 1]], next: n2, step: r2 };
    }
    return i2;
  }
  seriesBars(e) {
    return this._series.get(e)?.bars ?? T;
  }
  indexedBars(e) {
    const t = this._series.get(e);
    if (void 0 === t) return [];
    const i2 = [];
    for (const e2 of t.bars) {
      const t2 = this._indexByTime.get(e2.time);
      void 0 !== t2 && i2.push({ index: t2, bar: e2 });
    }
    return i2;
  }
  visibleBars(e, t, i2) {
    const s2 = this._series.get(e);
    if (void 0 === s2) return [];
    const r2 = s2.bars;
    if (!C(this, r2, t, i2, j)) return [];
    const n2 = [];
    for (let e2 = j.start; e2 < r2.length; e2++) {
      const t2 = r2[e2].time;
      if (t2 > j.lastTime) break;
      const i3 = this._indexByTime.get(t2);
      void 0 !== i3 && n2.push({ index: i3, bar: r2[e2] });
    }
    return n2;
  }
  lastIndexedBar(e) {
    const t = this._series.get(e);
    if (void 0 === t || 0 === t.bars.length) return null;
    const i2 = t.bars[t.bars.length - 1], s2 = this._indexByTime.get(i2.time);
    return void 0 === s2 ? null : { index: s2, bar: i2 };
  }
  _retain(e) {
    const t = this._timeRefs.get(e) ?? 0;
    return this._timeRefs.set(e, t + 1), 0 === t;
  }
  _replaceBars(e, t) {
    const i2 = e.bars;
    e.bars = t;
    let s2 = 0;
    for (; s2 < i2.length && s2 < t.length && i2[s2].time === t[s2].time; ) s2++;
    let r2 = null;
    for (let e2 = s2; e2 < t.length; e2++) this._retain(t[e2].time) && (r2 ?? (r2 = [])).push(t[e2].time);
    let n2 = false;
    for (let e2 = s2; e2 < i2.length; e2++) {
      const t2 = i2[e2].time, s3 = this._timeRefs.get(t2) ?? 0;
      s3 <= 1 ? (this._timeRefs.delete(t2), n2 = true) : this._timeRefs.set(t2, s3 - 1);
    }
    if (null === r2 && !n2) return;
    const o2 = this._sortedTimes.length > 0 ? this._sortedTimes[this._sortedTimes.length - 1] : -1 / 0;
    if (!n2 && null !== r2 && r2[0] > o2) for (const e2 of r2) this._appendTime(e2);
    else this._rebuild(r2 ?? [], n2);
  }
  _rebuild(e = [], t = true) {
    const i2 = this._sortedTimes;
    if (e.some(Number.isNaN) || i2.some(Number.isNaN)) {
      const e2 = Array.from(this._timeRefs.keys()).sort((e3, t2) => e3 - t2);
      this._indexByTime.clear();
      for (let t2 = 0; t2 < e2.length; t2++) this._indexByTime.set(e2[t2], t2);
      return this._sortedTimes = e2, void this._version++;
    }
    const s2 = [];
    let r2 = 0, n2 = 0;
    for (; r2 < i2.length || n2 < e.length; ) if (n2 >= e.length || r2 < i2.length && i2[r2] < e[n2]) {
      const e2 = i2[r2++];
      !t || this._timeRefs.has(e2) ? s2.push(e2) : this._indexByTime.delete(e2);
    } else s2.push(e[n2++]);
    let o2 = 0;
    for (; o2 < s2.length && o2 < i2.length && s2[o2] === i2[o2]; ) o2++;
    for (let e2 = o2; e2 < s2.length; e2++) this._indexByTime.set(s2[e2], e2);
    this._sortedTimes = s2, this._version++;
  }
};
function N(e) {
  return "string" == typeof e && ("right" === e || "left" === e || "" === e || e.startsWith("overlay:"));
}
var R = ["left", "right", "hidden"];
function F(e) {
  return "left" === e || "right" === e ? e : "hidden";
}
var z = class {
  constructor() {
    Object.defineProperty(this, "_configured", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_placements", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map([["right", { side: "right", order: 0 }]]) });
  }
  register(e) {
    N(e) && !this._placements.has(e) && this._placements.set(e, this.get(e));
  }
  get(e) {
    const t = this._placements.get(e);
    if (t) return { ...t };
    const i2 = F(e);
    let s2 = 0;
    for (const e2 of this._placements.values()) e2.side === i2 && s2++;
    return { side: i2, order: s2 };
  }
  set(e, t, i2) {
    if (!N(e) || !R.includes(t) || void 0 !== i2 && (!Number.isSafeInteger(i2) || i2 < 0)) return false;
    const s2 = this.get(e), r2 = this._sideIds(t).filter((t2) => t2 !== e), n2 = Math.min(i2 ?? (s2.side === t ? s2.order : r2.length), r2.length);
    return (s2.side !== t || s2.order !== n2) && (this.register(e), r2.splice(n2, 0, e), s2.side !== t && this._reorder(s2.side, this._sideIds(s2.side).filter((t2) => t2 !== e)), this._reorder(t, r2), true);
  }
  entries() {
    return Array.from(this._placements, ([e, t]) => ({ scaleId: e, ...t }));
  }
  configured(e) {
    return this._configured.has(e);
  }
  restore(e) {
    this._configured.clear();
    for (const t2 of e.keys()) this._configured.add(t2);
    for (const t2 of e.keys()) this.register(t2);
    const t = { left: 0, right: 0, hidden: 0 };
    for (const i2 of this._placements.keys()) {
      const s2 = F(i2), r2 = { side: s2, order: t[s2]++ };
      this._placements.set(i2, { ...e.get(i2) ?? r2 });
    }
    for (const e2 of R) this._reorder(e2, this._sideIds(e2));
  }
  _sideIds(e) {
    return this.entries().filter((t) => t.side === e).sort((e2, t) => e2.order - t.order).map((e2) => e2.scaleId);
  }
  _reorder(e, t) {
    t.forEach((t2, i2) => {
      const s2 = this._placements.get(t2);
      s2?.side === e && s2.order === i2 || this._configured.add(t2), this._placements.set(t2, { side: e, order: i2 });
    });
  }
};
function E(e, t) {
  return "dashed" === e ? [4 * t, 4 * t] : "dotted" === e ? [1 * t, 3 * t] : [];
}
function B(e, t, i2) {
  const s2 = E(e.gridStyle, i2);
  return { color: e.grid, lineWidth: t?.lineWidth ?? 1, dash: s2, vert: { color: t?.vertColor ?? e.grid, dash: void 0 === t?.vertStyle ? s2 : E(t.vertStyle, i2) }, horz: { color: t?.horzColor ?? e.grid, dash: void 0 === t?.horzStyle ? s2 : E(t.horzStyle, i2) } };
}
function $(e, t, i2, s2, r2, n2, o2, a) {
  if (0 !== t.length) {
    e.strokeStyle = s2?.color ?? r2.color, e.setLineDash(s2?.dash ?? r2.dash ?? []), e.beginPath();
    for (const s3 of t) {
      const t2 = Math.round(c(s3, n2) * n2);
      i2 ? (e.moveTo(t2, 0), e.lineTo(t2, a)) : (e.moveTo(0, t2), e.lineTo(o2, t2));
    }
    e.stroke();
  }
}
function q(e, t) {
  const i2 = void 0 === t?.fontSize ? e.axisFontSize ?? 11 : o(Math.round(t.fontSize), 10, 14);
  return { textColor: t?.textColor ?? e.axisText, lineColor: t?.lineColor ?? e.axisLine, font: `${i2}px system-ui, sans-serif` };
}
function V(e) {
  const t = {};
  return void 0 !== e?.top && (t.marginTop = o(e.top, 0, 49) / 100), void 0 !== e?.bottom && (t.marginBottom = o(e.bottom, 0, 49) / 100), t;
}
var H = { upColor: "#26a69a", downColor: "#ef5350", borderUpColor: "#26a69a", borderDownColor: "#ef5350", wickUpColor: "#26a69a", wickDownColor: "#ef5350", borderVisible: true, wickVisible: true };
function G(e, t, i2 = {}) {
  return { ...H, upColor: e.upColor ?? t.upColor, downColor: e.downColor ?? t.downColor, borderUpColor: e.borderUpColor ?? t.upColor, borderDownColor: e.borderDownColor ?? t.downColor, wickUpColor: e.wickUpColor ?? t.wickUpColor, wickDownColor: e.wickDownColor ?? t.wickDownColor, borderVisible: e.borderVisible ?? H.borderVisible, bodyVisible: e.bodyVisible ?? true, wickVisible: e.wickVisible ?? H.wickVisible, colorByPreviousClose: e.colorByPreviousClose, ...i2 };
}
function U(e, t) {
  const i2 = Math.floor(e * t * 0.8);
  let s2 = Math.max(1, i2);
  if (s2 >= 2) {
    s2 % 2 != Math.max(1, Math.floor(t)) % 2 && (s2 -= 1);
  }
  return Math.max(1, s2);
}
function K(e, t, i2) {
  return i2.wickVisible ? true === i2.hollow || false === i2.bodyVisible || e > t || i2.borderVisible && e >= 3 || i2.upColor !== i2.wickUpColor || i2.downColor !== i2.wickDownColor ? "full" : "wick" : "full";
}
function X(e, t) {
  const i2 = Math.max(0.05, Math.min(1, t));
  return 1 === i2 ? e : Math.max(1, Math.round(e * i2));
}
function J(e, t, i2, s2, r2, n2 = H) {
  const o2 = U(s2, r2), a = Math.max(1, Math.floor(r2)), l2 = n2.widthScale ? null : K(o2, a, n2);
  for (let s3 = 0; s3 < t.length; s3++) {
    const { x: h2, bar: c2 } = t[s3], d2 = s3 > 0 ? t[s3 - 1].bar.close : t[s3].prevClose, u2 = true === n2.colorByPreviousClose && void 0 !== d2 && Number.isFinite(d2) ? c2.close >= d2 : c2.close >= c2.open, _3 = Math.round(i2(c2.open) * r2), p2 = Math.round(i2(c2.close) * r2), f2 = Math.round(i2(c2.high) * r2), m2 = Math.round(i2(c2.low) * r2), b2 = Math.round(h2 * r2), g2 = n2.widthScale ? X(o2, n2.widthScale(c2)) : o2, v2 = Math.floor(g2 / 2), y2 = c2.color, w2 = y2 ?? (u2 ? n2.upColor : n2.downColor), x2 = c2.wickColor ?? y2 ?? (u2 ? n2.wickUpColor : n2.wickDownColor), S2 = c2.borderColor ?? y2 ?? (u2 ? n2.borderUpColor : n2.borderDownColor);
    if (n2.wickVisible && (e.fillStyle = x2, e.fillRect(b2 - (a >> 1), f2, a, Math.max(1, m2 - f2))), "wick" === (l2 ?? K(g2, a, n2)) && x2 === w2) continue;
    const P2 = Math.min(_3, p2), O2 = Math.max(1, Math.abs(p2 - _3));
    if (n2.hollow && u2) e.strokeStyle = n2.borderVisible ? S2 : w2, e.lineWidth = Math.max(1, a), e.strokeRect(b2 - v2 + 0.5, P2 + 0.5, g2 - 1, O2 - 1);
    else {
      const t2 = false !== n2.bodyVisible;
      t2 && (e.fillStyle = w2, e.fillRect(b2 - v2, P2, g2, O2)), n2.borderVisible && (!t2 || g2 >= 3) && (e.strokeStyle = S2, e.lineWidth = 1, e.strokeRect(b2 - v2 + 0.5, P2 + 0.5, g2 - 1, O2 - 1));
    }
  }
}
function Z(e, t, i2, s2, r2, n2, o2 = false) {
  const a = function(e2, t2) {
    return Math.max(Math.max(1, Math.floor(t2)), Math.floor(e2 * t2 * 0.2));
  }(s2, r2), l2 = Math.floor(a / 2), h2 = Math.max(1, Math.floor(U(s2, r2) / 2), l2 + 1);
  e.save();
  for (let s3 = 0; s3 < t.length; s3++) {
    const c2 = t[s3], d2 = c2.bar, u2 = Math.round(c2.x * r2), _3 = Math.round(i2(d2.open) * r2), p2 = Math.round(i2(d2.close) * r2), f2 = Math.round(i2(d2.high) * r2), m2 = Math.round(i2(d2.low) * r2), b2 = s3 > 0 ? t[s3 - 1].bar.close : c2.prevClose, g2 = true === n2.colorByPreviousClose && void 0 !== b2 && Number.isFinite(b2) ? c2.bar.close >= b2 : d2.close >= d2.open;
    e.fillStyle = c2.bar.color ?? (g2 ? n2.upColor ?? "#26a69a" : n2.downColor ?? "#ef5350"), e.fillRect(u2 - l2, f2, a, Math.max(1, m2 - f2)), o2 || (e.fillRect(u2 - h2, _3 - l2, h2, a), e.fillRect(u2, p2 - l2, h2, a));
  }
  e.restore();
}
function Q(e) {
  const t = e.trim();
  if (t.startsWith("#")) {
    const e2 = t.slice(1);
    if (3 === e2.length || 4 === e2.length) {
      const [t2, i3, s2, r2] = [...e2].map((e3) => parseInt(e3 + e3, 16));
      return [t2, i3, s2].some(Number.isNaN) ? null : { r: t2, g: i3, b: s2, a: 4 === e2.length ? r2 / 255 : 1 };
    }
    if (6 === e2.length || 8 === e2.length) {
      const t2 = parseInt(e2.slice(0, 6), 16);
      if (Number.isNaN(t2)) return null;
      const i3 = 8 === e2.length ? parseInt(e2.slice(6, 8), 16) / 255 : 1;
      return { r: t2 >> 16 & 255, g: t2 >> 8 & 255, b: 255 & t2, a: Number.isNaN(i3) ? 1 : i3 };
    }
    return null;
  }
  const i2 = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(t);
  return null === i2 ? null : { r: Number(i2[1]), g: Number(i2[2]), b: Number(i2[3]), a: void 0 === i2[4] ? 1 : Number(i2[4]) };
}
function ee(e) {
  const t = Q(e);
  return (null !== t ? ie(t) : 0.5) > 0.45 ? "#10131a" : "#ffffff";
}
var te = (e) => {
  const t = e / 255;
  return t <= 0.03928 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
};
function ie(e) {
  return 0.2126 * te(e.r) + 0.7152 * te(e.g) + 0.0722 * te(e.b);
}
function se(e, t) {
  const i2 = Q(e);
  return null === i2 ? e : `rgba(${i2.r},${i2.g},${i2.b},${t})`;
}
function re(e) {
  if ("transparent" === e.trim().toLowerCase()) return true;
  const t = Q(e);
  return null !== t && t.a <= 0;
}
function ne(e, t) {
  const i2 = Q(e);
  if (null === i2) return e;
  const s2 = t >= 0 ? 255 : 0, r2 = Math.min(1, Math.abs(t)), n2 = (e2) => Math.round(e2 + (s2 - e2) * r2);
  return `rgba(${n2(i2.r)},${n2(i2.g)},${n2(i2.b)},${i2.a})`;
}
function oe(e, t, i2, s2, r2, n2) {
  const o2 = e.roundRect;
  "function" == typeof o2 ? o2.call(e, t, i2, s2, r2, Math.max(0, Math.min(n2, s2 / 2, r2 / 2))) : e.rect(t, i2, s2, r2);
}
var ae = /* @__PURE__ */ new WeakMap();
function le(e, t, i2, s2) {
  let r2 = ae.get(e);
  void 0 === r2 && (r2 = /* @__PURE__ */ new Map(), ae.set(e, r2));
  const n2 = `${Math.round(t)}|${i2}|${s2}`;
  let o2 = r2.get(n2);
  return void 0 === o2 && (o2 = e.createLinearGradient(0, 0, 0, t), o2.addColorStop(0, i2), o2.addColorStop(1, s2), r2.set(n2, o2)), o2;
}
var ce = { xs: [], ys: [], s: 0, n: 0, a: -1, b: -1 };
var de = { xs: [], ys: [], s: 0, n: 0, a: -1, b: -1 };
var ue = { xs: [], ys: [], s: 0, n: 0, a: -1, b: -1 };
var _e = { xs: [], ys: [], s: 0, n: 0, a: -1, b: -1 };
var pe = [];
function fe(e, t) {
  e.s = 0, e.a = e.b = -1, e.n = t, e.xs.length > 16384 && 4 * t < e.xs.length && (e.xs.length = e.ys.length = t);
}
function me(e, t, i2, s2) {
  const r2 = e.xs, n2 = e.ys;
  for (let e2 = 0; e2 < t.length; e2++) {
    const o2 = t[e2], a = o2.bar;
    r2[e2] = o2.x, n2[e2] = i2(0 === s2 ? a.close : 1 === s2 ? a.high : a.low);
  }
  fe(e, t.length);
}
function be(e, t, i2, s2, r2) {
  const n2 = t.length;
  if (0 === n2) return;
  const o2 = t[0].edgeX, a = t[n2 - 1].edgeX;
  if (void 0 === o2 && void 0 === a) return;
  if (1 === n2) return void (e.n = 0);
  const l2 = e.xs, h2 = e.ys;
  if (void 0 !== o2) {
    const t2 = o2 - r2, n3 = l2[1], a2 = h2[1], c2 = l2[0], d2 = h2[0];
    if (n3 < t2 || !Number.isFinite(d2) || !Number.isFinite(a2)) e.s = i2 ? 2 : 1, h2[0] = NaN;
    else {
      const r3 = Math.hypot(c2 - n3, d2 - a2);
      let o3 = c2 < t2 ? r3 * (n3 - t2) / (n3 - c2) : r3;
      const u2 = i2 && Number.isFinite(h2[2]), _3 = u2 ? Math.abs(h2[2] - a2) : 0;
      if (s2 > 0 && (o3 = Math.ceil((o3 + _3) / s2) * s2 - _3), o3 !== r3) {
        const e2 = o3 / r3;
        l2[0] = n3 + (c2 - n3) * e2, h2[0] = a2 + (d2 - a2) * e2;
      }
      e.a = u2 ? 2 : 1;
    }
  }
  if (void 0 !== a) {
    const t2 = a + r2, s3 = i2 ? e.n - 2 : e.n - 1, n3 = l2[s3 - 1], o3 = h2[s3 - 1], c2 = l2[s3], d2 = h2[s3];
    n3 > t2 || !Number.isFinite(o3) || !Number.isFinite(d2) ? (e.n = s3, h2[s3] = NaN) : (c2 > t2 && (h2[s3] = o3 + (t2 - n3) / (c2 - n3) * (d2 - o3), l2[s3] = t2, e.n = s3 + 1), e.b = s3 - 1);
  }
}
function ge(e, t) {
  return "dashed" === e ? [6 * t, 4 * t] : "dotted" === e ? [1 * t, 3 * t] : [];
}
function ve(e, t, i2, s2, r2 = false) {
  const n2 = t.n, o2 = t.xs, a = t.ys, l2 = t.a, h2 = t.b < 0 ? -1 : t.b + 1;
  if (n2 <= t.s) return;
  const c2 = e.strokeStyle;
  e.beginPath();
  let d2, u2 = -1, _3 = false, p2 = 0;
  for (let f2 = t.s; f2 < n2; f2++) {
    const t2 = o2[f2], n3 = a[f2];
    if (!Number.isFinite(t2) || !Number.isFinite(n3)) {
      u2 = -1;
      continue;
    }
    if (u2 < 0) {
      e.moveTo(t2 * i2, n3 * i2), u2 = f2, p2 = 0;
      continue;
    }
    const m2 = void 0 === s2 ? d2 : s2[f2];
    m2 !== d2 && (_3 && (e.stroke(), e.beginPath(), e.moveTo(o2[u2] * i2, a[u2] * i2), _3 = false, p2 = 0), e.strokeStyle = m2 ?? c2, d2 = m2), r2 && _3 && f2 === h2 && (e.stroke(), e.beginPath(), e.moveTo(o2[u2] * i2, a[u2] * i2), e.lineDashOffset = p2 * i2, _3 = false), e.lineTo(t2 * i2, n3 * i2), r2 && (p2 += Math.hypot(t2 - o2[u2], n3 - a[u2])), u2 = f2, _3 = true, r2 && f2 === l2 && (e.stroke(), e.beginPath(), e.moveTo(t2 * i2, n3 * i2), _3 = false, p2 = 0);
  }
  e.stroke();
}
function ye(e, t, i2, s2, r2) {
  const n2 = ce;
  me(n2, t, i2, 0);
  let o2 = n2;
  r2.step && function(e2, t2) {
    const i3 = e2.xs, s3 = e2.ys, r3 = t2.xs, n3 = t2.ys;
    let o3 = 0;
    for (let t3 = 0; t3 < e2.n; t3++) t3 > 0 && (r3[o3] = i3[t3], n3[o3++] = s3[t3 - 1]), r3[o3] = i3[t3], n3[o3++] = s3[t3];
    fe(t2, o3);
  }(n2, o2 = de);
  const a = function(e2, t2) {
    let i3 = false;
    for (let t3 = 0; t3 < e2.length; t3++) if (void 0 !== e2[t3].bar.color) {
      i3 = true;
      break;
    }
    if (!i3) return;
    let s3 = 0;
    for (let i4 = 0; i4 < e2.length; i4++) {
      const r3 = e2[i4].bar.color;
      t2 && s3 > 0 && (pe[s3++] = r3), pe[s3++] = r3;
    }
    return pe.length = s3, pe;
  }(t, true === r2.step), l2 = r2.lineWidth ?? 1.5, h2 = ge(r2.lineStyle, s2);
  if (be(o2, t, true === r2.step, function(e2, t2) {
    let i3 = 0;
    for (let t3 = 0; t3 < e2.length; t3++) i3 += e2[t3];
    return i3 > 0 ? (e2.length % 2 == 1 ? 2 * i3 : i3) / t2 : 0;
  }(h2, s2), 8 + l2), e.save(), e.strokeStyle = r2.color ?? "#4f8cff", e.lineWidth = Math.max(1, l2 * s2), e.lineJoin = "round", e.lineCap = "round", e.setLineDash(h2), r2.markersOnly || ve(e, o2, s2, a, h2.length > 0), e.setLineDash([]), r2.markers || r2.markersOnly) {
    const i3 = (r2.markerRadius ?? 2) * s2, o3 = r2.color ?? "#4f8cff";
    e.fillStyle = o3;
    for (let r3 = 0; r3 < t.length; r3++) {
      const l3 = n2.xs[r3], h3 = n2.ys[r3];
      Number.isFinite(l3) && Number.isFinite(h3) && void 0 === t[r3].edgeX && (void 0 !== a && (e.fillStyle = t[r3].bar.color ?? o3), e.beginPath(), e.arc(l3 * s2, h3 * s2, i3, 0, 2 * Math.PI), e.fill());
    }
  }
  e.restore();
}
var we = "rgba(79,140,255,0.15)";
function xe(e, t, i2, s2, r2) {
  void 0 !== i2 && (e.save(), e.strokeStyle = i2, e.lineWidth = Math.max(1, Math.round((s2.lineWidth ?? 1.5) * r2)), ve(e, t, r2), e.restore());
}
var Se = { color: "#3a4666", base: 0 };
function Pe(e, t) {
  return { ...e, upColor: e.upColor ?? t.upColor, downColor: e.downColor ?? t.downColor };
}
function Oe(e, t, i2) {
  return { ...e, color: e.color ?? t.lineColor, ...i2 };
}
var ke = (e) => ({ min: e.low, max: e.high });
var Ie = (e) => ({ min: e.close, max: e.close });
var Me = (e, t) => {
  const i2 = t.base ?? 0;
  return { min: Math.min(i2, e.close), max: Math.max(i2, e.close) };
};
var Te = /* @__PURE__ */ new Map();
var Ce = /* @__PURE__ */ new Set(["point-figure", "kagi"]);
function je(e, t) {
  Te.set(e, t);
}
function Ae(e) {
  const t = Te.get(e);
  if (void 0 === t) {
    if (Ce.has(e)) throw new Error(`openalgo-charts: series type "${e}" needs the transform tier, import 'openalgo-charts/transform' first`);
    throw new Error(`openalgo-charts: unknown series type "${e}"`);
  }
  return t;
}
function Le() {
  return Array.from(Te.keys());
}
je("candlestick", { defaultStyle: {}, isPriceSeries: true, draw: (e, t, i2, s2, r2, n2, o2) => J(e, t, i2, s2, r2, G(n2, o2.theme)), extents: ke }), je("hollow-candle", { defaultStyle: {}, isPriceSeries: true, draw: (e, t, i2, s2, r2, n2, o2) => J(e, t, i2, s2, r2, G(n2, o2.theme, { hollow: true })), extents: ke }), je("volume-candle", { defaultStyle: {}, isPriceSeries: true, draw: (e, t, i2, s2, r2, n2, o2) => {
  const a = o2.maxVolume;
  J(e, t, i2, s2, r2, G(n2, o2.theme, { widthScale: (e2) => a > 0 ? (e2.volume ?? 0) / a : 1 }));
}, extents: ke }), je("bar", { defaultStyle: {}, isPriceSeries: true, draw: (e, t, i2, s2, r2, n2, o2) => Z(e, t, i2, s2, r2, Pe(n2, o2.theme)), extents: ke }), je("high-low", { defaultStyle: {}, isPriceSeries: true, draw: (e, t, i2, s2, r2, n2, o2) => Z(e, t, i2, s2, r2, Pe(n2, o2.theme), true), extents: ke }), je("line", { defaultStyle: { lineWidth: 1.5 }, isPriceSeries: true, connectsBars: true, draw: (e, t, i2, s2, r2, n2, o2) => ye(e, t, i2, r2, Oe(n2, o2.theme)), extents: Ie }), je("line-markers", { defaultStyle: { lineWidth: 1.5, markers: true }, isPriceSeries: true, connectsBars: true, draw: (e, t, i2, s2, r2, n2, o2) => ye(e, t, i2, r2, Oe(n2, o2.theme, { markers: true })), extents: Ie }), je("step", { defaultStyle: { lineWidth: 1.5, step: true }, isPriceSeries: true, connectsBars: true, draw: (e, t, i2, s2, r2, n2, o2) => ye(e, t, i2, r2, Oe(n2, o2.theme, { step: true })), extents: Ie }), je("area", { defaultStyle: { lineWidth: 1.5 }, isPriceSeries: true, connectsBars: true, draw: (e, t, i2, s2, r2, n2, o2) => function(e2, t2, i3, s3, r3, n3) {
  const o3 = ce;
  me(o3, t2, i3, 0), be(o3, t2, false, 0, 8 + (n3.lineWidth ?? 1.5));
  const a = o3.s, l2 = o3.n, h2 = o3.xs, c2 = o3.ys;
  if (l2 <= a) return;
  const d2 = r3 * s3;
  e2.save(), e2.beginPath(), e2.moveTo(h2[a] * s3, d2);
  for (let t3 = a; t3 < l2; t3++) e2.lineTo(h2[t3] * s3, c2[t3] * s3);
  e2.lineTo(h2[l2 - 1] * s3, d2), e2.closePath(), e2.fillStyle = le(e2, d2, n3.areaTopColor ?? "rgba(79,140,255,0.40)", n3.areaBottomColor ?? "rgba(79,140,255,0.00)"), e2.fill(), e2.restore(), ye(e2, t2, i3, s3, { color: n3.color ?? "#4f8cff", lineWidth: n3.lineWidth ?? 1.5, lineStyle: n3.lineStyle });
}(e, t, i2, r2, o2.plotHeight, function(e2, t2) {
  return { ...e2, color: e2.color ?? t2.lineColor, areaTopColor: e2.areaTopColor ?? t2.areaTopColor, areaBottomColor: e2.areaBottomColor ?? t2.areaBottomColor };
}(n2, o2.theme)), extents: Ie }), je("hlc-area", { defaultStyle: { lineWidth: 1.5 }, isPriceSeries: true, connectsBars: true, draw: (e, t, i2, s2, r2, n2, o2) => function(e2, t2, i3, s3, r3) {
  if (0 === t2.length) return;
  const n3 = ue, o3 = _e, a = 8 + (r3.lineWidth ?? 1.5);
  me(n3, t2, i3, 1), me(o3, t2, i3, 2), be(n3, t2, false, 0, a), be(o3, t2, false, 0, a);
  const l2 = n3.s, h2 = n3.n;
  e2.save(), e2.beginPath(), h2 > l2 && e2.moveTo(n3.xs[l2] * s3, n3.ys[l2] * s3);
  for (let t3 = l2; t3 < h2; t3++) e2.lineTo(n3.xs[t3] * s3, n3.ys[t3] * s3);
  for (let t3 = o3.n - 1; t3 >= o3.s; t3--) e2.lineTo(o3.xs[t3] * s3, o3.ys[t3] * s3);
  e2.closePath(), e2.fillStyle = r3.areaTopColor ?? we, e2.fill(), e2.restore(), xe(e2, n3, r3.highColor, r3, s3), xe(e2, o3, r3.lowColor, r3, s3), ye(e2, t2, i3, s3, { color: r3.closeColor ?? "#4f8cff", lineWidth: r3.lineWidth ?? 1.5 });
}(e, t, i2, r2, function(e2, t2) {
  return { ...e2, closeColor: e2.closeColor ?? t2.lineColor };
}(n2, o2.theme)), extents: ke }), je("baseline", { defaultStyle: { baseValue: 0, lineWidth: 1.5 }, isPriceSeries: true, connectsBars: true, draw: (e, t, i2, s2, r2, n2, o2) => function(e2, t2, i3, s3, r3) {
  const n3 = i3(r3.baseValue ?? 0) * s3, o3 = ce;
  me(o3, t2, i3, 0), be(o3, t2, false, 0, 8 + (r3.lineWidth ?? 1.5));
  const a = o3.s, l2 = o3.n, h2 = o3.xs, c2 = o3.ys;
  if (l2 <= a) return;
  const d2 = h2[a] * s3, u2 = h2[l2 - 1] * s3, _3 = () => {
    e2.beginPath(), e2.moveTo(d2, n3);
    for (let t3 = a; t3 < l2; t3++) e2.lineTo(h2[t3] * s3, c2[t3] * s3);
    e2.lineTo(u2, n3), e2.closePath();
  }, p2 = r3.areaTopColor ?? "rgba(38,166,154,0.20)", f2 = r3.areaBottomColor ?? "rgba(239,83,80,0.20)", m2 = 1e5;
  e2.save(), e2.beginPath(), e2.rect(d2, n3 - m2, u2 - d2, m2), e2.clip(), _3(), e2.fillStyle = le(e2, n3, p2, "rgba(0,0,0,0)"), e2.fill(), e2.restore(), e2.save(), e2.beginPath(), e2.rect(d2, n3, u2 - d2, m2), e2.clip(), _3(), e2.fillStyle = f2, e2.fill(), e2.restore(), e2.save();
  for (let t3 = a + 1; t3 < l2; t3++) {
    const i4 = c2[t3 - 1], o4 = c2[t3], a2 = (i4 + o4) / 2 <= n3 / s3;
    e2.strokeStyle = a2 ? r3.topColor ?? "#26a69a" : r3.bottomColor ?? "#ef5350", e2.lineWidth = Math.max(1, Math.round((r3.lineWidth ?? 1.5) * s3)), e2.beginPath(), e2.moveTo(h2[t3 - 1] * s3, i4 * s3), e2.lineTo(h2[t3] * s3, o4 * s3), e2.stroke();
  }
  e2.restore();
}(e, t, i2, r2, function(e2, t2) {
  return { ...e2, topColor: e2.topColor ?? t2.baselineTopLine, bottomColor: e2.bottomColor ?? t2.baselineBottomLine, areaTopColor: e2.areaTopColor ?? t2.baselineTopFill, areaBottomColor: e2.areaBottomColor ?? t2.baselineBottomFill };
}(n2, o2.theme)), extents: (e, t) => {
  const i2 = t.baseValue ?? 0;
  return { min: Math.min(i2, e.close), max: Math.max(i2, e.close) };
} }), je("column", { defaultStyle: { base: 0 }, isPriceSeries: false, draw: (e, t, i2, s2, r2, n2, o2) => function(e2, t2, i3, s3, r3, n3) {
  const o3 = U(s3, r3), a = Math.floor(o3 / 2), l2 = Math.round(i3(n3.base ?? 0) * r3);
  e2.save();
  for (const s4 of t2) {
    const t3 = Math.round(s4.x * r3), h2 = Math.round(i3(s4.bar.close) * r3), c2 = s4.bar.close >= s4.bar.open;
    e2.fillStyle = s4.bar.color ?? n3.color ?? (c2 ? n3.upColor ?? "#26a69a" : n3.downColor ?? "#ef5350");
    const d2 = Math.min(l2, h2);
    e2.fillRect(t3 - a, d2, o3, Math.max(1, Math.abs(l2 - h2)));
  }
  e2.restore();
}(e, t, i2, s2, r2, Pe(n2, o2.theme)), extents: Me }), je("histogram", { defaultStyle: { base: 0, color: Se.color }, isPriceSeries: false, draw: (e, t, i2, s2, r2, n2) => {
  !function(e2, t2, i3, s3, r3, n3 = Se) {
    const o2 = U(s3, r3), a = Math.floor(o2 / 2), l2 = Math.round(i3(n3.base) * r3);
    let h2 = "";
    for (const { x: s4, bar: c2 } of t2) {
      const t3 = c2.color ?? n3.color;
      t3 !== h2 && (e2.fillStyle = t3, h2 = t3);
      const d2 = Math.round(s4 * r3), u2 = Math.round(i3(c2.close) * r3), _3 = Math.min(l2, u2), p2 = Math.max(1, Math.abs(l2 - u2));
      e2.fillRect(d2 - a, _3, o2, p2);
    }
  }(e, t, i2, s2, r2, { color: n2.color ?? Se.color, base: n2.base ?? 0 });
}, extents: Me });
var Ee = /* @__PURE__ */ new Map([["candlestick", "ohlc"], ["hollow-candle", "ohlc"], ["volume-candle", "ohlc"], ["bar", "ohlc"], ["high-low", "ohlc"], ["hlc-area", "band"], ["line", "line"], ["line-markers", "line"], ["step", "line"], ["area", "line"], ["baseline", "line"], ["column", "column"], ["histogram", "column"]]);
function Be(e) {
  return Ee.get(e) ?? null;
}
function $e(e, t) {
  return "ohlc" === e ? Math.max(1, Math.floor(t)) : 1;
}
function De(e, t = 1, i2 = "ohlc") {
  const s2 = Number.isFinite(t) && t > 1 ? t : 1;
  return Math.max(1, Math.round($e(i2, e) * s2));
}
function We(e) {
  let t = "ohlc", i2 = 1, s2 = 1, r2 = 1, n2 = NaN;
  const o2 = [];
  let a, l2, h2, c2, d2 = 0, u2 = false, _3 = 0, p2 = NaN, f2 = NaN, m2 = NaN, b2 = NaN, g2 = 0, v2 = false, y2 = null, w2 = 0, x2 = null, S2 = 0, P2 = null, O2 = 0, k2 = 0, I2 = null, M2 = 0, T2 = 0, C2 = 0, j3 = null, A2 = 0, L2 = 0, N2 = null, R2 = 0, F2 = 0, z3 = 0, E2 = 0;
  const B2 = [], $2 = [], D = [];
  let W = 0, q2 = false;
  const V2 = (e2, t2, i3) => {
    let s3 = W;
    for (; s3 > 0 && B2[s3 - 1] > e2; ) s3--;
    if (!(s3 > 0 && B2[s3 - 1] === e2)) {
      for (let e3 = W; e3 > s3; e3--) B2[e3] = B2[e3 - 1], $2[e3] = $2[e3 - 1], D[e3] = D[e3 - 1];
      B2[s3] = e2, $2[s3] = t2, D[s3] = i3, W++;
    }
  }, H3 = () => {
    if (null === y2) return;
    const i3 = y2;
    if (y2 = null, "band" === t) {
      W = 0, V2(z3, w2, i3), V2(k2, O2, P2), V2(T2, M2, I2), V2(L2, A2, j3), V2(F2, R2, N2), V2(E2, S2, x2);
      for (let t2 = 0; t2 < W; t2++) e($2[t2], D[t2]);
      return;
    }
    const s3 = k2 <= T2, r3 = s3 ? P2 : I2, n3 = s3 ? O2 : M2, o3 = s3 ? I2 : P2, a2 = s3 ? M2 : O2;
    if ("column" === t) return e(n3, r3), void (o3 !== r3 && e(a2, o3));
    e(w2, i3), r3 !== i3 && e(n3, r3), o3 !== i3 && o3 !== r3 && e(a2, o3), x2 !== i3 && x2 !== r3 && x2 !== o3 && e(S2, x2);
  }, G2 = () => {
    "ohlc" === t ? (() => {
      if (!u2) return;
      u2 = false;
      let t2 = o2[d2];
      void 0 === t2 && (t2 = { time: 0, open: 0, high: 0, low: 0, close: 0, volume: void 0, oi: void 0, color: void 0, wickColor: void 0, borderColor: void 0 }, o2.push(t2)), d2++, t2.time = _3, t2.open = p2, t2.high = f2, t2.low = m2, t2.close = b2, t2.volume = v2 ? g2 : void 0, t2.oi = a, t2.color = l2, t2.wickColor = h2, t2.borderColor = c2, e((n2 * s2 + (s2 - r2 >> 1) + (r2 >> 1)) / i2, t2);
    })() : H3();
  };
  return { begin(e2, o3, a2) {
    t = e2, i2 = o3, s2 = De(o3, a2, e2), r2 = $e(e2, o3), n2 = NaN, d2 = 0, u2 = false, y2 = null, q2 = false, C2 = 0;
  }, push(o3, d3) {
    const B3 = Math.floor((Math.round(o3 * i2) - (r2 >> 1) + (r2 - 1 >> 1)) / s2);
    B3 !== n2 && (G2(), n2 = B3), "ohlc" === t ? ((e2) => {
      if (!Number.isFinite(e2.close)) return;
      const t2 = e2.high, i3 = e2.low;
      u2 ? (t2 != t2 || f2 >= t2 || (f2 = t2), i3 != i3 || m2 <= i3 || (m2 = i3)) : (u2 = true, _3 = e2.time, p2 = e2.open, f2 = t2, m2 = i3, g2 = 0, v2 = false, a = void 0), b2 = e2.close, void 0 !== e2.volume && (g2 += e2.volume, v2 = true), void 0 !== e2.oi && (a = e2.oi), l2 = e2.color, h2 = e2.wickColor, c2 = e2.borderColor;
    })(d3) : ((i3, s3) => {
      const r3 = s3.close;
      if (!Number.isFinite(r3)) {
        if ("column" === t) return;
        return H3(), void (q2 || (q2 = true, e(i3, s3)));
      }
      q2 = false;
      const n3 = C2++;
      if (null === y2) y2 = s3, w2 = i3, z3 = n3, P2 = s3, O2 = i3, k2 = n3, I2 = s3, M2 = i3, T2 = n3, j3 = s3, A2 = i3, L2 = n3, N2 = s3, R2 = i3, F2 = n3;
      else if (r3 < P2.close && (P2 = s3, O2 = i3, k2 = n3), r3 > I2.close && (I2 = s3, M2 = i3, T2 = n3), "band" === t) {
        const e2 = s3.high, t2 = s3.low;
        e2 != e2 || j3.high >= e2 || (j3 = s3, A2 = i3, L2 = n3), t2 != t2 || N2.low <= t2 || (N2 = s3, R2 = i3, F2 = n3);
      }
      x2 = s3, S2 = i3, E2 = n3;
    })(o3, d3);
  }, end() {
    G2(), n2 = NaN;
  } };
}
var qe = { time: 0, open: NaN, high: NaN, low: NaN, close: NaN };
var Ve = { start: 0, lastTime: 0 };
function He() {
  const e = [], t = [];
  let i2 = 0, s2 = -1, r2 = null;
  const n2 = (s3, r3) => {
    const n3 = i2++;
    let o3 = t[n3];
    void 0 === o3 && (o3 = { x: 0, bar: qe, prevClose: void 0, edgeX: void 0 }, t.push(o3)), o3.x = s3, o3.bar = r3, o3.prevClose = void 0, o3.edgeX = void 0, e[n3] = o3;
  }, o2 = (t2, s3, r3, o3, a2) => {
    const l2 = t2.timeToIndex(s3.time);
    void 0 !== l2 && (n2(o3.indexToX(l2 + r3), s3), e[i2 - 1].edgeX = a2);
  }, a = We(n2);
  return { items: e, priceToY: (e2) => r2.priceToY(e2), firstIndex: () => s2, build(l2, h2, c2, d2, u2, _3, p2, f2, m2 = false) {
    r2 = p2, i2 = 0, s2 = -1;
    const b2 = l2.seriesBars(h2);
    if (C(l2, b2, c2, d2, Ve)) {
      const e2 = Ve.lastTime;
      m2 && Ve.start > 0 && o2(l2, b2[Ve.start - 1], u2, _3, 0), null !== f2 && a.begin(f2.kind, f2.dpr, f2.factor);
      let t2 = Ve.start;
      for (; t2 < b2.length; t2++) {
        const i3 = b2[t2];
        if (i3.time > e2) break;
        const r3 = l2.timeToIndex(i3.time);
        if (void 0 === r3) continue;
        s2 < 0 && (s2 = r3);
        const o3 = _3.indexToX(r3 + u2);
        null !== f2 ? a.push(o3, i3) : n2(o3, i3);
      }
      null !== f2 && a.end(), m2 && t2 < b2.length && o2(l2, b2[t2], u2, _3, _3.width);
    }
    if (e.length !== i2) {
      for (let s3 = i2; s3 < e.length; s3++) t[s3].bar = qe;
      e.length = i2;
    }
    return t.length > 4096 && 4 * i2 < t.length && (t.length = Math.max(4096, 2 * i2)), e;
  } };
}
var Ge = { left: 1 / 0, top: 1 / 0, right: -1 / 0, bottom: -1 / 0 };
var Ue = { left: -1 / 0, top: -1 / 0, right: 1 / 0, bottom: 1 / 0 };
var Ke = 0;
function Ye() {
  const e = [], t = [], i2 = [], s2 = [], r2 = [];
  let n2 = 0, o2 = 0, a = false, l2 = false, h2 = false;
  const c2 = (e2, t2) => e2.length === t2.length && e2.every((e3, i3) => Object.is(e3, t2[i3])), d2 = (e2) => {
    const i3 = n2++;
    Object.is(t[i3], e2) || (t[i3] = e2, a = true);
  };
  return { begin() {
    n2 = 0, o2 = 0, a = false, d2(Ke);
  }, number: d2, ref(e2) {
    const t2 = o2++;
    t2 < i2.length && Object.is(i2[t2], e2) || (i2[t2] = e2, a = true);
  }, scale(e2) {
    d2(e2.priceToY(1)), d2(e2.priceToY(1e3)), d2(e2.height), d2(m.indexOf(e2.options.mode)), d2(e2.options.inverted ? 1 : 0);
  }, end() {
    n2 !== t.length && (t.length = n2, a = true), o2 !== i2.length && (i2.length = o2, a = true), a && (e.length = 0, h2 = false, l2 = c2(t, s2) && c2(i2, r2));
  }, painted() {
    h2 && (e.length = 0, h2 = false), s2.length = 0, s2.push(...t), r2.length = 0, r2.push(...i2), l2 = true;
  }, kept: (t2) => e[t2], measure(t2, i3, s3) {
    const r3 = void 0 === i3.hitBounds ? Ue : i3.hitBounds(s3) ?? Ge;
    return e[t2] = r3, l2 || (h2 = true), r3;
  }, clear() {
    e.length = 0;
  } };
}
function Xe(e, t, i2) {
  return !(t < e.left || t > e.right || i2 < e.top || i2 > e.bottom);
}
var Je = 19800;
function et(e) {
  const t = new Date(1e3 * (e + Je));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate(), hour: t.getUTCHours(), minute: t.getUTCMinutes(), second: t.getUTCSeconds(), weekday: t.getUTCDay() };
}
var tt = (e) => e < 10 ? `0${e}` : String(e);
function it(e) {
  const t = et(e);
  return `${tt(t.hour)}:${tt(t.minute)}`;
}
function st(e) {
  const t = et(e);
  return `${tt(t.hour)}:${tt(t.minute)}:${tt(t.second)}`;
}
var nt = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function ot(e) {
  const t = et(e);
  return `${tt(t.day)} ${nt[t.month - 1]}`;
}
var at = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function ht(e, t) {
  const i2 = et(e), s2 = et(t);
  return i2.year !== s2.year || i2.month !== s2.month || i2.day !== s2.day;
}
var ct = "Asia/Kolkata";
var dt = /* @__PURE__ */ new Map();
var ut = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function _t(e) {
  let t = dt.get(e);
  if (void 0 === t) {
    let i2;
    try {
      i2 = new Intl.DateTimeFormat("en-US", { timeZone: e, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short" });
    } catch {
      throw new Error(`openalgo-charts: unknown IANA time zone "${e}"`);
    }
    t = { format: i2, parts: /* @__PURE__ */ new Map(), lastSecond: Number.NaN, lastParts: null }, dt.set(e, t);
  }
  return t;
}
function pt(e) {
  if (dt.has(e)) return true;
  try {
    return _t(e), true;
  } catch {
    return false;
  }
}
function ft(e, t) {
  const i2 = _t(t);
  if (e === i2.lastSecond && null !== i2.lastParts) return i2.lastParts;
  let s2 = i2.parts.get(e);
  return void 0 === s2 && (s2 = function(e2, t2) {
    let i3 = 1970, s3 = 1, r2 = 1, n2 = 0, o2 = 0, a = 0, l2 = 4;
    for (const h2 of e2.formatToParts(new Date(1e3 * t2))) switch (h2.type) {
      case "year":
        i3 = Number(h2.value);
        break;
      case "month":
        s3 = Number(h2.value);
        break;
      case "day":
        r2 = Number(h2.value);
        break;
      case "hour":
        n2 = Number(h2.value) % 24;
        break;
      case "minute":
        o2 = Number(h2.value);
        break;
      case "second":
        a = Number(h2.value);
        break;
      case "weekday":
        l2 = ut[h2.value] ?? 0;
    }
    return { year: i3, month: s3, day: r2, hour: n2, minute: o2, second: a, weekday: l2, dayIndex: Math.floor(Date.UTC(i3, s3 - 1, r2) / 864e5) };
  }(i2.format, e), i2.parts.size >= 4096 && i2.parts.clear(), i2.parts.set(e, s2)), i2.lastSecond = e, i2.lastParts = s2, s2;
}
function mt(e, t = ct) {
  const i2 = ft(e, t);
  return { year: i2.year, month: i2.month, day: i2.day, hour: i2.hour, minute: i2.minute, second: i2.second, weekday: i2.weekday };
}
function bt(e, t = ct) {
  return ft(e, t).dayIndex;
}
function gt(e, t = ct) {
  return Math.floor((ft(e, t).dayIndex + 3) / 7);
}
function vt(e, t = ct) {
  const i2 = ft(e, t);
  return Math.floor(Date.UTC(i2.year, i2.month - 1, i2.day, i2.hour, i2.minute, i2.second) / 1e3) - e;
}
function yt(e, t, i2 = ct) {
  return ft(e, i2).dayIndex !== ft(t, i2).dayIndex;
}
function wt(e, t, i2 = ct) {
  return Math.floor((ft(e, i2).dayIndex + 3) / 7) !== Math.floor((ft(t, i2).dayIndex + 3) / 7);
}
function xt(e, t, i2 = ct) {
  const s2 = ft(e, i2), r2 = ft(t, i2);
  return s2.year !== r2.year || s2.month !== r2.month;
}
function St(e, t, i2 = ct) {
  const s2 = ft(e, i2), r2 = ft(t, i2);
  return s2.year !== r2.year || Math.floor((s2.month - 1) / 3) !== Math.floor((r2.month - 1) / 3);
}
function Pt(e, t, i2 = ct) {
  return ft(e, i2).year !== ft(t, i2).year;
}
function Ot(e, t, i2, s2 = ct) {
  switch (i2) {
    case "week":
      return wt(e, t, s2);
    case "month":
      return xt(e, t, s2);
    case "quarter":
      return St(e, t, s2);
    case "year":
      return Pt(e, t, s2);
    default:
      return yt(e, t, s2);
  }
}
function It(e, t, i2, s2 = 0, r2 = 0, n2 = 0, o2 = ct) {
  const a = Math.floor(Date.UTC(e, t - 1, i2, s2, r2, n2) / 1e3), l2 = a - vt(a, o2);
  return a - vt(l2, o2);
}
function jt(e, t = ct) {
  const i2 = ft(e, t);
  return `${tt(i2.hour)}:${tt(i2.minute)}`;
}
function At(e, t = ct) {
  const i2 = ft(e, t);
  return `${tt(i2.hour)}:${tt(i2.minute)}:${tt(i2.second)}`;
}
function Lt(e, t = ct) {
  const i2 = ft(e, t);
  return `${tt(i2.day)} ${nt[i2.month - 1]}`;
}
function Rt(e, t = ct) {
  const i2 = ft(e, t);
  let s2 = `${at[i2.weekday]} ${tt(i2.day)} ${nt[i2.month - 1]} '${String(i2.year).slice(-2)}`;
  return 0 === i2.hour && 0 === i2.minute && 0 === i2.second || (s2 += ` ${tt(i2.hour)}:${tt(i2.minute)}`, 0 !== i2.second && (s2 += `:${tt(i2.second)}`)), s2;
}
function Ft(e) {
  const t = function(e2) {
    const t2 = [];
    for (let i3 = 1; i3 < e2.length; i3++) {
      const s3 = e2[i3] - e2[i3 - 1];
      s3 > 0 && t2.push(s3);
    }
    return 0 === t2.length ? 0 : (t2.sort((e3, t3) => e3 - t3), t2[t2.length >> 1]);
  }(e);
  if (t <= 0 || t >= 86400) return null;
  const i2 = Math.max(4 * t, 14400), s2 = [];
  for (let t2 = 1; t2 < e.length; t2++) e[t2] - e[t2 - 1] >= i2 && s2.push(t2);
  if (0 === s2.length) return null;
  const r2 = [e[0], ...s2.map((t2) => e[t2])], n2 = [];
  for (let e2 = 1; e2 < r2.length; e2++) n2.push(r2[e2] - r2[e2 - 1]);
  return n2.sort((e2, t2) => e2 - t2), n2[n2.length >> 1] > 129600 ? null : s2;
}
function zt(e, t = ct) {
  const i2 = new Array(e.length).fill(false), s2 = Ft(e);
  if (null === s2) {
    const s3 = t === ct ? ht : (e2, i3) => yt(e2, i3, t);
    for (let t2 = 1; t2 < e.length; t2++) i2[t2] = s3(e[t2 - 1], e[t2]);
    return i2;
  }
  for (const e2 of s2) i2[e2] = true;
  return i2;
}
function Et(e, t) {
  const i2 = new Array(e.length).fill(false), s2 = Ft(e);
  if (null === s2) {
    for (let s3 = 1; s3 < e.length; s3++) i2[s3] = t(e[s3 - 1], e[s3]);
    return i2;
  }
  let r2 = e[0];
  for (const n2 of s2) t(r2, e[n2]) && (i2[n2] = true), r2 = e[n2];
  return i2;
}
var Bt = /^\s*(\d{2})(\d{2})\s*-\s*(\d{2})(\d{2})(?:\s*:\s*([1-7]+))?\s*$/;
function $t(e, t) {
  const i2 = Number(e), s2 = Number(t);
  return i2 > 23 || s2 > 59 ? -1 : 60 * i2 + s2;
}
function Dt(e) {
  const t = Bt.exec(e);
  if (null === t) return null;
  const i2 = $t(t[1], t[2]), s2 = $t(t[3], t[4]);
  return i2 < 0 || s2 < 0 ? null : void 0 === t[5] ? { start: i2, end: s2 } : { start: i2, end: s2, days: [...t[5]].map(Number) };
}
var Ht = { textColor: "#8b91a7", lineColor: "#2a3046", font: "11px system-ui, sans-serif" };
var Gt = 90;
var Ut = 30;
var Kt = 10;
function Yt(e, t = 0) {
  const i2 = new Array(e.length).fill(false), s2 = e.map((e2, t2) => t2);
  s2.sort((t2, i3) => e[i3].priority - e[t2].priority || t2 - i3);
  const r2 = [];
  for (const n2 of s2) {
    const s3 = e[n2];
    if (!Number.isFinite(s3.y) || !Number.isFinite(s3.height)) continue;
    let o2 = true;
    for (const e2 of r2) if (Math.abs(e2.y - s3.y) < (e2.height + s3.height) / 2 + t) {
      o2 = false;
      break;
    }
    o2 && (i2[n2] = true, r2.push(s3));
  }
  return i2;
}
function Xt(e, t, i2) {
  const s2 = 8 * i2;
  return e >= s2 && e <= t - s2;
}
function Jt(e, t, i2, s2, r2 = Ht, n2, o2 = "right") {
  const a = t.ticks((l2 = i2.plotHeight, !Number.isFinite(l2) || l2 <= 0 ? 2 : Math.max(2, Math.min(30, Math.round(l2 / 32)))));
  var l2;
  const h2 = function(e2, t2, i3, s3) {
    return void 0 === s3 || 0 === s3.length ? null : Yt([...e2.map((e3) => ({ y: Math.round(t2.priceToY(e3) * i3), height: 16 * i3, priority: Kt })), ...s3], 2 * i3).slice(0, e2.length);
  }(a, t, s2, n2), c2 = "left" === o2, d2 = Math.round((c2 ? i2.plotLeft : i2.plotWidth) * s2), u2 = c2 ? d2 - 0.5 : d2 + 0.5, _3 = c2 ? d2 - 6 * s2 : d2 + 6 * s2;
  e.save(), e.strokeStyle = r2.lineColor, e.fillStyle = r2.textColor, e.font = pi(r2.font, s2), e.textAlign = c2 ? "right" : "left", e.textBaseline = "middle", e.lineWidth = 1, e.beginPath(), e.moveTo(u2, 0), e.lineTo(u2, Math.round(i2.plotHeight * s2)), e.stroke();
  for (let r3 = 0; r3 < a.length; r3++) {
    if (null !== h2 && !h2[r3]) continue;
    const n3 = a[r3], o3 = Math.round(t.priceToY(n3) * s2);
    Xt(o3, i2.plotHeight * s2, s2) && e.fillText(t.format(n3), _3, o3);
  }
  e.restore();
}
function Zt(e, t, i2, s2) {
  const r2 = s2 ? "timeWithSeconds" : "time";
  if (i2 === ct) {
    const i3 = et(e), s3 = et(t);
    return i3.year !== s3.year ? "year" : i3.month !== s3.month ? "month" : i3.day !== s3.day ? "day" : r2;
  }
  return Pt(e, t, i2) ? "year" : xt(e, t, i2) ? "month" : yt(e, t, i2) ? "day" : r2;
}
function Qt(e, t) {
  const i2 = ei(e);
  return i2 != i2 || i2 !== ei(t);
}
function ei(e) {
  const t = Math.trunc(1e3 * (e + Je));
  return Math.abs(t) <= 864e13 ? Math.floor(t / 864e5) : NaN;
}
function ti(e, t, i2) {
  const s2 = [];
  for (let r2 = e; r2 <= t; r2 += i2) s2.push(r2);
  return s2;
}
var ii = { up: "#26a69a", down: "#ef5350", text: "#0d0e12" };
function si(e, t = 64) {
  const i2 = e.baseIndex, s2 = [];
  let r2;
  for (let n2 = Math.max(0, i2 - t); n2 <= i2; n2++) {
    const t2 = e.indexToTime(n2);
    void 0 !== t2 && (void 0 !== r2 && t2 - r2 > 0 && s2.push(t2 - r2), r2 = t2);
  }
  return 0 === s2.length ? 0 : (s2.sort((e2, t2) => e2 - t2), s2[s2.length >> 1]);
}
function ri(e, t, i2) {
  if (!Number.isFinite(t) || t <= 0) return null;
  if (!Number.isFinite(e) || !Number.isFinite(i2)) return null;
  const s2 = i2 - e;
  return s2 < 0 ? t - s2 : t - s2 % t;
}
var ni = (e) => e < 10 ? `0${e}` : String(e);
function oi(e) {
  if (null === e || !Number.isFinite(e)) return "--:--:--";
  const t = Math.max(0, Math.ceil(e));
  return `${ni(Math.floor(t / 3600))}:${ni(Math.floor(t % 3600 / 60))}:${ni(t % 60)}`;
}
function ai(e, t = false) {
  return (t ? 28 : 16) * e;
}
function li(e, t, i2, s2) {
  return !Number.isFinite(e) || e < 0 || e > t ? null : "right" === s2 ? e : t < i2 ? null : Math.max(i2 / 2, Math.min(t - i2 / 2, e));
}
function hi(e, t, i2, s2, r2, n2, o2, a) {
  const l2 = Math.round(r2.plotLeft * n2) - 1;
  if (!(l2 > 0)) return;
  const h2 = Math.min(6 * n2, l2 / 4), c2 = s2.map((t2) => (e.font = t2.font, e.measureText(t2.text).width)), d2 = Math.min(l2, Math.max(...c2) + 2 * h2), u2 = -1 - d2;
  e.fillStyle = o2, e.fillRect(u2, t - i2 / 2, d2, i2), e.fillStyle = a;
  for (let r3 = 0; r3 < s2.length; r3++) {
    const o3 = s2[r3], a2 = Number(/(^|[^\d.])(\d{1,5}(?:\.\d{1,4})?)px/.exec(o3.font)?.[2]), l3 = a2 > 0 ? (i2 / s2.length - 2 * n2) / a2 : 1, _3 = c2[r3] > 0 ? (d2 - 2 * h2) / c2[r3] : 1;
    e.font = pi(o3.font, Math.min(1, _3, l3)), e.fillText(o3.text, u2 + h2, t + o3.offset);
  }
}
function ci(e, t, i2, s2, r2, n2, o2, a) {
  const l2 = e.measureText(n2).width;
  e.fillStyle = o2, e.fillRect(t + 1, i2 - s2 / 2, l2 + 2 * r2, s2), e.fillStyle = a, e.fillText(n2, t + 1 + r2, i2);
}
function di(e, t, i2, s2, r2, n2, o2 = Ht, a = "right") {
  if (!Number.isFinite(i2)) return;
  const l2 = li(Math.round(t.priceToY(i2) * n2), r2.plotHeight * n2, ai(n2), a);
  null !== l2 && (e.save(), e.font = pi(o2.font, n2), e.textAlign = "left", e.textBaseline = "middle", "left" === a ? hi(e, l2, ai(n2), [{ text: t.format(i2), font: e.font, offset: 0 }], r2, n2, s2, ee(s2)) : ci(e, Math.round(r2.plotWidth * n2), l2, ai(n2), 6 * n2, t.format(i2), s2, ee(s2)), e.restore());
}
function ui(e, t, i2, s2, r2, n2, o2 = Ht, { colors: a = ii, countdown: l2, side: h2 = "right" } = {}) {
  const c2 = Math.round(t.priceToY(i2) * n2);
  if (!Number.isFinite(c2) || c2 < 0 || c2 > r2.plotHeight * n2) return;
  const d2 = s2 ? a.up : a.down, u2 = Math.round(r2.plotWidth * n2);
  e.save();
  const _3 = t.format(i2), p2 = void 0 !== l2 && true === l2.visible, f2 = pi(o2.font, n2);
  e.font = f2;
  const m2 = 6 * n2, b2 = ai(n2, p2);
  if (e.textAlign = "left", e.textBaseline = "middle", "left" === h2) {
    const t2 = li(c2, r2.plotHeight * n2, b2, h2);
    if (null !== t2) {
      const i3 = [{ text: _3, font: f2, offset: p2 ? -b2 / 4 : 0 }];
      p2 && i3.push({ text: oi(ri(l2.lastBarTime, l2.intervalSec, l2.now())), font: pi(o2.font, 0.9 * n2), offset: b2 / 4 }), hi(e, t2, b2, i3, r2, n2, d2, a.text);
    }
  } else if (p2) {
    const t2 = oi(ri(l2.lastBarTime, l2.intervalSec, l2.now())), i3 = pi(o2.font, 0.9 * n2), s3 = e.measureText(_3).width;
    e.font = i3;
    const r3 = e.measureText(t2).width;
    e.fillStyle = d2, e.fillRect(u2 + 1, c2 - b2 / 2, Math.max(s3, r3) + 2 * m2, b2), e.fillStyle = a.text, e.font = f2, e.fillText(_3, u2 + 1 + m2, c2 - b2 / 4), e.font = i3, e.fillText(t2, u2 + 1 + m2, c2 + b2 / 4);
  } else ci(e, u2, c2, b2, m2, _3, d2, a.text);
  e.restore();
}
function _i(e, t, i2, s2, r2 = Ht) {
  if (true !== s2.visible) return;
  if (t.timeAxisHeight <= 0 || t.priceAxisWidth <= 0) return;
  const n2 = s2.now();
  if (!Number.isFinite(n2)) return;
  const o2 = Math.floor(n2), a = void 0 !== s2.timezone && s2.timezone !== ct && pt(s2.timezone) ? s2.timezone : ct, l2 = a === ct, h2 = l2 ? st(o2) : At(o2, a), c2 = l2 ? Je : vt(o2, a), d2 = Math.round((t.plotWidth + t.priceAxisWidth / 2) * i2), u2 = Math.round(t.plotHeight * i2), _3 = t.timeAxisHeight * i2, p2 = false !== s2.showOffset && t.timeAxisHeight >= 20;
  e.save(), e.fillStyle = r2.textColor, e.textAlign = "center", e.textBaseline = "middle", e.font = pi(r2.font, i2), p2 ? (e.fillText(h2, d2, u2 + 0.3 * _3), e.font = pi(r2.font, 0.82 * i2), e.fillText(function(e2) {
    const t2 = Math.round(e2 / 60);
    if (0 === t2) return "UTC";
    const i3 = Math.abs(t2), s3 = i3 % 60;
    return `UTC${t2 < 0 ? "-" : "+"}${Math.floor(i3 / 60)}${0 === s3 ? "" : `:${ni(s3)}`}`;
  }(c2), d2, u2 + 0.74 * _3)) : e.fillText(h2, d2, u2 + _3 / 2), e.restore();
}
function pi(e, t) {
  return e.replace(/(^|[^\d.])(\d{1,5}(?:\.\d{1,4})?)px/, (e2, i2, s2) => `${i2}${Number(s2) * t}px`);
}
function fi(e, t, i2) {
  return { color: t?.color ?? e.crosshair, width: t?.width ?? e.crosshairWidth ?? 1, dash: E(t?.style ?? e.crosshairStyle ?? "dashed", i2) };
}
function mi(e, t, i2, s2, r2, n2, o2, a = 1, l2 = [4 * n2, 4 * n2]) {
  if (e.save(), e.strokeStyle = o2, e.lineWidth = Math.max(1, a), e.setLineDash(l2), t >= 0 && t <= s2) {
    const i3 = Math.round(t * n2) + 0.5;
    e.beginPath(), e.moveTo(i3, 0), e.lineTo(i3, Math.round(r2 * n2)), e.stroke();
  }
  if (null !== i2 && i2 >= 0 && i2 <= r2) {
    const t2 = Math.round(i2 * n2) + 0.5;
    e.beginPath(), e.moveTo(0, t2), e.lineTo(Math.round(s2 * n2), t2), e.stroke();
  }
  e.setLineDash([]), e.restore();
}
var bi = "ui-sans-serif, system-ui, sans-serif";
var gi = {};
var vi = {};
function yi(e) {
  const t = e.iconSize;
  return "number" == typeof t && Number.isFinite(t) ? Math.max(12, Math.min(28, t)) : 16;
}
function wi(e) {
  return Math.max(18, yi(e) + 2);
}
var xi = (e) => e.parts.reduce((e2, t) => e2 + t.w + t.gap, 0);
function Si(e, t, i2, s2) {
  if (t.reduce((e2, t2) => e2 + xi(t2), 0) <= s2) return t.flatMap((e2) => e2.parts);
  const r2 = t.filter((e2) => !e2.parts.includes(i2)).sort((e2, t2) => t2.priority - e2.priority);
  if ("text" === i2?.k) {
    const t2 = r2.find((e2) => e2.reading), n3 = t2 ? xi(t2) : 0, o2 = n3 <= 0.75 * s2 ? n3 : 0, a = Math.max(0, s2 - o2 - i2.gap);
    if (i2.w > a) {
      const t3 = Array.from(i2.text);
      let s3 = 0, r3 = t3.length;
      for (; s3 < r3; ) {
        const i3 = Math.ceil((s3 + r3) / 2);
        e.measureText(t3.slice(0, i3).join("") + "...").width <= a ? s3 = i3 : r3 = i3 - 1;
      }
      i2.text = e.measureText("...").width <= a ? t3.slice(0, s3).join("") + "..." : "", i2.w = e.measureText(i2.text).width, i2.text || (i2.gap = 0);
    }
    s2 -= i2.w + i2.gap;
  }
  const n2 = /* @__PURE__ */ new Set();
  for (const e2 of r2) {
    const t2 = xi(e2);
    t2 <= s2 && (n2.add(e2), s2 -= t2);
  }
  return t.filter((e2) => e2.parts.includes(i2) || n2.has(e2)).flatMap((e2) => e2.parts);
}
function Pi(e, t, i2) {
  return "ohlc" === t ? false !== e.chartValues : "change" === t ? false !== e.barChange : "volume" === t ? false !== e.volume : "openInterest" === t ? true === e.openInterest && false !== i2 : false !== e.lastValueLabel;
}
var Oi = ["hide", "settings", "close"];
function ki(e, t, i2, s2, r2, n2, o2) {
  const a = 0.36 * r2 * n2, l2 = Math.max(1, Math.round(1.4 * r2 * n2 / 16));
  switch (e.save(), e.strokeStyle = e.fillStyle, e.lineWidth = l2, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), t) {
    case "up":
      e.moveTo(i2, s2 + a), e.lineTo(i2, s2 - a), e.moveTo(i2 - 0.62 * a, s2 - 0.35 * a), e.lineTo(i2, s2 - a), e.lineTo(i2 + 0.62 * a, s2 - 0.35 * a);
      break;
    case "down":
      e.moveTo(i2, s2 - a), e.lineTo(i2, s2 + a), e.moveTo(i2 - 0.62 * a, s2 + 0.35 * a), e.lineTo(i2, s2 + a), e.lineTo(i2 + 0.62 * a, s2 + 0.35 * a);
      break;
    case "hide":
      e.moveTo(i2 - a, s2), e.quadraticCurveTo(i2, s2 - 1.15 * a, i2 + a, s2), e.quadraticCurveTo(i2, s2 + 1.15 * a, i2 - a, s2), e.stroke(), e.beginPath(), e.arc(i2, s2, 0.34 * a, 0, 2 * Math.PI), true === o2.hidden && (e.moveTo(i2 - a, s2 + 0.85 * a), e.lineTo(i2 + a, s2 - 0.85 * a));
      break;
    case "maximize":
      true === o2.maximized ? (e.moveTo(i2 - a, s2 - 0.25 * a), e.lineTo(i2 - 0.25 * a, s2 - 0.25 * a), e.lineTo(i2 - 0.25 * a, s2 - a), e.moveTo(i2 + a, s2 + 0.25 * a), e.lineTo(i2 + 0.25 * a, s2 + 0.25 * a), e.lineTo(i2 + 0.25 * a, s2 + a)) : (e.moveTo(i2 - a, s2 - 0.4 * a), e.lineTo(i2 - a, s2 - a), e.lineTo(i2 - 0.4 * a, s2 - a), e.moveTo(i2 + 0.4 * a, s2 - a), e.lineTo(i2 + a, s2 - a), e.lineTo(i2 + a, s2 - 0.4 * a), e.moveTo(i2 + a, s2 + 0.4 * a), e.lineTo(i2 + a, s2 + a), e.lineTo(i2 + 0.4 * a, s2 + a), e.moveTo(i2 - 0.4 * a, s2 + a), e.lineTo(i2 - a, s2 + a), e.lineTo(i2 - a, s2 + 0.4 * a));
      break;
    case "collapse": {
      const t2 = true === o2.collapsed ? 0.6 * a : 0;
      e.moveTo(i2 - a, s2 - 0.7 * a), e.lineTo(i2 + a, s2 - 0.7 * a), e.moveTo(i2 - 0.6 * a, s2 + 0.6 * a - t2), e.lineTo(i2, s2 + t2), e.lineTo(i2 + 0.6 * a, s2 + 0.6 * a - t2);
      break;
    }
    case "settings":
      e.arc(i2, s2, 0.46 * a, 0, 2 * Math.PI);
      for (let t2 = 0; t2 < 8; t2++) {
        const r3 = t2 * Math.PI / 4, n3 = Math.cos(r3), o3 = Math.sin(r3);
        e.moveTo(i2 + n3 * a * 0.68, s2 + o3 * a * 0.68), e.lineTo(i2 + n3 * a, s2 + o3 * a);
      }
      break;
    case "source": {
      const t2 = 0.62 * a, r3 = 0.34 * a, n3 = 0.28 * a;
      for (const o3 of [-1, 1]) {
        const l3 = i2 + o3 * t2;
        e.moveTo(l3 - o3 * r3, s2 - a), e.quadraticCurveTo(l3, s2 - a, l3, s2 - 0.55 * a), e.lineTo(l3, s2 - 0.2 * a), e.quadraticCurveTo(l3, s2, l3 + o3 * n3, s2), e.quadraticCurveTo(l3, s2, l3, s2 + 0.2 * a), e.lineTo(l3, s2 + 0.55 * a), e.quadraticCurveTo(l3, s2 + a, l3 - o3 * r3, s2 + a);
      }
      break;
    }
    case "close":
      e.moveTo(i2 - 0.8 * a, s2 - 0.55 * a), e.lineTo(i2 + 0.8 * a, s2 - 0.55 * a), e.moveTo(i2 - 0.3 * a, s2 - 0.55 * a), e.lineTo(i2 - 0.3 * a, s2 - 0.85 * a), e.lineTo(i2 + 0.3 * a, s2 - 0.85 * a), e.lineTo(i2 + 0.3 * a, s2 - 0.55 * a), e.moveTo(i2 - 0.6 * a, s2 - 0.55 * a), e.lineTo(i2 - 0.45 * a, s2 + 0.85 * a), e.lineTo(i2 + 0.45 * a, s2 + 0.85 * a), e.lineTo(i2 + 0.6 * a, s2 - 0.55 * a);
  }
  e.stroke(), e.restore();
}
var Ii = class {
  constructor(e) {
    Object.defineProperty(this, "_opts", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_values", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_buttons", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_width", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_plotWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_plotHeight", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_suppressed", { enumerable: true, configurable: true, writable: true, value: false }), this._opts = { font: 11, left: 8, top: 6, row: 0, ...e };
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null;
  }
  zOrder() {
    return "top";
  }
  autoscaleInfo() {
    return null;
  }
  setSuppressed(e) {
    this._suppressed !== e && (this._suppressed = e, e && this._clearGeometry(), this._host?.requestUpdate());
  }
  _clearGeometry() {
    this._buttons = [], this._width = this._plotWidth = this._plotHeight = 0;
  }
  setValue(e, t) {
    this.setValues("" === e ? [] : [{ text: e, color: t }]);
  }
  setValues(e) {
    e.length === this._values.length && e.every((e2, t) => e2.text === this._values[t].text && e2.label === this._values[t].label && e2.color === this._values[t].color && e2.field === this._values[t].field && e2.priority === this._values[t].priority) || (this._values = e.map((e2) => ({ ...e2 })), this._host?.requestUpdate());
  }
  setOptions(e) {
    const t = this._opts.statusLine;
    this._opts = { ...this._opts, ...e }, void 0 !== e.statusLine && (this._opts.statusLine = { ...t, ...e.statusLine }), false === this._opts.visible && this._clearGeometry(), this._host?.requestUpdate();
  }
  _status() {
    const e = this._opts.status;
    return void 0 === e ? vi : ("function" == typeof e ? e() : e) ?? vi;
  }
  options() {
    return this._opts;
  }
  draw(e, t) {
    const i2 = this._opts;
    if (this._suppressed || false === i2.visible) return void this._clearGeometry();
    const s2 = t.dpr, r2 = (i2.font ?? 11) * s2, n2 = yi(i2), o2 = wi(i2), a = ((i2.top ?? 6) + (i2.row ?? 0) * o2) * s2, l2 = a + o2 * s2 / 2, h2 = (i2.left ?? 8) * s2;
    let c2 = h2;
    const d2 = true === i2.hidden, u2 = i2.statusLine ?? gi, _3 = this._status(), p2 = se(t.theme.axisText, 0.55);
    this._plotWidth = Math.max(0, t.plotWidth), this._plotHeight = Math.max(0, t.plotHeight);
    const f2 = Math.max(0, (this._plotWidth - 4) * s2 - h2), m2 = "string" == typeof t.hoverId && t.hoverId.startsWith(`${i2.id}::`), b2 = Math.max(0, Math.floor((f2 / s2 - 6) / (n2 + 2))), g2 = m2 && b2 > 0 ? (i2.actions ?? Oi).slice(-b2) : [], v2 = g2.length ? (g2.length * (n2 + 2) + 6) * s2 : 0;
    e.save(), e.beginPath(), e.rect(0, 0, this._plotWidth * s2, t.plotHeight * s2), e.clip(), e.textBaseline = "middle", e.textAlign = "left", e.globalAlpha = d2 ? 0.45 : 1;
    const y2 = [], w2 = (t2, i3, n3, o3) => (e.font = `${n3 ? "600 " : ""}${r2}px ${bi}`, { k: "text", text: t2, color: i3, bold: n3, w: e.measureText(t2).width, gap: o3 * s2 }), x2 = (e2, t2, i3 = 1) => {
      const s3 = [];
      void 0 !== e2.label && "" !== e2.label && s3.push(w2(e2.label, p2, false, 3)), s3.push(w2(e2.text, e2.color ?? t2, false, 6)), y2.push({ parts: s3, priority: Number.isFinite(e2.priority) ? e2.priority : i3, reading: i3 > 0 });
    };
    let S2;
    if (void 0 !== _3.logo && false !== u2.logo && y2.push({ parts: [{ k: "logo", img: _3.logo, w: 12 * s2, gap: 5 * s2 }], priority: -1 }), void 0 !== i2.color && y2.push({ parts: [{ k: "dot", color: i2.color, w: 6 * s2, gap: 5 * s2 }], priority: -1 }), false !== u2.title) {
      const e2 = u2.titleMode ?? "symbol", s3 = "description" === e2 ? _3.description : "ticker" === e2 ? _3.ticker : void 0;
      S2 = w2(s3 ?? i2.title, t.theme.axisText, true, 6), y2.push({ parts: [S2], priority: 0 });
    }
    void 0 !== i2.params && "" !== i2.params && y2.push({ parts: [w2(i2.params, p2, false, 6)], priority: -3 });
    const P2 = y2.length;
    void 0 !== _3.marketStatus && false !== u2.marketStatus && x2(_3.marketStatus, p2, -4);
    const O2 = i2.valueColor ?? i2.color ?? t.theme.axisText;
    for (const e2 of this._values) Pi(u2, e2.field, i2.hasOpenInterest) && x2(e2, O2);
    void 0 !== _3.lastDayChange && false !== u2.lastDayChange && x2(_3.lastDayChange, O2, -2), e.font = `600 ${r2}px ${bi}`;
    const k2 = Math.max(0, f2 - v2), I2 = g2.length ? Si(e, y2.splice(0, P2), S2, k2) : [], M2 = I2.reduce((e2, t2) => e2 + t2.w + t2.gap, 0), T2 = [...I2, ...Si(e, y2, g2.length ? void 0 : S2, Math.max(0, k2 - M2))], C2 = T2[T2.length - 1];
    if (true === u2.background && void 0 !== C2) {
      const i3 = 4 * s2, r3 = T2.reduce((e2, t2) => e2 + t2.w + t2.gap, 0) + v2 - C2.gap + 2 * i3;
      e.globalAlpha = 1, e.fillStyle = se(u2.backgroundColor ?? t.theme.background, u2.backgroundOpacity ?? 0.8), e.beginPath(), e.roundRect(h2 - i3, l2 - o2 / 2 * s2, r3, o2 * s2, 4 * s2), e.fill(), e.globalAlpha = d2 ? 0.45 : 1;
    }
    for (let t2 = 0; t2 < T2.length; t2++) {
      t2 === I2.length && (c2 += v2);
      const i3 = T2[t2];
      "text" === i3.k ? (e.font = `${i3.bold ? "600 " : ""}${r2}px ${bi}`, e.fillStyle = i3.color, e.fillText(i3.text, c2, l2)) : "dot" === i3.k ? (e.fillStyle = i3.color, e.beginPath(), e.arc(c2 + 3 * s2, l2, 3 * s2, 0, 2 * Math.PI), e.fill()) : e.drawImage(i3.img, c2, l2 - i3.w / 2, i3.w, i3.w), c2 += i3.w + i3.gap;
    }
    if (this._width = c2 / s2, c2 = h2 + M2, this._buttons = [], g2.length > 0) {
      const r3 = (g2.length * (n2 + 2) + 6) * s2;
      e.globalAlpha = 1, e.fillStyle = se(t.theme.background, 0.82), e.beginPath(), e.roundRect(c2 - 3 * s2, l2 - o2 / 2 * s2, r3, o2 * s2, 5 * s2), e.fill(), c2 += 2 * s2;
      for (const r4 of g2) {
        const o3 = `${i2.id}::${r4}`, h3 = c2;
        this._buttons.push({ id: o3, x: h3 / s2, y: a / s2 });
        const u3 = t.hoverId === o3;
        u3 && (e.fillStyle = se(t.theme.axisText, 0.16), e.beginPath(), e.roundRect(h3, l2 - n2 / 2 * s2, n2 * s2, n2 * s2, 4 * s2), e.fill()), e.globalAlpha = d2 ? 0.5 : u3 ? 1 : 0.75, e.fillStyle = "close" === r4 && u3 ? "#ff6b6b" : t.theme.axisText, ki(e, r4, h3 + n2 / 2 * s2, l2, n2, s2, i2), e.globalAlpha = 1, c2 += (n2 + 2) * s2;
      }
    }
    this._width = Math.max(this._width, c2 / s2), e.restore();
  }
  hitTest(e, t) {
    if (this._suppressed || false === this._opts.visible) return null;
    if (e < 0 || e >= this._plotWidth || t < 0 || t >= this._plotHeight) return null;
    const i2 = this._opts, s2 = wi(i2), r2 = (i2.top ?? 6) + (i2.row ?? 0) * s2;
    if (t < r2 || t > r2 + s2) return null;
    const n2 = yi(i2);
    for (const t2 of this._buttons) if (e >= t2.x && e <= t2.x + n2) return { externalId: t2.id, zOrder: "top", distance: 0, cursor: "pointer" };
    const o2 = Math.max(this._width, (i2.left ?? 8) + 40) + 130;
    return e >= (i2.left ?? 8) - 4 && e <= o2 ? { externalId: `${i2.id}::row`, zOrder: "top", distance: 0, cursor: "default" } : null;
  }
};
function Mi(e) {
  return "canvas2d" === e.kind || void 0 === e.device ? null : e.device.lost ? "context-lost" : e.device.available ? null : "unavailable";
}
var Ti = /* @__PURE__ */ new Map();
function Ci(e, t) {
  Ti.set(e, t);
}
function Li(e = "canvas2d") {
  const t = Ti.get("canvas2d");
  if (void 0 === t) throw new Error("openalgo-charts: no canvas2d render backend is registered");
  if ("auto" === e) {
    const e2 = Ti.get("webgl2");
    return void 0 === e2 ? t : () => e2() ?? t();
  }
  const i2 = Ti.get(e);
  if (void 0 === i2) throw new Error(`openalgo-charts: render backend "${e}" is not registered; import the tier that provides it first`);
  return "canvas2d" === e ? i2 : () => i2() ?? t();
}
var Ri = class {
  constructor() {
    Object.defineProperty(this, "kind", { enumerable: true, configurable: true, writable: true, value: "canvas2d" }), Object.defineProperty(this, "_canvas", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_ctx", { enumerable: true, configurable: true, writable: true, value: null });
  }
  mount(e, t) {
    if (this._canvas = e, this._ctx = t ?? e.getContext("2d"), null === this._ctx) throw new Error("openalgo-charts: 2D canvas context is not available");
  }
  resize(e, t, i2) {
  }
  beginFrame(e) {
    e && null !== this._ctx && null !== this._canvas && (this._ctx.setTransform(1, 0, 0, 1, 0, 0), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height));
  }
  drawSeries(e, t, i2, s2, r2, n2, o2) {
    null !== this._ctx && e.draw(this._ctx, t, i2, s2, r2, n2, o2);
  }
  endFrame() {
  }
  overlay2d() {
    return this._ctx;
  }
  destroy() {
    this._ctx = null, this._canvas = null;
  }
};
function Fi(e, t) {
  if ("string" == typeof e.color) return e.color;
  const i2 = t ? e.upColor : e.downColor;
  return "string" == typeof i2 ? i2 : "string" == typeof e.closeColor ? e.closeColor : void 0;
}
Ci("canvas2d", () => new Ri());
var zi = { bottom: 0, normal: 2, top: 3 };
var Ei = { start: 0, lastTime: 0 };
var Bi = { kind: "ohlc", dpr: 1, factor: 1 };
var $i = new Set(Le().map(Ae));
var Di = class {
  constructor(e, t = new Ri()) {
    Object.defineProperty(this, "element", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "base", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "top", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_separator", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_backend", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_rightScale", { enumerable: true, configurable: true, writable: true, value: new w() }), Object.defineProperty(this, "_leftScale", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_overlayScales", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_axisLayout", { enumerable: true, configurable: true, writable: true, value: new z() }), Object.defineProperty(this, "_ratioLocks", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "weight", { enumerable: true, configurable: true, writable: true, value: 1 }), Object.defineProperty(this, "_series", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_primitives", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_primitiveScales", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_stackAbove", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_source", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_destroyed", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_width", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_height", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_drawItems", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_hitBoxes", { enumerable: true, configurable: true, writable: true, value: Ye() }), Object.defineProperty(this, "_hitEpoch", { enumerable: true, configurable: true, writable: true, value: 0 }), this.element = e.createElement("div"), this.element.style.position = "relative", this.element.style.width = "100%", this.element.style.flex = "1 1 auto", this.element.style.overflow = "hidden", this.element.style.borderTopStyle = "solid", this.element.style.borderTopWidth = "0px", this.element.style.boxSizing = "border-box", this.base = new d(e, 0), this.top = new d(e, 1), this.element.appendChild(this.base.element), this.element.appendChild(this.top.element);
    const i2 = e.createElement("div"), s2 = i2.style;
    s2.position = "absolute", s2.left = "0", s2.top = "0", s2.width = "100%", s2.height = "0px", s2.zIndex = "2", s2.pointerEvents = "none", s2.display = "none", this._separator = i2, this.element.appendChild(i2), this._backend = t, t.mount(this.base.element, this.base.ctx);
  }
  get backend() {
    return this._backend;
  }
  setBackend(e) {
    e !== this._backend && (this._backend.destroy(), this._backend = e, e.mount(this.base.element, this.base.ctx), this._width > 0 && this._height > 0 && e.resize(this._width, this._height, this.base.pixelRatio));
  }
  get backendDegradation() {
    return Mi(this._backend);
  }
  get priceScale() {
    return this._rightScale;
  }
  addSeries(e) {
    this._scaleFor(e.scaleId), this._series.push(e), this._hitEpoch++;
  }
  _scaleFor(e) {
    if (this._axisLayout.register(e), "left" === e) return this._leftScale ?? (this._leftScale = new w());
    if ("" === e || e.startsWith("overlay:")) {
      let t = this._overlayScales.get(e);
      return t || (t = new w(), this._overlayScales.set(e, t)), t;
    }
    return this._rightScale;
  }
  scaleFor(e) {
    return this._scaleFor(e);
  }
  usesScale(e) {
    if (this._series.some((t) => t.scaleId === e)) return true;
    for (const t of this._primitiveScales.values()) if (t === e) return true;
    return false;
  }
  axisPlacement(e) {
    return this._axisLayout.get(e);
  }
  setAxisPlacement(e, t, i2) {
    return !!this._axisLayout.set(e, t, i2) && (this._hitEpoch++, this._retainPlacedScales(), true);
  }
  restoreAxisPlacements(e) {
    this._axisLayout.restore(e), this._hitEpoch++, this._retainPlacedScales();
  }
  _retainPlacedScales() {
    for (const { scaleId: e } of this._axisLayout.entries()) this._axisLayout.configured(e) && this._scaleFor(e);
  }
  visibleAxes(e = true) {
    const t = e && 0 === this._series.length && 0 === this._primitiveScales.size;
    return this._axisLayout.entries().filter((e2) => "hidden" !== e2.side && (this.usesScale(e2.scaleId) || t && "right" === e2.scaleId)).sort((e2, t2) => e2.side.localeCompare(t2.side) || e2.order - t2.order);
  }
  axisSlots(e) {
    if (true === e.collapsed) return [];
    const t = this._layout(e), i2 = { left: 0, right: 0 };
    return this.visibleAxes(e.emptyPriceAxis).map((s2) => {
      const r2 = e.axisColumnWidth ?? ("left" === s2.side ? t.plotLeft : t.priceAxisWidth), n2 = i2[s2.side]++;
      return { ...s2, width: r2, x: "left" === s2.side ? -(n2 + 1) * r2 : t.plotWidth + n2 * r2 };
    }).filter((e2) => e2.width > 0);
  }
  moveSeriesScale(e, t) {
    if (e === t || !this.usesScale(e) || this.usesScale(t)) return false;
    this._hitEpoch++;
    const i2 = this._scaleFor(e), s2 = this._scaleFor(t);
    this._axisLayout.set(t, t), this._axisLayout.set(e, e), "left" === t ? (this._leftScale = i2, this._rightScale = s2) : (this._rightScale = i2, this._leftScale = s2);
    for (const i3 of this._series) i3.scaleId === e && (i3.scaleId = t);
    for (const [i3, s3] of this._primitiveScales) s3 === e && this._primitiveScales.set(i3, t);
    s2.setFixedRange(null), s2.setAutoScale(true), s2.reset();
    const r2 = this._ratioLocks.get(e);
    return void 0 !== r2 && (this._ratioLocks.delete(e), this._ratioLocks.set(t, r2)), true;
  }
  ratioLocked(e) {
    return this._ratioLocks.has(e);
  }
  setRatioLock(e, t, i2, s2) {
    if (!t) return this._ratioLocks.delete(e), true;
    const r2 = this._scaleFor(e);
    return !!(r2.scaled && i2 > 0 && s2 > 0) && (r2.setAutoScale(false), this._ratioLocks.set(e, { barSpacing: i2, height: s2 }), true);
  }
  clearRatioLocks() {
    this._ratioLocks.clear();
  }
  scaleOf(e) {
    return this._scaleFor(e.scaleId);
  }
  scales() {
    const e = [this.priceScale];
    return null !== this._leftScale && e.push(this._leftScale), e.push(...this._overlayScales.values()), e;
  }
  scaleStates() {
    const e = [["right", this.priceScale]];
    return null !== this._leftScale && e.push(["left", this._leftScale]), e.push(...this._overlayScales), Object.fromEntries(e.map(([e2, t]) => {
      const i2 = t.options, s2 = { marginTop: i2.marginTop, marginBottom: i2.marginBottom, minMove: i2.minMove, minPrecision: i2.minPrecision, mode: i2.mode, inverted: i2.inverted, autoScale: t.autoScale, fixedRange: t.fixedRange, placement: this._axisLayout.get(e2) };
      t.autoScale || (s2.range = t.priceRange());
      const r2 = this._ratioLocks.get(e2);
      return r2 && !t.autoScale && (s2.ratioLock = { ...r2 }), [e2, s2];
    }));
  }
  axisScales() {
    return this._axisLayout.entries().filter((e) => "hidden" !== e.side).map((e) => this._scaleFor(e.scaleId));
  }
  hasLeftScale() {
    return null !== this._leftScale && this.usesScale("left");
  }
  removeSeries(e) {
    const t = this._series.indexOf(e);
    if (t < 0) return false;
    if (this._series.splice(t, 1), this._drawItems.delete(e), this._hitEpoch++, !this.usesScale(e.scaleId)) {
      const t2 = this._scaleFor(e.scaleId);
      t2.reset(), "" === e.scaleId || "hidden" !== this._axisLayout.get(e.scaleId).side || this._axisLayout.configured(e.scaleId) || t2.hasConfiguration() || this._ratioLocks.has(e.scaleId) || this._overlayScales.delete(e.scaleId);
    }
    return true;
  }
  series() {
    return this._series;
  }
  reorderSeries(e) {
    const t = new Set(e), i2 = e.filter((e2) => this._series.includes(e2));
    this._hitEpoch++;
    let s2 = 0;
    for (let e2 = 0; e2 < this._series.length; e2++) t.has(this._series[e2]) && (this._series[e2] = i2[s2++]);
  }
  setSourceSeries(e) {
    this._source = e, this._hitEpoch++;
  }
  _shownSource() {
    const e = this._source;
    return null !== e && false !== e.style.visible && Ae(e.type).isPriceSeries && this._series.includes(e) ? e : void 0;
  }
  moveSeries(e, t) {
    const i2 = this._series.indexOf(e);
    if (i2 < 0 || e === t) return;
    this._hitEpoch++, this._series.splice(i2, 1);
    const s2 = null === t ? -1 : this._series.indexOf(t);
    this._series.splice(s2 < 0 ? this._series.length : s2, 0, e);
  }
  reorderPrimitives(e) {
    const t = new Set(e), i2 = e.filter((e2) => this._primitives.includes(e2));
    this._hitEpoch++;
    let s2 = 0;
    for (let e2 = 0; e2 < this._primitives.length; e2++) t.has(this._primitives[e2]) && (this._primitives[e2] = i2[s2++]);
  }
  transferPrimitive(e, t) {
    const i2 = this._primitives.indexOf(e);
    if (i2 < 0 || t === this || t._destroyed || t.hasPrimitive(e)) return false;
    const s2 = this._primitiveScales.get(e);
    void 0 !== s2 && t._scaleFor(s2);
    const r2 = this._stackAbove.get(e);
    return this._primitives.splice(i2, 1), this._primitiveScales.delete(e), this._stackAbove.delete(e), this._hitEpoch++, t._hitEpoch++, t._primitives.push(e), void 0 !== s2 && t._primitiveScales.set(e, s2), void 0 !== r2 && t._stackAbove.set(e, r2), true;
  }
  setPrimitiveStackAbove(e, t) {
    return !(this._destroyed || !this.hasPrimitive(e)) && (null === t ? this._stackAbove.delete(e) : this._stackAbove.set(e, t), true);
  }
  primitiveStackAbove(e) {
    return this._stackAbove.get(e) ?? null;
  }
  _slotted(e, t) {
    if (0 === this._stackAbove.size || void 0 === t.stackSlot) return null;
    let i2 = null;
    for (const s2 of e) {
      const e2 = this._stackAbove.get(s2), r2 = void 0 === e2 ? void 0 : t.stackSlot(e2);
      void 0 !== r2 && this._series.includes(r2) && (i2 ?? (i2 = /* @__PURE__ */ new Map())).set(s2, r2);
    }
    return i2;
  }
  paintsBelowSeries(e, t, i2) {
    const s2 = this._stackAbove.get(e), r2 = void 0 === s2 ? void 0 : i2.stackSlot?.(s2), n2 = void 0 === r2 ? -1 : this._series.indexOf(r2);
    return n2 >= 0 ? n2 < this._series.indexOf(t) : "bottom" === e.zOrder();
  }
  bindPrimitiveScale(e, t) {
    return !(this._destroyed || !this.hasPrimitive(e)) && (!(null !== t && !N(t)) && (this.primitiveScaleId(e) !== t && (this._hitEpoch++, null === t ? this._primitiveScales.delete(e) : (this._scaleFor(t), this._primitiveScales.set(e, t)), true)));
  }
  primitiveScaleId(e) {
    return this._primitiveScales.get(e) ?? null;
  }
  primitives() {
    return this._primitives;
  }
  addPrimitive(e, t) {
    this._primitives.push(e), this._hitEpoch++, e.attached?.(void 0 === e.hitBounds ? t : /* @__PURE__ */ function(e2) {
      return { requestUpdate: () => {
        Ke++, e2.requestUpdate();
      } };
    }(t));
  }
  hasPrimitive(e) {
    return this._primitives.includes(e);
  }
  removePrimitive(e) {
    const t = this._primitives.indexOf(e);
    return !(t < 0) && (this._primitives.splice(t, 1), this._primitiveScales.delete(e), this._stackAbove.delete(e), this._hitEpoch++, e.detached?.(), true);
  }
  destroy() {
    this._destroyed = true, this._primitiveScales.clear(), this._stackAbove.clear(), this._drawItems.clear(), this._hitBoxes.clear();
    for (const e of this._primitives) e.detached?.();
    this._primitives.length = 0, this._backend.destroy(), this.element.remove();
  }
  _primitiveContext(e) {
    const t = this._layout(e), i2 = this.axisSlots(e).find((e2) => "right" === e2.scaleId);
    return { timeScale: e.timeScale, priceScale: this.priceScale, readoutPriceScale: this._readoutScale(), dataLayer: e.dataLayer, plotWidth: t.plotWidth, plotHeight: t.plotHeight, priceAxisWidth: i2?.width ?? 0, priceAxisSide: i2?.side ?? "hidden", priceAxisOffset: i2 ? i2.x + ("left" === i2.side ? i2.width : 0) : void 0, dpr: e.dpr, theme: e.theme, hoverId: e.hoverId ?? null, hoverKey: e.hoverKey ?? null, dragId: e.dragId ?? null, bars: () => {
      for (const t2 of null !== this._source && this._series.includes(this._source) ? [this._source, ...this._series] : this._series) if (Ae(t2.type).isPriceSeries) return e.dataLayer.seriesBars(t2.dataId);
      return [];
    } };
  }
  _boundPrimitiveContext(e, t, i2) {
    const s2 = this._primitiveScales.get(e);
    if (void 0 === s2) return t;
    const r2 = this.axisSlots(i2).find((e2) => e2.scaleId === s2);
    return { ...t, priceScale: this._scaleFor(s2), priceAxisSide: r2?.side ?? "hidden", priceAxisWidth: r2?.width ?? 0, priceAxisOffset: r2 ? r2.x + ("left" === r2.side ? r2.width : 0) : void 0 };
  }
  _live(e) {
    return true === e.collapsed ? this._primitives.filter((e2) => e2 instanceof Ii) : this._primitives;
  }
  hitTestPrimitives(e, t, i2, s2) {
    const r2 = this._primitiveContext(i2), n2 = this._live(i2), o2 = this._slotted(n2, i2);
    this._checkHitBoxes(i2);
    let a = null, l2 = 0;
    for (let h2 = 0; h2 < n2.length; h2++) {
      const c2 = n2[h2];
      if (!c2.hitTest || c2 === s2) continue;
      let d2, u2 = this._hitBoxes.kept(h2);
      if (void 0 === u2 && (u2 = this._hitBoxes.measure(h2, c2, d2 = this._boundPrimitiveContext(c2, r2, i2))), !Xe(u2, e, t)) continue;
      d2 ?? (d2 = this._boundPrimitiveContext(c2, r2, i2));
      let _3 = c2.hitTest(e, t, d2);
      if (null === _3) continue;
      this._primitiveScales.has(c2) && (_3 = { ..._3, priceScale: d2.priceScale });
      const p2 = _3.paintedBy ?? c2, f2 = o2?.get(p2);
      void 0 !== f2 && (_3 = { ..._3, paintedBy: p2 });
      const m2 = void 0 !== f2 ? 1 + (this._series.indexOf(f2) + 1) / (this._series.length + 1) : zi[p2 === c2 ? _3.zOrder : p2.zOrder()], b2 = +(m2 >= 2) - +(l2 >= 2);
      if ((null === a || b2 > 0 || 0 === b2 && (_3.distance < a.distance || _3.distance === a.distance && m2 > l2)) && (a = _3, l2 = m2, 0 === a.distance && l2 >= zi.top)) break;
    }
    return a;
  }
  _paintedHitBoxes(e) {
    this._checkHitBoxes(e), this._hitBoxes.painted();
  }
  _checkHitBoxes(e) {
    const t = this._hitBoxes, i2 = e.timeScale, s2 = e.dataLayer;
    t.begin(), t.number(this._hitEpoch), t.number(e.dpr), t.number(this._width), t.number(this._height), t.number(e.priceAxisWidth), t.number(e.leftAxisWidth ?? 0), t.number(e.axisColumnWidth ?? -1), t.number(e.showTimeAxis ? e.timeAxisHeight : -1), t.number(true === e.collapsed ? 1 : 0), t.number(false === e.emptyPriceAxis ? 0 : 1), t.number(i2.barSpacing), t.number(i2.rightOffset), t.number(i2.width), t.number(s2.length), t.number(s2.indexToTime(0) ?? NaN), t.number(s2.indexToTime(s2.baseIndex) ?? NaN), t.scale(this._rightScale), null !== this._leftScale && t.scale(this._leftScale);
    for (const e2 of this._overlayScales.values()) t.scale(e2);
    t.ref(e.hoverId ?? null), t.ref(e.hoverKey ?? null), t.ref(e.dragId ?? null), t.ref(e.theme), t.ref(s2.sessionCalendar), t.ref(this._readoutScale()), t.ref(this._rightScale), t.end();
  }
  setSeparator(e, t) {
    const i2 = function(e2) {
      return !(e2 > 0) || !Number.isFinite(e2) || Number.isInteger(e2);
    }(t) ? e : null, s2 = null === i2 ? e : null, r2 = this.element.style;
    r2.borderTopWidth = null === i2 ? "0px" : "1px", r2.borderTopColor = i2 ?? "transparent";
    const n2 = this._separator.style;
    n2.display = null === s2 ? "none" : "", n2.height = `${null === s2 ? 0 : function(e2) {
      return e2 > 0 && Number.isFinite(e2) ? Math.max(1, Math.floor(e2)) / e2 : 1;
    }(t)}px`, n2.background = s2 ?? "transparent";
  }
  resize(e, t, i2) {
    this._width = e, this._height = t, this.base.resize(e, t, i2), this.top.resize(e, t, i2), this._backend.resize(e, t, i2);
  }
  setLayoutSize(e, t) {
    this._width = e, this._height = t;
  }
  setScaleHeights(e) {
    this.priceScale.setHeight(e), this._leftScale?.setHeight(e);
    for (const t of this._overlayScales.values()) t.setHeight(e);
  }
  _layout(e) {
    const t = e.leftAxisWidth ?? 0;
    return { plotWidth: Math.max(0, this._width - e.priceAxisWidth - t), plotHeight: Math.max(0, this._height - (e.showTimeAxis ? e.timeAxisHeight : 0)), priceAxisWidth: e.priceAxisWidth, timeAxisHeight: e.showTimeAxis ? e.timeAxisHeight : 0, plotLeft: t };
  }
  autoscale(e, t = 1) {
    let i2 = false;
    const s2 = this._layout(e), r2 = e.timeScale.visibleRange();
    i2 = this._autoscaleScale(this.priceScale, "right", e, s2.plotHeight, r2, t) || i2, this._leftScale && (i2 = this._autoscaleScale(this._leftScale, "left", e, s2.plotHeight, r2, t) || i2);
    for (const [n2, o2] of this._overlayScales) i2 = this._autoscaleScale(o2, n2, e, s2.plotHeight, r2, t) || i2;
    this._ratioLocks.size > 0 && this._applyRatioLocks(e.timeScale.barSpacing, s2.plotHeight);
    for (const e2 of this._primitives) e2.afterAutoscale?.();
    return i2;
  }
  _autoscaleScale(e, t, i2, s2, r2, n2) {
    const o2 = true === i2.priceOnlyAutoScale && this._series.some((e2) => e2.dataId === i2.primaryDataId && e2.scaleId === t), a = (e2) => e2.scaleId === t && (!o2 || e2.dataId === i2.primaryDataId);
    e.setHeight(s2);
    const l2 = e.options.mode;
    if ("percentage" !== l2 && "indexed-to-100" !== l2 || e.setBaseline(this._firstVisibleValue(a, i2, r2, o2)), !e.autoScale) return false;
    let h2 = 1 / 0, c2 = -1 / 0;
    for (const e2 of this._series) {
      if (false === e2.style.visible || !a(e2)) continue;
      const t2 = Ae(e2.type), s3 = e2.style.barOffset ?? 0, n3 = i2.dataLayer, o3 = n3.seriesBars(e2.dataId), l3 = Ei;
      if (C(n3, o3, r2.from - s3, r2.to - s3, l3)) for (let i3 = l3.start; i3 < o3.length; i3++) {
        const s4 = o3[i3];
        if (s4.time > l3.lastTime) break;
        if (void 0 === n3.timeToIndex(s4.time)) continue;
        const r3 = t2.extents(s4, e2.style);
        r3.min < h2 && (h2 = r3.min), r3.max > c2 && (c2 = r3.max);
      }
    }
    for (const e2 of this._primitives) {
      if (o2) break;
      if ((this._primitiveScales.get(e2) ?? "right") !== t) continue;
      const i3 = e2.autoscaleInfo?.();
      i3 && (i3.min < h2 && (h2 = i3.min), i3.max > c2 && (c2 = i3.max));
    }
    return h2 <= c2 && e.autoscale(h2, c2, n2);
  }
  _applyRatioLocks(e, t) {
    if (e > 0 && t > 0) for (const [i2, s2] of this._ratioLocks) {
      const r2 = t / e / (s2.height / s2.barSpacing);
      if (s2.barSpacing = e, s2.height = t, !isFinite(r2) || r2 <= 0 || Math.abs(r2 - 1) < 1e-9) continue;
      const n2 = this._scaleFor(i2);
      n2.scaled && this._scaleSpan(n2, r2);
    }
  }
  _scaleSpan(e, t) {
    const i2 = e.height;
    if (!(i2 > 0)) return;
    const s2 = i2 / 2 * t, r2 = e.yToPrice(i2 / 2 - s2), n2 = e.yToPrice(i2 / 2 + s2);
    isFinite(r2) && isFinite(n2) && r2 !== n2 && e.setPriceRange({ min: Math.min(r2, n2), max: Math.max(r2, n2) });
  }
  _firstVisibleValue(e, t, i2, s2 = false) {
    const r2 = this._shownSource();
    for (const n2 of r2 ? [r2, ...this._series] : this._series) {
      if (false === n2.style.visible || !e(n2)) continue;
      const r3 = s2 ? n2.style.barOffset ?? 0 : 0, o2 = t.dataLayer, a = o2.seriesBars(n2.dataId), l2 = Ei;
      if (C(o2, a, i2.from - r3, i2.to - r3, l2)) for (let e2 = l2.start; e2 < a.length; e2++) {
        const t2 = a[e2];
        if (t2.time > l2.lastTime) break;
        if (void 0 !== o2.timeToIndex(t2.time) && isFinite(t2.close)) return t2.close;
      }
    }
    return null;
  }
  paintBase(e, t) {
    const i2 = this._layout(e), s2 = e.dpr, r2 = t ?? this._backend.overlay2d() ?? this.base.ctx;
    void 0 === t && this._backend.beginFrame(true);
    const n2 = true !== e.collapsed, o2 = this._live(e), a = q(e.theme, e.canvasOptions?.scales);
    false !== e.paintBackground && "transparent" !== e.theme.background && (r2.fillStyle = e.theme.background, r2.fillRect(0, 0, Math.round(this._width * s2), Math.round(this._height * s2))), r2.save(), i2.plotLeft > 0 && r2.translate(Math.round(i2.plotLeft * s2), 0);
    const l2 = e.canvasOptions?.grid, h2 = function(e2, t2, i3) {
      const s3 = Math.max(1, i3.spacing), r3 = [];
      if (false !== i3.vertLines) for (let t3 = s3; t3 < e2; t3 += s3) r3.push(t3);
      const n3 = [];
      if (false !== i3.horzLines) for (let e3 = s3; e3 < t2; e3 += s3) n3.push(e3);
      return { verticals: r3, horizontals: n3 };
    }(i2.plotWidth, i2.plotHeight, { ...l2, spacing: l2?.spacing ?? 60, vertLines: e.showVertGrid && n2, horzLines: e.showHorzGrid && n2 });
    (h2.verticals.length > 0 || h2.horizontals.length > 0) && function(e2, t2, i3, s3, r3, n3) {
      e2.save(), e2.lineWidth = Math.max(1, Math.round(n3.lineWidth * r3));
      const o3 = Math.round(i3 * r3), a2 = Math.round(s3 * r3);
      $(e2, t2.verticals, true, n3.vert, n3, r3, o3, a2), $(e2, t2.horizontals, false, n3.horz, n3, r3, o3, a2), e2.setLineDash([]), e2.restore();
    }(r2, h2, i2.plotWidth, i2.plotHeight, s2, B(e.theme, l2, s2)), r2.save(), r2.beginPath(), r2.rect(0, 0, Math.round(i2.plotWidth * s2), Math.round(i2.plotHeight * s2)), r2.clip();
    const c2 = this._primitiveContext(e), d2 = this._slotted(o2, e);
    for (const t2 of o2) "bottom" !== t2.zOrder() || d2?.has(t2) || t2.draw(r2, this._boundPrimitiveContext(t2, c2, e));
    const { readout: u2, lastEntry: _3, valueTags: p2 } = this._paintSeriesPass(r2, e, i2, n2, c2, d2, t);
    void 0 === t && this._backend.endFrame(), r2.restore();
    const f2 = this.axisSlots(e), m2 = { up: e.theme.lastPriceUp, down: e.theme.lastPriceDown, text: e.theme.lastPriceText }, b2 = _3;
    null !== b2 && b2.showLine && function(e2, t2, i3, s3, r3, n3, o3 = ii) {
      const a2 = Math.round(t2.priceToY(i3) * n3);
      if (!Number.isFinite(a2) || a2 < 0 || a2 > r3.plotHeight * n3) return;
      const l3 = s3 ? o3.up : o3.down, h3 = Math.round(r3.plotWidth * n3);
      e2.save(), e2.strokeStyle = l3, e2.lineWidth = Math.max(1, Math.round(n3)), e2.setLineDash([3 * n3, 3 * n3]), e2.beginPath(), e2.moveTo(0, a2 + 0.5), e2.lineTo(h3, a2 + 0.5), e2.stroke(), e2.setLineDash([]), e2.restore();
    }(r2, u2, b2.close, b2.up, i2, s2, m2);
    const g2 = null !== this._source && this._series.includes(this._source) ? e.barCountdown : void 0, v2 = (e2) => null !== b2 && b2.showTag && u2 === e2;
    this._paintAxisLadders(r2, i2, s2, f2, p2, b2, v2, g2, a);
    for (const t2 of o2) "normal" !== t2.zOrder() || d2?.has(t2) || t2.draw(r2, this._boundPrimitiveContext(t2, c2, e));
    for (const e2 of f2) null !== b2 && v2(this._scaleFor(e2.scaleId)) && this._inAxisSlot(r2, e2, i2, s2, (t2, i3) => ui(r2, t2, b2.close, b2.up, i3, s2, a, { colors: m2, countdown: g2, side: e2.side }));
    e.showTimeAxis && (!function(e2, t2, i3, s3, r3, n3 = Ht, o3, a2) {
      const l3 = t2.visibleRange(), h3 = Math.max(0, Math.floor(l3.from)), c3 = Math.min(i3.baseIndex, Math.ceil(l3.to));
      if (c3 < h3) return;
      const d3 = Math.max(1, Math.round(80 / Math.max(1, t2.barSpacing))), u3 = Math.round(s3.plotHeight * r3);
      let _4 = Number.POSITIVE_INFINITY;
      {
        let e3 = i3.indexToTime(h3), t3 = Number.POSITIVE_INFINITY;
        for (let s4 = h3 + 1; s4 <= c3; s4++) {
          const r4 = i3.indexToTime(s4);
          if (void 0 !== r4 && void 0 !== e3) {
            const i4 = r4 - e3;
            i4 > 0 && Math.floor(r4 / 60) !== Math.floor(e3 / 60) ? _4 = Math.min(_4, i4) : i4 > 0 && (t3 = Math.min(t3, i4));
          }
          void 0 !== r4 && (e3 = r4);
        }
        Number.isFinite(_4) || (_4 = t3);
      }
      const p3 = _4 * d3, f3 = Number.isFinite(p3) && p3 < 60, m3 = void 0 !== a2 && a2 !== ct && pt(a2) ? a2 : ct, b3 = m3 === ct, g3 = b3 ? Qt : (e3, t3) => yt(e3, t3, m3), v3 = b3 ? ot : (e3) => Lt(e3, m3), y2 = b3 ? it : (e3) => jt(e3, m3), w2 = b3 ? st : (e3) => At(e3, m3);
      e2.save(), e2.fillStyle = n3.textColor, e2.strokeStyle = n3.lineColor, e2.font = pi(n3.font, r3), e2.textAlign = "center", e2.textBaseline = "top", e2.lineWidth = 1, e2.beginPath(), e2.moveTo(0, u3 + 0.5), e2.lineTo(Math.round(s3.plotWidth * r3), u3 + 0.5), e2.stroke();
      const x2 = /* @__PURE__ */ new Set();
      {
        let e3 = i3.indexToTime(h3);
        for (let t3 = h3 + 1; t3 <= c3; t3++) {
          const s4 = i3.indexToTime(t3);
          void 0 !== s4 && (void 0 !== e3 && g3(e3, s4) && x2.add(t3), e3 = s4);
        }
      }
      const S2 = [.../* @__PURE__ */ new Set([...ti(h3, c3, d3), ...x2])].sort((e3, t3) => e3 - t3), P2 = [];
      let O2;
      for (const n4 of S2) {
        const a3 = i3.indexToTime(n4);
        if (void 0 === a3) continue;
        const l4 = Math.round(t2.indexToX(n4) * r3);
        if (l4 < 0 || l4 > s3.plotWidth * r3) {
          O2 = a3;
          continue;
        }
        let h4;
        h4 = o3 ? o3(a3, void 0 === O2 ? "day" : Zt(O2, a3, m3, f3)) : void 0 === O2 || g3(O2, a3) ? v3(a3) : f3 ? w2(a3) : y2(a3), P2.push({ x: l4, text: h4, half: e2.measureText(h4).width / 2, boundary: x2.has(n4) }), O2 = a3;
      }
      const k2 = 4 * r3, I2 = [], M2 = (e3) => I2.every((t3) => e3.x + e3.half + k2 <= t3.x - t3.half || e3.x - e3.half - k2 >= t3.x + t3.half);
      for (const e3 of P2) e3.boundary && M2(e3) && I2.push(e3);
      for (const e3 of P2) !e3.boundary && M2(e3) && I2.push(e3);
      I2.sort((e3, t3) => e3.x - t3.x);
      for (const t3 of I2) e2.fillText(t3.text, t3.x, u3 + 4 * r3);
      e2.restore();
    }(r2, e.timeScale, e.dataLayer, i2, s2, a, e.timeFormatter, e.timezone), void 0 !== e.sessionClock && _i(r2, { ...i2, priceAxisWidth: Math.min(i2.priceAxisWidth, e.axisColumnWidth ?? i2.priceAxisWidth) }, s2, e.sessionClock, a)), r2.restore(), void 0 === t && this._paintedHitBoxes(e);
  }
  _paintSeriesPass(e, t, i2, s2, r2, n2, o2) {
    const a = t.dpr, l2 = t.timeScale.visibleRange(), h2 = this._readoutScale(), c2 = this._shownSource(), d2 = void 0 !== c2 && this._scaleFor(c2.scaleId) === h2 ? c2 : this._series.find((e2) => false !== e2.style.visible && Ae(e2.type).isPriceSeries && this._scaleFor(e2.scaleId) === h2);
    let u2 = null;
    const _3 = [], p2 = t.timeScale.barSpacing, f2 = De(a, t.conflationFactor), m2 = t.conflate && function(e2, t2, i3) {
      return e2 > 0 && e2 * t2 < i3;
    }(p2, a, f2), b2 = Bi;
    b2.dpr = a, b2.factor = t.conflationFactor;
    for (const h3 of this._series) {
      if (false === h3.style.visible || !s2) {
        this._paintSlot(n2, h3, e, r2, t, o2);
        continue;
      }
      const c3 = this._scaleFor(h3.scaleId), g2 = Ae(h3.type), v2 = h3.style.barOffset ?? 0, y2 = m2 && $i.has(g2) ? Be(h3.type) : null;
      null !== y2 && (b2.kind = y2);
      let w2 = this._drawItems.get(h3);
      void 0 === w2 && this._drawItems.set(h3, w2 = He());
      const x2 = w2.priceToY, S2 = w2.build(t.dataLayer, h3.dataId, l2.from - v2, l2.to - v2, v2, t.timeScale, c3, null === y2 ? null : b2, true === g2.connectsBars), P2 = "ohlc" === y2 ? Math.max(p2, f2 / a) : p2;
      if (true === h3.style.colorByPreviousClose && S2.length > 0) {
        const e2 = w2.firstIndex() - 1, i3 = A(t.dataLayer, h3.dataId, e2);
        void 0 !== i3 && (S2[0].prevClose = i3.close);
      }
      let O2 = 0;
      for (let e2 = 0; e2 < S2.length; e2++) {
        const t2 = S2[e2].bar.volume ?? 0;
        t2 > O2 && (O2 = t2);
      }
      const k2 = { plotHeight: i2.plotHeight, maxVolume: O2, theme: t.theme };
      void 0 === o2 ? this._backend.drawSeries(g2, S2, x2, P2, a, h3.style, k2) : g2.draw(e, S2, x2, P2, a, h3.style, k2);
      const I2 = t.dataLayer.lastIndexedBar(h3.dataId);
      if (null !== I2) {
        const e2 = Fi(h3.style, I2.bar.close >= I2.bar.open);
        h3 === d2 && null === u2 ? u2 = { close: I2.bar.close, up: I2.bar.close >= I2.bar.open, showLine: false !== h3.style.priceLineVisible, showTag: false !== h3.style.lastValueVisible && (void 0 === e2 || !re(e2)) } : false !== h3.style.lastValueVisible && void 0 !== e2 && !re(e2) && Number.isFinite(I2.bar.close) && _3.push({ price: I2.bar.close, color: e2, scaleId: h3.scaleId });
      }
      this._paintSlot(n2, h3, e, r2, t, o2);
    }
    return { readout: h2, lastEntry: u2, valueTags: _3 };
  }
  _paintAxisLadders(e, t, i2, s2, r2, n2, o2, a, l2) {
    for (const h2 of s2) this._inAxisSlot(e, h2, t, i2, (s3, c2) => {
      const { side: d2, width: u2, scaleId: _3 } = h2, p2 = r2.filter((e2) => e2.scaleId === _3), f2 = [];
      if (null !== n2 && o2(s3)) {
        const e2 = ai(i2, true === a?.visible), r3 = li(Math.round(s3.priceToY(n2.close) * i2), t.plotHeight * i2, e2, d2);
        null !== r3 && f2.push({ y: r3, height: e2, priority: Gt });
      }
      const m2 = f2.length;
      for (const e2 of p2) {
        const r3 = ai(i2), n3 = li(Math.round(s3.priceToY(e2.price) * i2), t.plotHeight * i2, r3, d2);
        f2.push({ y: n3 ?? NaN, height: r3, priority: Ut });
      }
      const b2 = f2.length > 0 ? Yt(f2, 2 * i2) : [], g2 = f2.length > 0 ? f2.filter((e2, t2) => b2[t2]) : void 0;
      "left" === d2 ? (e.save(), e.translate(-Math.round(u2 * i2), 0), Jt(e, s3, c2, i2, l2, g2, "left"), e.restore()) : Jt(e, s3, c2, i2, l2, g2);
      for (let t2 = 0; t2 < p2.length; t2++) b2[m2 + t2] && di(e, s3, p2[t2].price, p2[t2].color, c2, i2, l2, d2);
    });
  }
  _inAxisSlot(e, t, i2, s2, r2) {
    const { side: n2, width: o2 } = t, a = this._scaleFor(t.scaleId);
    if (!a.scaled) return;
    e.save();
    const l2 = Math.round(t.x * s2), h2 = Math.round((t.x + o2) * s2);
    e.beginPath(), e.rect(l2, 0, h2 - l2, Math.round(i2.plotHeight * s2)), e.clip(), e.translate("left" === n2 ? h2 : l2 - Math.round(i2.plotWidth * s2), 0), r2(a, { ...i2, priceAxisWidth: o2, plotLeft: o2 }), e.restore();
  }
  _paintSlot(e, t, i2, s2, r2, n2) {
    if (null === e) return;
    let o2 = false;
    for (const [a, l2] of e) l2 === t && (o2 || void 0 !== n2 || this._backend.endFrame(), o2 = true, a.draw(i2, this._boundPrimitiveContext(a, s2, r2)));
  }
  paintTop(e, t, i2) {
    void 0 === i2 && this.top.clearBitmap();
    const s2 = this._layout(t), r2 = i2 ?? this.top.ctx, n2 = t.dpr;
    r2.save(), s2.plotLeft > 0 && r2.translate(Math.round(s2.plotLeft * n2), 0);
    const o2 = this._primitiveContext(t), a = this._live(t), l2 = 0 === this._stackAbove.size ? null : this._slotted(a.filter((e2) => "top" === e2.zOrder() && this._stackAbove.has(e2)), t);
    for (const e2 of a) "top" !== e2.zOrder() || l2?.has(e2) || e2.draw(r2, this._boundPrimitiveContext(e2, o2, t));
    if (null !== e) {
      const i3 = fi(t.theme, t.canvasOptions?.crosshair, n2);
      true !== t.collapsed && mi(r2, e.x, e.yLocal, s2.plotWidth, s2.plotHeight, n2, i3.color, i3.width, i3.dash);
      const o3 = t.theme.crosshairLabelBackground ?? i3.color, a2 = false !== t.theme.crosshairLabelVisible, l3 = q(t.theme, t.canvasOptions?.scales);
      if (a2 && null !== e.yLocal) {
        const i4 = this._readoutScale(), a3 = this.axisSlots(t).find((e2) => this._scaleFor(e2.scaleId) === i4);
        if (a3) {
          const h2 = i4.format(i4.yToPrice(e.yLocal)), c2 = Math.round(a3.x * n2), d2 = Math.round((a3.x + a3.width) * n2), u2 = "left" === a3.side ? d2 - function(e2, t2, i5, s3 = Ht) {
            e2.save(), e2.font = pi(s3.font, i5);
            const r3 = e2.measureText(t2).width + 12 * i5 + 1;
            return e2.restore(), r3;
          }(r2, h2, n2, l3) : c2;
          r2.save(), r2.beginPath(), r2.rect(c2, 0, d2 - c2, Math.round(s2.plotHeight * n2)), r2.clip(), function(e2, t2, i5, s3, r3, n3, o4, a4, l4 = Ht) {
            e2.save(), e2.font = pi(l4.font, r3);
            const h3 = 6 * r3, c3 = 16 * r3, d3 = e2.measureText(t2).width;
            e2.fillStyle = n3, e2.textBaseline = "middle", e2.fillRect(i5 + 1, s3 - c3 / 2, d3 + 2 * h3, c3), e2.fillStyle = o4, e2.textAlign = "left", e2.fillText(t2, i5 + 1 + h3, s3), e2.restore();
          }(r2, h2, u2, e.yLocal * n2, n2, o3, t.theme.lastPriceText, 0, l3), r2.restore();
        }
      }
      if (a2 && e.showTimeTag && e.x >= 0 && e.x <= s2.plotWidth) {
        const i4 = Math.round(t.timeScale.xToIndex(e.x)), a3 = t.dataLayer.indexToTime(i4);
        if (void 0 !== a3) {
          !function(e2, t2, i5, s3, r3, n3, o4 = Ht) {
            e2.save(), e2.font = pi(o4.font, r3);
            const a4 = 7 * r3, l4 = 18 * r3, h2 = e2.measureText(t2).width + 2 * a4, c2 = Math.max(0, i5 - h2 / 2), d2 = s3 + 1 * r3, u2 = (n3.radius ?? 4) * r3;
            e2.beginPath(), oe(e2, c2, d2, h2, l4, u2), void 0 !== n3.backplate && (e2.fillStyle = n3.backplate, e2.fill()), e2.fillStyle = n3.background, e2.fill(), void 0 !== n3.border && (e2.strokeStyle = n3.border, e2.lineWidth = Math.max(1, Math.round(r3)), e2.stroke()), e2.fillStyle = n3.textColor, e2.textAlign = "center", e2.textBaseline = "middle", e2.fillText(t2, c2 + h2 / 2, d2 + l4 / 2), e2.restore();
          }(r2, t.timeFormatter ? t.timeFormatter(a3) : Rt(a3, t.timezone ?? ct), e.x * n2, s2.plotHeight * n2, n2, { background: o3, textColor: t.theme.lastPriceText, backplate: t.theme.background }, l3);
        }
      }
    }
    r2.restore(), void 0 === i2 && this._paintedHitBoxes(t);
  }
  _readoutScale() {
    const e = this._shownSource();
    if (void 0 !== e) return this._scaleFor(e.scaleId);
    for (const e2 of this._series) if (false !== e2.style.visible && Ae(e2.type).isPriceSeries) return this._scaleFor(e2.scaleId);
    return this._rightScale;
  }
  readoutScale() {
    return this._readoutScale();
  }
  priceToY(e) {
    return this._readoutScale().priceToY(e);
  }
  yToPrice(e) {
    return this._readoutScale().yToPrice(e);
  }
};
var Wi = { friction: 55e-4, minSpeed: 0.02, triggerSpeed: 0.08 };
var qi = class {
  constructor(e, t = {}) {
    Object.defineProperty(this, "_v0", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_k", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_minSpeed", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_duration", { enumerable: true, configurable: true, writable: true, value: void 0 });
    const i2 = { ...Wi, ...t };
    this._v0 = e, this._k = i2.friction, this._minSpeed = i2.minSpeed;
    const s2 = Math.abs(this._v0) > 0 ? this._minSpeed / Math.abs(this._v0) : 1;
    this._duration = s2 >= 1 ? 0 : -Math.log(s2) / this._k;
  }
  static shouldAnimate(e, t = {}) {
    const i2 = t.triggerSpeed ?? Wi.triggerSpeed;
    return Math.abs(e) >= i2;
  }
  distanceAt(e) {
    const t = Math.min(Math.max(0, e), this._duration);
    return this._v0 / this._k * (1 - Math.exp(-this._k * t));
  }
  get durationMs() {
    return this._duration;
  }
  finished(e) {
    return e >= this._duration;
  }
};
var Vi = { tau: 55, stopFraction: 0.995, minLogStep: 0.02 };
var Hi = class {
  constructor(e, t = {}) {
    Object.defineProperty(this, "_base", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_target", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_epoch", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_tau", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_duration", { enumerable: true, configurable: true, writable: true, value: void 0 });
    const i2 = { ...Vi, ...t };
    this._target = e, this._tau = i2.tau, this._duration = -Math.log(1 - i2.stopFraction) * i2.tau;
  }
  static leadFraction(e = {}) {
    const t = e.tau ?? Vi.tau;
    return 1 - Math.exp(-16.666666666666668 / t);
  }
  static shouldAnimate(e, t = {}) {
    const i2 = t.minLogStep ?? Vi.minLogStep;
    return Math.abs(e) >= i2;
  }
  add(e, t, i2) {
    this._base = t, this._target += e, this._epoch = i2;
  }
  appliedAt(e) {
    const t = e - this._epoch;
    return t <= 0 ? this._base : t >= this._duration ? this._target : this._base + (this._target - this._base) * (1 - Math.exp(-t / this._tau));
  }
  get totalLogFactor() {
    return this._target;
  }
  get durationMs() {
    return this._duration;
  }
  finished(e) {
    return e - this._epoch >= this._duration;
  }
};
var Gi = class {
  constructor(e, t) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_kinetic", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_zoomTarget", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_zoomFocus", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_zoomFrames", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_zoomLastTime", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_animAutoscale", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_autoscaleTime", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_autoscaleFrames", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_navigationEpoch", { enumerable: true, configurable: true, writable: true, value: 0 }), this._host = e, this._animAutoscale = t;
  }
  _step() {
    return this._stepZoomGlide(), this._stepKinetic(), null !== this._zoomTarget || null !== this._kinetic;
  }
  _applyZoom(e, t) {
    false !== this._host._navigation.zoomEnabled && (this._beginAutoscaleMotion(), this._host._mutateTimeScale(() => this._host._timeScale.zoomAtX(e, Math.exp(t))), this._host._maybeLoadHistory(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emitViewport("zoom"));
  }
  _remainingZoom() {
    return null === this._zoomTarget ? 0 : Math.log(this._zoomTarget / this._host._timeScale.barSpacing);
  }
  _retargetZoom(e, t) {
    if (false === this._host._navigation.zoomEnabled) return;
    const i2 = this._host._timeScale, s2 = null === this._zoomTarget, r2 = i2.constrainBarSpacing((s2 ? i2.barSpacing : this._zoomTarget) * Math.exp(t));
    this._zoomFocus = e;
    const n2 = Math.log(r2 / i2.barSpacing);
    if (0 !== n2) {
      if (this._zoomTarget = r2, s2) {
        this._zoomLastTime = this._host._now(), this._zoomFrames = 0;
        const t2 = this._navigationEpoch;
        if (this._applyZoom(e, n2 * Hi.leadFraction({ tau: 70 })), this._host._destroyed || t2 !== this._navigationEpoch || this._zoomTarget !== r2) return;
      }
      this._host._loop.requestFrame();
    } else this._zoomTarget = null;
  }
  _stepZoomGlide() {
    const e = this._zoomTarget;
    if (null === e) return;
    if (this._host._destroyed || false === this._host._navigation.zoomEnabled) return void (this._zoomTarget = null);
    const t = this._host._timeScale, i2 = this._host._now(), s2 = Math.min(64, Math.max(0, i2 - this._zoomLastTime));
    this._zoomLastTime = i2;
    const r2 = Math.log(e / t.barSpacing), n2 = Math.abs(r2) < 1e-3 || ++this._zoomFrames >= 600, o2 = n2 ? r2 : r2 * (1 - Math.exp(-s2 / 70)), a = t.barSpacing;
    0 !== o2 && this._applyZoom(this._zoomFocus, o2), this._zoomTarget !== e || this._host._destroyed || (n2 || 0 !== o2 && t.barSpacing === a) && (this._zoomTarget = null);
  }
  _beginAutoscaleMotion() {
    this._animAutoscale && null === this._autoscaleTime && (this._autoscaleTime = this._host._now() - 16, this._autoscaleFrames = 0);
  }
  _autoscaleFraction() {
    const e = this._host._now(), t = null === this._autoscaleTime || ++this._autoscaleFrames >= 90 ? 1 : 1 - Math.exp(-Math.max(1, e - this._autoscaleTime) / 80);
    return null !== this._autoscaleTime && (this._autoscaleTime = e), t;
  }
  _stopNavigationMotion() {
    this._navigationEpoch++, this._stopZoomGlide(), this._stopKinetic(), this._autoscaleTime = null;
  }
  _stopDisabled(e, t) {
    t && (this._navigationEpoch++, this._stopZoomGlide()), e && this._stopKinetic(), this._autoscaleTime = null;
  }
  _stopZoomGlide() {
    this._zoomTarget = null;
  }
  _startKinetic(e) {
    if (false === this._host._navigation.panEnabled) return;
    this._stopKinetic();
    const t = new qi(e);
    t.durationMs <= 0 || (this._kinetic = { anim: t, start: this._host._now(), travelled: 0, frames: 0 }, this._host._loop.requestFrame());
  }
  _stepKinetic() {
    const e = this._kinetic;
    if (null === e) return;
    if (this._host._destroyed || false === this._host._navigation.panEnabled) return void (this._kinetic = null);
    const t = this._host._now() - e.start, s2 = e.anim.distanceAt(t), r2 = s2 - e.travelled;
    e.travelled = s2, this._beginAutoscaleMotion(), this._host._mutateTimeScale(() => this._host._timeScale.setRightOffset(this._host._timeScale.rightOffset - r2 / this._host._timeScale.barSpacing)), this._host._maybeLoadHistory(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emitViewport("pan"), this._kinetic === e && (e.anim.finished(t) || ++e.frames >= 600) && (this._kinetic = null);
  }
  _stopKinetic() {
    this._kinetic = null;
  }
};
var Ui = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_resizeObserver", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_deviceObserver", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_ratioQuery", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_ratioView", { enumerable: true, configurable: true, writable: true, value: null }), this._host = e;
  }
  _observeSize() {
    if ("undefined" != typeof ResizeObserver && (this._resizeObserver = new ResizeObserver((e) => {
      const t = e[0];
      t && (this._host.applySize(t.contentRect.width, t.contentRect.height), this._host._paintNow());
    }), this._resizeObserver.observe(this._host._container), "undefined" != typeof ResizeObserverEntry && "devicePixelContentBoxSize" in ResizeObserverEntry.prototype)) {
      this._deviceObserver = new ResizeObserver((e) => this._onDevicePixels(e));
      for (const e of this._host._panes) this._observeCanvases(e, true);
    }
  }
  _observeCanvases(e, t) {
    const i2 = this._deviceObserver;
    if (null !== i2) for (const s2 of [e.base, e.top]) t ? i2.observe(s2.element, { box: "device-pixel-content-box" }) : i2.unobserve(s2.element);
  }
  _onDevicePixels(e) {
    if (this._host._destroyed || this._host._destroying) return;
    let t = false;
    for (const i2 of e) {
      const e2 = this._canvasLayerOf(i2.target), s2 = i2.devicePixelContentBoxSize?.[0], r2 = i2.contentBoxSize?.[0];
      null !== e2 && void 0 !== s2 && void 0 !== r2 && (Math.abs(r2.inlineSize - e2.mediaWidth) > 0.05 || Math.abs(r2.blockSize - e2.mediaHeight) > 0.05 ? e2.forgetDeviceSize() : e2.setDeviceSize(s2.inlineSize, s2.blockSize) && (t = true));
    }
    t && (this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._paintNow());
  }
  _canvasLayerOf(e) {
    for (const t of this._host._panes) {
      if (t.base.element === e) return t.base;
      if (t.top.element === e) return t.top;
    }
    return null;
  }
  _view() {
    const e = this._host._doc.defaultView;
    return e || ("undefined" == typeof window ? null : window);
  }
  _watchPixelRatio() {
    this._unwatchPixelRatio();
    const e = this._view();
    if (null === e || this._host._destroying || this._host._destroyed) return;
    if ("function" == typeof e.addEventListener && (e.addEventListener("resize", this._host._checkPixelRatio), this._ratioView = e), "function" != typeof e.matchMedia) return;
    const t = e.matchMedia(`(resolution: ${e.devicePixelRatio || 1}dppx)`);
    "function" == typeof t?.addEventListener && (t.addEventListener("change", this._host._onPixelRatio), this._ratioQuery = t);
  }
  _unwatchPixelRatio() {
    this._ratioQuery?.removeEventListener("change", this._host._onPixelRatio), this._ratioQuery = null, this._ratioView?.removeEventListener("resize", this._host._checkPixelRatio), this._ratioView = null;
  }
  _onPixelRatio() {
    this._host._destroyed || this._host._destroying || (this._watchPixelRatio(), this._checkPixelRatio());
  }
  _checkPixelRatio() {
    this._host._destroyed || this._host._destroying || this._host._pixelRatio() === this._host._layoutRatio || (this._host._layout._relayout(), this._host.invalidate((e) => e.invalidateGlobal(i.Full)), this._host._paintNow());
  }
};
function Ki(e) {
  const t = Math.abs(e);
  return t >= 1e9 ? (e / 1e9).toFixed(2) + "B" : t >= 1e6 ? (e / 1e6).toFixed(2) + "M" : t >= 1e3 ? (e / 1e3).toFixed(2) + "K" : String(Math.round(e));
}
var Xi = { background: "#ffffff", grid: "#eef1f6", axisText: "#5b6472", axisLine: "#d4dae3", paneSeparator: "#e6eaf0", crosshair: "#9aa3b2", upColor: "#089981", downColor: "#e0473e", wickUpColor: "#089981", wickDownColor: "#e0473e", lineColor: "#2962ff", areaTopColor: "rgba(41,98,255,0.30)", areaBottomColor: "rgba(41,98,255,0.00)", baselineTopLine: "#089981", baselineTopFill: "rgba(8,153,129,0.18)", baselineBottomLine: "#e0473e", baselineBottomFill: "rgba(224,71,62,0.18)", lastPriceUp: "#089981", lastPriceDown: "#e0473e", lastPriceText: "#ffffff", buy: "#089981", sell: "#e0473e", profit: "#089981", loss: "#e0473e" };
var Ji = Xi;
function Zi(e, t = false) {
  if (void 0 === e) return;
  if (null === e || "object" != typeof e || Array.isArray(e)) throw new TypeError("Series options must be an object");
  if (void 0 !== e.confirmation && "auto" !== e.confirmation && "forming" !== e.confirmation && "confirmed" !== e.confirmation) throw new TypeError("Series confirmation must be auto, forming or confirmed");
  const i2 = e.source;
  if (t && void 0 !== i2 && "live" !== i2 && "history" !== i2) throw new TypeError("Series update source must be live or history");
}
var Qi = class {
  constructor(e) {
    Object.defineProperty(this, "_state", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_tailTime", { enumerable: true, configurable: true, writable: true, value: void 0 }), this._state = Object.freeze({ sourceId: e, revision: 0, historyRevision: 0, provenance: "history", change: "reset" });
  }
  snapshot() {
    return this._state;
  }
  record(e, t, i2) {
    const s2 = "reset" === e || "prepend" === e || "correction" === e || "history" === i2?.source, r2 = "correction" === e ? void 0 : i2?.confirmation, n2 = "auto" === r2 ? void 0 : r2 ?? ("reset" !== e && t === this._tailTime ? this._state.confirmation : void 0);
    this._tailTime = t, this._state = Object.freeze({ sourceId: this._state.sourceId, revision: this._state.revision + 1, historyRevision: this._state.historyRevision + (s2 ? 1 : 0), provenance: s2 ? "history" : "live", change: e, ...void 0 === t || void 0 === n2 ? {} : { confirmation: n2, confirmationSource: "provider" } });
  }
  contextChanged() {
    this.record("reset", this._tailTime);
  }
};
var es = /* @__PURE__ */ new WeakMap();
var is = class extends Error {
  constructor(e) {
    super(e), this.name = "IndicatorInputError";
  }
};
function ss(e) {
  if (null === e || "object" != typeof e) return false;
  const t = Object.getPrototypeOf(e);
  return t === Object.prototype || null === t;
}
function rs(e) {
  return Object.values(Object.getOwnPropertyDescriptors(e)).every((e2) => "value" in e2);
}
function ns(e, t) {
  for (const i2 of e) {
    if (!["symbol", "session", "multiline", "price", "timestamp"].includes(i2.type)) continue;
    const s2 = (e2) => {
      throw new is(`Invalid study input "${i2.key}": ${e2}`);
    }, r2 = Object.getOwnPropertyDescriptor(t, i2.key);
    r2 && !("value" in r2) && s2("expected a data property");
    const n2 = r2 ? r2.value : i2.default;
    if ("price" === i2.type || "timestamp" === i2.type) {
      const { min: t2, max: r3, step: o2 } = i2;
      (void 0 !== t2 && !Number.isFinite(t2) || void 0 !== r3 && !Number.isFinite(r3) || void 0 !== t2 && void 0 !== r3 && t2 > r3 || void 0 !== o2 && (!Number.isFinite(o2) || o2 <= 0)) && s2("invalid numeric constraints");
      const a = (e2) => "number" == typeof e2 && Number.isFinite(e2) && (void 0 === t2 || e2 >= t2) && (void 0 === r3 || e2 <= r3);
      a(i2.default) && a(n2) || s2("expected a finite number within the declared bounds");
      const l2 = i2.pick;
      if (void 0 !== l2 && "boolean" != typeof l2) {
        "price" === i2.type && null !== l2 && "object" == typeof l2 || s2("invalid pick target");
        const e2 = l2;
        ss(e2) || s2("invalid pick target");
        const t3 = Object.getOwnPropertyDescriptors(e2);
        Object.values(t3).some((e3) => !("value" in e3)) && s2("invalid pick target");
        const r4 = t3.paneIndex?.value, n3 = t3.priceScaleId?.value;
        void 0 !== r4 && (!Number.isSafeInteger(r4) || r4 < 0) && s2("invalid pick pane"), void 0 === n3 || N(n3) || s2("invalid pick scale");
      }
      if ("price" === i2.type) {
        const { timeKey: t3, anchor: r4 } = i2;
        void 0 === t3 || "string" == typeof t3 && t3 !== i2.key && "timestamp" === e.find((e2) => e2.key === t3)?.type && !e.some((e2) => e2 !== i2 && "price" === e2.type && e2.timeKey === t3) || s2("timeKey must name a declared timestamp input no other price pairs with"), void 0 !== r4 && ("boolean" != typeof r4 || r4 && void 0 === t3) && s2("an anchor needs a boolean and a timeKey");
      }
    } else if ("string" == typeof i2.default && "string" == typeof n2 || s2("expected text"), "session" !== i2.type || Dt(i2.default) && Dt(n2) || s2("expected a session such as 0930-1600:23456"), "symbol" === i2.type && void 0 !== i2.exchangeKey) {
      "string" == typeof i2.exchangeKey && i2.exchangeKey && i2.exchangeKey !== i2.key || s2("invalid exchange field");
      const r3 = Object.getOwnPropertyDescriptor(t, i2.exchangeKey);
      !r3 || "value" in r3 && "string" == typeof r3.value || s2(`expected text in "${i2.exchangeKey}"`);
      const n3 = e.find((e2) => e2.key === i2.exchangeKey);
      n3 && "string" != typeof n3.default && s2("exchange field must default to text");
    }
  }
}
var os = [{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Dotted", value: "dotted" }];
function as(e) {
  return { color: e.colorKey ?? `${e.key}:color`, width: `${e.key}:width`, lineStyle: `${e.key}:lineStyle`, opacity: `${e.key}:opacity`, type: `${e.key}:type` };
}
function ls(e) {
  const t = [];
  for (const i2 of e.plots) {
    const s2 = as(i2), r2 = e.inputs.find((e2) => e2.key === i2.colorKey), n2 = "string" == typeof r2?.default ? r2.default : i2.style?.color ?? "#4f8cff";
    t.push({ key: s2.color, type: "color", label: i2.title, default: n2, group: i2.title }), t.push({ key: s2.opacity, type: "number", label: "Opacity", default: 100, min: 0, max: 100, step: 1, group: i2.title }), t.push({ key: s2.width, type: "number", label: "Thickness", default: i2.style?.lineWidth ?? 1.5, min: 0.5, max: 8, step: 0.5, group: i2.title }), t.push({ key: s2.lineStyle, type: "select", label: "Line style", default: i2.style?.lineStyle ?? "solid", options: os, group: i2.title }), t.push({ key: s2.type, type: "select", label: "Plot style", default: i2.type, options: hs, group: i2.title });
  }
  return t;
}
var hs = [{ label: "Line", value: "line" }, { label: "Line with markers", value: "line-markers" }, { label: "Step line", value: "step" }, { label: "Area", value: "area" }, { label: "Histogram", value: "histogram" }, { label: "Columns", value: "column" }];
var ds = /* @__PURE__ */ new Map();
function us(e) {
  ns(e.inputs, {}), ds.set(e.id, e);
}
function _s(e) {
  const t = ds.get(e);
  if (void 0 === t) throw new Error(`openalgo-charts: unknown indicator "${e}", did you import 'openalgo-charts/indicators'?`);
  return t;
}
function ps(e) {
  return ds.has(e);
}
function ms(e) {
  ns(e.inputs, {});
  const t = Object.fromEntries(e.inputs.map((e2) => [e2.key, e2.default]));
  for (const i2 of e.inputs) "symbol" !== i2.type || void 0 === i2.exchangeKey || Object.prototype.hasOwnProperty.call(t, i2.exchangeKey) || Object.defineProperty(t, i2.exchangeKey, { value: "", enumerable: true, writable: true, configurable: true });
  return t;
}
function bs(e, t) {
  switch (t) {
    case "open":
      return e.open;
    case "high":
      return e.high;
    case "low":
      return e.low;
    case "hl2":
      return (e.high + e.low) / 2;
    case "hlc3":
      return (e.high + e.low + e.close) / 3;
    case "ohlc4":
      return (e.open + e.high + e.low + e.close) / 4;
    case "volume":
      return e.volume ?? 0;
    default:
      return e.close;
  }
}
function gs(e, t, i2) {
  if ("string" != typeof t) {
    if (!ss(t)) throw new is("Invalid study source reference");
    const s3 = Object.getOwnPropertyDescriptors(t);
    if (3 !== Reflect.ownKeys(s3).length || "indicator" !== s3.kind?.value || "string" != typeof s3.instanceId?.value || !s3.instanceId.value.trim() || "string" != typeof s3.plotKey?.value || !s3.plotKey.value.trim()) throw new is("Invalid study source reference");
    if (!i2?.resolveSource) throw new is("Study source requires a calculation resolver");
    const r2 = i2.resolveSource(t);
    if (!Array.isArray(r2) || r2.length !== e.length) throw new is("Study source length must align with source bars");
    return r2.slice();
  }
  const s2 = new Array(e.length);
  for (let i3 = 0; i3 < e.length; i3++) s2[i3] = bs(e[i3], t);
  return s2;
}
function vs(e, t) {
  const i2 = [...new Set(t.filter((e2) => void 0 !== e2))], s2 = 1 === i2.length ? null : new AbortController(), r2 = s2?.signal ?? i2[0];
  return new Promise((t2, n2) => {
    let o2 = false;
    const a = /* @__PURE__ */ new Map(), l2 = (e2) => {
      o2 || (o2 = true, (() => {
        for (const [e3, t3] of a) e3.removeEventListener("abort", t3);
        a.clear();
      })(), e2());
    }, h2 = (e2) => {
      l2(() => {
        n2(e2.reason), s2?.abort(e2.reason);
      });
    }, c2 = i2.find((e2) => e2.aborted);
    if (c2) h2(c2);
    else {
      for (const e2 of i2) {
        const t3 = () => h2(e2);
        a.set(e2, t3), e2.addEventListener("abort", t3, { once: true });
      }
      try {
        Promise.resolve(e(r2)).then((e2) => l2(() => t2(e2)), (e2) => l2(() => n2(e2)));
      } catch (e2) {
        l2(() => n2(e2));
      }
    }
  });
}
var ys = /* @__PURE__ */ new Set(["everyUpdate", "oncePerBar", "onBarClose", "once"]);
function ws(e, t) {
  const i2 = {};
  for (const s2 of Object.keys(e)) Object.defineProperty(i2, s2, { value: Object.freeze(e[s2].slice(0, t)), enumerable: true });
  return Object.freeze(i2);
}
function xs(e, t, i2, s2) {
  return s2 === e.length - 1 ? { bars: e, values: t, settings: i2, index: s2 } : { bars: Object.freeze(e.slice(0, s2 + 1)), values: ws(t, s2 + 1), settings: i2, index: s2 };
}
function Ss(e, t) {
  return t ? (e2) => t.bars[t.sourceIndex[e2]].time : (t2) => e[t2].time;
}
var Ps = class {
  constructor(e) {
    Object.defineProperty(this, "_entries", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_legacyCalculations", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new WeakSet() }), Object.defineProperty(this, "_initialized", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_native", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_sourceId", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_historyRevision", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_revision", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_replaying", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_epoch", { enumerable: true, configurable: true, writable: true, value: 0 });
    const t = /* @__PURE__ */ new Set();
    for (const i2 of e) {
      const e2 = i2.frequency;
      if (void 0 !== e2) {
        if (!ys.has(e2)) throw new TypeError("Indicator alert frequency is invalid");
        if ("string" != typeof i2.id || "" === i2.id.trim()) throw new TypeError("Explicit indicator alert id must be nonempty");
        if (t.has(i2.id)) throw new TypeError("Explicit indicator alert ids must be unique");
        t.add(i2.id), this._entries.push({ spec: Object.freeze({ ...i2, frequency: e2 }), onceSpent: false, perBarTime: -1 / 0, closedTime: -1 / 0, failedCloses: /* @__PURE__ */ new Set(), busy: false });
      }
    }
  }
  evaluate(e, t) {
    if (0 === this._entries.length || !e.current()) return;
    const i2 = e.calculation.execution, s2 = void 0 !== i2, r2 = "replay" === i2?.provenance, n2 = !this._initialized || this._native !== s2 || s2 && (i2.sourceId !== this._sourceId || i2.historyRevision !== this._historyRevision || r2 !== this._replaying);
    if (s2) {
      if (!n2 && void 0 !== this._revision && i2.revision <= this._revision) return;
    } else {
      if (this._legacyCalculations.has(e.calculation)) return;
      this._legacyCalculations.add(e.calculation);
    }
    const o2 = ++this._epoch;
    this._initialized = true, this._native = s2, this._sourceId = i2?.sourceId, this._historyRevision = i2?.historyRevision, this._revision = i2?.revision, this._replaying = r2;
    const a = e.sampled?.bars ?? e.bars, l2 = Ss(e.bars, e.sampled), h2 = a[a.length - (e.calculation.barState.isConfirmed ? 1 : 2)]?.time ?? -1 / 0, c2 = e.refresh || "refresh" === i2?.change, d2 = s2 ? "live" === i2.provenance : e.tailOnly;
    if (n2 || !c2 && !d2) return void this._seed(h2);
    if (c2 || !d2 || 0 === e.bars.length) return;
    const u2 = Object.freeze(e.bars.map((e2) => Object.freeze({ ...e2 }))), _3 = ws(e.values), p2 = Object.freeze({ ...e.settings }), f2 = () => this._epoch === o2 && e.current();
    if (!f2()) return;
    let m2, b2 = false;
    const g2 = u2.length - 1, v2 = Math.min(e.from, g2), y2 = [];
    for (let t2 = v2; t2 <= g2; t2++) (t2 > v2 ? l2(t2) !== l2(t2 - 1) : v2 === e.from || l2(t2) === a[a.length - 1].time) && y2.push(t2);
    for (const e2 of this._entries) {
      if (!f2()) return;
      if (e2.busy) continue;
      const i3 = "onBarClose" === e2.spec.frequency, s3 = i3 ? this._closeIndices(e2, l2, g2, h2) : y2;
      for (const r3 of s3) {
        if (!f2()) return;
        if ("once" === e2.spec.frequency && e2.onceSpent) break;
        const s4 = u2[r3].time, n3 = l2(r3);
        if ("oncePerBar" === e2.spec.frequency && n3 <= e2.perBarTime) continue;
        const o3 = xs(u2, _3, p2, r3);
        let a2 = false;
        e2.busy = true;
        try {
          if (!f2()) return;
          const l3 = e2.spec.when(o3);
          if (!f2()) return;
          if (!l3) {
            i3 && this._judgeClose(e2, n3);
            continue;
          }
          const h3 = "function" == typeof e2.spec.message ? e2.spec.message(o3) : e2.spec.message ?? e2.spec.title;
          if (!f2()) return;
          const c3 = { alertId: e2.spec.id, title: e2.spec.title, message: h3, time: s4, index: r3 };
          if ("once" === e2.spec.frequency && (e2.onceSpent = true), "oncePerBar" === e2.spec.frequency && (e2.perBarTime = n3), i3 && this._judgeClose(e2, n3), a2 = true, t(c3), !f2()) return;
        } catch (t2) {
          if (!f2()) return;
          i3 && !a2 && e2.failedCloses.add(n3), b2 || (b2 = true, m2 = t2);
        } finally {
          e2.busy = false;
        }
      }
    }
    if (b2 && f2()) throw m2;
  }
  redate(e, t) {
    for (const i2 of this._entries) i2.perBarTime === e && (i2.perBarTime = t), i2.closedTime === e && (i2.closedTime = t);
  }
  _seed(e) {
    for (const t of this._entries) t.perBarTime = e, t.closedTime = e, t.failedCloses.clear();
  }
  _judgeClose(e, t) {
    e.closedTime = Math.max(e.closedTime, t), e.failedCloses.delete(t);
  }
  _closeIndices(e, t, i2, s2) {
    const r2 = [], n2 = /* @__PURE__ */ new Set();
    for (let o2 = 0, a = 0; o2 <= i2 && (a = t(o2)) <= s2; o2++) (a > e.closedTime || e.failedCloses.has(a)) && !n2.has(a) && r2.push(o2), n2.add(a);
    for (const t2 of e.failedCloses) n2.has(t2) || e.failedCloses.delete(t2);
    return r2;
  }
};
function Os(e) {
  return "string" == typeof e && e.trim().length > 0;
}
function ks(e) {
  if ("object" != typeof e || null === e) return false;
  const t = Object.getOwnPropertyDescriptor(e, "kind");
  return void 0 !== t && "value" in t && "indicator" === t.value;
}
function Is(e) {
  if (!ss(e)) throw new TypeError("Study source reference must be a plain object.");
  const t = Reflect.ownKeys(e);
  if (3 !== t.length || !t.every((e2) => "kind" === e2 || "instanceId" === e2 || "plotKey" === e2)) throw new TypeError("Study source reference requires only kind, instanceId and plotKey.");
  const i2 = Object.getOwnPropertyDescriptor(e, "kind"), s2 = Object.getOwnPropertyDescriptor(e, "instanceId"), r2 = Object.getOwnPropertyDescriptor(e, "plotKey");
  if (!(i2 && s2 && r2 && "value" in i2 && "value" in s2 && "value" in r2)) throw new TypeError("Study source reference fields must be own data properties.");
  if ("indicator" !== i2.value || !Os(s2.value) || !Os(r2.value)) throw new TypeError("Study source reference requires nonempty instanceId and plotKey strings.");
  return { kind: "indicator", instanceId: s2.value, plotKey: r2.value };
}
function Ms(e) {
  if (!ss(e)) throw new TypeError("Indicator settings must be a plain object.");
  const t = {};
  for (const i2 of Object.keys(e)) {
    const s2 = Object.getOwnPropertyDescriptor(e, i2);
    if (!("value" in s2)) throw new TypeError(`Indicator settings property "${i2}" must be a data property.`);
    const r2 = s2.value;
    Object.defineProperty(t, i2, { value: ks(r2) ? Is(r2) : r2, writable: true, configurable: true, enumerable: true });
  }
  return t;
}
function Ts(e, t) {
  let i2 = e.length;
  for (e.push(t); i2 > 0; ) {
    const s2 = i2 - 1 >>> 1;
    if (e[s2] <= t) break;
    e[i2] = e[s2], i2 = s2;
  }
  e[i2] = t;
}
function Cs(e) {
  const t = e[0], i2 = e.pop();
  if (0 === e.length) return t;
  let s2 = 0;
  for (; 2 * s2 + 1 < e.length; ) {
    let t2 = 2 * s2 + 1;
    if (t2 + 1 < e.length && e[t2 + 1] < e[t2] && t2++, e[t2] >= i2) break;
    e[s2] = e[t2], s2 = t2;
  }
  return e[s2] = i2, t;
}
function js(e) {
  const t = /* @__PURE__ */ new Map();
  for (let i3 = 0; i3 < e.length; i3++) {
    const s3 = e[i3].id;
    if (!Os(s3)) throw new TypeError("Indicator instance id must be a nonempty string.");
    if (t.has(s3)) throw new TypeError(`Duplicate indicator instance id "${s3}".`);
    t.set(s3, i3);
  }
  const i2 = /* @__PURE__ */ new Map(), s2 = e.map(() => []), r2 = e.map(() => 0);
  for (let n3 = 0; n3 < e.length; n3++) {
    const o3 = e[n3], a = Ms(o3.settings);
    for (const e2 of Object.keys(a)) if (ks(a[e2]) && !o3.descriptor.inputs.some((t2) => t2.key === e2 && "source" === t2.type && true === t2.allowStudyOutputs)) throw new TypeError(`Indicator "${o3.id}" input "${e2}" does not support study sources.`);
    const l2 = [], h2 = /* @__PURE__ */ new Set();
    for (const i3 of o3.descriptor.inputs) {
      if ("source" !== i3.type) continue;
      const s3 = Object.getOwnPropertyDescriptor(a, i3.key), r3 = s3 ? s3.value : i3.default;
      if ("string" == typeof r3) continue;
      const n4 = Is(r3);
      if (true !== i3.allowStudyOutputs) throw new TypeError(`Indicator "${o3.id}" input "${i3.key}" does not support study sources.`);
      if (n4.instanceId === o3.id) throw new TypeError(`Indicator "${o3.id}" cannot reference itself (self dependency).`);
      const c2 = t.get(n4.instanceId);
      if (void 0 !== c2) {
        const t2 = e[c2].descriptor.plots.filter((e2) => e2.key === n4.plotKey);
        if (1 !== t2.length) throw new TypeError(`Study source plot "${n4.plotKey}" must identify one declared plot on "${n4.instanceId}".`);
        if (void 0 !== t2[0].ohlc) throw new TypeError(`Study source plot "${n4.plotKey}" must be scalar, without an OHLC mapping.`);
        h2.add(c2);
      }
      l2.push({ inputKey: i3.key, source: n4, available: void 0 !== c2 });
    }
    i2.set(o3.id, l2), r2[n3] = h2.size;
    for (const e2 of h2) s2[e2].push(n3);
  }
  const n2 = [], o2 = [];
  for (let t2 = 0; t2 < e.length; t2++) 0 === r2[t2] && Ts(n2, t2);
  for (; n2.length > 0; ) {
    const t2 = Cs(n2);
    o2.push(e[t2].id);
    for (const e2 of s2[t2]) r2[e2]--, 0 === r2[e2] && Ts(n2, e2);
  }
  if (o2.length !== e.length) throw new TypeError("Study source references contain a dependency cycle.");
  return { order: o2, dependencies: i2 };
}
var As = ["removable", "configurable", "movable", "listed"];
function Ls(e) {
  if (null === e || "object" != typeof e || Array.isArray(e)) throw new TypeError("Invalid indicator policy");
  const t = {};
  for (const i2 of As) {
    const s2 = e[i2];
    if (void 0 !== s2) {
      if ("boolean" != typeof s2) throw new TypeError(`Invalid indicator policy flag: ${i2}`);
      s2 || (t[i2] = false);
    }
  }
  return Object.freeze(t);
}
function Ns(e) {
  if (void 0 !== e.fontSize && ("number" != typeof e.fontSize || !Number.isFinite(e.fontSize) || e.fontSize <= 0)) throw new TypeError("Text fontSize must be a positive finite number");
  if (void 0 !== e.fontFamily && ("string" != typeof e.fontFamily || "" === e.fontFamily.trim())) throw new TypeError("Text fontFamily must be a nonempty CSS font-family list");
  for (const t of ["bold", "italic"]) if (void 0 !== e[t] && "boolean" != typeof e[t]) throw new TypeError(`Text ${t} must be boolean`);
  if (void 0 !== e.textAlign && !["left", "center", "right"].includes(e.textAlign)) throw new TypeError("Text textAlign must be left, center or right");
}
function Rs(e) {
  return void 0 !== e.fontSize || void 0 !== e.fontFamily || void 0 !== e.bold || void 0 !== e.italic || void 0 !== e.textAlign;
}
function Fs(e, t, i2, s2 = false) {
  return `${e?.italic ? "italic " : ""}${e?.bold ?? s2 ? "600 " : ""}${function(e2) {
    const t2 = String(e2), i3 = t2.indexOf("e");
    if (i3 < 0) return t2;
    const s3 = t2.slice(0, i3), r2 = Number(t2.slice(i3 + 1)), n2 = s3.replace(".", ""), o2 = (s3.indexOf(".") < 0 ? s3.length : s3.indexOf(".")) + r2;
    return o2 <= 0 ? `0.${"0".repeat(-o2)}${n2}` : o2 >= n2.length ? n2 + "0".repeat(o2 - n2.length) : `${n2.slice(0, o2)}.${n2.slice(o2)}`;
  }(t)}px ${e?.fontFamily ?? i2}`;
}
var zs = { tiny: 6, small: 9, medium: 12, big: 16 };
function Es(e) {
  return zs[e];
}
function Bs(e, t) {
  return Math.max(4, Math.min(zs[e], Math.floor(t)));
}
function $s(e, t, i2, s2, r2, n2) {
  const o2 = r2 / 2;
  switch (e.fillStyle = n2, e.strokeStyle = n2, e.beginPath(), t) {
    case "arrowUp":
    case "triangleUp":
      e.moveTo(i2, s2 - o2), e.lineTo(i2 + o2, s2 + o2), e.lineTo(i2 - o2, s2 + o2), e.closePath(), e.fill();
      break;
    case "arrowDown":
    case "triangleDown":
      e.moveTo(i2, s2 + o2), e.lineTo(i2 + o2, s2 - o2), e.lineTo(i2 - o2, s2 - o2), e.closePath(), e.fill();
      break;
    case "circle":
      e.arc(i2, s2, o2, 0, 2 * Math.PI), e.fill();
      break;
    case "square":
      e.fillRect(i2 - o2, s2 - o2, r2, r2);
      break;
    case "diamond":
      e.moveTo(i2, s2 - o2), e.lineTo(i2 + o2, s2), e.lineTo(i2, s2 + o2), e.lineTo(i2 - o2, s2), e.closePath(), e.fill();
      break;
    case "flag":
      e.fillRect(i2 - 1, s2 - o2, Math.max(1, r2 / 8), r2), e.fillRect(i2, s2 - o2, o2, 0.8 * o2);
      break;
    case "cross": {
      const t2 = Math.max(1, Math.round(r2 / 6));
      e.fillRect(i2 - o2, s2 - Math.floor(t2 / 2), r2, t2), e.fillRect(i2 - Math.floor(t2 / 2), s2 - o2, t2, r2);
      break;
    }
    case "xcross":
      e.lineWidth = Math.max(1, Math.round(r2 / 6)), e.moveTo(i2 - o2, s2 - o2), e.lineTo(i2 + o2, s2 + o2), e.moveTo(i2 + o2, s2 - o2), e.lineTo(i2 - o2, s2 + o2), e.stroke();
  }
}
var Ds = 1.35;
function Ws(e, t, i2, s2, r2) {
  const n2 = 0.5 * r2, o2 = s2.indexOf("\n") < 0 ? void 0 : s2.split("\n");
  let a = e.measureText(void 0 === o2 ? s2 : o2[0]).width;
  if (void 0 !== o2) for (let t2 = 1; t2 < o2.length; t2++) a = Math.max(a, e.measureText(o2[t2]).width);
  const l2 = r2 * Ds, h2 = a + 2 * n2, c2 = r2 + 0.64 * r2 + (void 0 === o2 ? 0 : l2 * (o2.length - 1)), d2 = 0.42 * r2;
  return { lines: o2, lh: l2, w: h2, h: c2, tail: d2, textW: a, top: t ? i2 + d2 : i2 - d2 - c2 };
}
function qs(e, t, i2, s2, r2, n2, o2) {
  e.font = `600 ${o2}px system-ui, sans-serif`;
  Vs(e, t, i2, s2, r2, n2, o2, Ws(e, t, s2, r2, o2));
}
function Vs(e, t, i2, s2, r2, n2, o2, a, l2) {
  const { w: h2, h: c2, top: d2, tail: u2, lines: _3, lh: p2, textW: f2 } = a;
  e.fillStyle = n2, e.beginPath(), oe(e, i2 - h2 / 2, d2, h2, c2, Math.min(0.3 * o2, c2 / 2)), e.fill();
  const m2 = t ? d2 + 1 : d2 + c2 - 1;
  e.beginPath(), e.moveTo(i2, s2), e.lineTo(i2 - u2, m2), e.lineTo(i2 + u2, m2), e.closePath(), e.fill(), e.fillStyle = l2?.textColor ?? ee(n2), e.textAlign = l2?.textAlign ?? "center", e.textBaseline = "middle";
  const b2 = "left" === l2?.textAlign ? i2 - f2 / 2 : "right" === l2?.textAlign ? i2 + f2 / 2 : i2;
  if (void 0 === _3) return void e.fillText(r2, b2, d2 + c2 / 2);
  const g2 = d2 + c2 / 2 - p2 * (_3.length - 1) / 2;
  for (let t2 = 0; t2 < _3.length; t2++) e.fillText(_3[t2], b2, g2 + p2 * t2);
}
function Hs(e, t) {
  let i2 = 0, s2 = e.length - 1;
  for (; i2 <= s2; ) {
    let r2 = i2 + s2 >> 1;
    const n2 = e[r2].time;
    if (n2 === t) {
      for (; r2 + 1 < e.length && e[r2 + 1].time === t; ) r2++;
      return e[r2];
    }
    n2 < t ? i2 = r2 + 1 : s2 = r2 - 1;
  }
}
var Gs = "system-ui, sans-serif";
var Us = { aboveBar: -1, paneBottom: -1, belowBar: 1, paneTop: 1 };
var Ks = (e) => "labelUp" === e.shape || "labelDown" === e.shape;
var Ys = (e) => Rs(e) || void 0 !== e.textColor;
var Xs = (e) => e.fontSize ?? Math.max(9, Es(e.size));
function Js(e, t, i2, s2) {
  return Ks(e) ? (t + i2) / 2 : "text" === e.shape ? t / 2 : Math.max(t, s2) / 2;
}
function Zs(e, t, i2, s2, r2, n2, o2) {
  const a = Js(e, n2, r2, s2), l2 = function(e2) {
    let t2 = 0;
    for (let i3 = e2.indexOf("\n"); i3 >= 0; i3 = e2.indexOf("\n", i3 + 1)) t2++;
    return t2;
  }(e.text ?? "");
  if (Ks(e)) {
    const s3 = r2 + 0.64 * r2 + (0 === l2 ? 0 : r2 * Ds * l2), n3 = 0.42 * r2;
    return "labelUp" === e.shape ? { l: t - a, r: t + a, t: i2, b: i2 + n3 + s3 } : { l: t - a, r: t + a, t: i2 - n3 - s3, b: i2 };
  }
  const h2 = r2 + l2 * r2 * Ds, c2 = o2 ? i2 + s2 : i2 - s2 - h2;
  return "text" === e.shape ? { l: t - a, r: t + a, t: c2, b: c2 + h2 } : { l: t - a, r: t + a, t: Math.min(i2 - s2 / 2, c2), b: Math.max(i2 + s2 / 2, c2 + h2) };
}
function Qs(e, t, i2, s2, r2, n2) {
  if (e.length > 32) {
    let t2 = 0;
    for (const i3 of e) i3.r > r2 && (e[t2++] = i3);
    e.length = t2;
  }
  let o2 = 0;
  for (let r3 = true; r3; ) {
    r3 = false;
    for (const a of e) if (!(a.r <= i2.l || a.l >= i2.r || a.b <= i2.t + o2 || a.t >= i2.b + o2) && (o2 = t < 0 ? a.t - s2 - i2.b : a.b + s2 - i2.t, r3 = true, Math.abs(o2) > n2)) {
      o2 = 0, r3 = false;
      break;
    }
  }
  return i2.t += o2, i2.b += o2, e.push(i2), o2;
}
function er(e, t, i2, s2, r2, n2) {
  return "paneTop" === e.position ? i2 / 2 + 4 * n2.dpr + s2 : "paneBottom" === e.position ? n2.plotHeight * n2.dpr - i2 / 2 - 4 * n2.dpr - s2 : "atPrice" === e.position && void 0 !== e.price ? r2.priceToY(e.price) * n2.dpr : void 0 !== t && "aboveBar" === e.position ? r2.priceToY(t.high) * n2.dpr - i2 - s2 : void 0 !== t && "belowBar" === e.position ? r2.priceToY(t.low) * n2.dpr + i2 + s2 : void 0 !== t ? r2.priceToY((t.open + t.close) / 2) * n2.dpr : NaN;
}
function tr(e, t, i2, s2, r2, n2, o2, a, l2, h2, c2, d2) {
  const u2 = l2 ? r2 + n2 : r2 - n2;
  let _3, p2 = 0;
  if (h2) {
    a && (e.font = Fs(i2, o2, Gs, c2));
    let h3 = s2 - n2 / 2, d3 = s2 + n2 / 2, f3 = r2 - n2 / 2, m2 = r2 + n2 / 2;
    if (a && void 0 !== i2.text) if (c2) _3 = Ws(e, "labelUp" === i2.shape, r2, i2.text, o2), h3 = s2 - _3.w / 2, d3 = s2 + _3.w / 2, f3 = Math.min(r2, _3.top), m2 = Math.max(r2, _3.top + _3.h);
    else {
      const t2 = i2.text.split("\n");
      for (const i3 of t2) p2 = Math.max(p2, e.measureText(i3).width);
      const r3 = o2 + (t2.length - 1) * o2 * Ds;
      h3 = Math.min(h3, s2 - p2 / 2), d3 = Math.max(d3, s2 + p2 / 2), f3 = Math.min(f3, l2 ? u2 : u2 - r3), m2 = Math.max(m2, l2 ? u2 + r3 : u2);
    }
    if (c2 || [h3, d3, f3, m2].every(Number.isFinite) || (a = false, h3 = s2 - n2 / 2, d3 = s2 + n2 / 2, f3 = r2 - n2 / 2, m2 = r2 + n2 / 2), ![h3, d3, f3, m2].every(Number.isFinite) || d3 < 0 || h3 > t.plotWidth * t.dpr || m2 < 0 || f3 > t.plotHeight * t.dpr) return;
    e.save(), e.beginPath(), e.rect(0, 0, t.plotWidth * t.dpr, t.plotHeight * t.dpr), e.clip();
  }
  const f2 = h2 ? { width: t.plotWidth, height: t.plotHeight } : void 0;
  if ("labelUp" === i2.shape || "labelDown" === i2.shape) return void 0 !== i2.text && (_3 ? Vs(e, "labelUp" === i2.shape, s2, r2, i2.text, i2.color, o2, _3, i2) : qs(e, "labelUp" === i2.shape, s2, r2, i2.text, i2.color, o2)), void 0 !== i2.id && d2.push({ id: i2.id, x: s2 / t.dpr, y: r2 / t.dpr, clip: f2 }), void (h2 && e.restore());
  if ($s(e, i2.shape, s2, r2, n2, i2.color), a && void 0 !== i2.text) {
    e.fillStyle = i2.textColor ?? i2.color, e.font = Fs(i2, o2, Gs), e.textAlign = i2.textAlign ?? "center", e.textBaseline = l2 ? "top" : "bottom";
    const t2 = "left" === i2.textAlign ? s2 - p2 / 2 : "right" === i2.textAlign ? s2 + p2 / 2 : s2;
    if (i2.text.indexOf("\n") < 0) e.fillText(i2.text, t2, u2);
    else {
      const s3 = i2.text.split("\n"), r3 = o2 * Ds;
      for (let i3 = 0; i3 < s3.length; i3++) e.fillText(s3[l2 ? i3 : s3.length - 1 - i3], t2, l2 ? u2 + r3 * i3 : u2 - r3 * i3);
    }
  }
  void 0 !== i2.id && d2.push({ id: i2.id, x: s2 / t.dpr, y: r2 / t.dpr, clip: f2 }), h2 && e.restore();
}
var ir = class {
  constructor(e, t, i2) {
    Object.defineProperty(this, "_seriesId", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_fallbackBars", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_priceScale", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_markers", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_lastPositions", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_widths", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_widthDpr", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_fontWidths", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_anyStyled", { enumerable: true, configurable: true, writable: true, value: false }), this._seriesId = e, this._fallbackBars = t, this._priceScale = i2;
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null, this._lastPositions = [];
  }
  zOrder() {
    return "normal";
  }
  setMarkers(e) {
    for (const t of e) if (Ns(t), void 0 !== t.textColor && ("string" != typeof t.textColor || "" === t.textColor.trim())) throw new TypeError("Marker textColor must be a nonempty color string");
    this._markers = e.slice().sort((e2, t) => e2.time - t.time), this._lastPositions = [], this._widths = /* @__PURE__ */ new Map(), this._anyStyled = this._markers.some(Ys), this._host?.requestUpdate();
  }
  _textWidth(e, t, i2, s2) {
    this._widthDpr !== s2 && (this._widths = /* @__PURE__ */ new Map(), this._widthDpr = s2);
    let r2 = this._widths.get(t);
    if (void 0 !== r2) return r2;
    const n2 = Fs(t, i2, Gs, Ks(t)), o2 = t.text ?? "", a = n2 + "\n" + o2;
    if (r2 = this._fontWidths.get(a), void 0 === r2) {
      e.font = n2, r2 = 0;
      for (const t2 of o2.split("\n")) r2 = Math.max(r2, e.measureText(t2).width);
      this._fontWidths.size >= 512 && this._fontWidths.clear(), this._fontWidths.set(a, r2);
    }
    return this._widths.set(t, r2), r2;
  }
  draw(e, t) {
    if (this._lastPositions = [], 0 === this._markers.length) return;
    const i2 = /* @__PURE__ */ function(e2, t2) {
      let i3, s3;
      return (r3) => {
        const n3 = Hs(e2, r3);
        if (void 0 !== n3 && Number.isFinite(n3.close)) return n3;
        if (void 0 === t2) return;
        i3 ?? (i3 = t2());
        const o3 = Hs(i3, r3);
        if (void 0 !== o3) return o3;
        if (void 0 === s3) {
          s3 = /* @__PURE__ */ new Map();
          for (const e3 of i3) s3.set(e3.time, e3);
        }
        return s3.get(r3);
      };
    }(t.dataLayer.seriesBars(this._seriesId), this._fallbackBars), s2 = this._priceScale?.() ?? t.priceScale, r2 = t.timeScale.visibleRange(), n2 = /* @__PURE__ */ new Map(), o2 = this._markers, a = t.dpr, l2 = (e2) => {
      if (void 0 === e2.text || void 0 === Us[e2.position]) return NaN;
      const t2 = Xs(e2) * a;
      return Number.isFinite(t2) && t2 > 0 ? t2 : NaN;
    };
    e.save();
    const h2 = function(e2, t2, i3, s3, r3, n3) {
      const o3 = i3.dpr;
      let a2 = e2.length;
      for (let t3 = 0; t3 < e2.length; t3++) {
        const r4 = e2[t3], l4 = i3.dataLayer.timeToIndex(r4.time);
        if (void 0 !== l4) {
          if (Ys(r4)) {
            const e3 = Xs(r4) * o3, t4 = void 0 !== r4.text && Number.isFinite(e3) && e3 > 0 ? n3(r4, e3) : 0;
            if (i3.timeScale.indexToX(l4) * o3 + Math.max(t4, 16 * o3) < 0) continue;
          } else if (l4 < s3.from - 1) continue;
          a2 = t3;
          break;
        }
      }
      if (a2 === e2.length) return null;
      for (; a2 > 0 && e2[a2 - 1].time === e2[a2].time; ) a2--;
      const l3 = Math.max(0, 256 * Math.floor((a2 - 256) / 256));
      let h3 = 0;
      for (let o4 = l3; o4 < e2.length; o4++) {
        const a3 = e2[o4], l4 = i3.dataLayer.timeToIndex(a3.time);
        if (void 0 === l4) continue;
        if (!Ys(a3) && l4 > s3.to + 1) {
          if (t2) continue;
          break;
        }
        const c4 = r3(a3);
        c4 > 0 && (h3 = Math.max(h3, n3(a3, c4)));
      }
      let c3 = l3, d3 = -1 / 0;
      for (let t3 = l3; t3 < a2; t3++) {
        const s4 = e2[t3], a3 = i3.dataLayer.timeToIndex(s4.time);
        if (void 0 === a3) continue;
        const u3 = i3.timeScale.indexToX(a3) * o3;
        u3 - h3 >= d3 && (t3 === l3 || e2[t3 - 1].time !== s4.time) && (c3 = t3);
        const _4 = r3(s4);
        _4 > 0 && (d3 = Math.max(d3, u3 + n3(s4, _4)));
      }
      if (a2 > c3) {
        const t3 = i3.dataLayer.timeToIndex(e2[a2].time);
        void 0 !== t3 && i3.timeScale.indexToX(t3) * o3 - h3 >= d3 && (c3 = a2);
      }
      return { start: c3, widest: h3 };
    }(o2, this._anyStyled, t, r2, l2, (i3, s3) => Js(i3, this._textWidth(e, i3, s3, a), s3, Bs(i3.size, t.timeScale.barSpacing) * a));
    if (null === h2) return void e.restore();
    const { start: c2, widest: d2 } = h2, u2 = 2 * a, _3 = { [-1]: [], 1: [] };
    for (let h3 = c2; h3 < o2.length; h3++) {
      const c3 = o2[h3], p2 = Ys(c3), f2 = t.dataLayer.timeToIndex(c3.time);
      if (void 0 === f2) continue;
      if (!p2 && f2 > r2.to + 1) {
        if (this._anyStyled) continue;
        break;
      }
      const m2 = l2(c3), b2 = !p2 && f2 < r2.from - 1;
      if (b2 && !(m2 > 0)) continue;
      const g2 = "paneTop" === c3.position || "paneBottom" === c3.position ? void 0 : i2(c3.time), v2 = Bs(c3.size, t.timeScale.barSpacing) * t.dpr, y2 = t.timeScale.indexToX(f2) * t.dpr, w2 = n2.get(c3.time) ?? 0;
      let x2 = er(c3, g2, v2, (v2 + 4 * t.dpr) * w2, s2, t);
      if (!Number.isFinite(x2) || !Number.isFinite(y2)) continue;
      n2.set(c3.time, w2 + 1);
      const S2 = Xs(c3) * t.dpr, P2 = "labelUp" === c3.shape || "labelDown" === c3.shape, O2 = Number.isFinite(S2) && S2 > 0;
      if (P2 && !O2) continue;
      const k2 = O2 && void 0 !== c3.text, I2 = "belowBar" === c3.position || "paneTop" === c3.position;
      if (m2 > 0) {
        const t2 = Us[c3.position], i3 = Zs(c3, y2, x2, v2, m2, this._textWidth(e, c3, m2, a), I2);
        Number.isFinite(i3.l) && Number.isFinite(i3.r) && Number.isFinite(i3.t) && Number.isFinite(i3.b) && (x2 += Qs(_3[t2], t2, i3, u2, y2 - d2, 5 * (i3.b - i3.t + u2)));
      }
      b2 || tr(e, t, c3, y2, x2, v2, S2, k2, I2, p2, P2, this._lastPositions);
    }
    e.restore();
  }
  hitTest(e, t) {
    let i2 = null;
    for (const s2 of this._lastPositions) {
      if (s2.clip && (e < 0 || t < 0 || e > s2.clip.width || t > s2.clip.height)) continue;
      const r2 = Math.hypot(s2.x - e, s2.y - t);
      r2 <= 8 && (null === i2 || r2 < i2.distance) && (i2 = { externalId: s2.id, zOrder: "normal", distance: r2, cursor: "pointer" });
    }
    return i2;
  }
};
function sr(e, t) {
  return e === t || void 0 !== e && void 0 !== t && e.topValue === t.topValue && e.bottomValue === t.bottomValue && e.topColor === t.topColor && e.bottomColor === t.bottomColor;
}
var rr = class {
  constructor(e) {
    Object.defineProperty(this, "_points", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_opts", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_visible", { enumerable: true, configurable: true, writable: true, value: true }), this._opts = { opacity: 0.12, ...e };
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null;
  }
  zOrder() {
    return "bottom";
  }
  autoscaleInfo() {
    return null;
  }
  setPoints(e) {
    this._points = e.slice(), this._host?.requestUpdate();
  }
  setOptions(e) {
    this._opts = { ...this._opts, ...e }, this._host?.requestUpdate();
  }
  setVisible(e) {
    this._visible = e, this._host?.requestUpdate();
  }
  draw(e, t) {
    if (!this._visible || this._points.length < 2) return;
    const i2 = t.dpr, s2 = (e2) => t.timeScale.indexToX(e2) * i2, r2 = (e2) => t.priceScale.priceToY(e2) * i2, n2 = /* @__PURE__ */ new Map();
    let o2;
    const a = (t2) => {
      let i3 = t2.topValue, s3 = t2.bottomValue;
      if (void 0 === i3 || void 0 === s3) {
        if (void 0 === o2) {
          let e2 = 1 / 0, t3 = -1 / 0;
          for (const i4 of this._points) for (const s4 of [i4.a, i4.b]) null !== s4 && Number.isFinite(s4) && (e2 = Math.min(e2, s4), t3 = Math.max(t3, s4));
          o2 = { min: e2, max: t3 };
        }
        i3 ?? (i3 = o2.max), s3 ?? (s3 = o2.min);
      }
      const a2 = r2(i3), l3 = a2 + (r2(s3) - a2 || 1), h3 = JSON.stringify([a2, l3, t2.topColor, t2.bottomColor]);
      let c2 = n2.get(h3);
      return void 0 === c2 && (c2 = e.createLinearGradient(0, a2, 0, l3), c2.addColorStop(0, t2.topColor), c2.addColorStop(1, t2.bottomColor), n2.set(h3, c2)), c2;
    };
    e.save(), e.globalAlpha = this._opts.opacity ?? 0.12;
    let l2 = null;
    const h2 = () => {
      if (null !== l2 && l2.xs.length >= 2) {
        e.beginPath(), e.moveTo(l2.xs[0], l2.top[0]);
        for (let t2 = 1; t2 < l2.xs.length; t2++) e.lineTo(l2.xs[t2], l2.top[t2]);
        for (let t2 = l2.xs.length - 1; t2 >= 0; t2--) e.lineTo(l2.xs[t2], l2.bot[t2]);
        e.closePath(), void 0 === l2.gradient || void 0 !== l2.color ? (e.fillStyle = l2.color ?? (l2.up ? this._opts.colorUp : this._opts.colorDown), e.fill()) : (e.fillStyle = a(l2.gradient), e.fill());
      }
      l2 = null;
    };
    for (let e2 = 0; e2 < this._points.length; e2++) {
      const t2 = this._points[e2];
      if (null === t2.a || null === t2.b || !Number.isFinite(t2.a) || !Number.isFinite(t2.b)) {
        h2();
        continue;
      }
      const i3 = t2.a >= t2.b, n3 = s2(t2.index), o3 = r2(t2.a), a2 = r2(t2.b), c2 = t2.gradient ?? this._opts.gradient;
      if (null === l2 || l2.up !== i3 || l2.color === t2.color && (void 0 !== t2.color || sr(l2.gradient, c2))) {
        if (null !== l2 && l2.up !== i3) {
          const n4 = this._points[e2 - 1];
          if (void 0 !== n4 && null !== n4.a && null !== n4.b) {
            const e3 = n4.a - n4.b, o4 = t2.a - t2.b, a3 = e3 === o4 ? 0 : e3 / (e3 - o4), d2 = s2(n4.index + (t2.index - n4.index) * a3), u2 = r2(n4.a + (t2.a - n4.a) * a3);
            l2.xs.push(d2), l2.top.push(u2), l2.bot.push(u2), h2(), l2 = { up: i3, color: t2.color, gradient: c2, xs: [d2], top: [u2], bot: [u2] };
          } else h2();
        }
        null === l2 && (l2 = { up: i3, color: t2.color, gradient: c2, xs: [], top: [], bot: [] }), l2.xs.push(n3), l2.top.push(o3), l2.bot.push(a2);
      } else l2.xs.push(n3), l2.top.push(o3), l2.bot.push(a2), h2(), l2 = { up: i3, color: t2.color, gradient: c2, xs: [n3], top: [o3], bot: [a2] };
    }
    h2(), e.restore();
  }
};
function nr(e, t, i2) {
  const s2 = [];
  for (let i3 = 0; i3 < e.length; i3++) {
    const r3 = s2[s2.length - 1];
    r3 && r3[0] === e[i3] && r3[1] === t[i3] || s2.push([e[i3], t[i3]]);
  }
  if (i2 && s2.length > 1 && s2[0][0] === s2[s2.length - 1][0] && s2[0][1] === s2[s2.length - 1][1] && s2.pop(), s2.length < 2) return null;
  const r2 = [];
  if (s2.length > 2) {
    const e2 = s2.length;
    for (let t2 = 0; t2 < (i2 ? e2 : e2 - 1); t2++) {
      const n2 = s2[t2], o2 = s2[(t2 + 1) % e2], a = s2[i2 ? (t2 + e2 - 1) % e2 : Math.max(0, t2 - 1)], l2 = s2[i2 ? (t2 + 2) % e2 : Math.min(e2 - 1, t2 + 2)], h2 = [n2[0] + (o2[0] - a[0]) / 6, n2[1] + (o2[1] - a[1]) / 6, o2[0] - (l2[0] - n2[0]) / 6, o2[1] - (l2[1] - n2[1]) / 6, o2[0], o2[1]];
      if (!h2.every(Number.isFinite)) return null;
      r2.push(h2);
    }
  }
  return { points: s2, segments: r2 };
}
function or(e, t, i2, s2, r2, n2, o2, a, l2, h2) {
  const c2 = (l2?.fontSize ?? 11) * t;
  if (!Number.isFinite(c2) || c2 <= 0) return null;
  e.font = Fs(l2, c2, "ui-sans-serif, system-ui, sans-serif"), e.textBaseline = "middle", e.textAlign = l2?.textAlign ?? "left";
  const d2 = r2.split("\n");
  let u2 = 0;
  for (const t2 of d2) u2 = Math.max(u2, e.measureText(t2).width);
  const _3 = 5 * t, p2 = 3 * t, f2 = 1.35 * c2, m2 = u2 + 2 * _3, b2 = f2 * d2.length + 2 * p2, g2 = "center" === a ? i2 - m2 / 2 : "right" === a ? i2 - m2 : i2, v2 = "top" === l2?.verticalAlign ? s2 : "bottom" === l2?.verticalAlign ? s2 - b2 : s2 - b2 / 2;
  if (h2) {
    if (![g2, v2, m2, b2].every(Number.isFinite) || g2 + m2 < 0 || g2 > h2.w || v2 + b2 < 0 || v2 > h2.h) return null;
    e.save(), e.beginPath(), e.rect(0, 0, h2.w, h2.h), e.clip();
  }
  e.beginPath(), oe(e, g2, v2, m2, b2, 3 * t), e.fillStyle = n2, e.fill(), e.fillStyle = o2 ?? ee(n2);
  const y2 = "center" === l2?.textAlign ? g2 + m2 / 2 : "right" === l2?.textAlign ? g2 + m2 - _3 : g2 + _3;
  for (let t2 = 0; t2 < d2.length; t2++) e.fillText(d2[t2], y2, v2 + p2 + f2 * (t2 + 0.5));
  return h2 && e.restore(), { x: g2, y: v2, w: m2, h: b2 };
}
var ar = class {
  constructor(e) {
    Object.defineProperty(this, "_items", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_visible", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "_priceScale", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_hits", { enumerable: true, configurable: true, writable: true, value: [] }), this._priceScale = e;
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null, this._hits = [];
  }
  zOrder() {
    return "normal";
  }
  autoscaleInfo() {
    return null;
  }
  setItems(e) {
    for (const t of e) if ("label" === t.kind || "box" === t.kind) {
      if (Ns(t), void 0 !== t.verticalAlign && !["top", "middle", "bottom"].includes(t.verticalAlign)) throw new TypeError("Drawing verticalAlign must be top, middle or bottom");
      if ("box" === t.kind && void 0 !== t.align && !["left", "center", "right"].includes(t.align)) throw new TypeError("Box align must be left, center or right");
    }
    this._items = e, this._hits = [], this._host?.requestUpdate();
  }
  setVisible(e) {
    this._visible = e, this._hits = [], this._host?.requestUpdate();
  }
  draw(e, t) {
    if (this._hits = [], !this._visible || 0 === this._items.length) return;
    const i2 = t.dpr, s2 = t.plotWidth * i2, r2 = t.plotHeight * i2, n2 = t.theme.axisText, o2 = 200 * i2, a = (e2) => t.timeScale.indexToX(t.dataLayer.timeToIndexFloat(e2.time)) * i2, l2 = this._priceScale?.(t) ?? t.priceScale, h2 = (e2) => l2.priceToY(e2.price) * i2, c2 = (e2, t2, i3, n3) => Math.max(e2, i3) < 0 || Math.min(e2, i3) > s2 || Math.max(t2, n3) < 0 || Math.min(t2, n3) > r2;
    e.save(), e.lineJoin = "round", e.lineCap = "round";
    for (const t2 of this._items) {
      if ("label" === t2.kind) {
        const l4 = Rs(t2) || void 0 !== t2.verticalAlign, c3 = a(t2.at), d3 = h2(t2.at);
        if (!l4 && (c3 < -o2 || c3 > s2 + o2 || d3 < -o2 || d3 > r2 + o2)) continue;
        const u3 = or(e, i2, c3, d3, t2.text, t2.color ?? n2, t2.textColor, t2.align ?? "center", t2, l4 ? { w: s2, h: r2 } : void 0);
        u3 && this._recordHit(t2, u3, i2, l4 ? { w: s2, h: r2 } : void 0);
        continue;
      }
      const l3 = t2.color ?? n2;
      if (e.lineWidth = Math.max(1, Math.round((t2.lineWidth ?? 1) * i2)), "polyline" === t2.kind) {
        const i3 = t2.points;
        if (i3.length < 2) continue;
        const n3 = new Array(i3.length), o3 = new Array(i3.length);
        let d3 = 1 / 0, u3 = -1 / 0, _4 = 1 / 0, p3 = -1 / 0, f2 = true;
        for (let e2 = 0; e2 < i3.length; e2++) {
          if (!Number.isFinite(i3[e2].time) || !Number.isFinite(i3[e2].price)) {
            f2 = false;
            break;
          }
          const t3 = a(i3[e2]), s3 = h2(i3[e2]);
          if (!Number.isFinite(t3) || !Number.isFinite(s3)) {
            f2 = false;
            break;
          }
          n3[e2] = t3, o3[e2] = s3, t3 < d3 && (d3 = t3), t3 > u3 && (u3 = t3), s3 < _4 && (_4 = s3), s3 > p3 && (p3 = s3);
        }
        if (!f2) continue;
        const m2 = "smooth" === t2.curve, b2 = m2 ? nr(n3, o3, true === t2.closed) : null;
        if (m2 && null === b2) continue;
        if (b2) for (const e2 of b2.segments) for (let t3 = 0; t3 < e2.length; t3 += 2) d3 = Math.min(d3, e2[t3]), u3 = Math.max(u3, e2[t3]), _4 = Math.min(_4, e2[t3 + 1]), p3 = Math.max(p3, e2[t3 + 1]);
        const g2 = m2 ? e.lineWidth / 2 : 0;
        if (c2(d3 - g2, _4 - g2, u3 + g2, p3 + g2)) continue;
        if (m2 && (e.save(), e.beginPath(), e.rect(0, 0, s2, r2), e.clip()), e.beginPath(), e.moveTo(n3[0], o3[0]), b2 && b2.segments.length > 0) for (const t3 of b2.segments) e.bezierCurveTo(...t3);
        else if (b2) e.lineTo(b2.points[1][0], b2.points[1][1]);
        else for (let t3 = 1; t3 < i3.length; t3++) e.lineTo(n3[t3], o3[t3]);
        true === t2.closed && e.closePath(), void 0 !== t2.fillColor && (e.globalAlpha = t2.opacity ?? 0.12, e.fillStyle = t2.fillColor, e.fill(), e.globalAlpha = 1), e.setLineDash([]), e.strokeStyle = l3, e.stroke(), m2 && e.restore();
        continue;
      }
      let d2 = a(t2.from), u2 = h2(t2.from), _3 = a(t2.to), p2 = h2(t2.to);
      if ("box" === t2.kind) {
        const n3 = Rs(t2) || void 0 !== t2.align || void 0 !== t2.verticalAlign;
        if (!n3 && c2(d2, u2, _3, p2)) continue;
        if (n3 && ![d2, u2, _3, p2].every(Number.isFinite)) continue;
        const o3 = Math.min(d2, _3), a2 = Math.min(u2, p2), h3 = Math.abs(_3 - d2), f2 = Math.abs(p2 - u2);
        if (n3 && (!Number.isFinite(h3) || !Number.isFinite(f2))) continue;
        if (n3 && (e.save(), e.beginPath(), e.rect(0, 0, s2, r2), e.clip()), void 0 !== t2.fillColor && (e.globalAlpha = t2.opacity ?? 0.12, e.fillStyle = t2.fillColor, e.fillRect(o3, a2, h3, f2), e.globalAlpha = 1), e.setLineDash([]), e.strokeStyle = l3, e.strokeRect(o3, a2, h3, f2), this._recordHit(t2, { x: o3, y: a2, w: h3, h: f2 }, i2, n3 ? { w: s2, h: r2 } : void 0), void 0 !== t2.text && "" !== t2.text) {
          const c3 = "left" === t2.align ? o3 : "right" === t2.align ? o3 + h3 : o3 + h3 / 2, d3 = "top" === t2.verticalAlign ? a2 : "bottom" === t2.verticalAlign ? a2 + f2 : a2 + f2 / 2;
          or(e, i2, c3, d3, t2.text, l3, t2.textColor, t2.align ?? "center", t2, n3 ? { w: s2, h: r2 } : void 0);
        }
        n3 && e.restore();
        continue;
      }
      if (true === t2.extendLeft || true === t2.extendRight) {
        const e2 = _3 - d2;
        if (0 === e2) u2 = 0, p2 = r2;
        else {
          const i3 = (p2 - u2) / e2, r3 = d2 <= _3;
          true === t2.extendLeft && (r3 ? (u2 -= i3 * d2, d2 = 0) : (p2 -= i3 * _3, _3 = 0)), true === t2.extendRight && (r3 ? (p2 += i3 * (s2 - _3), _3 = s2) : (u2 += i3 * (s2 - d2), d2 = s2));
        }
      }
      c2(d2, u2, _3, p2) || (e.setLineDash(ge(t2.lineStyle, i2)), e.strokeStyle = l3, e.beginPath(), e.moveTo(d2, u2), e.lineTo(_3, p2), e.stroke());
    }
    e.setLineDash([]), this._drawTooltip(e, t, i2, s2, r2, n2), e.restore();
  }
  _recordHit(e, t, i2, s2) {
    const r2 = e.id ?? e.tooltip;
    if (void 0 === r2) return;
    const n2 = s2 ? Math.max(0, t.x) : t.x, o2 = s2 ? Math.max(0, t.y) : t.y, a = s2 ? Math.min(s2.w, t.x + t.w) : t.x + t.w, l2 = s2 ? Math.min(s2.h, t.y + t.h) : t.y + t.h;
    s2 && (a <= n2 || l2 <= o2) || this._hits.push({ id: r2, tooltip: e.tooltip, x: n2 / i2, y: o2 / i2, w: (a - n2) / i2, h: (l2 - o2) / i2, clipped: void 0 !== s2 });
  }
  _drawTooltip(e, t, i2, s2, r2, n2) {
    const o2 = t.hoverId;
    if (null == o2) return;
    const a = this._hits.find((e2) => e2.id === o2 && void 0 !== e2.tooltip);
    if (void 0 === a?.tooltip) return;
    const l2 = 8 * i2, h2 = 11 * i2 * 1.35 * a.tooltip.split("\n").length + 6 * i2, c2 = a.y * i2 - l2 - h2 >= 0 ? a.y * i2 - l2 - h2 / 2 : (a.y + a.h) * i2 + l2 + h2 / 2, d2 = Math.min(Math.max((a.x + a.w / 2) * i2, 0), s2);
    c2 < -h2 || c2 > r2 + h2 || or(e, i2, d2, c2, a.tooltip, n2, void 0, "center", void 0, a.clipped ? { w: s2, h: r2 } : void 0);
  }
  hitTest(e, t) {
    for (let i2 = this._hits.length - 1; i2 >= 0; i2--) {
      const s2 = this._hits[i2];
      if (e >= s2.x && e <= s2.x + s2.w && t >= s2.y && t <= s2.y + s2.h) return { externalId: s2.id, zOrder: "normal", distance: 0, cursor: void 0 === s2.tooltip ? "pointer" : "default" };
    }
    return null;
  }
};
var lr = class {
  constructor() {
    Object.defineProperty(this, "_colors", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_anchor", { enumerable: true, configurable: true, writable: true, value: NaN }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_visible", { enumerable: true, configurable: true, writable: true, value: true });
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null;
  }
  zOrder() {
    return "bottom";
  }
  autoscaleInfo() {
    return null;
  }
  setColors(e, t) {
    this._colors = e, this._anchor = t.length > 0 ? t[0].time : NaN, this._host?.requestUpdate();
  }
  setVisible(e) {
    this._visible = e, this._host?.requestUpdate();
  }
  draw(e, t) {
    const i2 = this._colors, s2 = i2.length;
    if (!this._visible || 0 === s2) return;
    const r2 = Math.round(t.dataLayer.timeToIndexFloat(this._anchor)), n2 = t.timeScale.visibleRange(), o2 = Math.max(0, Math.floor(n2.from - r2)), a = Math.min(s2 - 1, Math.ceil(n2.to - r2)), l2 = t.dpr, h2 = t.plotWidth * l2, c2 = t.plotHeight * l2, d2 = (e2) => Math.min(h2, Math.max(0, Math.round(t.timeScale.indexToX(r2 + e2 - 0.5) * l2)));
    e.save();
    for (let t2 = o2, s3 = o2; t2 <= a; t2++) {
      const r3 = i2[t2];
      if (!(t2 < a && i2[t2 + 1] === r3)) {
        if (r3) {
          const i3 = d2(s3);
          e.fillStyle = r3, e.fillRect(i3, 0, d2(t2 + 1) - i3, c2);
        }
        s3 = t2 + 1;
      }
    }
    e.restore();
  }
};
function hr(e, t) {
  return e === t ? 0 !== e || 1 / e == 1 / t : e != e && t != t;
}
function cr(e, t) {
  const i2 = t[as(e).opacity];
  return "number" == typeof i2 && Number.isFinite(i2) ? i2 : 100;
}
function dr(e, t) {
  if ("string" != typeof e || t >= 100) return e;
  const i2 = Q(e);
  return null === i2 ? e : `rgba(${i2.r},${i2.g},${i2.b},${i2.a * Math.max(0, t) / 100})`;
}
var ur = class {
  constructor() {
    Object.defineProperty(this, "_times", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_ordered", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "_kept", { enumerable: true, configurable: true, writable: true, value: -1 }), Object.defineProperty(this, "_pass", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_records", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new WeakMap() });
  }
  begin(e) {
    const t = this._times, i2 = t.length, s2 = e.length;
    let r2 = this._ordered && s2 >= i2;
    for (let s3 = 0; s3 < i2 && r2; s3++) r2 = e[s3].time === t[s3];
    r2 || (t.length = 0, this._ordered = true);
    for (let i3 = t.length; i3 < s2; i3++) {
      const s3 = e[i3].time;
      i3 > 0 && !(s3 > t[i3 - 1]) && (this._ordered = false), t.push(s3);
    }
    this._kept = r2 && this._ordered ? i2 : -1, this._pass++;
  }
  clear(e) {
    this._records.delete(e), e.setData([]);
  }
  writeValues(e, t, i2, s2, r2, n2) {
    if (void 0 === i2) return void this.clear(e);
    const o2 = s2.length, { colorBy: a, colorParts: l2 } = t, h2 = void 0 !== a || void 0 !== l2, c2 = h2 ? cr(t, n2) : 100, [d2, u2] = this._claim(e, 1, 1), _3 = d2.cols[0], p2 = d2.colors[0], f2 = [];
    let m2 = u2 < 0;
    for (let e2 = 0; e2 < o2; e2++) {
      const t2 = i2[e2], s3 = null == t2 ? NaN : t2;
      let o3;
      h2 && Number.isFinite(s3) && (o3 = dr(l2?.({ value: s3, index: e2, values: r2, settings: n2 })?.body ?? a?.({ value: s3, index: e2, values: r2, settings: n2 }), c2)), !m2 && (e2 >= u2 || !hr(_3[e2], s3) || h2 && p2[e2] !== o3) && f2.push(e2) > 8 && (m2 = true), _3[e2] = s3, h2 && (p2[e2] = o3);
    }
    this._commit(e, d2, m2, f2, o2, (e2) => {
      const t2 = { time: s2[e2].time, value: _3[e2] };
      return void 0 !== p2[e2] && (t2.color = p2[e2]), t2;
    });
  }
  writeCandles(e, t, i2, s2, r2, n2, o2) {
    const a = s2.length, l2 = [i2.open, i2.high, i2.low, i2.close].map((e2) => {
      const i3 = r2[e2];
      if (void 0 === i3 || i3.length !== a) throw new Error(`openalgo-charts: ${o2} plot "${t.key}" ohlc column "${e2}" must be ${a} values`);
      return i3;
    }), { colorBy: h2, colorParts: c2 } = t, d2 = void 0 !== h2 || void 0 !== c2 ? cr(t, n2) : 100, [u2, _3] = this._claim(e, 4, 3), [p2, f2, m2, b2] = u2.cols, [g2, v2, y2] = u2.colors, w2 = [];
    let x2 = _3 < 0;
    for (let e2 = 0; e2 < a; e2++) {
      const t2 = l2[3][e2], i3 = null === t2 ? NaN : t2, s3 = l2[0][e2] ?? NaN, o3 = l2[1][e2] ?? NaN, a2 = l2[2][e2] ?? NaN;
      let u3, S2, P2;
      if (Number.isFinite(i3)) {
        u3 = h2?.({ value: i3, index: e2, values: r2, settings: n2 });
        const t3 = c2?.({ value: i3, index: e2, values: r2, settings: n2 });
        void 0 !== t3 && (void 0 !== t3.body && (u3 = t3.body), S2 = dr(t3.wick, d2), P2 = dr(t3.border, d2)), u3 = dr(u3, d2);
      }
      x2 || !(e2 >= _3) && hr(p2[e2], s3) && hr(f2[e2], o3) && hr(m2[e2], a2) && hr(b2[e2], i3) && g2[e2] === u3 && v2[e2] === S2 && y2[e2] === P2 || !(w2.push(e2) > 8) || (x2 = true), p2[e2] = s3, f2[e2] = o3, m2[e2] = a2, b2[e2] = i3, g2[e2] = u3, v2[e2] = S2, y2[e2] = P2;
    }
    this._commit(e, u2, x2, w2, a, (e2) => {
      const t2 = { time: s2[e2].time, open: p2[e2], high: f2[e2], low: m2[e2], close: b2[e2] };
      return void 0 !== g2[e2] && (t2.color = g2[e2]), void 0 !== v2[e2] && (t2.wickColor = v2[e2]), void 0 !== y2[e2] && (t2.borderColor = y2[e2]), t2;
    });
  }
  _claim(e, t, i2) {
    let s2 = this._records.get(e);
    const r2 = void 0 !== s2 && s2.pass === this._pass - 1 ? this._kept : -1;
    if (void 0 === s2) s2 = { pass: -1, cols: Array.from({ length: t }, () => []), colors: Array.from({ length: i2 }, () => []) }, this._records.set(e, s2);
    else if (r2 < 0) for (const e2 of [...s2.cols, ...s2.colors]) e2.length = 0;
    return [s2, r2];
  }
  _commit(e, t, i2, s2, r2, n2) {
    if (i2) {
      const t2 = new Array(r2);
      for (let e2 = 0; e2 < r2; e2++) t2[e2] = n2(e2);
      e.setData(t2);
    } else if (0 === r2) e.setData([]);
    else {
      for (const t2 of s2) e.update(n2(t2));
      s2[s2.length - 1] !== r2 - 1 && e.update(n2(r2 - 1));
    }
    t.pass = this._pass;
  }
};
function _r(e) {
  if ("chart" !== e && "underlying" !== e) throw new TypeError(`openalgo-charts: a study bar source is 'chart' or 'underlying', not ${String(e)}`);
  return e;
}
function pr(e, t, i2) {
  let s2 = 0, r2 = e;
  for (; s2 < r2; ) {
    const e2 = s2 + r2 >> 1;
    t(e2) < i2 ? s2 = e2 + 1 : r2 = e2;
  }
  return s2;
}
var fr = class extends Error {
  constructor(e) {
    super(`openalgo-charts: unknown interval "${e}". Register it with registerInterval() or use a built-in token (1s, 1m, 5m, 1h, D, W).`), Object.defineProperty(this, "code", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.name = "UnknownIntervalError", this.code = e;
  }
};
var mr = /^(\d*)\s*([smhdw])$/i;
var br = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
var gr = /* @__PURE__ */ new Map();
function vr(e) {
  const t = e.trim();
  return /^\d*\s*M$/.test(t) ? t : t.toLowerCase();
}
function Sr(e) {
  const t = e.trim(), i2 = gr.get(vr(t));
  if (void 0 !== i2) return i2;
  const s2 = function(e2) {
    if (/^\d*\s*M$/.test(e2)) return null;
    const t2 = mr.exec(e2);
    return null === t2 ? null : { mode: "interval", seconds: ("" === t2[1] ? 1 : Number(t2[1])) * br[t2[2].toLowerCase()] };
  }(t);
  return null === s2 ? null : { code: t, bucketing: s2 };
}
function Or(e) {
  const t = Sr(e);
  if (null === t) throw new fr(e);
  return t;
}
function kr(e) {
  return "interval" === e.mode || "calendar" === e.mode;
}
var Ir = { month: 1, quarter: 3, year: 12 };
function Mr(e) {
  return Ir[e.unit] * Math.max(1, Math.floor(e.count ?? 1));
}
function Tr(e, t) {
  return e.timezone ?? t ?? ct;
}
function Cr(e, t, i2) {
  const s2 = mt(t, i2), r2 = Mr(e);
  return Math.floor((12 * s2.year + (s2.month - 1)) / r2) * r2;
}
function jr(e, t) {
  return It(Math.floor(e / 12), e % 12 + 1, 1, 0, 0, 0, t);
}
function Ar(e, t, i2) {
  if ("interval" === e.mode) {
    const i3 = e.anchorSec ?? 0;
    return i3 + Math.floor((t - i3) / e.seconds) * e.seconds;
  }
  if ("calendar" !== e.mode) return t;
  const s2 = Tr(e, i2);
  return jr(Cr(e, t, s2), s2);
}
function Lr(e, t, i2) {
  if ("interval" === e.mode) return Ar(e, t) + e.seconds;
  if ("calendar" !== e.mode) return null;
  const s2 = Tr(e, i2);
  return jr(Cr(e, t, s2) + Mr(e), s2);
}
function $r(e, t, i2) {
  if (!ss(t)) throw new TypeError("Invalid indicator plot price scale map");
  const s2 = new Set(e.plots.map((e2) => e2.key));
  return Reflect.ownKeys(t).map((e2) => {
    const r2 = Object.getOwnPropertyDescriptor(t, e2);
    if (!("string" == typeof e2 && s2.has(e2) && r2.enumerable && "value" in r2 && (N(r2.value) || i2 && null === r2.value))) throw new TypeError("Invalid indicator plot price scale assignment");
    return [e2, r2.value];
  });
}
function Dr(e, t) {
  return void 0 === t ? {} : Object.fromEntries($r(e, t, false));
}
function Wr(e, t, i2) {
  return (Object.prototype.hasOwnProperty.call(i2, e.key) ? i2[e.key] : void 0) ?? (true === e.overlay ? null : t) ?? e.priceScaleId ?? "right";
}
function qr(e, t, i2) {
  const s2 = e.plots.find((e2) => true !== e2.overlay);
  return s2 ? Wr(s2, t, i2) : t ?? "right";
}
function Vr(e, t, i2, s2, r2, n2 = 0) {
  const o2 = e.plots.find((e2) => e2.key === t.between[0]), a = e.plots.find((e2) => e2.key === t.between[1]), l2 = true === t.overlay ? n2 : r2;
  if (o2 && (true === o2.overlay ? n2 : r2) !== l2 || a && (true === a.overlay ? n2 : r2) !== l2) return null;
  const h2 = true === t.overlay ? "right" : qr(e, i2, s2), c2 = o2 ? Wr(o2, i2, s2) : h2;
  return c2 === (a ? Wr(a, i2, s2) : h2) ? c2 : null;
}
function Hr(e, t, i2, s2, r2 = 0) {
  if (void 0 !== t && !N(t)) throw new TypeError("Invalid indicator price scale");
  const n2 = Dr(e, i2);
  if ((void 0 !== t || 0 !== Object.keys(n2).length) && (e.fills ?? []).some((i3) => null === Vr(e, i3, t ?? null, n2, s2, r2))) throw new RangeError("Indicator fill endpoints must share their pane and price scale");
}
function Gr(e) {
  const t = {};
  for (const i2 of ls(e)) t[i2.key] = i2.default;
  return t;
}
function Ur(e, t) {
  if (void 0 !== t && t > 0) return e.toFixed(f(t));
  const i2 = Math.abs(e);
  return i2 >= 1e9 ? `${(e / 1e9).toFixed(2)}B` : i2 >= 1e6 ? `${(e / 1e6).toFixed(2)}M` : i2 >= 1e3 ? e.toFixed(0) : i2 >= 1 ? e.toFixed(2) : e.toPrecision(3);
}
var Kr = 1;
var Yr = 1;
var Xr = false;
var Jr = class extends is {
};
var Zr = class {
  constructor(e, t, i2 = {}, s2, r2, n2, o2, a, l2, h2, c2 = false) {
    Object.defineProperty(this, "id", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "indicatorId", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "paneIndex", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_d", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_ownPane", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_settings", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_scaleOverride", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_plotScaleOverrides", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_policy", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_zoned", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_series", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_plotTypes", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_fills", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_levels", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_levelSig", { enumerable: true, configurable: true, writable: true, value: "" }), Object.defineProperty(this, "_values", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "_writes", { enumerable: true, configurable: true, writable: true, value: new ur() }), Object.defineProperty(this, "_barCount", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_firstTime", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_lastTime", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_removed", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_store", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "_attachedPrimitives", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_detach", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_lifetime", { enumerable: true, configurable: true, writable: true, value: new AbortController() }), Object.defineProperty(this, "_dataStatus", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_dataRetry", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_dataListeners", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_legend", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_markers", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_markerSeries", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_markerLayers", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_table", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_tables", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_draws", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_drawLayers", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_background", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_bgLayers", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_alertTime", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_alertRead", { enumerable: true, configurable: true, writable: true, value: -1 / 0 }), Object.defineProperty(this, "_alertPolicy", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_calculationEpoch", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_live", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_sourceId", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_sourceRevision", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_sourceHistoryRevision", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_sourceLastTime", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_visible", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "_constructed", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_calcFailed", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_lifecycleStatus", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_generation", { enumerable: true, configurable: true, writable: true, value: Yr++ }), Object.defineProperty(this, "_outputRevision", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_outputHistoryRevision", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_outputSource", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_studySnapshots", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_dependencyUnavailable", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_alertNeedsSeed", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_outputPending", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_publishedBarColors", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_barSource", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_restored", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_sampled", { enumerable: true, configurable: true, writable: true, value: null }), this._restored = c2, this._host = e, this._d = t, this._barSource = void 0 === h2 ? "chart" : _r(h2), this._policy = void 0 === l2 ? Object.freeze({}) : Ls(l2), this._scaleOverride = o2 ?? null, this._plotScaleOverrides = Dr(t, a), this.indicatorId = t.id, this.name = t.name, this._alertPolicy = new Ps(t.alerts ?? []);
    let d2 = r2;
    if (void 0 === d2) do {
      d2 = `${t.id}-${Kr++}`;
    } while (n2?.has(d2));
    this.id = d2, this._settings = this._validatedSettings({ ...ms(t), ...Gr(t), ...Ms(i2) }), void 0 !== s2 ? (this.paneIndex = s2, this._ownPane = false) : "onchart" === t.placement ? (this.paneIndex = this._pricePane(), this._ownPane = false) : (this.paneIndex = e.nextPaneIndex(), this._ownPane = true), Hr(t, o2, void 0 === a ? void 0 : this._plotScaleOverrides, this.paneIndex, this._pricePane());
    for (const i3 of t.plots) {
      const t2 = this._plotType(i3);
      this._plotTypes.set(i3.key, t2), this._series.set(i3.key, e.addIndicatorSeries(t2, this._plotPane(i3), this._plotStyle(i3), this._plotScale(i3), i3.priceFormat));
    }
    for (const i3 of t.fills ?? []) {
      const t2 = new rr({ colorUp: this._fillColor(i3, true), colorDown: this._fillColor(i3, false), opacity: i3.opacity ?? 0.12 });
      this._fills.push(t2), e.addIndicatorFill(t2, true === i3.overlay ? this._pricePane() : this.paneIndex);
      const s3 = this._fillScale(i3, this._scaleOverride);
      null !== s3 && e.bindIndicatorPrimitiveScale?.(t2, s3);
    }
    this._legend = e.addIndicatorLegend({ id: `indicator:${this.id}`, title: t.name, params: this._paramSummary(), color: this._legendColor(), row: e.legendRowsOn(this.paneIndex), paneIndex: this.paneIndex, hasSource: true === t.hasSource }), this._applyRange();
    try {
      this.recompute();
    } catch (e2) {
      throw this.remove({ force: true }), e2;
    }
    this._constructed = true, this._attach();
  }
  _plotPane(e) {
    return true === e.overlay ? this._pricePane() : this.paneIndex;
  }
  _pricePane() {
    return this._host.primaryPaneIndex?.() ?? 0;
  }
  _plotScale(e, t = this._scaleOverride, i2 = this._plotScaleOverrides) {
    return Wr(e, t, i2);
  }
  _localScale(e = this._scaleOverride, t = this._plotScaleOverrides) {
    return qr(this._d, e, t);
  }
  _fillScale(e, t, i2 = this.paneIndex, s2 = this._plotScaleOverrides) {
    return Vr(this._d, e, t, s2, i2, this._pricePane());
  }
  _targetKey({ plot: e, overlay: t }) {
    if (void 0 === e) return true === t ? null : void 0;
    if (true === t || !this._d.plots.some((t2) => t2.key === e)) throw new Error("Indicator output target must name one declared plot or the price pane");
    return e;
  }
  _targets() {
    return [null, ...this._d.plots.map((e) => e.key)];
  }
  _route(e, t) {
    const i2 = [], s2 = new Map(this._targets().map((e2) => [e2, []]));
    for (const r2 of e) {
      const e2 = this._targetKey(r2);
      (void 0 === e2 || t?.(e2) ? i2 : s2.get(e2)).push(r2);
    }
    for (const [e2, t2] of s2) 0 === t2.length && s2.delete(e2);
    return [s2.size > 0 ? i2 : e, s2];
  }
  _overlayTarget(e) {
    return null === e || this._d.plots.some((t) => t.key === e && true === t.overlay);
  }
  _drawTarget(e, t = this._scaleOverride, i2 = this._plotScaleOverrides) {
    const s2 = this._d.plots.find((t2) => t2.key === e);
    return s2 ? [this._plotPane(s2), this._plotScale(s2, t, i2)] : [this._pricePane(), null];
  }
  priceScaleId() {
    return this._scaleOverride;
  }
  plotPriceScaleId(e) {
    const t = this._d.plots.find((t2) => t2.key === e);
    return t ? this._plotScale(t) : null;
  }
  plotPriceScaleIds() {
    return { ...this._plotScaleOverrides };
  }
  canRelocate(e) {
    return (this._d.fills ?? []).every((t) => null !== this._fillScale(t, this._scaleOverride, e));
  }
  adoptPriceScale(e) {
    this._scaleOverride = e, this._plotScaleOverrides = this._overlayScaleOverrides();
  }
  _overlayScaleOverrides() {
    return Object.fromEntries(this._d.plots.filter((e) => true === e.overlay && Object.prototype.hasOwnProperty.call(this._plotScaleOverrides, e.key)).map((e) => [e.key, this._plotScaleOverrides[e.key]]));
  }
  policy() {
    return this._policy;
  }
  barSource() {
    return this._barSource;
  }
  setBarSource(e, t) {
    const i2 = _r(e);
    return !(this._removed || i2 === this._barSource || !this._allows("configurable", t)) && (this._barSource = i2, this._barCount = 0, this._requestRecompute(true), this._host.emit?.("objects:change", {}), true);
  }
  setPolicy(e) {
    const t = null === e ? Object.freeze({}) : Ls(e);
    this._removed || (this._policy = t, this._host.policyChanged?.());
  }
  _allows(e, t) {
    return true === t?.force || false !== this._policy[e];
  }
  setPriceScale(e, t) {
    if (this._removed || !this._allows("configurable", t) || null !== e && !N(e)) return false;
    const i2 = this._overlayScaleOverrides();
    return (e !== this._scaleOverride || Object.keys(i2).length !== Object.keys(this._plotScaleOverrides).length) && this._assignPriceScales(e, i2, false);
  }
  setPlotPriceScales(e, t) {
    if (this._removed || !this._allows("configurable", t)) return false;
    let i2;
    try {
      i2 = $r(this._d, e, true);
    } catch {
      return false;
    }
    const s2 = new Map(Object.entries(this._plotScaleOverrides));
    let r2 = false;
    for (const [e2, t2] of i2) null === t2 ? r2 = s2.delete(e2) || r2 : s2.get(e2) !== t2 && (s2.set(e2, t2), r2 = true);
    return r2 && this._assignPriceScales(this._scaleOverride, Object.fromEntries(s2), true);
  }
  _assignPriceScales(e, t, i2) {
    const s2 = this._d.plots.filter((e2) => i2 || true !== e2.overlay), r2 = /* @__PURE__ */ new Map();
    for (const i3 of s2) {
      const s3 = this._plotScale(i3, e, t);
      if (s3 === this._plotScale(i3)) continue;
      const n3 = this._plotPane(i3), o3 = r2.get(n3) ?? /* @__PURE__ */ new Set();
      o3.add(s3), r2.set(n3, o3);
    }
    const n2 = s2.flatMap((i3) => {
      const s3 = this._plotScale(i3, e, t);
      if (!r2.get(this._plotPane(i3))?.has(s3)) return [];
      const n3 = this._series.get(i3.key);
      return n3 ? [{ api: n3, scaleId: s3 }] : [];
    }), o2 = [];
    for (let s3 = 0; s3 < this._fills.length; s3++) {
      const r3 = this._fillScale(this._d.fills[s3], e, this.paneIndex, t);
      if (null === r3) return false;
      !i2 && true === this._d.fills[s3].overlay || r3 === this._fillScale(this._d.fills[s3], this._scaleOverride) || o2.push({ primitive: this._fills[s3], scaleId: r3 });
    }
    const a = this._localScale(e, t);
    if (a !== this._localScale()) for (const e2 of [...this._levels, this._draws, ...this._attachedPrimitives]) null !== e2 && o2.push({ primitive: e2, scaleId: a });
    for (const [i3, s3] of [...this._drawLayers, ...this._bgLayers]) {
      const r3 = this._drawTarget(i3, e, t)[1];
      null !== r3 && r3 !== this._drawTarget(i3)[1] && o2.push({ primitive: s3, scaleId: r3 });
    }
    const l2 = this._settings, h2 = this._plotScaleOverrides, c2 = this._scaleOverride, d2 = this.paneIndex, u2 = this._host.setIndicatorRange || this._ownPane ? this._d.range?.(this._descriptorSettings()) ?? null : null;
    if (this._removed || l2 !== this._settings || h2 !== this._plotScaleOverrides || c2 !== this._scaleOverride || d2 !== this.paneIndex) return false;
    const _3 = this._host.assignIndicatorScale?.(this.id, n2, o2, () => {
      this._scaleOverride = e, this._plotScaleOverrides = t, this._applyRange(u2);
    }) ?? false;
    return _3 && this.updateLegendValues(this._host.legendIndex?.()), _3;
  }
  _paramSummary() {
    const e = [];
    for (const t of this._d.inputs) {
      if ("color" === t.type || "boolean" === t.type) continue;
      const i2 = this._settings[t.key];
      if (null != i2 && "" !== i2) if ("source" === t.type && t.allowStudyOutputs && "object" == typeof i2) {
        const t2 = i2;
        e.push(`${t2.instanceId}/${t2.plotKey}`);
      } else e.push(String(i2));
    }
    return e.join(" ");
  }
  _legendColor() {
    for (const e of this._d.plots) {
      const t = e.colorKey;
      if (void 0 !== t && "string" == typeof this._settings[t]) return this._settings[t];
      if ("string" == typeof e.style?.color) return e.style.color;
    }
  }
  visible() {
    return this._visible;
  }
  setVisible(e) {
    if (this._removed || e === this._visible) return;
    this._visible = e;
    for (const t2 of this._d.plots) this._series.get(t2.key)?.applyOptions({ visible: e && false !== t2.style?.visible });
    for (const t2 of this._fills) t2.setVisible(e);
    const t = this._host.sourceBars();
    this._applyLevels(t, this._descriptorSettings()), this._syncMarkers(t);
    try {
      this._syncTable(t);
    } catch (e2) {
      this._calcFailed = true, this._publishStatus({ state: "error", error: e2 });
    }
    this._syncBarColors(t), this._draws?.setVisible(e);
    for (const t2 of [...this._drawLayers.values(), ...this._bgLayers.values()]) t2.setVisible(e);
    this._background?.setVisible(e), this._legend?.setOptions({ hidden: !e }), this._host.emit?.("objects:change", {});
  }
  shiftPane(e) {
    this.paneIndex += e;
  }
  renderResources() {
    const e = this._d.plots.flatMap((e2) => {
      const t2 = this._series.get(e2.key);
      return t2 ? [{ api: t2, overlay: true === e2.overlay }] : [];
    }), t = this._fills.map((e2, t2) => ({ primitive: e2, overlay: true === this._d.fills?.[t2].overlay }));
    for (const { table: e2, overlay: i3 } of this._tables.values()) t.push({ primitive: e2, overlay: i3 });
    Xr && (e.length = 0, t.length = 0);
    const i2 = (...i3) => {
      for (const s3 of i3) null === s3 || Xr || t.push({ primitive: s3, overlay: s3 === this._markers && (this._markerSeries === this._host.primarySeries?.() || e.some((e2) => e2.api === this._markerSeries && e2.overlay)) });
    }, s2 = (e2) => {
      for (const i3 of this._targets()) {
        const s3 = e2(i3);
        s3 && t.push({ primitive: s3, overlay: this._overlayTarget(i3) });
      }
    };
    return i2(this._legend, ...this._levels, this._markers), s2((e2) => this._markerLayers.get(e2)?.[0]), i2(this._table, this._draws), s2((e2) => this._drawLayers.get(e2)), i2(this._background), s2((e2) => this._bgLayers.get(e2)), i2(...this._attachedPrimitives), { series: e, primitives: t };
  }
  relocate(e) {
    this._ownPane && !this._host.setIndicatorRange && this._host.setPaneRange(this.paneIndex, null), this.paneIndex = e, this._applyRange(), this._syncMarkers(this._host.sourceBars());
  }
  refreshBarColors() {
    Xr || (this._calcFailed ? this.republishBarColors() : this._syncBarColors(this._host.sourceBars()));
  }
  republishBarColors() {
    this._d.barColors && this._host.setBarColors?.(this._publishedBarColors, this.id);
  }
  legend() {
    return this._legend;
  }
  updateLegendValues(e) {
    if (null === this._legend) return;
    const t = this._barCount, i2 = void 0 === e || e < 0 || e >= t ? t - 1 : e;
    if (i2 < 0) return void this._legend.setValues([]);
    const s2 = [];
    for (const e2 of this._d.plots) {
      const t2 = this._values[e2.ohlc?.close ?? e2.key]?.[i2 - (e2.offset ?? 0)];
      if (null == t2 || !Number.isFinite(t2)) continue;
      const r2 = this._plotPane(e2), n2 = this._plotColor(e2);
      if (void 0 !== n2 && re(n2)) continue;
      const o2 = this._host.formatPrice?.(r2, t2, this._series.get(e2.key)) ?? Ur(t2, this._host.tickSize?.(r2));
      s2.push({ text: o2, color: n2 });
    }
    this._legend.setValues(s2);
  }
  _fillColor(e, t) {
    const i2 = t ? e.colorUpKey : e.colorDownKey, s2 = void 0 !== i2 ? this._settings[i2] : void 0;
    if ("string" == typeof s2) return s2;
    return (t ? e.colorUp : e.colorDown) ?? (t ? "#26a69a" : "#ef5350");
  }
  _syncFills(e) {
    const t = this._d.fills ?? [], i2 = this._descriptorSettings();
    for (let s2 = 0; s2 < t.length; s2++) {
      const r2 = this._fills[s2];
      if (void 0 === r2) continue;
      const n2 = t[s2], o2 = this._values[n2.between[0]], a = this._values[n2.between[1]];
      if (r2.setOptions({ colorUp: this._fillColor(n2, true), colorDown: this._fillColor(n2, false), opacity: n2.opacity ?? 0.12, gradient: "function" == typeof n2.gradient ? n2.gradient({ bars: e, values: this._values, settings: i2 }) : n2.gradient }), void 0 === o2 || void 0 === a) {
        r2.setPoints([]);
        continue;
      }
      const l2 = this._d.plots.find((e2) => e2.key === n2.between[0])?.offset ?? 0, h2 = [];
      for (let e2 = 0; e2 < this._barCount; e2++) {
        const t2 = o2[e2] ?? null, s3 = a[e2] ?? null, r3 = { index: e2, a: t2, b: s3, values: this._values, settings: i2 }, c2 = n2.colorBy?.(r3), d2 = n2.gradientBy?.(r3);
        h2.push({ index: e2 + l2, a: t2, b: s3, color: c2, gradient: d2 });
      }
      r2.setPoints(h2);
    }
  }
  _syncMarkers(e) {
    if (this._dependencyUnavailable) return;
    if (void 0 === this._d.markers) return;
    const t = this._sampled, i2 = this._visible ? this._d.markers({ bars: e, values: this._values, settings: this._descriptorSettings() }).flatMap((i3) => {
      const s3 = null === t ? i3.time : function(e2, t2, i4, s4) {
        const r3 = pr(t2.length, (e3) => t2[e3].time, e2);
        if (t2[r3]?.time === e2) return e2;
        const n3 = pr(i4.length, (e3) => i4[e3].time, e2);
        return t2[pr(s4.length, (e3) => s4[e3], n3)]?.time ?? null;
      }(i3.time, e, t.bars, t.sourceIndex);
      return null === s3 ? [] : [s3 === i3.time ? i3 : { ...i3, time: s3 }];
    }) : [], s2 = this._host.primarySeries?.() ?? void 0, r2 = this.paneIndex === this._pricePane(), n2 = ("price" === this._d.markerAnchor && r2 ? s2 : void 0) ?? this._series.get(this._d.plots[0]?.key ?? ""), o2 = (e2) => null === e2 ? s2 : this._series.get(e2), [a, l2] = this._route(i2, (e2) => o2(e2) === n2 && !(!r2 && this._overlayTarget(e2)));
    l2.size > 0 && new ir(0).setMarkers(i2);
    let h2 = false;
    null !== this._markers && n2 !== this._markerSeries && (this._host.removeIndicatorMarkers(this._markers), this._markers = null), null === this._markers && a.length > 0 && void 0 !== n2 && (this._markerSeries = n2, this._markers = n2.createMarkers(() => {
      const e2 = this._host.primarySeries?.();
      return this.paneIndex === this._pricePane() && null != e2 && n2.priceScale() === e2.priceScale() ? this._host.sourceBars() : [];
    })), this._markers?.setMarkers(a);
    for (const [e2, [t2, i3]] of this._markerLayers) i3 !== o2(e2) || this._visible && !l2.has(e2) ? (this._host.removeIndicatorMarkers(t2), this._markerLayers.delete(e2)) : this._visible || t2.setMarkers([]);
    for (const [e2, t2] of l2) {
      let i3 = this._markerLayers.get(e2);
      const s3 = o2(e2);
      if (void 0 === i3 && void 0 !== s3) {
        const t3 = this._d.plots.find((t4) => t4.key === e2);
        h2 = true, this._markerLayers.set(e2, i3 = [s3.createMarkers(t3 && (() => {
          const e3 = this._host.primarySeries?.();
          return this._plotPane(t3) === this._pricePane() && null != e3 && s3.priceScale() === e3.priceScale() ? this._host.sourceBars() : [];
        })), s3]);
      }
      i3?.[0].setMarkers(t2);
    }
    this._restack(h2);
  }
  _syncTable(e) {
    if (this._dependencyUnavailable) return;
    if (void 0 !== this._d.tables) return void this._syncTables(e);
    if (void 0 === this._d.table) return;
    const t = this._visible ? this._d.table({ bars: e, values: this._values, settings: this._descriptorSettings() }) : null, i2 = t?.rows ?? [];
    if (null === this._table) {
      if (0 === i2.length) return;
      this._table = this._host.addIndicatorTable(this.paneIndex);
    }
    void 0 !== t?.options && this._table.setOptions(t.options), this._table.setRows(i2);
  }
  _syncTables(e) {
    if (!this._visible) {
      for (const { table: e2 } of this._tables.values()) e2.setRows([]);
      return;
    }
    const t = this._d.tables({ bars: e, values: this._values, settings: this._descriptorSettings() }), i2 = /* @__PURE__ */ new Set();
    for (const e2 of t) {
      if ("string" != typeof e2.id || "" === e2.id.trim() || i2.has(e2.id)) throw new Error("Indicator table IDs must be nonempty and unique");
      i2.add(e2.id);
    }
    for (const [e2, { table: t2 }] of this._tables) i2.has(e2) || (this._host.removeIndicatorTable(t2), this._tables.delete(e2));
    for (const e2 of t) {
      const t2 = true === e2.overlay;
      let i3 = this._tables.get(e2.id);
      void 0 !== i3 && i3.overlay !== t2 && (this._host.removeIndicatorTable(i3.table), this._tables.delete(e2.id), i3 = void 0), void 0 === i3 && (i3 = { table: this._host.addIndicatorTable(t2 ? this._pricePane() : this.paneIndex), overlay: t2 }, this._tables.set(e2.id, i3)), void 0 !== e2.options && i3.table.setOptions(e2.options), i3.table.setRows(e2.rows);
    }
  }
  _syncDraws(e) {
    if (void 0 === this._d.draws) return;
    const t = this._d.draws({ bars: e, values: this._values, settings: this._descriptorSettings() }), [i2, s2] = this._route(t);
    s2.size > 0 && new ar().setItems(t), null === this._draws && i2.length > 0 && void 0 !== this._host.addIndicatorPrimitive && (this._draws = new ar(), this._draws.setVisible(this._visible), this._host.addIndicatorPrimitive(this._draws, this.paneIndex), this._host.bindIndicatorPrimitiveScale?.(this._draws, this._localScale())), this._draws?.setItems(i2), this._syncRouted(this._drawLayers, s2, (e2, t2) => new ar(null === t2 ? (e3) => e3.readoutPriceScale : void 0), (e2, t2) => e2.setItems(t2));
  }
  _syncRouted(e, t, i2, s2) {
    let r2 = false;
    for (const [i3, s3] of e) t.has(i3) || (this._host.removeIndicatorPrimitive?.(s3), e.delete(i3));
    for (const [n2, o2] of t) {
      let t2 = e.get(n2);
      if (void 0 === t2) {
        const [s3, a] = this._drawTarget(n2), l2 = this._host.addIndicatorPrimitive && i2(o2, a);
        if (!l2) continue;
        r2 = true, e.set(n2, t2 = l2), t2.setVisible(this._visible), this._host.addIndicatorPrimitive(t2, s3), null !== a && this._host.bindIndicatorPrimitiveScale?.(t2, a);
      }
      s2(t2, o2);
    }
    this._restack(r2);
  }
  _restack(e) {
    if (e && this._constructed) {
      Xr = true;
      try {
        this._host.resourcesChanged?.();
      } finally {
        Xr = false;
      }
    }
  }
  _syncBackground(e) {
    if (void 0 === this._d.background) return;
    const t = this._d.background({ bars: e, values: this._values, settings: this._descriptorSettings() }), i2 = t.some((e2) => "object" == typeof e2 && null !== e2);
    if (i2) {
      for (const e2 of t) if (!Array.isArray(e2?.colors)) throw new Error("Indicator background must return colours or a list of columns");
    }
    const [s2, r2] = i2 ? this._route(t) : [[{ colors: t }], /* @__PURE__ */ new Map()];
    for (const e2 of [s2, ...r2.values()]) if (e2.length > 1) throw new Error("Indicator background allows one column per target");
    const n2 = s2[0]?.colors ?? [];
    null === this._background && n2.length > 0 && void 0 !== this._host.addIndicatorPrimitive && (this._background = new lr(), this._background.setVisible(this._visible), this._host.addIndicatorPrimitive(this._background, this.paneIndex)), this._background?.setColors(n2, e), this._syncRouted(this._bgLayers, r2, ([e2]) => e2.colors.length > 0 ? new lr() : null, (t2, [i3]) => t2.setColors(i3.colors, e));
  }
  _syncBarColors(e) {
    if (void 0 === this._d.barColors) return;
    const t = this._visible && !this._dependencyUnavailable ? this._d.barColors({ bars: e, values: this._values, settings: this._descriptorSettings() }) : null;
    this._publishedBarColors = t, this._host.setBarColors?.(t, this.id);
  }
  _syncAlerts(e, t, i2, s2, r2, n2) {
    const o2 = this._d.alerts, a = e.length;
    if (void 0 === o2 || !n2()) return;
    const l2 = this._alertTime, h2 = Ss(e, this._sampled);
    a > 0 && (this._alertTime = e[a - 1].time);
    let c2 = a;
    if (i2 && !r2) for (; c2 > 0 && e[c2 - 1].time > l2; ) c2--;
    else this._alertRead = a > 0 ? h2(a - 1) : -1 / 0;
    let d2, u2 = false;
    for (let i3 = c2; i3 < a; i3++) {
      if (h2(i3) <= this._alertRead) continue;
      this._alertRead = h2(i3);
      const s3 = xs(e, this._values, t, i3);
      for (const t2 of o2) if (void 0 === t2.frequency) {
        if (!n2()) return;
        try {
          const r3 = t2.when(s3);
          if (!n2()) return;
          if (!r3) continue;
          const o3 = "function" == typeof t2.message ? t2.message(s3) : t2.message ?? t2.title;
          if (!n2()) return;
          this._host.emit?.("indicator:alert", { indicatorId: this.indicatorId, instanceId: this.id, alertId: t2.id, title: t2.title, message: o3, time: e[i3].time, index: i3 });
        } catch (e2) {
          if (!n2()) return;
          u2 || (u2 = true, d2 = e2);
        }
      }
    }
    if (n2()) {
      try {
        this._alertPolicy.evaluate({ bars: e, values: this._values, settings: t, calculation: s2, tailOnly: i2, refresh: r2, current: n2, from: c2, sampled: this._sampled }, (e2) => {
          this._host.emit?.("indicator:alert", { ...e2, indicatorId: this.indicatorId, instanceId: this.id });
        });
      } catch (e2) {
        u2 || (u2 = true, d2 = e2);
      }
      if (u2 && n2()) throw d2;
    }
  }
  _calcContext(e, t, i2) {
    const s2 = e.length, r2 = () => this._host.now?.() ?? Date.now() / 1e3, n2 = this._host.interval?.(), o2 = this._host.timezone?.() ?? ct, a = s2 > 1 ? e[s2 - 1].time - e[s2 - 2].time : 0;
    let l2 = 0 === s2, h2 = 0 === s2 ? "empty" : "unknown";
    if (s2 > 0) {
      const t2 = e[s2 - 1].time;
      if (void 0 === n2) l2 = a <= 0 || r2() >= t2 + a, h2 = "clock";
      else {
        const e2 = Sr(n2)?.bucketing, i3 = "interval" === e2?.mode ? e2.seconds > 0 ? t2 + e2.seconds : null : void 0 === e2 ? null : Lr(e2, t2, o2);
        l2 = null !== i3 && r2() >= i3, null !== i3 && (h2 = "clock");
      }
    }
    s2 > 0 && void 0 !== i2?.confirmation && (l2 = "confirmed" === i2.confirmation, h2 = i2.confirmationSource ?? "provider");
    const c2 = null === this._sourceRevision || i2?.sourceId !== this._sourceId, d2 = void 0 !== i2 && i2.revision !== this._sourceRevision, u2 = void 0 === i2 ? this._live : !c2 && d2 && "live" === i2.provenance;
    return { ...void 0 === i2 ? {} : { execution: { sourceId: i2.sourceId, provenance: "replay" === i2.provenance ? "replay" : u2 ? "live" : "history", change: c2 ? "initial" : d2 ? i2.change : "refresh", revision: i2.revision, historyRevision: i2.historyRevision, confirmationSource: h2 } }, barState: { isNew: void 0 === i2 ? t : u2 && s2 > 0 && (void 0 === this._sourceLastTime || e[s2 - 1].time > this._sourceLastTime), isConfirmed: l2, isRealtime: u2, lastIndex: s2 - 1 }, symbol: this._host.symbol?.(), interval: n2, timezone: o2, now: r2, tickSize: this._host.tickSize?.(this._pricePane()) || void 0 };
  }
  _plotType(e) {
    const t = this._settings[as(e).type];
    return "string" == typeof t && "" !== t ? t : e.type;
  }
  _plotColor(e) {
    const t = this._settings[as(e).color];
    return "string" == typeof t ? t : "string" == typeof e.style?.color ? e.style.color : void 0;
  }
  _plotStyle(e) {
    const t = as(e), i2 = { ...e.style ?? {}, title: e.title, visible: this._visible && false !== e.style?.visible }, s2 = this._plotColor(e), r2 = (n2 = this._settings[t.opacity], o2 = 100, "number" == typeof n2 && Number.isFinite(n2) ? n2 : o2);
    var n2, o2;
    void 0 !== s2 && (i2.color = r2 >= 100 ? s2 : se(s2, r2 / 100));
    const a = this._settings[t.width];
    "number" == typeof a && a > 0 && (i2.lineWidth = a);
    const l2 = this._settings[t.lineStyle];
    return "string" == typeof l2 && (i2.lineStyle = l2), void 0 !== e.offset && 0 !== e.offset && (i2.barOffset = e.offset), i2;
  }
  _attach() {
    this._dataRetry = null;
    const e = this._d.attach?.({ dataContext: () => this._host.dataContext?.(), subscribeDataChanges: (e2) => this._host.subscribeDataChanges?.(e2) ?? (() => {
    }), signal: this._lifetime.signal, setDataStatus: (e2) => {
      this._lifecycleStatus = Object.freeze({ ...e2 }), this._publishStatus(this._lifecycleStatus);
    }, setDataRetry: (e2) => {
      this._removed || (this._dataRetry = e2);
    }, requestBars: (e2) => {
      const t = this._host.requestBars;
      return void 0 === t ? Promise.reject(new Error("openalgo-charts: this chart has no bars provider; call chart.setBarsProvider(...) to serve other instruments")) : vs((i2) => t.call(this._host, { ...e2, signal: i2 }), [e2.signal, this._lifetime.signal]);
    }, requestSnapshot: (e2) => vs((t) => {
      const i2 = this._host.requestSnapshot;
      if (!i2) throw new Error("Requested snapshots are unsupported by this host");
      return i2.call(this._host, { ...e2, signal: t });
    }, [e2.signal, this._lifetime.signal]), requestState: this._host.requestState ? () => this._host.requestState() : void 0, subscribeRequestChanges: this._host.subscribeRequestChanges ? (e2) => this._host.subscribeRequestChanges(e2) : void 0, settings: () => this._descriptorSettings(), bars: () => ("underlying" === this._barSource ? this._host.underlyingBars?.()?.bars : void 0) ?? this._host.sourceBars(), requestRecompute: () => {
      this._removed || (this._barCount = 0, this._requestRecompute(true));
    }, store: this._store, symbol: () => this._host.symbol?.(), interval: () => this._host.interval?.(), timezone: () => this._host.timezone?.() ?? ct, now: () => this._host.now?.() ?? Date.now() / 1e3, paneIndex: () => this.paneIndex, addPrimitive: (e2) => {
      this._attachedPrimitives.add(e2), this._host.addIndicatorPrimitive?.(e2, this.paneIndex), this._host.bindIndicatorPrimitiveScale?.(e2, this._localScale());
    }, removePrimitive: (e2) => {
      this._attachedPrimitives.delete(e2), this._host.removeIndicatorPrimitive?.(e2);
    }, emit: (e2, t) => {
      this._host.emit?.(e2, t);
    } });
    this._detach = "function" == typeof e ? e : null;
  }
  _publishStatus(e) {
    if (this._removed) return;
    const t = this._dataStatus;
    if (t?.state !== e.state || "error" === e.state && ("error" !== t.state || t.error !== e.error)) {
      this._dataStatus = Object.freeze({ ...e }), this._outputRevision++, this._outputHistoryRevision++, this._host.indicatorOutputChanged?.(this.id, true);
      for (const e2 of this._dataListeners) e2(this._dataStatus);
      this._host.emit?.("indicator:data-status", { id: this.id, indicatorId: this.indicatorId, status: this._dataStatus });
    }
  }
  dataStatus() {
    return this._dataStatus;
  }
  subscribeDataStatus(e) {
    return this._removed ? () => {
    } : (this._dataListeners.add(e), null !== this._dataStatus && e(this._dataStatus), () => {
      this._dataListeners.delete(e);
    });
  }
  retryData() {
    this._removed || this._dataRetry?.();
  }
  dependencyNode() {
    return { id: this.id, descriptor: this._d, settings: this._settings };
  }
  invalidateStudyOutput() {
    this._outputPending = true;
  }
  _validatedSettings(e) {
    const t = Ms(e);
    ns(this._d.inputs, t), js([{ id: this.id, descriptor: this._d, settings: t }]), this._host.validateIndicatorSettings?.(this.id, this._d, t);
    for (const e2 of this._d.inputs) "source" === e2.type && "object" == typeof t[e2.key] && null !== t[e2.key] && Object.freeze(t[e2.key]);
    return t;
  }
  studyOutput(e) {
    const t = this._d.plots.find((t2) => t2.key === e);
    if (t && !t.ohlc) return { generation: this._generation, revision: this._outputRevision, historyRevision: this._outputHistoryRevision, source: this._outputSource, values: this._values[e] ?? [], available: !this._removed && this._outputRevision > 0 && !this._outputPending && !this._calcFailed && !this._dependencyUnavailable && (null === this._lifecycleStatus || "ready" === this._lifecycleStatus.state) };
  }
  _studyBindings(e, t) {
    const i2 = js([this.dependencyNode()]).dependencies.get(this.id) ?? [], s2 = /* @__PURE__ */ new Map(), r2 = /* @__PURE__ */ new Map();
    let n2 = this._studySnapshots.size === i2.length;
    for (const { inputKey: o2, source: a } of i2) {
      const i3 = this._host.studyOutput?.(a);
      if (!i3?.available || i3.values.length !== e.length || void 0 !== t && (i3.source?.sourceId !== t.sourceId || i3.source.revision !== t.revision || i3.source.historyRevision !== t.historyRevision)) throw new Jr(`Study input ${o2} is unavailable: ${a.instanceId}/${a.plotKey}`);
      s2.set(o2, i3), r2.set(o2, Object.freeze(i3.values.slice()));
      const l2 = this._studySnapshots.get(o2);
      (!l2 || l2.generation !== i3.generation || l2.historyRevision !== i3.historyRevision || l2.revision > i3.revision) && (n2 = false);
    }
    return { snapshots: s2, canTail: n2, current: () => i2.every(({ inputKey: e2, source: t2 }) => {
      const i3 = s2.get(e2), r3 = this._host.studyOutput?.(t2);
      return true === r3?.available && i3.generation === r3.generation && i3.revision === r3.revision && i3.historyRevision === r3.historyRevision;
    }), resolve: (e2) => {
      const t2 = i2.find((t3) => t3.source.instanceId === e2.instanceId && t3.source.plotKey === e2.plotKey);
      if (!t2) throw new is("Study source must be declared by an opted-in input");
      return r2.get(t2.inputKey);
    } };
  }
  _requestRecompute(e) {
    this._host.indicatorRecompute ? this._host.indicatorRecompute(this.id, e, () => this.recompute(e)) : this.recompute(e);
  }
  _clearUnavailableOutput(e) {
    this._dependencyUnavailable = true, this._alertNeedsSeed = true, this._studySnapshots.clear();
    const t = /* @__PURE__ */ new Set([...Object.keys(this._values), ...this._d.plots.map((e2) => e2.key)]);
    this._values = Object.fromEntries([...t].map((t2) => [t2, new Array(e.length).fill(null)])), this._barCount = 0, this._outputHistoryRevision++;
    for (const e2 of this._series.values()) this._writes.clear(e2);
    for (const e2 of this._fills) e2.setPoints([]);
    this._markers?.setMarkers([]);
    for (const [e2] of this._markerLayers.values()) e2.setMarkers([]);
    this._table?.setRows([]);
    for (const { table: e2 } of this._tables.values()) e2.setRows([]);
    this._draws?.setItems([]);
    for (const e2 of this._drawLayers.values()) e2.setItems([]);
    for (const t2 of [this._background, ...this._bgLayers.values()]) t2?.setColors([], e);
    for (const e2 of this._levels) this._host.removeIndicatorLevel(e2);
    this._levels = [], this._publishedBarColors = null, this._host.setBarColors?.(null, this.id), this.updateLegendValues();
  }
  settings() {
    return Ms(this._settings);
  }
  _descriptorSettings() {
    const e = this._host.timezone?.() ?? ct;
    if (e === ct) return this._settings;
    const t = this._zoned;
    if (null !== t && t.zone === e && t.base === this._settings) return t.merged;
    const i2 = { ...this._settings, timezone: e };
    return this._zoned = { zone: e, base: this._settings, merged: i2 }, i2;
  }
  series(e) {
    return this._series.get(e);
  }
  values() {
    return this._host.flushIndicators?.(), this._values;
  }
  setSettings(e, t) {
    if (this._removed || !this._allows("configurable", t)) return false;
    this._settings = this._validatedSettings({ ...this._settings, ...Ms(e) }), this._outputPending = true, this._host.indicatorOutputChanged?.(this.id, true);
    for (const e2 of this._d.plots) {
      const t2 = this._plotType(e2);
      if (t2 !== this._plotTypes.get(e2.key)) {
        const i2 = this._series.get(e2.key);
        if (i2 && this._host.setIndicatorSeriesType?.(i2, t2)) {
          i2.applyOptions(this._plotStyle(e2)), this._plotTypes.set(e2.key, t2);
          continue;
        }
        this._series.get(e2.key)?.remove(), this._series.set(e2.key, this._host.addIndicatorSeries(t2, this._plotPane(e2), this._plotStyle(e2), this._plotScale(e2), e2.priceFormat)), this._plotTypes.set(e2.key, t2);
        continue;
      }
      this._series.get(e2.key)?.applyOptions(this._plotStyle(e2));
    }
    return this._legend?.setOptions({ params: this._paramSummary(), color: this._legendColor() }), this._applyRange(), this._values = {}, this._barCount = 0, this._requestRecompute(true), this._detach?.(), this._attach(), this._host.resourcesChanged?.(), this._host.emit?.("objects:change", {}), true;
  }
  recompute(e = false) {
    if (this._removed) return;
    const t = ++this._calculationEpoch, i2 = this._settings, s2 = this._host.sourceState?.(), r2 = this._host.sourceBars(), n2 = "underlying" === this._barSource ? this._host.underlyingBars?.() ?? null : null, o2 = n2?.bars ?? r2, a = n2?.sourceIndex ?? null;
    let l2;
    const h2 = () => {
      if (this._removed || t !== this._calculationEpoch || i2 !== this._settings) return false;
      if (l2 && !l2.current()) return false;
      const e2 = this._host.sourceState?.();
      return void 0 === s2 ? void 0 === e2 : void 0 !== e2 && s2.sourceId === e2.sourceId && s2.revision === e2.revision && s2.historyRevision === e2.historyRevision && s2.provenance === e2.provenance;
    };
    try {
      l2 = this._studyBindings(o2, s2), this._recompute(e, o2, null === a ? o2 : r2, a, s2, l2, h2);
    } catch (e2) {
      if (!h2()) return;
      if (!(this._constructed || e2 instanceof Jr || this._restored && e2 instanceof is)) throw e2;
      return e2 instanceof Jr && this._clearUnavailableOutput(null === a ? o2 : r2), this._calcFailed = true, this._publishStatus({ state: "error", error: e2 }), void this._host.indicatorOutputChanged?.(this.id, true);
    }
    h2() && (this._calcFailed && (this._calcFailed = false, this._publishStatus(this._lifecycleStatus ?? { state: "ready" })), h2() && this._host.indicatorOutputChanged?.(this.id, e));
  }
  _recompute(e, t, i2, s2, r2, n2, o2) {
    const a = i2.length, l2 = this._descriptorSettings();
    let h2 = null;
    const c2 = this._barCount > 0 && a >= this._barCount ? i2[this._barCount - 1].time : NaN, d2 = (c2 === this._lastTime || void 0 !== r2 && c2 > this._lastTime) && (1 === this._barCount || i2[0].time === this._firstTime), u2 = d2 && a > this._barCount, _3 = d2 && (void 0 === r2 || r2.sourceId === this._sourceId && r2.revision !== this._sourceRevision && r2.historyRevision === this._sourceHistoryRevision && "live" === r2.provenance);
    void 0 === r2 && _3 && (this._live = true), _3 && c2 > this._lastTime && this._redate(c2, t === i2);
    const p2 = this._calcContext(t, u2, r2);
    p2.resolveSource = n2.resolve, "chart" === this._barSource && null !== (this._host.underlyingBars?.() ?? null) && (p2.transformed = true);
    let f2 = false;
    if (_3 && a <= this._barCount + 1 && null === s2 && n2.canTail && void 0 !== this._d.calcTail) {
      const e2 = this._barCount - 1, i3 = this._d.calcTail(t, l2, e2, this._values, this._store, p2);
      null !== i3 && (h2 = function(e3, t2, i4, s3) {
        const r3 = {};
        if (Object.keys(e3).length !== Object.keys(t2).length) return null;
        for (const n3 of Object.keys(t2)) {
          const o3 = e3[n3], a2 = t2[n3];
          if (void 0 === o3 || void 0 === a2) return null;
          if (o3.length !== i4 + 1 || a2.length !== s3 - i4) return null;
          const l3 = new Array(s3);
          for (let e4 = 0; e4 < i4; e4++) l3[e4] = o3[e4] ?? null;
          for (let e4 = i4; e4 < s3; e4++) l3[e4] = a2[e4 - i4] ?? null;
          r3[n3] = l3;
        }
        return r3;
      }(this._values, i3, e2, a), f2 = true);
    }
    if (null === h2 && (h2 = this._d.calc(t, l2, this._store, p2)), o2()) {
      null !== s2 && (h2 = function(e2, t2) {
        const i3 = {};
        for (const s3 of Object.keys(e2)) {
          const r3 = e2[s3];
          i3[s3] = t2.map((e3) => r3[e3] ?? null);
        }
        return i3;
      }(h2, s2)), this._sampled = null === s2 ? null : { bars: t, sourceIndex: s2 }, this._values = h2, this._outputPending = false, this._dependencyUnavailable = false, this._studySnapshots = n2.snapshots, this._outputRevision++, f2 || this._outputHistoryRevision++, this._outputSource = r2 ? { ...r2 } : void 0, this._barCount = a, this._firstTime = a > 0 ? i2[0].time : 0, this._lastTime = a > 0 ? i2[a - 1].time : 0, void 0 !== r2 && (this._sourceId = r2.sourceId, this._sourceRevision = r2.revision, this._sourceHistoryRevision = r2.historyRevision, this._sourceLastTime = t[t.length - 1]?.time), this._writes.begin(i2);
      for (const e2 of this._d.plots) {
        const t2 = this._series.get(e2.key);
        void 0 !== t2 && (void 0 !== e2.ohlc ? this._writes.writeCandles(t2, e2, e2.ohlc, i2, h2, l2, this.indicatorId) : this._writes.writeValues(t2, e2, h2[e2.key], i2, h2, l2));
      }
      if (this._syncFills(i2), this._syncMarkers(i2), this._syncTable(i2), this._syncDraws(i2), this._syncBackground(i2), this._syncBarColors(i2), this._applyLevels(i2, l2), this._alertNeedsSeed) {
        this._alertNeedsSeed = false;
        const e2 = { ...p2, execution: p2.execution ? { ...p2.execution, provenance: "history" } : void 0 };
        this._syncAlerts(i2, l2, false, e2, false, o2);
      } else this._syncAlerts(i2, l2, _3, p2, e, o2);
      o2() && this.updateLegendValues(this._host.legendIndex?.());
    }
  }
  _redate(e, t) {
    this._alertTime === this._lastTime && (this._alertTime = e), t && (this._sourceLastTime = e, this._alertPolicy.redate(this._lastTime, e));
  }
  _applyLevels(e, t) {
    if (void 0 === this._d.levels) return;
    const i2 = { ...t, settings: t, bars: e, values: this._values }, s2 = this._visible ? this._d.levels(i2) : [];
    let r2 = "";
    for (const e2 of s2) r2 += `${e2.price}|${e2.color ?? ""}|${e2.title ?? ""}|${e2.dashed ?? ""}|${e2.lineWidth ?? ""}|${e2.lineStyle ?? ""};`;
    if (r2 === this._levelSig) return;
    this._levelSig = r2;
    for (const e2 of this._levels) this._host.removeIndicatorLevel(e2);
    this._levels = [];
    let n2 = 0;
    for (const e2 of s2) {
      const t2 = e2.lineStyle ?? (false === e2.dashed ? "solid" : "dashed");
      this._levels.push(this._host.addIndicatorLevel({ price: e2.price, color: e2.color ?? "#8892a6", dashed: "dashed" === t2, lineWidth: e2.lineWidth ?? 1, lineStyle: t2, label: e2.title ?? "", id: `${this.id}:level:${n2++}` }, this.paneIndex)), this._host.bindIndicatorPrimitiveScale?.(this._levels[this._levels.length - 1], this._localScale());
    }
  }
  _applyRange(e) {
    if (this._host.setIndicatorRange) {
      const t = this._d.plots.filter((e2) => true !== e2.overlay).flatMap((e2) => {
        const t2 = this._series.get(e2.key);
        return t2 ? [t2] : [];
      });
      return void this._host.setIndicatorRange(this.id, this.paneIndex, this._localScale(), void 0 === e ? this._d.range?.(this._descriptorSettings()) ?? null : e, t);
    }
    this._ownPane && this._host.setPaneRange(this.paneIndex, void 0 === e ? this._d.range?.(this._descriptorSettings()) ?? null : e);
  }
  remove(e) {
    if (this._removed || !this._allows("removable", e)) return false;
    this._removed = true, this._lifetime.abort(), this._dataRetry = null, this._dataListeners.clear();
    try {
      this._detach?.();
    } catch {
    }
    this._detach = null;
    for (const e2 of this._attachedPrimitives) this._host.removeIndicatorPrimitive?.(e2);
    this._attachedPrimitives.clear(), null !== this._legend && (this._host.removeIndicatorLegend(this._legend), this._legend = null);
    for (const e2 of this._levels) this._host.removeIndicatorLevel(e2);
    this._levels = [];
    for (const e2 of this._series.values()) e2.remove();
    this._series.clear();
    for (const e2 of this._fills) this._host.removeIndicatorFill(e2);
    this._fills.length = 0, null !== this._markers && (this._host.removeIndicatorMarkers(this._markers), this._markers = null);
    for (const [e2] of this._markerLayers.values()) this._host.removeIndicatorMarkers(e2);
    this._markerLayers.clear(), null !== this._table && (this._host.removeIndicatorTable(this._table), this._table = null);
    for (const { table: e2 } of this._tables.values()) this._host.removeIndicatorTable(e2);
    this._tables.clear(), null !== this._draws && (this._host.removeIndicatorPrimitive?.(this._draws), this._draws = null);
    for (const e2 of [...this._drawLayers.values(), ...this._bgLayers.values()]) this._host.removeIndicatorPrimitive?.(e2);
    return this._drawLayers.clear(), this._bgLayers.clear(), null !== this._background && (this._host.removeIndicatorPrimitive?.(this._background), this._background = null), this._host.setIndicatorRange?.(this.id, this.paneIndex, this._localScale(), null, []), void 0 !== this._d.barColors && this._host.setBarColors?.(null, this.id), this._ownPane && !this._host.setIndicatorRange && this._host.setPaneRange(this.paneIndex, null), this._host.indicatorRemoved?.(this.id, !this._constructed && this._ownPane ? this.paneIndex : void 0), true;
  }
};
var Qr = ["crossing", "crossingUp", "crossingDown", "greaterThan", "lessThan", "enteringRange", "leavingRange"];
function en(e, t, i2, s2, r2, n2 = s2, o2 = r2) {
  if (!Number.isFinite(i2)) return false;
  if ("greaterThan" === e) return i2 > s2;
  if ("lessThan" === e) return i2 < s2;
  if (void 0 === t || !Number.isFinite(t)) return false;
  const a = t <= n2 && i2 > s2, l2 = t >= n2 && i2 < s2;
  if ("crossing" === e) return a || l2;
  if ("crossingUp" === e) return a;
  if ("crossingDown" === e) return l2;
  const h2 = t >= n2 && t <= o2, c2 = i2 >= s2 && i2 <= r2;
  return "enteringRange" === e ? !h2 && c2 : h2 && !c2;
}
function tn(e, t, i2, s2, r2, n2, o2 = r2, a = n2) {
  if (![t, i2, s2].every(Number.isFinite)) return;
  const l2 = t <= o2 && s2 > r2, h2 = t >= o2 && i2 < r2;
  switch (e) {
    case "crossing":
      return l2 || h2 ? r2 : void 0;
    case "crossingUp":
      return l2 ? r2 : void 0;
    case "crossingDown":
      return h2 ? r2 : void 0;
    case "greaterThan":
      return s2 > r2 ? s2 : void 0;
    case "lessThan":
      return i2 < r2 ? i2 : void 0;
    case "enteringRange":
      return t < o2 && s2 >= r2 ? r2 : t > a && i2 <= n2 ? n2 : void 0;
    case "leavingRange":
      if (t < o2 || t > a) return;
      return i2 < r2 ? r2 : s2 > n2 ? n2 : void 0;
    case "matches":
      return;
  }
}
var sn = ["session", "adjustment", "currency", "unit"];
var rn = { session: ["regular", "extended"], adjustment: ["adjusted", "raw"] };
function nn(e) {
  if (null == e) return;
  const t = e;
  if ("object" != typeof e || Array.isArray(e) || Object.keys(t).some((e2) => !sn.includes(e2))) throw new TypeError("Invalid data variant");
  const i2 = {};
  for (const e2 of sn) {
    const s2 = t[e2], r2 = rn[e2];
    if (void 0 !== s2) {
      if (r2 ? !r2.includes(s2) : "string" != typeof s2 || !s2.trim() || s2.length > 32) throw new TypeError(`Invalid data ${e2}: ${String(s2)}`);
      i2[e2] = s2;
    }
  }
  return Object.keys(i2).length ? Object.freeze(i2) : void 0;
}
function on(e) {
  const t = nn(e);
  return t ? JSON.stringify(sn.map((e2) => t[e2] ?? null)) : "";
}
var hn = Symbol.for("openalgo-charts.data-context.passing");
var dn = (e) => "string" == typeof e && e.trim().length > 0;
function un(e) {
  if (!dn(e.id)) throw new Error("Alert id must be nonempty");
  const t = e.source;
  if (!t || !["price", "indicator", "barCondition", "drawing"].includes(t.kind)) throw new Error("Unknown alert source");
  if ("barCondition" === t.kind && !dn(t.id)) throw new Error("Invalid bar condition id");
  if (!("indicator" !== t.kind || dn(t.instanceId) && dn(t.plotKey))) throw new Error("Invalid indicator source");
  if (!("drawing" !== t.kind || dn(t.drawingId) && (void 0 === t.level || dn(t.level)) && (void 0 === t.input || t.input && dn(t.input.instanceId) && dn(t.input.plotKey)))) throw new Error("Invalid drawing source");
  if ("barCondition" === t.kind ? "matches" !== e.condition : !Qr.includes(e.condition)) throw new Error("Invalid source condition");
  if ("price" === t.kind || "indicator" === t.kind) {
    const i3 = "price" === t.kind ? t.price : t.value, s2 = "price" === t.kind ? t.upperPrice : t.upperValue;
    if (!Number.isFinite(i3) || void 0 !== s2 && !Number.isFinite(s2)) throw new Error("Alert bounds must be finite");
    if (("enteringRange" === e.condition || "leavingRange" === e.condition) && (void 0 === s2 || s2 < i3)) throw new Error("Alert range requires ordered finite bounds");
  }
  if ("onBarClose" !== e.policy && "onTouch" !== e.policy) throw new Error("Unknown alert policy");
  if ("once" !== e.repeat && "everyTime" !== e.repeat) throw new Error("Unknown alert repeat");
  if (!["armed", "triggered", "disabled", "expired"].includes(e.state)) throw new Error("Unknown alert state");
  if (!Number.isFinite(e.cooldownSeconds) || e.cooldownSeconds < 0) throw new Error("Invalid alert cooldown");
  if ("string" != typeof e.title || void 0 !== e.message && "string" != typeof e.message) throw new Error("Alert title and message must be text");
  const i2 = pn(e.scope);
  for (const e2 of ["symbol", "exchange", "interval"]) if (void 0 !== i2[e2] && "string" != typeof i2[e2]) throw new Error("Invalid alert scope");
  if (void 0 !== i2.variant) try {
    nn(pn(i2.variant));
  } catch {
    throw new Error("Invalid alert scope variant");
  }
  for (const t2 of ["expiresAt", "lastTriggeredAt", "lastTriggeredTime", "lastClosedTime", "lastTouchedTime"]) if (void 0 !== e[t2] && !Number.isFinite(e[t2])) throw new Error(`Invalid alert ${t2}`);
}
function _n(e) {
  return { ...e, source: "drawing" === e.source.kind ? { ...e.source, ...e.source.input ? { input: { ...e.source.input } } : {} } : { ...e.source }, scope: { ...e.scope, ...e.scope.variant ? { variant: { ...e.scope.variant } } : {} } };
}
function pn(e) {
  if (null === e || "object" != typeof e || Array.isArray(e) || ![Object.prototype, null].includes(Object.getPrototypeOf(e))) throw new Error("Alert document needs plain JSON records");
  for (const t of Reflect.ownKeys(e)) {
    const i2 = Object.getOwnPropertyDescriptor(e, t);
    if ("string" != typeof t || !("value" in i2) || !i2.enumerable) throw new Error("Alert document needs JSON data properties");
  }
  return e;
}
function fn(e) {
  if (!Array.isArray(e) || e.length > 1e5 || Reflect.ownKeys(e).length !== e.length + 1) throw new Error("Alert document array is not JSON data");
  return Array.from({ length: e.length }, (t, i2) => {
    const s2 = Object.getOwnPropertyDescriptor(e, String(i2));
    if (!s2 || !("value" in s2)) throw new Error("Alert document array needs JSON data values");
    return s2.value;
  });
}
function mn(e) {
  const t = /* @__PURE__ */ new Set();
  let i2 = 0, s2 = 0;
  const r2 = (e2, n2) => {
    if (++i2 > 1e5 || n2 > 32) throw new Error("Alert payload exceeds JSON limits");
    if (null === e2 || "boolean" == typeof e2) return e2;
    if ("string" == typeof e2) {
      if (s2 += e2.length, s2 > 5242880) throw new Error("Alert payload exceeds JSON size limit");
      return e2;
    }
    if ("number" == typeof e2 && Number.isFinite(e2)) return e2;
    if ("object" != typeof e2) throw new Error("Alert payload must be finite JSON data");
    if (t.has(e2)) throw new Error("Alert payload contains a cycle");
    let o2;
    if (t.add(e2), Array.isArray(e2)) o2 = fn(e2).map((e3) => r2(e3, n2 + 1));
    else {
      const t2 = pn(e2), i3 = {};
      for (const e3 of Object.keys(t2)) {
        if (s2 += e3.length, s2 > 5242880) throw new Error("Alert payload exceeds JSON size limit");
        Object.defineProperty(i3, e3, { value: r2(t2[e3], n2 + 1), enumerable: true, writable: true, configurable: true });
      }
      o2 = i3;
    }
    return t.delete(e2), o2;
  };
  return r2(e, 0);
}
function bn(e) {
  if ("string" == typeof e) {
    if (e.length > 5242880) throw new Error("Alert document exceeds JSON size limit");
    e = JSON.parse(e);
  }
  const t = Array.isArray(e) ? { version: 1, alerts: e } : pn(e);
  if (1 !== t.version || !Array.isArray(t.alerts) || t.alerts.length > 1e4) throw new Error("Unsupported alert document");
  const i2 = /* @__PURE__ */ new Set(), s2 = fn(t.alerts).map((e2) => {
    const t2 = pn(e2), s3 = pn(t2.source);
    void 0 !== s3.input && pn(s3.input);
    const r2 = (e3, i3) => void 0 === t2[e3] ? i3 : t2[e3], n2 = pn(r2("scope", {})), o2 = { id: t2.id, source: { ...s3 }, condition: r2("condition", "barCondition" === s3.kind ? "matches" : "crossing"), policy: r2("policy", "onBarClose"), repeat: r2("repeat", "once"), state: r2("state", "armed"), title: r2("title", "Chart alert"), cooldownSeconds: r2("cooldownSeconds", 0), scope: mn(Object.fromEntries(Object.entries(n2).filter(([, e3]) => void 0 !== e3))) };
    for (const e3 of ["message", "expiresAt", "lastTriggeredAt", "lastTriggeredTime", "lastClosedTime", "lastTouchedTime"]) void 0 !== t2[e3] && Object.assign(o2, { [e3]: t2[e3] });
    if (un(o2), i2.has(o2.id)) throw new Error(`Duplicate alert id: ${o2.id}`);
    return i2.add(o2.id), o2.source = mn(Object.fromEntries(Object.entries(o2.source).filter(([, e3]) => void 0 !== e3))), void 0 !== t2.payload && (o2.payload = mn(t2.payload)), o2;
  });
  return { version: 1, alerts: s2 };
}
function gn(e, t) {
  if (void 0 !== e) for (const i2 of [...e]) try {
    i2(t);
  } catch (e2) {
    globalThis.reportError?.(e2);
  }
}
function vn(e, t) {
  return e.add(t), () => {
    e.delete(t);
  };
}
var yn = ["Mod", "Ctrl", "Meta", "Alt", "Shift"];
var wn = new Set(yn);
var xn = /* @__PURE__ */ new Set(["Shift", "Control", "Alt", "Meta", "OS", "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight", "OSLeft", "OSRight"]);
function Sn() {
  return "undefined" != typeof navigator && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent || "");
}
function Pn(e) {
  const t = e.split("+").map((e2) => e2.trim()).filter((e2) => e2.length > 0);
  if (0 === t.length) return null;
  const i2 = t[t.length - 1];
  if (!/^[A-Za-z0-9]+$/.test(i2) || wn.has(i2)) return null;
  const s2 = [];
  for (const e2 of t.slice(0, -1)) {
    if (!wn.has(e2)) return null;
    s2.includes(e2) || s2.push(e2);
  }
  return s2.sort((e2, t2) => yn.indexOf(e2) - yn.indexOf(t2)), { mods: s2, key: i2 };
}
function On(e) {
  const t = Pn(e);
  return null === t ? "" : [...t.mods, t.key].join("+");
}
function Tn(e, t = Sn()) {
  const i2 = e.code ?? e.key ?? "";
  if ("" === i2 || xn.has(i2)) return "";
  const s2 = [];
  return (t ? e.metaKey : e.ctrlKey) && s2.push("Mod"), t && e.ctrlKey && s2.push("Ctrl"), !t && e.metaKey && s2.push("Meta"), e.altKey && s2.push("Alt"), e.shiftKey && s2.push("Shift"), On([...s2, i2].join("+"));
}
var Cn = /* @__PURE__ */ new Set(["Mod+KeyW", "Mod+KeyT", "Mod+KeyN", "Mod+KeyQ", "Mod+KeyR", "Mod+KeyL", "Mod+Shift+KeyT", "Mod+Shift+KeyN", "Mod+Shift+KeyW"]);
function jn(e) {
  return Cn.has(On(e));
}
var An = [{ command: "panLeft", label: "Pan left", combos: ["ArrowLeft"] }, { command: "panRight", label: "Pan right", combos: ["ArrowRight"] }, { command: "panLeftFast", label: "Pan left (fast)", combos: ["Mod+ArrowLeft"] }, { command: "panRightFast", label: "Pan right (fast)", combos: ["Mod+ArrowRight"] }, { command: "panUp", label: "Pan up", combos: ["ArrowUp"] }, { command: "panDown", label: "Pan down", combos: ["ArrowDown"] }, { command: "zoomIn", label: "Zoom in", combos: ["Equal", "Shift+Equal", "NumpadAdd"] }, { command: "zoomOut", label: "Zoom out", combos: ["Minus", "NumpadSubtract"] }, { command: "resetScale", label: "Reset view", combos: ["Home", "Digit0"] }, { command: "fitContent", label: "Fit all bars", combos: ["Alt+KeyF"] }, { command: "screenshot", label: "Screenshot (PNG)", combos: ["Alt+Shift+KeyS"] }, { command: "toggleGridVert", label: "Toggle vertical grid", combos: ["Alt+KeyV"] }, { command: "toggleGridHorz", label: "Toggle horizontal grid", combos: ["Alt+KeyH"] }, { command: "toggleCrosshairMagnet", label: "Toggle crosshair magnet", combos: ["Alt+KeyM"] }];
var Ln = { panLeftFast: ["Alt+ArrowLeft"], panRightFast: ["Alt+ArrowRight"], screenshot: ["Mod+Shift+KeyS"] };
var Nn = new Set(An.map((e) => e.command));
var Rn = (e) => Array.isArray(e) ? e : [e];
var Fn = class {
  constructor(e = {}) {
    Object.defineProperty(this, "scope", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_isMac", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_persist", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_storageKey", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_preset", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_overrides", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "_disabled", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_custom", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_entries", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_reverse", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_listeners", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_changes", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), this.scope = e.scope ?? "hover", this._isMac = e.isMac ?? Sn(), this._persist = e.persist ?? false, this._storageKey = e.storageKey ?? "openalgo-charts:shortcuts", this._preset = e.preset ?? "default";
    const t = (e2) => {
      for (const [t2, i3] of Object.entries(e2 ?? {})) {
        if (null === i3) {
          this._disabled.add(t2);
          continue;
        }
        const e3 = Rn(i3).map(On).filter((e4) => "" !== e4 && !jn(e4));
        this._overrides[t2] = e3;
      }
    };
    t(e.overrides);
    for (const t2 of e.disabledCommands ?? []) this._disabled.add(t2);
    for (const t2 of e.customShortcuts ?? []) this._custom.set(t2.command, t2);
    const i2 = this._load();
    if (null !== i2) {
      void 0 !== i2.preset && (this._preset = i2.preset), t(i2.overrides);
      for (const e2 of i2.disabled ?? []) this._disabled.add(e2);
    }
    this._rebuild();
  }
  _presetCombos(e) {
    return "alt" === this._preset ? Ln[e] : void 0;
  }
  _effectiveCombos(e, t) {
    return this._disabled.has(e) ? [] : void 0 !== this._overrides[e] ? this._overrides[e] : this._presetCombos(e) ?? t;
  }
  _rebuild() {
    this._entries = /* @__PURE__ */ new Map();
    for (const e of An) this._entries.set(e.command, { command: e.command, label: e.label, combos: this._effectiveCombos(e.command, e.combos) });
    for (const e of this._custom.values()) this._entries.set(e.command, { command: e.command, label: e.label ?? e.command, combos: this._effectiveCombos(e.command, Rn(e.combos).map(On).filter((e2) => "" !== e2)) });
    this._reverse = /* @__PURE__ */ new Map();
    for (const e of this._entries.values()) for (const t of e.combos) this._reverse.has(t) || this._reverse.set(t, e.command);
  }
  resolve(e) {
    const t = Tn(e, this._isMac);
    return "" === t ? null : this._reverse.get(t) ?? null;
  }
  handleKey(e) {
    return this._reverse.get(On(e)) ?? null;
  }
  runCustom(e) {
    const t = this._custom.get(e);
    return void 0 !== t && (t.onTrigger(), this.emitTrigger(e), true);
  }
  emitTrigger(e, t = "") {
    const i2 = { command: e, combo: t, isCustom: this._custom.has(e) };
    gn(this._listeners, i2);
  }
  on(e) {
    return this._listeners.add(e), () => this._listeners.delete(e);
  }
  onChange(e) {
    return this._changes.add(e), () => {
      this._changes.delete(e);
    };
  }
  setBinding(e, t) {
    const i2 = Rn(t).map(On).filter((e2) => "" !== e2 && !jn(e2));
    return 0 !== i2.length && (this._overrides[e] = i2, this._disabled.delete(e), this._after(), true);
  }
  disable(e) {
    this._disabled.add(e), delete this._overrides[e], this._after();
  }
  resetBinding(e) {
    delete this._overrides[e], this._disabled.delete(e), this._after();
  }
  resetAll() {
    this._overrides = {}, this._disabled.clear(), this._after();
  }
  setPreset(e) {
    this._preset = e, this._after();
  }
  addCustom(e) {
    this._custom.set(e.command, e), this._after();
  }
  list() {
    return [...this._entries.values()].map((e) => ({ command: e.command, label: e.label, combos: e.combos, isCustom: this._custom.has(e.command), isDisabled: this._disabled.has(e.command) }));
  }
  state() {
    return { preset: this._preset, overrides: this._overrides, disabled: [...this._disabled] };
  }
  _after() {
    this._rebuild(), this._save();
    for (const e of [...this._changes]) e();
  }
  _save() {
    if (this._persist && "undefined" != typeof localStorage) try {
      localStorage.setItem(this._storageKey, JSON.stringify(this.state()));
    } catch {
    }
  }
  _load() {
    if (!this._persist || "undefined" == typeof localStorage) return null;
    try {
      const e = localStorage.getItem(this._storageKey);
      return null === e ? null : JSON.parse(e);
    } catch {
      return null;
    }
  }
  static shouldIgnore(e) {
    const t = e;
    if (null == t) return false;
    if (true === t.isContentEditable) return true;
    const i2 = (t.tagName ?? "").toUpperCase();
    return "INPUT" === i2 || "TEXTAREA" === i2 || "SELECT" === i2;
  }
};
function zn(e, t, i2, s2, r2, n2, o2, a) {
  if ("hidden" === t.priceAxisSide || !(t.priceAxisWidth > 0)) return;
  const l2 = t.dpr, h2 = 6 * l2, c2 = "left" === t.priceAxisSide;
  if (c2 || void 0 !== t.priceAxisOffset) {
    const d2 = t.priceAxisOffset ?? 0, u2 = Math.round(d2 * l2), _3 = Math.round((d2 + (c2 ? -t.priceAxisWidth : t.priceAxisWidth)) * l2), p2 = a || void 0 !== t.priceAxisOffset, f2 = (p2 ? Math.abs(_3 - u2) : Math.round(t.priceAxisWidth * l2)) - 1, m2 = t.plotHeight * l2;
    if (Number.isFinite(u2) && Number.isFinite(_3) && f2 > 0 && m2 >= o2) {
      e.save(), p2 && (e.beginPath(), e.rect(Math.min(u2, _3), 0, f2 + 1, m2), e.clip());
      const t2 = Math.min(h2, f2 / 4), a2 = e.measureText(s2).width, d3 = Math.min(f2, a2 + 2 * t2), b2 = c2 ? u2 - 1 - d3 : u2 + 1, g2 = Math.max(o2 / 2, Math.min(m2 - o2 / 2, i2));
      e.fillStyle = r2, e.fillRect(b2, g2 - o2 / 2, d3, o2), e.fillStyle = n2, e.font = `500 ${11 * l2 * (a2 > 0 ? Math.min(1, (d3 - 2 * t2) / a2) : 1)}px system-ui, sans-serif`, e.fillText(s2, b2 + t2, g2), e.restore(), e.font = `500 ${11 * l2}px system-ui, sans-serif`;
    }
  } else {
    const a2 = Math.round(t.plotWidth * l2);
    e.fillStyle = r2, e.fillRect(a2 + 1, i2 - o2 / 2, e.measureText(s2).width + 2 * h2, o2), e.fillStyle = n2, e.fillText(s2, a2 + 1 + h2, i2);
  }
}
var En = class {
  constructor(e) {
    Object.defineProperty(this, "_opts", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_ghostPrice", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_group", { enumerable: true, configurable: true, writable: true, value: null }), this._opts = e;
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null;
  }
  get price() {
    return this._opts.price;
  }
  setPrice(e) {
    this._opts.price = e, this._host?.requestUpdate();
  }
  setLeftLabel(e) {
    this._opts.leftLabel = e, this._host?.requestUpdate();
  }
  setOptions(e) {
    this._opts = { ...this._opts, ...e }, this._host?.requestUpdate();
  }
  setDragGhost(e) {
    this._ghostPrice = e, this._host?.requestUpdate();
  }
  options() {
    return this._opts;
  }
  zOrder() {
    return "normal";
  }
  autoscaleInfo() {
    return { min: this._opts.price, max: this._opts.price };
  }
  draw(e, t) {
    this._group = null;
    const i2 = Math.round(t.priceScale.priceToY(this._opts.price) * t.dpr) + 0.5, s2 = "left" === t.priceAxisSide ? i2 - 0.5 : i2;
    if (!Number.isFinite(i2) || s2 < 0 || s2 > t.plotHeight * t.dpr) return;
    const r2 = t.dpr, n2 = this._opts.lineWidth ?? 1, o2 = Math.round(t.plotWidth * r2), a = Math.max(0, Math.min(1, this._opts.extentFromRight ?? 1)), l2 = Math.round(t.plotWidth * (1 - a) * r2), h2 = this._opts.color, c2 = void 0 !== this._opts.cursor || true === this._opts.closeButton, d2 = t.dragId === this._opts.id, u2 = c2 && !d2 && (t.hoverId === this._opts.id || t.hoverId === `${this._opts.id}::close`), _3 = t.hoverId === `${this._opts.id}::close`;
    if (e.save(), null !== this._ghostPrice && d2) {
      const i3 = Math.round(t.priceScale.priceToY(this._ghostPrice) * r2) + 0.5;
      i3 >= 0 && i3 <= t.plotHeight * r2 && (e.strokeStyle = se(h2, 0.35), e.lineWidth = Math.max(1, Math.round(r2)), e.setLineDash([2 * r2, 3 * r2]), e.beginPath(), e.moveTo(l2, i3), e.lineTo(o2, i3), e.stroke(), e.setLineDash([]));
    }
    d2 && (e.strokeStyle = se(h2, 0.18), e.lineWidth = Math.max(5 * r2, Math.round(n2 * r2) + 4 * r2), e.beginPath(), e.moveTo(l2, i2), e.lineTo(o2, i2), e.stroke()), e.strokeStyle = u2 || d2 ? ne(h2, 0.1) : h2;
    const p2 = Math.max(1, Math.round(n2 * r2));
    e.lineWidth = u2 || d2 ? p2 + Math.round(r2) : p2, e.setLineDash(E(this._opts.lineStyle ?? (true === this._opts.dashed ? "dashed" : "solid"), r2)), e.beginPath(), e.moveTo(l2, i2), e.lineTo(o2, i2), e.stroke(), e.setLineDash([]), e.font = `500 ${11 * r2}px system-ui, sans-serif`, e.textBaseline = "middle", e.textAlign = "left";
    const f2 = 18 * r2, m2 = 6 * r2, b2 = 3 * r2;
    zn(e, t, i2, this._opts.label ?? t.priceScale.format(this._opts.price), d2 || u2 ? ne(h2, 0.12) : h2, ee(h2), f2, false);
    if (void 0 !== this._opts.badge || void 0 !== this._opts.qty || void 0 !== this._opts.leftLabel && "" !== this._opts.leftLabel || true === this._opts.closeButton) {
      const s3 = "transparent" === t.theme.background, n3 = s3 ? se(h2, 0.14) : t.theme.background, o3 = s3 ? t.theme.axisText : ee(t.theme.background), c3 = se(t.theme.axisText, u2 || d2 ? 0.75 : 0.5), p3 = [];
      void 0 !== this._opts.badge && p3.push({ text: this._opts.badge, fill: d2 ? ne(h2, 0.2) : u2 ? ne(h2, 0.12) : h2, textColor: ee(h2), border: ne(h2, -0.25) }), void 0 !== this._opts.qty && p3.push({ text: String(this._opts.qty), fill: n3, textColor: o3, border: c3 }), void 0 !== this._opts.leftLabel && "" !== this._opts.leftLabel && p3.push({ text: this._opts.leftLabel, fill: n3, textColor: o3, border: c3 }), true === this._opts.closeButton && p3.push({ close: true, fill: _3 ? h2 : n3, textColor: _3 ? ee(h2) : o3, border: _3 ? h2 : c3 }), this._group = function(e2, t2, i3, s4, r3) {
        const { height: n4, padX: o4, radius: a2, gap: l3, dpr: h3 } = r3, c4 = s4.map((t3) => true === t3.close ? 20 * h3 : e2.measureText(t3.text ?? "").width + 2 * o4), d3 = c4.reduce((e3, t3) => e3 + t3, 0) + l3 * Math.max(0, s4.length - 1);
        void 0 !== r3.backplate && (e2.beginPath(), oe(e2, t2, i3 - n4 / 2, d3, n4, a2), e2.fillStyle = r3.backplate, e2.fill());
        let u3 = Number.POSITIVE_INFINITY, _4 = t2;
        for (let t3 = 0; t3 < s4.length; t3++) {
          const r4 = s4[t3], d4 = c4[t3];
          if (e2.beginPath(), oe(e2, _4, i3 - n4 / 2, d4, n4, a2), e2.fillStyle = r4.fill, e2.fill(), void 0 !== r4.border && (e2.strokeStyle = r4.border, e2.lineWidth = Math.max(1, Math.round(h3)), e2.stroke()), true === r4.close) {
            u3 = _4, e2.strokeStyle = r4.textColor, e2.lineWidth = Math.max(1, Math.round(1.4 * h3));
            const t4 = _4 + d4 / 2, s5 = 3.5 * h3;
            e2.beginPath(), e2.moveTo(t4 - s5, i3 - s5), e2.lineTo(t4 + s5, i3 + s5), e2.moveTo(t4 + s5, i3 - s5), e2.lineTo(t4 - s5, i3 + s5), e2.stroke();
          } else e2.fillStyle = r4.textColor, e2.textAlign = "left", e2.textBaseline = "middle", e2.fillText(r4.text ?? "", _4 + o4, i3);
          _4 += d4 + l3;
        }
        return { x0: t2 / h3, x1: (_4 - l3) / h3, closeX0: u3 / h3 };
      }(e, l2 + (1 === a ? 6 * r2 : 0), i2, p3, { height: f2, padX: m2, radius: b2, gap: 2 * r2, backplate: s3 ? void 0 : t.theme.background, dpr: r2 });
    }
    e.restore();
  }
  hitTest(e, t, i2) {
    if (e < 0 || e > i2.plotWidth) return null;
    const s2 = i2.priceScale.priceToY(this._opts.price), r2 = Math.abs(t - s2), n2 = this._group;
    return null !== n2 && r2 <= 10 && e >= n2.x0 && e <= n2.x1 ? this._opts.closeButton && e >= n2.closeX0 ? { externalId: `${this._opts.id}::close`, zOrder: "normal", distance: r2, cursor: "pointer" } : { externalId: this._opts.id, zOrder: "normal", distance: r2, cursor: this._opts.cursor } : r2 > 4 ? null : { externalId: this._opts.id, zOrder: "normal", distance: r2, cursor: this._opts.cursor };
  }
};
var Bn = { long: "#2f6df6", short: "#ef5350", order: "#3b82f6", tp: "#26a69a", sl: "#ef5350", buy: "#26a69a", sell: "#ef5350" };
var $n = "::close";
function Dn(e, t) {
  const i2 = e.length;
  if (0 === i2) return;
  let s2 = 0, r2 = i2 - 1;
  for (; s2 < r2; ) {
    const i3 = s2 + r2 + 1 >> 1, n3 = e.indexToTime(i3);
    void 0 !== n3 && n3 <= t ? s2 = i3 : r2 = i3 - 1;
  }
  const n2 = e.indexToTime(s2);
  if (void 0 !== n2) {
    if (s2 + 1 < i2) {
      const i3 = e.indexToTime(s2 + 1);
      if (void 0 !== i3 && Math.abs(i3 - t) < Math.abs(n2 - t)) return s2 + 1;
    }
    return s2;
  }
}
function Wn(e, t, i2, s2, r2, n2) {
  const o2 = 5 * n2;
  e.fillStyle = r2, e.beginPath(), "buy" === s2 ? (e.moveTo(t, i2 - 1.5 * o2), e.lineTo(t - o2, i2), e.lineTo(t + o2, i2)) : (e.moveTo(t, i2 + 1.5 * o2), e.lineTo(t - o2, i2), e.lineTo(t + o2, i2)), e.closePath(), e.fill();
}
function qn(e, t, i2, s2, r2, n2) {
  const o2 = 9 * n2;
  e.fillStyle = s2, e.beginPath(), e.arc(t, i2, o2, 0, 2 * Math.PI), e.fill(), "" !== r2 && (e.fillStyle = ee(s2), e.font = `500 ${9 * n2}px system-ui, sans-serif`, e.textAlign = "center", e.textBaseline = "middle", e.fillText(r2, t, i2 + 0.5 * n2));
}
function Vn(e, t, i2, s2, r2, n2) {
  const o2 = String(s2);
  e.font = `500 ${9 * n2}px system-ui, sans-serif`;
  const a = e.measureText(o2).width + 10 * n2, l2 = 15 * n2;
  e.fillStyle = r2, e.beginPath(), oe(e, Math.round(t - a / 2), Math.round(i2 - l2 / 2), Math.round(a), Math.round(l2), 3 * n2), e.fill(), e.fillStyle = ee(r2), e.textAlign = "center", e.textBaseline = "middle", e.fillText(o2, t, i2 + 0.5 * n2);
}
var Hn = class {
  constructor(e) {
    Object.defineProperty(this, "_trades", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_colors", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), this._colors = e;
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null;
  }
  zOrder() {
    return "top";
  }
  autoscaleInfo() {
    return null;
  }
  setTrades(e) {
    this._trades = e, this._host?.requestUpdate();
  }
  setColors(e) {
    this._colors = e, this._host?.requestUpdate();
  }
  draw(e, t) {
    if (0 === this._trades.length) return;
    const i2 = t.dpr, s2 = /* @__PURE__ */ new Map();
    e.save();
    for (const r2 of this._trades) {
      const n2 = Dn(t.dataLayer, Math.floor(r2.timestamp / 1e3));
      if (void 0 === n2) continue;
      const o2 = Math.round(t.timeScale.indexToX(n2) * i2), a = r2.color ?? ("buy" === r2.side ? this._colors.buy : this._colors.sell), l2 = r2.variant ?? "chevron";
      if ("count" === l2) {
        const e2 = `${n2}:${r2.side}`;
        let t2 = s2.get(e2);
        void 0 === t2 && (t2 = { index: n2, sumPS: 0, sumS: 0, n: 0, color: a }, s2.set(e2, t2)), t2.sumPS += r2.price * r2.size, t2.sumS += r2.size, t2.n += 1;
        continue;
      }
      const h2 = Math.round(t.priceScale.priceToY(r2.price) * i2);
      "bubble" === l2 ? qn(e, o2, h2, a, r2.label ?? ("buy" === r2.side ? "B" : "S"), i2) : Wn(e, o2, h2, r2.side, a, i2);
    }
    for (const r2 of s2.values()) {
      const s3 = r2.sumS > 0 ? r2.sumPS / r2.sumS : 0;
      Vn(e, Math.round(t.timeScale.indexToX(r2.index) * i2), Math.round(t.priceScale.priceToY(s3) * i2), r2.n, r2.color, i2);
    }
    e.restore();
  }
};
var Gn = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_positions", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_orders", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_trades", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_listeners", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_dragPrev", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_colors", { enumerable: true, configurable: true, writable: true, value: { ...Bn } }), Object.defineProperty(this, "_markers", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_ticks", { enumerable: true, configurable: true, writable: true, value: void 0 }), this._host = e, this._ticks = e.tickSchedule?.() ?? null, e.subscribeClick((e2) => this._onClick(e2)), e.subscribeDrag((e2, t) => this._onDrag(e2, t), (e2, t) => this._onDragEnd(e2, t));
  }
  on(e, t) {
    let i2 = this._listeners.get(e);
    return void 0 === i2 && (i2 = /* @__PURE__ */ new Set(), this._listeners.set(e, i2)), i2.add(t), () => {
      this._listeners.get(e)?.delete(t);
    };
  }
  off(e, t) {
    this._listeners.get(e)?.delete(t);
  }
  _emit(e, t) {
    gn(this._listeners.get(e), t), this._host.emit?.(e, t);
  }
  setSettings(e) {
    void 0 !== e.longColor && (this._colors.long = e.longColor), void 0 !== e.shortColor && (this._colors.short = e.shortColor), void 0 !== e.orderColor && (this._colors.order = e.orderColor), void 0 !== e.tpColor && (this._colors.tp = e.tpColor), void 0 !== e.slColor && (this._colors.sl = e.slColor), void 0 !== e.buyColor && (this._colors.buy = e.buyColor), void 0 !== e.sellColor && (this._colors.sell = e.sellColor), this.setPositions(this.getPositions()), this.setOrders(this.getOrders()), this._markers?.setColors(this._colors);
  }
  getSettings() {
    return { ...this._colors };
  }
  setTickSchedule(e) {
    if (null != e && "function" != typeof e.round) throw new TypeError("chart.trading.setTickSchedule takes a schedule built with new TickSchedule(bands), or null");
    this._ticks = e ?? null;
  }
  setPositions(e) {
    this._sync(this._positions, e, "pos");
  }
  setOrders(e) {
    this._sync(this._orders, e, "ord");
  }
  setTrades(e) {
    this._trades.clear();
    for (const t of e) this._trades.set(t.id, t);
    this._renderTrades();
  }
  addTrade(e) {
    this._trades.set(e.id, e), this._renderTrades();
  }
  upsertOrder(e) {
    const t = this.getOrders().filter((t2) => t2.id !== e.id);
    t.push(e), this.setOrders(t);
  }
  removeOrder(e) {
    const t = this.getOrders().filter((t2) => t2.id !== e && t2.parentId !== e);
    this.setOrders(t);
  }
  syncState(e) {
    void 0 !== e.positions && this.setPositions(e.positions), void 0 !== e.orders && this.setOrders(e.orders), void 0 !== e.trades && this.setTrades(e.trades);
  }
  updatePositionPnl(e, ...t) {
    const i2 = this._positions.get(e);
    if (void 0 === i2) return;
    const [s2, r2] = "string" == typeof t[0] ? t : t.slice(1);
    "string" == typeof s2 && (i2.entity.pnlText = s2), "string" == typeof r2 && (i2.entity.pnlPercent = r2), i2.line.setLeftLabel(this._positionPill(i2.entity));
  }
  getPositions() {
    return [...this._positions.values()].map((e) => e.entity);
  }
  getOrders() {
    return [...this._orders.values()].map((e) => e.entity);
  }
  getTrades() {
    return [...this._trades.values()];
  }
  clear() {
    for (const e of this._positions.values()) this._host.removePrimitive(e.line);
    for (const e of this._orders.values()) this._host.removePrimitive(e.line);
    this._positions.clear(), this._orders.clear(), this._trades.clear(), null !== this._markers && (this._host.removePrimitive(this._markers), this._markers = null);
  }
  _renderTrades() {
    null === this._markers && (this._markers = new Hn(this._colors), this._host.addPrimitive(this._markers)), this._markers.setTrades(this.getTrades());
  }
  _sync(e, t, i2) {
    const s2 = /* @__PURE__ */ new Set();
    for (const r2 of t) {
      s2.add(r2.id);
      const t2 = "pos" === i2 ? this._positionOpts(r2) : this._orderOpts(r2), n2 = this._sig(t2), o2 = e.get(r2.id);
      if (void 0 !== o2 && o2.sig === n2) o2.entity = r2, o2.line.setPrice(t2.price), void 0 !== t2.leftLabel && o2.line.setLeftLabel(t2.leftLabel);
      else {
        void 0 !== o2 && this._host.removePrimitive(o2.line);
        const i3 = new En(t2);
        this._host.addPrimitive(i3), e.set(r2.id, { entity: r2, line: i3, sig: n2 });
      }
    }
    for (const [t2, i3] of e) s2.has(t2) || (this._host.removePrimitive(i3.line), e.delete(t2));
  }
  _sig(e) {
    return `${e.color}|${e.dashed}|${true === e.closeButton}|${e.cursor ?? ""}|${void 0 !== e.leftLabel}|${e.badge ?? ""}|${e.qty ?? ""}`;
  }
  _positionPill(e) {
    return void 0 === e.pnlText ? "" : `${e.pnlText}${void 0 !== e.pnlPercent ? ` (${e.pnlPercent})` : ""}`;
  }
  _positionOpts(e) {
    const t = "line-only" === e.variant;
    return { price: e.entryPrice, color: e.color ?? ("long" === e.side ? this._colors.long : this._colors.short), lineWidth: 2, dashed: false, id: `pos:${e.id}`, badge: t ? void 0 : e.side.toUpperCase(), qty: t ? void 0 : e.size, leftLabel: t ? void 0 : this._positionPill(e), closeButton: !t && true !== e.readOnly, extentFromRight: 0.3 };
  }
  _orderOpts(e) {
    const t = "line-only" === e.variant, i2 = !t && (e.draggable ?? true !== e.readOnly), s2 = e.color ?? ("tp" === e.bracketRole ? this._colors.tp : "sl" === e.bracketRole ? this._colors.sl : this._colors.order);
    return { price: e.price, color: s2, lineWidth: e.lineWidth ?? 1, dashed: "solid" !== (e.lineStyle ?? "solid"), id: `ord:${e.id}`, badge: t ? void 0 : (e.bracketRole ?? e.side).toUpperCase(), qty: t ? void 0 : e.size, leftLabel: t || void 0 !== e.bracketRole ? void 0 : e.type.replace("_", " ").toUpperCase(), closeButton: !t && true !== e.readOnly, extentFromRight: 0.3, cursor: i2 ? "ns-resize" : void 0 };
  }
  _onClick(e) {
    if (e.endsWith($n)) {
      const t = e.slice(0, -7);
      if (t.startsWith("ord:")) {
        const e2 = t.slice(4);
        this._orders.has(e2) && this._emit("trading:order_cancel", { orderId: e2 });
      } else if (t.startsWith("pos:")) {
        const e2 = t.slice(4);
        this._positions.has(e2) && this._emit("trading:position_close", { positionId: e2 });
      }
      return;
    }
    if (e.startsWith("ord:")) {
      const t = this._orders.get(e.slice(4));
      void 0 !== t && this._emit("trading:order_click", { order: t.entity });
    } else if (e.startsWith("pos:")) {
      const t = this._positions.get(e.slice(4));
      void 0 !== t && this._emit("trading:position_click", { position: t.entity });
    }
  }
  _onDrag(e, t) {
    if (!e.startsWith("ord:")) return;
    const i2 = this._ticks?.round(t) ?? t, s2 = this._orders.get(e.slice(4));
    if (void 0 === s2) return;
    const r2 = e.slice(4);
    this._dragPrev.has(r2) || (this._dragPrev.set(r2, s2.entity.price), s2.line.setDragGhost(s2.entity.price)), s2.line.setPrice(i2);
  }
  _onDragEnd(e, t) {
    if (!e.startsWith("ord:")) return;
    const i2 = this._ticks?.round(t) ?? t, s2 = e.slice(4), r2 = this._orders.get(s2);
    if (void 0 === r2) return;
    const n2 = this._dragPrev.get(s2) ?? r2.entity.price;
    this._dragPrev.delete(s2), r2.line.setDragGhost(null), r2.entity.price = i2, r2.line.setPrice(i2), void 0 !== r2.entity.bracketRole ? this._emit("trading:bracket_modify", { parentId: r2.entity.parentId, bracketRole: r2.entity.bracketRole, newPrice: i2 }) : this._emit("trading:order_modify", { orderId: s2, newPrice: i2, previousPrice: n2 });
  }
};
var Un = /* @__PURE__ */ new WeakMap();
var Kn = /* @__PURE__ */ new WeakMap();
function Yn(e) {
  Kn.set(e, {}), Un.get(e)?.();
}
function Jn(e, t, i2, s2) {
  if ("price" !== t && "time" !== t && "point" !== t) throw new TypeError("Invalid pick kind");
  const r2 = {};
  Kn.set(e, r2);
  let n2 = false, o2 = false;
  const a = [], l2 = (s3) => {
    if (n2) {
      n2 = false, Un.get(e) === h2 && Un.delete(e);
      try {
        e.emit("pick:end", { kind: t, value: s3 }), null === s3 || o2 || Kn.get(e) !== r2 || i2(s3);
      } finally {
        for (const e2 of a.splice(0)) e2();
      }
    }
  }, h2 = Object.assign(() => {
    o2 = true, l2(null);
  }, { active: () => n2 });
  for (const t2 of ["destroy", "state:restore:start", "data:context", "paneRemoved", "paneMoved"]) a.push(e.on(t2, h2));
  if (a.push(e.on("data:update", (e2) => {
    "reset" === e2?.kind && h2();
  })), Un.get(e)?.(), o2 || Kn.get(e) !== r2) {
    for (const e2 of a.splice(0)) e2();
    return h2;
  }
  n2 = true;
  const c2 = (t2) => {
    const i3 = e.dataLayer;
    return i3.indexToTime(Math.round(i3.timeToIndexFloat(t2))) ?? t2;
  };
  return a.push(e.on("click", (e2) => {
    if (!n2) return;
    const i3 = e2, r3 = s2 ? s2(e2) : "price" === t ? i3.price : "time" === t ? i3.time : { time: i3.time, price: i3.price };
    if (null === r3) return;
    if ("object" == typeof r3) {
      const e3 = Number.isFinite(r3.time) ? c2(r3.time) : NaN, { price: t2 } = r3;
      return void (Number.isFinite(e3) && null !== t2 && Number.isFinite(t2) && l2({ time: e3, price: t2 }));
    }
    const o3 = Number.isFinite(r3) && "time" === t ? c2(r3) : r3;
    Number.isFinite(o3) && l2(o3);
  })), Un.set(e, h2), e.emit("pick:start", { kind: t }), h2;
}
var Zn = { earnings: "#f0a020", dividend: "#26a69a", split: "#4f8cff", news: "#9aa0b4" };
function Qn(e) {
  return Array.isArray(e) ? e.map(Qn) : ss(e) ? Object.fromEntries(Object.entries(e).map(([e2, t]) => [e2, Qn(t)])) : e;
}
function eo(e) {
  return { ...e, ..."object" == typeof e.details ? { details: Qn(e.details) } : {} };
}
var to = class {
  constructor(e = {}) {
    Object.defineProperty(this, "_entries", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_groups", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_options", { enumerable: true, configurable: true, writable: true, value: { clustering: false, clusterRadius: 18 } }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_positions", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_hits", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_providedIds", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_duplicateIds", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_width", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_height", { enumerable: true, configurable: true, writable: true, value: 0 }), this.setOptions(e);
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null, this._invalidate();
  }
  zOrder() {
    return "normal";
  }
  setEvents(e) {
    const t = e.map((e2) => {
      if (!Number.isFinite(e2.time)) throw new Error("openalgo-charts: event time must be finite");
      return eo(e2);
    }).sort((e2, t2) => e2.time - t2.time), i2 = /* @__PURE__ */ new Map();
    this._entries = t.map((e2) => {
      const t2 = void 0 === e2.id ? JSON.stringify([e2.time, e2.type, e2.label, e2.group ?? null]) : JSON.stringify(e2.id), s2 = i2.get(t2) ?? 0;
      return i2.set(t2, s2 + 1), { event: e2, key: `${t2}:${s2}` };
    }), this._providedIds = new Set(t.flatMap((e2) => void 0 === e2.id ? [] : [e2.id])), this._duplicateIds = new Set([...this._providedIds].filter((e2) => (i2.get(JSON.stringify(e2)) ?? 0) > 1)), this._invalidate();
  }
  events() {
    return this._entries.map((e) => eo(e.event));
  }
  setGroups(e) {
    const t = /* @__PURE__ */ new Map();
    for (const i3 of e) {
      if (!i3.id || t.has(i3.id)) throw new Error("openalgo-charts: event group IDs must be nonempty and unique");
      t.set(i3.id, { ...i3 });
    }
    const i2 = /* @__PURE__ */ new Set();
    for (const e2 of t.keys()) {
      const s2 = /* @__PURE__ */ new Set();
      let r2 = e2;
      for (; void 0 !== r2 && !i2.has(r2); ) {
        if (s2.has(r2)) throw new Error("openalgo-charts: event group cycle");
        const e3 = t.get(r2);
        if (void 0 === e3) throw new Error("openalgo-charts: event group parent is missing");
        s2.add(r2), r2 = e3.parentId;
      }
      for (const e3 of s2) i2.add(e3);
    }
    this._groups = t, this._invalidate();
  }
  groups() {
    return Array.from(this._groups.values(), (e) => ({ ...e }));
  }
  setGroupVisible(e, t) {
    const i2 = this._groups.get(e);
    if (void 0 === i2) throw new Error(`openalgo-charts: unknown event group ${e}`);
    i2.visible = t, this._invalidate();
  }
  isGroupVisible(e) {
    let t = this._groups.get(e);
    for (; void 0 !== t; ) {
      if (false === t.visible) return false;
      t = void 0 === t.parentId ? void 0 : this._groups.get(t.parentId);
    }
    return true;
  }
  setOptions(e) {
    const t = e.clusterRadius ?? this._options.clusterRadius;
    if (!Number.isFinite(t) || t < 1 || t > 200) throw new Error("openalgo-charts: event clusterRadius must be from 1 to 200");
    this._options = { clustering: e.clustering ?? this._options.clustering, clusterRadius: t }, this._invalidate();
  }
  options() {
    return { ...this._options };
  }
  detailsForHit(e) {
    const t = this._hits.get(e);
    return void 0 === t ? null : { id: t.id, cluster: t.entries.length > 1, events: t.entries.map((e2) => eo(e2.event)) };
  }
  draw(e, t) {
    if (this._positions = [], this._hits.clear(), this._width = t.plotWidth, this._height = t.plotHeight, !(0 !== this._entries.length && t.dpr > 0 && Number.isFinite(t.dpr) && t.plotWidth > 0 && t.plotHeight > 0)) return;
    const i2 = [];
    for (const e2 of this._entries) {
      if (void 0 !== e2.event.group && !this.isGroupVisible(e2.event.group)) continue;
      const s3 = t.dataLayer.timeToIndexFloat(e2.event.time), r2 = t.timeScale.indexToX(s3);
      if (!Number.isFinite(r2)) continue;
      const n2 = i2[i2.length - 1];
      this._options.clustering && void 0 !== n2 && r2 - n2.firstX <= this._options.clusterRadius ? (n2.entries.push(e2), n2.x += (r2 - n2.x) / n2.entries.length) : i2.push({ x: r2, firstX: r2, entries: [e2] });
    }
    const s2 = t.plotHeight - 8 - 4;
    e.save(), e.beginPath(), e.rect(0, 0, t.plotWidth * t.dpr, t.plotHeight * t.dpr), e.clip(), e.textAlign = "center", e.textBaseline = "middle", e.font = 10 * t.dpr + "px system-ui, sans-serif";
    for (const r2 of i2) {
      if (r2.x + 8 < 0 || r2.x - 8 > t.plotWidth || s2 + 8 < 0) continue;
      const i3 = r2.entries[0].event, n2 = r2.entries.length > 1;
      let o2 = i3.id;
      if (n2 || void 0 === o2 || this._duplicateIds.has(o2)) for (o2 = `${n2 ? "event-cluster:" : "event:"}${JSON.stringify(r2.entries.map((e2) => e2.key).sort())}`; this._providedIds.has(o2); ) o2 = ":" + o2;
      e.fillStyle = i3.color ?? Zn[i3.type] ?? "#9aa0b4", e.beginPath(), e.arc(r2.x * t.dpr, s2 * t.dpr, 8 * t.dpr, 0, 2 * Math.PI), e.fill(), e.fillStyle = "#0d0e12";
      const a = n2 ? r2.entries.length > 99 ? "99+" : String(r2.entries.length) : i3.label.slice(0, 2);
      e.fillText(a, r2.x * t.dpr, s2 * t.dpr);
      const l2 = { id: o2, x: r2.x, y: s2, r: 8, entries: r2.entries };
      this._positions.push(l2), this._hits.set(o2, l2);
    }
    e.restore();
  }
  hitTest(e, t) {
    if (e < 0 || t < 0 || e > this._width || t > this._height) return null;
    let i2 = null;
    for (const s2 of this._positions) {
      const r2 = Math.hypot(s2.x - e, s2.y - t);
      r2 <= s2.r && (null === i2 || r2 <= i2.distance) && (i2 = { externalId: s2.id, zOrder: "normal", distance: r2, cursor: "pointer" });
    }
    return i2;
  }
  _invalidate() {
    this._positions = [], this._hits.clear(), this._host?.requestUpdate();
  }
};
var io = { zoomOut: "Zoom out", zoomIn: "Zoom in", resetScale: "Reset view", panLeftBar: "Move left", panRightBar: "Move right" };
var so = { id: "timenav", buttons: ["zoomOut", "zoomIn", null, "resetScale", null, "panLeftBar", "panRightBar"], size: 26, gap: 4, groupGap: 16, bottomMargin: 10, revealHeight: 64, fadeSeconds: 0.12, labels: io, hints: {}, showTooltip: true, font: 11, radius: 6, zOrder: "top" };
var ro = class {
  constructor(e = {}, t) {
    Object.defineProperty(this, "_opts", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_boxes", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_pointer", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_opacity", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_lastFrameMs", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_now", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_revealTop", { enumerable: true, configurable: true, writable: true, value: 1 / 0 }), this._opts = { ...so, ...e, labels: { ...so.labels, ...e.labels } }, this._now = t ?? (() => "undefined" != typeof performance ? performance.now() : 0);
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null;
  }
  zOrder() {
    return this._opts.zOrder ?? "top";
  }
  options() {
    return this._opts;
  }
  setOptions(e) {
    this._opts = { ...this._opts, ...e, labels: { ...this._opts.labels, ...e.labels } }, this._host?.requestUpdate();
  }
  setPointer(e) {
    const t = this._pointer;
    this._pointer = e, (null === t != (null === e) || this._opacity > 0 || this._targetOpacity() > 0) && this._host?.requestUpdate();
  }
  _revealed() {
    return null !== this._pointer && this._pointer.y >= this._revealTop;
  }
  _targetOpacity() {
    return this._revealed() ? 1 : 0;
  }
  animating() {
    return Math.abs(this._targetOpacity() - this._opacity) > 1e-3;
  }
  draw(e, t) {
    const i2 = this._opts, s2 = t.dpr;
    this._revealTop = Math.max(0, t.plotHeight - i2.revealHeight);
    const r2 = this._targetOpacity(), n2 = this._now(), o2 = null === this._lastFrameMs ? 0 : Math.max(0, (n2 - this._lastFrameMs) / 1e3);
    if (this._lastFrameMs = n2, i2.fadeSeconds <= 0 || o2 <= 0) i2.fadeSeconds <= 0 && (this._opacity = r2);
    else {
      const e2 = o2 / i2.fadeSeconds;
      this._opacity += Math.sign(r2 - this._opacity) * Math.min(e2, Math.abs(r2 - this._opacity));
    }
    if (this._opacity <= 1e-3) return this._boxes = [], void (this._opacity = 0);
    const a = i2.size;
    let l2 = 0;
    for (let e2 = 0; e2 < i2.buttons.length; e2++) {
      null !== i2.buttons[e2] ? (l2 += a, e2 < i2.buttons.length - 1 && null !== i2.buttons[e2 + 1] && (l2 += i2.gap)) : l2 += i2.groupGap;
    }
    const h2 = (t.plotWidth - l2) / 2, c2 = t.plotHeight - i2.bottomMargin - a;
    this._boxes = [];
    let d2 = h2;
    for (let e2 = 0; e2 < i2.buttons.length; e2++) {
      const t2 = i2.buttons[e2];
      null !== t2 ? (this._boxes.push({ action: t2, x: d2, y: c2, w: a, h: a }), d2 += a, e2 < i2.buttons.length - 1 && null !== i2.buttons[e2 + 1] && (d2 += i2.gap)) : d2 += i2.groupGap;
    }
    const u2 = this._hoveredAction();
    e.save(), e.globalAlpha = this._opacity;
    for (const i3 of this._boxes) this._button(e, i3, i3.action === u2, t, s2);
    i2.showTooltip && null !== u2 && this._tooltip(e, u2, t, s2), e.restore();
  }
  _hoveredAction() {
    const e = this._pointer;
    if (null === e) return null;
    for (const t of this._boxes) if (e.x >= t.x && e.x <= t.x + t.w && e.y >= t.y && e.y <= t.y + t.h) return t.action;
    return null;
  }
  _button(e, t, i2, s2, r2) {
    const n2 = this._opts, o2 = t.x * r2, a = t.y * r2, l2 = t.w * r2, h2 = t.h * r2, c2 = Math.min(n2.radius * r2, l2 / 2, h2 / 2);
    e.beginPath(), e.roundRect(o2, a, l2, h2, c2), e.fillStyle = no(s2.theme.background, s2.theme.axisText, i2 ? 0.28 : 0.12), e.fill(), e.strokeStyle = se(s2.theme.axisLine, i2 ? 1 : 0.8), e.lineWidth = Math.max(1, Math.round(r2)), e.stroke(), e.strokeStyle = s2.theme.axisText, e.fillStyle = s2.theme.axisText, e.lineWidth = Math.max(1, Math.round(1.5 * r2)), e.lineCap = "round", e.lineJoin = "round";
    const d2 = o2 + l2 / 2, u2 = a + h2 / 2, _3 = 0.22 * Math.min(l2, h2);
    switch (e.beginPath(), t.action) {
      case "zoomOut":
        e.moveTo(d2 - _3, u2), e.lineTo(d2 + _3, u2);
        break;
      case "zoomIn":
        e.moveTo(d2 - _3, u2), e.lineTo(d2 + _3, u2), e.moveTo(d2, u2 - _3), e.lineTo(d2, u2 + _3);
        break;
      case "resetScale": {
        const t2 = _3 * Math.SQRT1_2;
        e.arc(d2, u2, _3, 0.75 * -Math.PI, 0.75 * Math.PI), e.moveTo(d2 - t2, u2 - 2 * t2), e.lineTo(d2 - t2, u2 - t2), e.lineTo(d2, u2 - t2);
        break;
      }
      case "panLeftBar":
        e.moveTo(d2 + 0.55 * _3, u2 - _3), e.lineTo(d2 - 0.5 * _3, u2), e.lineTo(d2 + 0.55 * _3, u2 + _3);
        break;
      case "panRightBar":
        e.moveTo(d2 - 0.55 * _3, u2 - _3), e.lineTo(d2 + 0.5 * _3, u2), e.lineTo(d2 - 0.55 * _3, u2 + _3);
    }
    e.stroke();
  }
  _tooltip(e, t, i2, s2) {
    const r2 = this._opts, n2 = this._boxes.find((e2) => e2.action === t);
    if (void 0 === n2) return;
    const o2 = r2.labels[t] ?? io[t], a = r2.hints[t];
    e.font = r2.font * s2 + "px ui-sans-serif, system-ui, sans-serif", e.textBaseline = "middle", e.textAlign = "left";
    const l2 = 7 * s2, h2 = 8 * s2, c2 = e.measureText(o2).width, d2 = 2 * l2 + c2 + (void 0 === a ? 0 : e.measureText(a).width + h2 + 8 * s2), u2 = 22 * s2;
    let _3 = (n2.x + n2.w / 2) * s2 - d2 / 2;
    _3 = Math.max(2 * s2, Math.min(_3, i2.plotWidth * s2 - d2 - 2 * s2));
    const p2 = n2.y * s2 - u2 - 6 * s2;
    if (e.beginPath(), e.roundRect(_3, p2, d2, u2, 5 * s2), e.fillStyle = no(i2.theme.background, i2.theme.axisText, 0.22), e.fill(), e.strokeStyle = se(i2.theme.axisLine, 0.9), e.lineWidth = Math.max(1, Math.round(s2)), e.stroke(), e.fillStyle = i2.theme.axisText, e.fillText(o2, _3 + l2, p2 + u2 / 2), void 0 !== a) {
      const t2 = _3 + l2 + c2 + h2, r3 = e.measureText(a).width + 8 * s2;
      e.beginPath(), e.roundRect(t2 - 4 * s2, p2 + 4 * s2, r3, u2 - 8 * s2, 3 * s2), e.fillStyle = no(i2.theme.background, i2.theme.axisText, 0.42), e.fill(), e.fillStyle = i2.theme.axisText, e.fillText(a, t2, p2 + u2 / 2);
    }
  }
  hitTest(e, t) {
    if (this._opacity < 0.5) return null;
    for (const i2 of this._boxes) if (e >= i2.x && e <= i2.x + i2.w && t >= i2.y && t <= i2.y + i2.h) return { externalId: `${this._opts.id}::${i2.action}`, zOrder: "top", distance: 0, cursor: "pointer" };
    return null;
  }
};
function no(e, t, i2) {
  const s2 = Q(e), r2 = Q(t);
  if (null === s2 || null === r2) return e;
  const n2 = i2 < 0 ? 0 : i2 > 1 ? 1 : i2, o2 = (e2, t2) => Math.round(e2 + (t2 - e2) * n2);
  return `rgb(${o2(s2.r, r2.r)},${o2(s2.g, r2.g)},${o2(s2.b, r2.b)})`;
}
function oo(e) {
  return void 0 === e ? { x: 7, y: 4 } : "number" == typeof e ? { x: e, y: e } : { x: e.x, y: e.y };
}
function ao(e, t, i2, s2, r2, n2) {
  const o2 = r2 - t - i2, a = n2 - t - s2;
  switch (e) {
    case "top-left":
      return { x: t, y: t, w: i2, h: s2 };
    case "top-right":
      return { x: o2, y: t, w: i2, h: s2 };
    case "bottom-left":
      return { x: t, y: a, w: i2, h: s2 };
    case "center":
      return { x: (r2 - i2) / 2, y: (n2 - s2) / 2, w: i2, h: s2 };
    default:
      return { x: o2, y: a, w: i2, h: s2 };
  }
}
var lo = class {
  constructor(e = {}) {
    Object.defineProperty(this, "_opts", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_reveal", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_lastFrameMs", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_labelW", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_now", { enumerable: true, configurable: true, writable: true, value: "undefined" != typeof performance ? () => performance.now() : () => 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_img", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_ready", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_autoHeight", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_tintCanvas", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_tintKey", { enumerable: true, configurable: true, writable: true, value: "" }), this._autoHeight = void 0 === e.height, this._opts = { position: e.position ?? "bottom-right", margin: e.margin ?? 12, height: e.height ?? 28, opacity: e.opacity ?? 0.7, zOrder: e.zOrder ?? "top", src: e.src, image: e.image, tint: e.tint, label: e.label, id: e.id ?? "watermark", revealSeconds: e.revealSeconds ?? 0.18, labelColor: e.labelColor, fontSize: e.fontSize ?? 12, background: e.background, borderColor: e.borderColor, radius: e.radius ?? 6, padding: oo(e.padding), href: e.href, utmMedium: e.utmMedium ?? "oac-link", utmCampaign: e.utmCampaign ?? "oac-chart" }, e.image && (this._img = e.image, this._ready = true);
  }
  attached(e) {
    if (this._host = e, !this._ready && this._opts.src && "undefined" != typeof Image) {
      const e2 = new Image();
      e2.onload = () => {
        this._img = e2, this._ready = true, this._host?.requestUpdate();
      }, e2.decoding = "async", e2.src = this._opts.src;
    }
  }
  detached() {
    this._host = null;
  }
  zOrder() {
    return this._opts.zOrder;
  }
  autoscaleInfo() {
    return null;
  }
  setOptions(e) {
    const { padding: t, ...i2 } = e;
    this._opts = { ...this._opts, ...i2 }, void 0 !== t && (this._opts.padding = oo(t)), void 0 !== e.height && (this._autoHeight = false), void 0 === e.label && void 0 === e.fontSize || (this._labelW = 0), this._tintCanvas = null, e.image ? (this._img = e.image, this._ready = true) : void 0 !== e.src && (this._ready = false, this._img = null, this.attached(this._host)), this._host?.requestUpdate();
  }
  _rect(e) {
    if (!(this._builtin() || this._ready && null !== this._img)) return null;
    const t = this._img?.naturalWidth ?? this._img?.width ?? 1, i2 = this._img?.naturalHeight ?? this._img?.height ?? 1;
    if (!t || !i2) return null;
    const s2 = this._opts, r2 = Math.max(0, s2.margin, s2.padding.x, s2.padding.y), n2 = e.plotWidth - 2 * r2, o2 = e.plotHeight - 2 * r2;
    if (n2 <= 0 || o2 <= 0) return null;
    const a = this._builtin() && this._autoHeight && e.plotWidth < 480 ? 24 : s2.height, l2 = Math.max(0, Math.min(a, o2, n2 * i2 / t));
    if (!Number.isFinite(l2) || l2 <= 0) return null;
    const h2 = l2 * (t / i2), c2 = Math.min(n2, h2 + this._labelW * this._reveal);
    return { ...ao(s2.position, r2, c2, l2, e.plotWidth, e.plotHeight), logoW: h2 };
  }
  _builtin() {
    return void 0 === this._opts.src && void 0 === this._opts.image;
  }
  href() {
    const e = this._opts.href;
    if (void 0 === e || e.includes("?")) return e;
    const t = "undefined" != typeof location ? location : void 0, i2 = [`utm_medium=${encodeURIComponent(this._opts.utmMedium)}`, `utm_campaign=${encodeURIComponent(this._opts.utmCampaign)}`];
    return t?.host && i2.push(`utm_source=${t.host}${t.pathname}`), `${e}${e.includes("?") ? "&" : "?"}${i2.join("&")}`;
  }
  hitTest(e, t, i2) {
    if (void 0 === this._opts.label && void 0 === this._opts.href) return null;
    const s2 = this._rect(i2);
    if (null === s2) return null;
    const r2 = Math.max(this._opts.padding.x, 4, (44 - s2.w) / 2), n2 = Math.max(this._opts.padding.y, 4, (44 - s2.h) / 2), o2 = Math.min(i2.plotWidth, s2.w + 2 * r2), a = Math.min(i2.plotHeight, s2.h + 2 * n2), l2 = Math.max(0, Math.min(i2.plotWidth - o2, s2.x - r2)), h2 = Math.max(0, Math.min(i2.plotHeight - a, s2.y - n2));
    return e >= l2 && e <= l2 + o2 && t >= h2 && t <= h2 + a ? { externalId: this._opts.id, zOrder: this._opts.zOrder, distance: 0, cursor: void 0 !== this._opts.href ? "pointer" : "default" } : null;
  }
  draw(e, t) {
    if (!(this._builtin() || this._ready && null !== this._img)) return;
    const i2 = this._opts, s2 = t.dpr;
    void 0 !== i2.label && 0 === this._labelW && (e.save(), e.font = `600 ${i2.fontSize * s2}px system-ui, sans-serif`, this._labelW = e.measureText(i2.label).width / s2 + 8, e.restore()), this._advanceReveal(t);
    const r2 = this._rect(t);
    if (null === r2) return;
    const n2 = Math.round(r2.x * s2), o2 = Math.round(r2.y * s2), a = Math.round(r2.logoW * s2), l2 = Math.round(r2.h * s2);
    e.save();
    const h2 = i2.padding, c2 = Math.round((r2.x - h2.x) * s2), d2 = Math.round((r2.y - h2.y) * s2), u2 = Math.round((r2.x + r2.w + h2.x) * s2) - c2, _3 = Math.round((r2.y + r2.h + h2.y) * s2) - d2, p2 = t.theme, f2 = i2.background ?? (p2 ? se(p2.background, 0.82) : "none"), m2 = i2.borderColor ?? p2?.axisLine ?? "none";
    "none" !== f2 && (e.beginPath(), oe(e, c2, d2, u2, _3, Math.round(i2.radius * s2)), e.fillStyle = f2, e.fill(), "none" !== m2 && (e.strokeStyle = m2, e.lineWidth = Math.max(1, Math.round(s2)), e.stroke())), e.globalAlpha = Math.max(0, Math.min(1, i2.opacity));
    const b2 = this._ink(t), g2 = void 0 !== i2.label ? b2 : i2.tint;
    if (this._builtin()) e.fillStyle = b2, function(e2, t2, i3, s3) {
      e2.save(), e2.translate(t2, i3), e2.scale(s3 / 397, s3 / 397), e2.translate(-315.1, -217.65), e2.beginPath(), e2.moveTo(367.5, 255.5), e2.bezierCurveTo(371.3, 251.3, 374.8, 247.3, 378.7, 242.8), e2.bezierCurveTo(398.1, 262.7, 416.4, 281.4, 435.2, 300.6), e2.bezierCurveTo(461.6, 273.7, 487.4, 247.4, 513.6, 220.6), e2.bezierCurveTo(540.7, 247.4, 566.9, 273.2, 592.9, 298.9), e2.bezierCurveTo(611.4, 280.3, 629.8, 262, 648.4, 243.3), e2.bezierCurveTo(654.6, 249.9, 660.3, 256.1, 665.9, 262.2), e2.bezierCurveTo(648.3, 280.2, 630.3, 298.7, 612.5, 316.9), e2.bezierCurveTo(645.6, 350.8, 679, 384.9, 712.1, 418.6), e2.bezierCurveTo(684.7, 446.7, 656.7, 475.5, 628.4, 504.5), e2.bezierCurveTo(647.5, 523.2, 667.4, 542.7, 686.8, 561.8), e2.bezierCurveTo(680.8, 568.3, 675, 574.7, 668.8, 581.5), e2.bezierCurveTo(648.3, 561.4, 628.3, 541.7, 608.1, 521.8), e2.bezierCurveTo(577.2, 551.9, 546.6, 581.7, 516, 611.7), e2.bezierCurveTo(488.3, 584.7, 461, 558, 433.6, 531.3), e2.bezierCurveTo(415.9, 548.5, 398.2, 565.6, 380.1, 583.1), e2.bezierCurveTo(374.3, 576.6, 368.7, 570.4, 363.5, 564.6), e2.bezierCurveTo(379.4, 548, 396.1, 530.5, 412.9, 512.9), e2.bezierCurveTo(380.7, 481.9, 348, 450.4, 315.1, 418.7), e2.bezierCurveTo(349.2, 385, 383, 351.6, 416.6, 318.3), e2.bezierCurveTo(398.1, 299.3, 379.8, 280.6, 360.9, 261.3), e2.bezierCurveTo(362.8, 259.7, 365, 257.7, 367.5, 255.5), e2.moveTo(540.5, 406), e2.bezierCurveTo(552, 417.1, 563.4, 428.1, 575, 439.2), e2.bezierCurveTo(588.1, 426.5, 601.7, 413.3, 615.9, 399.5), e2.bezierCurveTo(621.9, 406.1, 627.8, 412.6, 633.8, 419.2), e2.bezierCurveTo(620.3, 431.7, 606.4, 444.8, 592.9, 457.3), e2.bezierCurveTo(600, 464.3, 606.9, 471.2, 613.8, 478.1), e2.bezierCurveTo(633.5, 458.1, 653.4, 437.7, 673.2, 417.5), e2.bezierCurveTo(620.7, 365.5, 567.7, 313.2, 514.8, 260.8), e2.bezierCurveTo(494.6, 280.6, 474.6, 300.2, 454.3, 320), e2.bezierCurveTo(461.7, 327, 468.8, 333.8, 477.5, 342.1), e2.bezierCurveTo(489.4, 329.1, 501.6, 315.8, 514.3, 301.9), e2.bezierCurveTo(521, 308.7, 526.7, 314.6, 531.9, 319.9), e2.bezierCurveTo(519.2, 333.3, 506.8, 346.5, 494.7, 359.4), e2.bezierCurveTo(509.5, 374.4, 524.7, 390, 540.5, 406), e2.moveTo(575.3, 514.8), e2.bezierCurveTo(581.4, 508.6, 587.6, 502.3, 593.4, 496.4), e2.bezierCurveTo(586.7, 489.5, 580.1, 482.5, 573.2, 475.3), e2.bezierCurveTo(557.6, 490.1, 542.3, 504.7, 526.9, 519.3), e2.bezierCurveTo(520.9, 513.3, 515.2, 507.5, 509.4, 501.6), e2.bezierCurveTo(524.7, 487, 540, 472.3, 555.6, 457.4), e2.bezierCurveTo(528.5, 430.5, 501.6, 403.8, 474.5, 377), e2.bezierCurveTo(461.3, 389.6, 448, 402.3, 434.6, 415.2), e2.bezierCurveTo(455, 435.2, 475.1, 454.9, 494.9, 474.3), e2.bezierCurveTo(482.1, 487.6, 469.4, 500.8, 456.5, 514.1), e2.bezierCurveTo(476.3, 533.2, 496.5, 552.7, 516.8, 572.4), e2.bezierCurveTo(536.3, 553.1, 555.6, 534.2, 575.3, 514.8), e2.moveTo(413.2, 474.3), e2.bezierCurveTo(420.1, 481, 427, 487.7, 434.6, 495.1), e2.bezierCurveTo(441.3, 487.6, 447.8, 480.3, 453.9, 473.5), e2.bezierCurveTo(435.5, 454.7, 416.3, 435.1, 397.1, 415.5), e2.bezierCurveTo(416.9, 396.5, 436.7, 377.7, 456.9, 358.4), e2.bezierCurveTo(449.8, 351.8, 442.7, 345.3, 435.6, 338.7), e2.bezierCurveTo(409, 364.8, 381.8, 391.4, 354.7, 418), e2.bezierCurveTo(374.3, 436.9, 393.4, 455.4, 413.2, 474.3), e2.closePath(), e2.fill(), e2.restore();
    }(e, n2, o2, l2);
    else {
      const t2 = g2 ? this._tinted(e, a, l2, g2) : this._img;
      g2 && t2 ? e.drawImage(t2, n2, o2) : this._img && e.drawImage(this._img, n2, o2, a, l2);
    }
    if (void 0 !== i2.label && this._reveal > 1e-3) {
      const t2 = (r2.w - r2.logoW) * s2;
      e.beginPath(), e.rect(n2 + a, o2, t2, l2), e.clip(), e.globalAlpha = this._reveal, e.font = `600 ${Math.round(i2.fontSize * s2)}px system-ui, -apple-system, sans-serif`, e.textBaseline = "middle", e.textAlign = "left", e.fillStyle = b2, e.fillText(i2.label, Math.round(n2 + a + 6 * s2), Math.round(o2 + l2 / 2));
    }
    e.restore();
  }
  _ink(e) {
    const t = this._opts, i2 = e.theme;
    return t.labelColor ?? t.tint ?? i2?.axisText ?? "#9aa3b2";
  }
  _advanceReveal(e) {
    if (void 0 === this._opts.label) return;
    const t = e.hoverId === this._opts.id ? 1 : 0, i2 = this._now(), s2 = null === this._lastFrameMs ? 0 : Math.max(0, (i2 - this._lastFrameMs) / 1e3);
    this._lastFrameMs = i2;
    const r2 = this._opts.revealSeconds;
    if (r2 <= 0) this._reveal = t;
    else if (this._reveal !== t) {
      const e2 = s2 / r2;
      this._reveal += Math.sign(t - this._reveal) * Math.min(e2, Math.abs(t - this._reveal));
    }
    Math.abs(t - this._reveal) > 1e-3 ? this._host?.requestUpdate() : this._reveal = t;
  }
  _tinted(e, t, i2, s2) {
    const r2 = `${t}x${i2}:${s2}`;
    if (this._tintCanvas && this._tintKey === r2) return this._tintCanvas;
    const n2 = e.canvas, o2 = n2?.ownerDocument;
    let a = null;
    if (o2 && "function" == typeof o2.createElement && (a = o2.createElement("canvas")), !a) return null;
    a.width = t, a.height = i2;
    const l2 = a.getContext("2d");
    return l2 && null !== this._img ? (l2.clearRect(0, 0, t, i2), l2.drawImage(this._img, 0, 0, t, i2), l2.globalCompositeOperation = "source-in", l2.fillStyle = s2, l2.fillRect(0, 0, t, i2), this._tintCanvas = a, this._tintKey = r2, a) : null;
  }
};
function co(e) {
  if (!ss(e)) throw new Error("Invalid pane scale object");
  if (!rs(e)) throw new Error("Pane scale accessors are not supported");
  return e;
}
function uo(e, t, i2 = -Number.MAX_VALUE, s2 = Number.MAX_VALUE) {
  if ("number" != typeof e || !Number.isFinite(e) || e < i2 || e > s2) throw new Error(`Invalid ${t}`);
  return e;
}
function _o(e) {
  const t = co(e), i2 = uo(t.min, "scale range minimum");
  return { min: i2, max: uo(t.max, "scale range maximum", i2) };
}
function po(e, t) {
  const i2 = co(e), s2 = (e2, s3) => void 0 === i2[e2] && t ? s3 : i2[e2], r2 = s2("mode", "linear"), n2 = s2("inverted", false), o2 = s2("autoScale", true);
  if (!m.includes(r2) || "boolean" != typeof n2 || "boolean" != typeof o2) throw new Error("Invalid price scale mode or flags");
  const a = { marginTop: uo(s2("marginTop", 0.1), "top scale margin"), marginBottom: uo(s2("marginBottom", 0.1), "bottom scale margin"), minMove: uo(s2("minMove", 0), "scale tick", 0), mode: r2, inverted: n2, autoScale: o2 };
  if (void 0 !== i2.minPrecision && (a.minPrecision = uo(i2.minPrecision, "scale precision", 0, 100), !Number.isInteger(a.minPrecision))) throw new Error("Scale precision must be an integer");
  if (void 0 !== i2.range && (a.range = _o(i2.range)), void 0 !== i2.fixedRange && (a.fixedRange = null === i2.fixedRange ? null : _o(i2.fixedRange)), void 0 !== i2.indicatorRange) {
    const e2 = co(i2.indicatorRange);
    if ("string" != typeof e2.instanceId || !e2.instanceId.trim() || "boolean" != typeof e2.manual || !a.fixedRange) throw new Error("Invalid indicator range ownership");
    a.indicatorRange = { instanceId: e2.instanceId, manual: e2.manual };
  }
  if (void 0 !== i2.ratioLock) {
    const e2 = co(i2.ratioLock);
    if (o2 || !a.range) throw new Error("A scale ratio lock requires a manual range");
    a.ratioLock = { barSpacing: uo(e2.barSpacing, "ratio bar spacing", Number.MIN_VALUE), height: uo(e2.height, "ratio height", Number.MIN_VALUE) };
  }
  if (void 0 !== i2.placement) {
    const e2 = co(i2.placement);
    if (!Object.prototype.hasOwnProperty.call(e2, "side") || !Object.prototype.hasOwnProperty.call(e2, "order") || !["left", "right", "hidden"].includes(e2.side) || "number" != typeof e2.order || !Number.isSafeInteger(e2.order) || e2.order < 0) throw new Error("Invalid price axis placement side or order");
    a.placement = { side: e2.side, order: e2.order };
  }
  return a;
}
function fo(e, t = false) {
  const i2 = co(e), s2 = { weight: uo(i2.weight, "pane weight", Number.MIN_VALUE), priceScale: po(i2.priceScale, t) };
  if (void 0 !== i2.scales) {
    const e2 = co(i2.scales);
    s2.scales = {};
    for (const [t2, i3] of Object.entries(e2)) {
      if (!N(t2) || "right" === t2) throw new Error("Invalid secondary price scale id");
      s2.scales[t2] = po(i3, false);
    }
  }
  if (void 0 !== i2.collapsed) {
    if ("boolean" != typeof i2.collapsed) throw new Error("Invalid pane collapse flag");
    s2.collapsed = i2.collapsed;
  }
  return s2;
}
var mo = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_restoreGeneration", { enumerable: true, configurable: true, writable: true, value: 0 }), this._host = e;
  }
  getState() {
    const e = js(this._host._indicators.map((e2) => e2.dependencyNode())).dependencies, t = this._host._panes.map((e2) => {
      const t2 = e2.scaleStates();
      for (const [i4, s4] of this._host._indicatorRanges) {
        if (s4.pane !== e2) continue;
        const r4 = e2.scaleFor(s4.scaleId), n2 = this._host._ownedScaleRanges.get(r4), o2 = n2 ? r4.ownedFixedRangeState(n2) : null;
        o2 && t2[s4.scaleId] && !t2[s4.scaleId].indicatorRange && (t2[s4.scaleId].indicatorRange = { instanceId: i4, manual: o2.manual });
      }
      const { right: i3, ...s3 } = t2, r3 = { weight: e2.weight, priceScale: i3 };
      return Object.keys(s3).length && (r3.scales = s3), this._host._collapsed.has(e2) && (r3.collapsed = true), r3;
    }), i2 = [];
    this._host._panes.forEach((e2, t2) => {
      for (const s3 of e2.series()) {
        const e3 = Object.fromEntries(Object.entries(s3.style).filter(([, e4]) => void 0 !== e4)), r3 = this._host._series._transformOf(s3.dataId);
        i2.push({ type: s3.type, style: e3, paneIndex: t2, priceScaleId: s3.scaleId, ...void 0 === r3 ? {} : { transform: r3 } });
      }
    });
    const s2 = this._host._primaryIndex(), r2 = { version: s2 > 0 ? 2 : 1, timezone: this._host._timezone, viewport: { ...this._host.getVisibleLogicalRange() }, barSpacing: this._host._timeScale.barSpacing, navigation: this._host.navigationOptions(), grid: this._host.gridOptions(), canvas: this._host.canvasOptions(), statusLine: this._host.statusLineOptions(), watermark: this._host.watermarkOptions(), trading: { ...this._host._tradingSettings }, axisChrome: { sessionClock: this._host._axisChrome.sessionClock, barCountdown: this._host._axisChrome.barCountdown }, events: this._host.eventOptions(), crosshairMode: this._host._crosshairMode, crosshairSnapToBar: this._host._crosshairSnapToBar, priceOnlyAutoScale: this._host._priceOnlyAutoScale, indicatorLegendCollapsed: this._host._indicatorLegendCollapsed, panes: t, ...s2 > 0 ? { primaryPane: s2 } : {}, series: i2, indicators: this._host._indicators.map((t2) => ({ indicatorId: t2.indicatorId, instanceId: t2.id, settings: t2.settings(), paneIndex: t2.paneIndex, visible: t2.visible(), ...e.get(t2.id)?.length ? { studyInputs: e.get(t2.id).map((e2) => e2.inputKey) } : {}, ...null === t2.priceScaleId() ? {} : { priceScaleId: t2.priceScaleId() }, ...Object.keys(t2.plotPriceScaleIds()).length ? { plotPriceScaleIds: t2.plotPriceScaleIds() } : {}, ...Object.keys(t2.policy()).length ? { policy: { ...t2.policy() } } : {}, ..."underlying" === t2.barSource() ? { barSource: "underlying" } : {} })), ..."string" == typeof this._host._sourceAbove ? { sourceAbove: this._host._sourceAbove } : {} };
    return void 0 !== this._host._drawingState && (r2.drawings = this._host._drawingState), void 0 !== this._host._alertState && (r2.alerts = bn(this._host._alertState)), r2;
  }
  restoreState(e, t = {}) {
    const s2 = e;
    if (null === s2 || "object" != typeof s2 || "number" != typeof s2.version) return { applied: false, series: [], indicators: 0, reason: "not a chart state object" };
    if (s2.version > 2) return { applied: false, series: [], indicators: 0, reason: `state version ${s2.version} is newer than 2` };
    let r2, n2, o2, a;
    const l2 = /* @__PURE__ */ new Map(), h2 = /* @__PURE__ */ new Set();
    try {
      const e2 = Object.getOwnPropertyDescriptor(s2, "priceOnlyAutoScale");
      if (e2 && (!("value" in e2) || void 0 !== e2.value && "boolean" != typeof e2.value)) throw new Error("Invalid price-only autoscale preference");
      const i2 = Object.getOwnPropertyDescriptor(s2, "indicatorLegendCollapsed");
      if (i2 && (!("value" in i2) || void 0 !== i2.value && "boolean" != typeof i2.value)) throw new Error("Invalid indicator legend preference");
      const c3 = (e3) => ss(e3) && rs(e3);
      if (!c3(t)) throw new Error("Invalid chart restore options");
      if (void 0 !== t.preserveScaleFormats) {
        const e3 = t.preserveScaleFormats;
        if (!Array.isArray(e3)) throw new Error("Invalid preserved scale formats");
        const i3 = Object.getOwnPropertyDescriptors(e3);
        if (Reflect.ownKeys(i3).some((t2) => "length" !== t2 && ("string" != typeof t2 || !/^(0|[1-9]\d*)$/.test(t2) || Number(t2) >= e3.length || !("value" in i3[t2])))) throw new Error("Invalid preserved scale formats");
        for (let t2 = 0; t2 < e3.length; t2++) {
          const e4 = i3[t2]?.value;
          if (!c3(e4) || "number" != typeof e4.paneIndex || !Number.isInteger(e4.paneIndex) || e4.paneIndex < 0 || !N(e4.scaleId)) throw new Error("Invalid preserved scale selector");
          const s3 = this._host._panes[e4.paneIndex];
          if (!s3 || !Object.prototype.hasOwnProperty.call(s3.scaleStates(), e4.scaleId)) throw new Error("Preserved scale must already exist");
          const r3 = l2.get(s3) ?? /* @__PURE__ */ new Set();
          r3.add(e4.scaleId), l2.set(s3, r3);
        }
      }
      if (void 0 !== s2.panes) {
        if (!Array.isArray(s2.panes)) throw new Error("Invalid pane list");
        n2 = s2.panes.map((e3) => fo(e3, true));
      }
      const d3 = Object.getOwnPropertyDescriptor(s2, "primaryPane");
      if (d3 && (!("value" in d3) || void 0 !== d3.value)) {
        const e3 = d3.value;
        if ("number" != typeof e3 || !Number.isSafeInteger(e3) || e3 < 0 || !(e3 < (n2?.length ?? 0))) throw new Error("Invalid primary pane slot");
        if (s2.version < 2) throw new Error("A moved price pane needs chart version 2");
        if (e3 > 0 && !this._host._movablePrimaryPane) throw new Error("A moved price pane needs movablePrimaryPane");
        o2 = e3;
      }
      if (void 0 !== s2.alerts && (r2 = bn(s2.alerts)), void 0 !== s2.sourceAbove && ("string" != typeof s2.sourceAbove || !s2.sourceAbove.trim())) throw new Error("Invalid source placement");
      if (void 0 !== s2.indicators) {
        if (!Array.isArray(s2.indicators)) throw new Error("Invalid indicator list");
        for (const e4 of s2.indicators) {
          if ("plotPriceScaleIds" in e4) {
            const t3 = Object.getOwnPropertyDescriptor(e4, "plotPriceScaleIds");
            if (!t3?.enumerable || !("value" in t3)) throw new Error("Invalid indicator plot price scale map field");
          }
          if (void 0 !== e4.priceScaleId && !N(e4.priceScaleId)) throw new Error("Invalid indicator price scale");
          if (void 0 !== e4.barSource && _r(e4.barSource), void 0 !== e4.instanceId) {
            if ("string" != typeof e4.instanceId || !e4.instanceId.trim() || h2.has(e4.instanceId)) throw new Error("Invalid or duplicate indicator instance id");
            h2.add(e4.instanceId);
          }
        }
        this._host._reserveAlertStudyIds(r2, h2);
        const e3 = /* @__PURE__ */ new Set([...h2, ...this._host._indicatorReservedIds, ...this._host._indicators.map((e4) => e4.id)]), t2 = s2.indicators.map((e4) => ({ ...e4, settings: Ms(e4.settings ?? {}), ...void 0 === e4.policy ? {} : { policy: Ls(e4.policy) } }));
        for (const i4 of t2) for (const t3 of Object.values(i4.settings)) t3 && "object" == typeof t3 && "kind" in t3 && "indicator" === t3.kind && "instanceId" in t3 && "string" == typeof t3.instanceId && (e3.add(t3.instanceId), h2.add(t3.instanceId));
        let i3 = 0;
        for (const s3 of t2) {
          if (void 0 === s3.instanceId) {
            do {
              s3.instanceId = "restored-study-" + ++i3;
            } while (e3.has(s3.instanceId));
            e3.add(s3.instanceId);
          }
          h2.add(s3.instanceId);
        }
        const l3 = new Map(t2.filter((e4) => ps(e4.indicatorId)).map((e4) => [e4.instanceId, _s(e4.indicatorId)])), c4 = t2.flatMap((e4) => {
          const t3 = l3.get(e4.instanceId);
          return t3 && void 0 !== e4.plotPriceScaleIds && (e4.plotPriceScaleIds = Dr(t3, e4.plotPriceScaleIds)), t3 && (ns(t3.inputs, e4.settings), Hr(t3, e4.priceScaleId, e4.plotPriceScaleIds, e4.paneIndex, void 0 === n2 ? this._host._primaryIndex() : o2 ?? 0)), t3 ? [{ id: e4.instanceId, descriptor: t3, settings: e4.settings }] : [];
        });
        a = { specs: t2, order: js(c4).order, descriptors: l3 };
      }
    } catch (e2) {
      return { applied: false, series: [], indicators: 0, reason: e2 instanceof Error ? e2.message : "Invalid saved alerts or identities" };
    }
    this._host._reserveAlertStudyIds(r2, h2);
    for (const e2 of h2) this._host._indicatorReservedIds.add(e2);
    const c2 = ++this._restoreGeneration, d2 = this._host._priceOnlyAutoScale, u2 = this._host._indicatorLegendCollapsed;
    this._host._emit("state:restore:start", {});
    const _3 = this._host._timeScale.visibleRange();
    try {
      if (c2 !== this._restoreGeneration) return { applied: false, series: [], indicators: 0, reason: "superseded by a newer chart restore" };
      const e2 = this._host._withinLayoutChange(() => this._host._mutateTimeScale(() => this._restoreState(s2, r2, h2, n2, o2 ?? 0, a, l2)));
      return !e2.applied || c2 !== this._restoreGeneration || d2 === this._host._priceOnlyAutoScale && u2 === this._host._indicatorLegendCollapsed || this._host._emit("objects:change", {}), e2;
    } finally {
      l2.clear(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emitViewportIfMoved(_3), this._host._emit("state:restore:end", {});
    }
  }
  _restoreState(e, t, s2, r2, n2, o2, a) {
    if (r2) for (const e2 of this._host._panes) e2.clearRatioLocks();
    e.grid && this._host.setGridOptions(e.grid), e.canvas && this._host.setCanvasOptions(e.canvas), e.statusLine && this._host.setStatusLineOptions(e.statusLine), e.watermark && this._host.setWatermarkOptions(e.watermark), e.trading && this._host.setTradingSettings(e.trading), e.axisChrome && this._host.setAxisChromeOptions(e.axisChrome), e.navigation && "object" == typeof e.navigation && this._host._input._patchNavigation(e.navigation), e.events && this._host.setEventOptions(e.events), e.crosshairMode && (this._host._crosshairMode = e.crosshairMode), "boolean" == typeof e.crosshairSnapToBar && (this._host._crosshairSnapToBar = e.crosshairSnapToBar);
    const l2 = Object.getOwnPropertyDescriptor(e, "priceOnlyAutoScale");
    l2 && "boolean" == typeof l2.value && (this._host._priceOnlyAutoScale = l2.value);
    const h2 = Object.getOwnPropertyDescriptor(e, "indicatorLegendCollapsed");
    if (h2 && "boolean" == typeof h2.value && (this._host._indicatorLegendCollapsed = h2.value), this._host._legendStack._restackLegends(), "string" == typeof e.timezone && pt(e.timezone) && this._host.setTimezone(e.timezone), r2) {
      for (let e2 = 0; e2 < r2.length; e2++) this._host._layout._ensurePane(e2);
      this._host.setPrimaryPaneIndex(n2), r2.forEach((e2, t2) => {
        this._host._panes[t2].weight = e2.weight;
      });
    }
    (r2 || o2) && (this._host._panes.forEach((e2, t2) => {
      e2 !== this._host._primaryPane && r2?.[t2]?.collapsed ? this._host._collapsed.add(e2) : this._host._collapsed.delete(e2);
    }), this._host._layout._relayout(), this._host._primitives._rehomeAnchored());
    let c2 = 0;
    if (o2) {
      this._host._indicatorRefreshes.clear();
      for (const e2 of this._host._indicators.splice(0)) e2.remove({ force: true });
      const t2 = new Map(o2.specs.map((e2) => [e2.instanceId, e2]));
      for (const e2 of o2.order) {
        const i3 = t2.get(e2), r3 = o2.descriptors.get(e2), n3 = new Zr(this._host._indicatorHost(a), r3, i3.settings, i3.paneIndex, i3.instanceId, s2, i3.priceScaleId, i3.plotPriceScaleIds, i3.policy, i3.barSource, true);
        s2.add(n3.id), this._host._indicators.push(n3), false === i3.visible && n3.setVisible(false), c2 += 1;
      }
      const i2 = new Map(o2.specs.map((e2, t3) => [e2.instanceId, t3]));
      this._host._indicators.sort((e2, t3) => i2.get(e2.id) - i2.get(t3.id)), this._host._sourceAbove = e.sourceAbove, this._host._studies._reorderIndicatorResources();
    }
    const d2 = [];
    r2 && r2.forEach((e2, t2) => {
      const i2 = this._host._panes[t2];
      if (void 0 === i2) return;
      const s3 = [["right", e2.priceScale], ...Object.entries(e2.scales ?? {})];
      i2.restoreAxisPlacements(new Map(s3.flatMap(([e3, t3]) => t3.placement ? [[e3, t3.placement]] : [])));
      for (const [e3, t3] of s3) {
        const s4 = i2.scaleFor(e3), r3 = { marginTop: t3.marginTop, marginBottom: t3.marginBottom, minMove: t3.minMove, mode: t3.mode, inverted: t3.inverted };
        void 0 !== t3.minPrecision && (r3.minPrecision = t3.minPrecision), s4.setOptions("right" === e3 && void 0 === t3.minPrecision ? this._host._scales._scalePatchFor(i2, r3) : r3);
        const n3 = t3.indicatorRange ? this._host._indicatorRanges.get(t3.indicatorRange.instanceId) : void 0;
        n3 && n3.pane === i2 && n3.scaleId === e3 && t3.fixedRange?.min === n3.range.min && t3.fixedRange?.max === n3.range.max ? (s4.ownsFixedRange(n3.token) || (s4.setFixedRange(null), s4.setAutoScale(true), s4.setOwnedFixedRange(n3.token, n3.range), this._host._ownedScaleRanges.set(s4, n3.token)), s4.setAutoScale(true), t3.indicatorRange.manual && (s4.setAutoScale(false), t3.range && s4.setPriceRange(t3.range))) : (void 0 !== t3.fixedRange && s4.setFixedRange(t3.fixedRange), s4.setAutoScale(t3.autoScale), !t3.autoScale && t3.range && s4.setPriceRange(t3.range)), t3.ratioLock && d2.push({ pane: i2, id: e3, reference: t3.ratioLock });
      }
    }), this._host._drawingState = e.drawings, this._host._emit("drawings:restore", e.drawings ?? []);
    for (let e2 = this._host._panes.length - 1; e2 >= 0; e2--) {
      const t2 = this._host._panes[e2];
      !this._host._indicators.some((t3) => t3.paneIndex === e2) && this._host._layout._holdsOnlyFurniture(t2) && this._host.removePane(e2);
    }
    this._host._alertState = t, this._host._layout._recomputeAxisColumns(), void 0 !== e.barSpacing && this._host._timeScale.setBarSpacing(e.barSpacing), e.viewport && this._host._dataLayer.length > 0 && this._host.setVisibleLogicalRange(e.viewport);
    for (const { pane: e2, id: t2, reference: i2 } of d2) this._host._panes.includes(e2) && e2.setRatioLock(t2, true, i2.barSpacing, i2.height);
    return this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emit("alerts:restore", t ?? { version: 1, alerts: [] }), this._host._emit("objects:change", {}), { applied: true, series: e.series ?? [], indicators: c2 };
  }
};
var bo = /* @__PURE__ */ new WeakMap();
var go = /* @__PURE__ */ new WeakMap();
function vo(e) {
  return bo.get(e);
}
function xo(e, t) {
  let i2 = go.get(e);
  return i2 || (i2 = /* @__PURE__ */ new Set(), go.set(e, i2)), i2.add(t), () => {
    i2.delete(t), i2.size || go.delete(e);
  };
}
var So = { position: "bottom-right", margin: 8, cellWidth: 64, cellHeight: 18, fontSize: 11, borderWidth: 1 };
function Po(e, t, i2) {
  const s2 = Math.floor(0.62 * e);
  return 1 === t ? s2 : Math.max(0, Math.min(s2, Math.floor((e - 2 * Math.round(4 * i2)) / (1.2 * t))));
}
function Oo(e, t, i2, s2) {
  return Math.min(Math.round(e * i2), Po(t, s2, i2));
}
function ko(e, t) {
  return `${true === e.italic ? "italic " : ""}${true === e.bold ? "600 " : ""}${t}px ${e.fontFamily ?? "system-ui, sans-serif"}`;
}
function Io(e) {
  return e.text.split(/\r\n|\r|\n/);
}
function Mo(e, t) {
  let i2 = 0;
  for (const s2 of t) i2 = Math.max(i2, e.measureText(s2).width);
  return i2;
}
function To(e, t, i2, s2, r2, n2, o2) {
  const a = (e2) => Math.round(e2 * o2), l2 = Po(s2, i2.length, o2);
  let h2;
  if (void 0 === t.fontSize && "auto" === n2.fontSize) {
    const s3 = 1 === i2.length, n3 = s3 ? a(6) : Math.min(a(6), l2);
    h2 = s3 ? Math.max(n3, l2) : l2, e.font = ko(t, h2);
    const o3 = s3 ? Math.max(1, a(1)) : 1;
    for (; h2 > n3 && Mo(e, i2) > r2; ) h2 = s3 ? h2 - o3 : Math.max(n3, h2 - o3), e.font = ko(t, h2);
  } else h2 = Oo(t.fontSize ?? ("auto" === n2.fontSize ? 11 : n2.fontSize), s2, o2, i2.length);
  return h2;
}
var Co = 28;
function jo(e, t, i2, s2, r2, n2) {
  const [o2, a] = e.split("-");
  return { x: "left" === a ? t : "right" === a ? r2 - i2 - t : (r2 - i2) / 2, y: "top" === o2 ? t : "bottom" === o2 ? n2 - s2 - t : (n2 - s2) / 2 };
}
var Ao = 0;
var Lo = class {
  constructor(e = {}) {
    Object.defineProperty(this, "_rows", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_grid", { enumerable: true, configurable: true, writable: true, value: { cols: 0, cells: [] } }), Object.defineProperty(this, "_opts", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_rect", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_hitId", { enumerable: true, configurable: true, writable: true, value: "table-tooltip:" + ++Ao }), Object.defineProperty(this, "_revision", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_hits", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_size", { enumerable: true, configurable: true, writable: true, value: null }), this._opts = { ...So, ...e };
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null, this._clearHits();
  }
  zOrder() {
    return "top";
  }
  options() {
    return this._opts;
  }
  setOptions(e) {
    this._opts = { ...this._opts, ...e }, this._clearHits(), this._host?.requestUpdate();
  }
  setRows(e) {
    const t = function(e2) {
      let t2 = 0;
      for (const i3 of e2) t2 = Math.max(t2, i3.length);
      const i2 = /* @__PURE__ */ new Map(), s2 = [];
      for (let r2 = 0; r2 < e2.length; r2++) for (let n2 = 0; n2 < e2[r2].length; n2++) {
        const o2 = e2[r2][n2];
        if (void 0 !== o2.tooltip && "string" != typeof o2.tooltip) throw new TypeError("Table tooltip must be text");
        const a = void 0 === o2.rowSpan ? 1 : o2.rowSpan, l2 = void 0 === o2.colSpan ? 1 : o2.colSpan;
        if (!Number.isSafeInteger(a) || a < 1 || !Number.isSafeInteger(l2) || l2 < 1) throw new RangeError("Table spans must be positive safe integers");
        if (a > e2.length - r2 || l2 > t2 - n2) throw new RangeError("Table span exceeds the grid bounds");
        if (a > 1 || l2 > 1) for (let e3 = r2; e3 < r2 + a; e3++) {
          let t3 = i2.get(e3);
          if (void 0 === t3 && (t3 = [], i2.set(e3, t3)), t3.some((e4) => n2 < e4.to && e4.from < n2 + l2)) throw new RangeError("Table spans overlap");
          t3.push({ from: n2, to: n2 + l2 });
        }
        else if (i2.get(r2)?.some((e3) => e3.from <= n2 && n2 < e3.to)) continue;
        s2.push({ cell: o2, row: r2, col: n2, rowSpan: a, colSpan: l2 });
      }
      return { cols: t2, cells: s2 };
    }(e);
    this._rows = e, this._grid = t, this._clearHits(), this._host?.requestUpdate();
  }
  rows() {
    return this._rows;
  }
  _clearHits() {
    this._rect = null, this._hits = [], this._size = null, this._revision++;
  }
  _sameSize(e) {
    return this._size?.width === e.plotWidth && this._size.height === e.plotHeight && this._size.dpr === e.dpr;
  }
  draw(e, t) {
    this._sameSize(t) || this._clearHits(), this._size = { width: t.plotWidth, height: t.plotHeight, dpr: t.dpr }, this._rect = null, this._hits = [];
    const i2 = this._rows;
    if (0 === i2.length) return;
    const s2 = this._opts, r2 = t.dpr, { cols: n2, cells: o2 } = this._grid;
    if (0 === n2) return;
    const a = i2.map((e2, t2) => {
      const i3 = s2.rowWeights?.[t2];
      return "number" == typeof i3 && i3 > 0 ? i3 : 1;
    }), l2 = a.reduce((e2, t2) => e2 + t2, 0);
    let h2 = s2.cellHeight, c2 = h2 * l2;
    void 0 !== s2.heightPercent && s2.heightPercent > 0 && (c2 = t.plotHeight * s2.heightPercent / 100, h2 = c2 / l2);
    const d2 = [];
    for (let e2 = 0, t2 = 0; e2 < i2.length; e2++) d2.push(t2), t2 += h2 * a[e2];
    const u2 = a.map((e2) => Math.round(h2 * e2 * r2)), _3 = o2.map((e2) => 1 === e2.rowSpan ? u2[e2.row] : Math.round((d2[e2.row + e2.rowSpan] ?? c2) * r2) - Math.round(d2[e2.row] * r2));
    e.save();
    const p2 = function(e2, t2) {
      const i3 = [];
      let s3 = 0;
      for (let r3 = 0; r3 < t2; r3++) i3.push(s3), s3 += "number" == typeof e2 ? e2 : e2[r3] ?? e2[e2.length - 1] ?? 0;
      return { x: i3, total: s3 };
    }("auto" === s2.cellWidth ? function(e2, t2, i3, s3, r3, n3) {
      const o3 = Array(i3).fill(Co), a2 = ({ cell: t3 }, i4) => {
        if ("" === t3.text) return 0;
        const s4 = Io(t3), o4 = t3.fontSize ?? r3.fontSize, a3 = "auto" === o4 ? Math.round(11 * n3) : Oo(o4, i4, n3, s4.length);
        return a3 <= 0 ? 0 : (e2.font = ko(t3, a3), Mo(e2, s4) / n3 + 10);
      };
      for (let e3 = 0; e3 < t2.length; e3++) {
        const i4 = t2[e3];
        1 === i4.colSpan && (o3[i4.col] = Math.max(o3[i4.col], a2(i4, s3[e3])));
      }
      for (let e3 = 0; e3 < t2.length; e3++) {
        const i4 = t2[e3];
        if (1 === i4.colSpan) continue;
        let r4 = 0;
        for (let e4 = i4.col; e4 < i4.col + i4.colSpan; e4++) r4 += o3[e4];
        const n4 = Math.max(0, a2(i4, s3[e3]) - r4) / i4.colSpan;
        for (let e4 = i4.col; e4 < i4.col + i4.colSpan; e4++) o3[e4] += n4;
      }
      return o3;
    }(e, o2, n2, _3, s2, r2) : s2.cellWidth, n2);
    let f2 = p2.x, m2 = p2.total;
    if (void 0 !== s2.widthPercent && s2.widthPercent > 0 && m2 > 0) {
      const e2 = t.plotWidth * s2.widthPercent / 100, i3 = e2 / m2;
      f2 = f2.map((e3) => e3 * i3), m2 = e2;
    }
    const b2 = jo(s2.position, s2.margin, m2, c2, t.plotWidth, t.plotHeight);
    this._rect = { x: b2.x, y: b2.y, w: m2, h: c2 };
    const g2 = (e2) => Math.round(e2 * r2), v2 = g2(b2.x), y2 = g2(b2.y);
    void 0 !== s2.background && (e.fillStyle = s2.background, e.fillRect(v2, y2, g2(m2), g2(c2))), e.textBaseline = "middle";
    for (let i3 = 0; i3 < o2.length; i3++) {
      const { cell: n3, row: a2, col: l3, colSpan: h3 } = o2[i3], c3 = y2 + g2(d2[a2]), u3 = _3[i3], p3 = v2 + g2(f2[l3]), b3 = f2[l3 + h3] ?? m2, w2 = 1 === h3 ? g2(b3 - f2[l3]) : g2(b3) - g2(f2[l3]);
      if (n3.tooltip) {
        const e2 = Math.max(0, p3 / r2), i4 = Math.max(0, c3 / r2), s3 = Math.min(t.plotWidth, (p3 + w2) / r2), o3 = Math.min(t.plotHeight, (c3 + u3) / r2);
        s3 > e2 && o3 > i4 && this._hits.push({ x: e2, y: i4, w: s3 - e2, h: o3 - i4, key: `${this._hitId}:${this._revision}:${a2}:${l3}`, tooltip: n3.tooltip });
      }
      if (void 0 !== n3.bgColor && (e.fillStyle = n3.bgColor, e.fillRect(p3, c3, w2, u3)), void 0 !== s2.borderColor && s2.borderWidth > 0 && (e.strokeStyle = s2.borderColor, e.lineWidth = Math.max(1, g2(s2.borderWidth)), e.strokeRect(p3, c3, w2, u3)), "" === n3.text) continue;
      const x2 = g2(4);
      e.save(), e.beginPath(), e.rect(p3, c3, w2, u3), e.clip();
      const S2 = Io(n3), P2 = To(e, n3, S2, u3, w2 - 2 * x2, s2, r2);
      if (P2 <= 0) {
        e.restore();
        continue;
      }
      e.font = ko(n3, P2), e.fillStyle = n3.textColor ?? (void 0 !== n3.bgColor ? ee(n3.bgColor) : t.theme.axisText);
      const O2 = n3.align ?? "center";
      e.textAlign = O2;
      const k2 = "left" === O2 ? p3 + x2 : "right" === O2 ? p3 + w2 - x2 : p3 + w2 / 2, I2 = 1.2 * P2, M2 = S2.length * I2, T2 = Math.min(x2, Math.max(0, (u3 - M2) / 2)), C2 = "top" === n3.verticalAlign ? c3 + T2 + I2 / 2 : "bottom" === n3.verticalAlign ? c3 + u3 - T2 - M2 + I2 / 2 : c3 + u3 / 2 - (S2.length - 1) * I2 / 2;
      for (let t2 = 0; t2 < S2.length; t2++) e.fillText(S2[t2], k2, C2 + t2 * I2);
      e.restore();
    }
    void 0 !== s2.frameColor && (s2.frameWidth ?? 1) > 0 && (e.strokeStyle = s2.frameColor, e.lineWidth = Math.max(1, g2(s2.frameWidth ?? 1)), e.strokeRect(v2, y2, g2(m2), g2(c2))), this._drawTooltip(e, t), e.restore();
  }
  _drawTooltip(e, t) {
    if (t.hoverId !== (this._opts.id ?? this._hitId) || !t.hoverKey) return;
    const i2 = this._hits.find((e2) => e2.key === t.hoverKey), s2 = t.dpr, r2 = t.plotWidth * s2, n2 = t.plotHeight * s2;
    if (!i2 || r2 <= 10 * s2 || n2 <= 6 * s2) return;
    e.save(), e.font = 11 * s2 + "px system-ui, sans-serif", e.textAlign = "left", e.textBaseline = "middle";
    const o2 = 5 * s2, a = 3 * s2, l2 = 11 * s2 * 1.35, h2 = function(e2, t2, i3, s3) {
      const r3 = [];
      for (const n3 of t2.split(/\r\n|\r|\n/)) {
        const t3 = Array.from(n3);
        0 === t3.length && r3.push("");
        for (let n4 = 0; n4 < t3.length && r3.length < s3; ) {
          let s4 = 0, o3 = t3.length - n4;
          for (; s4 < o3; ) {
            const r4 = Math.ceil((s4 + o3) / 2);
            e2.measureText(t3.slice(n4, n4 + r4).join("")).width <= i3 ? s4 = r4 : o3 = r4 - 1;
          }
          let a2 = Math.max(1, s4);
          if (n4 + a2 < t3.length) {
            for (let e3 = a2 - 1; e3 > 0; e3--) if (/\s/.test(t3[n4 + e3])) {
              a2 = e3 + 1;
              break;
            }
          }
          r3.push(t3.slice(n4, n4 + a2).join("")), n4 += a2;
        }
        if (r3.length >= s3) break;
      }
      return r3;
    }(e, i2.tooltip, r2 - 2 * o2, Math.ceil((n2 - 2 * a) / l2)), c2 = Math.min(r2, Mo(e, h2) + 2 * o2), d2 = h2.length * l2 + 2 * a, u2 = Math.max(0, Math.min((i2.x + i2.w / 2) * s2 - c2 / 2, r2 - c2)), _3 = i2.y * s2 - 8 * s2 - d2, p2 = Math.max(0, Math.min(_3 >= 0 ? _3 : (i2.y + i2.h) * s2 + 8 * s2, n2 - d2));
    e.beginPath(), e.rect(0, 0, r2, n2), e.clip(), e.beginPath(), oe(e, u2, p2, c2, d2, Math.min(3 * s2, c2 / 2, d2 / 2)), e.fillStyle = t.theme.axisText, e.fill(), e.fillStyle = ee(t.theme.axisText);
    for (let t2 = 0; t2 < h2.length; t2++) e.fillText(h2[t2], u2 + o2, p2 + a + (t2 + 0.5) * l2);
    e.restore();
  }
  hitTest(e, t, i2) {
    if (void 0 !== i2 && !this._sameSize(i2)) return this._clearHits(), null;
    if (!Number.isFinite(e) || !Number.isFinite(t) || !this._size || e < 0 || t < 0 || e > this._size.width || t > this._size.height) return null;
    const s2 = this._rect;
    if (null === s2) return null;
    for (const i3 of this._hits) if (e >= i3.x && e < i3.x + i3.w && t >= i3.y && t < i3.y + i3.h) return { externalId: this._opts.id ?? this._hitId, hoverKey: i3.key, zOrder: "top", distance: 0, cursor: "default" };
    return void 0 === this._opts.id || e < s2.x || e > s2.x + s2.w || t < s2.y || t > s2.y + s2.h ? null : { externalId: this._opts.id, zOrder: "top", distance: 0, cursor: "default" };
  }
};
var No = ["#f5a623", "#26a69a", "#ab47bc", "#ef5350", "#26c6da", "#8bc34a", "#ff7043", "#5c6bc0"];
var Ro = class {
  constructor(e, t) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_chart", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_recomputing", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_indicatorWork", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_indicatorProcessed", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_barColorOwner", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_barColors", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_barColorBase", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_barColorAnchor", { enumerable: true, configurable: true, writable: true, value: 0 }), this._chart = e, this._host = t;
  }
  addIndicator(e, t, i2) {
    const s2 = i2.instanceId;
    if (void 0 !== s2 && ("string" != typeof s2 || !s2.trim())) throw new TypeError("Invalid indicator instance id");
    if (void 0 !== s2 && this._host._indicators.some((e2) => e2.id === s2)) throw new Error(`Indicator instance id already in use: ${s2}`);
    if (void 0 !== i2.priceScaleId && !N(i2.priceScaleId)) throw new TypeError("Invalid indicator price scale");
    const r2 = void 0 === i2.policy ? void 0 : Ls(i2.policy), n2 = void 0 === i2.barSource ? void 0 : _r(i2.barSource), o2 = _s(e), a = Ms(t);
    ns(o2.inputs, a);
    const l2 = void 0 === i2.plotPriceScaleIds ? void 0 : Dr(o2, i2.plotPriceScaleIds);
    Hr(o2, i2.priceScaleId, l2, i2.paneIndex ?? ("onchart" === o2.placement ? this._host._primaryIndex() : this._host._panes.length), this._host._primaryIndex()), this._flushIndicators();
    const h2 = this._host._series._sharedAxis(), c2 = /* @__PURE__ */ new Set([...this._host._indicatorReservedIds, ...this._host._indicators.map((e2) => e2.id)]);
    for (const e2 of js(this._host._indicators.map((e3) => e3.dependencyNode())).dependencies.values()) for (const t2 of e2) c2.add(t2.source.instanceId);
    const d2 = new Zr(this._indicatorHost(), o2, this._distinctColors(o2, a), i2.paneIndex, s2, c2, i2.priceScaleId, l2, r2, n2);
    return this._host._indicators.push(d2), this._invalidateStudies([d2.id], h2), this._host._legendStack._restackLegends(), this._host._indicatorReservedIds.add(d2.id), this._queueIndicatorDependents(d2.id, true), this._host._emit("objects:change", {}), d2;
  }
  _distinctColors(e, t) {
    const i2 = this._host._indicators.filter((t2) => t2.indicatorId === e.id).length;
    if (0 === i2) return t;
    const s2 = { ...t }, r2 = e.plots;
    for (let e2 = 0; e2 < r2.length; e2++) {
      const t2 = as(r2[e2]).color;
      void 0 === s2[t2] && (s2[t2] = No[(i2 * r2.length + e2) % No.length]);
    }
    return s2;
  }
  indicators() {
    return this._flushIndicators(), this._host._indicators;
  }
  moveIndicator(e, t, s2) {
    const r2 = this._host._indicators.find((t2) => t2.id === e);
    if (this._host.isDestroyed || !r2 || !this._host._policyAllows(r2, "movable", s2) || !Number.isInteger(t) || t < 0 || t > this._host._panes.length || r2.paneIndex === t || !r2.canRelocate(t)) return false;
    const n2 = r2.paneIndex, o2 = t === this._host._panes.length;
    this._host._layout._ensurePane(t);
    const a = this._host._panes[t], l2 = r2.renderResources();
    for (const { api: e2, overlay: t2 } of l2.series) {
      if (t2) continue;
      const i2 = this._host._seriesOwners.get(e2), s3 = this._host._seriesRecords.get(e2);
      if (!i2 || !s3 || i2.pane === a) continue;
      const r3 = i2.pane.scaleOf(s3).options;
      i2.pane.removeSeries(s3), a.addSeries(s3), i2.pane = a, o2 && 1 === a.series().filter((e3) => e3.scaleId === s3.scaleId).length && a.scaleOf(s3).setOptions(r3), this._host._series._applySeriesPriceFormat(a.scaleOf(s3), i2.priceFormat), void 0 !== s3.style.precision && this._host._series._applyPrecision(a.scaleOf(s3), s3.style.precision);
    }
    for (const { primitive: e2, overlay: t2 } of l2.primitives) t2 || this._host._panes.find((t3) => t3.hasPrimitive(e2))?.transferPrimitive(e2, a);
    r2.relocate(t), this._host._primitives._reanchorSource(), this._host._legendStack._syncLegendPanes(), this._host._emit("objects:change", {});
    const h2 = this._host._panes[n2];
    return this._host._layout._holdsOnlyFurniture(h2) && this._host.removePane(n2), this._reorderIndicatorResources(), this._host._layout._recomputeAxisColumns(), this._host._layout._relayout(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emit("objects:change", {}), true;
  }
  reorderIndicator(e, t, s2) {
    if (-1 !== t && 1 !== t) return false;
    const r2 = this._host._indicators.findIndex((t2) => t2.id === e);
    if (this._host.isDestroyed || r2 < 0 || !this._host._policyAllows(this._host._indicators[r2], "movable", s2)) return false;
    const n2 = this._host._indicators[r2].paneIndex;
    let o2 = r2 + t;
    for (; o2 >= 0 && o2 < this._host._indicators.length && this._host._indicators[o2].paneIndex !== n2; ) o2 += t;
    return !(o2 < 0 || o2 >= this._host._indicators.length) && ([this._host._indicators[r2], this._host._indicators[o2]] = [this._host._indicators[o2], this._host._indicators[r2]], this._reorderIndicatorResources(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emit("objects:change", {}), true);
  }
  _reorderIndicatorResources() {
    for (const e2 of this._host._indicators) e2.refreshBarColors();
    const e = this._host._indicators.map((e2) => e2.renderResources()), t = e.flatMap((e2) => e2.series.flatMap(({ api: e3 }) => {
      const t2 = this._host._seriesRecords.get(e3);
      return t2 ? [t2] : [];
    })), i2 = e.flatMap((e2) => e2.primitives.map((e3) => e3.primitive));
    for (const e2 of this._host._panes) e2.reorderSeries(t), e2.reorderPrimitives(i2);
    const s2 = this._host._indicators.flatMap((e2) => e2.legend() ? [e2.legend()] : []), r2 = new Set(s2);
    let n2 = 0;
    for (const e2 of this._host._legends) r2.has(e2.legend) && (e2.legend = s2[n2++]);
    this._host._primitives._placeSource(), this._host._legendStack._syncLegendPanes();
  }
  removeIndicator(e, t) {
    const i2 = this._host._indicators.find((t2) => t2.id === e);
    return void 0 !== i2 && i2.remove(t);
  }
  _forgetIndicator(e, t) {
    const i2 = this._host._indicators.findIndex((t2) => t2.id === e);
    if (i2 < 0) {
      const e2 = void 0 === t ? void 0 : this._host._panes[t];
      return void (void 0 !== t && void 0 !== e2 && this._host._layout._holdsOnlyFurniture(e2) && this._host.removePane(t));
    }
    const { indicatorId: s2, paneIndex: r2 } = this._host._indicators[i2];
    this._host._indicators.splice(i2, 1), this._host._primitives._reanchorSource(), this._host._legendStack._restackLegends(), this._host._indicatorReservedIds.add(e), this._host._indicatorRefreshes.delete(e), this._queueIndicatorDependents(e, true), this._host._emit("indicatorRemoved", { instanceId: e, indicatorId: s2, paneIndex: r2 });
    const n2 = this._host._panes[r2];
    void 0 !== n2 && n2 !== this._host._primaryPane && 0 === n2.series().length && this._host.removePane(r2);
  }
  _requestState() {
    return { source: this._host._seriesProvenance.get(this._host._firstDataId.value ?? -1)?.snapshot(), providerRevision: this._host._barsProviderRevision, dataRevision: this._host._requestedDataRevision, supportsSnapshots: this._host.hasSnapshotProvider(), supportsWarmup: "object" == typeof this._host._barsProvider && true === this._host._barsProvider?.supportsWarmup, replay: vo(this._chart) };
  }
  _indicatorHost(e) {
    return { assignIndicatorScale: (e2, t, i2, s2) => this._assignIndicatorScale(e2, t, i2, s2), bindIndicatorPrimitiveScale: (e2, t) => {
      const s2 = this._host._panes.find((t2) => t2.hasPrimitive(e2));
      s2?.bindPrimitiveScale(e2, t), this._host._layout._recomputeAxisColumns();
      const r2 = void 0 === s2 ? -1 : this._host._panes.indexOf(s2);
      this._host.invalidate((e3) => r2 < 0 ? e3.invalidateGlobal(i.Full) : e3.invalidatePane(r2, { level: i.Full, autoScale: true }));
    }, setIndicatorRange: (e2, t, i2, s2, r2) => {
      const n2 = this._host._indicatorRanges.get(e2), o2 = this._host._panes[t];
      s2 && o2 ? this._host._indicatorRanges.set(e2, { pane: o2, scaleId: i2, range: s2, series: r2, token: n2?.token ?? {} }) : this._host._indicatorRanges.delete(e2), this._reconcileIndicatorRanges();
    }, legendIndex: () => this._host._readoutIndex(), indicatorRemoved: (e2, t) => this._forgetIndicator(e2, t), flushIndicators: () => this._flushIndicators(), validateIndicatorSettings: (e2, t, i2) => {
      const s2 = this._host._indicators.filter((t2) => t2.id !== e2).map((e3) => e3.dependencyNode());
      s2.push({ id: e2, descriptor: t, settings: i2 }), js(s2);
    }, studyOutput: (e2) => this._host._indicators.find((t) => t.id === e2.instanceId)?.studyOutput(e2.plotKey), indicatorOutputChanged: (e2, t) => this._queueIndicatorDependents(e2, t), indicatorRecompute: (e2, t, i2) => {
      if (!this._host._indicators.some((t2) => t2.id === e2)) return void i2();
      if (this._recomputing) return i2(), this._indicatorWork?.delete(e2), void this._indicatorProcessed?.add(e2);
      this._host._indicatorRefreshes.set(e2, t || true === this._host._indicatorRefreshes.get(e2)), this._queueIndicatorDependents(e2, t);
      const s2 = this._host._indicatorsDirty;
      this._flushIndicators(), s2 && (this._host._indicatorsDirty = true, this._host._loop.requestFrame());
    }, resourcesChanged: () => this._reorderIndicatorResources(), formatPrice: (e2, t, i2) => (i2?.priceScale() ?? this._host._panes[e2]?.priceScale)?.format(t), policyChanged: () => {
      this._host._legendStack._restackLegends(), this._host._emit("objects:change", {});
    }, addIndicatorLegend: (e2) => {
      const t = ["hide", "settings", "close"];
      true === e2.hasSource && t.splice(t.indexOf("settings") + 1, 0, "source");
      const i2 = new Ii({ ...e2, actions: t });
      return this._host._legendActions.set(i2, [t, i2.options().actions]), this._host._studyLegends.add(i2), this._host._primitives._addPrimitive(e2.paneIndex, i2), i2;
    }, removeIndicatorLegend: (e2) => {
      this._host._studyLegends.delete(e2), this._host.removePrimitive(e2), this._host._legendStack._restackLegends();
    }, legendRowsOn: (e2) => this._host._legends.filter((t) => t.paneIndex === e2).length, primarySeries: () => this._host.primarySeries(), setIndicatorSeriesType: (e2, t) => this._host._series._setSeriesType(e2, t, false), addIndicatorSeries: (t, i2, s2, r2, n2) => this._host._series._createSeries(t, { paneIndex: i2, style: s2, priceScaleId: r2, priceFormat: n2 }, false, e), addIndicatorLevel: (e2, t) => {
      const i2 = { price: e2.price, color: e2.color, lineWidth: e2.lineWidth, lineStyle: e2.lineStyle, leftLabel: e2.label, id: e2.id };
      return this._host.addPriceLine(i2, t);
    }, removeIndicatorLevel: (e2) => this._host.removePrimitive(e2), addIndicatorFill: (e2, t) => this._host._primitives._addPrimitive(t, e2), removeIndicatorFill: (e2) => this._host.removePrimitive(e2), removeIndicatorMarkers: (e2) => this._host.removePrimitive(e2), addIndicatorPrimitive: (e2, t) => this._host._primitives._addPrimitive(t, e2), removeIndicatorPrimitive: (e2) => this._host.removePrimitive(e2), addIndicatorTable: (e2) => {
      const t = new Lo();
      return this._host._primitives._addPrimitive(e2, t), t;
    }, removeIndicatorTable: (e2) => this._host.removePrimitive(e2), sourceBars: () => null === this._host._firstDataId.value ? [] : this._host._dataLayer.seriesBars(this._host._firstDataId.value), underlyingBars: () => this._host._series._underlying(this._host._firstDataId.value), sourceState: () => {
      const e2 = this._host._seriesProvenance.get(this._host._firstDataId.value ?? -1)?.snapshot(), t = vo(this._chart);
      return e2 && t ? { ...e2, provenance: "replay", confirmation: t.forming ? "forming" : "confirmed", confirmationSource: "replay" } : e2;
    }, nextPaneIndex: () => this._host._panes.length, primaryPaneIndex: () => this._host._primaryIndex(), timezone: () => this._host._timezone, now: () => this._host._wallClock(), symbol: () => this._host._dataContext?.symbol, interval: () => this._host._dataContext?.interval, dataContext: () => this._host._dataContext, requestBars: (e2) => {
      const t = this._host._barsProvider;
      return null === t ? Promise.reject(new Error("openalgo-charts: this chart has no bars provider; call chart.setBarsProvider(...) to serve other instruments")) : vs((i2) => "function" == typeof t ? t({ ...e2, signal: i2 }) : t.requestBars({ ...e2, signal: i2 }), [e2.signal, this._host._barsRequests.signal]);
    }, requestSnapshot: (e2) => {
      const t = this._host._barsProvider;
      return vs((i2) => {
        if ("object" != typeof t || void 0 === t?.requestSnapshot) throw new Error("Requested snapshots are unsupported by this provider");
        const s2 = vo(this._chart);
        if (s2 && void 0 === s2.asOf) throw new Error("Requested snapshots require an availability clock during replay");
        if (void 0 !== e2.asOf && !Number.isFinite(e2.asOf)) throw new RangeError("Requested availability time must be finite");
        const r2 = void 0 === s2?.asOf ? e2.asOf : Math.min(e2.asOf ?? 1 / 0, s2.asOf);
        return t.requestSnapshot({ ...e2, ...void 0 === r2 ? {} : { asOf: r2 }, signal: i2 });
      }, [e2.signal, this._host._barsRequests.signal]);
    }, requestState: () => this._requestState(), subscribeRequestChanges: (e2) => {
      const t = ["data:context", "data:range", "data:requests"].map((t2) => this._host.on(t2, e2));
      return t.push(xo(this._chart, e2)), () => {
        for (const e3 of t) e3();
      };
    }, subscribeDataChanges: (e2) => {
      const t = this._host.on("data:context", () => e2("context")), i2 = this._host.on("data:range", () => e2("range"));
      return () => {
        t(), i2();
      };
    }, tickSize: (e2) => {
      const t = this._host._panes[e2] ?? this._host._primaryPane, i2 = t?.priceScale.options.minMove ?? 0;
      return i2 > 0 ? i2 : void 0;
    }, setBarColors: (e2, t) => this._setBarColors(e2, t), emit: (e2, t) => this._host._bus.emit(e2, t), setPaneRange: (e2, t) => {
      const i2 = this._host._panes[e2];
      if (void 0 === i2) return;
      const s2 = i2 === this._host._primaryPane || this._host._indicators.filter((t2) => t2.paneIndex === e2).length > 1;
      i2.priceScale.setFixedRange(s2 ? null : t), null === t && i2.priceScale.setAutoScale(true);
    } };
  }
  _assignIndicatorScale(e, t, s2, r2) {
    if (this._host._destroyed || !this._host._indicators.some((t2) => t2.id === e)) return false;
    for (const e2 of t) if (!N(e2.scaleId) || null === this._host.seriesType(e2.api)) return false;
    for (const e2 of s2) if (!N(e2.scaleId) || !this._host._panes.some((t2) => t2.hasPrimitive(e2.primitive))) return false;
    this._host._scaleMutationDepth++;
    try {
      for (const { api: e2, scaleId: i2 } of t) {
        const t2 = this._host._seriesRecords.get(e2), s3 = this._host._seriesOwners.get(e2), r3 = s3.pane.scaleFor(i2);
        t2.scaleId = i2, this._host._series._applySeriesPriceFormat(r3, s3.priceFormat), void 0 !== t2.style.precision && this._host._series._applyPrecision(r3, t2.style.precision);
      }
      for (const { primitive: e2, scaleId: t2 } of s2) this._host._panes.find((t3) => t3.hasPrimitive(e2)).bindPrimitiveScale(e2, t2);
      r2(), this._host._layout._recomputeAxisColumns();
    } finally {
      this._host._scaleMutationDepth--, this._host.invalidate((e2) => e2.invalidateGlobal(i.Full));
    }
    return this._host._emit("objects:change", {}), true;
  }
  _reconcileIndicatorRanges() {
    const e = /* @__PURE__ */ new Map();
    for (const t of this._host._indicatorRanges.values()) {
      if (!this._host._panes.includes(t.pane)) continue;
      const i2 = t.pane.scaleFor(t.scaleId);
      if (e.has(i2)) continue;
      const s2 = [...this._host._indicatorRanges.values()].filter((e2) => e2.pane === t.pane && e2.scaleId === t.scaleId && e2.range.min === t.range.min && e2.range.max === t.range.max), r2 = new Set(s2.flatMap((e2) => e2.series.flatMap((e3) => {
        const t2 = this._host._seriesRecords.get(e3);
        return t2 ? [t2] : [];
      })));
      t.pane.series().some((e2) => e2.scaleId === t.scaleId && !r2.has(e2)) || e.set(i2, t);
    }
    for (const [t, i2] of this._host._ownedScaleRanges) e.has(t) || (t.clearOwnedFixedRange(i2), this._host._ownedScaleRanges.delete(t));
    for (const [t, i2] of e) {
      const e2 = this._host._ownedScaleRanges.get(t) ?? i2.token;
      t.setOwnedFixedRange(e2, i2.range) ? this._host._ownedScaleRanges.set(t, e2) : t.ownsFixedRange(e2) || this._host._ownedScaleRanges.delete(t);
    }
  }
  _setBarColors(e, t) {
    if (null === e) {
      if (this._barColorOwner !== t) return;
      this._barColorOwner = null;
    } else this._barColorOwner = t;
    this._barColors = e, this._applyBarColors();
  }
  _applyBarColors() {
    const e = this._host._firstDataId.value;
    if (null === e) return;
    const t = this._host._dataLayer.seriesBars(e), s2 = t.length, r2 = this._barColorBase;
    (s2 < r2.length || r2.length > 0 && t[0].time !== this._barColorAnchor) && (r2.length = 0), 0 === r2.length && (this._barColorAnchor = s2 > 0 ? t[0].time : 0);
    for (let e2 = r2.length; e2 < s2; e2++) r2[e2] = t[e2].color;
    const n2 = this._barColors, o2 = new Array(s2);
    let a = false;
    for (let e2 = 0; e2 < s2; e2++) {
      const i2 = t[e2], s3 = n2?.[e2] ?? r2[e2];
      s3 !== i2.color ? (o2[e2] = { ...i2, color: s3 }, a = true) : o2[e2] = i2;
    }
    if (!a) return;
    this._host._dataLayer.setSeriesData(e, o2);
    const l2 = this._host._panes.findIndex((t2) => t2.series().some((t3) => t3.dataId === e));
    this._host.invalidate((e2) => {
      l2 < 0 ? e2.invalidateGlobal(i.Light) : e2.invalidatePane(l2, { level: i.Light, autoScale: false });
    });
  }
  _invalidateIndicators() {
    this._host._emit("data:range", {}), 0 !== this._host._indicators.length && (this._host._indicatorsDirty = true, this._host._loop.requestFrame());
  }
  _flushIndicators() {
    if (!this._host._indicatorsDirty && 0 === this._host._indicatorRefreshes.size) return;
    if (this._recomputing) return;
    if (0 === this._host._indicators.length) return this._host._indicatorsDirty = false, void this._host._indicatorRefreshes.clear();
    const e = this._host._indicatorsDirty, t = this._host._series._sharedAxis(), i2 = js(this._host._indicators.map((e2) => e2.dependencyNode())).order, s2 = new Map(this._host._indicatorRefreshes);
    if (this._host._indicatorRefreshes.clear(), e) for (const e2 of i2) s2.has(e2) || s2.set(e2, false);
    this._host._indicatorsDirty = false, this._recomputing = true, this._indicatorWork = s2;
    const r2 = /* @__PURE__ */ new Set();
    this._indicatorProcessed = r2;
    try {
      for (const e2 of i2) {
        if (!s2.has(e2) || r2.has(e2)) continue;
        const t2 = this._host._indicators.find((t3) => t3.id === e2);
        t2 && (r2.add(e2), t2.recompute(s2.get(e2)));
      }
      for (const e2 of this._host._indicators) e2.republishBarColors();
    } finally {
      this._indicatorWork = null, this._indicatorProcessed = null, this._recomputing = false, this._invalidateStudies(r2, t);
    }
  }
  _invalidateStudies(e, t) {
    const i2 = /* @__PURE__ */ new Set();
    for (const t2 of e) {
      const e2 = this._host._indicators.find((e3) => e3.id === t2)?.renderResources();
      for (const { api: t3 } of e2?.series ?? []) {
        const e3 = this._host._seriesOwners.get(t3)?.pane;
        void 0 !== e3 && i2.add(e3);
      }
      for (const { primitive: t3 } of e2?.primitives ?? []) {
        const e3 = this._host._panes.find((e4) => e4.hasPrimitive(t3));
        void 0 !== e3 && i2.add(e3);
      }
    }
    this._host._series._invalidateWrite(i2, t);
  }
  _queueIndicatorDependents(e, t) {
    const i2 = js(this._host._indicators.map((e2) => e2.dependencyNode())), s2 = [e], r2 = new Set(s2);
    for (let e2 = 0; e2 < s2.length; e2++) for (const [n2, o2] of i2.dependencies) {
      if (r2.has(n2) || !o2.some((t2) => t2.source.instanceId === s2[e2])) continue;
      r2.add(n2), s2.push(n2), this._host._indicators.find((e3) => e3.id === n2)?.invalidateStudyOutput();
      const i3 = this._indicatorWork && !this._indicatorProcessed?.has(n2) ? this._indicatorWork : this._host._indicatorRefreshes;
      i3.set(n2, t || true === i3.get(n2));
    }
    this._host._indicatorRefreshes.size > 0 && this._host._loop.requestFrame();
  }
};
function Fo(e) {
  return Math.max(-2, Math.min(2, -e * Math.log(1.1) / 100));
}
function zo(e, t) {
  return { dist: Math.hypot(e.x - t.x, e.y - t.y), cx: (e.x + t.x) / 2, cy: (e.y + t.y) / 2 };
}
var Eo = "indicator-legend::toggle";
var Bo = class {
  constructor() {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_bounds", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_options", { enumerable: true, configurable: true, writable: true, value: { count: 0, collapsed: false, left: 8, top: 6, height: 18 } });
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null, this._bounds = null;
  }
  zOrder() {
    return "top";
  }
  setOptions(e) {
    Object.keys(e).every((t) => e[t] === this._options[t]) || (this._options = e, this._bounds = null, this._host?.requestUpdate());
  }
  draw(e, t) {
    this._bounds = null;
    const i2 = this._options, s2 = t.dpr, r2 = i2.height;
    if (0 === i2.count || t.plotWidth < 18 || i2.top < 0 || i2.top + r2 > t.plotHeight) return;
    e.save(), e.font = `500 ${11 * s2}px ui-sans-serif, system-ui, sans-serif`;
    let n2 = `Indicators ${i2.count}`;
    e.measureText(n2).width / s2 + 24 > t.plotWidth && (n2 = String(i2.count));
    const o2 = Math.min(t.plotWidth, e.measureText(n2).width / s2 + 24), a = Math.max(0, Math.min(i2.left, t.plotWidth - o2)), l2 = i2.top;
    this._bounds = { x: a, y: l2, width: o2, height: r2 }, e.beginPath(), e.rect(a * s2, l2 * s2, o2 * s2, r2 * s2), e.clip(), e.fillStyle = se(t.theme.background, 0.9), e.beginPath(), e.roundRect(a * s2, l2 * s2, o2 * s2, r2 * s2, 3 * s2), e.fill(), e.strokeStyle = t.theme.axisText, e.lineWidth = s2;
    const h2 = (a + 8) * s2, c2 = (l2 + r2 / 2) * s2, d2 = 3 * s2;
    e.beginPath(), i2.collapsed ? (e.moveTo(h2 - d2 / 2, c2 - d2), e.lineTo(h2 + d2 / 2, c2), e.lineTo(h2 - d2 / 2, c2 + d2)) : (e.moveTo(h2 - d2, c2 - d2 / 2), e.lineTo(h2, c2 + d2 / 2), e.lineTo(h2 + d2, c2 - d2 / 2)), e.stroke(), e.fillStyle = t.theme.axisText, e.textBaseline = "middle", e.textAlign = "left", e.fillText(n2, (a + 16) * s2, c2), e.restore();
  }
  hitTest(e, t) {
    const i2 = this._bounds;
    return i2 && e >= i2.x && e < i2.x + i2.width && t >= i2.y && t < i2.y + i2.height ? { externalId: Eo, zOrder: "top", distance: 0, cursor: "pointer" } : null;
  }
};
function $o(e) {
  const t = e.pointerType;
  return { modifiers: { shift: true === e.shiftKey, alt: true === e.altKey, ctrl: true === e.ctrlKey, meta: true === e.metaKey }, pointerType: "touch" === t || "pen" === t ? t : "mouse", pressure: Do(e) };
}
function Do(e) {
  const t = e.pressure;
  return "number" == typeof t && Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0 !== (e.buttons ?? 0) ? 0.5 : 0;
}
var Wo = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_pointerInside", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_keyTarget", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_cursorPane", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_cursor", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_dragging", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_navigationCancelled", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_dragStartX", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_dragStartY", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_lastDragY", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_endedPointers", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_pointers", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_pinch", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_pinchPane", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_dragStartOffset", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_indicatorTogglePress", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_lastPressOnIndicatorToggle", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_previousPressOnIndicatorToggle", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_clickCbs", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_crosshairCbs", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_readoutTime", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_pointerMoved", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_placementMode", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_downPane", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_downX", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_downLocalY", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_downPressure", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_dragId", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_dragPriceScale", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_dragCancelOnEscape", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_hoverId", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_hoverKey", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_hoverOnBase", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_overlayFrozen", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_timeNavButtons", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_dragCbs", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_axisDrag", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_axisDragScale", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_dragMoved", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_dragFrom", { enumerable: true, configurable: true, writable: true, value: { time: 0, price: 0 } }), Object.defineProperty(this, "_paneResize", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_axisStartCoord", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_axisStartMin", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_axisStartMax", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_axisStartSpacing", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_brandingPress", { enumerable: true, configurable: true, writable: true, value: null }), this._host = e;
  }
  _attachInput() {
    if ("undefined" == typeof window) return;
    const e = this._host._container;
    e.addEventListener("pointerdown", this._host._onPointerDown), e.addEventListener("pointermove", this._host._onPointerMove), e.addEventListener("pointerup", this._host._onPointerUpNative), e.addEventListener("pointercancel", this._host._onPointerCancel), e.addEventListener("lostpointercapture", this._host._onLostPointerCapture), e.addEventListener("pointerleave", this._host._onPointerLeave), e.addEventListener("wheel", this._host._onWheel, { passive: false }), e.addEventListener("dblclick", this._host._onDblClick), e.addEventListener("pointerenter", this._host._onPointerEnter), e.addEventListener("contextmenu", this._host._onContextMenu);
    const t = "function" == typeof this._host._doc.addEventListener ? this._host._doc : e;
    t.addEventListener("keydown", this._host._onKeyDown), this._keyTarget = t;
  }
  _detachInput() {
    if ("undefined" == typeof window) return;
    const e = this._host._container;
    e.removeEventListener("pointerdown", this._host._onPointerDown), e.removeEventListener("pointermove", this._host._onPointerMove), e.removeEventListener("pointerup", this._host._onPointerUpNative), e.removeEventListener("pointercancel", this._host._onPointerCancel), e.removeEventListener("lostpointercapture", this._host._onLostPointerCapture), e.removeEventListener("pointerleave", this._host._onPointerLeave), e.removeEventListener("wheel", this._host._onWheel), e.removeEventListener("dblclick", this._host._onDblClick), e.removeEventListener("pointerenter", this._host._onPointerEnter), e.removeEventListener("contextmenu", this._host._onContextMenu), this._keyTarget?.removeEventListener("keydown", this._host._onKeyDown), this._keyTarget = null;
  }
  _onPointerEnter() {
    this._pointerInside = true;
  }
  _onContextMenu(e) {
    if (e.defaultPrevented) return;
    const t = this._localPoint(e), i2 = this._host._panes[t.pane];
    if (void 0 !== i2) if (this._host._bus.has("contextmenu")) this._host._emit("contextmenu", this._contextMenuEvent(e, t));
    else {
      this._cursor = null, this._cursorPane = null;
      try {
        const e2 = i2.top.ctx;
        e2.save(), e2.globalCompositeOperation = "destination-over", e2.drawImage(i2.base.element, 0, 0), e2.restore(), this._overlayFrozen = true;
      } catch {
      }
    }
  }
  _contextMenuEvent(e, t) {
    const i2 = t.x - this._host._leftAxisWidth, s2 = i2 >= 0 && t.x < this._host._width - this._host._rightAxisWidth, r2 = s2 ? Math.round(this._host._timeScale.xToIndex(i2)) : null;
    return s2 && this._host._ensureScaled(t.pane), { paneIndex: t.pane, point: { x: t.x, y: t.y }, price: s2 ? this._priceAt(t.pane, t.localY) : null, time: null === r2 ? null : this._host._dataLayer.indexToTime(r2) ?? null, index: r2, target: this._contextTarget(t, s2, r2), preventDefault: () => e.preventDefault() };
  }
  _contextTarget(e, t, i2) {
    const s2 = e.pane === this._host._bottomPaneIndex(), r2 = e.x >= this._host._width - this._host._rightAxisWidth;
    if (s2 && e.localY >= e.paneHeight - this._host._timeAxisHeight && !r2) return { kind: "time-scale", id: null };
    if (!t) {
      const t2 = this._axisAt(e.pane, e.x);
      return t2 ? { kind: "price-scale", id: null, side: t2.side, scaleId: t2.scaleId } : { kind: "empty", id: null };
    }
    const n2 = this._host._panes[e.pane], o2 = this._host._renderContext(e.pane), a = this._hitAt(e.pane, e.x, e.localY), l2 = null === i2 || this._host._layout._collapsedShown(e.pane) ? null : this._seriesAt(e.pane, i2, e.localY);
    if (null != a && (null === l2 || void 0 === a.paintedBy || !n2.paintsBelowSeries(a.paintedBy, l2, o2))) {
      const e2 = a.externalId;
      if (e2.startsWith("draw:")) return { kind: "drawing", id: e2 };
      if (e2.startsWith("indicator:")) {
        const t2 = e2.lastIndexOf("::"), i3 = e2.slice(10, t2 < 0 ? void 0 : t2);
        return { kind: "indicator", id: e2, instanceId: i3 };
      }
      return e2.endsWith("::row") ? { kind: "legend", id: e2 } : { kind: "primitive", id: e2 };
    }
    if (null === l2) return { kind: "empty", id: null };
    for (const e2 of this._host._indicators) for (const t2 of _s(e2.indicatorId).plots) {
      const i3 = e2.series(t2.key);
      if (i3 && this._host._seriesRecords.get(i3) === l2) return { kind: "indicator", id: `indicator:${e2.id}`, instanceId: e2.id, plotKey: t2.key };
    }
    return { kind: "series", id: null, seriesType: l2.type };
  }
  _axisAt(e, t) {
    return this._host.priceAxisLayout(e).find((e2) => t >= e2.x && t < e2.x + e2.width);
  }
  _seriesAt(e, t, i2) {
    const s2 = this._host._panes[e];
    if (void 0 === s2) return null;
    const r2 = s2.series();
    for (let e2 = r2.length - 1; e2 >= 0; e2--) {
      const n2 = r2[e2];
      if (false === n2.style.visible) continue;
      const o2 = A(this._host._dataLayer, n2.dataId, t);
      if (void 0 === o2) continue;
      const a = Ae(n2.type).extents(o2, n2.style);
      if (!isFinite(a.min) || !isFinite(a.max)) continue;
      const l2 = s2.scaleOf(n2), h2 = l2.priceToY(a.max), c2 = l2.priceToY(a.min);
      if (i2 >= Math.min(h2, c2) - 3 && i2 <= Math.max(h2, c2) + 3) return n2;
    }
    return null;
  }
  _priceAt(e, t) {
    return this._host._layout._collapsedShown(e) ? null : this._host._panes[e]?.yToPrice(t) ?? null;
  }
  _unfreezeOverlay() {
    this._overlayFrozen && (this._overlayFrozen = false, this._host.invalidate((e) => e.invalidateGlobal(i.Cursor)));
  }
  _localPoint(e) {
    const t = this._host._container.getBoundingClientRect();
    return this._project(e.clientX - t.left, e.clientY - t.top, this._host._paneLayout());
  }
  _project(e, t, i2) {
    let s2 = 0;
    for (let e2 = 0; e2 < i2.length; e2++) t >= i2[e2].top && (s2 = e2);
    const r2 = i2[s2] ?? { top: 0, height: this._host._height };
    return { x: e, y: t, pane: s2, localY: t - r2.top, paneHeight: r2.height };
  }
  _dragSamples(e) {
    const t = "function" == typeof e.getCoalescedEvents ? e.getCoalescedEvents() : [], i2 = t.length > 0 ? t : [e], s2 = this._host._container.getBoundingClientRect(), r2 = this._host._paneLayout(), n2 = [];
    for (const e2 of i2) {
      const t2 = this._project(e2.clientX - s2.left, e2.clientY - s2.top, r2);
      n2.push({ x: t2.x, y: null === this._dragId ? t2.localY : t2.y - (r2[this._downPane]?.top ?? 0), pressure: Do(e2) });
    }
    return n2;
  }
  _clickInfo(e) {
    const t = $o(e);
    return t.pressure = this._downPressure, { ...t, shiftKey: t.modifiers.shift, ctrlKey: t.modifiers.ctrl, metaKey: t.modifiers.meta };
  }
  _onPointerDown(e) {
    if (this._unfreezeOverlay(), ("mouse" === e.pointerType || "pen" === e.pointerType) && 0 !== e.button) return;
    this._previousPressOnIndicatorToggle = this._lastPressOnIndicatorToggle, this._lastPressOnIndicatorToggle = false, this._endedPointers.delete(e.pointerId), 0 === this._pointers.size && (this._navigationCancelled = false), this._host._motion._stopKinetic(), this._host._motion._stopZoomGlide();
    const t = this._localPoint(e);
    this._pointers.set(e.pointerId, { x: t.x, y: t.y, pane: t.pane });
    try {
      this._host._container.setPointerCapture?.(e.pointerId);
    } catch {
    }
    if (this._navigationCancelled) return;
    if (this._pointers.size >= 2) return void this._beginPinch();
    this._downPane = t.pane, this._downX = t.x, this._downLocalY = t.localY, this._downPressure = Do(e);
    const i2 = this._host._layout._dividerAt(t.y);
    if (null !== i2) return void this._beginDividerResize(i2, t);
    const s2 = Math.max(0, this._host._width - this._host._rightAxisWidth), r2 = this._host._leftAxisWidth > 0 && t.x < this._host._leftAxisWidth, n2 = t.x >= s2 || r2, o2 = t.pane === this._host._bottomPaneIndex() && t.localY >= t.paneHeight - this._host._timeAxisHeight;
    if (n2) return void this._beginPriceAxisDrag(t);
    if (o2) return false === this._host._navigation.zoomEnabled ? void (this._axisDrag = "empty") : (this._axisDrag = "time", this._axisStartCoord = t.x, this._axisStartSpacing = this._host._timeScale.barSpacing, void (this._dragging = false));
    if (this._host._legendStack._indicatorLegendHit(t.pane, t.x, t.localY)) return this._lastPressOnIndicatorToggle = true, this._indicatorTogglePress = { pointerId: e.pointerId, moved: false }, this._dragging = false, void (this._pointerMoved = false);
    const a = this._host._panes[t.pane]?.hitTestPrimitives(t.x - this._host._leftAxisWidth, t.localY, this._host._renderContext(t.pane), this._host._branding);
    return null !== this._host._branding && !a && this._brandingHit(t.pane, t.x, t.localY) ? (this._brandingPress = { pointerId: e.pointerId, mark: this._host._branding, moved: false }, this._dragging = false, void (this._pointerMoved = false)) : this._placementMode ? (this._dragging = false, void (this._pointerMoved = false)) : void (a && (true === a.draggable || "ns-resize" === a.cursor && this._dragCbs.size > 0) ? this._beginPrimitiveDrag(e, t, a) : (this._dragging = false !== this._host._navigation.panEnabled, this._setHover(a ?? null), this._pointerMoved = false, this._dragStartX = t.x, this._dragStartY = t.y, this._lastDragY = t.y, this._dragStartOffset = this._host._timeScale.rightOffset, this._host._lastDragX = t.x, this._host._lastDragT = this._host._now(), this._host._dragVelocity = 0));
  }
  _onPointerMove(e) {
    if (this._unfreezeOverlay(), this._pointerInside = true, this._pointers.size > 0 && !this._pointers.has(e.pointerId)) return;
    if (("mouse" === e.pointerType || "pen" === e.pointerType) && !(1 & e.buttons) && (this._pointers.has(e.pointerId) || this._dragging || null !== this._dragId || null !== this._axisDrag || null !== this._brandingPress || null !== this._indicatorTogglePress)) return null !== this._brandingPress && (this._brandingPress.moved = true), null !== this._indicatorTogglePress && (this._indicatorTogglePress.moved = true), this._host._onPointerUp(e), void this._endedPointers.add(e.pointerId);
    const t = this._localPoint(e);
    if (this._pointers.has(e.pointerId) && this._pointers.set(e.pointerId, { x: t.x, y: t.y, pane: t.pane }), !this._navigationCancelled) if (null === this._pinch) {
      if ("empty" !== this._axisDrag) if (null === this._indicatorTogglePress) if (null === this._brandingPress) {
        if ("price" === this._axisDrag) {
          const e2 = t.localY - this._axisStartCoord, s2 = Math.exp(5e-3 * e2), r2 = (this._axisStartMin + this._axisStartMax) / 2, n2 = (this._axisStartMax - this._axisStartMin) / 2 * s2, o2 = this._axisDragScale ?? this._host._panes[this._downPane].priceScale;
          return o2.setPriceRange({ min: r2 - n2, max: r2 + n2 }), o2.setAutoScale(false), void this._host.invalidate((e3) => e3.invalidatePane(this._downPane, { level: i.Light, autoScale: false }));
        }
        if (null !== this._paneResize) {
          const e2 = this._paneResize, s2 = e2.aHeight + e2.bHeight, r2 = e2.aWeight + e2.bWeight, n2 = Math.min(24, s2 / 4), o2 = Math.max(n2, Math.min(s2 - n2, e2.aHeight + (t.y - e2.startY)));
          return this._host._panes[e2.a].weight = o2 / s2 * r2, this._host._panes[e2.b].weight = r2 - this._host._panes[e2.a].weight, this._host._layout._relayout(), void this._host.invalidate((e3) => e3.invalidateGlobal(i.Full));
        }
        if ("time" === this._axisDrag) {
          this._host._motion._beginAutoscaleMotion();
          const e2 = t.x - this._axisStartCoord;
          return this._host._mutateTimeScale(() => this._host._timeScale.setBarSpacing(this._axisStartSpacing * Math.exp(5e-3 * -e2))), this._host.invalidate((e3) => e3.invalidateGlobal(i.Full)), void this._host._emitViewport("zoom");
        }
        (this._placementMode || !this._dragging) && this._pointers.size > 0 && this._movedFromPress(t.x, t.localY) && (this._pointerMoved = true), null === this._dragId ? this._dragging ? this._movePan(e, t) : this._updateCursor(t.pane, t.x, t.localY, t.y, e) : this._movePrimitiveDrag(e, t);
      } else !this._movedFromPress(t.x, t.localY) && t.pane === this._downPane && ("mouse" !== e.pointerType || 1 & e.buttons) || (this._brandingPress.moved = true);
      else (this._movedFromPress(t.x, t.localY) || t.pane !== this._downPane) && (this._indicatorTogglePress.moved = true);
    } else this._updatePinch();
  }
  _onPointerUp(e) {
    if (this._pointers.size > 0 && !this._pointers.has(e.pointerId)) return;
    const t = this._indicatorTogglePress?.pointerId === e.pointerId ? this._indicatorTogglePress : null;
    t && (this._indicatorTogglePress = null), this._pointers.delete(e.pointerId);
    try {
      this._host._container.releasePointerCapture?.(e.pointerId);
    } catch {
    }
    if (this._endedPointers.has(e.pointerId)) return void this._endedPointers.delete(e.pointerId);
    if (this._navigationCancelled) return 0 === this._pointers.size && (this._navigationCancelled = false), void this._endedPointers.add(e.pointerId);
    if (t) {
      const i3 = this._localPoint(e);
      return this._endedPointers.add(e.pointerId), void (!t.moved && i3.pane === this._downPane && Math.abs(i3.x - this._downX) <= 3 && Math.abs(i3.localY - this._downLocalY) <= 3 && this._host._legendStack._indicatorLegendHit(i3.pane, i3.x, i3.localY) && this._host._handleLegendAction(Eo));
    }
    if (this._brandingPress?.pointerId === e.pointerId) {
      const t2 = this._brandingPress;
      this._brandingPress = null;
      const i3 = this._localPoint(e);
      if (!t2.moved && t2.mark === this._host._branding && i3.pane === this._downPane && Math.abs(i3.x - this._downX) <= 3 && Math.abs(i3.localY - this._downLocalY) <= 3 && this._brandingHit(i3.pane, i3.x, i3.localY)) {
        const e2 = t2.mark.href();
        e2 && /^https?:\/\//i.test(e2) && this._host._doc.defaultView?.open(e2, "_blank", "noopener,noreferrer");
      }
      return void this._endedPointers.add(e.pointerId);
    }
    if (null !== this._pinch) return void (0 === this._pointers.size && (this._pinch = null, this._dragging = false));
    if (null !== this._paneResize) return this._paneResize = null, void this._host._emit("paneResized", { paneIndex: this._downPane });
    if (null !== this._axisDrag) return this._axisDrag = null, void (this._axisDragScale = null);
    if (null !== this._dragId) return void this._endPrimitiveDrag(e);
    const i2 = this._dragging;
    this._dragging = false, this._placementMode && this._pointerMoved ? this._endPlacement(e, i2) : this._pointerMoved ? (i2 && this._setHover(null), i2 && false !== this._host._navigation.panEnabled && "touch" === e.pointerType && "pointercancel" !== e.type && qi.shouldAnimate(this._host._dragVelocity) && this._host._startKinetic(this._host._dragVelocity)) : this._endClick(e, i2);
  }
  _movedFromPress(e, t) {
    return Math.abs(e - this._downX) > 3 || Math.abs(t - this._downLocalY) > 3;
  }
  _beginDividerResize(e, t) {
    const i2 = this._host._paneLayout(), [s2, r2] = e;
    this._paneResize = { a: s2, b: r2, startY: t.y, aWeight: this._host._panes[s2].weight, bWeight: this._host._panes[r2].weight, aHeight: i2[s2].height, bHeight: i2[r2].height }, this._dragging = false;
  }
  _beginPriceAxisDrag(e) {
    const t = this._axisAt(e.pane, e.x);
    if (this._dragging = false, !t || false === this._host._navigation.zoomEnabled) return void (this._axisDrag = "empty");
    this._axisDrag = "price", this._axisDragScale = this._host._panes[e.pane].scaleFor(t.scaleId), this._axisStartCoord = e.localY;
    const i2 = this._axisDragScale.priceRange();
    this._axisStartMin = i2.min, this._axisStartMax = i2.max, this._dragging = false;
  }
  _beginPrimitiveDrag(e, t, s2) {
    this._dragId = s2.externalId, this._dragPriceScale = s2.priceScale ?? null, this._dragCancelOnEscape = true === s2.cancelOnEscape, this._dragMoved = false, this._host._ensureScaled(t.pane), this._dragFrom = { time: this._host._xToTime(t.x), price: this._dragPriceScale?.yToPrice(t.localY) ?? this._host._panes[t.pane].yToPrice(t.localY) }, this._setHover(s2), this._cursor = null, this._cursorPane = null, this._readoutTime = null, this._host.invalidate((e2) => e2.invalidateGlobal(i.Cursor)), this._dragging = false, this._pointerMoved = false;
    const r2 = { id: s2.externalId, ...this._dragFrom, paneIndex: this._downPane, point: { x: t.x, y: t.localY }, ...$o(e) };
    this._host._emit("drag:start", r2);
  }
  _movePrimitiveDrag(e, t) {
    const i2 = t.y - (this._host._paneLayout()[this._downPane]?.top ?? 0);
    this._movedFromPress(t.x, i2) && (this._dragMoved = true);
    const s2 = this._dragPriceScale?.yToPrice(i2) ?? this._host._panes[this._downPane].yToPrice(i2), r2 = this._host._xToTime(t.x);
    gn(this._dragCbs, { end: false, id: this._dragId, price: s2, time: r2 });
    const n2 = { id: this._dragId, price: s2, time: r2, paneIndex: this._downPane, fromPrice: this._dragFrom.price, fromTime: this._dragFrom.time, point: { x: t.x, y: i2 }, samples: this._dragSamples(e), ...$o(e) };
    this._host._emit("drag", n2);
  }
  _movePan(e, t) {
    this._host._motion._beginAutoscaleMotion();
    const s2 = t.x - this._dragStartX;
    if ((Math.abs(s2) > 3 || Math.abs(t.y - this._dragStartY) > 3) && (this._pointerMoved = true), this._pointerMoved && null !== this._hoverId && this._setHover(null), this._host._mutateTimeScale(() => this._host._timeScale.setRightOffset(this._dragStartOffset - s2 / this._host._timeScale.barSpacing)), "touch" === e.pointerType || "both" === this._host._navigation.mousePan) {
      const i2 = this._host._layout._collapsedShown(this._downPane) ? void 0 : this._host._panes[this._downPane]?.priceScale, s3 = t.y - this._dragStartY;
      i2 && ("touch" === e.pointerType || !i2.autoScale || Math.abs(s3) > 3) && i2.panByPixels("touch" !== e.pointerType && i2.autoScale ? s3 : t.y - this._lastDragY);
    }
    this._lastDragY = t.y;
    const r2 = this._host._now(), n2 = r2 - this._host._lastDragT;
    if (n2 > 0) {
      const e2 = (t.x - this._host._lastDragX) / n2, i2 = Math.exp(-n2 / 50);
      this._host._dragVelocity = this._host._dragVelocity * i2 + e2 * (1 - i2);
    }
    this._host._lastDragX = t.x, this._host._lastDragT = r2, this._host._maybeLoadHistory(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emitViewport("pan");
  }
  _endPrimitiveDrag(e) {
    const t = this._localPoint(e), s2 = t.y - (this._host._paneLayout()[this._downPane]?.top ?? 0), r2 = this._dragPriceScale?.yToPrice(s2) ?? this._host._panes[this._downPane].yToPrice(s2), n2 = this._host._xToTime(t.x);
    gn(this._dragCbs, { end: true, id: this._dragId, price: r2, time: n2 });
    const o2 = { id: this._dragId, price: r2, time: n2, paneIndex: this._downPane, point: { x: t.x, y: s2 }, ...$o(e) };
    if (this._host._emit("drag:end", o2), !this._dragMoved) {
      const t2 = this._dragId;
      gn(this._clickCbs, t2);
      const i2 = { id: t2, price: r2, time: n2, paneIndex: this._downPane, point: { x: this._downX, y: this._downLocalY }, ...this._clickInfo(e) };
      this._host._emit("click", i2);
    }
    this._dragId = null, this._dragPriceScale = null;
    const a = "touch" === e.pointerType ? null : this._hitAt(t.pane, t.x, t.localY);
    this._setHover(a), this._host.invalidate((e2) => e2.invalidateGlobal(i.Light));
  }
  _endPlacement(e, t) {
    t && this._setHover(null);
    const i2 = this._localPoint(e);
    this._host._ensureScaled(this._downPane);
    const s2 = this._clickInfo(e), r2 = { id: null, price: this._priceAt(this._downPane, this._downLocalY), time: this._host._xToTime(this._downX), paneIndex: this._downPane, point: { x: this._downX, y: this._downLocalY }, ...s2 };
    this._host._emit("click", r2);
    const n2 = { id: null, price: this._priceAt(this._downPane, i2.localY), time: this._host._xToTime(i2.x), paneIndex: this._downPane, point: { x: i2.x, y: i2.localY }, viaDrag: true, ...s2 };
    this._host._emit("click", n2);
  }
  _endClick(e, t) {
    const i2 = this._hitAt(this._downPane, this._downX, this._downLocalY);
    if (t && this._setHover("touch" === e.pointerType ? null : i2 ?? null), i2 && this._host._handleLegendAction(i2.externalId)) return;
    i2 && gn(this._clickCbs, i2.externalId), this._host._ensureScaled(this._downPane);
    const s2 = { id: i2?.externalId ?? null, price: this._priceAt(this._downPane, this._downLocalY), time: this._host._xToTime(this._downX), paneIndex: this._downPane, point: { x: this._downX, y: this._downLocalY }, ...this._clickInfo(e) };
    this._host._emit("click", s2);
  }
  _onPointerUpNative(e) {
    ("mouse" !== e.pointerType && "pen" !== e.pointerType || 0 === e.button) && this._host._onPointerUp(e);
  }
  _onPointerCancel(e) {
    this._cancelPrimitiveDrag("pointercancel"), this._pointers.has(e.pointerId) && (this._pointerMoved = true), this._brandingPress?.pointerId === e.pointerId && (this._brandingPress.moved = true), this._indicatorTogglePress?.pointerId === e.pointerId && (this._indicatorTogglePress.moved = true), this._host._onPointerUp(e);
  }
  _onLostPointerCapture(e) {
    if (this._indicatorTogglePress?.pointerId === e.pointerId) return this._indicatorTogglePress.moved = true, void this._host._onPointerUp(e);
    this._pointers.has(e.pointerId) && null === this._dragId && null === this._paneResize && null === this._brandingPress && ((null !== this._pinch || this._navigationCancelled) && (this._navigationCancelled = true, this._pinch = null), this._dragging = false, this._axisDrag = null, this._axisDragScale = null, this._host._dragVelocity = 0, this._pointerMoved = true, this._pointers.delete(e.pointerId), 0 === this._pointers.size && (this._navigationCancelled = false), this._endedPointers.add(e.pointerId), this._setHover(null));
  }
  _brandingHit(e, t, i2) {
    const s2 = this._host._panes[e];
    if (null === this._host._branding || !s2?.hasPrimitive(this._host._branding)) return null;
    const r2 = e === this._host._bottomPaneIndex();
    return this._host._branding.hitTest(t - this._host._leftAxisWidth, i2, { timeScale: this._host._timeScale, priceScale: s2.priceScale, dataLayer: this._host._dataLayer, plotWidth: this._host._width - this._host._leftAxisWidth - this._host._rightAxisWidth, plotHeight: (this._host._paneLayout()[e]?.height ?? 0) - (r2 ? this._host._timeAxisHeight : 0), priceAxisWidth: this._host._rightAxisWidth, dpr: this._host._pixelRatio(), theme: this._host._theme });
  }
  _hitAt(e, t, i2) {
    return this._host._panes[e]?.hitTestPrimitives(t - this._host._leftAxisWidth, i2, this._host._renderContext(e), this._host._branding) ?? this._brandingHit(e, t, i2);
  }
  _onPointerLeave() {
    if (this._pointerInside = false, this._host._feedTimeNav(null), null === this._dragId && this._setHover(null), null !== this._cursor) {
      this._cursor = null, this._cursorPane = null, this._host.invalidate((e2) => e2.invalidateGlobal(i.Cursor));
      for (const e2 of this._host._indicators) e2.updateLegendValues();
      const e = { time: null, index: null, price: null, bar: null, point: null, paneIndex: null };
      gn(this._crosshairCbs, e), this._host._emit("crosshair:readout", e), this._host._emit("crosshair:move", e);
    }
  }
  _onWheel(e) {
    const t = function(e2, t2, i2) {
      const s3 = e2.deltaMode, r3 = e2.deltaX ?? 0, n3 = e2.deltaY ?? 0;
      return { x: Number.isFinite(r3) ? r3 * (1 === s3 ? 16 : 2 === s3 ? t2 : 1) : 0, y: Number.isFinite(n3) ? n3 * (1 === s3 ? 16 : 2 === s3 ? i2 : 1) : 0 };
    }(e, this._host._width, this._host._height);
    if (0 === t.x && 0 === t.y) return;
    const s2 = this._localPoint(e), r2 = this._host._leftAxisWidth > 0 && s2.x < this._host._leftAxisWidth, n2 = this._host._rightAxisWidth > 0 && s2.x >= this._host._width - this._host._rightAxisWidth, o2 = !r2 && !n2 && !e.ctrlKey && !e.metaKey && (e.shiftKey || Math.abs(t.x) > Math.abs(t.y));
    if (o2 ? false === this._host._navigation.panEnabled : false === this._host._navigation.zoomEnabled) return;
    if (!o2 && 0 === t.y) return;
    if (this._unfreezeOverlay(), e.preventDefault(), this._host._motion._stopKinetic(), r2 || n2) {
      if (0 === t.y) return;
      const e2 = this._axisAt(s2.pane, s2.x);
      if (!e2) return;
      this._host._motion._stopZoomGlide();
      return this._host._panes[s2.pane].scaleFor(e2.scaleId).scaleAtY(s2.localY, Math.exp(-Fo(t.y))), void this._host.invalidate((e3) => e3.invalidateGlobal(i.Full));
    }
    if (o2) return this._host._motion._stopZoomGlide(), this._host._motion._beginAutoscaleMotion(), this._host._mutateTimeScale(() => this._host._timeScale.scrollByPixels(-(e.shiftKey && 0 === t.x ? t.y : t.x))), this._host._maybeLoadHistory(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), void this._host._emitViewport("pan");
    if (0 === t.y) return;
    const a = "right" !== this._host._zoomAnchor || e.ctrlKey || e.metaKey ? Math.max(0, Math.min(this._host._timeScale.width, s2.x - this._host._leftAxisWidth)) : this._host._timeScale.width;
    if (this._host._animZoom) return void this._host._motion._retargetZoom(a, Fo(t.y));
    const l2 = this._host._motion._remainingZoom(), h2 = this._host._timeScale.barSpacing, c2 = this._host._timeScale.constrainBarSpacing(h2 * Math.exp(l2 + Fo(t.y)));
    this._host._motion._stopZoomGlide();
    const d2 = Math.log(c2 / h2);
    0 !== d2 && this._host._motion._applyZoom(a, d2);
  }
  _onDblClick(e) {
    if (this._lastPressOnIndicatorToggle || this._previousPressOnIndicatorToggle) return;
    const t = this._localPoint(e);
    if (this._host._legendStack._indicatorLegendHit(t.pane, t.x, t.localY)) return;
    if (this._brandingHit(t.pane, t.x, t.localY) && !this._host._panes[t.pane]?.hitTestPrimitives(t.x - this._host._leftAxisWidth, t.localY, this._host._renderContext(t.pane), this._host._branding)) return;
    const i2 = { paneIndex: t.pane, x: t.x, y: t.y, handled: false };
    this._host._emit("dblclick", i2), this._placementMode || i2.handled || ("reset" === this._host._doubleClick && false !== this._host._navigation.zoomEnabled ? this._host.resetScale() : "maximize" === this._host._doubleClick && this._host.maximizePane(t.pane));
  }
  _beginPinch() {
    this._cancelPrimitiveDrag("pinch"), this._brandingPress = null, this._indicatorTogglePress = null;
    const e = [...this._pointers.values()];
    this._pinch = zo(e[0], e[1]), this._pinchPane = e[0].pane, this._dragging = false, this._axisDrag = null, this._axisDragScale = null, this._dragId = null, this._pointerMoved = true, this._dragPriceScale = null, this._setHover(null);
  }
  _updatePinch() {
    const e = [...this._pointers.values()];
    if (e.length < 2 || null === this._pinch) return;
    const t = zo(e[0], e[1]), s2 = function(e2, t2) {
      return { factor: e2.dist > 0 ? t2.dist / e2.dist : 1, dx: t2.cx - e2.cx, dy: t2.cy - e2.cy };
    }(this._pinch, t);
    this._pinch = t;
    const r2 = false !== this._host._navigation.zoomEnabled && 1 !== s2.factor, n2 = false !== this._host._navigation.panEnabled && (0 !== s2.dx || 0 !== s2.dy);
    (r2 || n2) && (this._host._motion._beginAutoscaleMotion(), this._host._mutateTimeScale(() => {
      r2 && this._host._timeScale.zoomAtX(t.cx, s2.factor), n2 && this._host._timeScale.setRightOffset(this._host._timeScale.rightOffset - s2.dx / this._host._timeScale.barSpacing);
    }), n2 && 0 !== s2.dy && !this._host._layout._collapsedShown(this._pinchPane) && this._host._panes[this._pinchPane]?.priceScale.panByPixels(s2.dy), this._host._maybeLoadHistory(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emitViewport(r2 ? "zoom" : "pan"));
  }
  _cancelPrimitiveDrag(e) {
    null !== this._dragId && (this._dragMoved = true, this._host._emit("drag:cancel", { id: this._dragId, paneIndex: this._downPane, reason: e }));
  }
  _onKeyDown(e) {
    if (this._unfreezeOverlay(), "Escape" === e.key && this._dragCancelOnEscape && null !== this._dragId && !Fn.shouldIgnore(e.target)) {
      this._cancelPrimitiveDrag("escape"), this._dragId = null, this._dragPriceScale = null, this._dragging = false, this._pointerMoved = true;
      for (const e2 of this._pointers.keys()) this._endedPointers.add(e2);
      return this._pointers.clear(), this._setHover(null), this._host.invalidate((e2) => e2.invalidateGlobal(i.Light)), void e.preventDefault();
    }
    const t = this._host._shortcuts;
    if (null === t || Fn.shouldIgnore(e.target) || !this._shortcutsActive()) return;
    const s2 = t.resolve(e);
    if (null === s2) return;
    if (!this._navigationAllowed(s2)) return;
    let r2 = this._runShortcut(s2);
    r2 || (r2 = t.runCustom(s2)), r2 && (e.preventDefault(), t.emitTrigger(s2), this._host._maybeLoadHistory(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._updateAccessibleSummary());
  }
  _hovered() {
    return !!this._pointerInside && (false !== this._host._container.isConnected || (this._pointerInside = false, false));
  }
  _shortcutsActive() {
    if (null === this._host._shortcuts) return false;
    if ("global" === this._host._shortcuts.scope || this._hovered()) return true;
    const e = this._host._doc.activeElement;
    return null !== e && (e === this._host._container || true === this._host._container.contains?.(e));
  }
  _runShortcut(e) {
    if (!this._navigationAllowed(e)) return false;
    const t = this._host._timeScale, i2 = (e2) => {
      this._host._motion._stopZoomGlide(), this._host._motion._beginAutoscaleMotion();
      const i3 = t.visibleRange();
      return this._host._mutateTimeScale(() => t.setRightOffset(t.rightOffset + e2)), this._host._emitViewportIfMoved(i3), true;
    }, s2 = (e2) => {
      this._host._motion._stopZoomGlide(), this._host._motion._beginAutoscaleMotion();
      const i3 = t.visibleRange();
      return this._host._mutateTimeScale(() => t.zoomAtX(this._host._width / 2, e2)), this._host._emitViewportIfMoved(i3), true;
    };
    switch (e) {
      case "panLeftBar":
        return i2(-1);
      case "panRightBar":
        return i2(1);
      case "panLeft":
        return i2(-2);
      case "panRight":
        return i2(2);
      case "panLeftFast":
        return i2(-10);
      case "panRightFast":
        return i2(10);
      case "panUp":
        return this._host._primaryPane.priceScale.panByPixels(20), true;
      case "panDown":
        return this._host._primaryPane.priceScale.panByPixels(-20), true;
      case "zoomIn":
        return s2(1.1);
      case "zoomOut":
        return s2(1 / 1.1);
      case "resetScale":
        return this._host.resetScale(), true;
      case "fitContent":
        return this._host.fitContent(), true;
      case "screenshot":
        return this._host.downloadScreenshot(), true;
      case "toggleGridVert":
        return this._host.setGridOptions({ vertLines: !this._host._gridVert }), true;
      case "toggleGridHorz":
        return this._host.setGridOptions({ horzLines: !this._host._gridHorz }), true;
      case "toggleCrosshairMagnet":
        return this._host.applyOptions({ crosshairMode: "magnet" === this._host._crosshairMode ? "normal" : "magnet" }), true;
      default:
        return false;
    }
  }
  _setHover(e) {
    const t = e?.externalId ?? null, s2 = e?.hoverKey ?? t;
    if (this._host._container.style.cursor = this._dragging && "pointer" !== e?.cursor ? "grabbing" : e?.cursor ?? "", t === this._hoverId && s2 === this._hoverKey) return;
    const r2 = t !== this._hoverId, n2 = null !== e && "top" !== e.zOrder, o2 = n2 || this._hoverOnBase ? i.Light : i.Cursor;
    this._hoverId = t, this._hoverKey = s2, this._hoverOnBase = n2, this._host.invalidate((e2) => e2.invalidateGlobal(o2)), r2 && this._host._emit("hover", { id: t });
  }
  _updateCursor(e, t, s2, r2, n2) {
    const o2 = this._host._width - this._host._rightAxisWidth, a = t - this._host._leftAxisWidth, l2 = Math.max(0, o2 - this._host._leftAxisWidth);
    if (a < 0 || a > l2) return void this._host._onPointerLeave();
    const h2 = this._host._panes[e], c2 = this._hitAt(e, t, s2);
    if (null === c2 && null !== this._host._layout._dividerAt(r2)) return this._setHover(null), void (this._host._container.style.cursor = "row-resize");
    this._setHover(c2), this._host._feedTimeNav(e !== this._host._timeNavPane || this._brandingHit(e, t, s2) ? null : { x: a, y: s2 });
    let d2 = s2;
    const u2 = Math.round(this._host._timeScale.xToIndex(a));
    let _3 = null;
    if (null !== this._host._firstDataId.value) {
      const t2 = A(this._host._dataLayer, this._host._firstDataId.value, u2);
      if (void 0 !== t2 && (_3 = t2, "magnet" === this._host._crosshairMode && e === this._host._layout._firstPaneSlot())) {
        const e2 = function(e3, t3) {
          const i2 = [t3.open, t3.high, t3.low, t3.close];
          let s3 = i2[0], r3 = Math.abs(e3 - s3);
          for (let t4 = 1; t4 < i2.length; t4++) {
            const n3 = Math.abs(e3 - i2[t4]);
            n3 < r3 && (r3 = n3, s3 = i2[t4]);
          }
          return s3;
        }(h2.yToPrice(s2), _3);
        d2 = h2.priceToY(e2);
      }
    }
    this._cursorPane = e, this._cursor = { x: a, y: d2 }, this._readoutTime = _3?.time ?? null;
    for (const e2 of this._host._indicators) e2.updateLegendValues(u2);
    if (this._host.invalidate((e2) => e2.invalidateGlobal(i.Cursor)), this._crosshairCbs.size > 0 || this._host._bus.has("crosshair:move") || this._host._bus.has("crosshair:readout")) {
      const i2 = { time: this._host._dataLayer.indexToTime(u2) ?? null, index: u2, price: this._priceAt(e, s2), bar: _3, point: { x: t, y: r2 }, paneIndex: e, pressed: this._pointers.size > 0, ...$o(n2), ...this._pointers.size > 0 ? { samples: this._dragSamples(n2) } : {} };
      gn(this._crosshairCbs, i2), this._host._emit("crosshair:readout", i2), this._host._emit("crosshair:move", i2);
    }
  }
  _patchNavigation(e) {
    const t = this._host._navigation.panEnabled, i2 = this._host._navigation.zoomEnabled;
    for (const t2 of ["panEnabled", "zoomEnabled"]) {
      const i3 = Object.getOwnPropertyDescriptor(e, t2);
      i3 && "value" in i3 && "boolean" == typeof i3.value && (this._host._navigation[t2] = i3.value);
    }
    const s2 = false !== t && false === this._host._navigation.panEnabled, r2 = false !== i2 && false === this._host._navigation.zoomEnabled;
    (s2 || r2) && (this._host._motion._stopDisabled(s2, r2), (null !== this._pinch || s2 && this._dragging || r2 && ("price" === this._axisDrag || "time" === this._axisDrag)) && (this._navigationCancelled = true, this._dragging = false, this._axisDrag = null, this._axisDragScale = null, this._pinch = null, this._pointerMoved = true, this._host._dragVelocity = 0, this._setHover(null))), t === this._host._navigation.panEnabled && i2 === this._host._navigation.zoomEnabled || this._syncNavigatorPolicy(), "horizontal" !== e.mousePan && "both" !== e.mousePan || (this._host._navigation.mousePan = e.mousePan);
    const n2 = e.defaultVisibleBars;
    "number" == typeof n2 && Number.isFinite(n2) && n2 >= 0 && (this._host._navigation.defaultVisibleBars = Math.min(1e5, Math.floor(n2)), void 0 === e.defaultBarSpacing && delete this._host._navigation.defaultBarSpacing);
    const o2 = e.defaultBarSpacing;
    "number" == typeof o2 && Number.isFinite(o2) && o2 >= 0 && (0 === o2 ? delete this._host._navigation.defaultBarSpacing : this._host._navigation.defaultBarSpacing = o2);
  }
  _navigationAllowed(e) {
    switch (e) {
      case "panLeftBar":
      case "panRightBar":
      case "panLeft":
      case "panRight":
      case "panLeftFast":
      case "panRightFast":
      case "panUp":
      case "panDown":
        return false !== this._host._navigation.panEnabled;
      case "zoomIn":
      case "zoomOut":
      case "resetScale":
      case "fitContent":
        return false !== this._host._navigation.zoomEnabled;
      default:
        return true;
    }
  }
  _syncNavigatorPolicy() {
    if (null === this._host._timeNav) return;
    if (this._timeNavButtons.every((e2) => null === e2 || this._navigationAllowed(e2))) return void this._host._timeNav.setOptions({ buttons: [...this._timeNavButtons] });
    const e = [];
    let t = false;
    for (const i2 of this._timeNavButtons) null !== i2 ? this._navigationAllowed(i2) && (t && e.length > 0 && e.push(null), e.push(i2), t = false) : t = true;
    this._host._timeNav.setOptions({ buttons: e });
  }
};
var qo = ["up", "down", "collapse", "maximize"];
function Vo(e = [], t) {
  const i2 = e.filter((e2) => !qo.includes(e2));
  return t && i2.splice(i2.includes("close") ? i2.indexOf("close") : i2.length, 0, ...qo), i2;
}
var Ho = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_indicatorLegendToggle", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_indicatorLegendRow", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_legendOffset", { enumerable: true, configurable: true, writable: true, value: { top: 6, left: 8 } }), this._host = e;
  }
  _syncLegendPanes() {
    for (const e of this._host._legends) e.paneIndex = this._host._panes.findIndex((t) => t.hasPrimitive(e.legend));
    this._restackLegends();
  }
  _restackLegends() {
    const e = /* @__PURE__ */ new Map(), t = this._host._primitives._priceCornerIndex(), i2 = this._host._indicators.length, s2 = /* @__PURE__ */ new Map();
    for (const { legend: e2, paneIndex: t2 } of this._host._legends) this._host._studyLegends.has(e2) && !s2.has(t2) && s2.set(t2, e2);
    const r2 = (e2) => s2.get(e2.paneIndex) === e2.legend && this._host._layout._collapsedShown(e2.paneIndex), n2 = new Map(this._host._indicators.map((e2) => [e2.legend(), e2.policy()]));
    let o2 = false;
    for (const a of [...this._host._legends.filter(r2), ...this._host._legends.filter((e2) => !r2(e2))]) {
      let l2 = e.get(a.paneIndex) ?? 0;
      const h2 = this._host._studyLegends.has(a.legend), c2 = h2 && this._host._indicatorLegendCollapsed && !r2(a);
      a.legend.setSuppressed(c2 || l2 > 0 && this._host._layout._collapsedShown(a.paneIndex)), i2 > 0 && a.paneIndex === t && h2 && !o2 && (this._indicatorLegendRow = l2++, o2 = true);
      const d2 = this._host._panes[a.paneIndex], u2 = this._host._collapsed.has(d2);
      if (h2) {
        const e2 = this._host._legendActions.get(a.legend), t2 = a.legend.options().actions, i3 = void 0 === e2 || e2[1] !== t2 ? t2 ?? [] : e2[0], r3 = n2.get(a.legend), o3 = Vo(i3.filter((e3) => !("close" === e3 && false === r3?.removable || "settings" === e3 && false === r3?.configurable)), void 0 !== d2 && d2 !== this._host._primaryPane && s2.get(a.paneIndex) === a.legend);
        a.legend.setOptions({ row: l2, collapsed: u2, actions: o3 }), this._host._legendActions.set(a.legend, [i3, o3]);
      } else a.legend.setOptions({ row: l2 });
      e.set(a.paneIndex, l2 + (c2 || false === a.legend.options().visible ? 0 : 1));
    }
    if (o2 || (this._indicatorLegendRow = e.get(t) ?? 0), i2 > 0 && null === this._indicatorLegendToggle) this._indicatorLegendToggle = new Bo(), this._host.addPrimitive(this._indicatorLegendToggle, { anchor: "primary-pane" });
    else if (0 === i2 && null !== this._indicatorLegendToggle) {
      const e2 = this._indicatorLegendToggle;
      this._indicatorLegendToggle = null, this._host.removePrimitive(e2);
    }
    this._syncLegendOffsets();
  }
  _syncLegendOffsets() {
    const e = this._host._primitives._priceCornerIndex(), t = this._host._primaryIndex(), i2 = wi({ iconSize: this._host._legendIconSize }), s2 = this._legendOffset.top + this._indicatorLegendRow * i2;
    let r2 = s2;
    for (const t2 of this._host._legends) {
      const i3 = t2.legend.options();
      this._host._studyLegends.has(t2.legend) || t2.paneIndex !== e || false === i3.visible || (i3.row ?? 0) >= this._indicatorLegendRow || (r2 = Math.max(r2, (i3.top ?? 6) + ((i3.row ?? 0) + 1) * wi(i3)));
    }
    for (const i3 of this._host._legends) {
      if (!this._host._studyLegends.has(i3.legend)) continue;
      const n2 = i3.paneIndex === e || i3.paneIndex === t;
      i3.legend.setOptions(n2 ? { top: this._legendOffset.top + (this._indicatorLegendToggle ? r2 - s2 : 0), left: this._legendOffset.left } : { top: 6, left: 8 });
    }
    this._indicatorLegendToggle?.setOptions({ count: this._host._indicators.length, collapsed: this._host._indicatorLegendCollapsed, left: this._legendOffset.left, top: r2, height: i2 });
  }
  _handleLegendAction(e) {
    if (e === Eo) return this._host.setIndicatorLegendCollapsed(!this._host._indicatorLegendCollapsed), true;
    const t = e.lastIndexOf("::");
    if (t < 0) return false;
    const s2 = e.slice(t + 2);
    if (null !== this._host._timeNav && e.startsWith(`${this._host._timeNav.options().id}::`)) return this._host._runShortcut(s2) && this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), true;
    if ("row" === s2 && !e.startsWith("indicator:")) return true;
    if (!e.startsWith("indicator:")) return false;
    const r2 = e.slice(10, t);
    if ("row" === s2) return true;
    const n2 = this._host._indicators.find((e2) => e2.id === r2);
    if (void 0 === n2) return false;
    const o2 = n2.paneIndex;
    switch (s2) {
      case "close":
        return this._host.removeIndicator(r2), true;
      case "hide":
        return n2.setVisible(!n2.visible()), true;
      case "up":
        return this._host.movePane(o2, -1), true;
      case "down":
        return this._host.movePane(o2, 1), true;
      case "collapse":
        return this._host.setPaneCollapsed(o2, !this._host.paneCollapsed(o2)), true;
      case "maximize":
        return this._host.maximizePane(o2), true;
      case "settings":
        return false !== n2.policy().configurable && this._host._emit("indicatorSettings", { instanceId: r2, indicatorId: n2.indicatorId, paneIndex: o2 }), true;
      case "source":
        return this._host._emit("indicatorSource", { instanceId: r2, indicatorId: n2.indicatorId, paneIndex: o2 }), true;
      default:
        return false;
    }
  }
  _indicatorLegendHit(e, t, i2) {
    return null !== this._indicatorLegendToggle && true === this._host._panes[e]?.hasPrimitive(this._indicatorLegendToggle) && null !== this._indicatorLegendToggle.hitTest(t - this._host._leftAxisWidth, i2);
  }
};
var Go = class _Go {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_maximizedPane", { enumerable: true, configurable: true, writable: true, value: null }), this._host = e;
  }
  _mappedPane(e) {
    return this._host._ensureScaled(e), this._collapsedShown(e) ? null : this._host._panes[e] ?? null;
  }
  _ensurePane(e) {
    if (!Number.isSafeInteger(e) || e < 0) throw new RangeError("Invalid pane index");
    const t = [];
    for (; this._host._panes.length <= e; ) this._addPane(0 === this._host._panes.length ? 1 : 0.32), t.push(this._host._panes.length - 1);
    if (0 !== t.length) {
      this._relayout(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._primitives._rehomeAnchored();
      for (const e2 of t) this._host._emit("paneAdded", { paneIndex: e2 });
    }
  }
  _addPane(e = 1) {
    const t = new Di(this._host._doc, this._host._newBackend());
    if (t.weight = e, 0 === this._host._panes.length) this._host._pricePanes.add(t), this._host._primaryPane = t;
    else for (const e2 of t.scales()) e2.setOptions({ minPrecision: 2 });
    return t.priceScale.setPriceFormatter(this._host._priceFormatter), this._host._priceScaleOptions && t.priceScale.setOptions(this._host._scales._scalePatchFor(t, this._host._priceScaleOptions)), this._host._panes.push(t), this._host._container.appendChild(t.element), this._host._pixels._observeCanvases(t, true), t;
  }
  _remeasure() {
    if (0 === this._host._panes.length) return;
    const e = this._host._container.clientWidth, t = this._host._container.clientHeight;
    e > 0 && t > 0 && (this._host.applySize(e, t), this._host._paintNow());
  }
  _relayout(e = false) {
    this._measureAxisColumns(), e || (this._host._syncTimeNavPane(), this._host._legendStack._restackLegends());
    const t = this._host._pixelRatio();
    e || (this._host._layoutRatio = t);
    const i2 = this._paneLayout(), s2 = this._bottomPaneIndex();
    this._host._panes.forEach((r2, n2) => {
      const o2 = i2[n2].height;
      e ? r2.setLayoutSize(this._host._width, o2) : (r2.element.style.display = this._layoutWeight(n2) > 0 ? "" : "none", r2.element.style.flex = `0 0 ${o2}px`, r2.resize(this._host._width, o2, t)), r2.setScaleHeights(Math.max(0, o2 - (n2 === s2 ? this._host._timeAxisHeight : 0)));
    }), e || this._syncSeparators(), this._host._timeScale.setWidth(Math.max(0, this._host._width - this._host._rightAxisWidth - this._host._leftAxisWidth));
  }
  _syncSeparators() {
    const e = this._ratioForLayout(), t = this._topPaneIndex();
    this._host._panes.forEach((i2, s2) => i2.setSeparator(s2 === t ? null : this._host._theme.paneSeparator, e));
  }
  _ratioForLayout() {
    return this._host._layoutRatio > 0 ? this._host._layoutRatio : this._host._pixelRatio();
  }
  _recomputeAxisColumns() {
    const e = [this._host._leftAxisWidth, this._host._rightAxisWidth, this._host._axisColumnWidth];
    this._measureAxisColumns(), e[0] === this._host._leftAxisWidth && e[1] === this._host._rightAxisWidth && e[2] === this._host._axisColumnWidth || (this._relayout(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)));
  }
  _measureAxisColumns() {
    let e = 0, t = 0;
    this._host._emptyPriceAxis = !this._host._panes.some((e2) => e2.series().length > 0 || e2.primitives().some((t2) => null !== e2.primitiveScaleId(t2)));
    for (const i2 of this._host._panes) {
      const s2 = i2.visibleAxes(this._host._emptyPriceAxis);
      e = Math.max(e, s2.filter((e2) => "left" === e2.side).length), t = Math.max(t, s2.filter((e2) => "right" === e2.side).length);
    }
    this._host._axisColumnWidth = Math.max(0, Math.min(this._host._priceAxisWidth, this._host._width / (e + t + 1))), this._host._leftAxisWidth = e * this._host._axisColumnWidth, this._host._rightAxisWidth = t * this._host._axisColumnWidth;
  }
  _layoutWeight(e) {
    const t = this._host._panes[e];
    return void 0 === t ? 0 : null === this._maximizedPane ? t.weight : e === this._maximizedPane ? 1 : 0;
  }
  _topPaneIndex() {
    for (let e = 0; e < this._host._panes.length; e++) if (this._layoutWeight(e) > 0) return e;
    return 0;
  }
  _bottomPaneIndex(e = false) {
    for (let t = this._host._panes.length - 1; t >= 0; t--) if (this._layoutWeight(t) > 0 && (!e || !this._collapsedShown(t))) return t;
    return this._host._panes.length - 1;
  }
  _collapsedShown(e) {
    return null === this._maximizedPane && this._host._collapsed.has(this._host._panes[e]);
  }
  _dividerAt(e) {
    const t = this._paneLayout(), i2 = (e2) => this._layoutWeight(e2) > 0 && !this._collapsedShown(e2);
    for (let s2 = 0; s2 < t.length - 1; s2++) {
      if (Math.abs(e - t[s2].top - t[s2].height) > _Go.DIVIDER_GRAB) continue;
      let r2 = s2, n2 = s2 + 1;
      for (; r2 >= 0 && !i2(r2); ) r2--;
      for (; n2 < t.length && !i2(n2); ) n2++;
      if (r2 >= 0 && n2 < t.length) return [r2, n2];
    }
    return null;
  }
  removePane(e, t) {
    if (!Number.isInteger(e) || e < 0 || e >= this._host._panes.length || this._host._panes[e] === this._host._primaryPane) return false;
    if (this._host._indicators.some((i2) => i2.paneIndex === e && !this._host._policyAllows(i2, "removable", t))) return false;
    if (this._host._eventPane === e) {
      const e2 = this._host._primaryIndex();
      null !== this._host._eventMarkers && (this._host.removePrimitive(this._host._eventMarkers), this._host._primitives._addPrimitive(e2, this._host._eventMarkers), this._host._emit("events:change", void 0)), this._host._eventPane = e2;
    }
    this._host._eventPane > e && (this._host._eventPane -= 1);
    for (let t2 = this._host._indicators.length - 1; t2 >= 0; t2--) {
      if (this._host._indicators[t2].paneIndex !== e) continue;
      const [i2] = this._host._indicators.splice(t2, 1);
      i2.remove({ force: true });
    }
    const s2 = this._host._panes[e];
    for (const e2 of [...s2.series()]) s2.removeSeries(e2), this._host._dataLayer.removeSeries(e2.dataId), this._host._seriesProvenance.delete(e2.dataId), this._host._firstDataId.value === e2.dataId && (this._host._firstDataId.value = null);
    this._host._pixels._observeCanvases(s2, false), s2.destroy(), this._host._panes.splice(e, 1), null !== this._maximizedPane && (this._maximizedPane === e ? this._maximizedPane = null : this._maximizedPane > e && (this._maximizedPane -= 1));
    for (const t2 of this._host._indicators) t2.paneIndex > e && t2.shiftPane(-1);
    return this._host._timeScale.setBaseIndex(this._host._dataLayer.baseIndex), this._recomputeAxisColumns(), this._relayout(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._primitives._rehomeAnchored(), this._host._legendStack._syncLegendPanes(), this._remapSavedDrawings((t2) => t2 === e ? null : t2 > e ? t2 - 1 : t2), this._host._emit("paneRemoved", { paneIndex: e }), true;
  }
  _remapSavedDrawings(e) {
    const t = this._host._drawingState, i2 = Array.isArray(t) ? t : Array.isArray(t?.drawings) ? t.drawings : null;
    if (null === i2) return;
    const s2 = i2.flatMap((t2) => {
      const i3 = t2?.paneIndex ?? 0;
      if ("object" != typeof t2 || null === t2 || !Number.isInteger(i3)) return [t2];
      const s3 = e(i3);
      return null === s3 ? [] : s3 === i3 ? [t2] : [{ ...t2, paneIndex: s3 }];
    });
    this._host._drawingState = Array.isArray(t) ? s2 : { ...t, drawings: s2 };
  }
  movePane(e, t) {
    const s2 = e + t;
    if (-1 !== t && 1 !== t || !Number.isInteger(e) || e < 0 || s2 < 0 || e >= this._host._panes.length || s2 >= this._host._panes.length) return false;
    const r2 = this._host._panes;
    if (!this._host._movablePrimaryPane && (r2[e] === this._host._primaryPane || r2[s2] === this._host._primaryPane)) return false;
    this._remapSavedDrawings((t2) => t2 === e ? s2 : t2 === s2 ? e : t2), [r2[e], r2[s2]] = [r2[s2], r2[e]], this._host._eventPane === e ? this._host._eventPane = s2 : this._host._eventPane === s2 && (this._host._eventPane = e), null !== this._host._eventMarkers && this._host._emit("events:change", void 0), this._maximizedPane === e ? this._maximizedPane = s2 : this._maximizedPane === s2 && (this._maximizedPane = e);
    for (const i2 of this._host._indicators) i2.paneIndex === e ? i2.shiftPane(t) : i2.paneIndex === s2 && i2.shiftPane(-t);
    for (const e2 of r2) this._host._container.appendChild(e2.element);
    return this._relayout(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._primitives._rehomeAnchored(), this._host._legendStack._syncLegendPanes(), this._host._emit("paneMoved", { from: e, to: s2 }), true;
  }
  setPrimaryPaneIndex(e) {
    if (this._host._destroyed || !this._host._movablePrimaryPane || !Number.isInteger(e) || e < 0 || e >= this._host._panes.length) return false;
    let t = this._host._primaryIndex();
    if (t === e) return false;
    for (let i2 = 0; t !== e; i2++) {
      if (i2 > 2 * this._host._panes.length || !this._host.movePane(t, e > t ? 1 : -1)) return false;
      t = this._host._primaryIndex();
    }
    return true;
  }
  _firstPaneSlot() {
    const e = null === this._host._firstPane ? -1 : this._host._panes.indexOf(this._host._firstPane);
    return e < 0 ? this._host._primaryIndex() : e;
  }
  maximizePane(e) {
    return !(!Number.isInteger(e) || e < 0 || e >= this._host._panes.length) && (this._maximizedPane = this._maximizedPane === e ? null : e, this._relayout(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._primitives._rehomeAnchored(), this._host._emit("paneMaximized", { paneIndex: this._maximizedPane }), true);
  }
  _holdsOnlyFurniture(e) {
    return e !== this._host._primaryPane && 0 === e.series().length && e.primitives().every((e2) => e2 === this._host._timeNav || this._host._anchored.some((t) => t.primitive === e2));
  }
  setPaneCollapsed(e, t) {
    const s2 = this._host._panes[e];
    if (!Number.isInteger(e) || void 0 === s2 || s2 === this._host._primaryPane || "boolean" != typeof t || this._host._collapsed.has(s2) === t) return false;
    t ? this._host._collapsed.add(s2) : this._host._collapsed.delete(s2);
    const r2 = t && this._maximizedPane === e;
    return r2 && (this._maximizedPane = null), this._relayout(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._primitives._rehomeAnchored(), r2 && this._host._emit("paneMaximized", { paneIndex: null }), this._host._emit("paneCollapsed", { paneIndex: e, collapsed: t }), true;
  }
  _paneLayout() {
    return function(e, t) {
      const i2 = e[e.length - 1];
      if (!(t > 0 && Number.isFinite(t) && void 0 !== i2)) return e.map((e2) => ({ ...e2 }));
      const s2 = i2.top + i2.height;
      let r2 = e[0].top;
      return e.map((i3, n2) => {
        const o2 = n2 === e.length - 1 ? s2 : Math.round((i3.top + i3.height) * t) / t, a = { top: r2, height: Math.max(0, o2 - r2) };
        return r2 = Math.max(r2, o2), a;
      });
    }(this._paneShares(), this._ratioForLayout());
  }
  _paneShares() {
    const e = this._bottomPaneIndex(), t = wi({ iconSize: this._host._legendIconSize }) + 12, i2 = this._host._panes.map((i3, s3) => this._collapsedShown(s3) ? t + (s3 === e ? this._host._timeAxisHeight : 0) : 0);
    let s2 = 0, r2 = 0;
    i2.forEach((e2, t2) => {
      s2 += e2, e2 || (r2 += this._layoutWeight(t2));
    });
    const n2 = s2 > this._host._height ? this._host._height / s2 : 1, o2 = Math.max(0, this._host._height - s2);
    let a = 0;
    return i2.map((e2, t2) => {
      const i3 = { top: a, height: e2 ? e2 * n2 : r2 > 0 ? o2 * this._layoutWeight(t2) / r2 : 0 };
      return a += i3.height, i3;
    });
  }
};
Object.defineProperty(Go, "DIVIDER_GRAB", { enumerable: true, configurable: true, writable: true, value: 4 });
var Uo = /* @__PURE__ */ new Map();
function Ko(e) {
  const t = Uo.get(e);
  if (void 0 === t) throw new Error(`openalgo-charts: unknown series transform "${e}"; import 'openalgo-charts/transform' first`);
  return t;
}
function Jo(e) {
  if ("open" in e) return e;
  if ("value" in e) {
    const t = e.value, i2 = { time: e.time, open: t, high: t, low: t, close: t };
    return void 0 !== e.color && (i2.color = e.color), i2;
  }
  return { time: e.time, open: NaN, high: NaN, low: NaN, close: NaN };
}
var Zo = (e) => void 0 === e.options ? { type: e.type } : { type: e.type, options: { ...e.options } };
var Qo = null;
var ea = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_transforms", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), this._host = e;
  }
  _setSeriesType(e, t, s2) {
    if (null === this._host.seriesType(e)) return false;
    const r2 = this._host._seriesRecords.get(e), n2 = this._host._seriesOwners.get(e), o2 = Ae(t);
    if (r2.type === t) return false;
    const a = r2.style.precision, l2 = { ...r2.style };
    for (const e2 of Object.keys(n2.inheritedStyle)) l2[e2] === n2.inheritedStyle[e2] && delete l2[e2];
    const h2 = {};
    for (const e2 of Object.keys(o2.defaultStyle)) Object.prototype.hasOwnProperty.call(l2, e2) || Object.assign(h2, { [e2]: o2.defaultStyle[e2] });
    for (const e2 of Object.keys(r2.style)) delete r2.style[e2];
    if (Object.assign(r2.style, h2, l2), n2.inheritedStyle = h2, r2.type = t, r2.style.precision !== a) {
      const e2 = n2.pane.scaleOf(r2);
      this._applyPrecision(e2, r2.style.precision), void 0 === r2.style.precision && this._applySeriesPriceFormat(e2, n2.priceFormat);
    }
    return this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), s2 && this._host._emit("objects:change", {}), true;
  }
  _setSeriesTransform(e, t, i2) {
    return null !== this._host.seriesType(e) && (null !== Qo ? Qo.set(this, e, t, i2) : (null !== t && this._newTransform(t), false));
  }
  _seriesTransform(e) {
    const t = null === this._host.seriesType(e) ? void 0 : this._transforms.get(this._host._seriesRecords.get(e).dataId)?.spec;
    return void 0 === t ? null : Zo(t);
  }
  _transformOf(e) {
    const t = this._transforms.get(e)?.spec;
    return void 0 === t ? void 0 : Zo(t);
  }
  _underlying(e) {
    const t = null === e ? void 0 : this._transforms.get(e)?.run;
    return void 0 === t ? null : { bars: t.source(), sourceIndex: t.sourceIndex() };
  }
  _newTransform(e) {
    const t = { ...e.options }, i2 = Ko(e.type).create(t);
    return { spec: Object.keys(t).length > 0 ? { type: e.type, options: t } : { type: e.type }, run: i2 };
  }
  _createSeries(e, t, s2, r2) {
    const n2 = void 0 === t.transform ? void 0 : this._newTransform(t.transform), o2 = t.paneIndex ?? this._host._primaryIndex();
    this._host._layout._ensurePane(o2);
    const a = this._host._dataLayer.createSeries();
    void 0 !== n2 && this._transforms.set(a, n2);
    const l2 = new Qi(a);
    this._host._seriesProvenance.set(a, l2);
    const h2 = function(e2, t2, i2, s3 = "right") {
      return { dataId: e2, type: t2, style: { ...Ae(t2).defaultStyle, ...i2 }, scaleId: s3 };
    }(a, e, t.style, t.priceScaleId ?? "right");
    s2 && Ae(e).isPriceSeries && this._host._scales._claimPricePane(this._host._panes[o2]);
    const c2 = s2 && null === this._host._firstDataId.value && Ae(e).isPriceSeries;
    c2 && (this._host._firstDataId.value = a, this._host._firstPane = this._host._panes[o2]), this._host._panes[o2].addSeries(h2), this._host._layout._recomputeAxisColumns();
    const d2 = { ...Ae(e).defaultStyle };
    for (const e2 of Object.keys(t.style ?? {})) delete d2[e2];
    const u2 = { pane: this._host._panes[o2], priceFormat: t.priceFormat, inheritedStyle: d2, indicatorOwned: !s2 }, _3 = u2.pane.scaleOf(h2), p2 = true === r2?.get(u2.pane)?.has(h2.scaleId);
    this._applySeriesPriceFormat(_3, t.priceFormat, p2), p2 || void 0 === h2.style.precision || this._applyPrecision(_3, h2.style.precision);
    const f2 = { setData: (e2, t2) => {
      const i2 = this._transforms.get(a)?.run;
      i2?.setData(e2.map(Jo)), this._setData(a, i2?.elements() ?? e2.map(Jo), t2, u2);
    }, prependData: (e2) => this._prependData(a, e2.map(Jo)), update: (e2, t2) => this._updateBar(a, Jo(e2), t2, u2), getData: () => this._transforms.get(a)?.run.source().slice() ?? this._host._dataLayer.indexedBars(a).map((e2) => e2.bar), applyOptions: (e2) => {
      for (const t2 of Object.keys(e2)) delete u2.inheritedStyle[t2];
      Object.assign(h2.style, e2), "precision" in e2 && this._applyPrecision(u2.pane.scaleOf(h2), e2.precision), this._host.invalidate((e3) => e3.invalidateGlobal(i.Full)), this._host._primary?.record === h2 && this._host._emit("objects:change", {});
    }, remove: () => {
      const e2 = this._host._primary?.record === h2;
      u2.pane.removeSeries(h2), this._host._dataLayer.removeSeries(a), this._host._seriesProvenance.delete(a), this._transforms.delete(a), this._host._firstDataId.value === a && (this._host._firstDataId.value = null), this._host._primary?.record === h2 && (this._host._primary = null, u2.pane.setSourceSeries(null)), u2.indicatorOwned || this._host._studies._reconcileIndicatorRanges(), this._host._timeScale.setBaseIndex(this._host._dataLayer.baseIndex), this._host._layout._recomputeAxisColumns(), this._host.invalidate((e3) => e3.invalidateGlobal(i.Full)), e2 && (this._host._emit("data:update", { kind: "reset" }), this._host._emit("objects:change", {}));
    }, priceScale: () => u2.pane.scaleOf(h2), createMarkers: (e2) => {
      const t2 = new ir(a, e2, () => u2.pane.scaleOf(h2));
      return this._host._primitives._addPrimitive(this._host._panes.indexOf(u2.pane), t2), t2;
    } };
    var m2, b2;
    return this._host._seriesRecords.set(f2, h2), m2 = f2, b2 = l2, es.set(m2, b2), this._host._seriesOwners.set(f2, u2), u2.indicatorOwned || this._host._studies._reconcileIndicatorRanges(), c2 && (this._host._primary = { api: f2, record: h2 }, this._host._panes[o2].setSourceSeries(h2), void 0 !== this._host._sourceAbove && this._host._primitives._placeSource(), this._host._emit("objects:change", {})), f2;
  }
  _applySeriesPriceFormat(e, t, i2 = false) {
    if (t) if ("custom" === t.type) i2 || e.setPriceFormatter(t.formatter);
    else if ("volume" === t.type) i2 || e.setPriceFormatter(Ki);
    else if ("percent" === t.type) {
      const s2 = t.precision ?? 2;
      i2 || e.setPriceFormatter((e2) => `${e2.toFixed(s2)}%`);
    } else {
      i2 || e.setPriceFormatter(this._host._priceFormatter);
      const s2 = t.minMove ?? (void 0 !== t.precision ? Math.pow(10, -t.precision) : void 0);
      void 0 !== s2 && e.setOptions({ minMove: s2 });
    }
  }
  _applyPrecision(e, t) {
    if (void 0 === t || !isFinite(t)) return void e.setPriceFormatter(this._host._priceFormatter);
    const i2 = o(Math.round(t), 0, 8);
    e.setPriceFormatter((e2) => e2.toFixed(i2));
  }
  _sharedAxis() {
    const e = this._host._dataLayer, t = this._host._timeScale;
    return [e.length, e.indexToTime(0) ?? 0, e.indexToTime(e.baseIndex) ?? 0, t.visibleRange().to, t.barSpacing, t.width];
  }
  _invalidateWrite(e, t) {
    const s2 = this._sharedAxis(), r2 = [...e].map((e2) => this._host._panes.indexOf(e2));
    if (r2.includes(-1) || s2.some((e2, i2) => e2 !== t[i2])) return void this._host.invalidate((e2) => e2.invalidateGlobal(i.Full));
    if (0 === r2.length) return;
    const n2 = this._clockedPanes();
    this._host.invalidate((e2) => {
      for (const t2 of r2) e2.invalidatePane(t2, { level: i.Full, autoScale: true });
      for (const t2 of n2) e2.invalidatePane(t2, { level: i.Light, autoScale: false });
    });
  }
  _clockedPanes() {
    const e = this._host._axisChrome, t = [];
    return true === e.barCountdown && this._host._panes.forEach((e2, i2) => {
      e2.series().some((e3) => false !== e3.style.visible && Ae(e3.type).isPriceSeries) && t.push(i2);
    }), e.sessionClock && t.push(this._host._bottomPaneIndex()), t;
  }
  _updateBar(e, t, i2, s2) {
    Zi(i2, true);
    const r2 = this._transforms.get(e)?.run;
    if (void 0 !== r2) return void Qo.tick(this, e, r2, t, i2, s2);
    const n2 = this._sharedAxis(), o2 = this._host._dataLayer.seriesBars(e), a = o2[o2.length - 1]?.time, l2 = void 0 === a || t.time > a ? "append" : t.time === a ? "replace" : "correction", h2 = this._host._timeScale.rightOffset >= 0, c2 = this._host._dataLayer.update(e, t);
    this._host._seriesProvenance.get(e)?.record(l2, Math.max(a ?? t.time, t.time), i2), this._host._timeScale.setBaseIndex(this._host._dataLayer.baseIndex), "append" !== c2 || h2 || this._host._mutateTimeScale(() => this._host._timeScale.setRightOffset(this._host._timeScale.rightOffset - 1)), e === this._host._firstDataId.value && this._host._studies._invalidateIndicators(), this._invalidateWrite([s2.pane], n2), this._host._updateAccessibleSummary(), e === this._host._firstDataId.value && this._host._emit("data:update", { kind: "update", time: t.time });
  }
  _setData(e, t, s2, r2) {
    Zi(s2);
    const n2 = this._sharedAxis();
    e === this._host._firstDataId.value && this._host._motion._stopNavigationMotion(), this._host._dataLayer.setSeriesData(e, t);
    const o2 = this._host._dataLayer.seriesBars(e);
    this._host._seriesProvenance.get(e)?.record("reset", o2[o2.length - 1]?.time, s2), e === this._host._firstDataId.value && (this._host._studies._invalidateIndicators(), this._host._studies._flushIndicators()), this._host._timeScale.setBaseIndex(this._host._dataLayer.baseIndex), !this._host._hasFitContent && this._host._dataLayer.length > 0 && (this._host._timeScale.setWidth(Math.max(0, this._host._width - this._host._rightAxisWidth - this._host._leftAxisWidth)), this._host._hasFitContent = this._host._fitDefaultView()), r2.indicatorOwned ? this._invalidateWrite([r2.pane], n2) : this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._updateAccessibleSummary(), e === this._host._firstDataId.value && this._host._emit("data:update", { kind: "reset" });
  }
  _prependData(e, t) {
    const s2 = this._transforms.get(e)?.run;
    s2?.prepend(t), void 0 === s2 ? this._host._dataLayer.addBars(e, t) : this._host._dataLayer.setSeriesData(e, s2.elements());
    const r2 = this._host._dataLayer.seriesBars(e);
    this._host._seriesProvenance.get(e)?.record("prepend", r2[r2.length - 1]?.time), this._host._timeScale.setBaseIndex(this._host._dataLayer.baseIndex), e === this._host._firstDataId.value && this._host._studies._invalidateIndicators(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._updateAccessibleSummary(), e === this._host._firstDataId.value && this._host._emit("data:update", { kind: "prepend" });
  }
};
var ta = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), this._host = e;
  }
  _scalePatchFor(e, t) {
    if (void 0 === t.minMove || this._host._pricePanes.has(e)) return t;
    const i2 = { ...t };
    return delete i2.minMove, i2.minPrecision = 2, i2;
  }
  _claimPricePane(e) {
    if (this._host._pricePanes.has(e)) return;
    this._host._pricePanes.add(e);
    const t = this._host._priceScaleOptions?.minMove;
    for (const i2 of e.axisScales()) i2.setOptions(void 0 !== t ? { minMove: t, minPrecision: 0 } : { minPrecision: 0 });
  }
  priceAxisState(e, t) {
    const i2 = this._host._panes[e];
    if (void 0 === i2 || !N(t)) return null;
    const s2 = i2.scaleFor(t), r2 = "left" === t ? "right" : "left";
    return { paneIndex: e, scaleId: t, side: "left" === i2.axisPlacement(t).side ? "left" : "right", active: i2.usesScale(t), autoFit: s2.autoScale, inverted: s2.options.inverted, mode: s2.options.mode, scaled: s2.scaled, lockRatio: i2.ratioLocked(t), movable: ("right" === t || "left" === t) && this._canMovePriceAxis(e, t, r2) };
  }
  _canMovePriceAxis(e, t, i2) {
    const s2 = this._host._panes[e];
    if (!s2 || t === i2 || !s2.usesScale(t) || s2.usesScale(i2)) return false;
    for (const e2 of this._host._indicators) {
      const i3 = e2.renderResources(), r2 = i3.series.filter((e3) => this._host._seriesOwners.get(e3.api)?.pane === s2), n2 = i3.primitives.filter((e3) => s2.hasPrimitive(e3.primitive) && null !== s2.primitiveScaleId(e3.primitive)), o2 = r2.filter((e3) => this._host._seriesRecords.get(e3.api)?.scaleId === t), a = n2.filter((e3) => s2.primitiveScaleId(e3.primitive) === t);
      if (o2.length || a.length) {
        if (o2.some((e3) => e3.overlay) || a.some((e3) => e3.overlay)) return false;
        if (r2.some((e3) => !e3.overlay && this._host._seriesRecords.get(e3.api)?.scaleId !== t) || n2.some((e3) => !e3.overlay && s2.primitiveScaleId(e3.primitive) !== t)) return false;
      }
    }
    return true;
  }
  _ensureScaledFor(e, t) {
    const i2 = this._host._panes[e];
    void 0 === i2 || i2.scaleFor(t).scaled || i2.autoscale(this._host._renderContext(e));
  }
};
var ia = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_eventVisible", { enumerable: true, configurable: true, writable: true, value: {} }), this._host = e;
  }
  setEvents(e, t) {
    const i2 = this._ensureEventMarkers();
    i2.setEvents(e), this._host._events = i2.events();
    const s2 = t ?? this._host._primaryIndex();
    s2 !== this._host._eventPane && (this._host.removePrimitive(i2), this._addPrimitive(s2, i2)), this._host._eventPane = s2, this._syncEvents();
  }
  _ensureEventMarkers() {
    return null === this._host._eventMarkers && (this._host._eventMarkers = new to(), this._host._eventPane = this._host._primaryIndex(), this._addPrimitive(this._host._eventPane, this._host._eventMarkers), this._host.on("click", (e) => {
      const t = e;
      if (!t.id || t.viaDrag || t.paneIndex !== this._host._eventPane) return;
      const i2 = this._host._eventMarkers?.detailsForHit(t.id);
      i2 && this._host._emit("event:click", { ...i2, point: { x: t.point.x, y: t.point.y + (this._host._paneLayout()[t.paneIndex]?.top ?? 0) }, paneIndex: t.paneIndex });
    })), this._host._eventMarkers;
  }
  _syncEvents() {
    if (null === this._host._eventMarkers && 0 === this._host._events.length) return;
    const e = this._eventVisible;
    this._ensureEventMarkers().setEvents(this._host._events.filter((t) => false !== e[t.type])), this._host._emit("events:change", void 0);
  }
  seriesStack(e) {
    const t = this._host._panes[e];
    if (void 0 === t) return [];
    const i2 = this._stackOwners(t, e), s2 = [];
    for (const e2 of t.series()) {
      const t2 = i2.get(e2);
      void 0 === t2 || s2.includes(t2) || s2.push(t2);
    }
    return s2;
  }
  moveInSeriesStack(e, t, s2, r2) {
    if (this._host.isDestroyed || e === t || "above" !== s2 && "below" !== s2) return false;
    const n2 = e.startsWith("indicator:") ? this._host._indicators.find((t2) => "indicator:" + t2.id === e) : void 0, o2 = "source:primary" === e && null !== this._host._primary ? this._host._seriesOwners.get(this._host._primary.api)?.pane : void 0, a = n2 ? n2.paneIndex : o2 ? this._host._panes.indexOf(o2) : -1, l2 = a < 0 ? [] : this._host.seriesStack(a);
    if (!l2.includes(e) || !l2.includes(t) || n2 && !this._host._policyAllows(n2, "movable", r2)) return false;
    const h2 = l2.filter((t2) => t2 !== e);
    if (h2.splice(h2.indexOf(t) + ("above" === s2 ? 1 : 0), 0, e), h2.every((e2, t2) => e2 === l2[t2])) return false;
    const c2 = h2.flatMap((e2) => this._host._indicators.filter((t2) => "indicator:" + t2.id === e2)), d2 = new Set(c2);
    let u2 = 0;
    for (let e2 = 0; e2 < this._host._indicators.length; e2++) d2.has(this._host._indicators[e2]) && (this._host._indicators[e2] = c2[u2++]);
    const _3 = h2.indexOf("source:primary");
    return _3 >= 0 && (this._host._sourceAbove = 0 === _3 ? null : h2[_3 - 1].slice(10)), this._host._studies._reorderIndicatorResources(), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._host._emit("objects:change", {}), true;
  }
  setPrimitiveStackAbove(e, t) {
    const s2 = this._host._panes.findIndex((t2) => t2.hasPrimitive(e));
    return !(s2 < 0 || null !== t && "string" != typeof t) && (this._host._panes[s2].primitiveStackAbove(e) === t || (this._host._panes[s2].setPrimitiveStackAbove(e, t), this._host.invalidate((e2) => e2.invalidatePane(s2, { level: i.Light, autoScale: false }))), true);
  }
  _stackOwners(e, t) {
    const i2 = /* @__PURE__ */ new Map();
    null !== this._host._primary && this._host._seriesOwners.get(this._host._primary.api)?.pane === e && i2.set(this._host._primary.record, "source:primary");
    for (const s2 of this._host._indicators) if (s2.paneIndex === t) for (const { api: t2 } of s2.renderResources().series) {
      const r2 = this._host._seriesRecords.get(t2);
      void 0 !== r2 && this._host._seriesOwners.get(t2)?.pane === e && i2.set(r2, "indicator:" + s2.id);
    }
    return i2;
  }
  _stackSlot(e, t) {
    const i2 = this._host._panes[e];
    if (void 0 === i2) return;
    const s2 = this._stackOwners(i2, e);
    let r2;
    for (const e2 of i2.series()) s2.get(e2) === t && (r2 = e2);
    return r2;
  }
  _placeSource() {
    const e = this._host._sourceAbove, t = null === this._host._primary ? void 0 : this._host._seriesOwners.get(this._host._primary.api);
    if (void 0 === e || void 0 === t) return;
    const i2 = t.pane, s2 = this._host._panes.indexOf(i2), r2 = this._host._primary.record, n2 = this._stackOwners(i2, s2);
    n2.delete(r2);
    const o2 = i2.series(), a = o2.indexOf(r2), l2 = null === e ? void 0 : this._stackSlot(s2, "indicator:" + e);
    void 0 === l2 && (this._host._sourceAbove = null);
    const h2 = void 0 === l2 ? -1 : o2.indexOf(l2), c2 = o2.findIndex((e2, t2) => t2 > h2 && e2 !== r2 && n2.has(e2));
    a > h2 && (c2 < 0 || a < c2) || i2.moveSeries(r2, void 0 === l2 ? o2[c2] : o2[h2 + 1] ?? null);
  }
  _reanchorSource() {
    const e = null === this._host._primary ? void 0 : this._host._seriesOwners.get(this._host._primary.api)?.pane;
    if ("string" != typeof this._host._sourceAbove || void 0 === e) return;
    const t = this._host.seriesStack(this._host._panes.indexOf(e)), i2 = t.indexOf("source:primary");
    this._host._sourceAbove = i2 > 0 ? t[i2 - 1].slice(10) : null;
  }
  _anchorTarget(e) {
    return "chart-bottom" === e ? this._host._bottomPaneIndex(true) : "primary-pane" === e ? this._priceCornerIndex() : this._host._layout._topPaneIndex();
  }
  _priceCornerIndex() {
    const e = this._host._primaryIndex();
    return this._host._layout._layoutWeight(e) > 0 ? e : this._host._layout._topPaneIndex();
  }
  _rehomeAnchored() {
    if (0 !== this._host._anchored.length) for (const e of this._host._anchored) {
      const t = this._anchorTarget(e.anchor), i2 = this._host._panes.findIndex((t2) => t2.hasPrimitive(e.primitive));
      if (i2 === t) continue;
      i2 >= 0 && this._host._panes[i2].removePrimitive(e.primitive);
      const s2 = this._host._legends.findIndex((t2) => t2.legend === e.primitive);
      s2 >= 0 && this._host._legends.splice(s2, 1), this._addPrimitive(t, e.primitive);
    }
  }
  _addPrimitive(e, t) {
    this._host._layout._ensurePane(e);
    const s2 = { requestUpdate: () => {
      const e2 = this._host._panes.findIndex((e3) => e3.hasPrimitive(t)), s3 = "top" === t.zOrder() && null == this._host._panes[e2]?.primitiveStackAbove(t);
      this._host.invalidate((t2) => t2.invalidatePane(e2, { level: s3 ? i.Cursor : i.Light, autoScale: false }));
    } };
    if (this._host._panes[e].addPrimitive(t, s2), t instanceof Ii) {
      if (this._host._legends.push({ legend: t, paneIndex: e }), t.setOptions({ hasOpenInterest: this._host.hasOpenInterest }), Object.keys(this._host._statusLine).length > 0) {
        const e2 = t.options().statusLine;
        t.setOptions({ statusLine: { ...this._host._statusLine, ...e2 } });
      }
      void 0 !== this._host._legendIconSize && t.setOptions({ iconSize: this._host._legendIconSize }), this._host._legendStack._restackLegends();
    }
    this._host.invalidate((t2) => t2.invalidatePane(e, { level: i.Light, autoScale: false }));
  }
  removePrimitive(e) {
    const t = this._host._anchored.findIndex((t2) => t2.primitive === e);
    t >= 0 && this._host._anchored.splice(t, 1);
    const s2 = this._host._legends.findIndex((t2) => t2.legend === e);
    s2 >= 0 && this._host._legends.splice(s2, 1);
    for (let t2 = 0; t2 < this._host._panes.length; t2++) if (this._host._panes[t2].removePrimitive(e)) return s2 >= 0 && this._host._legendStack._restackLegends(), this._host._layout._recomputeAxisColumns(), void this._host.invalidate((e2) => e2.invalidatePane(t2, { level: i.Light, autoScale: false }));
  }
};
var sa = class {
  constructor(e, t, i2, s2, r2) {
    Object.defineProperty(this, "id", { enumerable: true, configurable: true, writable: true, value: e }), Object.defineProperty(this, "x0", { enumerable: true, configurable: true, writable: true, value: t }), Object.defineProperty(this, "y0", { enumerable: true, configurable: true, writable: true, value: i2 }), Object.defineProperty(this, "x1", { enumerable: true, configurable: true, writable: true, value: s2 }), Object.defineProperty(this, "y1", { enumerable: true, configurable: true, writable: true, value: r2 }), Object.defineProperty(this, "stops", { enumerable: true, configurable: true, writable: true, value: [] });
  }
  addColorStop(e, t) {
    this.stops.push({ offset: e, color: t });
  }
  toString() {
    return `url(#${this.id})`;
  }
};
var ra = 2 * Math.PI;
function na(e) {
  if (!Number.isFinite(e)) return "0";
  const t = 100 * e, i2 = Number.isFinite(t) ? Math.round(t) / 100 : e;
  return String(0 === i2 ? 0 : i2);
}
function oa(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function aa(e) {
  return /[ .,:;'|!iIljtfr[\]()-]/.test(e) ? 0.3 : /[mwMW@%]/.test(e) ? 0.9 : /[A-Z]/.test(e) ? 0.68 : 0.55;
}
function la(e) {
  const t = e.trim().split(/\s+/);
  let i2 = null, s2 = null, r2 = 10, n2 = 0;
  for (; n2 < t.length; n2++) {
    const e2 = t[n2], o2 = /^(\d+(?:\.\d+)?)(px|pt)(?:\/\S+)?$/.exec(e2);
    if (null !== o2) {
      r2 = parseFloat(o2[1]) * ("pt" === o2[2] ? 4 / 3 : 1), n2++;
      break;
    }
    "italic" === e2 || "oblique" === e2 ? s2 = e2 : /^(\d{3}|bold|bolder|lighter)$/.test(e2) && (i2 = e2);
  }
  return { size: r2, family: t.slice(n2).join(" ") || "sans-serif", weight: i2, style: s2 };
}
var ha = { top: "text-before-edge", hanging: "hanging", middle: "central", ideographic: "ideographic", bottom: "text-after-edge" };
var ca = { center: "middle", right: "end", end: "end" };
var da = class {
  constructor(e, t, i2 = {}) {
    Object.defineProperty(this, "width", { enumerable: true, configurable: true, writable: true, value: e }), Object.defineProperty(this, "height", { enumerable: true, configurable: true, writable: true, value: t }), Object.defineProperty(this, "fillStyle", { enumerable: true, configurable: true, writable: true, value: "#000" }), Object.defineProperty(this, "strokeStyle", { enumerable: true, configurable: true, writable: true, value: "#000" }), Object.defineProperty(this, "lineWidth", { enumerable: true, configurable: true, writable: true, value: 1 }), Object.defineProperty(this, "lineCap", { enumerable: true, configurable: true, writable: true, value: "butt" }), Object.defineProperty(this, "lineJoin", { enumerable: true, configurable: true, writable: true, value: "miter" }), Object.defineProperty(this, "miterLimit", { enumerable: true, configurable: true, writable: true, value: 10 }), Object.defineProperty(this, "globalAlpha", { enumerable: true, configurable: true, writable: true, value: 1 }), Object.defineProperty(this, "font", { enumerable: true, configurable: true, writable: true, value: "10px sans-serif" }), Object.defineProperty(this, "textAlign", { enumerable: true, configurable: true, writable: true, value: "start" }), Object.defineProperty(this, "textBaseline", { enumerable: true, configurable: true, writable: true, value: "alphabetic" }), Object.defineProperty(this, "shadowColor", { enumerable: true, configurable: true, writable: true, value: "rgba(0, 0, 0, 0)" }), Object.defineProperty(this, "shadowBlur", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "shadowOffsetX", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "shadowOffsetY", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "globalCompositeOperation", { enumerable: true, configurable: true, writable: true, value: "source-over" }), Object.defineProperty(this, "imageSmoothingEnabled", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "canvas", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "unsupported", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_out", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_frames", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_gradients", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_clips", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_rootOpen", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_path", { enumerable: true, configurable: true, writable: true, value: "" }), Object.defineProperty(this, "_hasPoint", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_dash", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "lineDashOffset", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_ids", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_strict", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_background", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_fontCache", { enumerable: true, configurable: true, writable: true, value: null }), this._strict = true === i2.strict, this._background = i2.background;
  }
  asCanvasContext() {
    return this;
  }
  save() {
    this._frames.push({ kind: "save", open: 0, state: this._snapshot() });
  }
  restore() {
    let e = this._frames.length - 1;
    for (; e >= 0 && "save" !== this._frames[e].kind; ) e--;
    if (!(e < 0)) {
      if (e !== this._frames.length - 1 && this._strict) throw new Error("SvgContext: restore() reached across an open pushGroup()");
      this._closeTo(e);
    }
  }
  pushGroup(e, t = {}) {
    let i2 = "<g";
    for (const t2 in e) i2 += ` ${t2}="${oa(String(e[t2]))}"`;
    const { translate: s2, clip: r2 } = t;
    if (void 0 !== s2 && (i2 += ` transform="translate(${na(s2.x)} ${na(s2.y)})"`), void 0 !== r2) {
      i2 += ` clip-path="url(#${this._clipId(`<rect x="${na(r2.x)}" y="${na(r2.y)}" width="${na(r2.width)}" height="${na(r2.height)}"/>`)})"`;
    }
    this._out.push(i2 + ">"), this._frames.push({ kind: "group", open: 1, state: null });
  }
  popGroup() {
    let e = this._frames.length - 1;
    for (; e >= 0 && "group" !== this._frames[e].kind; ) e--;
    if (e < 0) {
      if (this._strict) throw new Error("SvgContext: popGroup() without a pushGroup()");
    } else {
      if (e !== this._frames.length - 1 && this._strict) throw new Error("SvgContext: popGroup() reached across an open save()");
      this._closeTo(e);
    }
  }
  translate(e, t) {
    0 === e && 0 === t || this._openGroup(`transform="translate(${na(e)} ${na(t)})"`);
  }
  scale(e, t) {
    1 === e && 1 === t || this._openGroup(`transform="scale(${na(e)} ${na(t)})"`);
  }
  rotate(e) {
    0 !== e && this._openGroup(`transform="rotate(${na(180 * e / Math.PI)})"`);
  }
  setLineDash(e) {
    this._dash = e.slice();
  }
  getLineDash() {
    return this._dash.slice();
  }
  beginPath() {
    this._path = "", this._hasPoint = false;
  }
  closePath() {
    "" !== this._path && (this._path += "Z");
  }
  moveTo(e, t) {
    this._path += `M${na(e)} ${na(t)}`, this._hasPoint = true;
  }
  lineTo(e, t) {
    this._path += `${this._hasPoint ? "L" : "M"}${na(e)} ${na(t)}`, this._hasPoint = true;
  }
  quadraticCurveTo(e, t, i2, s2) {
    this._hasPoint || this.moveTo(e, t), this._path += `Q${na(e)} ${na(t)} ${na(i2)} ${na(s2)}`;
  }
  bezierCurveTo(e, t, i2, s2, r2, n2) {
    this._hasPoint || this.moveTo(e, t), this._path += `C${na(e)} ${na(t)} ${na(i2)} ${na(s2)} ${na(r2)} ${na(n2)}`;
  }
  rect(e, t, i2, s2) {
    this._path += `M${na(e)} ${na(t)}h${na(i2)}v${na(s2)}h${na(-i2)}Z`, this._hasPoint = true;
  }
  roundRect(e, t, i2, s2, r2 = 0) {
    const n2 = Array.isArray(r2) ? r2 : [r2];
    let [o2, a, l2, h2] = [n2[0] ?? 0, n2[1] ?? n2[0] ?? 0, n2[2] ?? n2[0] ?? 0, n2[3] ?? n2[1] ?? n2[0] ?? 0];
    const c2 = Math.min(1, i2 / Math.max(1e-9, o2 + a, h2 + l2), s2 / Math.max(1e-9, o2 + h2, a + l2));
    o2 *= c2, a *= c2, l2 *= c2, h2 *= c2;
    const d2 = (e2, t2, i3) => e2 > 0 ? `A${na(e2)} ${na(e2)} 0 0 1 ${na(t2)} ${na(i3)}` : "";
    this._path += `M${na(e + o2)} ${na(t)}H${na(e + i2 - a)}${d2(a, e + i2, t + a)}V${na(t + s2 - l2)}${d2(l2, e + i2 - l2, t + s2)}H${na(e + h2)}${d2(h2, e, t + s2 - h2)}V${na(t + o2)}${d2(o2, e + o2, t)}Z`, this._hasPoint = true;
  }
  arc(e, t, i2, s2, r2, n2 = false) {
    this.ellipse(e, t, i2, i2, 0, s2, r2, n2);
  }
  ellipse(e, t, i2, s2, r2, n2, o2, a = false) {
    const l2 = Math.cos(r2), h2 = Math.sin(r2), c2 = (r3) => {
      const n3 = i2 * Math.cos(r3), o3 = s2 * Math.sin(r3);
      return [e + n3 * l2 - o3 * h2, t + n3 * h2 + o3 * l2];
    };
    let d2, u2 = false;
    a ? (u2 = n2 - o2 >= ra, d2 = -((n2 - o2) % ra + ra) % ra) : (u2 = o2 - n2 >= ra, d2 = ((o2 - n2) % ra + ra) % ra);
    const [_3, p2] = c2(n2);
    this._path += `${this._hasPoint ? "L" : "M"}${na(_3)} ${na(p2)}`, this._hasPoint = true;
    const f2 = na(180 * r2 / Math.PI), m2 = (e2, t2, r3) => {
      const [n3, o3] = c2(e2);
      this._path += `A${na(i2)} ${na(s2)} ${f2} ${t2 ? 1 : 0} ${r3 ? 1 : 0} ${na(n3)} ${na(o3)}`;
    };
    if (u2) {
      const e2 = a ? -Math.PI : Math.PI;
      m2(n2 + e2, false, !a), m2(n2 + 2 * e2, false, !a);
    } else 0 !== d2 && m2(n2 + d2, Math.abs(d2) > Math.PI, d2 > 0);
  }
  fill(e, t) {
    if ("object" == typeof e) return void this._unsupported("fill(Path2D)");
    if ("" === this._path) return;
    const i2 = this._paint(this.fillStyle);
    null !== i2 && this._out.push(`<path d="${this._path}" fill="${i2}"${"evenodd" === e ? ' fill-rule="evenodd"' : ""}${this._opacity()}/>`);
  }
  stroke(e) {
    if (void 0 !== e) return void this._unsupported("stroke(Path2D)");
    if ("" === this._path) return;
    const t = this._strokeAttrs();
    null !== t && this._out.push(`<path d="${this._path}" fill="none"${t}${this._opacity()}/>`);
  }
  clip(e) {
    if ("object" == typeof e) return void this._unsupported("clip(Path2D)");
    if ("" === this._path) return;
    const t = this._clipId(`<path d="${this._path}"${"evenodd" === e ? ' clip-rule="evenodd"' : ""}/>`);
    this._openGroup(`clip-path="url(#${t})"`);
  }
  fillRect(e, t, i2, s2) {
    const r2 = this._paint(this.fillStyle);
    null !== r2 && this._rect(e, t, i2, s2, ` fill="${r2}"`);
  }
  strokeRect(e, t, i2, s2) {
    const r2 = this._strokeAttrs();
    null !== r2 && this._rect(e, t, i2, s2, ` fill="none"${r2}`);
  }
  clearRect(e, t, i2, s2) {
    void 0 !== this._background && this._rect(e, t, i2, s2, ` fill="${oa(this._background)}"`);
  }
  fillText(e, t, i2) {
    if ("" === e) return;
    const s2 = this._paint(this.fillStyle);
    if (null === s2) return;
    const r2 = this._font();
    let n2 = ` font-family="${oa(r2.family)}" font-size="${na(r2.size)}"`;
    null !== r2.weight && (n2 += ` font-weight="${r2.weight}"`), null !== r2.style && (n2 += ` font-style="${r2.style}"`);
    const o2 = ca[this.textAlign];
    void 0 !== o2 && (n2 += ` text-anchor="${o2}"`);
    const a = ha[this.textBaseline];
    void 0 !== a && (n2 += ` dominant-baseline="${a}"`), this._out.push(`<text x="${na(t)}" y="${na(i2)}"${n2} fill="${s2}"${this._opacity()}>${oa(e)}</text>`);
  }
  measureText(e) {
    const t = this._font();
    let i2 = 0;
    for (const t2 of e) i2 += aa(t2);
    const s2 = null !== t.weight && ("bold" === t.weight || "bolder" === t.weight || parseInt(t.weight, 10) >= 600), r2 = i2 * t.size * (s2 ? 1.05 : 1);
    return { width: r2, actualBoundingBoxLeft: 0, actualBoundingBoxRight: r2, actualBoundingBoxAscent: 0.8 * t.size, actualBoundingBoxDescent: 0.2 * t.size, fontBoundingBoxAscent: 0.8 * t.size, fontBoundingBoxDescent: 0.2 * t.size };
  }
  createLinearGradient(e, t, i2, s2) {
    const r2 = new sa("g" + ++this._ids, e, t, i2, s2);
    return this._gradients.push(r2), r2;
  }
  drawImage(e, ...t) {
    const i2 = this._imageHref(e);
    if (null === i2) return void this._unsupported("drawImage");
    const s2 = e, r2 = s2.naturalWidth ?? ("number" == typeof s2.width ? s2.width : 0), n2 = s2.naturalHeight ?? ("number" == typeof s2.height ? s2.height : 0), o2 = this._opacity();
    if (t.length >= 8) {
      const [e2, s3, a2, l3, h3, c3, d2, u2] = t;
      return void this._out.push(`<svg x="${na(h3)}" y="${na(c3)}" width="${na(d2)}" height="${na(u2)}" viewBox="${na(e2)} ${na(s3)} ${na(a2)} ${na(l3)}" preserveAspectRatio="none"><image href="${oa(i2)}" width="${na(r2)}" height="${na(n2)}" preserveAspectRatio="none"${o2}/></svg>`);
    }
    const [a, l2] = t, h2 = t.length >= 4 ? t[2] : r2, c2 = t.length >= 4 ? t[3] : n2;
    this._out.push(`<image href="${oa(i2)}" x="${na(a)}" y="${na(l2)}" width="${na(h2)}" height="${na(c2)}" preserveAspectRatio="none"${o2}/>`);
  }
  setTransform() {
    this._unsupported("setTransform");
  }
  resetTransform() {
    this._unsupported("resetTransform");
  }
  getTransform() {
    this._unsupported("getTransform");
  }
  createRadialGradient() {
    this._unsupported("createRadialGradient");
  }
  createConicGradient() {
    this._unsupported("createConicGradient");
  }
  createPattern() {
    return this._unsupported("createPattern"), null;
  }
  getImageData() {
    this._unsupported("getImageData");
  }
  putImageData() {
    this._unsupported("putImageData");
  }
  createImageData() {
    this._unsupported("createImageData");
  }
  strokeText() {
    this._unsupported("strokeText");
  }
  drawFocusIfNeeded() {
    this._unsupported("drawFocusIfNeeded");
  }
  isPointInPath() {
    return this._unsupported("isPointInPath"), false;
  }
  isPointInStroke() {
    return this._unsupported("isPointInStroke"), false;
  }
  toString() {
    const e = na(this.width), t = na(this.height);
    let i2 = "";
    for (const e2 of this._clips) i2 += e2;
    for (const e2 of this._gradients) {
      i2 += `<linearGradient id="${e2.id}" gradientUnits="userSpaceOnUse" x1="${na(e2.x0)}" y1="${na(e2.y0)}" x2="${na(e2.x1)}" y2="${na(e2.y1)}">`;
      for (const t2 of e2.stops) i2 += `<stop offset="${na(t2.offset)}" stop-color="${oa(t2.color)}"/>`;
      i2 += "</linearGradient>";
    }
    let s2 = "";
    for (let e2 = this._frames.length - 1; e2 >= 0; e2--) s2 += "</g>".repeat(this._frames[e2].open);
    return s2 += "</g>".repeat(this._rootOpen), `<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${t}" viewBox="0 0 ${e} ${t}" xml:space="preserve">` + ("" === i2 ? "" : `<defs>${i2}</defs>`) + this._out.join("") + s2 + "</svg>";
  }
  _snapshot() {
    return { fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, lineWidth: this.lineWidth, lineCap: this.lineCap, lineJoin: this.lineJoin, miterLimit: this.miterLimit, globalAlpha: this.globalAlpha, font: this.font, textAlign: this.textAlign, textBaseline: this.textBaseline, dash: this._dash.slice(), dashOffset: this.lineDashOffset };
  }
  _apply(e) {
    this.fillStyle = e.fillStyle, this.strokeStyle = e.strokeStyle, this.lineWidth = e.lineWidth, this.lineCap = e.lineCap, this.lineJoin = e.lineJoin, this.miterLimit = e.miterLimit, this.globalAlpha = e.globalAlpha, this.font = e.font, this.textAlign = e.textAlign, this.textBaseline = e.textBaseline, this._dash = e.dash, this.lineDashOffset = e.dashOffset;
  }
  _closeTo(e) {
    for (; this._frames.length > e; ) {
      const e2 = this._frames.pop();
      this._out.push("</g>".repeat(e2.open)), null !== e2.state && this._apply(e2.state);
    }
  }
  _openGroup(e) {
    this._out.push(`<g ${e}>`);
    const t = this._frames[this._frames.length - 1];
    void 0 !== t ? t.open++ : this._rootOpen++;
  }
  _clipId(e) {
    const t = "c" + ++this._ids;
    return this._clips.push(`<clipPath id="${t}">${e}</clipPath>`), t;
  }
  _rect(e, t, i2, s2, r2) {
    0 !== i2 && 0 !== s2 && (i2 < 0 && (e += i2, i2 = -i2), s2 < 0 && (t += s2, s2 = -s2), this._out.push(`<rect x="${na(e)}" y="${na(t)}" width="${na(i2)}" height="${na(s2)}"${r2}${this._opacity()}/>`));
  }
  _paint(e) {
    return this.globalAlpha <= 0 ? null : "string" != typeof e ? e instanceof sa ? e.toString() : null : "transparent" === e ? null : oa(e);
  }
  _strokeAttrs() {
    if (!(this.lineWidth > 0)) return null;
    const e = this._paint(this.strokeStyle);
    if (null === e) return null;
    let t = ` stroke="${e}" stroke-width="${na(this.lineWidth)}"`;
    return "butt" !== this.lineCap && (t += ` stroke-linecap="${this.lineCap}"`), "miter" !== this.lineJoin && (t += ` stroke-linejoin="${this.lineJoin}"`), this._dash.some((e2) => e2 > 0) && (t += ` stroke-dasharray="${this._dash.map(na).join(" ")}"`, 0 !== this.lineDashOffset && (t += ` stroke-dashoffset="${na(this.lineDashOffset)}"`)), t;
  }
  _opacity() {
    return this.globalAlpha < 1 ? ` opacity="${na(this.globalAlpha)}"` : "";
  }
  _font() {
    return null !== this._fontCache && this._fontCache.font === this.font || (this._fontCache = { font: this.font, parsed: la(this.font) }), this._fontCache.parsed;
  }
  _imageHref(e) {
    const t = e;
    if ("string" == typeof t.src && "" !== t.src) return t.src;
    if ("function" == typeof t.toDataURL) try {
      return t.toDataURL.call(e);
    } catch {
      return null;
    }
    return null;
  }
  _unsupported(e) {
    if (this._strict) throw new Error(`SvgContext: ${e} has no SVG form and cannot be exported`);
    this.unsupported.includes(e) || this.unsupported.push(e);
  }
};
var ua = '600 {size}px system-ui, -apple-system, "Segoe UI", sans-serif';
var _a = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_opts", { enumerable: true, configurable: true, writable: true, value: void 0 }), this._opts = { text: e.text, fontSize: e.fontSize ?? 64, opacity: e.opacity ?? 0.08, zOrder: e.zOrder ?? "bottom", id: e.id ?? "text-watermark", color: e.color, font: e.font };
  }
  zOrder() {
    return this._opts.zOrder;
  }
  attached(e) {
    this._host = e;
  }
  detached() {
    this._host = null;
  }
  autoscaleInfo() {
    return null;
  }
  hitTest() {
    return null;
  }
  setOptions(e) {
    this._opts = { ...this._opts, ...e }, this._host?.requestUpdate();
  }
  draw(e, t) {
    const i2 = this._opts;
    if ("" === i2.text) return;
    const s2 = t.dpr, r2 = t.plotWidth * s2, n2 = t.plotHeight * s2;
    if (r2 <= 0 || n2 <= 0) return;
    e.save(), e.beginPath(), e.rect(0, 0, r2, n2), e.clip(), e.globalAlpha = i2.opacity, e.fillStyle = i2.color ?? "#9aa4b2", e.textAlign = "center", e.textBaseline = "middle";
    const o2 = Math.min(i2.fontSize * s2, 0.8 * n2), a = (i2.font ?? ua).replace("{size}", String(Math.round(o2)));
    e.font = a;
    const l2 = e.measureText(i2.text).width, h2 = 0.8 * r2;
    if (l2 > h2 && l2 > 0) {
      const t2 = Math.max(0.1, o2 * (h2 / l2));
      e.font = (i2.font ?? ua).replace("{size}", String(t2));
    }
    e.fillText(i2.text, r2 / 2, n2 / 2), e.restore();
  }
};
var pa = class {
  constructor(e) {
    Object.defineProperty(this, "_host", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_brandingOptions", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_watermark", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_watermarkOptions", { enumerable: true, configurable: true, writable: true, value: { visible: false, text: "", color: "#9aa4b2", opacity: 0.08, fontSize: 64 } }), this._host = e;
  }
  setBranding(e) {
    null !== this._host._branding && this._host.removePrimitive(this._host._branding), this._host._branding = null, this._brandingOptions = false !== e && { position: "bottom-left", margin: 14, opacity: 1, padding: 8, label: "Chart by OpenAlgo", href: "https://openalgo.in", id: "chart-branding", ...true === e ? {} : e }, false !== this._brandingOptions && ("object" == typeof this._brandingOptions.padding && (this._brandingOptions.padding = { ...this._brandingOptions.padding }), this._host._branding = new lo(this._brandingOptions), this._host.addPrimitive(this._host._branding, { anchor: "chart-bottom" })), this._host.invalidate((e2) => e2.invalidateGlobal(i.Light)), this._host._emit("branding:changed", this._host.brandingOptions());
  }
  setWatermarkOptions(e) {
    const t = "boolean" == typeof e ? { visible: e } : e;
    if (null === t || "object" != typeof t) return;
    const i2 = this._watermarkOptions;
    "boolean" == typeof t.visible && (i2.visible = t.visible);
    for (const e2 of ["text", "color", "font", "id"]) "string" == typeof t[e2] && (i2[e2] = t[e2]);
    "number" == typeof t.opacity && Number.isFinite(t.opacity) && (i2.opacity = Math.max(0, Math.min(1, t.opacity))), "number" == typeof t.fontSize && Number.isFinite(t.fontSize) && (i2.fontSize = Math.max(10, Math.min(200, t.fontSize))), "bottom" !== t.zOrder && "normal" !== t.zOrder && "top" !== t.zOrder || (i2.zOrder = t.zOrder), this._syncWatermark(), this._host._layoutChanged("setWatermarkOptions");
  }
  _syncWatermark() {
    const e = this._watermarkOptions;
    if (!e.visible) return null !== this._watermark && this._host.removePrimitive(this._watermark), void (this._watermark = null);
    const t = e.text?.trim() ? e.text : [this._host._dataContext?.symbol, this._host._dataContext?.interval].filter(Boolean).join(" ");
    null === this._watermark ? (this._watermark = new _a({ ...e, text: t }), this._host.addPrimitive(this._watermark, { anchor: "primary-pane" })) : this._watermark.setOptions({ ...e, text: t }), this._host.invalidate((e2) => e2.invalidateGlobal(i.Light));
  }
  takeScreenshot() {
    const e = this._host._pixelRatio(), t = this._host._doc.createElement("canvas");
    t.width = Math.max(1, Math.round(this._host._width * e)), t.height = Math.max(1, Math.round(this._host._height * e));
    const i2 = t.getContext("2d");
    if (null === i2) return t;
    i2.fillStyle = this._host._theme.background, i2.fillRect(0, 0, t.width, t.height);
    const s2 = this._host._paneLayout();
    for (let t2 = 0; t2 < this._host._panes.length; t2++) {
      if (this._host._layout._layoutWeight(t2) <= 0) continue;
      const r2 = Math.round((s2[t2]?.top ?? 0) * e);
      for (const e2 of [this._host._panes[t2].base, this._host._panes[t2].top]) e2.element.width > 0 && e2.element.height > 0 && i2.drawImage(e2.element, 0, r2);
    }
    return t;
  }
  exportSVG(e) {
    if (void 0 !== e.dpr && 1 !== e.dpr) throw new RangeError("exportSVG: dpr must be 1, SVG has no device pixels");
    const t = Math.max(1, Math.round(e.width ?? this._host._width)), s2 = Math.max(1, Math.round(e.height ?? this._host._height)), r2 = false !== e.background, n2 = new da(t, s2, { background: r2 ? this._host._theme.background : void 0 }), o2 = n2.asCanvasContext();
    this._host._studies._flushIndicators();
    const a = this._host._width, l2 = this._host._height, h2 = this._host._layoutRatio, c2 = t !== a || s2 !== l2 || 1 !== this._host._layout._ratioForLayout();
    this._host._layoutRatio = 1, c2 && (this._host._width = t, this._host._height = s2, this._host._layout._relayout(true));
    try {
      r2 && "transparent" !== this._host._theme.background && (n2.fillStyle = this._host._theme.background, n2.fillRect(0, 0, t, s2));
      const e2 = this._host._paneLayout(), i2 = this._host._layout._topPaneIndex();
      for (let s3 = 0; s3 < this._host._panes.length; s3++) {
        if (this._host._layout._layoutWeight(s3) <= 0) continue;
        const a2 = this._host._panes[s3], l3 = { ...this._host._renderContext(s3), dpr: 1, hoverId: null, hoverKey: null, dragId: null, paintBackground: r2 }, h3 = s3 === i2, c3 = e2[s3].top + (h3 ? 0 : 1), d2 = e2[s3].height - (h3 ? 0 : 1);
        h3 || (n2.fillStyle = this._host._theme.paneSeparator, n2.fillRect(0, e2[s3].top, t, 1)), n2.pushGroup({ "data-pane": s3 }, { translate: { x: 0, y: c3 }, clip: { x: 0, y: 0, width: t, height: d2 } }), a2.autoscale(l3), a2.paintBase(l3, o2), a2.paintTop(null, l3, o2), n2.popGroup();
      }
    } finally {
      this._host._layoutRatio = h2, c2 && (this._host._width = a, this._host._height = l2, this._host._layout._relayout(true), this._host.invalidate((e2) => e2.invalidateGlobal(i.Full)));
    }
    return n2.toString();
  }
  applyOptions(e) {
    this._host._withinLayoutChange(() => {
      e.theme && this._host.setTheme(e.theme), e.grid && this._host.setGridOptions(e.grid), e.canvas && this._host.setCanvasOptions(e.canvas), e.statusLine && this._host.setStatusLineOptions(e.statusLine), void 0 !== e.legendIconSize && this._host.setLegendIconSize(e.legendIconSize), e.priceScale && this._host.setPriceScaleOptions(e.priceScale), void 0 !== e.priceFormatter && this._host.setPriceFormatter(e.priceFormatter), "timeFormatter" in e && this._host.setTimeFormatter(e.timeFormatter), void 0 !== e.timezone && this._host.setTimezone(e.timezone), e.crosshairMode && (this._host._crosshairMode = e.crosshairMode), "boolean" == typeof e.crosshairSnapToBar && (this._host._crosshairSnapToBar = e.crosshairSnapToBar, this._host.invalidate((e2) => e2.invalidateGlobal(i.Cursor)));
    }), this._host._layoutChanged("applyOptions");
  }
};
var fa = class {
  constructor() {
    Object.defineProperty(this, "_listeners", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() });
  }
  on(e, t) {
    let i2 = this._listeners.get(e);
    return void 0 === i2 && (i2 = /* @__PURE__ */ new Set(), this._listeners.set(e, i2)), i2.add(t), () => this.off(e, t);
  }
  once(e, t) {
    const i2 = (s2) => {
      this.off(e, i2), t(s2);
    };
    return this.on(e, i2);
  }
  off(e, t) {
    void 0 === t ? this._listeners.delete(e) : this._listeners.get(e)?.delete(t);
  }
  emit(e, t) {
    gn(this._listeners.get(e), t);
  }
  has(e) {
    return (this._listeners.get(e)?.size ?? 0) > 0;
  }
  clear() {
    this._listeners.clear();
  }
};
function ma(e) {
  if (!pt(e)) throw new Error(`openalgo-charts: unknown IANA time zone "${e}"`);
  return e;
}
function ba() {
  return "undefined" != typeof window && window.devicePixelRatio ? window.devicePixelRatio : 1;
}
var ga = class {
  constructor(e, t = {}) {
    Object.defineProperty(this, "_container", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_doc", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_pixelRatio", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_theme", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_panes", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_primaryPane", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_loop", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_raf", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_rafInjected", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_remeasureHandle", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_dataLayer", { enumerable: true, configurable: true, writable: true, value: new L() }), Object.defineProperty(this, "_timeScale", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_timeScaleMutationDepth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_priceAxisWidth", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_timeAxisHeight", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_pending", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_framing", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_scaleMutationDepth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_pixels", { enumerable: true, configurable: true, writable: true, value: new Ui(this) }), Object.defineProperty(this, "_layoutRatio", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_width", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_height", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_hasFitContent", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_layoutDepth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_crosshairMode", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_crosshairSnapToBar", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_priceOnlyAutoScale", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_indicatorLegendCollapsed", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_shortcuts", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_trading", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_tickSchedule", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_input", { enumerable: true, configurable: true, writable: true, value: new Wo(this) }), Object.defineProperty(this, "_now", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_conflate", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_conflationFactor", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_backendFactory", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_rendererKind", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_requestedRenderer", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_gridVert", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "_gridHorz", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "_canvas", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "_statusLine", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "_legendIconSize", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_axisChrome", { enumerable: true, configurable: true, writable: true, value: { sessionClock: false, barCountdown: false } }), Object.defineProperty(this, "_sessionClockForm", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_wallClock", { enumerable: true, configurable: true, writable: true, value: () => Date.now() / 1e3 }), Object.defineProperty(this, "_tradingSettings", { enumerable: true, configurable: true, writable: true, value: {} }), Object.defineProperty(this, "_events", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_eventMarkers", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_eventPane", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_primitives", { enumerable: true, configurable: true, writable: true, value: new ia(this) }), Object.defineProperty(this, "_navigation", { enumerable: true, configurable: true, writable: true, value: { mousePan: "both", defaultVisibleBars: 0, panEnabled: true, zoomEnabled: true } }), Object.defineProperty(this, "_liveRegion", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_lastDragX", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_lastDragT", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_dragVelocity", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_motion", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_animZoom", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_zoomAnchor", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_doubleClick", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_movablePrimaryPane", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_firstDataId", { enumerable: true, configurable: true, writable: true, value: { value: null } }), Object.defineProperty(this, "_primary", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_seriesRecords", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new WeakMap() }), Object.defineProperty(this, "_seriesProvenance", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_indicators", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_sourceAbove", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_legendActions", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new WeakMap() }), Object.defineProperty(this, "_persistence", { enumerable: true, configurable: true, writable: true, value: new mo(this) }), Object.defineProperty(this, "_indicatorRanges", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_ownedScaleRanges", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_seriesOwners", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new WeakMap() }), Object.defineProperty(this, "_series", { enumerable: true, configurable: true, writable: true, value: new ea(this) }), Object.defineProperty(this, "_dataContext", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_barsProvider", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_barsRequests", { enumerable: true, configurable: true, writable: true, value: new AbortController() }), Object.defineProperty(this, "_barsProviderRevision", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_requestedDataRevision", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_studies", { enumerable: true, configurable: true, writable: true, value: new Ro(this, this) }), Object.defineProperty(this, "_indicatorsDirty", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_indicatorRefreshes", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_indicatorReservedIds", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_drawingState", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_alertState", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_layout", { enumerable: true, configurable: true, writable: true, value: new Go(this) }), Object.defineProperty(this, "_collapsed", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new WeakSet() }), Object.defineProperty(this, "_legends", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_studyLegends", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Set() }), Object.defineProperty(this, "_legendStack", { enumerable: true, configurable: true, writable: true, value: new Ho(this) }), Object.defineProperty(this, "_firstPane", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_historyLoader", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_loadingHistory", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_priceFormatter", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_priceScaleOptions", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_pricePanes", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new WeakSet() }), Object.defineProperty(this, "_scales", { enumerable: true, configurable: true, writable: true, value: new ta(this) }), Object.defineProperty(this, "_timeFormatter", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_timezone", { enumerable: true, configurable: true, writable: true, value: ct }), Object.defineProperty(this, "_leftAxisWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_rightAxisWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_axisColumnWidth", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_emptyPriceAxis", { enumerable: true, configurable: true, writable: true, value: true }), Object.defineProperty(this, "_timeNav", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_schedulingTimeNav", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_timeNavPane", { enumerable: true, configurable: true, writable: true, value: -1 }), Object.defineProperty(this, "_branding", { enumerable: true, configurable: true, writable: true, value: null }), Object.defineProperty(this, "_appearance", { enumerable: true, configurable: true, writable: true, value: new pa(this) }), Object.defineProperty(this, "_bus", { enumerable: true, configurable: true, writable: true, value: new fa() }), Object.defineProperty(this, "_anchored", { enumerable: true, configurable: true, writable: true, value: [] }), Object.defineProperty(this, "_onPixelRatio", { enumerable: true, configurable: true, writable: true, value: () => this._pixels._onPixelRatio() }), Object.defineProperty(this, "_checkPixelRatio", { enumerable: true, configurable: true, writable: true, value: () => this._pixels._checkPixelRatio() }), Object.defineProperty(this, "_onPointerEnter", { enumerable: true, configurable: true, writable: true, value: () => this._input._onPointerEnter() }), Object.defineProperty(this, "_onContextMenu", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onContextMenu(e2) }), Object.defineProperty(this, "_onPointerDown", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onPointerDown(e2) }), Object.defineProperty(this, "_onPointerMove", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onPointerMove(e2) }), Object.defineProperty(this, "_onPointerUp", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onPointerUp(e2) }), Object.defineProperty(this, "_onPointerUpNative", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onPointerUpNative(e2) }), Object.defineProperty(this, "_onPointerCancel", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onPointerCancel(e2) }), Object.defineProperty(this, "_onLostPointerCapture", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onLostPointerCapture(e2) }), Object.defineProperty(this, "_onPointerLeave", { enumerable: true, configurable: true, writable: true, value: () => this._input._onPointerLeave() }), Object.defineProperty(this, "_onWheel", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onWheel(e2) }), Object.defineProperty(this, "_onDblClick", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onDblClick(e2) }), Object.defineProperty(this, "_onKeyDown", { enumerable: true, configurable: true, writable: true, value: (e2) => this._input._onKeyDown(e2) }), Object.defineProperty(this, "_destroyed", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_destroying", { enumerable: true, configurable: true, writable: true, value: false }), this._timeScale = new S(t.timeScale), this._container = e, this._doc = t.document ?? e.ownerDocument, this._pixelRatio = t.pixelRatio ?? ba, this._theme = t.theme ?? Ji, this._priceAxisWidth = t.priceAxisWidth ?? 56, this._rightAxisWidth = this._priceAxisWidth, void 0 !== t.legendOffset?.top && (this._legendStack._legendOffset.top = t.legendOffset.top), void 0 !== t.legendOffset?.left && (this._legendStack._legendOffset.left = t.legendOffset.left), this._timeAxisHeight = t.timeAxisHeight ?? 22, this._crosshairMode = t.crosshairMode ?? "normal", this._crosshairSnapToBar = true === t.crosshairSnapToBar, this._priceOnlyAutoScale = true === t.priceOnlyAutoScale, this._indicatorLegendCollapsed = true === t.indicatorLegendCollapsed, Object.assign(this._axisChrome, t.axisChrome), "object" == typeof t.axisChrome?.sessionClock && (this._sessionClockForm = { ...t.axisChrome.sessionClock }), void 0 !== t.axisChrome?.clock && (this._wallClock = t.axisChrome.clock);
    const s2 = t.shortcuts;
    this._shortcuts = false === s2 ? null : s2 instanceof Fn ? s2 : new Fn(s2 ?? {}), this._now = t.now ?? (() => "undefined" != typeof performance ? performance.now() : 0), this._animZoom = t.animZoom ?? true, this._barsProvider = t.barsProvider ?? null, this._motion = new Gi(this, t.animAutoscale ?? this._animZoom), this._zoomAnchor = t.zoomAnchor ?? "cursor", this._doubleClick = t.doubleClick ?? "reset", this._movablePrimaryPane = true === t.movablePrimaryPane, this._conflate = t.conflate ?? true, this._conflationFactor = t.conflationFactor ?? 1, this._backendFactory = t.renderBackend ?? Li(t.renderer ?? "canvas2d"), this._requestedRenderer = void 0 === t.renderBackend ? t.renderer ?? "canvas2d" : null, this._priceFormatter = t.priceFormatter ?? null, this._priceScaleOptions = t.priceScale ?? null, this._timeFormatter = t.timeFormatter, void 0 !== t.timezone && (this._timezone = ma(t.timezone)), this._gridVert = t.grid?.vertLines ?? true, this._gridHorz = t.grid?.horzLines ?? true, Object.assign(this._canvas, t.canvas), t.grid && (this._canvas.grid = { ...this._canvas.grid, ...t.grid }), Object.assign(this._statusLine, t.statusLine), "number" == typeof t.legendIconSize && Number.isFinite(t.legendIconSize) && (this._legendIconSize = t.legendIconSize);
    const o2 = V(this._canvas.margins);
    void 0 === o2.marginTop && void 0 === o2.marginBottom || (this._priceScaleOptions = { ...this._priceScaleOptions, ...o2 }), this._input._patchNavigation(t.navigation ?? {});
    const a = t.timeNavigator ?? true;
    if (false !== a) {
      const e2 = true === a ? void 0 : a;
      this._timeNav = new ro({ ...e2, hints: this._navHints(e2) }, this._now), this._input._timeNavButtons = [...this._timeNav.options().buttons], this._input._syncNavigatorPolicy(), void 0 === e2?.hints && null !== this._shortcuts && this.on("destroy", this._shortcuts.onChange(() => this._timeNav?.setOptions({ hints: this._navHints() })));
    }
    const l2 = "function" == typeof getComputedStyle ? getComputedStyle(e).position : e.style.position;
    l2 && "static" !== l2 || (e.style.position = "relative"), e.style.display = "flex", e.style.flexDirection = "column", e.style.background = this._theme.background, e.style.touchAction = "none", e.getAttribute("role") || e.setAttribute("role", "application"), e.setAttribute("aria-label", t.ariaLabel ?? "Interactive financial chart"), e.hasAttribute("tabindex") || (e.tabIndex = 0);
    const h2 = this._doc.createElement("div");
    h2.setAttribute("aria-live", "polite");
    const c2 = h2.style;
    var d2;
    c2.position = "absolute", c2.width = "1px", c2.height = "1px", c2.overflow = "hidden", c2.clip = "rect(0 0 0 0)", c2.whiteSpace = "nowrap", c2.border = "0", c2.padding = "0", c2.margin = "-1px", e.appendChild(h2), this._liveRegion = h2, this._raf = (d2 = t.raf) ? { schedule: d2.schedule, cancel: d2.cancel ?? r } : "function" == typeof requestAnimationFrame ? { schedule: (e2) => requestAnimationFrame(e2), cancel: (e2) => cancelAnimationFrame(e2) } : { schedule: (e2) => setTimeout(e2, 16), cancel: (e2) => clearTimeout(e2) }, this._rafInjected = void 0 !== t.raf, this._loop = new n(() => this._onFrame(), this._raf.schedule, this._raf.cancel), this._layout._addPane(), this.setBranding(t.branding ?? true), this.setWatermarkOptions(t.watermark ?? false), this._pixels._observeSize(), this._pixels._watchPixelRatio(), this._input._attachInput(), this._timeScale.setChangeHandler((e2) => {
      if (this._timeScaleMutationDepth > 0 || this._destroyed) return;
      this._motion._stopNavigationMotion();
      const t2 = this._timeScale.visibleRange();
      t2.from === e2.from && t2.to === e2.to || (this.invalidate((e3) => e3.invalidateGlobal(i.Full)), this._emitViewportIfMoved(e2));
    }), this.applySize(e.clientWidth, e.clientHeight), this._remeasureHandle = this._raf.schedule(() => {
      this._remeasureHandle = null, this._layout._remeasure();
    }), "function" == typeof queueMicrotask && queueMicrotask(() => this._emit("ready", {}));
  }
  setHistoryLoader(e) {
    this._historyLoader = e;
  }
  historyLoadComplete() {
    this._loadingHistory = false;
  }
  get dataLayer() {
    return this._dataLayer;
  }
  setSessionCalendar(e) {
    this._destroyed || (this._dataLayer.setSessionCalendar(e), this.invalidate((e2) => e2.invalidateGlobal(i.Full)));
  }
  primaryBars() {
    const e = this._firstDataId.value;
    return null === e ? [] : this._dataLayer.seriesBars(e);
  }
  get timeScale() {
    return this._timeScale;
  }
  setVisibleLogicalRange(e) {
    this._motion._stopNavigationMotion(), this._timeScale.setVisibleLogicalRange(e);
  }
  getVisibleLogicalRange() {
    return this._timeScale.visibleRange();
  }
  fitContent() {
    this._motion._stopNavigationMotion(), this._dataLayer.length <= 0 || this._timeScale.fitContent(this._dataLayer.length);
  }
  navigationOptions() {
    return { ...this._navigation };
  }
  setNavigationOptions(e) {
    const t = this._navigation.defaultVisibleBars, i2 = this._navigation.defaultBarSpacing, s2 = this._navigation.panEnabled, r2 = this._navigation.zoomEnabled;
    this._input._patchNavigation(e), t === this._navigation.defaultVisibleBars && i2 === this._navigation.defaultBarSpacing || this.resetScale(), s2 === this._navigation.panEnabled && r2 === this._navigation.zoomEnabled || this._emit("objects:change", {}), this._layoutChanged("setNavigationOptions");
  }
  _fitDefaultView() {
    const e = this._dataLayer.length;
    return !(e <= 0) && this._timeScale.width > 0 && (this._mutateTimeScale(() => {
      if (this._timeScale.fitContent(e), void 0 !== this._navigation.defaultBarSpacing) this._timeScale.setBarSpacing(this._navigation.defaultBarSpacing);
      else if (this._navigation.defaultVisibleBars > 0) {
        const t = Math.min(e, this._navigation.defaultVisibleBars);
        this._timeScale.setBarSpacing(this._timeScale.width / (t + this._timeScale.rightOffset));
      }
    }), true);
  }
  get shortcuts() {
    return this._shortcuts;
  }
  get trading() {
    return null === this._trading && (this._trading = new Gn(this), this._trading.setSettings(this._tradingSettings)), this._trading;
  }
  hasTrading() {
    return null !== this._trading;
  }
  tradingSettings() {
    if (null !== this._trading) return this._trading.getSettings();
    const e = { ...Bn };
    for (const [t, i2] of Object.entries(this._tradingSettings)) "string" == typeof i2 && (e[t.slice(0, -5)] = i2);
    return e;
  }
  setTradingSettings(e) {
    Object.assign(this._tradingSettings, e), this._trading?.setSettings(e), this._layoutChanged("setTradingSettings");
  }
  _layoutChanged(e) {
    this._layoutDepth > 0 || this._destroyed || this._emit("layout:change", { setter: e });
  }
  _withinLayoutChange(e) {
    this._layoutDepth++;
    try {
      return e();
    } finally {
      this._layoutDepth--;
    }
  }
  addSeries(e, t = {}) {
    return this._series._createSeries(e, t, true);
  }
  seriesType(e) {
    const t = this._seriesRecords.get(e), i2 = this._seriesOwners.get(e);
    return !this._destroyed && t && i2 && this._panes.includes(i2.pane) && i2.pane.series().includes(t) ? t.type : null;
  }
  seriesStyle(e) {
    return null === this.seriesType(e) ? null : Object.freeze({ ...this._seriesRecords.get(e).style });
  }
  setSeriesPriceScale(e, t) {
    if (!N(t) || null === this.seriesType(e)) return false;
    const s2 = this._seriesRecords.get(e), r2 = this._seriesOwners.get(e);
    if (r2.indicatorOwned || s2.scaleId === t) return false;
    const n2 = r2.pane.scaleFor(t);
    return s2.scaleId = t, this._studies._reconcileIndicatorRanges(), this._series._applySeriesPriceFormat(n2, r2.priceFormat), void 0 !== s2.style.precision && this._series._applyPrecision(n2, s2.style.precision), this._layout._recomputeAxisColumns(), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._emit("objects:change", {}), true;
  }
  setSeriesType(e, t) {
    return this._series._setSeriesType(e, t, true);
  }
  setSeriesTransform(e, t) {
    return this._series._setSeriesTransform(e, t, true);
  }
  seriesTransform(e) {
    return this._series._seriesTransform(e);
  }
  primarySeries() {
    return this._primary?.api ?? null;
  }
  primarySeriesInfo() {
    const e = this._primary;
    return null === e ? null : { type: e.record.type, style: e.record.style };
  }
  addPriceLine(e, t) {
    const i2 = new En(e);
    return this._primitives._addPrimitive(t ?? this._primaryIndex(), i2), i2;
  }
  addEventMarkers(e, t = {}) {
    const i2 = new to(t);
    return this._primitives._addPrimitive(e ?? this._primaryIndex(), i2), i2;
  }
  setEvents(e, t) {
    this._primitives.setEvents(e, t);
  }
  eventMarkers() {
    return this._eventMarkers;
  }
  setEventMarkerOptions(e) {
    this._primitives._ensureEventMarkers().setOptions(e);
  }
  setEventGroups(e) {
    this._primitives._ensureEventMarkers().setGroups(e), this._emit("events:change", void 0);
  }
  setEventGroupVisible(e, t) {
    this._primitives._ensureEventMarkers().setGroupVisible(e, t), this._emit("events:change", void 0);
  }
  setEventOptions(e) {
    Object.assign(this._primitives._eventVisible, e), this._primitives._syncEvents(), this._layoutChanged("setEventOptions");
  }
  eventOptions() {
    return { ...this._primitives._eventVisible };
  }
  addIndicator(e, t = {}, i2 = {}) {
    return this._studies.addIndicator(e, t, i2);
  }
  indicators() {
    return this._studies.indicators();
  }
  moveIndicator(e, t, i2 = {}) {
    return this._studies.moveIndicator(e, t, i2);
  }
  reorderIndicator(e, t, i2 = {}) {
    return this._studies.reorderIndicator(e, t, i2);
  }
  _policyAllows(e, t, i2) {
    return true === i2.force || false !== e.policy()[t];
  }
  seriesStack(e = this._primaryIndex()) {
    return this._primitives.seriesStack(e);
  }
  moveInSeriesStack(e, t, i2, s2 = {}) {
    return this._primitives.moveInSeriesStack(e, t, i2, s2);
  }
  setPrimitiveStackAbove(e, t) {
    return this._primitives.setPrimitiveStackAbove(e, t);
  }
  removeIndicator(e, t = {}) {
    return this._studies.removeIndicator(e, t);
  }
  getDataContext() {
    return this._dataContext;
  }
  get hasOpenInterest() {
    return this._dataContext?.hasOpenInterest;
  }
  setDataContext(e) {
    const t = !function(e2, t2) {
      if (e2 === t2) return true;
      const i3 = e2, s3 = t2;
      for (const e3 of /* @__PURE__ */ new Set([...Object.keys(i3 ?? {}), ...Object.keys(s3 ?? {})])) if (i3?.[e3] !== s3?.[e3]) return false;
      return true;
    }(this._dataContext?.variant, e?.variant);
    if (this._dataContext?.symbol === e?.symbol && this._dataContext?.exchange === e?.exchange && this._dataContext?.hasOpenInterest === e?.hasOpenInterest && this._dataContext?.interval === e?.interval && !t && !!this._dataContext == !!e) return;
    const i2 = this._dataContext?.symbol !== e?.symbol || this._dataContext?.exchange !== e?.exchange, s2 = i2 || t || this._dataContext?.interval !== e?.interval;
    if (this._dataContext = e ? Object.freeze({ ...e }) : void 0, s2 && this._cancelBarsRequests(), s2) for (const e2 of this._seriesProvenance.values()) e2.contextChanged();
    this._indicators.length > 0 && (this._indicatorsDirty = true, this._loop.requestFrame()), i2 && this._events.length && (this._events = [], this._primitives._syncEvents());
    for (const e2 of this._legends) e2.legend.setOptions({ hasOpenInterest: this.hasOpenInterest });
    this._appearance._syncWatermark(), this._emit("data:context", this._dataContext);
  }
  setBarsProvider(e) {
    this._destroyed || this._destroying || e === this._barsProvider || (this._barsProvider = e, this._barsProviderRevision++, this._cancelBarsRequests(), this._emit("data:requests", {}));
  }
  _cancelBarsRequests() {
    if (this._destroying) return;
    const e = this._barsRequests;
    this._barsRequests = new AbortController(), e.abort();
  }
  invalidateRequestedData() {
    this._destroyed || this._destroying || (this._requestedDataRevision++, this._emit("data:requests", {}));
  }
  hasSnapshotProvider() {
    return "object" == typeof this._barsProvider && null !== this._barsProvider && "function" == typeof this._barsProvider.requestSnapshot;
  }
  hasBarsProvider() {
    return null !== this._barsProvider;
  }
  setBranding(e) {
    this._appearance.setBranding(e);
  }
  brandingOptions() {
    const e = this._appearance._brandingOptions;
    return false !== e && { ...e, ..."object" == typeof e.padding ? { padding: { ...e.padding } } : {} };
  }
  setWatermarkOptions(e) {
    this._appearance.setWatermarkOptions(e);
  }
  watermarkOptions() {
    return { ...this._appearance._watermarkOptions };
  }
  _indicatorHost(e) {
    return this._studies._indicatorHost(e);
  }
  subscribeClick(e) {
    return vn(this._input._clickCbs, e);
  }
  subscribeCrosshairMove(e) {
    return vn(this._input._crosshairCbs, e);
  }
  setLinkedCrosshairIndex(e) {
    if (this.isDestroyed || null !== this._cursor) return;
    const t = null === e ? null : this._dataLayer.indexToTime(e) ?? null;
    if (t === this._input._readoutTime) return;
    this._input._readoutTime = t;
    for (const t2 of this._indicators) t2.updateLegendValues(e ?? void 0);
    const i2 = { source: "linked", time: t, index: e, bar: null === e || null === this._firstDataId.value ? null : A(this._dataLayer, this._firstDataId.value, e) ?? null, price: null, point: null, paneIndex: null };
    gn(this._input._crosshairCbs, i2), this._emit("crosshair:readout", i2);
  }
  _readoutIndex() {
    return null === this._input._readoutTime ? void 0 : this._dataLayer.timeToIndex(this._input._readoutTime);
  }
  subscribeDrag(e, t) {
    return vn(this._input._dragCbs, (i2) => {
      i2.end ? t?.(i2.id, i2.price, i2.time) : e(i2.id, i2.price, i2.time);
    });
  }
  _ensureScaled(e) {
    const t = this._panes[e];
    void 0 === t || t.readoutScale().scaled || t.autoscale(this._renderContext(e));
  }
  _xToTime(e) {
    return this._dataLayer.indexToTimeFloat(this._timeScale.xToIndex(e - this._leftAxisWidth));
  }
  timeToCoordinate(e) {
    return this._timeScale.indexToX(this._dataLayer.timeToIndexFloat(e)) + this._leftAxisWidth;
  }
  coordinateToTime(e) {
    return this._xToTime(e);
  }
  on(e, t) {
    return this._bus.on(e, t);
  }
  once(e, t) {
    return this._bus.once(e, t);
  }
  off(e, t) {
    this._bus.off(e, t);
  }
  emit(e, t) {
    this._bus.emit(e, t);
  }
  _emit(e, t) {
    this._bus.emit(e, t);
  }
  _mutateTimeScale(e) {
    this._timeScaleMutationDepth++;
    try {
      return e();
    } finally {
      this._timeScaleMutationDepth--;
    }
  }
  _emitViewport(e) {
    if (!this._bus.has(e)) return;
    const t = this._timeScale.visibleRange();
    this._emit(e, { from: this._dataLayer.indexToTime(Math.round(t.from)) ?? null, to: this._dataLayer.indexToTime(Math.round(t.to)) ?? null, logicalFrom: t.from, logicalTo: t.to });
  }
  _emitViewportIfMoved(e) {
    const t = this._timeScale.visibleRange();
    if (t.from === e.from && t.to === e.to) return;
    const i2 = Math.abs(t.to - t.from - (e.to - e.from)) > 1e-9;
    this._emitViewport(i2 ? "zoom" : "pan");
  }
  addPrimitive(e, t) {
    void 0 !== t && "number" != typeof t ? (this._anchored.push({ primitive: e, anchor: t.anchor }), this._primitives._addPrimitive(this._primitives._anchorTarget(t.anchor), e)) : this._primitives._addPrimitive("number" == typeof t ? t : this._primaryIndex(), e);
  }
  priceToCoordinate(e, t = this._primaryIndex()) {
    const i2 = this._layout._mappedPane(t);
    return i2 && this._paneLayout()[t].top + i2.priceToY(e);
  }
  coordinateToPrice(e, t = this._primaryIndex()) {
    const i2 = this._layout._mappedPane(t);
    return i2 && i2.yToPrice(e - this._paneLayout()[t].top);
  }
  plotRect(e) {
    const t = this._destroyed || this._layout._collapsedShown(e) ? void 0 : this._paneLayout()[e];
    if (!t || !Number.isSafeInteger(e)) return null;
    this._ensureScaled(e);
    const i2 = this._width - this._leftAxisWidth - this._rightAxisWidth, s2 = t.height - (e === this._bottomPaneIndex() ? this._timeAxisHeight : 0);
    return i2 > 0 && s2 > 0 ? { left: this._leftAxisWidth, top: t.top, width: i2, height: s2 } : null;
  }
  setGridOptions(e) {
    void 0 !== e.vertLines && (this._gridVert = e.vertLines), void 0 !== e.horzLines && (this._gridHorz = e.horzLines), this._canvas.grid = { ...this._canvas.grid, ...e }, this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setGridOptions");
  }
  gridOptions() {
    return { ...this._canvas.grid, vertLines: this._gridVert, horzLines: this._gridHorz };
  }
  setCanvasOptions(e) {
    this._withinLayoutChange(() => {
      e.grid && this.setGridOptions(e.grid), e.crosshair && (this._canvas.crosshair = { ...this._canvas.crosshair, ...e.crosshair }), e.scales && (this._canvas.scales = { ...this._canvas.scales, ...e.scales }), e.margins && (this._canvas.margins = { ...this._canvas.margins, ...e.margins }, this.setPriceScaleOptions(V(this._canvas.margins), "axes"));
    }), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setCanvasOptions");
  }
  canvasOptions() {
    return { ...this._canvas };
  }
  setPriceScaleOptions(e, t = "primary") {
    this._priceScaleOptions = { ...this._priceScaleOptions, ...e };
    for (const i2 of this._panes) {
      const s2 = "all" === t ? i2.scales() : "axes" === t ? i2.axisScales() : [i2.priceScale], r2 = this._scales._scalePatchFor(i2, e);
      for (const e2 of s2) e2.setOptions(r2);
    }
    this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setPriceScaleOptions");
  }
  priceScaleDefaults() {
    return { ...this._priceScaleOptions };
  }
  priceScaleOptions() {
    return { ...this._primaryPane.priceScale.options };
  }
  setAutoScale(e) {
    for (const t of this._panes) for (const { scaleId: i2 } of t.visibleAxes(this._emptyPriceAxis)) e && t.setRatioLock(i2, false, 0, 0), t.scaleFor(i2).setAutoScale(e);
    this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setAutoScale");
  }
  priceOnlyAutoScale() {
    return this._priceOnlyAutoScale;
  }
  setPriceOnlyAutoScale(e) {
    "boolean" == typeof e && e !== this._priceOnlyAutoScale && (this._priceOnlyAutoScale = e, this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._emit("objects:change", {}));
  }
  priceAxisState(e = this._primaryIndex(), t = "right") {
    return this._scales.priceAxisState(e, t);
  }
  priceAxisPlacement(e, t) {
    return N(t) ? this._priceAxisPane(e)?.axisPlacement(t) ?? null : null;
  }
  setPriceAxisPlacement(e, t, s2, r2) {
    const n2 = this._priceAxisPane(e);
    return !!(n2 && N(t) && n2.setAxisPlacement(t, s2, r2)) && (this._layout._recomputeAxisColumns(), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._emit("priceAxisPlacementChanged", { paneIndex: e, scaleId: t, ...n2.axisPlacement(t) }), this._emit("objects:change", {}), true);
  }
  priceAxisLayout(e = this._primaryIndex()) {
    return this._priceAxisPane(e)?.axisSlots(this._renderContext(e)).map((e2) => ({ ...e2, x: e2.x + this._leftAxisWidth })) ?? [];
  }
  _priceAxisPane(e) {
    return !this._destroyed && Number.isInteger(e) && e >= 0 ? this._panes[e] : void 0;
  }
  setPriceAxisOptions(e, t, s2) {
    const r2 = this._panes[e];
    void 0 !== r2 && N(t) && (r2.scaleFor(t).setOptions(s2), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setPriceAxisOptions"));
  }
  setPriceAxisAutoFit(e, t, s2) {
    const r2 = this._panes[e];
    void 0 !== r2 && N(t) && (s2 && r2.setRatioLock(t, false, 0, 0), r2.scaleFor(t).setAutoScale(s2), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setPriceAxisAutoFit"));
  }
  setPriceAxisLockRatio(e, t, s2) {
    const r2 = this._panes[e];
    if (void 0 === r2 || !N(t)) return false;
    s2 && this._scales._ensureScaledFor(e, t);
    const n2 = r2.setRatioLock(t, s2, this._timeScale.barSpacing, r2.scaleFor(t).height);
    return this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setPriceAxisLockRatio"), n2;
  }
  movePriceAxis(e, t, s2) {
    const r2 = this._panes[e];
    if (!this._scales._canMovePriceAxis(e, t, s2) || !r2.moveSeriesScale(t, s2)) return false;
    for (const e2 of this._indicatorRanges.values()) e2.pane === r2 && e2.scaleId === t && (e2.scaleId = s2);
    for (const t2 of this._indicators) {
      if (t2.paneIndex !== e) continue;
      const i2 = t2.renderResources().series.filter((e2) => !e2.overlay), n3 = t2.renderResources().primitives.filter((e2) => !e2.overlay && null !== r2.primitiveScaleId(e2.primitive));
      (i2.length ? i2.every((e2) => this._seriesRecords.get(e2.api)?.scaleId === s2) : n3.length && n3.every((e2) => r2.primitiveScaleId(e2.primitive) === s2)) && t2.adoptPriceScale(s2);
    }
    const n2 = r2.scaleFor(t);
    return this._priceScaleOptions && n2.setOptions(this._scales._scalePatchFor(r2, this._priceScaleOptions)), n2.setPriceFormatter(this._priceFormatter), this._layout._recomputeAxisColumns(), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._emit("priceAxisMoved", { paneIndex: e, from: t, to: s2 }), true;
  }
  setStatusLineOptions(e) {
    Object.assign(this._statusLine, e);
    for (const e2 of this._legends) e2.legend.setOptions({ statusLine: this._statusLine });
    this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setStatusLineOptions");
  }
  statusLineOptions() {
    return { ...this._statusLine };
  }
  indicatorLegendCollapsed() {
    return this._indicatorLegendCollapsed;
  }
  setIndicatorLegendCollapsed(e) {
    "boolean" == typeof e && e !== this._indicatorLegendCollapsed && (this._indicatorLegendCollapsed = e, this._legendStack._restackLegends(), this.invalidate((e2) => e2.invalidateGlobal(i.Cursor)), this._emit("objects:change", {}));
  }
  setLegendIconSize(e) {
    if (Number.isFinite(e)) {
      this._legendIconSize = e;
      for (const t of this._legends) t.legend.setOptions({ iconSize: e });
      this._layout._relayout(), this.invalidate((e2) => e2.invalidateGlobal(i.Full));
    }
  }
  legendIconSize() {
    return this._legendIconSize;
  }
  setAxisChromeOptions(e) {
    void 0 !== e.sessionClock && ("object" == typeof e.sessionClock && (this._sessionClockForm = { ...e.sessionClock }), this._axisChrome.sessionClock = true === e.sessionClock ? this._sessionClockForm ?? true : e.sessionClock), void 0 !== e.barCountdown && (this._axisChrome.barCountdown = e.barCountdown), void 0 !== e.clock && (this._axisChrome.clock = e.clock, this._wallClock = e.clock), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setAxisChromeOptions");
  }
  axisChromeOptions() {
    return { ...this._axisChrome };
  }
  crosshairMode() {
    return this._crosshairMode;
  }
  crosshairSnapToBar() {
    return this._crosshairSnapToBar;
  }
  movablePrimaryPane() {
    return this._movablePrimaryPane;
  }
  theme() {
    return this._theme;
  }
  takeScreenshot() {
    return this._appearance.takeScreenshot();
  }
  exportSVG(e = {}) {
    return this._appearance.exportSVG(e);
  }
  removePrimitive(e) {
    this._primitives.removePrimitive(e);
  }
  tradeHost(e) {
    return { addPrimitive: (t) => this._primitives._addPrimitive(e ?? this._primaryIndex(), t), removePrimitive: (e2) => this.removePrimitive(e2) };
  }
  get rendererKind() {
    return this._rendererKind ?? "canvas2d";
  }
  get renderer() {
    return this.rendererKind;
  }
  _newBackend() {
    const e = this._backendFactory() ?? Li("canvas2d")();
    if (null === e) throw new Error("openalgo-charts: the canvas2d render backend factory returned null");
    return null === this._rendererKind && (this._rendererKind = e.kind, null !== this._requestedRenderer && "auto" !== this._requestedRenderer && e.kind !== this._requestedRenderer && console.warn(`openalgo-charts: render backend "${this._requestedRenderer}" is unavailable on this device; using "${e.kind}"`)), e;
  }
  _fallbackToCanvas2d(e) {
    const t = this.rendererKind;
    this._backendFactory = Li("canvas2d");
    for (const e2 of this._panes) e2.setBackend(this._newBackend());
    this._rendererKind = "canvas2d";
    const s2 = { from: t, to: "canvas2d", reason: e };
    this._emit("renderer:fallback", s2), this.invalidate((e2) => e2.invalidateGlobal(i.Full));
  }
  setPriceFormatter(e) {
    this._priceFormatter = e;
    for (const t of this._panes) t.priceScale.setPriceFormatter(e);
    for (const e2 of this._panes) for (const t of e2.series()) void 0 !== t.style.precision && this._series._applyPrecision(e2.scaleOf(t), t.style.precision);
    this.invalidate((e2) => e2.invalidateGlobal(i.Full));
  }
  setTimeFormatter(e) {
    this._timeFormatter = e, this.invalidate((e2) => e2.invalidateGlobal(i.Full));
  }
  timezone() {
    return this._timezone;
  }
  setTimezone(e) {
    const t = ma(e);
    t !== this._timezone && (this._timezone = t, this._studies._invalidateIndicators(), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._emit("timezone:changed", { timezone: t }));
  }
  setPlacementMode(e) {
    this._input._placementMode = e, e && Yn(this);
  }
  beginPick(e, t, i2 = {}) {
    if (this._destroyed || this._destroying) throw new Error("Cannot pick on a destroyed chart");
    if (this._input._placementMode) throw new Error("Finish drawing placement before picking a study value");
    if (!ss(i2) || !rs(i2)) throw new TypeError("Invalid pick options");
    const s2 = Object.getOwnPropertyDescriptors(i2), r2 = s2.paneIndex?.value, n2 = s2.priceScaleId?.value;
    if (void 0 !== r2 && (!Number.isSafeInteger(r2) || r2 < 0 || !this._panes[r2])) throw new RangeError("Invalid pick pane");
    const o2 = r2 ?? (void 0 !== n2 ? this._layout._firstPaneSlot() : void 0);
    if (!(void 0 === n2 || "time" !== e && N(n2) && Object.prototype.hasOwnProperty.call(this._panes[o2]?.scaleStates() ?? {}, n2))) throw new RangeError("Invalid pick scale");
    return Jn(this, e, t, (t2) => {
      const i3 = t2, s3 = i3?.point, r3 = i3?.paneIndex;
      if (void 0 === r3 || !Number.isSafeInteger(r3) || !s3 || !Number.isFinite(s3.x) || !Number.isFinite(s3.y) || i3.viaDrag || void 0 !== i3.id && null !== i3.id || void 0 !== o2 && r3 !== o2) return null;
      const a = this._panes[r3], l2 = (this._paneLayout()[r3]?.height ?? 0) - (r3 === this._bottomPaneIndex() ? this._timeAxisHeight : 0);
      if (!a || s3.x < this._leftAxisWidth || s3.x >= this._width - this._rightAxisWidth || s3.y < 0 || s3.y >= l2) return null;
      if ("time" === e) return i3.time ?? null;
      this._ensureScaled(r3);
      const h2 = void 0 === n2 ? i3.price ?? null : Object.prototype.hasOwnProperty.call(a.scaleStates(), n2) ? a.scaleFor(n2).yToPrice(s3.y) : null;
      return "price" === e || null === h2 ? h2 : { time: i3.time ?? Number.NaN, price: h2 };
    });
  }
  setTheme(e) {
    this._theme = e, this._container.style.background = e.background, this._layout._syncSeparators(), this.invalidate((e2) => e2.invalidateGlobal(i.Full));
  }
  applyOptions(e) {
    this._appearance.applyOptions(e);
  }
  panes() {
    return this._panes;
  }
  getState() {
    return this._persistence.getState();
  }
  restoreState(e, t = {}) {
    return this._persistence.restoreState(e, t);
  }
  drawingState() {
    return this._drawingState;
  }
  setDrawingState(e) {
    this._drawingState = e, this._emit("objects:change", {});
  }
  snapPrice(e, t) {
    if (!Number.isFinite(t)) return t;
    if (null !== this._tickSchedule && e === this._primaryIndex()) return this._tickSchedule.round(t);
    const i2 = this._panes[e]?.priceScale.options.minMove ?? 0;
    return i2 > 0 ? l(t, i2) : t;
  }
  tickSchedule() {
    return this._tickSchedule;
  }
  setTickSchedule(e) {
    const t = e;
    if (null != t && ("function" != typeof t.round || "function" != typeof t.step)) throw new TypeError("chart.setTickSchedule takes a schedule built with new TickSchedule(bands), or null");
    this._tickSchedule = e ?? null, this._trading?.setTickSchedule(this._tickSchedule);
  }
  alertState() {
    return void 0 === this._alertState ? void 0 : bn(this._alertState);
  }
  setAlertState(e) {
    if (void 0 !== e) {
      if (1 !== e.version) throw new Error("Unsupported alert document");
      for (const t of e.alerts) un(t);
    }
    this._alertState = void 0 === e ? void 0 : { version: 1, alerts: e.alerts.map(_n) }, this._reserveAlertStudyIds(this._alertState, this._indicatorReservedIds);
  }
  _reserveAlertStudyIds(e, t) {
    for (const { source: i2 } of e?.alerts ?? []) "indicator" === i2.kind ? t.add(i2.instanceId) : "drawing" === i2.kind && i2.input && t.add(i2.input.instanceId);
  }
  invalidate(e) {
    null === this._pending && (this._pending = new s()), e(this._pending), 0 !== this._scaleMutationDepth || this._framing || this._loop.requestFrame();
  }
  applySize(e, t) {
    e === this._width && t === this._height || (this._width = e, this._height = t, this._layout._relayout(), this._hasFitContent || (this._hasFitContent = this._fitDefaultView()), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._emit("resize", { width: e, height: t }));
  }
  _bottomPaneIndex(e = false) {
    return this._layout._bottomPaneIndex(e);
  }
  setPaneWeight(e, t) {
    const s2 = this._panes[e];
    void 0 !== s2 && Number.isFinite(t) && (s2.weight = Math.max(0.05, t), this._layout._relayout(), this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._layoutChanged("setPaneWeight"));
  }
  paneWeight(e) {
    return this._panes[e]?.weight ?? 0;
  }
  removePane(e, t = {}) {
    return this._layout.removePane(e, t);
  }
  movePane(e, t) {
    return this._layout.movePane(e, t);
  }
  primaryPaneIndex() {
    return this._primaryIndex();
  }
  setPrimaryPaneIndex(e) {
    return this._layout.setPrimaryPaneIndex(e);
  }
  _primaryIndex() {
    return Math.max(0, this._panes.indexOf(this._primaryPane));
  }
  maximizePane(e) {
    return this._layout.maximizePane(e);
  }
  maximizedPane() {
    return this._layout._maximizedPane;
  }
  setPaneCollapsed(e, t) {
    return this._layout.setPaneCollapsed(e, t);
  }
  paneCollapsed(e) {
    return this._collapsed.has(this._panes[e]);
  }
  _handleLegendAction(e) {
    return this._legendStack._handleLegendAction(e);
  }
  _paneLayout() {
    return this._layout._paneLayout();
  }
  _navHints(e) {
    if (void 0 !== e?.hints) return e.hints;
    if (null === this._shortcuts) return {};
    const t = {};
    for (const e2 of this._shortcuts.list()) {
      if ("zoomIn" !== e2.command && "zoomOut" !== e2.command && "resetScale" !== e2.command) continue;
      const i2 = e2.combos[0];
      void 0 !== i2 && (t[e2.command] = ya(i2));
    }
    return t;
  }
  _syncTimeNavPane() {
    const e = this._timeNav;
    if (null === e) return;
    const t = this._bottomPaneIndex(true), i2 = this._panes.findIndex((t2) => t2.hasPrimitive(e));
    this._timeNavPane = t, t === i2 || t < 0 || (this._panes[i2]?.removePrimitive(e), this._primitives._addPrimitive(t, e));
  }
  _feedTimeNav(e) {
    const t = this._timeNav;
    null !== t && (t.setPointer(e), t.animating() && this.invalidate((e2) => e2.invalidateGlobal(i.Light)));
  }
  _renderContext(e) {
    return { timeScale: this._timeScale, dataLayer: this._dataLayer, priceOnlyAutoScale: this._priceOnlyAutoScale, primaryDataId: this._primary?.record.dataId, dpr: this._pixelRatio(), priceAxisWidth: this._rightAxisWidth, axisColumnWidth: this._axisColumnWidth, emptyPriceAxis: this._emptyPriceAxis, timeAxisHeight: this._timeAxisHeight, showTimeAxis: e === this._bottomPaneIndex(), collapsed: this._layout._collapsedShown(e), conflate: this._conflate, conflationFactor: this._conflationFactor, theme: this._theme, showVertGrid: this._gridVert, showHorzGrid: this._gridHorz, canvasOptions: this._canvas, timeFormatter: this._timeFormatter, timezone: this._timezone, leftAxisWidth: this._leftAxisWidth, hoverId: this._input._hoverId, hoverKey: this._input._hoverKey, dragId: this._input._dragId, sessionClock: this._sessionClockOptions(), barCountdown: this._barCountdownOptions(), stackSlot: (t) => this._primitives._stackSlot(e, t) };
  }
  _sessionClockOptions() {
    const e = this._axisChrome.sessionClock;
    if (void 0 !== e && false !== e) return { visible: true, now: this._wallClock, timezone: this._timezone, showOffset: true === e ? void 0 : e.showOffset };
  }
  _barCountdownOptions() {
    if (true !== this._axisChrome.barCountdown) return;
    const e = this._series._underlying(this._firstDataId.value)?.bars, t = void 0 === e ? this._dataLayer : { baseIndex: e.length - 1, indexToTime: (t2) => e[t2]?.time }, i2 = t.indexToTime(t.baseIndex);
    return void 0 !== i2 ? { visible: true, now: this._wallClock, lastBarTime: i2, intervalSec: si(t) } : void 0;
  }
  _paintNow() {
    this._rafInjected || this._destroyed || this._destroying || null === this._pending || this._scaleMutationDepth > 0 || (this._loop.stop(), this._onFrame());
  }
  _onFrame() {
    if (this._destroyed || this._destroying) return;
    this._framing = true;
    let e = false;
    try {
      e = this._motion._step(), this._studies._flushIndicators();
    } finally {
      this._framing = false;
    }
    const t = this._pending;
    this._pending = null;
    try {
      null === t || t.isEmpty() || this._paintFrame(t);
    } finally {
      e && !this._destroyed && this._loop.requestFrame();
    }
  }
  _paintFrame(e) {
    const t = e.globalLevel;
    let s2 = false;
    const r2 = this._motion._autoscaleFraction();
    let n2 = this._cursor?.x ?? 0;
    const o2 = this._firstDataId.value ?? this._primaryPane.series()[0]?.dataId;
    if (null !== this._cursor && this._crosshairSnapToBar && void 0 !== o2) {
      const e2 = Math.round(this._timeScale.xToIndex(n2));
      void 0 !== A(this._dataLayer, o2, e2) && (n2 = this._timeScale.indexToX(e2));
    }
    for (let o3 = 0; o3 < this._panes.length; o3++) {
      const a2 = this._panes[o3], l2 = e.paneInvalidation(o3), h2 = Math.max(t, l2?.level ?? i.None), c2 = this._renderContext(o3);
      if ((h2 >= i.Full || l2?.autoScale || null !== this._motion._autoscaleTime) && (s2 = a2.autoscale(c2, r2) || s2), h2 >= i.Light && a2.paintBase(c2), h2 >= i.Cursor && !this._input._overlayFrozen) {
        const e2 = null === this._cursor ? null : { x: n2, yLocal: o3 === this._input._cursorPane ? this._cursor.y : null, showTimeTag: c2.showTimeAxis };
        a2.paintTop(e2, c2);
      }
    }
    s2 ? this.invalidate((e2) => e2.invalidateGlobal(i.Light)) : this._motion._autoscaleTime = null;
    const a = this._timeNav;
    if (a?.animating() && !this._schedulingTimeNav && (!this._input._overlayFrozen || "top" !== a.zOrder()) && this._panes[this._timeNavPane]?.primitives().includes(a)) {
      this._schedulingTimeNav = true;
      try {
        this.invalidate((e2) => e2.invalidateGlobal(i.Light));
      } finally {
        this._schedulingTimeNav = false;
      }
    }
    if (null !== this._rendererKind && "canvas2d" !== this._rendererKind) for (const e2 of this._panes) {
      const t2 = e2.backendDegradation;
      if (null !== t2) {
        this._fallbackToCanvas2d(t2);
        break;
      }
    }
  }
  _runShortcut(e) {
    return this._input._runShortcut(e);
  }
  get _cursor() {
    return this._input._cursor;
  }
  resetScale() {
    this._motion._stopNavigationMotion();
    const e = this._timeScale.visibleRange();
    this._hasFitContent = this._fitDefaultView();
    for (const e2 of this._panes) {
      e2.clearRatioLocks();
      for (const t of e2.scales()) t.setAutoScale(true);
    }
    this.invalidate((e2) => e2.invalidateGlobal(i.Full)), this._emitViewportIfMoved(e);
  }
  downloadScreenshot(e = "chart.png") {
    try {
      const t = this.takeScreenshot(), i2 = this._doc.createElement("a");
      i2.href = t.toDataURL("image/png"), i2.download = e, i2.click();
    } catch {
    }
  }
  _updateAccessibleSummary() {
    if (null === this._liveRegion) return;
    const e = this._dataLayer.length;
    let t = `${e} bar${1 === e ? "" : "s"}`;
    if (null !== this._firstDataId.value && this._panes.includes(this._primaryPane)) {
      const e2 = this._dataLayer.lastIndexedBar(this._firstDataId.value);
      null !== e2 && (t += `, latest price ${this._primaryPane.priceScale.format(e2.bar.close)}`);
    }
    this._liveRegion.textContent = `Financial chart, ${t}`;
  }
  _maybeLoadHistory() {
    if (null === this._historyLoader || this._loadingHistory) return;
    const e = this._timeScale.visibleRange();
    e.from < 10 && (this._loadingHistory = true, this._emit("lazy-load", { from: this._dataLayer.indexToTime(Math.round(e.from)) ?? null, to: this._dataLayer.indexToTime(Math.round(e.to)) ?? null, direction: "backward" }), this._historyLoader());
  }
  _startKinetic(e) {
    this._motion._startKinetic(e);
  }
  get isDestroyed() {
    return this._destroyed;
  }
  destroy() {
    if (!this._destroyed && !this._destroying) {
      this._destroying = true, this._barsRequests.abort(), this._timeScale.setChangeHandler(null), this._loop.stop(), null !== this._remeasureHandle && (this._raf.cancel(this._remeasureHandle), this._remeasureHandle = null), this._motion._stopNavigationMotion();
      for (const e of this._indicators.splice(0)) e.remove({ force: true });
      this._pixels._resizeObserver?.disconnect(), this._pixels._resizeObserver = null, this._pixels._deviceObserver?.disconnect(), this._pixels._deviceObserver = null, this._pixels._unwatchPixelRatio(), this._input._detachInput(), this._liveRegion?.remove(), this._liveRegion = null, this._container.style.cursor = "", this._input._pointers.clear();
      for (const e of this._panes) e.destroy();
      this._panes.length = 0, this._seriesProvenance.clear(), this._destroyed = true, this._emit("destroy", {}), this._bus.clear();
    }
  }
};
function va(e, t = {}) {
  return new ga(e, t);
}
function ya(e) {
  const t = { Equal: "+", Minus: "-", NumpadAdd: "+", NumpadSubtract: "-", ArrowLeft: "<", ArrowRight: ">", ArrowUp: "^", ArrowDown: "v" };
  return e.split("+").map((e2) => e2.trim()).map((e2) => "Mod" === e2 ? Sn() ? "Cmd" : "Ctrl" : t[e2] ?? e2.replace(/^(Key|Digit)/, "")).join(" + ");
}
var Ia = ["open", "high", "low", "close", "volume", "oi"];
var Ma = ["time", ...Ia];
var Ea = Object.freeze([]);
var Da = /* @__PURE__ */ new Set([..."precision priceLineVisible lastValueVisible colorByPreviousClose upColor downColor bodyVisible borderUpColor borderDownColor borderVisible wickUpColor wickDownColor wickVisible topColor bottomColor closeColor color lineWidth lineStyle areaTopColor areaBottomColor".split(" ").map((e) => `symbol.${e}`), ..."titleMode title logo marketStatus chartValues barChange volume openInterest lastDayChange lastValueLabel background backgroundColor backgroundOpacity".split(" ").map((e) => `statusLine.${e}`), ..."visible color opacity fontSize".split(" ").map((e) => `watermark.${e}`), ..."mode autoScale priceOnly inverted".split(" ").map((e) => `scales.${e}`), "axisChrome.sessionClock", "axisChrome.barCountdown", ..."grid.vertLines grid.vertColor grid.vertStyle grid.horzLines grid.horzColor grid.horzStyle grid.lineWidth grid.spacing crosshairMode crosshairSnapToBar crosshair.color crosshair.style crosshair.width scales.textColor scales.fontSize scales.lineColor margins.top margins.bottom".split(" ").map((e) => `canvas.${e}`)]);
var Ya = [{ label: "Default", value: "default" }, ...Array.from({ length: 9 }, (e, t) => ({ label: String(t), value: String(t) }))];
var al = { linear: "Linear", logarithmic: "Logarithmic", percentage: "Percent", "indexed-to-100": "Indexed to 100" };
var ll = m.map((e) => ({ label: al[e], value: e }));
var Ol = 2147483647;
function Il(e, t) {
  const i2 = setTimeout(e, Math.min(Ol, t));
  return i2.unref?.(), i2;
}
function mh(e, t = 14) {
  if (t <= 0) throw new Error("openalgo-charts: RSI period must be > 0");
  const i2 = e.length, s2 = new Array(i2).fill(NaN);
  if (i2 <= t || !Number.isInteger(t)) return s2;
  let r2 = NaN, n2 = NaN, o2 = false, a = false, l2 = 0;
  for (let h2 = 1; h2 < i2; h2++) {
    const i3 = e[h2] - e[h2 - 1];
    if (!Number.isFinite(i3)) {
      l2 = 0;
      continue;
    }
    l2++;
    if (o2 && (r2 = (r2 * (t - 1) + (i3 > 0 ? i3 : 0)) / t), a && (n2 = (n2 * (t - 1) + (i3 < 0 ? -i3 : 0)) / t), (!o2 || !a) && l2 >= t) {
      let i4 = 0, s3 = 0;
      for (let r3 = h2 - t + 1; r3 <= h2; r3++) {
        const t2 = e[r3] - e[r3 - 1];
        t2 >= 0 ? i4 += t2 : s3 -= t2;
      }
      !o2 && Number.isFinite(i4 / t) && (r2 = i4 / t, o2 = true), !a && Number.isFinite(s3 / t) && (n2 = s3 / t, a = true);
    }
    if (Number.isFinite(r2) && Number.isFinite(n2)) {
      const e2 = 0 === n2 ? 100 : 100 - 100 / (1 + r2 / n2);
      Number.isFinite(e2) && (s2[h2] = e2);
    }
  }
  return s2;
}
function gh(e, t, i2) {
  const s2 = e.length, r2 = new Array(s2);
  if (0 === s2) return r2;
  r2[0] = e[0] - t[0];
  for (let n2 = 1; n2 < s2; n2++) {
    const s3 = e[n2] - t[n2], o2 = Math.abs(e[n2] - i2[n2 - 1]), a = Math.abs(t[n2] - i2[n2 - 1]);
    r2[n2] = Math.max(s3, o2, a);
  }
  return r2;
}
function vh(e, t, i2, s2 = 14) {
  if (s2 <= 0) throw new Error("openalgo-charts: ATR period must be > 0");
  const r2 = gh(e, t, i2), n2 = r2.length, o2 = new Array(n2).fill(NaN);
  if (n2 < s2 || !Number.isInteger(s2)) return o2;
  let a = NaN, l2 = 0;
  for (let e2 = 0; e2 < n2; e2++) {
    const t2 = r2[e2];
    if (Number.isFinite(t2)) {
      if (l2++, Number.isNaN(a)) {
        if (l2 >= s2) {
          let t3 = 0;
          for (let i3 = e2 - s2 + 1; i3 <= e2; i3++) t3 += r2[i3];
          Number.isFinite(t3 / s2) && (a = t3 / s2);
        }
      } else a = (a * (s2 - 1) + t2) / s2;
      Number.isFinite(a) && (o2[e2] = a);
    } else l2 = 0;
  }
  return o2;
}
function yh(e, t = 10, i2 = 3) {
  const s2 = e.length, r2 = e.map(() => ({ value: NaN, direction: 1 })), n2 = e.map((e2) => e2.high), o2 = e.map((e2) => e2.low), a = e.map((e2) => e2.close), l2 = vh(n2, o2, a, t);
  let h2 = NaN, c2 = NaN, d2 = NaN, u2 = NaN, _3 = false;
  for (let e2 = 0; e2 < s2; e2++) {
    if (!Number.isFinite(l2[e2]) || !Number.isFinite(a[e2])) continue;
    const t2 = (n2[e2] + o2[e2]) / 2, s3 = t2 + i2 * l2[e2], p2 = t2 - i2 * l2[e2], f2 = _3 ? s3 < h2 || u2 > h2 ? s3 : h2 : s3, m2 = _3 ? p2 > c2 || u2 < c2 ? p2 : c2 : p2;
    let b2, g2;
    _3 && d2 !== h2 ? a[e2] >= m2 ? (b2 = m2, g2 = -1) : (b2 = f2, g2 = 1) : a[e2] <= f2 ? (b2 = f2, g2 = 1) : (b2 = m2, g2 = -1), r2[e2] = { value: b2, direction: g2 }, h2 = f2, c2 = m2, d2 = b2, u2 = a[e2], _3 = true;
  }
  return r2;
}
var zh = (e) => (t) => {
  throw new Error(`Invalid ${e}: ${t}`);
};
var Eh = zh("instrument");
var gd;
function vd() {
  if (!gd) {
    gd = new Map([{ id: "bullish", title: "Bullish bar", when: ({ bars: e, index: t }) => e[t].close > e[t].open }, { id: "bearish", title: "Bearish bar", when: ({ bars: e, index: t }) => e[t].close < e[t].open }, { id: "inside", title: "Inside bar", when: ({ bars: e, index: t }) => t > 0 && e[t].high < e[t - 1].high && e[t].low > e[t - 1].low }, { id: "outside", title: "Outside bar", when: ({ bars: e, index: t }) => t > 0 && e[t].high > e[t - 1].high && e[t].low < e[t - 1].low }, { id: "gap-up", title: "Gap up", when: ({ bars: e, index: t }) => t > 0 && e[t].low > e[t - 1].high }, { id: "gap-down", title: "Gap down", when: ({ bars: e, index: t }) => t > 0 && e[t].high < e[t - 1].low }].map((e) => [e.id, Object.freeze(e)]));
  }
  return gd;
}
function xd(e) {
  return vd().get(e);
}
var Pd = { armed: "#3b82f6", triggered: "#22c55e", disabled: "#64748b", expired: "#d97706" };
function Od(e, t) {
  return t ? "Paused" : "armed" === e ? "Alert" : e[0].toUpperCase() + e.slice(1);
}
var kd = class extends En {
  constructor() {
    super(...arguments), Object.defineProperty(this, "_movable", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_committedPrice", { enumerable: true, configurable: true, writable: true, value: this.price }), Object.defineProperty(this, "_context", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_resolveScale", { enumerable: true, configurable: true, writable: true, value: (e) => e.priceScale }), Object.defineProperty(this, "_canAutoscale", { enumerable: true, configurable: true, writable: true, value: () => true });
  }
  bind(e, t, i2, s2) {
    this._movable = e, this._committedPrice = t, this._resolveScale = i2, this._canAutoscale = s2;
  }
  zOrder() {
    return "top";
  }
  autoscaleInfo() {
    return this._canAutoscale() ? this._context && this._resolveScale(this._context) !== this._context.priceScale ? null : { min: this._committedPrice, max: this._committedPrice } : null;
  }
  draw(e, t) {
    this._context = t;
    const i2 = this._resolveScale(t);
    e.save(), i2 !== t.priceScale && (e.beginPath(), e.rect(0, 0, t.plotWidth * t.dpr, t.plotHeight * t.dpr), e.clip()), super.draw(e, { ...t, priceScale: i2 }), e.restore();
  }
  hitTest(e, t, i2) {
    this._context = i2;
    const s2 = this._movable ? super.hitTest(e, t, { ...i2, priceScale: this._resolveScale(i2) }) : null;
    return s2 ? { ...s2, zOrder: "top", draggable: true, cancelOnEscape: true } : null;
  }
  coordinateToPrice(e) {
    return this._context ? this._resolveScale(this._context).yToPrice(e) : void 0;
  }
};
function Id(e) {
  const t = /^alert:(.+):(\d+)$/.exec(e);
  if (null === t) return null;
  const i2 = Number(t[2]);
  return 0 === i2 || 1 === i2 ? { id: t[1], index: i2 } : null;
}
var Md = class {
  constructor(e) {
    Object.defineProperty(this, "_chart", { enumerable: true, configurable: true, writable: true, value: e }), Object.defineProperty(this, "_lines", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() });
  }
  update(e, t, i2, s2) {
    if (!this._chart.addPrimitive || !this._chart.removePrimitive) return;
    if (!t) return void this.remove(e.id);
    const r2 = void 0 === t.upperPrice ? [t.price] : [t.price, t.upperPrice], n2 = function(e2) {
      return "price" === e2.source.kind || "indicator" === e2.source.kind;
    }(e) && "armed" === e.state && !i2, { source: o2 } = e, a = () => "indicator" === o2.kind ? this._chart.indicators?.().find((e2) => e2.id === o2.instanceId)?.series(o2.plotKey)?.priceScale() : "price" === o2.kind ? this._chart.primarySeries?.()?.priceScale() : void 0, l2 = (e2) => "indicator" === o2.kind ? a() ?? e2.priceScale : "price" === o2.kind ? e2.readoutPriceScale ?? e2.priceScale : e2.priceScale, h2 = () => {
      const e2 = this._chart.panes?.()[t.paneIndex]?.priceScale;
      return void 0 === e2 || (a() ?? e2) === e2;
    };
    let c2 = this._lines.get(e.id);
    !c2 || c2.pane === t.paneIndex && c2.lines.length === r2.length || (this.remove(e.id), c2 = void 0), c2 || (c2 = { pane: t.paneIndex, lines: [] }, this._lines.set(e.id, c2));
    for (let o3 = 0; o3 < r2.length; o3++) {
      const a2 = { price: r2[o3], color: Pd[e.state], lineStyle: "armed" === e.state ? "dashed" : "dotted", badge: Od(e.state, i2), leftLabel: e.title + (void 0 === s2 ? "" : ` (${s2})`) + (2 === r2.length ? 0 === o3 ? " (lower)" : " (upper)" : ""), cursor: n2 ? "ns-resize" : void 0 }, d2 = c2.lines[o3];
      if (d2) {
        d2.bind(n2, r2[o3], l2, h2);
        const e2 = d2.options();
        Object.entries(a2).some(([t2, i3]) => e2[t2] !== i3) && d2.setOptions(a2);
      } else {
        const i3 = new kd({ ...a2, id: `alert:${e.id}:${o3}` });
        i3.bind(n2, r2[o3], l2, h2), c2.lines.push(i3), this._chart.addPrimitive(i3, t.paneIndex);
      }
    }
  }
  preview(e, t) {
    const i2 = Id(e);
    i2 && this._lines.get(i2.id)?.lines[i2.index]?.setPrice(t);
  }
  coordinateToPrice(e, t) {
    const i2 = Id(e);
    return i2 ? this._lines.get(i2.id)?.lines[i2.index]?.coordinateToPrice(t) : void 0;
  }
  remove(e) {
    const t = this._lines.get(e);
    if (t) {
      this._lines.delete(e);
      for (const e2 of t.lines) this._chart.removePrimitive?.(e2);
    }
  }
  destroy() {
    for (const e of this._lines.keys()) this.remove(e);
  }
};
var Td = /* @__PURE__ */ new WeakSet();
var Cd = 1;
var jd = (e) => {
  const t = e.getDataContext();
  let i2 = t?.variant;
  try {
    i2 = nn(i2);
  } catch {
  }
  return { symbol: t?.symbol, exchange: t?.exchange, interval: t?.interval, ...i2 ? { variant: { ...i2 } } : {} };
};
var Ad = (e) => {
  try {
    return on(e.variant);
  } catch {
    return "invalid";
  }
};
var Ld = (e, t) => e.symbol === t.symbol && e.exchange === t.exchange;
var Nd = (e, t) => Ld(e, t) && e.interval === t.interval && Ad(e) === Ad(t);
var Rd = class {
  constructor(e, t = {}) {
    if (Object.defineProperty(this, "_chart", { enumerable: true, configurable: true, writable: true, value: e }), Object.defineProperty(this, "_records", { enumerable: true, configurable: true, writable: true, value: /* @__PURE__ */ new Map() }), Object.defineProperty(this, "_hovered", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_off", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_now", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_drawings", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_spentLines", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_visuals", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_timer", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_timerAt", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "_paused", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_restoring", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_replay", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_destroyed", { enumerable: true, configurable: true, writable: true, value: false }), Object.defineProperty(this, "_revision", { enumerable: true, configurable: true, writable: true, value: 0 }), Object.defineProperty(this, "_drag", { enumerable: true, configurable: true, writable: true, value: void 0 }), Td.has(e)) throw new Error("An alert controller already owns this chart");
    this._now = t.now ?? (() => Date.now() / 1e3), this._drawings = t.drawings, this._spentLines = t.spentLines ?? "show", this._visuals = false === t.visuals ? void 0 : new Md(e), Td.add(e), this._off = [e.on("data:update", (e2) => this._onData(e2)), e.on("data:context", (e2) => {
      (function(e3) {
        return "object" == typeof e3 && null !== e3 && true === e3[hn];
      })(e2) || this._seedAll();
    }), e.on("objects:change", () => this._onObjects()), e.on("paneMoved", () => this._onObjects()), e.on("state:restore:start", () => {
      this._hovered = void 0, this._cancelDrag(), this._restoring = true, this._revision++;
    }), e.on("state:restore:end", () => {
      this._restoring = false, this._seedAll();
    }), e.on("alerts:restore", (e2) => this.fromJSON(e2)), e.on("replay:start", () => {
      this._replay = true, this._seedAll();
    }), e.on("replay:stop", () => {
      this._replay = false, this._seedAll();
    }), e.on("destroy", () => this.destroy()), e.on("drag:start", (e2) => this._startDrag(e2)), e.on("hover", (e2) => {
      const t2 = e2?.id, i2 = "string" == typeof t2 ? Id(t2) : null;
      this._hovered = null !== i2 && this._records.has(i2.id) ? i2.id : void 0;
    }), e.on("drag", (e2) => this._onDrag(e2, false)), e.on("drag:end", (e2) => this._onDrag(e2, true)), e.on("drag:cancel", (e2) => {
      e2.id === this._drag?.externalId && this._cancelDrag();
    })];
    try {
      const t2 = e.alertState?.();
      void 0 !== t2 && this.fromJSON(t2);
    } catch (e2) {
      throw this.destroy(), e2;
    }
  }
  _dragAvailability(e, t) {
    const i2 = e.alert.source;
    return this._destroyed || this._restoring || "armed" !== e.alert.state || this._records.get(e.alert.id) !== e || "price" !== i2.kind && "indicator" !== i2.kind || 0 !== t && (1 !== t || void 0 === ("price" === i2.kind ? i2.upperPrice : i2.upperValue)) ? { available: false } : this.availability(e.alert.id);
  }
  hovered() {
    const e = void 0 === this._hovered ? void 0 : this._records.get(this._hovered);
    return e && this._dragAvailability(e, 0).available ? e.alert.id : void 0;
  }
  _dragPrice(e, t, i2) {
    const s2 = e.point?.y, r2 = ("number" == typeof s2 && Number.isFinite(s2) ? this._visuals?.coordinateToPrice(t, s2) : void 0) ?? e.price;
    if ("number" != typeof r2 || !Number.isFinite(r2)) return;
    const n2 = Id(t), o2 = n2 && this._records.get(n2.id)?.alert.source, a = "price" === o2?.kind ? this._chart.primarySeries?.()?.priceScale() : "indicator" === o2?.kind ? this._chart.indicators?.().find((e2) => e2.id === o2.instanceId)?.series(o2.plotKey)?.priceScale() : void 0, h2 = i2 ?? e.paneIndex, c2 = "price" === o2?.kind ? this._chart.tickSchedule?.() ?? null : null, d2 = c2 ? c2.round(r2) : a ? l(r2, a.options.minMove) : "number" == typeof h2 ? this._chart.snapPrice?.(h2, r2) ?? r2 : r2;
    let u2 = Number.isFinite(d2) ? d2 : r2;
    if (n2 && ("price" === o2?.kind || "indicator" === o2?.kind)) {
      const e2 = 0 === n2.index ? "price" === o2.kind ? o2.upperPrice : o2.upperValue : "price" === o2.kind ? o2.price : o2.value;
      if (void 0 !== e2 && (0 === n2.index ? u2 > e2 : u2 < e2)) {
        u2 = e2;
        const t2 = a?.options.minMove ?? 0;
        if (c2) u2 = c2.round(e2), (0 === n2.index ? u2 > e2 : u2 < e2) && (u2 = c2.step(u2, 0 === n2.index ? -1 : 1));
        else if (t2 > 0) {
          u2 = l(e2, t2);
          const i3 = Number.EPSILON * Math.max(1, Math.abs(e2)) * 4;
          Math.abs(u2 - e2) <= i3 ? u2 = e2 : (0 === n2.index ? u2 > e2 : u2 < e2) && (u2 = l(e2 + (0 === n2.index ? -t2 : t2), t2));
        } else if (!a && "number" == typeof h2 && this._chart.snapPrice && (u2 = this._chart.snapPrice(h2, e2), !Number.isFinite(u2) || (0 === n2.index ? u2 > e2 : u2 < e2))) return;
      }
    }
    return u2;
  }
  _startDrag(e) {
    if (this._cancelDrag(), "string" != typeof e.id) return;
    const t = Id(e.id), i2 = t && this._records.get(t.id);
    if (!t || !i2) return;
    const s2 = this._dragAvailability(i2, t.index), r2 = this._dragPrice(e, e.id, s2.paneIndex);
    !s2.available || void 0 === s2.paneIndex || void 0 === r2 || void 0 !== e.paneIndex && e.paneIndex !== s2.paneIndex || (this._drag = { externalId: e.id, record: i2, index: t.index, paneIndex: s2.paneIndex, startPrice: r2, startY: "number" == typeof e.point?.y ? e.point.y : void 0, moved: false });
  }
  _cancelDrag(e) {
    const t = this._drag;
    if (!t || void 0 !== e && t.record.alert.id !== e) return;
    this._drag = void 0;
    const i2 = this._records.get(t.record.alert.id);
    i2 && this._syncVisual(i2);
  }
  _onDrag(e, t) {
    this._expireDue();
    const i2 = this._drag;
    if (!i2 || e.id !== i2.externalId) return;
    const s2 = this._dragAvailability(i2.record, i2.index);
    if (!s2.available || s2.paneIndex !== i2.paneIndex || void 0 !== e.paneIndex && e.paneIndex !== i2.paneIndex) return void this._cancelDrag();
    const r2 = this._dragPrice(e, i2.externalId, i2.paneIndex);
    if (void 0 === r2) return void (t && this._cancelDrag());
    const n2 = e.point?.y;
    i2.moved || (i2.moved = void 0 !== i2.startY && "number" == typeof n2 ? n2 !== i2.startY : r2 !== i2.startPrice);
    const o2 = i2.record.alert.source;
    if ("price" !== o2.kind && "indicator" !== o2.kind) return void this._cancelDrag();
    const a = "price" === o2.kind ? o2.price : o2.value, l2 = "price" === o2.kind ? o2.upperPrice : o2.upperValue, h2 = 0 === i2.index ? Math.min(r2, l2 ?? 1 / 0) : Math.max(r2, a);
    if (!t) return void (i2.moved && this._visuals?.preview(i2.externalId, h2));
    if (this._cancelDrag(), !i2.moved || h2 === (0 === i2.index ? a : l2)) return;
    const c2 = "price" === o2.kind ? { ...o2, ...0 === i2.index ? { price: h2 } : { upperPrice: h2 } } : { ...o2, ...0 === i2.index ? { value: h2 } : { upperValue: h2 } };
    this.update(i2.record.alert.id, { source: c2 }), this._chart.emit("alerts:changed", { id: i2.record.alert.id, reason: "dragged" });
  }
  add(e) {
    this._assertAlive();
    let t = e.id;
    if (void 0 === t) do {
      t = "alert-" + Cd++;
    } while (this._records.has(t));
    if (this._records.has(t)) throw new Error(`Duplicate alert id: ${t}`);
    const i2 = { ...e, id: t, source: { ...e.source }, condition: e.condition ?? ("barCondition" === e.source.kind ? "matches" : "crossing"), policy: e.policy ?? "onBarClose", repeat: e.repeat ?? "once", state: e.state ?? "armed", title: e.title ?? "Chart alert", cooldownSeconds: e.cooldownSeconds ?? 0, scope: jd(this._chart) };
    un(i2), i2.source = _n(i2).source, "armed" === i2.state && void 0 !== i2.expiresAt && this._now() >= i2.expiresAt && (i2.state = "expired");
    const s2 = { alert: i2 };
    return this._seed(s2), this._records.set(t, s2), this._syncVisual(s2), this._scheduleExpiry(), this._saveState(), this._chart.emit("alert:created", { alert: _n(i2) }), _n(i2);
  }
  update(e, t) {
    this._assertAlive();
    const i2 = this._records.get(e);
    if (!i2) return;
    const s2 = { ...i2.alert, ...t, id: e, source: { ...t.source ?? i2.alert.source } };
    un(s2), s2.source = _n(s2).source, this._cancelDrag(e), "armed" === s2.state && void 0 !== s2.expiresAt && this._now() >= s2.expiresAt && (s2.state = "expired");
    const r2 = { ...i2, alert: s2 };
    return this._seed(r2), this._records.set(e, r2), this._syncVisual(r2), this._scheduleExpiry(), this._saveState(), this._chart.emit("alert:updated", { alert: _n(s2) }), _n(s2);
  }
  remove(e) {
    return this._remove(e, "removed");
  }
  _remove(e, t) {
    const i2 = this._records.get(e);
    return !!i2 && (this._cancelDrag(e), this._records.delete(e), this._hovered === e && (this._hovered = void 0), this._visuals?.remove(e), this._scheduleExpiry(), this._saveState(), this._chart.emit("alert:removed", { alert: _n(i2.alert), reason: t }), true);
  }
  list() {
    return [...this._records.values()].map((e) => _n(e.alert));
  }
  toJSON() {
    return bn({ version: 1, alerts: this.list() });
  }
  fromJSON(e) {
    this._assertAlive();
    const t = bn(e), i2 = /* @__PURE__ */ new Map(), s2 = [], r2 = jd(this._chart);
    for (const e2 of t.alerts) {
      const t2 = e2.source;
      let n2;
      this._drawingGone(e2, r2) && (n2 = "drawing-missing");
      const o2 = "indicator" === t2.kind ? t2 : "drawing" === t2.kind ? t2.input : void 0;
      if (!n2 && o2 && this._chart.indicators) {
        const e3 = this._chart.indicators().find((e4) => e4.id === o2.instanceId);
        e3 ? e3.series(o2.plotKey) || (n2 = "plot-missing") : n2 = "indicator-missing";
      }
      if (n2) {
        s2.push({ alert: e2, reason: n2 });
        continue;
      }
      if ("armed" === e2.state && void 0 !== e2.expiresAt && this._now() >= e2.expiresAt && (e2.state = "expired"), void 0 !== e2.lastTriggeredTime) {
        const t3 = "onTouch" === e2.policy ? "lastTouchedTime" : "lastClosedTime";
        e2[t3] = Math.max(e2[t3] ?? -1 / 0, e2.lastTriggeredTime);
      }
      const a = { alert: e2 };
      this._seed(a), i2.set(e2.id, a);
    }
    this._cancelDrag(), this._revision++, this._visuals?.destroy(), this._hovered = void 0, this._records.clear();
    for (const [e2, t2] of i2) this._records.set(e2, t2), this._syncVisual(t2);
    this._scheduleExpiry(), this._saveState();
    for (const e2 of s2) {
      if (this._destroyed) break;
      this._chart.emit("alert:removed", { ...e2, alert: _n(e2.alert) });
    }
    this._destroyed || this._chart.emit("alerts:restored", { alerts: this.list() });
  }
  _saveState() {
    this._destroyed || this._chart.setAlertState?.({ version: 1, alerts: this.list() });
  }
  availability(e) {
    const t = this._records.get(e);
    if (!t) return { available: false, reason: "Alert is unavailable" };
    if (this._paused || this._replay) return { available: false, reason: "Alerts are paused" };
    const i2 = jd(this._chart);
    if (!Ld(t.alert.scope, i2)) return { available: false, reason: "Instrument context differs" };
    if (t.alert.scope.interval !== i2.interval) return { available: false, reason: `Switch to ${t.alert.scope.interval ?? "the original timeframe"} to evaluate this alert` };
    if (Ad(t.alert.scope) !== Ad(i2)) return { available: false, reason: "Switch to the data variant this alert was set on to evaluate it" };
    const { source: s2 } = t.alert, r2 = this._chart.primaryBars();
    if ("drawing" === s2.kind) {
      const e2 = this._drawings?.alertInfo(s2.drawingId);
      if (!e2?.available) return { available: false, reason: e2?.reason ?? "Drawing provider is unavailable" };
      if (e2.paneIndex !== this._pricePane() && !s2.input) return { available: false, reason: "Select an input plot for this drawing pane" };
      const i3 = this._drawingValue(t.alert, r2[r2.length - 1]?.time);
      return i3 ? { available: true, paneIndex: i3.paneIndex } : { available: false, reason: "Drawing level, time, input plot or condition is unavailable", paneIndex: e2.paneIndex };
    }
    if ("indicator" === s2.kind) {
      const e2 = this._plot(s2);
      return e2.values ? Number.isFinite(e2.values[r2.length - 1]) ? { available: true, paneIndex: e2.paneIndex } : { available: false, reason: "Plot value is unavailable", paneIndex: e2.paneIndex } : { available: false, reason: e2.reason };
    }
    return "barCondition" !== s2.kind || xd(s2.id) ? r2.length ? { available: true, paneIndex: this._pricePane() } : { available: false, reason: "Source data is unavailable" } : { available: false, reason: "Bar condition is unavailable" };
  }
  enable(e) {
    return this.update(e, { state: "armed" });
  }
  disable(e) {
    return this.update(e, { state: "disabled" });
  }
  setPaused(e) {
    this._assertAlive(), this._paused !== e && (this._paused = e, this._seedAll());
  }
  destroy() {
    if (!this._destroyed) {
      this._destroyed = true, this._drag = void 0, this._revision++;
      for (const e of this._off) e();
      this._clearTimer(), this._visuals?.destroy(), this._hovered = void 0, this._records.clear(), Td.delete(this._chart);
    }
  }
  _drawingGone(e, t) {
    const i2 = e.source;
    return "drawing" === i2.kind && void 0 !== this._drawings && Ld(e.scope, t) && null == this._drawings.get(i2.drawingId);
  }
  _pricePane() {
    return this._chart.primaryPaneIndex?.() ?? 0;
  }
  _assertAlive() {
    if (this._destroyed) throw new Error("Alert controller is destroyed");
  }
  _seed(e) {
    if (!Nd(e.alert.scope, jd(this._chart))) return e.tail = void 0, e.index = void 0, e.value = void 0, void (e.plotPane = void 0);
    const t = this._chart.primaryBars(), i2 = t[t.length - 1];
    if (e.tail = i2 ? { ...i2 } : void 0, e.index = i2 ? t.length - 1 : void 0, "indicator" === e.alert.source.kind) {
      const i3 = this._plot(e.alert.source);
      e.value = this._reading(i3.values, t.length - 1), e.plotPane = i3.paneIndex;
    } else "drawing" === e.alert.source.kind && e.alert.source.input && (e.value = this._reading(this._plot(e.alert.source.input).values, t.length - 1));
    const s2 = t[t.length - 2]?.time;
    void 0 !== s2 && (e.alert.lastClosedTime = Math.max(e.alert.lastClosedTime ?? -1 / 0, s2));
  }
  _seedAll() {
    this._cancelDrag(), this._revision++;
    for (const e of this._records.values()) this._seed(e), this._syncVisual(e);
    this._restoring || (this._saveState(), !this._destroyed && this._records.size && this._chart.emit("alerts:checkpoint", {}));
  }
  _onObjects() {
    if (this._destroyed || this._restoring) return;
    this._cancelDrag();
    const e = ++this._revision, t = jd(this._chart);
    for (const i2 of [...this._records.values()]) {
      if (this._destroyed || this._revision !== e) break;
      const s2 = i2.alert.source;
      this._drawingGone(i2.alert, t) ? this._remove(i2.alert.id, "drawing-removed") : "indicator" === s2.kind || "drawing" === s2.kind ? (this._seed(i2), this._syncVisual(i2)) : "price" === s2.kind && this._syncVisual(i2);
    }
  }
  _syncVisual(e) {
    if (!this._visuals) return;
    const { alert: t } = e, { source: i2 } = t;
    if ("hide" === this._spentLines && ("triggered" === t.state || "expired" === t.state)) return void this._visuals.update(t, void 0, true);
    const s2 = jd(this._chart), r2 = Nd(t.scope, s2);
    let n2;
    var o2, a;
    if ("price" === i2.kind && (o2 = t.scope, Ld(o2, a = s2) && o2.variant?.currency === a.variant?.currency && o2.variant?.unit === a.variant?.unit) && (n2 = { price: i2.price, upperPrice: i2.upperPrice, paneIndex: this._pricePane() }), r2 && ("indicator" === i2.kind && void 0 !== e.plotPane && (n2 = { price: i2.value, upperPrice: i2.upperValue, paneIndex: e.plotPane }), "drawing" === i2.kind)) {
      const e2 = this._chart.primaryBars();
      n2 = this._drawingValue(t, e2[e2.length - 1]?.time);
    }
    this._visuals.update(t, n2, this._paused || this._replay || !r2 && "armed" === t.state, r2 ? void 0 : ((e2, t2) => {
      const i3 = e2.interval ?? "original timeframe";
      if (Ad(e2) === Ad(t2)) return i3;
      const s3 = e2.variant, r3 = s3 ? [s3.session, s3.adjustment, s3.currency, s3.unit].filter(Boolean) : [];
      return `${i3}, ${r3.length ? r3.join(" ") : "default series"}`;
    })(t.scope, s2));
  }
  _onData(e) {
    if (this._destroyed || this._restoring) return;
    const t = ++this._revision;
    if (this._expireDue(), this._drag && !this._dragAvailability(this._drag.record, this._drag.index).available && this._cancelDrag(), this._destroyed || t !== this._revision) return;
    if (this._paused || this._replay) return;
    if ("update" !== e.kind) return void this._seedAll();
    const i2 = this._chart.primaryBars(), s2 = i2[i2.length - 1];
    if (!s2 || e.time !== s2.time) return;
    const r2 = jd(this._chart), n2 = [...this._records.values()].filter((e2) => Nd(e2.alert.scope, r2)).map((e2) => ({ record: e2, from: this._firstNew(e2, i2) }));
    let o2 = false;
    for (let e2 = Math.min(...n2.map((e3) => e3.from)); e2 < i2.length && t === this._revision; e2++) for (const { record: s3, from: r3 } of n2) {
      if (this._destroyed || t !== this._revision) break;
      e2 >= r3 && this._records.get(s3.alert.id) === s3 && (o2 = this._judge(s3, i2, e2, t) || o2);
    }
    o2 && (this._saveState(), this._destroyed || this._chart.emit("alerts:checkpoint", {}));
  }
  _firstNew(e, t) {
    const i2 = t.length - 1, { tail: s2, index: r2 } = e;
    if (!s2 || void 0 === r2 || r2 >= i2) return i2;
    const n2 = t[r2];
    return !n2 || n2.time < s2.time ? i2 : (a = s2, (o2 = n2).time === a.time && o2.open === a.open && o2.high === a.high && o2.low === a.low && o2.close === a.close && o2.volume === a.volume && o2.oi === a.oi ? r2 + 1 : r2);
    var o2, a;
  }
  _judge(e, t, i2, s2) {
    const r2 = t[i2], n2 = e.tail;
    if (e.tail = { ...r2 }, e.index = i2, "drawing" === e.alert.source.kind && i2 === t.length - 1 && n2?.time !== r2.time && this._syncVisual(e), this._destroyed || s2 !== this._revision || "armed" !== e.alert.state || !n2) return false;
    const { alert: o2 } = e;
    if ("onBarClose" === o2.policy) {
      const a2 = t[i2 - 1];
      if (r2.time <= n2.time || !a2 || a2.time !== n2.time || void 0 !== o2.lastClosedTime && a2.time <= o2.lastClosedTime) return false;
      o2.lastClosedTime = a2.time;
      const l2 = this._closedMatch(e, t, i2 - 1);
      return void 0 !== l2 && s2 === this._revision && this._records.get(o2.id) === e && this._trigger(e, a2, i2 - 1, l2), true;
    }
    if (r2.time < n2.time || void 0 !== o2.lastTouchedTime && r2.time <= o2.lastTouchedTime) return false;
    const a = this._touchMatch(e, t, i2, n2);
    return void 0 !== a && s2 === this._revision && this._records.get(o2.id) === e && (o2.lastTouchedTime = r2.time, this._trigger(e, r2, i2, a), true);
  }
  _plot(e) {
    const t = this._chart.indicators?.().find((t2) => t2.id === e.instanceId);
    if (!t) return { reason: "Indicator instance is unavailable" };
    if (!t.series(e.plotKey)) return { reason: "Indicator plot is unavailable" };
    const i2 = t.values()[e.plotKey], s2 = t.indicatorId && ps(t.indicatorId) && _s(t.indicatorId).plots.some((t2) => t2.key === e.plotKey && t2.overlay);
    return i2 ? { values: i2, paneIndex: s2 ? this._pricePane() : t.paneIndex } : { reason: "Indicator plot is unavailable" };
  }
  _reading(e, t) {
    const i2 = e?.[t];
    return "number" == typeof i2 && Number.isFinite(i2) ? i2 : void 0;
  }
  _closedMatch(e, t, i2) {
    const { source: s2, condition: r2 } = e.alert;
    if ("barCondition" === s2.kind) return this._barMatch(e, t, i2) ? t[i2].close : void 0;
    if ("drawing" === s2.kind) {
      const n3 = this._drawingValue(e.alert, t[i2].time), o3 = this._drawingValue(e.alert, t[i2 - 1]?.time), a = s2.input ? this._plot(s2.input).values : void 0, l2 = s2.input ? this._reading(a, i2) : t[i2].close, h2 = s2.input ? this._reading(a, i2 - 1) : t[i2 - 1]?.close;
      if (!n3 || void 0 === l2) return;
      return en(r2, o3 ? h2 : void 0, l2, n3.price, n3.upperPrice, o3?.price, o3?.upperPrice) ? l2 : void 0;
    }
    if ("price" === s2.kind) return en(r2, t[i2 - 1]?.close, t[i2].close, s2.price, s2.upperPrice) ? t[i2].close : void 0;
    const n2 = this._plot(s2).values, o2 = this._reading(n2, i2);
    return void 0 !== o2 && en(r2, this._reading(n2, i2 - 1), o2, s2.value, s2.upperValue) ? o2 : void 0;
  }
  _touchMatch(e, t, i2, s2) {
    const { source: r2, condition: n2 } = e.alert, o2 = t[i2];
    if ("barCondition" === r2.kind) return this._barMatch(e, t, i2) ? o2.close : void 0;
    if ("drawing" === r2.kind) return this._drawingTouch(e, r2, t, i2, s2);
    if ("indicator" === r2.kind) {
      const t2 = this._plot(r2).values, a2 = this._reading(t2, i2), l3 = o2.time > s2.time ? this._reading(t2, i2 - 1) : e.value;
      if (e.value = a2, void 0 === a2 || a2 === l3 && o2.time === s2.time) return;
      return en(n2, l3, a2, r2.value, r2.upperValue) ? a2 : void 0;
    }
    const a = o2.time > s2.time;
    if (!(a || o2.close !== s2.close || o2.high > s2.high || o2.low < s2.low)) return;
    const l2 = Math.max(s2.close, o2.close, a || o2.high > s2.high ? o2.high : -1 / 0), h2 = Math.min(s2.close, o2.close, a || o2.low < s2.low ? o2.low : 1 / 0);
    return tn(n2, s2.close, h2, l2, r2.price, r2.upperPrice);
  }
  _barMatch(e, t, i2) {
    const s2 = e.alert.source;
    if ("barCondition" !== s2.kind || e.errorTime === t[i2].time) return false;
    const r2 = xd(s2.id);
    if (!r2) return false;
    try {
      return true === r2.when({ bars: t.slice(0, i2 + 1), index: i2 });
    } catch (s3) {
      return e.errorTime = t[i2].time, this._chart.emit("alert:error", { alert: _n(e.alert), error: s3 }), false;
    }
  }
  _drawingValue(e, t) {
    const i2 = e.source;
    if ("drawing" !== i2.kind || void 0 === t) return;
    const s2 = this._drawings?.valueAt(i2.drawingId, t, i2.level);
    if (!s2 || s2.paneIndex !== this._pricePane() && !i2.input) return;
    if (i2.input && this._plot(i2.input).paneIndex !== s2.paneIndex) return;
    return ("enteringRange" === e.condition || "leavingRange" === e.condition) === (void 0 !== s2.upperPrice) ? s2 : void 0;
  }
  _drawingTouch(e, t, i2, s2, r2) {
    const n2 = i2[s2], o2 = this._drawingValue(e.alert, n2.time), a = this._drawingValue(e.alert, r2.time);
    if (t.input) {
      const i3 = this._plot(t.input).values, l3 = this._reading(i3, s2), h3 = n2.time > r2.time ? this._reading(i3, s2 - 1) : e.value;
      if (e.value = l3, !o2 || void 0 === l3 || l3 === h3 && n2.time === r2.time) return;
      return en(e.alert.condition, a ? h3 : void 0, l3, o2.price, o2.upperPrice, a?.price, a?.upperPrice) ? l3 : void 0;
    }
    if (!o2 || !a) return;
    const l2 = n2.time > r2.time;
    if (!l2 && n2.close === r2.close && n2.high <= r2.high && n2.low >= r2.low) return;
    const h2 = Math.max(r2.close, n2.close, l2 || n2.high > r2.high ? n2.high : -1 / 0), c2 = Math.min(r2.close, n2.close, l2 || n2.low < r2.low ? n2.low : 1 / 0);
    return tn(e.alert.condition, r2.close, c2, h2, o2.price, o2.upperPrice, a.price, a.upperPrice);
  }
  _trigger(e, t, i2, s2) {
    const { alert: r2 } = e, n2 = this._now();
    if (void 0 !== r2.expiresAt && n2 >= r2.expiresAt) return void this._expireDue();
    if (void 0 !== r2.lastTriggeredAt && n2 - r2.lastTriggeredAt < r2.cooldownSeconds) return;
    this._cancelDrag(r2.id), r2.lastTriggeredAt = n2, r2.lastTriggeredTime = t.time, "once" === r2.repeat && (r2.state = "triggered"), this._syncVisual(e), this._scheduleExpiry(), this._saveState();
    const o2 = { alertId: r2.id, title: r2.title, message: r2.message, time: t.time, index: i2, price: s2, alert: _n(r2) };
    this._chart.emit("alert:triggered", o2);
  }
  _expireDue() {
    const e = this._now(), t = [];
    for (const i2 of this._records.values()) {
      const { alert: s2 } = i2;
      "armed" === s2.state && void 0 !== s2.expiresAt && e >= s2.expiresAt && (this._cancelDrag(s2.id), s2.state = "expired", this._syncVisual(i2), t.push(i2));
    }
    this._scheduleExpiry(), t.length && this._saveState();
    for (const e2 of t) {
      if (this._destroyed) break;
      this._records.get(e2.alert.id) === e2 && this._chart.emit("alert:expired", { alert: _n(e2.alert) });
    }
  }
  _clearTimer() {
    void 0 !== this._timer && clearTimeout(this._timer), this._timer = void 0, this._timerAt = void 0;
  }
  _scheduleExpiry() {
    if (this._destroyed) return;
    let e;
    for (const { alert: t } of this._records.values()) "armed" === t.state && void 0 !== t.expiresAt && (e = Math.min(e ?? 1 / 0, t.expiresAt));
    e !== this._timerAt && (this._clearTimer(), void 0 !== e && (this._timerAt = e, this._timer = Il(() => {
      this._timer = void 0, this._timerAt = void 0, this._destroyed || this._expireDue();
    }, Math.max(1, 1e3 * (e - this._now())))));
  }
};

// vendor/openalgo-charts.indicators.mjs
function K2(e, t) {
  if (void 0 !== e && (!Number.isSafeInteger(e) || e <= 0)) throw new RangeError("Missing-value window period must be a positive safe integer");
  if (null === t || "object" != typeof t || Array.isArray(t)) throw new TypeError("Missing-value options must be an object");
  const l2 = void 0 === t.missing ? "propagate" : t.missing;
  if ("propagate" !== l2 && "skip" !== l2) throw new TypeError("Missing-value policy must be propagate or skip");
  return l2;
}
function H2(e, t, l2, o2) {
  if (e.length !== t.length) throw new RangeError("Numerical crossing arrays must have equal lengths");
  const n2 = K2(void 0, l2), r2 = new Array(e.length).fill(false);
  let a = NaN, i2 = NaN;
  for (let l3 = 0; l3 < e.length; l3++) {
    if (!Number.isFinite(e[l3]) || !Number.isFinite(t[l3])) {
      "propagate" === n2 && (a = NaN, i2 = NaN);
      continue;
    }
    const s2 = e[l3] > t[l3] && a <= i2, c2 = e[l3] < t[l3] && a >= i2;
    r2[l3] = "above" === o2 ? s2 : "below" === o2 ? c2 : s2 || c2, a = e[l3], i2 = t[l3];
  }
  return r2;
}
function z2(e, t, l2 = {}) {
  return H2(e, t, l2, "above");
}
function j2(e, t, l2 = {}) {
  return H2(e, t, l2, "below");
}
function Z2(e, t, l2 = {}) {
  return H2(e, t, l2, "either");
}
function X2(e, t) {
  const l2 = new Array(e.length).fill(NaN);
  if (e.length < t) return l2;
  if (1 === t) {
    for (let t2 = 0; t2 < e.length; t2++) {
      const o3 = e[t2];
      Number.isFinite(o3) && (l2[t2] = 0 === o3 ? 0 : o3);
    }
    return l2;
  }
  let o2 = 0;
  for (let n2 = 0; n2 < e.length; n2++) {
    if (Number.isFinite(e[n2]) || o2++, n2 >= t && !Number.isFinite(e[n2 - t]) && o2--, n2 < t - 1 || 0 !== o2) continue;
    let r2 = 0;
    for (let l3 = n2 - t + 1; l3 <= n2; l3++) r2 += e[l3];
    Number.isFinite(r2) && (l2[n2] = r2);
  }
  return l2;
}
function _2(e, t) {
  const l2 = X2(e, t);
  if (1 !== t) for (let e2 = 0; e2 < l2.length; e2++) l2[e2] /= t;
  return l2;
}
function Q2(e, t, l2, o2, n2 = false) {
  const r2 = K2(t, l2), a = new Array(e.length).fill(NaN), i2 = [];
  let s2 = 0;
  for (let l3 = 0; l3 < e.length; l3++) {
    const c2 = e[l3], u2 = Number.isFinite(c2);
    n2 && u2 && i2.length === t && 0 === s2 && (a[l3] = o2(i2, l3)), ("propagate" === r2 || u2) && (i2.push({ value: c2, index: l3 }), u2 || s2++, i2.length > t && !Number.isFinite(i2.shift().value) && s2--), n2 || i2.length !== t || 0 !== s2 || (a[l3] = o2(i2, l3));
  }
  return a;
}
function ee2(e, t, l2, o2) {
  if ("number" != typeof e) throw new TypeError(`${l2} must contain numbers`);
  if (!(o2 && Number.isNaN(e) || Number.isSafeInteger(e) && !(e < t))) throw new RangeError(`${l2} must be a safe integer greater than or equal to ${t}`);
}
function te2(e, t, l2, o2) {
  if (!Array.isArray(e)) throw new TypeError(`${o2} must be an array`);
  if (e.length !== t) throw new RangeError(`${o2} array length must match the source`);
  for (let t2 = 0; t2 < e.length; t2++) ee2(e[t2], l2, o2, true);
}
function le2(e, t, l2, o2, n2 = false) {
  te2(t, e.length, 1, "Window length");
  const r2 = K2(1, void 0 === l2 ? {} : l2), a = new Array(e.length).fill(NaN), i2 = [];
  let s2 = 0;
  const c2 = (e2, t2) => {
    const l3 = Number.isFinite(e2);
    s2 = l3 ? s2 + 1 : 0, ("propagate" === r2 || l3) && i2.push({ value: e2, index: t2 });
  };
  for (let l3 = 0; l3 < e.length; l3++) {
    const u2 = e[l3];
    n2 || c2(u2, l3);
    const p2 = t[l3];
    !Number.isNaN(p2) && p2 <= i2.length && ("skip" === r2 || p2 <= s2) && (!n2 || Number.isFinite(u2)) && (a[l3] = o2(i2.slice(i2.length - p2), l3)), n2 && c2(u2, l3);
  }
  return a;
}
function oe2(e, t) {
  const l2 = new DataView(new ArrayBuffer(8)), o2 = (1n << 52n) - 1n;
  let n2 = 0n, r2 = 0n;
  for (let a = 0; a < e.length; a++) {
    const i2 = BigInt(t?.[a] ?? 1);
    if (0n === i2) continue;
    l2.setFloat64(0, e[a]);
    const s2 = l2.getBigUint64(0), c2 = Number(s2 >> 52n & 0x7ffn), u2 = s2 & o2, p2 = 0 === c2 ? u2 : (1n << 52n | u2) << BigInt(c2 - 1);
    n2 += (s2 >> 63n ? -p2 : p2) * i2, r2 += i2;
  }
  return function(e2, t2) {
    const l3 = e2 < 0n, o3 = l3 ? -e2 : e2, n3 = o3 / t2, r3 = Math.max(0, n3.toString(2).length - 53), a = t2 << BigInt(r3);
    let i2 = o3 / a;
    const s2 = o3 % a;
    (2n * s2 > a || 2n * s2 === a && 0n != (1n & i2)) && i2++;
    const c2 = Number(i2) * 2 ** (r3 - 1074);
    return l3 ? -c2 : c2;
  }(n2, r2);
}
function ne2(e, t) {
  let l2 = 0, o2 = 0, n2 = 0, r2 = 1 / 0, a = -1 / 0;
  for (let i3 = 0; i3 < e.length; i3++) {
    const s3 = t?.[i3] ?? 1;
    if (0 === s3) continue;
    r2 = Math.min(r2, e[i3]), a = Math.max(a, e[i3]), n2 += s3;
    const c2 = e[i3] * s3, u2 = l2 + c2;
    o2 += Math.abs(l2) >= Math.abs(c2) ? l2 - u2 + c2 : c2 - u2 + l2, l2 = u2;
  }
  if (r2 === a) return r2;
  const i2 = l2 + o2, s2 = Number.isFinite(i2) && Number.isSafeInteger(n2) ? i2 / n2 : oe2(e, t);
  return Math.max(r2, Math.min(a, s2));
}
function re2(e) {
  return ne2(e.map((e2) => e2.value));
}
function ae2(e, t) {
  const l2 = e[0].value;
  let o2 = 0, n2 = 0, r2 = e.map(({ value: e2 }) => {
    o2 = Math.max(o2, Math.abs(e2));
    const t2 = e2 - l2;
    return n2 = Math.max(n2, Math.abs(t2)), t2;
  });
  if (0 === n2) return 0;
  const a = 2 ** Math.min(1023, Math.floor(Math.log2(Number.isFinite(n2) ? n2 : o2)));
  r2 = Number.isFinite(n2) ? r2.map((e2) => e2 / a) : e.map(({ value: e2 }) => e2 / a - l2 / a);
  const i2 = ne2(r2), s2 = ne2(r2.map((e2) => {
    const l3 = Math.abs(e2 - i2);
    return t ? l3 * l3 : l3;
  }));
  return Math.min(o2, (t ? Math.sqrt(s2) : s2) * a);
}
function ie2(e, t) {
  let l2 = e[0];
  for (let o2 = 1; o2 < e.length; o2++) {
    const n2 = e[o2];
    (t ? n2.value >= l2.value : n2.value <= l2.value) && (l2 = n2);
  }
  return l2;
}
function se2(e, t, l2, o2) {
  const n2 = K2(t, l2), r2 = new Array(e.length).fill(NaN);
  let a = 0;
  const i2 = [];
  let s2 = NaN;
  for (let l3 = 0; l3 < e.length; l3++) {
    const c2 = e[l3];
    if (Number.isFinite(c2)) {
      if (a < t) {
        if (i2.push(c2), ++a < t) continue;
        s2 = ne2(i2), i2.length = 0;
      } else s2 = ne2([s2, c2], [t - 1, o2]);
      r2[l3] = s2;
    } else "propagate" === n2 ? (a = 0, i2.length = 0, s2 = NaN) : a === t && (r2[l3] = s2);
  }
  return r2;
}
function ce2(e, t, l2) {
  if ("number" != typeof t) return le2(e, t, l2, re2);
  if (void 0 !== l2) return Q2(e, t, l2, re2);
  if (Number.isSafeInteger(t) && t > 0) return _2(e, t);
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  let r2 = 0, a = 0;
  for (let l3 = 0; l3 < o2; l3++) {
    const o3 = e[l3];
    if (Number.isFinite(o3) ? r2 += o3 : a += 1, l3 >= t) {
      const o4 = e[l3 - t];
      Number.isFinite(o4) ? r2 -= o4 : a -= 1;
    }
    l3 >= t - 1 && (n2[l3] = 0 === a ? r2 / t : NaN);
  }
  return n2;
}
function ue2(e, t, l2) {
  if ("number" != typeof t) return le2(e, t, l2, (e2) => ne2(e2.map((e3) => e3.value), e2.map((e3, t2) => t2 + 1)));
  if (void 0 !== l2) return Q2(e, t, l2, (e2) => ne2(e2.map((e3) => e3.value), e2.map((e3, t2) => t2 + 1)));
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  const r2 = t * (t + 1) / 2, a = Number.isSafeInteger(t);
  for (let l3 = t - 1; l3 < o2; l3++) {
    let o3 = 0;
    for (let n3 = 0; n3 < t; n3++) {
      const r3 = a ? t - 1 - n3 : n3;
      o3 += e[l3 - r3] * (t - r3);
    }
    const i2 = o3 / r2;
    a && !Number.isFinite(i2) || (n2[l3] = i2);
  }
  return n2;
}
function pe2(e, t, l2) {
  const o2 = new Array(e.length).fill(NaN);
  if (e.length < t) return o2;
  const n2 = 2 / (t + 1);
  let r2 = 0, a = NaN, i2 = false;
  for (let s2 = 0; s2 < e.length; s2++) {
    const c2 = e[s2];
    if (Number.isFinite(c2)) {
      if (i2) a = l2 ? c2 * n2 + a * (1 - n2) : (a * (t - 1) + c2) / t;
      else {
        if (++r2 < t) continue;
        let l3 = 0;
        for (let o4 = s2 + 1 - t; o4 <= s2; o4++) l3 += e[o4];
        const o3 = l3 / t;
        if (!Number.isFinite(o3)) continue;
        a = 0 === o3 ? 0 : o3, i2 = true;
      }
      Number.isFinite(a) && (o2[s2] = 0 === a ? 0 : a);
    } else r2 = 0;
  }
  return o2;
}
function ye2(e, t, l2) {
  if (void 0 !== l2) return se2(e, t, l2, 1);
  if (Number.isSafeInteger(t) && t > 0) return pe2(e, t, false);
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  let r2 = 0;
  for (let l3 = 0; l3 < t; l3++) r2 += e[l3];
  let a = r2 / t;
  n2[t - 1] = a;
  for (let l3 = t; l3 < o2; l3++) a = (a * (t - 1) + e[l3]) / t, n2[l3] = a;
  return n2;
}
function fe2(e, t, l2) {
  if ("number" != typeof t) return le2(e, t, l2, (e2) => ae2(e2, true));
  if (void 0 !== l2) return Q2(e, t, l2, (e2) => ae2(e2, true));
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  const r2 = ce2(e, t), a = Number.isSafeInteger(t);
  for (let l3 = t - 1; l3 < o2; l3++) {
    let o3 = 0;
    const i2 = r2[l3];
    for (let n3 = 0; n3 < t; n3++) {
      const r3 = e[l3 - (a ? t - 1 - n3 : n3)] - i2;
      o3 += r3 * r3;
    }
    const s2 = Math.sqrt(o3 / t);
    a && !Number.isFinite(s2) || (n2[l3] = s2);
  }
  return n2;
}
function de2(e, t, l2) {
  if ("number" != typeof t) return le2(e, t, l2, (e2) => ie2(e2, true).value);
  if (void 0 !== l2) return Q2(e, t, l2, (e2) => ie2(e2, true).value);
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0) return n2;
  for (let l3 = t - 1; l3 < o2; l3++) {
    let o3 = -1 / 0;
    for (let n3 = 0; n3 < t; n3++) e[l3 - n3] > o3 && (o3 = e[l3 - n3]);
    n2[l3] = o3;
  }
  return n2;
}
function me2(e, t, l2) {
  if ("number" != typeof t) return le2(e, t, l2, (e2) => ie2(e2, false).value);
  if (void 0 !== l2) return Q2(e, t, l2, (e2) => ie2(e2, false).value);
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0) return n2;
  for (let l3 = t - 1; l3 < o2; l3++) {
    let o3 = 1 / 0;
    for (let n3 = 0; n3 < t; n3++) e[l3 - n3] < o3 && (o3 = e[l3 - n3]);
    n2[l3] = o3;
  }
  return n2;
}
function he(e) {
  const t = new Array(e.length);
  for (let l2 = 0; l2 < e.length; l2++) {
    const o2 = e[l2];
    t[l2] = Number.isFinite(o2) ? o2 : null;
  }
  return t;
}
function be2(e, t, l2) {
  if (void 0 !== l2) return se2(e, t, l2, 2);
  if (Number.isSafeInteger(t) && t > 0) return pe2(e, t, true);
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  let r2 = 0;
  for (let l3 = 0; l3 < t; l3++) r2 += e[l3];
  let a = r2 / t;
  n2[t - 1] = a;
  const i2 = 2 / (t + 1);
  for (let l3 = t; l3 < o2; l3++) a = e[l3] * i2 + a * (1 - i2), n2[l3] = a;
  return n2;
}
function ge2(e, t = 1) {
  const l2 = e.length, o2 = new Array(l2).fill(NaN);
  for (let n2 = t; n2 < l2; n2++) o2[n2] = e[n2] - e[n2 - t];
  return o2;
}
function we2(e, t) {
  const l2 = e.length, o2 = new Array(l2).fill(NaN);
  if (t <= 0) return o2;
  for (let n2 = t; n2 < l2; n2++) {
    const l3 = e[n2 - t];
    o2[n2] = 0 === l3 ? NaN : 100 * (e[n2] - l3) / l3;
  }
  return o2;
}
function ke2(e, t, l2) {
  if ("number" != typeof t) return le2(e, t, l2, (e2) => ae2(e2, false));
  if (void 0 !== l2) return Q2(e, t, l2, (e2) => ae2(e2, false));
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  const r2 = ce2(e, t), a = Number.isSafeInteger(t);
  for (let l3 = t - 1; l3 < o2; l3++) {
    let o3 = 0;
    for (let n3 = 0; n3 < t; n3++) o3 += Math.abs(e[l3 - (a ? t - 1 - n3 : n3)] - r2[l3]);
    const i2 = o3 / t;
    a && !Number.isFinite(i2) || (n2[l3] = i2);
  }
  return n2;
}
function ve2(e, t, l2) {
  if ("number" != typeof t) return le2(e, t, l2, (t2, l3) => {
    let o3 = 0;
    for (const n3 of t2) n3.value <= e[l3] && o3++;
    return 100 * o3 / t2.length;
  }, true);
  if (void 0 !== l2) return Q2(e, t, l2, (l3, o3) => {
    let n3 = 0;
    for (const t2 of l3) t2.value <= e[o3] && n3++;
    return 100 * n3 / t;
  }, true);
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0) return n2;
  for (let l3 = t; l3 < o2; l3++) {
    let o3 = 0;
    for (let n3 = 1; n3 <= t; n3++) e[l3 - n3] <= e[l3] && (o3 += 1);
    n2[l3] = 100 * o3 / t;
  }
  return n2;
}
function Ne(e, t, l2, o2) {
  const n2 = e.length, r2 = new Array(n2).fill(NaN);
  if (!Number.isSafeInteger(t) || t <= 0 || o2 <= 0 || n2 < t) return r2;
  const a = l2 * (t - 1), i2 = t / o2, s2 = new Array(t);
  let c2 = 0;
  for (let e2 = 0; e2 < t; e2++) {
    const t2 = Math.exp(-(e2 - a) * (e2 - a) / (2 * i2 * i2));
    s2[e2] = t2, c2 += t2;
  }
  if (0 === c2) return r2;
  for (let l3 = t - 1; l3 < n2; l3++) {
    let o3 = 0;
    for (let n3 = 0; n3 < t; n3++) o3 += e[l3 - (t - 1 - n3)] * s2[n3];
    r2[l3] = o3 / c2;
  }
  return r2;
}
function Ce2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2);
  for (let l3 = 0; l3 < o2; l3++) n2[l3] = e[l3] * (t[l3] ?? 0);
  const r2 = ce2(n2, l2), a = ce2(t, l2), i2 = new Array(o2).fill(NaN);
  for (let e2 = 0; e2 < o2; e2++) i2[e2] = 0 === a[e2] ? NaN : r2[e2] / a[e2];
  return i2;
}
function Me2(e, t, l2) {
  return "number" != typeof t ? le2(e, t, l2, (e2, t2) => ie2(e2, true).index - t2) : void 0 !== l2 ? Q2(e, t, l2, (e2, t2) => ie2(e2, true).index - t2) : Ae2(e, t, true);
}
function xe2(e, t, l2) {
  return "number" != typeof t ? le2(e, t, l2, (e2, t2) => ie2(e2, false).index - t2) : void 0 !== l2 ? Q2(e, t, l2, (e2, t2) => ie2(e2, false).index - t2) : Ae2(e, t, false);
}
function Ae2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  for (let r2 = t - 1; r2 < o2; r2++) {
    let o3 = e[r2], a = 0;
    for (let n3 = 1; n3 < t; n3++) {
      const t2 = e[r2 - n3];
      (l2 ? t2 > o3 : t2 < o3) && (o3 = t2, a = n3);
    }
    n2[r2] = 0 === a ? 0 : -a;
  }
  return n2;
}
function Se2(e, t) {
  if (Number.isSafeInteger(t) && t > 0) return X2(e, t);
  const l2 = e.length, o2 = new Array(l2).fill(NaN);
  if (t <= 0 || l2 < t) return o2;
  let n2 = 0;
  for (let r2 = 0; r2 < l2; r2++) n2 += e[r2], r2 >= t && (n2 -= e[r2 - t]), r2 >= t - 1 && (o2[r2] = n2);
  return o2;
}
function Le2(e) {
  const t = e.length, l2 = new Array(t);
  let o2 = 0;
  for (let n2 = 0; n2 < t; n2++) {
    const t2 = e[n2];
    Number.isFinite(t2) && (o2 += t2), l2[n2] = o2;
  }
  return l2;
}
function Be2(e, t, l2 = 0) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 1 || o2 < t) return n2;
  const r2 = (t - 1) * t / 2, a = t * ((t - 1) * t * (2 * t - 1) / 6) - r2 * r2;
  if (0 === a) return n2;
  for (let i2 = t - 1; i2 < o2; i2++) {
    let o3 = 0, s2 = 0;
    for (let l3 = 0; l3 < t; l3++) {
      const n3 = e[i2 - (t - 1 - l3)];
      o3 += n3, s2 += n3 * l3;
    }
    const c2 = (t * s2 - r2 * o3) / a, u2 = (o3 - c2 * r2) / t;
    n2[i2] = u2 + c2 * (t - 1 - l2);
  }
  return n2;
}
function Fe(e) {
  const t = e.length, l2 = new Array(t).fill(NaN);
  for (let o2 = 3; o2 < t; o2++) l2[o2] = (e[o2 - 3] + 2 * e[o2 - 2] + 2 * e[o2 - 1] + e[o2]) / 6;
  return l2;
}
function Ke2(e, t, l2, o2) {
  const n2 = e.length, r2 = new Array(n2).fill(NaN), a = de2(t, o2), i2 = me2(l2, o2);
  for (let t2 = 0; t2 < n2; t2++) {
    const l3 = a[t2] - i2[t2];
    r2[t2] = 0 === l3 ? NaN : 100 * (e[t2] - i2[t2]) / l3;
  }
  return r2;
}
function We2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0 || o2 < t) return n2;
  for (let r2 = t - 1; r2 < o2; r2++) {
    const o3 = e.slice(r2 - t + 1, r2 + 1);
    if (o3.some((e2) => !Number.isFinite(e2))) continue;
    o3.sort((e2, t2) => e2 - t2);
    const a = Math.max(1, Math.ceil(l2 / 100 * t));
    n2[r2] = o3[a - 1] ?? NaN;
  }
  return n2;
}
function De2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (l2 <= 1 || o2 < l2) return n2;
  for (let r2 = l2 - 1; r2 < o2; r2++) {
    let o3 = 0, a = 0, i2 = 0, s2 = 0, c2 = 0;
    for (let n3 = r2 - l2 + 1; n3 <= r2; n3++) o3 += e[n3], a += t[n3];
    const u2 = o3 / l2, p2 = a / l2;
    for (let o4 = r2 - l2 + 1; o4 <= r2; o4++) {
      const l3 = e[o4] - u2, n3 = t[o4] - p2;
      i2 += l3 * n3, s2 += l3 * l3, c2 += n3 * n3;
    }
    const y2 = i2 / l2 / (Math.sqrt(s2 / l2) * Math.sqrt(c2 / l2));
    Number.isFinite(y2) && (n2[r2] = y2);
  }
  return n2;
}
function Oe2(e, t) {
  const l2 = e.length, o2 = new Array(l2).fill(NaN), n2 = ce2(e, t), r2 = ke2(e, t);
  for (let t2 = 0; t2 < l2; t2++) o2[t2] = 0 === r2[t2] ? NaN : (e[t2] - n2[t2]) / (0.015 * r2[t2]);
  return o2;
}
function Re(e, t) {
  const l2 = e.length, o2 = new Array(l2).fill(NaN);
  if (t < 3 || l2 < t) return o2;
  const n2 = (t + 1) / 2;
  let r2 = 0;
  for (let e2 = 0; e2 < t; e2++) r2 += (n2 - e2 - 1) * (n2 - e2 - 1);
  for (let a = t - 1; a < l2; a++) {
    let l3 = 0;
    for (let o3 = 0; o3 < t; o3++) l3 += e[a - o3];
    const i2 = l3 / t;
    let s2 = 0, c2 = 0;
    for (let l4 = 0; l4 < t; l4++) {
      const t2 = i2 - e[a - l4];
      s2 += t2 * t2, c2 += (n2 - l4 - 1) * t2;
    }
    o2[a] = Math.sqrt((s2 - c2 * c2 / r2) / (t - 2));
  }
  return o2;
}
function Te2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN), r2 = X2(e, l2), a = X2(t, l2);
  for (let e2 = l2; e2 < o2; e2++) {
    const t2 = r2[e2], l3 = a[e2];
    Number.isFinite(t2) && Number.isFinite(l3) && (n2[e2] = 0 === l3 ? 100 : 100 - 100 / (1 + t2 / l3));
  }
  return n2;
}
function Pe2(e, t, l2) {
  return "number" != typeof t || "number" != typeof l2 ? $e2(e, t, l2, true) : Ie2(e, t, l2, true);
}
function Ue2(e, t, l2) {
  return "number" != typeof t || "number" != typeof l2 ? $e2(e, t, l2, false) : Ie2(e, t, l2, false);
}
function $e2(e, t, l2, o2) {
  for (const [o3, n3] of [["Left pivot width", t], ["Right pivot width", l2]]) "number" == typeof n3 ? ee2(n3, 0, o3, false) : te2(n3, e.length, 0, o3);
  const n2 = new Array(e.length).fill(NaN);
  for (let r2 = 0; r2 < e.length; r2++) {
    const a = "number" == typeof t ? t : t[r2], i2 = "number" == typeof l2 ? l2 : l2[r2];
    if (Number.isNaN(a) || Number.isNaN(i2) || i2 > r2 || a > r2 - i2) continue;
    const s2 = r2 - i2, c2 = e[s2];
    if (!Number.isFinite(c2)) continue;
    let u2 = true;
    for (let t2 = s2 - a; t2 <= r2 && u2; t2++) {
      if (t2 === s2) continue;
      const l3 = e[t2];
      Number.isFinite(l3) && !(o2 ? l3 >= c2 : l3 <= c2) || (u2 = false);
    }
    u2 && (n2[r2] = c2);
  }
  return n2;
}
function Ie2(e, t, l2, o2) {
  const n2 = e.length, r2 = new Array(n2).fill(NaN);
  for (let a = t + l2; a < n2; a++) {
    const n3 = a - l2, i2 = e[n3];
    if (!Number.isFinite(i2)) continue;
    let s2 = true;
    for (let l3 = 1; l3 <= t && s2; l3++) {
      const t2 = e[n3 - l3];
      Number.isFinite(t2) && !(o2 ? t2 >= i2 : t2 <= i2) || (s2 = false);
    }
    for (let t2 = 1; t2 <= l2 && s2; t2++) {
      const l3 = e[n3 + t2];
      Number.isFinite(l3) && !(o2 ? l3 >= i2 : l3 <= i2) || (s2 = false);
    }
    s2 && (r2[a] = i2);
  }
  return r2;
}
function Ee2(e) {
  const t = e.length, l2 = new Array(t).fill(NaN);
  let o2 = -1;
  for (let n2 = 0; n2 < t; n2++) e[n2] && (o2 = n2), o2 >= 0 && (l2[n2] = n2 - o2);
  return l2;
}
function qe2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (!Number.isSafeInteger(l2) || l2 < 0) return n2;
  const r2 = [];
  for (let a = 0; a < o2; a++) {
    e[a] && r2.push(a);
    const o3 = r2.length - 1 - l2;
    o3 >= 0 && (n2[a] = t[r2[o3]] ?? NaN);
  }
  return n2;
}
var Ve2 = /* @__PURE__ */ new WeakMap();
var He2 = (e) => Number.isFinite(e) ? e : null;
var ze = (e) => Number.isSafeInteger(e) && e > 0;
function je2(e) {
  return (t, l2, o2, n2, r2, a) => {
    const i2 = e(t, l2, o2, n2, r2, a);
    if (null === i2) return null;
    for (const e2 of Object.keys(n2)) if (!Object.prototype.hasOwnProperty.call(i2, e2)) {
      const e3 = "object" == typeof r2 && null !== r2 ? Ve2.get(r2) : void 0;
      return void 0 !== e3 && (e3.misses = 3), null;
    }
    return i2;
  };
}
function Ze(e, t) {
  const l2 = { ...e, calc: (o2 = e.calc, (e2, t2, l3, n2) => {
    if ("object" == typeof l3 && null !== l3) {
      const e3 = Ve2.get(l3);
      Ve2.set(l3, { owner: o2, misses: e3?.owner === o2 ? e3.misses : 0 });
    }
    return o2(e2, t2, l3, n2);
  }) };
  var o2;
  return Object.defineProperty(l2, "calcTail", { value: je2(t(e.calc)), enumerable: false, writable: true, configurable: true }), l2;
}
function Ye2(e, t, l2, o2) {
  if ("object" != typeof e || null === e || !Number.isSafeInteger(o2) || o2 < 0 || o2 >= l2.length) return;
  const n2 = Ve2.get(e);
  return void 0 !== n2 && n2.owner === t && n2.misses < 3 ? n2 : void 0;
}
function Je2(e) {
  return e.misses++, null;
}
function Ge2(e) {
  if (Array.isArray(e)) return e.map(Ge2);
  if (null !== e && "object" == typeof e) {
    const t = {};
    for (const l2 of Object.keys(e)) t[l2] = Ge2(e[l2]);
    return t;
  }
  return e;
}
function Xe2(e, t, l2, o2) {
  const n2 = e.at;
  return void 0 === n2 || n2.key !== t || n2.index !== o2 - 1 || 0 !== o2 && n2.time !== l2[o2 - 1].time ? void 0 : n2;
}
function _e2(e, t, l2, o2, n2) {
  const r2 = {};
  for (const a of Object.keys(t)) {
    const i2 = t[a];
    if (n2 > 0) {
      const t2 = o2[a];
      if (void 0 === t2 || t2.length < n2 || !Object.is(t2[n2 - 1] ?? null, i2[l2 - 1] ?? null)) return Je2(e);
    }
    r2[a] = i2.slice(l2);
  }
  return e.misses = 0, r2;
}
function Qe(e, t) {
  return (l2, o2, n2, r2, a, i2) => {
    const s2 = Ye2(a, e, l2, n2), c2 = t(o2);
    if (void 0 === s2 || null === c2) return null;
    const u2 = Math.max(0, n2 - 1 - c2);
    return _e2(s2, e(0 === u2 ? l2 : l2.slice(u2), o2, a, i2), n2 - u2, r2, n2);
  };
}
function et2(e, t, l2, o2, n2, r2, a) {
  const i2 = Ye2(a, e, o2, n2);
  if (void 0 === i2) return null;
  const s2 = Xe2(i2, t, o2, n2);
  let c2, u2;
  if (void 0 !== s2) c2 = Ge2(s2.state), u2 = s2.row.slice();
  else {
    c2 = l2.start(), u2 = l2.keys.map(() => null);
    for (let e2 = 0; e2 < n2; e2++) l2.step(c2, e2, u2);
  }
  if (!function(e2, t2, l3, o3) {
    if (0 === o3) return true;
    for (let n3 = 0; n3 < t2.length; n3++) {
      const r3 = e2[t2[n3]];
      if (void 0 === r3 || r3.length < o3 || !Object.is(r3[o3 - 1] ?? null, l3[n3])) return false;
    }
    return true;
  }(r2, l2.keys, u2, n2)) return Je2(i2);
  if (false === l2.ready?.(c2)) return null;
  const p2 = o2.length, y2 = l2.keys.map(() => new Array(p2 - n2));
  for (let e2 = n2; e2 < p2; e2++) {
    e2 === p2 - 1 && (i2.at = { key: t, index: e2 - 1, time: e2 > 0 ? o2[e2 - 1].time : NaN, state: Ge2(c2), row: u2.slice() }), l2.step(c2, e2, u2);
    for (let t2 = 0; t2 < y2.length; t2++) y2[t2][e2 - n2] = u2[t2];
  }
  i2.misses = 0;
  const f2 = {};
  return l2.keys.forEach((e2, t2) => {
    f2[e2] = y2[t2];
  }), f2;
}
function tt2(e, t) {
  const l2 = e.start(), o2 = e.keys.map(() => null), n2 = e.keys.map(() => new Array(t));
  for (let r3 = 0; r3 < t; r3++) {
    e.step(l2, r3, o2);
    for (let e2 = 0; e2 < n2.length; e2++) n2[e2][r3] = o2[e2];
  }
  const r2 = {};
  return e.keys.forEach((e2, t2) => {
    r2[e2] = n2[t2];
  }), r2;
}
var lt = () => ({ run: 0, value: NaN, seeded: false, recent: [] });
function ot2(e, t, l2, o2) {
  if (!Number.isFinite(t)) return e.run = 0, e.recent.length = 0, NaN;
  if (e.seeded) {
    const n2 = 2 / (l2 + 1);
    e.value = o2 ? t * n2 + e.value * (1 - n2) : (e.value * (l2 - 1) + t) / l2;
  } else {
    const o3 = e.recent;
    if (o3.push(t), o3.length > l2 && o3.shift(), ++e.run < l2) return NaN;
    let n2 = 0;
    for (let e2 = 0; e2 < o3.length; e2++) n2 += o3[e2];
    const r2 = n2 / l2;
    if (!Number.isFinite(r2)) return NaN;
    e.value = 0 === r2 ? 0 : r2, e.seeded = true, o3.length = 0;
  }
  return Number.isFinite(e.value) ? 0 === e.value ? 0 : e.value : NaN;
}
var nt2 = () => ({ count: 0, seed: [], value: NaN });
function rt(e, t) {
  const l2 = e[t];
  if (0 === t) return l2.high - l2.low;
  const o2 = e[t - 1].close;
  return Math.max(l2.high - l2.low, Math.abs(l2.high - o2), Math.abs(l2.low - o2));
}
var at2 = () => ({ a: NaN, run: 0, recent: [] });
function it2(e, t, l2) {
  if (!Number.isFinite(t)) return e.run = 0, e.recent.length = 0, NaN;
  if (e.run++, Number.isNaN(e.a)) {
    const o2 = e.recent;
    if (o2.push(t), o2.length > l2 && o2.shift(), e.run >= l2) {
      let t2 = 0;
      for (let e2 = 0; e2 < o2.length; e2++) t2 += o2[e2];
      Number.isFinite(t2 / l2) && (e.a = t2 / l2, o2.length = 0);
    }
  } else e.a = (e.a * (l2 - 1) + t) / l2;
  return Number.isFinite(e.a) ? e.a : NaN;
}
var st2 = () => ({ primed: false, last: NaN, gain: NaN, loss: NaN, gainSeeded: false, lossSeeded: false, run: 0, recent: [] });
var ct2 = () => ({ atr: { a: NaN, run: 0, recent: [] }, upper: NaN, lower: NaN, st: NaN, close: NaN, started: false });
function ut2(e, t, l2) {
  if (t < l2 - 1) return NaN;
  if (1 === l2) {
    const l3 = e(t);
    return Number.isFinite(l3) ? 0 === l3 ? 0 : l3 : NaN;
  }
  let o2 = 0;
  for (let n2 = t - l2 + 1; n2 <= t; n2++) {
    const t2 = e(n2);
    if (!Number.isFinite(t2)) return NaN;
    o2 += t2;
  }
  return Number.isFinite(o2) ? o2 / l2 : NaN;
}
var pt2 = 604800;
var yt2 = 86400;
function ft2(e, t, l2, o2) {
  if ("calendar" === e.mode) return Ar(e, t, l2);
  if ("interval" !== e.mode) return t;
  const c2 = e.seconds;
  if (c2 % pt2 === 0) return Math.floor(gt(t, l2) / (c2 / pt2));
  if (c2 % yt2 === 0) return Math.floor(bt(t, l2) / (c2 / yt2));
  if (null === o2) return Ar(e, t);
  const u2 = mt(t, l2), p2 = It(u2.year, u2.month, u2.day, Math.floor(o2 / 60), o2 % 60, 0, l2);
  return 1e6 * bt(t, l2) + Math.floor((t - p2) / c2);
}
function dt2(e) {
  const t = { index: NaN, year: 0, month: 0, date: 0, from: 1 / 0, to: -1 / 0 };
  return (l2) => {
    if (l2 >= t.from && l2 < t.to) return t;
    const o2 = mt(l2, e), n2 = new Date(Date.UTC(o2.year, o2.month - 1, o2.day + 1));
    return t.index = bt(l2, e), t.year = o2.year, t.month = o2.month, t.date = o2.day, t.from = It(o2.year, o2.month, o2.day, 0, 0, 0, e), t.to = It(n2.getUTCFullYear(), n2.getUTCMonth() + 1, n2.getUTCDate(), 0, 0, 0, e), t;
  };
}
function mt2(e, t, l2) {
  const o2 = "calendar" === e.mode && void 0 !== e.timezone && e.timezone !== t;
  if ("calendar" !== e.mode && "interval" !== e.mode) return (o3) => ft2(e, o3, t, l2);
  if (o2 || "interval" === e.mode && e.seconds % yt2 !== 0 && null === l2) return (o3) => ft2(e, o3, t, l2);
  const a = "interval" === e.mode ? e.seconds : 0, i2 = dt2(t);
  let s2 = NaN, c2 = 0;
  return (o3) => {
    const u2 = i2(o3);
    return u2.index !== s2 && (s2 = u2.index, "calendar" === e.mode ? c2 = Ar(e, o3, t) : null !== l2 && a % yt2 !== 0 && (c2 = It(u2.year, u2.month, u2.date, Math.floor(l2 / 60), l2 % 60, 0, t))), "calendar" === e.mode ? c2 : a % pt2 === 0 ? Math.floor(Math.floor((u2.index + 3) / 7) / (a / pt2)) : a % yt2 === 0 ? Math.floor(u2.index / (a / yt2)) : 1e6 * u2.index + Math.floor((o3 - c2) / a);
  };
}
var ht2 = (e) => Number.isFinite(e);
function bt2(e, t) {
  !ht2(e.open) && ht2(t.open) && (e.open = t.open), ht2(t.high) && (!ht2(e.high) || t.high > e.high) && (e.high = t.high), ht2(t.low) && (!ht2(e.low) || t.low < e.low) && (e.low = t.low), ht2(t.close) && (e.close = t.close), void 0 !== t.volume && (e.volume = (e.volume ?? 0) + t.volume), void 0 !== t.oi && (e.oi = t.oi);
}
function wt2(n2, r2, a, i2 = {}) {
  const s2 = i2.mode ?? "confirmed";
  if (!["confirmed", "developing", "lookahead"].includes(s2)) throw new is("securityExpression: invalid mode");
  const c2 = i2.timezone ?? ct, { bucketing: u2 } = Or(r2);
  if ("interval" !== u2.mode && "calendar" !== u2.mode) throw new is("securityExpression: requested interval must close on the clock");
  const p2 = void 0 === i2.session ? void 0 : Dt(i2.session);
  if (null === p2) throw new is("securityExpression: invalid session");
  if (0 === n2.length) return {};
  const y2 = [], f2 = [], d2 = mt2(u2, c2, p2?.start ?? null), m2 = {};
  let h2, b2, g2 = -1 / 0;
  const w2 = () => {
    const t = a(Object.freeze(y2.slice()));
    if (null === t || "object" != typeof t || Array.isArray(t)) throw new is("securityExpression: expression must return named columns");
    const l2 = Object.keys(t);
    if (h2 && (l2.length !== h2.length || h2.some((e) => !Object.prototype.hasOwnProperty.call(t, e)))) throw new is("securityExpression: expression column keys must remain stable");
    for (const o2 of l2) {
      if (!Array.isArray(t[o2]) || t[o2].length !== y2.length) throw new is("securityExpression: expression column length must match requested bars");
      Object.prototype.hasOwnProperty.call(m2, o2) || Object.defineProperty(m2, o2, { value: new Array(n2.length).fill(null), enumerable: true });
    }
    return h2 = l2, t;
  }, k2 = (e, t, l2) => {
    for (const o2 of h2 ?? []) {
      const n3 = e[o2][l2];
      m2[o2][t] = "number" == typeof n3 && Number.isFinite(n3) ? n3 : null;
    }
  };
  for (let t = 0; t < n2.length; t++) {
    const l2 = n2[t];
    if (!Number.isFinite(l2.time) || l2.time <= g2) throw new is("securityExpression: source times must be finite and strictly increasing");
    g2 = l2.time;
    const o2 = d2(l2.time);
    if (o2 !== b2) y2.push(Object.freeze({ ...l2 }));
    else {
      const e = { ...y2[y2.length - 1] };
      bt2(e, l2), y2[y2.length - 1] = Object.freeze(e);
    }
    b2 = o2, f2.push(y2.length - 1), "developing" === s2 && k2(w2(), t, y2.length - 1);
  }
  if ("developing" !== s2) {
    const e = w2();
    for (let t = 0; t < n2.length; t++) k2(e, t, f2[t] - ("confirmed" === s2 ? 1 : 0));
  }
  return m2;
}
function kt(t) {
  throw new is(`Requested context: ${t}`);
}
function vt2(e) {
  if (null === e || "object" != typeof e || Array.isArray(e)) return false;
  const t = Object.getPrototypeOf(e);
  return t === Object.prototype || null === t;
}
function Nt(e, t, l2) {
  Object.defineProperty(e, t, { value: l2, enumerable: true, writable: true, configurable: true });
}
function Ct(e, t) {
  vt2(e) && Array.isArray(e.bars) && Array.isArray(e.availableAt) && Array.isArray(e.confirmed) || kt("snapshot must contain bars, availableAt and confirmed arrays");
  const l2 = e.bars.length;
  e.availableAt.length === l2 && e.confirmed.length === l2 || kt("snapshot arrays must have equal lengths"), "function" != typeof t && kt("expression must be a function");
  const o2 = [], n2 = [];
  let r2 = -1 / 0, a = -1 / 0, i2 = false;
  for (let t2 = 0; t2 < l2; t2++) {
    const l3 = e.bars[t2];
    (!vt2(l3) || !Number.isFinite(l3.time) || l3.time <= r2) && kt("bar times must be finite and strictly increasing"), (["open", "high", "low", "close"].some((e2) => "number" != typeof l3[e2]) || void 0 !== l3.volume && "number" != typeof l3.volume || void 0 !== l3.oi && "number" != typeof l3.oi) && kt("bar readings must be numbers");
    const s3 = e.availableAt[t2];
    null !== s3 && (!Number.isFinite(s3) || s3 < l3.time) && kt("availability must be null or finite and at or after bar opening"), "boolean" != typeof e.confirmed[t2] && kt("confirmation must be boolean"), r2 = l3.time, o2.push(Object.freeze({ ...l3 })), e.confirmed[t2] && null !== s3 || (i2 = true), i2 || null === s3 || (a = Math.max(a, s3), n2.push(a));
  }
  const s2 = {}, c2 = Object.freeze(o2);
  if (0 === l2) return { bars: c2, eligibleAt: n2, values: s2 };
  const u2 = t(c2);
  vt2(u2) || kt("expression must return named columns");
  for (const e2 of Object.keys(u2)) {
    const t2 = u2[e2];
    Array.isArray(t2) && t2.length === l2 || kt("expression columns must match requested bar count");
    const o3 = [];
    for (let e3 = 0; e3 < l2; e3++) {
      const l3 = t2[e3];
      null !== l3 && "number" != typeof l3 && kt("expression values must be numbers or null"), o3.push(null !== l3 && Number.isFinite(l3) ? l3 : null);
    }
    Nt(s2, e2, o3);
  }
  return { bars: c2, eligibleAt: n2, values: s2 };
}
function Mt(e, t, l2, o2 = {}) {
  Array.isArray(e) || kt("target times must be an array");
  let n2 = -1 / 0;
  for (const t2 of e) (!Number.isFinite(t2) || t2 <= n2) && kt("target times must be finite and strictly increasing"), n2 = t2;
  (!vt2(o2) || void 0 !== o2.gaps && "carry" !== o2.gaps && "missing" !== o2.gaps) && kt("gaps must be carry or missing");
  const { eligibleAt: r2, values: a } = Ct(t, l2), i2 = Object.keys(a), s2 = {};
  for (const t2 of i2) Nt(s2, t2, new Array(e.length).fill(null));
  let c2 = -1, u2 = -1;
  for (let t2 = 0; t2 < e.length; t2++) {
    for (; c2 + 1 < r2.length && r2[c2 + 1] <= e[t2]; ) c2++;
    if (c2 >= 0 && ("missing" !== o2.gaps || c2 !== u2)) for (const e2 of i2) s2[e2][t2] = a[e2][c2];
    u2 = c2;
  }
  return s2;
}
var At2 = (e) => true === e?.[Symbol.for("openalgo-charts.data-context.passing")];
function St2(e) {
  const t = nn(e);
  return nn(t && { session: t.session, adjustment: t.adjustment });
}
var Lt2 = "__requestedIndicator";
var Bt2 = { bars: [], availableAt: [], confirmed: [] };
var Ft2 = (e) => e[Lt2];
var Kt2 = (t) => {
  throw new is(`Requested indicator: ${t}`);
};
function Wt(e) {
  !function(e2) {
    "function" == typeof e2.request && "function" == typeof e2.expression || Kt2("request and expression must be functions"), void 0 !== e2.gaps && "carry" !== e2.gaps && "missing" !== e2.gaps && Kt2("gaps must be carry or missing"), void 0 !== e2.targetTimes && "function" != typeof e2.targetTimes && Kt2("targetTimes must be a function");
  }(e);
  const t = [...new Set(e.plots.flatMap((e2) => void 0 === e2.ohlc ? [e2.key] : [e2.ohlc.open, e2.ohlc.high, e2.ohlc.low, e2.ohlc.close]))], l2 = /* @__PURE__ */ new WeakMap();
  return { id: e.id, name: e.name, category: e.category, placement: e.placement, inputs: e.inputs, plots: e.plots, levels: e.levels, range: e.range, calc: (o2, n2, r2, a) => {
    const i2 = Ft2(r2);
    try {
      const s2 = { ...i2?.context, bars: o2, settings: n2, calculation: a }, c2 = e.targetTimes?.(s2) ?? o2.map((e2) => e2.time);
      Array.isArray(c2) && c2.length === o2.length || Kt2("target times must match source length");
      const u2 = Mt(c2, i2?.snapshot ?? Bt2, (t2) => e.expression(t2, n2, s2), { gaps: e.gaps });
      for (const e2 of t) i2?.snapshot?.bars.length && !Object.prototype.hasOwnProperty.call(u2, e2) && Kt2(`expression is missing plot column ${e2}`), Object.prototype.hasOwnProperty.call(u2, e2) || Object.defineProperty(u2, e2, { value: new Array(o2.length).fill(null), enumerable: true, writable: true, configurable: true });
      return l2.delete(r2), u2;
    } catch (e2) {
      throw l2.set(r2, { snapshot: i2?.snapshot ?? null, error: e2 }), e2;
    }
  }, attach: (t2) => {
    const o2 = Ft2(t2.store) ?? { owner: 0, key: null, completed: null, wanted: null, request: null, snapshot: null, context: null, status: { state: "empty" } };
    t2.store[Lt2] = o2;
    const n2 = ++o2.owner;
    let r2 = true, a = 0, i2 = 0, s2 = null, p2 = () => {
    };
    const y2 = () => r2 && o2.owner === n2 && !t2.signal?.aborted, f2 = (e2) => {
      o2.status = e2, y2() && t2.setDataStatus?.(e2);
    }, d2 = () => {
      const e2 = o2.request;
      o2.request = null, s2 = null, e2?.controller.abort(), e2?.reject(e2.controller.signal.reason);
    }, m2 = () => {
      o2.completed = null, o2.wanted = null;
      const e2 = null !== o2.snapshot;
      o2.snapshot = null, d2(), e2 && t2.requestRecompute();
    }, h2 = (e2) => {
      s2 !== e2 && (s2 = e2, e2.promise.then((n3) => {
        if (!y2() || o2.request !== e2 || e2.controller.signal.aborted) return;
        let r3;
        try {
          r3 = function(e3, t3) {
            let l3 = [];
            Mt([], e3, (e4) => (l3 = e4, {}));
            let o3 = l3.length;
            if (void 0 !== t3) for (o3 = 0; o3 < l3.length && e3.confirmed[o3] && null !== e3.availableAt[o3] && e3.availableAt[o3] <= t3; ) o3++;
            return Object.freeze({ bars: Object.freeze(l3.slice(0, o3)), availableAt: Object.freeze(e3.availableAt.slice(0, o3)), confirmed: Object.freeze(e3.confirmed.slice(0, o3)) });
          }(n3, e2.selection.request.asOf);
        } catch (t3) {
          return void b2(e2, t3);
        }
        o2.request = null, s2 = null;
        const a2 = o2.snapshot;
        o2.snapshot = r3, o2.completed = e2.selection.version;
        try {
          t2.requestRecompute();
          const e3 = l2.get(t2.store);
          if (e3?.snapshot === r3) throw e3.error;
        } catch (t3) {
          return void (y2() && o2.snapshot === r3 && o2.key === e2.selection.key && (o2.snapshot = a2, f2({ state: "error", error: t3 }), o2.wanted?.version !== e2.selection.version && w2()));
        }
        y2() && o2.snapshot === r3 && (null === o2.request && f2({ state: r3.bars.length ? "ready" : "empty" }), w2());
      }, (t3) => b2(e2, t3)));
    }, b2 = (e2, t3) => {
      y2() && o2.request === e2 && !e2.controller.signal.aborted && (o2.request = null, s2 = null, o2.completed = e2.selection.version, f2({ state: "error", error: t3 }), o2.wanted?.version !== e2.selection.version && w2());
    }, g2 = (e2) => {
      if (y2() && o2.request === e2 && !e2.controller.signal.aborted && !e2.started) {
        e2.started = true;
        try {
          e2.resolve(t2.requestSnapshot({ ...e2.selection.request, signal: e2.controller.signal }));
        } catch (t3) {
          e2.reject(t3);
        }
      }
    }, w2 = (l3 = false) => {
      if (!y2() || At2(t2.dataContext?.())) return;
      const n3 = ++i2, r3 = () => y2() && i2 === n3, s3 = o2.context?.requestState?.replay, p3 = t2.requestState?.(), d3 = p3?.replay, b3 = { bars: t2.bars(), settings: t2.settings(), dataContext: t2.dataContext?.(), requestState: p3 };
      let w3;
      o2.context = b3;
      let k3 = "";
      try {
        const t3 = e.request(b3);
        w3 = null === t3 ? null : function(e2, t4) {
          let l4;
          (null === e2 || "object" != typeof e2 || "string" != typeof e2.symbol || "" === e2.symbol.trim() || "string" != typeof e2.interval || "" === e2.interval.trim() || void 0 !== e2.exchange && "string" != typeof e2.exchange || !Number.isFinite(e2.from) || !Number.isFinite(e2.to) || e2.from > e2.to || void 0 !== e2.asOf && !Number.isFinite(e2.asOf) || void 0 !== e2.warmupBars && (!Number.isInteger(e2.warmupBars) || e2.warmupBars < 0 || e2.warmupBars > 1e5)) && Kt2("request requires an instrument and a finite ordered time window");
          try {
            l4 = void 0 === e2.variant ? St2(t4?.variant) : nn(e2.variant);
          } catch {
            Kt2("request variant must be a data variant");
          }
          return { symbol: e2.symbol, exchange: e2.exchange, interval: e2.interval, from: e2.from, to: e2.to, asOf: e2.asOf, ...void 0 === e2.warmupBars ? {} : { warmupBars: e2.warmupBars }, ...l4 ? { variant: l4 } : {} };
        }(t3, b3.dataContext), k3 = on(b3.dataContext?.variant);
      } catch (e2) {
        return void (r3() && (m2(), r3() && f2({ state: "error", error: e2 })));
      }
      if (!r3()) return;
      if (null === w3 || void 0 === t2.requestSnapshot || false === p3?.supportsSnapshots || void 0 !== d3 && void 0 === d3.asOf) return m2(), void (r3() && (o2.key = null, f2({ state: "unsupported" })));
      if (0 === b3.bars.length) return m2(), void (r3() && f2({ state: "empty" }));
      const v3 = p3?.source, N3 = b3.dataContext, C2 = JSON.stringify([w3.symbol, w3.exchange, w3.interval, w3.asOf, w3.warmupBars, N3?.symbol, N3?.exchange, N3?.interval, k3, w3.variant ?? null, p3?.providerRevision, v3?.sourceId, void 0 === d3 ? v3?.historyRevision : null, void 0 !== d3]), M2 = void 0 !== d3?.asOf && void 0 !== s3?.asOf && d3.asOf < s3.asOf;
      if (o2.key !== C2 || M2) {
        if (m2(), !r3()) return;
        o2.key = C2;
      }
      void 0 !== d3?.asOf && (w3.asOf = void 0 === w3.asOf ? d3.asOf : Math.min(w3.asOf, d3.asOf));
      const x2 = JSON.stringify([C2, w3.from, w3.to, w3.asOf, w3.warmupBars, void 0 === d3 && false !== e.refreshOnSourceUpdate ? v3?.revision : null, p3?.dataRevision, d3?.time, d3?.forming, a]), A2 = { key: C2, version: x2, request: w3 };
      o2.wanted = A2, null !== o2.request ? (h2(o2.request), g2(o2.request)) : (l3 || o2.completed !== x2) && ((e2) => {
        let t3, l4;
        const n4 = { selection: e2, controller: new AbortController(), started: false, promise: new Promise((e3, o3) => {
          t3 = e3, l4 = o3;
        }), resolve: t3, reject: l4 };
        o2.request = n4, h2(n4), f2({ state: "loading" }), g2(n4);
      })(A2);
    }, k2 = () => {
      r2 && (r2 = false, p2(), t2.signal?.removeEventListener("abort", v2), o2.owner === n2 && (t2.setDataRetry?.(null), queueMicrotask(() => {
        o2.owner === n2 && d2();
      })));
    }, v2 = () => {
      o2.owner === n2 && d2(), k2();
    };
    t2.signal?.addEventListener("abort", v2, { once: true }), p2 = void 0 !== t2.subscribeRequestChanges ? t2.subscribeRequestChanges(() => w2()) : t2.subscribeDataChanges?.(() => {
      a++, w2();
    }) ?? (() => {
    }), t2.setDataRetry?.(() => w2(true));
    const N2 = l2.get(t2.store);
    return t2.setDataStatus?.(N2?.snapshot === o2.snapshot ? { state: "error", error: N2.error } : o2.status), w2(), k2;
  } };
}
var Dt2 = "timeframe";
var Ot2 = { key: Dt2, type: "interval", label: "Timeframe", default: "", tooltip: "Compute on a higher timeframe, using independent history when the host supports it. Values appear once their periods close." };
var Rt2 = { month: 1, quarter: 3, year: 12 };
function Tt(e) {
  return "interval" === e.mode ? e.seconds : "calendar" === e.mode ? Rt2[e.unit] * Math.max(1, Math.floor(e.count ?? 1)) * 2629746 : NaN;
}
function Pt2(l2, o2, n2) {
  const r2 = o2[Dt2];
  if (null == r2) return null;
  if ("string" != typeof r2) throw new is(`${l2.name}: the timeframe must be an interval code`);
  const a = r2.trim();
  if ("" === a) return null;
  const i2 = Sr(a);
  if (null === i2) throw new is(`${l2.name}: "${a}" is not a known timeframe`);
  if (!kr(i2.bucketing)) throw new is(`${l2.name}: "${a}" bars close on trade flow, not the clock, so they cannot be folded`);
  const s2 = n2?.interval, c2 = void 0 === s2 || "" === s2 ? null : Sr(s2)?.bucketing ?? null;
  if (null !== c2) {
    if (!kr(c2)) throw new is(`${l2.name}: the chart's "${s2 ?? ""}" bars close on trade flow, not the clock, so they cannot be folded`);
    if (Tt(i2.bucketing) <= Tt(c2)) return null;
  }
  if (true === n2?.transformed) throw new is(`${l2.name}: this chart draws transformed bars, which a timeframe cannot fold; compute the study on the underlying bars`);
  for (const t of l2.inputs) {
    const n3 = o2[t.key];
    if ("source" === t.type && "object" == typeof n3 && null !== n3) throw new is(`${l2.name}: another study's output cannot be folded to a timeframe; pick a price source`);
  }
  const u2 = n2?.timezone ?? ("string" == typeof o2.timezone && "" !== o2.timezone ? o2.timezone : ct);
  return { tf: a, bucketing: i2.bucketing, zone: u2, known: null !== c2 };
}
function Ut2(e) {
  const t = String(Math.floor(e / 60)).padStart(2, "0") + String(e % 60).padStart(2, "0");
  return `${t}-${t}`;
}
function $t2(e, t, l2) {
  if (void 0 === e) return;
  const { resolveSource: o2, ...n2 } = e;
  return { ...n2, interval: t, barState: { ...e.barState, lastIndex: l2 - 1 } };
}
var It2 = (e) => "number" == typeof e && Number.isFinite(e) ? e : null;
var Et2 = /* @__PURE__ */ new WeakMap();
var qt = (e) => "object" == typeof e && null !== e ? e : null;
function Vt(e, t) {
  const l2 = qt(e);
  null !== l2 && (null === t ? Et2.delete(l2) : Et2.set(l2, t));
}
function Ht2(e, t = {}) {
  if (e.inputs.some((e2) => e2.key === Dt2)) throw new Error(`withTimeframe: ${e.id} already has a "${Dt2}" input`);
  if (void 0 !== e.attach) throw new Error(`withTimeframe: ${e.id} brings its own data, which a timeframe cannot fold`);
  const l2 = e.inputs.findIndex((e2) => void 0 !== e2.group), o2 = l2 < 0 ? [...e.inputs, Ot2] : [...e.inputs.slice(0, l2), Ot2, ...e.inputs.slice(l2)], n2 = { ...e, inputs: o2, calc: (t2, l3, o3, n3) => {
    const r2 = Pt2(e, l3, n3);
    if (null === r2 || 0 === t2.length) return Vt(o3, null), e.calc(t2, l3, o3, n3);
    const a = "interval" === r2.bucketing.mode && r2.bucketing.seconds % 86400 != 0 ? function(e2, t3) {
      const l4 = /* @__PURE__ */ new Map(), o4 = dt2(t3);
      let n4 = NaN;
      for (const r4 of e2) {
        const e3 = o4(r4.time).index;
        if (e3 === n4) continue;
        const a3 = mt(r4.time, t3), i3 = 60 * a3.hour + a3.minute;
        l4.set(i3, (l4.get(i3) ?? 0) + 1), n4 = e3;
      }
      let r3 = null, a2 = 0;
      for (const [e3, t4] of l4) (t4 > a2 || t4 === a2 && null !== r3 && e3 < r3) && (r3 = e3, a2 = t4);
      return r3;
    }(t2, r2.zone) : null;
    let i2 = 0, c2 = true;
    const u2 = wt2(t2, r2.tf, (t3) => {
      i2 = t3.length;
      const a2 = e.calc(t3, l3, o3, $t2(n3, r2.tf, i2));
      if (i2 > 1) {
        const o4 = e.calc(t3.slice(0, -1), l3, {}, $t2(n3, r2.tf, i2 - 1));
        c2 = function(e2, t4, l4) {
          for (const o5 of Object.keys(t4)) {
            const n4 = e2[o5], r3 = t4[o5];
            if (void 0 === n4 || void 0 === r3) return false;
            for (let e3 = 0; e3 < l4; e3++) if (!Object.is(It2(n4[e3]), It2(r3[e3]))) return false;
          }
          return true;
        }(o4, a2, i2 - 1);
      }
      return a2;
    }, { mode: "confirmed", timezone: r2.zone, ...null === a ? {} : { session: Ut2(a) } });
    return r2.known || i2 !== t2.length ? (Vt(o3, c2 ? { tf: r2.tf, zone: r2.zone, sessionStart: a, identity: false } : null), u2) : (Vt(o3, { tf: r2.tf, zone: r2.zone, sessionStart: a, identity: true }), e.calc(t2, l3, o3, n3));
  } };
  return Object.defineProperty(n2, "calcTail", { value: (t2, l3, o3, n3, r2, a) => {
    const i2 = Pt2(e, l3, a);
    if (null === i2) return e.calcTail?.(t2, l3, o3, n3, r2, a) ?? null;
    const s2 = qt(r2), c2 = null === s2 ? void 0 : Et2.get(s2), u2 = t2.length;
    if (void 0 === c2 || c2.tf !== i2.tf || c2.zone !== i2.zone || o3 < 0 || o3 >= u2) return null;
    if (c2.identity) return u2 === o3 + 1 ? e.calcTail?.(t2, l3, o3, n3, r2, a) ?? null : null;
    const p2 = (e2) => ft2(i2.bucketing, t2[e2]?.time ?? NaN, i2.zone, c2.sessionStart), y2 = p2(o3);
    for (let e2 = o3 + 1; e2 < u2; e2++) if (p2(e2) !== y2) return null;
    const f2 = {};
    for (const e2 of Object.keys(n3)) {
      const t3 = n3[e2];
      if (void 0 === t3 || t3.length <= o3) return null;
      f2[e2] = new Array(u2 - o3).fill(t3[o3] ?? null);
    }
    return f2;
  }, enumerable: false, writable: true, configurable: true }), function(e2, t2, l3, o3) {
    const n3 = /* @__PURE__ */ new WeakMap(), r2 = /* @__PURE__ */ new WeakSet(), a = (e3) => {
      const t3 = e3.requestState?.();
      return true === t3?.supportsWarmup && true === t3.supportsSnapshots;
    }, i2 = (e3) => {
      if (!a(e3) || null === l3(e3.settings())) return false;
      const t3 = e3.dataContext?.()?.interval;
      try {
        return null !== o3(e3.settings(), { interval: t3, barState: { isNew: false, isConfirmed: true, isRealtime: false, lastIndex: 0 } });
      } catch {
        return true;
      }
    }, s2 = Wt({ ...e2, refreshOnSourceUpdate: false, request: (e3) => {
      if (!e3.requestState?.supportsWarmup || !e3.requestState.supportsSnapshots) return null;
      const t3 = l3(e3.settings), n4 = e3.dataContext?.interval, r3 = o3(e3.settings, { interval: n4, barState: { isNew: false, isConfirmed: true, isRealtime: false, lastIndex: e3.bars.length - 1 } });
      return null === t3 || !r3 || !e3.dataContext?.symbol || !e3.bars.length || Number(e3.settings.offset ?? 0) < 0 ? null : { symbol: e3.dataContext.symbol, interval: r3, ...void 0 === e3.dataContext.exchange ? {} : { exchange: e3.dataContext.exchange }, from: e3.bars[0].time, to: e3.bars[e3.bars.length - 1].time + 1, warmupBars: t3 };
    }, expression: (t3, l4, o4) => {
      const { resolveSource: n4, ...r3 } = o4.calculation ?? {}, a2 = o4.calculation ? { ...r3, interval: String(l4.timeframe), barState: { ...o4.calculation.barState, lastIndex: t3.length - 1 } } : void 0;
      return e2.calc(t3, l4, {}, a2);
    } }), c2 = (e3, t3, r3) => {
      const i3 = n3.get(e3);
      return void 0 !== i3 && a(i3) && null !== l3(t3) && null !== o3(t3, r3);
    }, u2 = { ...t2, calc: (e3, l4, o4, n4) => c2(o4, l4, n4) ? s2.calc(e3, l4, o4, n4) : t2.calc(e3, l4, o4, n4), attach: (e3) => {
      n3.set(e3.store, e3);
      const t3 = s2.attach({ ...e3, setDataStatus: (t4) => {
        i2(e3) ? (r2.add(e3.store), e3.setDataStatus?.(t4)) : r2.delete(e3.store) && e3.setDataStatus?.({ state: "ready" });
      }, setDataRetry: (t4) => {
        (i2(e3) || null === t4) && e3.setDataRetry?.(t4);
      } });
      return () => {
        n3.get(e3.store) === e3 && n3.delete(e3.store), "function" == typeof t3 && t3();
      };
    } };
    return Object.defineProperty(u2, "calcTail", { enumerable: false, configurable: true, writable: true, value: (...e3) => c2(e3[4], e3[1], e3[5]) ? null : t2.calcTail?.(...e3) ?? null }), u2;
  }(e, n2, t.historyBars ?? ((t2) => function(e2, t3) {
    const l3 = (e3, l4) => Math.max(1, Math.round(Number(t3[e3] ?? l4))), o3 = l3("length", 20), n3 = Math.max(0, Math.round(Number(t3.offset ?? 0)));
    switch (e2) {
      case "sma":
      case "ema":
      case "wma":
        return l3("length", 9);
      case "vwma":
      case "lsma":
      case "donchian":
        return o3 + n3;
      case "alma":
      case "smma":
      case "mcginley-dynamic":
      case "bollinger":
      case "envelope":
        return o3;
      case "dema":
        return 2 * o3 - 1;
      case "tema":
        return 3 * o3 - 2;
      case "t3":
        return 6 * o3 - 5;
      case "hma":
        return o3 + Math.ceil(Math.sqrt(o3));
      case "zlema":
        return o3 + Math.floor((o3 - 1) / 2);
      case "kama":
        return l3("erLength", 10) + 1;
      case "vidya":
        return o3 + l3("cmoLength", 9) + 1;
      case "rsi":
        return l3("length", 14) + 1;
      case "macd":
        return Math.max(l3("fastPeriod", 12), l3("slowPeriod", 26)) + l3("signalPeriod", 9) - 1;
      case "stochastic":
        return l3("kPeriod", 14) + l3("kSmoothing", 1) + l3("dPeriod", 3) - 2;
      case "stochastic-rsi":
        return l3("lengthRSI", 14) + l3("lengthStoch", 14) + l3("smoothK", 3) + l3("smoothD", 3);
      case "adx":
        return l3("period", 14) + l3("adxPeriod", 14);
      case "atr":
      case "supertrend":
        return l3("period", 14) + 1;
      case "keltner-channel":
        return Math.max(o3, l3("atrlength", 10)) + 1;
      case "parabolic-sar":
        return 2;
      case "williams-percent-r":
        return l3("length", 14);
      case "cci":
        return l3("period", 20);
      default:
        return null;
    }
  }(e.id, t2)), (t2, l3) => Pt2(e, t2, l3)?.tf ?? null);
}
var zt2 = (e, t, l2) => {
  const o2 = e[t];
  return "number" == typeof o2 && Number.isFinite(o2) ? o2 : l2;
};
var jt2 = (e, t, l2, o2 = 1) => Math.max(o2, Math.round(zt2(e, t, l2)));
var Zt2 = (e, t, l2) => Math.round(zt2(e, t, l2));
var Yt2 = (e, t, l2) => {
  const o2 = e[t];
  return "string" == typeof o2 && "" !== o2 ? o2 : l2;
};
var Jt2 = (e, t, l2) => {
  const o2 = e[t];
  return "boolean" == typeof o2 ? o2 : l2;
};
var Gt2 = (e, t = "source", l2 = "close") => e[t] ?? l2;
var Xt2 = (e) => {
  const l2 = e.timezone;
  return "string" != typeof l2 || "" === l2 || l2 === ct ? ct : pt(l2) ? l2 : ct;
};
function _t2(e, t) {
  const l2 = e.length, o2 = new Array(l2).fill(NaN);
  for (let n2 = Math.max(0, t), r2 = Math.min(l2, l2 + t); n2 < r2; n2++) o2[n2] = e[n2 - t];
  return o2;
}
function Qt2(e, t) {
  const l2 = new Array(e.length).fill(false);
  for (let o2 = t; o2 < e.length; o2++) l2[o2] = e[o2 - t];
  return l2;
}
var el = (e, t) => new Array(e).fill(t);
var tl = (e) => "number" == typeof e.volume && Number.isFinite(e.volume) ? e.volume : 0;
function ll2(e, t, l2) {
  const o2 = new Array(e.length);
  for (let n2 = 0; n2 < e.length; n2++) o2[n2] = l2(e[n2], t[n2]);
  return o2;
}
var ol = (e) => Math.floor((Math.floor((e + Je) / 86400) + 3) / 7);
function nl(e, l2) {
  return l2 !== ct ? (t, o2) => Ot(t, o2, e, l2) : "week" === e ? (e2, t) => ol(e2) !== ol(t) : (t, l3) => {
    const o2 = et(t), n2 = et(l3);
    return o2.year !== n2.year || "year" !== e && ("quarter" === e ? Math.floor((o2.month - 1) / 3) !== Math.floor((n2.month - 1) / 3) : o2.month !== n2.month);
  };
}
function rl(e, t, l2, o2, n2) {
  return Ze({ id: e, name: t, category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close", allowStudyOutputs: true }, { key: "color", type: "color", label: "Color", default: l2 }], plots: [{ key: "ma", type: "line", title: t, colorKey: "color", style: { color: l2, lineWidth: 1.5 } }], calc: (e2, t2, l3, n3) => {
    const r2 = Gt2(t2), a = "string" == typeof r2 ? gs(e2, r2) : gs(e2, r2, n3).map((e3) => e3 ?? NaN);
    return { ma: he(o2(a, jt2(t2, "length", 9), "string" == typeof r2 ? void 0 : { missing: "propagate" })) };
  } }, (e2) => n2 ? /* @__PURE__ */ function(e3) {
    return (t2, l3, o3, n3, r2, a) => {
      const i2 = jt2(l3, "length", 9);
      if (!ze(i2)) return null;
      const s2 = Gt2(l3);
      if ("string" == typeof s2) return et2(e3, `${i2}|${s2}`, { keys: ["ma"], start: lt, step: (e4, l4, o4) => {
        o4[0] = He2(ot2(e4, bs(t2[l4], s2), i2, true));
      } }, t2, o3, n3, r2);
      if (void 0 === Ye2(r2, e3, t2, o3)) return null;
      const c2 = a?.resolveSource?.(s2);
      return Array.isArray(c2) && c2.length === t2.length ? et2(e3, `${i2}|${s2.instanceId}|${s2.plotKey}`, { keys: ["ma"], start: nt2, step: (e4, t3, l4) => {
        l4[0] = He2(function(e5, t4, l5) {
          if (!Number.isFinite(t4)) return e5.count = 0, e5.seed.length = 0, e5.value = NaN, NaN;
          if (e5.count < l5) {
            if (e5.seed.push(t4), ++e5.count < l5) return NaN;
            e5.value = ne2(e5.seed), e5.seed.length = 0;
          } else e5.value = ne2([e5.value, t4], [l5 - 1, 2]);
          return e5.value;
        }(e4, c2[t3] ?? NaN, i2));
      } }, t2, o3, n3, r2) : null;
    };
  }(e2) : function(e3, t2) {
    const l3 = Qe(e3, (e4) => {
      const t3 = jt2(e4, "length", 9);
      return ze(t3) ? t3 - 1 : null;
    });
    return (o3, n3, r2, a, i2, s2) => {
      const c2 = Gt2(n3);
      if ("string" == typeof c2) return l3(o3, n3, r2, a, i2, s2);
      const u2 = jt2(n3, "length", 9), p2 = Ye2(i2, e3, o3, r2), y2 = void 0 === p2 ? void 0 : s2?.resolveSource?.(c2);
      if (void 0 === p2 || !ze(u2) || !Array.isArray(y2) || y2.length !== o3.length) return null;
      const f2 = Math.max(0, r2 - u2), d2 = y2.slice(f2).map((e4) => e4 ?? NaN);
      return _e2(p2, { ma: he(t2(d2, u2, { missing: "propagate" })) }, r2 - f2, a, r2);
    };
  }(e2, o2));
}
var al2 = Ht2(rl("sma", "SMA", "#4f8cff", ce2, false));
var il = Ht2(rl("wma", "WMA", "#ab47bc", ue2, false));
var sl = Ht2(rl("ema", "EMA", "#f5a623", be2, true));
var cl = Ht2(Ze({ id: "bollinger", name: "Bollinger Bands", category: "Volatility", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 2, max: 1e3, step: 1 }, { key: "stdDev", type: "number", label: "StdDev", default: 2, min: 0.1, max: 10, step: 0.1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "basisColor", type: "color", label: "Basis", default: "#f5a623" }, { key: "bandColor", type: "color", label: "Bands", default: "#4f8cff" }], plots: [{ key: "upper", type: "line", title: "BB Upper", colorKey: "bandColor", style: { lineWidth: 1 } }, { key: "basis", type: "line", title: "BB Basis", colorKey: "basisColor", style: { lineWidth: 1.5 } }, { key: "lower", type: "line", title: "BB Lower", colorKey: "bandColor", style: { lineWidth: 1 } }], calc: function(e, t) {
  const l2 = gs(e, Gt2(t)), o2 = jt2(t, "length", 20), n2 = zt2(t, "stdDev", 2), r2 = ce2(l2, o2), a = fe2(l2, o2), i2 = ll2(r2, a, (e2, t2) => e2 + n2 * t2), s2 = ll2(r2, a, (e2, t2) => e2 - n2 * t2);
  return { upper: he(i2), basis: he(r2), lower: he(s2) };
} }, (e) => Qe(e, (e2) => {
  const t = jt2(e2, "length", 20);
  return ze(t) ? t - 1 : null;
})));
function ul(e, t, l2) {
  if ("continuous" === t) return new Array(e.length).fill(false);
  const o2 = e.map((e2) => e2.time);
  return "session" === t ? zt(o2, l2) : Et(o2, nl(t, l2));
}
var pl = (e) => e.median > 0 && e.median < 86400;
var yl = (e) => Math.max(4 * e.median, 14400);
var fl = (e) => pl(e) && e.opens > 0 && e.short > e.opens >> 1;
function dl(e, t) {
  const l2 = [];
  for (let t2 = 1; t2 < e.length; t2++) e[t2] > e[t2 - 1] && l2.push(e[t2] - e[t2 - 1]);
  l2.sort((e2, t2) => e2 - t2);
  const o2 = 0 === l2.length ? 0 : l2[l2.length >> 1], n2 = { gaps: l2.length, median: o2, below: 0, equal: 0, opens: 0, short: 0, open: e[0], last: e[e.length - 1], flag: t };
  for (const e2 of l2) e2 < o2 ? n2.below++ : e2 === o2 && n2.equal++;
  if (pl(n2)) for (let t2 = 1; t2 < e.length; t2++) e[t2] - e[t2 - 1] < yl(n2) || (n2.opens++, e[t2] - n2.open <= 129600 && n2.short++, n2.open = e[t2]);
  return n2;
}
var ml = Ze({ id: "vwap", name: "VWAP", category: "Volume", placement: "onchart", inputs: [{ key: "anchor", type: "select", label: "Anchor Period", default: "session", options: [{ label: "Session", value: "session" }, { label: "Week", value: "week" }, { label: "Month", value: "month" }, { label: "Quarter", value: "quarter" }, { label: "Year", value: "year" }, { label: "Continuous", value: "continuous" }] }, { key: "source", type: "source", label: "Source", default: "hlc3" }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "calcMode", type: "select", label: "Bands Calculation Mode", default: "stdev", options: [{ label: "Standard Deviation", value: "stdev" }, { label: "Percentage", value: "percent" }], group: "Bands" }, { key: "showBand1", type: "boolean", label: "Band #1", default: true, group: "Bands" }, { key: "bandMult1", type: "number", label: "Bands Multiplier #1", default: 1, min: 0, step: 0.5, group: "Bands" }, { key: "showBand2", type: "boolean", label: "Band #2", default: false, group: "Bands" }, { key: "bandMult2", type: "number", label: "Bands Multiplier #2", default: 2, min: 0, step: 0.5, group: "Bands" }, { key: "showBand3", type: "boolean", label: "Band #3", default: false, group: "Bands" }, { key: "bandMult3", type: "number", label: "Bands Multiplier #3", default: 3, min: 0, step: 0.5, group: "Bands" }, { key: "color", type: "color", label: "VWAP", default: "#2962ff" }, { key: "band1Color", type: "color", label: "Band #1", default: "#4caf50", group: "Bands" }, { key: "band2Color", type: "color", label: "Band #2", default: "#808000", group: "Bands" }, { key: "band3Color", type: "color", label: "Band #3", default: "#00bcd4", group: "Bands" }], plots: [{ key: "vwap", type: "line", title: "VWAP", colorKey: "color", style: { lineWidth: 1.5 } }, { key: "upper1", type: "line", title: "Upper Band #1", colorKey: "band1Color", style: { lineWidth: 1 } }, { key: "lower1", type: "line", title: "Lower Band #1", colorKey: "band1Color", style: { lineWidth: 1 } }, { key: "upper2", type: "line", title: "Upper Band #2", colorKey: "band2Color", style: { lineWidth: 1 } }, { key: "lower2", type: "line", title: "Lower Band #2", colorKey: "band2Color", style: { lineWidth: 1 } }, { key: "upper3", type: "line", title: "Upper Band #3", colorKey: "band3Color", style: { lineWidth: 1 } }, { key: "lower3", type: "line", title: "Lower Band #3", colorKey: "band3Color", style: { lineWidth: 1 } }], fills: [{ between: ["upper1", "lower1"], colorUpKey: "band1Color", colorDownKey: "band1Color", opacity: 0.05 }, { between: ["upper2", "lower2"], colorUpKey: "band2Color", colorDownKey: "band2Color", opacity: 0.05 }, { between: ["upper3", "lower3"], colorUpKey: "band3Color", colorDownKey: "band3Color", opacity: 0.05 }], calc: (e, t) => {
  const l2 = e.length, o2 = gs(e, Gt2(t, "source", "hlc3")), n2 = Yt2(t, "anchor", "session"), r2 = "percent" === t.calcMode, a = Zt2(t, "offset", 0), i2 = new Array(l2).fill(NaN), s2 = new Array(l2).fill(NaN), c2 = ul(e, n2, Xt2(t));
  let u2 = 0, p2 = 0, y2 = 0;
  for (let t2 = 0; t2 < l2; t2++) {
    c2[t2] && (u2 = 0, p2 = 0, y2 = 0);
    const l3 = e[t2].volume ?? 0, n3 = o2[t2];
    if (!Number.isFinite(n3) || !Number.isFinite(l3)) continue;
    if (u2 += n3 * l3, y2 += n3 * n3 * l3, p2 += l3, p2 <= 0) continue;
    const a2 = u2 / p2;
    i2[t2] = a2;
    const f3 = Math.max(0, y2 / p2 - a2 * a2);
    s2[t2] = r2 ? 0.01 * a2 : Math.sqrt(f3);
  }
  const f2 = (e2, t2, o3) => {
    const n3 = new Array(l2).fill(NaN);
    if (!e2) return n3;
    for (let e3 = 0; e3 < l2; e3++) Number.isFinite(i2[e3]) && Number.isFinite(s2[e3]) && (n3[e3] = i2[e3] + o3 * s2[e3] * t2);
    return n3;
  }, d2 = false !== t.showBand1, m2 = true === t.showBand2, h2 = true === t.showBand3, g2 = zt2(t, "bandMult1", 1), w2 = zt2(t, "bandMult2", 2), k2 = zt2(t, "bandMult3", 3);
  return { vwap: he(_t2(i2, a)), upper1: he(_t2(f2(d2, g2, 1), a)), lower1: he(_t2(f2(d2, g2, -1), a)), upper2: he(_t2(f2(m2, w2, 1), a)), lower2: he(_t2(f2(m2, w2, -1), a)), upper3: he(_t2(f2(h2, k2, 1), a)), lower3: he(_t2(f2(h2, k2, -1), a)) };
} }, function(e) {
  return (l2, o2, n2, r2, a) => {
    const i2 = l2.length;
    if (0 !== Zt2(o2, "offset", 0) || i2 - n2 > 2) return null;
    const s2 = Gt2(o2, "source", "hlc3"), c2 = Yt2(o2, "anchor", "session"), u2 = Xt2(o2), p2 = "percent" === o2.calcMode, y2 = [false !== o2.showBand1, true === o2.showBand2, true === o2.showBand3], f2 = [zt2(o2, "bandMult1", 1), zt2(o2, "bandMult2", 2), zt2(o2, "bandMult3", 3)];
    let d2 = [], m2 = [];
    return et2(e, `${c2}|${s2}|${u2}|${p2}|${y2.join()}|${f2.join()}`, { keys: ["vwap", "upper1", "lower1", "upper2", "lower2", "upper3", "lower3"], start: () => {
      const e2 = n2 + 1 === i2 ? l2 : l2.slice(0, n2 + 1);
      return d2 = ul(e2, c2, u2), { pv: 0, vol: 0, pv2: 0, reading: "continuous" === c2 ? null : dl(e2.map((e3) => e3.time), d2[n2]) };
    }, ready: (e2) => {
      const o3 = e2.reading;
      if (null === o3 || "continuous" === c2) return m2 = [false, false], true;
      if (o3.last !== l2[n2].time) return false;
      const r3 = o3.flag, a2 = i2 === n2 + 2 && function(e3, l3, o4, n3) {
        const r4 = fl(e3), a3 = l3 - e3.last;
        if (a3 > 0) {
          if (0 === e3.gaps) return null;
          const t = e3.gaps + 1 >> 1, l4 = e3.below + (a3 < e3.median ? 1 : 0), o5 = e3.equal + (a3 === e3.median ? 1 : 0);
          if (l4 > t || t >= l4 + o5) return null;
          e3.gaps++, e3.below = l4, e3.equal = o5;
        }
        const i3 = pl(e3) && a3 >= yl(e3), s3 = e3.open, c3 = e3.last;
        return i3 && (e3.opens++, l3 - e3.open <= 129600 && e3.short++, e3.open = l3), fl(e3) !== r4 ? null : (e3.last = l3, e3.flag = "session" === o4 ? r4 ? i3 : n3 === ct ? ht(c3, l3) : yt(c3, l3, n3) : r4 ? i3 && nl(o4, n3)(s3, l3) : nl(o4, n3)(c3, l3), e3.flag);
      }(o3, l2[i2 - 1].time, c2, u2);
      return m2 = [r3, true === a2], null !== a2;
    }, step: (e2, t, o3) => {
      (t < n2 ? d2[t] : m2[t - n2]) && (e2.pv = 0, e2.vol = 0, e2.pv2 = 0);
      const r3 = l2[t], a2 = r3.volume ?? 0, i3 = bs(r3, s2);
      let c3 = NaN, u3 = NaN;
      if (Number.isFinite(i3) && Number.isFinite(a2) && (e2.pv += i3 * a2, e2.pv2 += i3 * i3 * a2, e2.vol += a2, e2.vol > 0)) {
        c3 = e2.pv / e2.vol;
        const t2 = Math.max(0, e2.pv2 / e2.vol - c3 * c3);
        u3 = p2 ? 0.01 * c3 : Math.sqrt(t2);
      }
      o3[0] = He2(c3);
      const h2 = Number.isFinite(c3) && Number.isFinite(u3);
      for (let e3 = 0; e3 < 3; e3++) o3[1 + 2 * e3] = y2[e3] && h2 ? He2(c3 + u3 * f2[e3]) : null, o3[2 + 2 * e3] = y2[e3] && h2 ? He2(c3 - u3 * f2[e3]) : null;
    } }, l2, n2, r2, a);
  };
});
var hl = Ht2(Ze({ id: "supertrend", name: "Supertrend", category: "Trend", placement: "onchart", inputs: [{ key: "period", type: "number", label: "ATR Period", default: 10, min: 1, max: 200, step: 1 }, { key: "multiplier", type: "number", label: "Multiplier", default: 3, min: 0.1, max: 20, step: 0.1 }, { key: "upColor", type: "color", label: "Uptrend", default: "#26a69a" }, { key: "downColor", type: "color", label: "Downtrend", default: "#ef5350" }], plots: [{ key: "up", type: "line", title: "Supertrend Up", colorKey: "upColor", style: { lineWidth: 2 } }, { key: "down", type: "line", title: "Supertrend Down", colorKey: "downColor", style: { lineWidth: 2 } }], fills: [{ between: ["bodyMid", "up"], colorUpKey: "upColor", colorDownKey: "upColor", opacity: 0.1 }, { between: ["bodyMid", "down"], colorUpKey: "downColor", colorDownKey: "downColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = yh(e, jt2(t, "period", 10), zt2(t, "multiplier", 3)), o2 = [], n2 = [], r2 = [];
  for (let t2 = 0; t2 < l2.length; t2++) {
    const a = l2[t2], i2 = Number.isFinite(a.value);
    o2.push(i2 && -1 === a.direction ? a.value : null), n2.push(i2 && 1 === a.direction ? a.value : null);
    const s2 = e[t2];
    r2.push(i2 && void 0 !== s2 ? (s2.open + s2.close) / 2 : null);
  }
  return { up: o2, down: n2, bodyMid: r2 };
} }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "period", 10), i2 = zt2(l2, "multiplier", 3);
  if (!ze(a)) return null;
  const s2 = { direction: 1 };
  return et2(e, `${a}|${i2}`, { keys: ["up", "down", "bodyMid"], start: ct2, step: (e2, l3, o3) => {
    const n3 = function(e3, t2, l4, o4, n4, r4) {
      const a2 = it2(e3.atr, rt(t2, l4), o4), i3 = t2[l4], s3 = i3.close;
      if (!Number.isFinite(a2) || !Number.isFinite(s3)) return NaN;
      const c3 = (i3.high + i3.low) / 2, u2 = c3 + n4 * a2, p2 = c3 - n4 * a2, y2 = e3.started ? u2 < e3.upper || e3.close > e3.upper ? u2 : e3.upper : u2, f2 = e3.started ? p2 > e3.lower || e3.close < e3.lower ? p2 : e3.lower : p2;
      let d2;
      return e3.started && e3.st !== e3.upper ? s3 >= f2 ? (d2 = f2, r4.direction = -1) : (d2 = y2, r4.direction = 1) : s3 <= y2 ? (d2 = y2, r4.direction = 1) : (d2 = f2, r4.direction = -1), e3.upper = y2, e3.lower = f2, e3.st = d2, e3.close = s3, e3.started = true, d2;
    }(e2, t, l3, a, i2, s2), r3 = Number.isFinite(n3), c2 = t[l3];
    o3[0] = r3 && -1 === s2.direction ? n3 : null, o3[1] = r3 && 1 === s2.direction ? n3 : null, o3[2] = r3 && void 0 !== c2 ? (c2.open + c2.close) / 2 : null;
  } }, t, o2, n2, r2);
}));
var bl = Ht2(Ze({ id: "parabolic-sar", name: "Parabolic SAR", category: "Trend", placement: "onchart", inputs: [{ key: "start", type: "number", label: "Start", default: 0.02, min: 1e-3, max: 1, step: 1e-3 }, { key: "increment", type: "number", label: "Increment", default: 0.02, min: 1e-3, max: 1, step: 1e-3 }, { key: "maximum", type: "number", label: "Maximum", default: 0.2, min: 0.01, max: 1, step: 0.01 }, { key: "color", type: "color", label: "Color", default: "#e0b020" }], plots: [{ key: "sar", type: "line", title: "SAR", colorKey: "color", style: { markersOnly: true, markerRadius: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = new Array(l2).fill(NaN), n2 = zt2(t, "start", 0.02), r2 = zt2(t, "increment", 0.02), a = zt2(t, "maximum", 0.2);
  let i2, s2, c2 = false, u2 = NaN, p2 = NaN, y2 = n2;
  for (let t2 = 0; t2 < l2; t2++) {
    const l3 = e[t2];
    Number.isFinite(l3.high) && Number.isFinite(l3.low) && Number.isFinite(l3.close) && (void 0 !== i2 ? void 0 !== s2 ? (u2 += y2 * (p2 - u2), c2 && l3.low < u2 ? (c2 = false, u2 = Math.max(p2, l3.high), p2 = l3.low, y2 = n2) : !c2 && l3.high > u2 ? (c2 = true, u2 = Math.min(p2, l3.low), p2 = l3.high, y2 = n2) : c2 && l3.high > p2 ? (p2 = l3.high, y2 = Math.min(a, y2 + r2)) : !c2 && l3.low < p2 && (p2 = l3.low, y2 = Math.min(a, y2 + r2)), u2 = c2 ? Math.min(u2, i2.low, s2.low) : Math.max(u2, i2.high, s2.high), o2[t2] = u2, s2 = i2, i2 = l3) : (c2 = l3.close >= i2.close, u2 = c2 ? i2.low : i2.high, p2 = c2 ? l3.high : l3.low, o2[t2] = u2, s2 = i2, i2 = l3) : i2 = l3);
  }
  return { sar: he(o2) };
} }, (e) => (t, l2, o2, n2, r2) => {
  const a = zt2(l2, "start", 0.02), i2 = zt2(l2, "increment", 0.02), s2 = zt2(l2, "maximum", 0.2);
  return et2(e, `${a}|${i2}|${s2}`, { keys: ["sar"], start: () => /* @__PURE__ */ ((e2) => ({ prev: null, prev2: null, rising: false, sar: NaN, ep: NaN, af: e2 }))(a), step: (e2, l3, o3) => {
    o3[0] = He2(function(e3, t2, l4, o4, n3) {
      if (!Number.isFinite(t2.high) || !Number.isFinite(t2.low) || !Number.isFinite(t2.close)) return NaN;
      const r3 = e3.prev;
      if (null === r3) return e3.prev = t2, NaN;
      if (null === e3.prev2) return e3.rising = t2.close >= r3.close, e3.sar = e3.rising ? r3.low : r3.high, e3.ep = e3.rising ? t2.high : t2.low, e3.prev2 = r3, e3.prev = t2, e3.sar;
      const a2 = e3.prev2;
      let i3 = e3.sar + e3.af * (e3.ep - e3.sar);
      return e3.rising && t2.low < i3 ? (e3.rising = false, i3 = Math.max(e3.ep, t2.high), e3.ep = t2.low, e3.af = l4) : !e3.rising && t2.high > i3 ? (e3.rising = true, i3 = Math.min(e3.ep, t2.low), e3.ep = t2.high, e3.af = l4) : e3.rising && t2.high > e3.ep ? (e3.ep = t2.high, e3.af = Math.min(n3, e3.af + o4)) : !e3.rising && t2.low < e3.ep && (e3.ep = t2.low, e3.af = Math.min(n3, e3.af + o4)), i3 = e3.rising ? Math.min(i3, r3.low, a2.low) : Math.max(i3, r3.high, a2.high), e3.sar = i3, e3.prev2 = r3, e3.prev = t2, i3;
    }(e2, t[l3], a, i2, s2));
  } }, t, o2, n2, r2);
}));
var gl = { id: "ichimoku", name: "Ichimoku Cloud", category: "Trend", placement: "onchart", inputs: [{ key: "conversionPeriod", type: "number", label: "Conversion", default: 9, min: 1, max: 200, step: 1 }, { key: "basePeriod", type: "number", label: "Base", default: 26, min: 1, max: 200, step: 1 }, { key: "laggingSpanPeriod", type: "number", label: "Lagging Span", default: 52, min: 1, max: 400, step: 1 }, { key: "displacement", type: "number", label: "Displacement", default: 26, min: 0, max: 200, step: 1 }, { key: "conversionColor", type: "color", label: "Conversion", default: "#4f8cff" }, { key: "baseColor", type: "color", label: "Base", default: "#ef5350" }, { key: "spanAColor", type: "color", label: "Span A", default: "#26a69a" }, { key: "spanBColor", type: "color", label: "Span B", default: "#ab47bc" }, { key: "laggingColor", type: "color", label: "Lagging", default: "#8892a6" }, { key: "cloudUpColor", type: "color", label: "Cloud up", default: "#26a69a" }, { key: "cloudDownColor", type: "color", label: "Cloud down", default: "#ef5350" }], plots: [{ key: "conversion", type: "line", title: "Tenkan-sen", colorKey: "conversionColor", style: { lineWidth: 1 } }, { key: "base", type: "line", title: "Kijun-sen", colorKey: "baseColor", style: { lineWidth: 1 } }, { key: "spanA", type: "line", title: "Senkou Span A", colorKey: "spanAColor", style: { lineWidth: 1 } }, { key: "spanB", type: "line", title: "Senkou Span B", colorKey: "spanBColor", style: { lineWidth: 1 } }, { key: "lagging", type: "line", title: "Chikou Span", colorKey: "laggingColor", style: { lineWidth: 1 } }], fills: [{ between: ["spanA", "spanB"], colorUpKey: "cloudUpColor", colorDownKey: "cloudDownColor", opacity: 0.14 }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "conversionPeriod", 9), n2 = jt2(t, "basePeriod", 26), r2 = jt2(t, "laggingSpanPeriod", 52), a = Zt2(t, "displacement", 26), i2 = (t2) => {
    const o3 = new Array(l2).fill(NaN);
    for (let n3 = t2 - 1; n3 < l2; n3++) {
      let l3 = -1 / 0, r3 = 1 / 0;
      for (let o4 = 0; o4 < t2; o4++) {
        const t3 = e[n3 - o4];
        t3.high > l3 && (l3 = t3.high), t3.low < r3 && (r3 = t3.low);
      }
      o3[n3] = (l3 + r3) / 2;
    }
    return o3;
  }, s2 = i2(o2), c2 = i2(n2), u2 = ll2(s2, c2, (e2, t2) => (e2 + t2) / 2), p2 = i2(r2), y2 = e.map((e2) => e2.close);
  return { conversion: he(s2), base: he(c2), spanA: he(_t2(u2, a)), spanB: he(_t2(p2, a)), lagging: he(_t2(y2, -a)) };
} };
var wl = { id: "halftrend", name: "HalfTrend", category: "Trend", placement: "onchart", inputs: [{ key: "amplitude", type: "number", label: "Amplitude", default: 2, min: 1, max: 100, step: 1 }, { key: "channelDeviation", type: "number", label: "Channel Deviation", default: 2, min: 0, max: 20, step: 0.1 }, { key: "atrPeriod", type: "number", label: "ATR Period", default: 100, min: 1, max: 500, step: 1 }, { key: "showChannels", type: "boolean", label: "Show Channels", default: true }, { key: "showSignals", type: "boolean", label: "Show Signals", default: true }, { key: "showLabels", type: "boolean", label: "Show Buy/Sell Labels", default: true }, { key: "upColor", type: "color", label: "Uptrend", default: "#2962ff" }, { key: "downColor", type: "color", label: "Downtrend", default: "#ef5350" }], plots: [{ key: "up", type: "line", title: "HalfTrend Up", colorKey: "upColor", style: { lineWidth: 2 } }, { key: "down", type: "line", title: "HalfTrend Down", colorKey: "downColor", style: { lineWidth: 2 } }, { key: "atrHigh", type: "line", title: "Channel High", colorKey: "downColor", style: { markersOnly: true, markerRadius: 1 } }, { key: "atrLow", type: "line", title: "Channel Low", colorKey: "upColor", style: { markersOnly: true, markerRadius: 1 } }, { key: "buySignal", type: "line", title: "Buy", colorKey: "upColor", style: { markersOnly: true, markerRadius: 3.5 } }, { key: "sellSignal", type: "line", title: "Sell", colorKey: "downColor", style: { markersOnly: true, markerRadius: 3.5 } }], fills: [{ between: ["up", "atrLow"], colorUpKey: "upColor", colorDownKey: "upColor", opacity: 0.15 }, { between: ["down", "atrHigh"], colorUpKey: "downColor", colorDownKey: "downColor", opacity: 0.15 }], markers: ({ bars: e, values: t, settings: l2 }) => {
  if (false === l2.showLabels) return [];
  const o2 = t.buySignal ?? [], n2 = t.sellSignal ?? [], r2 = [];
  for (let t2 = 0; t2 < e.length; t2++) {
    const a = o2[t2];
    if (null != a) {
      r2.push({ time: e[t2].time, position: "atPrice", price: a, shape: "labelUp", size: "small", color: Yt2(l2, "upColor", "#2962ff"), text: "Buy" });
      continue;
    }
    const i2 = n2[t2];
    null != i2 && r2.push({ time: e[t2].time, position: "atPrice", price: i2, shape: "labelDown", size: "small", color: Yt2(l2, "downColor", "#ef5350"), text: "Sell" });
  }
  return r2;
}, calc: (e, t) => {
  const l2 = e.length, o2 = new Array(l2).fill(null), n2 = new Array(l2).fill(null), r2 = new Array(l2).fill(null), a = new Array(l2).fill(null), i2 = new Array(l2).fill(null), s2 = new Array(l2).fill(null), c2 = { up: o2, down: n2, atrHigh: r2, atrLow: a, buySignal: i2, sellSignal: s2 };
  if (0 === l2) return c2;
  const u2 = jt2(t, "amplitude", 2), p2 = zt2(t, "channelDeviation", 2), y2 = false !== t.showChannels, f2 = false !== t.showSignals, d2 = e.map((e2) => e2.high), m2 = e.map((e2) => e2.low), h2 = vh(d2, m2, e.map((e2) => e2.close), jt2(t, "atrPeriod", 100)), b2 = ce2(d2, u2), g2 = ce2(m2, u2), k2 = de2(d2, u2), v2 = me2(m2, u2);
  let N2 = 0, C2 = 0, M2 = m2[0], x2 = d2[0], A2 = 0, S2 = 0, L2 = false;
  for (let t2 = 0; t2 < l2; t2++) {
    const l3 = h2[t2] / 2, c3 = p2 * l3, u3 = k2[t2], w2 = v2[t2], B2 = t2 > 0 ? d2[t2 - 1] : d2[0], F2 = t2 > 0 ? m2[t2 - 1] : m2[0], K3 = L2 ? N2 : -1;
    let W;
    1 === C2 ? (Number.isFinite(w2) && (M2 = Math.max(w2, M2)), Number.isFinite(b2[t2]) && b2[t2] < M2 && e[t2].close < F2 && (N2 = 1, C2 = 0, x2 = u3)) : (Number.isFinite(u3) && (x2 = Math.min(u3, x2)), Number.isFinite(g2[t2]) && g2[t2] > x2 && e[t2].close > B2 && (N2 = 0, C2 = 1, M2 = w2)), 0 === N2 ? (1 === K3 ? (A2 = S2, f2 && Number.isFinite(l3) && (i2[t2] = A2 - l3)) : A2 = -1 === K3 ? M2 : Math.max(M2, A2), W = A2) : (0 === K3 ? (S2 = A2, f2 && Number.isFinite(l3) && (s2[t2] = S2 + l3)) : S2 = -1 === K3 ? x2 : Math.min(x2, S2), W = S2), L2 = true, Number.isFinite(W) && (0 === N2 ? o2[t2] = W : n2[t2] = W, y2 && Number.isFinite(c3) && (r2[t2] = W + c3, a[t2] = W - c3));
  }
  return c2;
} };
var kl = [{ label: "None", value: "None" }, { label: "SMA", value: "SMA" }, { label: "SMA + Bollinger Bands", value: "SMA + Bollinger Bands" }, { label: "EMA", value: "EMA" }, { label: "SMMA (RMA)", value: "SMMA (RMA)" }, { label: "WMA", value: "WMA" }, { label: "VWMA", value: "VWMA" }];
function vl(e, t) {
  const l2 = e.length, o2 = new Array(l2).fill(NaN);
  let n2 = 0;
  for (; n2 < l2 && !Number.isFinite(e[n2]); ) n2 += 1;
  if (n2 >= l2) return o2;
  const r2 = t(e.slice(n2), n2);
  for (let e2 = 0; e2 < r2.length && n2 + e2 < l2; e2++) o2[n2 + e2] = r2[e2];
  return o2;
}
function Nl(e, t) {
  return vl(e, (e2) => be2(e2, t));
}
function Cl(e, t, l2, o2) {
  switch (e) {
    case "EMA":
      return Nl(t, o2);
    case "SMMA (RMA)":
      return vl(t, (e2) => ye2(e2, o2));
    case "WMA":
      return vl(t, (e2) => ue2(e2, o2));
    case "VWMA":
      return vl(t, (e2, t2) => Ce2(e2, l2.slice(t2), o2));
    default:
      return vl(t, (e2) => ce2(e2, o2));
  }
}
function Ml(e, t, l2) {
  return [{ key: "maType", type: "select", label: "Type", default: t, options: kl, group: "Smoothing" }, { key: "maLength", type: "number", label: "Length", default: l2, min: 1, max: 500, step: 1, group: "Smoothing" }, { key: "bbMult", type: "number", label: "BB StdDev", default: 2, min: 1e-3, max: 50, step: 0.5, group: "Smoothing" }, { key: "maColor", type: "color", label: `${e}-based MA`, default: "#ffeb3b", group: "Smoothing" }, { key: "bbUpperColor", type: "color", label: "Upper Bollinger Band", default: "#4caf50", group: "Smoothing" }, { key: "bbLowerColor", type: "color", label: "Lower Bollinger Band", default: "#4caf50", group: "Smoothing" }];
}
function xl(e) {
  return [{ key: "ma", type: "line", title: `${e}-based MA`, colorKey: "maColor", style: { lineWidth: 1.5 } }, { key: "bbUpper", type: "line", title: "Upper Bollinger Band", colorKey: "bbUpperColor", style: { lineWidth: 1 } }, { key: "bbLower", type: "line", title: "Lower Bollinger Band", colorKey: "bbLowerColor", style: { lineWidth: 1 } }];
}
function Al(e, t, l2, o2, n2) {
  const r2 = e.length, a = Yt2(l2, "maType", o2), i2 = jt2(l2, "maLength", n2), s2 = zt2(l2, "bbMult", 2), c2 = "None" === a ? new Array(r2).fill(NaN) : Cl(a, e, t, i2), u2 = "SMA + Bollinger Bands" === a ? vl(e, (e2) => fe2(e2, i2)).map((e2) => e2 * s2) : new Array(r2).fill(NaN);
  return { ma: he(c2), bbUpper: he(ll2(c2, u2, (e2, t2) => e2 + t2)), bbLower: he(ll2(c2, u2, (e2, t2) => e2 - t2)) };
}
var Sl = Ht2(Ze({ id: "rsi", name: "RSI", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "Color", default: "#e0b020" }, { key: "overbought", type: "number", label: "Overbought", default: 70, min: 50, max: 100, step: 1 }, { key: "oversold", type: "number", label: "Oversold", default: 30, min: 0, max: 50, step: 1 }, { key: "bandColor", type: "color", label: "Background", default: "#7e57c2" }], plots: [{ key: "rsi", type: "line", title: "RSI", colorKey: "color", style: { lineWidth: 1.5 } }], fills: [{ between: ["upperLevel", "lowerLevel"], colorUpKey: "bandColor", colorDownKey: "bandColor", opacity: 0.1 }], calc: (e, t) => ({ rsi: he(mh(gs(e, Gt2(t)), jt2(t, "length", 14))), upperLevel: el(e.length, zt2(t, "overbought", 70)), lowerLevel: el(e.length, zt2(t, "oversold", 30)) }), levels: (e) => [{ price: zt2(e, "overbought", 70), color: "#ef5350", title: "OB", dashed: true }, { price: 50, color: "#5a6b8c", title: "", dashed: true }, { price: zt2(e, "oversold", 30), color: "#26a69a", title: "OS", dashed: true }], range: () => ({ min: 0, max: 100 }) }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "length", 14);
  if (!ze(a)) return null;
  const i2 = Gt2(l2), s2 = zt2(l2, "overbought", 70), c2 = zt2(l2, "oversold", 30);
  return et2(e, `${a}|${i2}|${s2}|${c2}`, { keys: ["rsi", "upperLevel", "lowerLevel"], start: st2, step: (e2, l3, o3) => {
    o3[0] = He2(function(e3, t2, l4) {
      const o4 = t2 - e3.last;
      if (e3.last = t2, !e3.primed) return e3.primed = true, NaN;
      if (!Number.isFinite(o4)) return e3.run = 0, e3.recent.length = 0, NaN;
      e3.run++;
      const n3 = o4 > 0 ? o4 : 0, r3 = o4 < 0 ? -o4 : 0;
      if (e3.gainSeeded && (e3.gain = (e3.gain * (l4 - 1) + n3) / l4), e3.lossSeeded && (e3.loss = (e3.loss * (l4 - 1) + r3) / l4), !e3.gainSeeded || !e3.lossSeeded) {
        const t3 = e3.recent;
        if (t3.push(o4), t3.length > l4 && t3.shift(), e3.run >= l4) {
          let o5 = 0, n4 = 0;
          for (let e4 = 0; e4 < t3.length; e4++) {
            const l5 = t3[e4];
            l5 >= 0 ? o5 += l5 : n4 -= l5;
          }
          !e3.gainSeeded && Number.isFinite(o5 / l4) && (e3.gain = o5 / l4, e3.gainSeeded = true), !e3.lossSeeded && Number.isFinite(n4 / l4) && (e3.loss = n4 / l4, e3.lossSeeded = true);
        }
      }
      if (Number.isFinite(e3.gain) && Number.isFinite(e3.loss)) {
        const t3 = 0 === e3.loss ? 100 : 100 - 100 / (1 + e3.gain / e3.loss);
        if (Number.isFinite(t3)) return t3;
      }
      return NaN;
    }(e2, bs(t[l3], i2), a)), o3[1] = s2, o3[2] = c2;
  } }, t, o2, n2, r2);
}));
var Ll = Ht2(Ze({ id: "macd", name: "MACD", category: "Momentum", placement: "pane", inputs: [{ key: "fastPeriod", type: "number", label: "Fast", default: 12, min: 1, max: 500, step: 1 }, { key: "slowPeriod", type: "number", label: "Slow", default: 26, min: 1, max: 500, step: 1 }, { key: "signalPeriod", type: "number", label: "Signal", default: 9, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "macdColor", type: "color", label: "MACD", default: "#2962ff" }, { key: "histUpColor", type: "color", label: "Histogram up", default: "#26a69a" }, { key: "histUpFadeColor", type: "color", label: "Histogram up (weakening)", default: "#a7d8d2" }, { key: "histDownColor", type: "color", label: "Histogram down", default: "#ef5350" }, { key: "histDownFadeColor", type: "color", label: "Histogram down (weakening)", default: "#f5b0ae" }, { key: "signalColor", type: "color", label: "Signal", default: "#ff6d00" }], plots: [{ key: "histogram", type: "histogram", title: "Histogram", style: { color: "#3a4666", base: 0 }, colorBy: ({ value: e, index: t, values: l2, settings: o2 }) => {
  const n2 = l2.histogram?.[t - 1], r2 = null == n2 || !Number.isFinite(n2) || e >= n2;
  return e >= 0 ? r2 ? Yt2(o2, "histUpColor", "#26a69a") : Yt2(o2, "histUpFadeColor", "#a7d8d2") : r2 ? Yt2(o2, "histDownFadeColor", "#f5b0ae") : Yt2(o2, "histDownColor", "#ef5350");
} }, { key: "macd", type: "line", title: "MACD", colorKey: "macdColor", style: { lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal", colorKey: "signalColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), o2 = ll2(be2(l2, jt2(t, "fastPeriod", 12)), be2(l2, jt2(t, "slowPeriod", 26)), (e2, t2) => e2 - t2), n2 = vl(o2, (e2) => be2(e2, jt2(t, "signalPeriod", 9))), r2 = ll2(o2, n2, (e2, t2) => e2 - t2);
  return { macd: he(o2), signal: he(n2), histogram: he(r2) };
}, levels: () => [{ price: 0, color: "#5a6b8c", dashed: true }] }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "fastPeriod", 12), i2 = jt2(l2, "slowPeriod", 26), s2 = jt2(l2, "signalPeriod", 9);
  if (!ze(a) || !ze(i2) || !ze(s2)) return null;
  const c2 = Gt2(l2);
  return et2(e, `${a}|${i2}|${s2}|${c2}`, { keys: ["macd", "signal", "histogram"], start: () => ({ fast: { run: 0, value: NaN, seeded: false, recent: [] }, slow: { run: 0, value: NaN, seeded: false, recent: [] }, signal: { run: 0, value: NaN, seeded: false, recent: [] } }), step: (e2, l3, o3) => {
    const n3 = bs(t[l3], c2), r3 = ot2(e2.fast, n3, a, true) - ot2(e2.slow, n3, i2, true), u2 = ot2(e2.signal, r3, s2, true);
    o3[0] = He2(r3), o3[1] = He2(u2), o3[2] = He2(r3 - u2);
  } }, t, o2, n2, r2);
}));
var Bl = Ht2(Ze({ id: "stochastic", name: "Stochastic", category: "Momentum", placement: "pane", inputs: [{ key: "kPeriod", type: "number", label: "%K Length", default: 14, min: 1, max: 500, step: 1 }, { key: "kSmoothing", type: "number", label: "%K Smoothing", default: 1, min: 1, max: 100, step: 1 }, { key: "dPeriod", type: "number", label: "%D Smoothing", default: 3, min: 1, max: 100, step: 1 }, { key: "kColor", type: "color", label: "%K", default: "#4f8cff" }, { key: "dColor", type: "color", label: "%D", default: "#f5a623" }, { key: "bandColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "k", type: "line", title: "%K", colorKey: "kColor", style: { lineWidth: 1.5 } }, { key: "d", type: "line", title: "%D", colorKey: "dColor", style: { lineWidth: 1.5 } }], fills: [{ between: ["upperLevel", "lowerLevel"], colorUpKey: "bandColor", colorDownKey: "bandColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = de2(e.map((e2) => e2.high), jt2(t, "kPeriod", 14)), o2 = me2(e.map((e2) => e2.low), jt2(t, "kPeriod", 14)), n2 = e.map((e2, t2) => {
    const n3 = l2[t2] - o2[t2];
    return n3 > 0 && n3 < 1 / 0 ? 100 * (e2.close - o2[t2]) / n3 : NaN;
  }), r2 = ce2(n2, jt2(t, "kSmoothing", 1)), a = ce2(r2, jt2(t, "dPeriod", 3));
  return { k: he(r2), d: he(a), upperLevel: el(e.length, 80), lowerLevel: el(e.length, 20) };
}, levels: () => [{ price: 80, color: "#ef5350", title: "OB", dashed: true }, { price: 20, color: "#26a69a", title: "OS", dashed: true }], range: () => ({ min: 0, max: 100 }) }, (e) => Qe(e, (e2) => {
  const t = jt2(e2, "kPeriod", 14), l2 = jt2(e2, "kSmoothing", 1), o2 = jt2(e2, "dPeriod", 3);
  return ze(t) && ze(l2) && ze(o2) ? t + l2 + o2 - 3 : null;
})));
var Fl = Ht2(Ze({ id: "adx", name: "ADX / DMI", category: "Trend", placement: "pane", inputs: [{ key: "period", type: "number", label: "DI Length", default: 14, min: 1, max: 500, step: 1 }, { key: "adxPeriod", type: "number", label: "ADX Smoothing", default: 14, min: 1, max: 500, step: 1 }, { key: "adxColor", type: "color", label: "ADX", default: "#e0e3ea" }, { key: "plusColor", type: "color", label: "+DI", default: "#26a69a" }, { key: "minusColor", type: "color", label: "-DI", default: "#ef5350" }], plots: [{ key: "plusDi", type: "line", title: "+DI", colorKey: "plusColor", style: { lineWidth: 1 } }, { key: "minusDi", type: "line", title: "-DI", colorKey: "minusColor", style: { lineWidth: 1 } }, { key: "adx", type: "line", title: "ADX", colorKey: "adxColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "period", 14), n2 = e.map((e2) => e2.high), r2 = e.map((e2) => e2.low), a = e.map((e2) => e2.close), i2 = gh(n2, r2, a);
  l2 > 0 && (i2[0] = NaN);
  const s2 = new Array(l2).fill(NaN), c2 = new Array(l2).fill(NaN);
  for (let e2 = 1; e2 < l2; e2++) {
    if (!(Number.isFinite(n2[e2]) && Number.isFinite(r2[e2]) && Number.isFinite(n2[e2 - 1]) && Number.isFinite(r2[e2 - 1]))) continue;
    const t2 = n2[e2] - n2[e2 - 1], l3 = r2[e2 - 1] - r2[e2];
    s2[e2] = t2 > l3 && t2 > 0 ? t2 : 0, c2[e2] = l3 > t2 && l3 > 0 ? l3 : 0;
  }
  const u2 = ye2(i2, o2), p2 = ye2(s2, o2), y2 = ye2(c2, o2), f2 = new Array(l2).fill(NaN), d2 = new Array(l2).fill(NaN), m2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = u2[e2];
    if (!Number.isFinite(t2) || 0 === t2) continue;
    const l3 = p2[e2] / t2 * 100, o3 = y2[e2] / t2 * 100;
    if (Number.isFinite(l3) && (f2[e2] = l3), Number.isFinite(o3) && (d2[e2] = o3), !Number.isFinite(f2[e2]) || !Number.isFinite(d2[e2])) continue;
    const n3 = f2[e2] + d2[e2];
    m2[e2] = n3 > 0 ? Math.abs(f2[e2] - d2[e2]) / n3 * 100 : 0;
  }
  const h2 = vl(m2, (e2) => ye2(e2, jt2(t, "adxPeriod", 14)));
  return { plusDi: he(f2), minusDi: he(d2), adx: he(h2) };
}, levels: () => [{ price: 25, color: "#5a6b8c", title: "25", dashed: true }] }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "period", 14), i2 = jt2(l2, "adxPeriod", 14);
  return ze(a) && ze(i2) ? et2(e, `${a}|${i2}`, { keys: ["plusDi", "minusDi", "adx"], start: () => ({ tr: { run: 0, value: NaN, seeded: false, recent: [] }, plus: { run: 0, value: NaN, seeded: false, recent: [] }, minus: { run: 0, value: NaN, seeded: false, recent: [] }, adx: { run: 0, value: NaN, seeded: false, recent: [] } }), step: (e2, l3, o3) => {
    const [n3, r3, s2] = function(e3, t2) {
      if (0 === t2) return [NaN, NaN, NaN];
      const l4 = e3[t2], o4 = e3[t2 - 1], n4 = rt(e3, t2);
      if (!(Number.isFinite(l4.high) && Number.isFinite(l4.low) && Number.isFinite(o4.high) && Number.isFinite(o4.low))) return [n4, NaN, NaN];
      const r4 = l4.high - o4.high, a2 = o4.low - l4.low;
      return [n4, r4 > a2 && r4 > 0 ? r4 : 0, a2 > r4 && a2 > 0 ? a2 : 0];
    }(t, l3), c2 = ot2(e2.tr, n3, a, false), u2 = ot2(e2.plus, r3, a, false), p2 = ot2(e2.minus, s2, a, false);
    let y2 = NaN, f2 = NaN, d2 = NaN;
    if (Number.isFinite(c2) && 0 !== c2) {
      const e3 = u2 / c2 * 100, t2 = p2 / c2 * 100;
      if (Number.isFinite(e3) && (y2 = e3), Number.isFinite(t2) && (f2 = t2), Number.isFinite(y2) && Number.isFinite(f2)) {
        const e4 = y2 + f2;
        d2 = e4 > 0 ? Math.abs(y2 - f2) / e4 * 100 : 0;
      }
    }
    o3[0] = He2(y2), o3[1] = He2(f2), o3[2] = He2(ot2(e2.adx, d2, i2, false));
  } }, t, o2, n2, r2) : null;
}));
var Kl = Ht2(Ze({ id: "cci", name: "CCI", category: "Momentum", placement: "pane", inputs: [{ key: "period", type: "number", label: "Length", default: 20, min: 1, max: 500, step: 1 }, { key: "constant", type: "number", label: "Constant", default: 0.015, min: 1e-3, max: 1, step: 1e-3 }, { key: "color", type: "color", label: "Color", default: "#26c6da" }, { key: "bandColor", type: "color", label: "Background", default: "#2196f3" }, ...Ml("CCI", "SMA", 20)], plots: [{ key: "cci", type: "line", title: "CCI", colorKey: "color", style: { lineWidth: 1.5 } }, ...xl("CCI")], fills: [{ between: ["upperLevel", "lowerLevel"], colorUpKey: "bandColor", colorDownKey: "bandColor", opacity: 0.1 }, { between: ["bbUpper", "bbLower"], colorUpKey: "bbUpperColor", colorDownKey: "bbUpperColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "period", 20), n2 = zt2(t, "constant", 0.015), r2 = e.map((e2) => (e2.high + e2.low + e2.close) / 3), a = ce2(r2, o2), i2 = new Array(l2).fill(NaN);
  for (let e2 = o2 - 1; e2 < l2; e2++) {
    let t2 = 0;
    for (let l4 = 0; l4 < o2; l4++) t2 += Math.abs(r2[e2 - l4] - a[e2]);
    const l3 = t2 / o2;
    i2[e2] = Number.isFinite(l3) ? l3 > 0 ? (r2[e2] - a[e2]) / (n2 * l3) : 0 : NaN;
  }
  return { cci: he(i2), ...Al(i2, e.map((e2) => e2.volume ?? 0), t, "SMA", 20), upperLevel: el(l2, 100), lowerLevel: el(l2, -100) };
}, levels: () => [{ price: 100, color: "#ef5350", dashed: true }, { price: 0, color: "#5a6b8c", dashed: true }, { price: -100, color: "#26a69a", dashed: true }] }, function(e) {
  const t = Qe(e, (e2) => {
    const t2 = jt2(e2, "period", 20), l2 = jt2(e2, "maLength", 20);
    return ze(t2) && ze(l2) ? t2 - 1 + ("None" === Yt2(e2, "maType", "SMA") ? 0 : l2 - 1) : null;
  });
  return (l2, o2, n2, r2, a, i2) => {
    const s2 = Yt2(o2, "maType", "SMA");
    if ("EMA" !== s2 && "SMMA (RMA)" !== s2) return t(l2, o2, n2, r2, a, i2);
    const c2 = jt2(o2, "period", 20), u2 = zt2(o2, "constant", 0.015), p2 = jt2(o2, "maLength", 20);
    if (!ze(c2) || !ze(p2)) return null;
    const y2 = (e2) => (l2[e2].high + l2[e2].low + l2[e2].close) / 3;
    return et2(e, `${c2}|${u2}|${s2}|${p2}`, { keys: ["cci", "ma", "bbUpper", "bbLower", "upperLevel", "lowerLevel"], start: lt, step: (e2, t2, l3) => {
      let o3 = NaN;
      if (t2 >= c2 - 1) {
        const e3 = ut2(y2, t2, c2), l4 = y2(t2);
        let n3 = 0;
        for (let l5 = 0; l5 < c2; l5++) n3 += Math.abs(y2(t2 - l5) - e3);
        const r3 = n3 / c2;
        o3 = Number.isFinite(r3) ? r3 > 0 ? (l4 - e3) / (u2 * r3) : 0 : NaN;
      }
      l3[0] = He2(o3), l3[1] = He2(ot2(e2, o3, p2, "EMA" === s2)), l3[2] = null, l3[3] = null, l3[4] = 100, l3[5] = -100;
    } }, l2, n2, r2, a);
  };
}));
var Wl = { id: "mfi", name: "Money Flow Index", category: "Momentum", placement: "pane", inputs: [{ key: "period", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Color", default: "#ab47bc" }, { key: "bandColor", type: "color", label: "Background", default: "#7e57c2" }], plots: [{ key: "mfi", type: "line", title: "MFI", colorKey: "color", style: { lineWidth: 1.5 } }], fills: [{ between: ["upperLevel", "lowerLevel"], colorUpKey: "bandColor", colorDownKey: "bandColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "period", 14), n2 = e.map((e2) => (e2.high + e2.low + e2.close) / 3), r2 = new Array(l2).fill(0), a = new Array(l2).fill(0);
  for (let t2 = 1; t2 < l2; t2++) {
    const l3 = e[t2].volume ?? 0;
    if (!Number.isFinite(n2[t2]) || !Number.isFinite(n2[t2 - 1]) || !Number.isFinite(l3)) {
      r2[t2] = NaN, a[t2] = NaN;
      continue;
    }
    const o3 = n2[t2] * l3, i2 = Number.isFinite(o3) ? o3 : NaN;
    n2[t2] > n2[t2 - 1] ? r2[t2] = i2 : n2[t2] < n2[t2 - 1] && (a[t2] = i2);
  }
  return { mfi: he(Te2(r2, a, o2)), upperLevel: el(l2, 80), lowerLevel: el(l2, 20) };
}, levels: () => [{ price: 80, color: "#ef5350", title: "OB", dashed: true }, { price: 20, color: "#26a69a", title: "OS", dashed: true }], range: () => ({ min: 0, max: 100 }) };
var Dl = Ht2(Ze({ id: "atr", name: "ATR", category: "Volatility", placement: "pane", inputs: [{ key: "period", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Color", default: "#f5a623" }], plots: [{ key: "atr", type: "line", title: "ATR", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => ({ atr: he(vh(e.map((e2) => e2.high), e.map((e2) => e2.low), e.map((e2) => e2.close), jt2(t, "period", 14))) }) }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "period", 14);
  return ze(a) ? et2(e, `${a}`, { keys: ["atr"], start: at2, step: (e2, l3, o3) => {
    o3[0] = He2(it2(e2, rt(t, l3), a));
  } }, t, o2, n2, r2) : null;
}));
var Ol2 = { id: "williams-vix-fix", name: "Williams VIX Fix", category: "Volatility", placement: "pane", inputs: [{ key: "pd", type: "number", label: "LookBack Period Standard Deviation High", default: 22, min: 1, max: 500, step: 1 }, { key: "bbl", type: "number", label: "Bollinger Band Length", default: 20, min: 1, max: 500, step: 1 }, { key: "mult", type: "number", label: "Bollinger Band Standard Deviation Up", default: 2, min: 1, max: 5, step: 0.1 }, { key: "lb", type: "number", label: "Look Back Period Percentile High", default: 50, min: 1, max: 500, step: 1 }, { key: "ph", type: "number", label: "Highest Percentile", default: 0.85, min: 0, max: 1, step: 0.01 }, { key: "pl", type: "number", label: "Lowest Percentile", default: 1.01, min: 1, max: 2, step: 0.01 }, { key: "hp", type: "boolean", label: "Show High Range", default: false }, { key: "sd", type: "boolean", label: "Show Standard Deviation Line", default: false }, { key: "highColor", type: "color", label: "Alert", default: "#00ff00" }, { key: "normalColor", type: "color", label: "Normal", default: "#808080" }, { key: "rangeColor", type: "color", label: "Range", default: "#ffa500" }, { key: "bandColor", type: "color", label: "Band", default: "#00ffff" }], plots: [{ key: "wvf", type: "histogram", title: "Williams Vix Fix", style: { lineWidth: 4, base: 0 }, colorBy: ({ index: e, values: t, settings: l2 }) => {
  const o2 = t.wvf?.[e], n2 = t.alertUpper?.[e], r2 = t.alertHigh?.[e];
  if (null == o2) return;
  return null != n2 && o2 >= n2 || null != r2 && o2 >= r2 ? Yt2(l2, "highColor", "#00ff00") : Yt2(l2, "normalColor", "#808080");
} }, { key: "rangeHigh", type: "line", title: "Range High Percentile", colorKey: "rangeColor", style: { lineWidth: 4 } }, { key: "rangeLow", type: "line", title: "Range Low Percentile", colorKey: "rangeColor", style: { lineWidth: 4 } }, { key: "upperBand", type: "line", title: "Upper Band", colorKey: "bandColor", style: { lineWidth: 3 } }], calc: (e, t) => {
  const l2 = e.length, o2 = e.map((e2) => e2.close), n2 = e.map((e2) => e2.low), r2 = jt2(t, "pd", 22), a = jt2(t, "bbl", 20), i2 = zt2(t, "mult", 2), s2 = jt2(t, "lb", 50), c2 = zt2(t, "ph", 0.85), u2 = zt2(t, "pl", 1.01), p2 = true === t.hp, y2 = true === t.sd, f2 = de2(o2, r2), d2 = new Array(l2);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = f2[e2];
    d2[e2] = Number.isFinite(t2) && 0 !== t2 ? (t2 - n2[e2]) / t2 * 100 : NaN;
  }
  const m2 = fe2(d2, a), h2 = ce2(d2, a), b2 = de2(d2, s2), g2 = me2(d2, s2), w2 = new Array(l2), k2 = new Array(l2), v2 = new Array(l2), N2 = new Array(l2), C2 = new Array(l2);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = h2[e2] + i2 * m2[e2], l3 = b2[e2] * c2, o3 = g2[e2] * u2;
    w2[e2] = Number.isFinite(t2) ? t2 : null, k2[e2] = Number.isFinite(l3) ? l3 : null, v2[e2] = y2 ? w2[e2] : null, N2[e2] = p2 ? k2[e2] : null, C2[e2] = p2 && Number.isFinite(o3) ? o3 : null;
  }
  return { wvf: he(d2), rangeHigh: N2, rangeLow: C2, upperBand: v2, alertUpper: w2, alertHigh: k2 };
} };
var Rl = { id: "volume", name: "Volume", category: "Volume", placement: "pane", inputs: [{ key: "color", type: "color", label: "Color", default: "#3a4666" }, { key: "colorByDirection", type: "boolean", label: "Match candle direction", default: false }, { key: "upColor", type: "color", label: "Up candle", default: "#26a69a" }, { key: "downColor", type: "color", label: "Down candle", default: "#ef5350" }, { key: "showMA", type: "boolean", label: "Show moving average", default: false, group: "Moving average" }, { key: "maPeriod", type: "number", label: "Period", default: 20, min: 1, max: 500, step: 1, group: "Moving average" }, { key: "maColor", type: "color", label: "Color", default: "#e6b53c", group: "Moving average" }], plots: [{ key: "volume", type: "histogram", title: "Volume", colorKey: "color", style: { base: 0 }, colorBy: ({ index: e, values: t, settings: l2 }) => true === l2.colorByDirection ? -1 === t.direction[e] ? Yt2(l2, "downColor", "#ef5350") : Yt2(l2, "upColor", "#26a69a") : void 0 }, { key: "ma", type: "line", title: "Volume average", colorKey: "maColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.map((e2) => e2.volume ?? 0);
  return { volume: he(l2), direction: e.map((e2) => e2.close >= e2.open ? 1 : -1), ma: true === t.showMA ? he(ce2(l2, jt2(t, "maPeriod", 20))) : l2.map(() => null) };
} };
var Tl = Ze({ id: "obv", name: "On-Balance Volume", category: "Volume", placement: "pane", inputs: [{ key: "color", type: "color", label: "Color", default: "#26c6da" }, ...Ml("OBV", "None", 9)], plots: [{ key: "obv", type: "line", title: "OBV", colorKey: "color", style: { lineWidth: 1.5 } }, ...xl("OBV")], fills: [{ between: ["bbUpper", "bbLower"], colorUpKey: "bbUpperColor", colorDownKey: "bbUpperColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = e.length, o2 = new Array(l2).fill(NaN);
  let n2 = 0;
  for (let t2 = 0; t2 < l2; t2++) {
    if (t2 > 0) {
      const l3 = e[t2], o3 = e[t2 - 1], r2 = tl(l3);
      l3.close > o3.close ? n2 += r2 : l3.close < o3.close && (n2 -= r2);
    }
    o2[t2] = n2;
  }
  return { obv: he(o2), ...Al(o2, e.map(tl), t, "None", 9) };
} }, (e) => (t, l2, o2, n2, r2) => {
  const a = Yt2(l2, "maType", "None"), i2 = jt2(l2, "maLength", 9);
  if (!ze(i2)) return null;
  const s2 = "EMA" === a || "SMMA (RMA)" === a, c2 = et2(e, `${a}|${i2}`, { keys: s2 ? ["obv", "ma", "bbUpper", "bbLower"] : ["obv"], start: () => ({ acc: 0, ma: { run: 0, value: NaN, seeded: false, recent: [] } }), step: (e2, l3, o3) => {
    if (l3 > 0) {
      const o4 = t[l3], n3 = t[l3 - 1], r3 = tl(o4);
      o4.close > n3.close ? e2.acc += r3 : o4.close < n3.close && (e2.acc -= r3);
    }
    o3[0] = He2(e2.acc), s2 && (o3[1] = He2(ot2(e2.ma, e2.acc, i2, "EMA" === a)), o3[2] = null, o3[3] = null);
  } }, t, o2, n2, r2);
  if (null === c2 || s2) return c2;
  const u2 = n2.obv, p2 = Ye2(r2, e, t, o2);
  if (void 0 === p2 || void 0 === u2 || u2.length < o2) return null;
  const y2 = Math.max(0, o2 - i2), f2 = [];
  for (let e2 = y2; e2 < t.length; e2++) f2.push((e2 < o2 ? u2[e2] : c2.obv[e2 - o2]) ?? NaN);
  const d2 = _e2(p2, Al(f2, t.slice(y2).map(tl), l2, "None", 9), o2 - y2, n2, o2);
  return null === d2 ? null : { obv: c2.obv, ...d2 };
});
var Pl = { id: "adl", name: "Accumulation/Distribution", category: "Volume", placement: "pane", inputs: [{ key: "color", type: "color", label: "Color", default: "#4f8cff" }], plots: [{ key: "adl", type: "line", title: "A/D Line", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e) => {
  const t = new Array(e.length).fill(NaN);
  let l2 = 0;
  for (let o2 = 0; o2 < e.length; o2++) {
    const n2 = e[o2];
    if (!Number.isFinite(n2.high) || !Number.isFinite(n2.low) || !Number.isFinite(n2.close)) continue;
    const r2 = n2.high - n2.low;
    if (Number.isFinite(r2)) {
      if (r2 > 0) {
        const e2 = (n2.close - n2.low - (n2.high - n2.close)) / r2 * tl(n2);
        if (!Number.isFinite(e2)) continue;
        l2 += e2;
      }
      t[o2] = l2;
    }
  }
  return { adl: he(t) };
} };
var Ul = (e) => void 0 !== e && Number.isFinite(e) ? e : null;
var $l = { id: "open-interest", name: "Open Interest", category: "Volume", placement: "pane", inputs: [{ key: "color", type: "color", label: "Open interest", default: "#26c6da" }], plots: [{ key: "oi", type: "line", title: "Open interest", colorKey: "color", priceFormat: { type: "volume" }, style: { lineWidth: 1.5 } }], calc: (e) => ({ oi: e.map((e2) => Ul(e2.oi)) }) };
var Il2 = { id: "open-interest-change", name: "Open Interest Change", category: "Volume", placement: "pane", inputs: [{ key: "upColor", type: "color", label: "Increase", default: "#26a69a" }, { key: "downColor", type: "color", label: "Decrease", default: "#ef5350" }], plots: [{ key: "change", type: "histogram", title: "OI change", colorKey: "upColor", style: { base: 0 }, priceFormat: { type: "volume" }, colorBy: ({ value: e, settings: t }) => e < 0 ? Yt2(t, "downColor", "#ef5350") : Yt2(t, "upColor", "#26a69a") }], calc: (e) => ({ change: e.map((t, l2) => {
  const o2 = Ul(t.oi), n2 = Ul(e[l2 - 1]?.oi);
  return null === o2 || null === n2 ? null : o2 - n2;
}) }) };
var El = [["longBuildupColor", "#26a69a"], ["shortBuildupColor", "#ef5350"], ["shortCoveringColor", "#42a5f5"], ["longUnwindingColor", "#ffb74d"]];
var ql = { id: "open-interest-buildup", name: "Open Interest Buildup", category: "Volume", placement: "onchart", inputs: [{ key: "longBuildupColor", type: "color", label: "Long buildup", default: "#26a69a" }, { key: "shortBuildupColor", type: "color", label: "Short buildup", default: "#ef5350" }, { key: "shortCoveringColor", type: "color", label: "Short covering", default: "#42a5f5" }, { key: "longUnwindingColor", type: "color", label: "Long unwinding", default: "#ffb74d" }, { key: "unchanged", type: "select", label: "Unchanged reading", default: "neutral", options: [{ value: "neutral", label: "Neutral" }, { value: "up", label: "Treat as up" }] }], plots: [], calc: (e, t) => ({ state: e.map((l2, o2) => {
  const n2 = e[o2 - 1], r2 = Ul(l2.oi), a = Ul(n2?.oi);
  if (void 0 === n2 || null === r2 || null === a) return null;
  const i2 = l2.close - n2.close, s2 = r2 - a;
  return Number.isFinite(i2) && ("up" === t.unchanged || 0 !== i2 && 0 !== s2) ? s2 >= 0 ? i2 >= 0 ? 1 : 2 : i2 >= 0 ? 3 : 4 : null;
}) }), barColors: ({ values: e, settings: t }) => e.state.map((e2) => {
  if (null === e2) return null;
  const [l2, o2] = El[e2 - 1];
  return Yt2(t, l2, o2);
}) };
var Vl = (e) => e.map((e2) => e2.high);
var Hl = (e) => e.map((e2) => e2.low);
function zl(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN);
  if (t <= 0) return n2;
  for (let r2 = t - 1; r2 < o2; r2++) {
    let o3 = l2 ? -1 / 0 : 1 / 0, a = true;
    for (let n3 = 0; n3 < t; n3++) {
      const t2 = e[r2 - n3];
      if (!Number.isFinite(t2)) {
        a = false;
        break;
      }
      (l2 ? t2 > o3 : t2 < o3) && (o3 = t2);
    }
    a && (n2[r2] = o3);
  }
  return n2;
}
var jl = 0.05;
var Zl = Ht2({ id: "alma", name: "Arnaud Legoux Moving Average", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "offset", type: "number", label: "Offset", default: 0.85, min: 0, max: 1, step: 0.01 }, { key: "sigma", type: "number", label: "Sigma", default: 6, min: 0.1, max: 100, step: 0.1 }, { key: "color", type: "color", label: "ALMA", default: "#2962ff" }], plots: [{ key: "alma", type: "line", title: "ALMA", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => ({ alma: he(Ne(gs(e, "close"), jt2(t, "length", 9), zt2(t, "offset", 0.85), zt2(t, "sigma", 6))) }) });
var Yl = Ht2({ id: "dema", name: "Double EMA", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "DEMA", default: "#43a047" }], plots: [{ key: "dema", type: "line", title: "DEMA", colorKey: "color", style: { color: "#43a047", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), o2 = jt2(t, "length", 9), n2 = be2(l2, o2);
  return { dema: he(ll2(n2, Nl(n2, o2), (e2, t2) => 2 * e2 - t2)) };
} });
var Jl = Ht2({ id: "hma", name: "Hull Moving Average", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "HMA", default: "#2962ff" }], plots: [{ key: "hma", type: "line", title: "HMA", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => ({ hma: he(io2(gs(e, Gt2(t)), jt2(t, "length", 9))) }) });
var Gl = Ht2({ id: "envelope", name: "Envelope", category: "Volatility", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 1e3, step: 1 }, { key: "percent", type: "number", label: "Percent", default: 10, min: 0, max: 100, step: 0.1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "exponential", type: "boolean", label: "Exponential", default: false }, { key: "basisColor", type: "color", label: "Basis", default: "#ff6d00" }, { key: "bandColor", type: "color", label: "Bands", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "upper", type: "line", title: "Env Upper", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }, { key: "basis", type: "line", title: "Env Basis", colorKey: "basisColor", style: { color: "#ff6d00", lineWidth: 1.5 } }, { key: "lower", type: "line", title: "Env Lower", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }], fills: [{ between: ["upper", "lower"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: jl }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), o2 = jt2(t, "length", 20), n2 = zt2(t, "percent", 10) / 100, r2 = true === t.exponential ? be2(l2, o2) : ce2(l2, o2);
  return { upper: he(r2.map((e2) => e2 * (1 + n2))), basis: he(r2), lower: he(r2.map((e2) => e2 * (1 - n2))) };
} });
var Xl = Ht2(Ze({ id: "donchian", name: "Donchian Channels", category: "Volatility", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 1e3, step: 1 }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "basisColor", type: "color", label: "Basis", default: "#ff6d00" }, { key: "bandColor", type: "color", label: "Bands", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "upper", type: "line", title: "DC Upper", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }, { key: "basis", type: "line", title: "DC Basis", colorKey: "basisColor", style: { color: "#ff6d00", lineWidth: 1.5 } }, { key: "lower", type: "line", title: "DC Lower", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }], fills: [{ between: ["upper", "lower"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: jl }], calc: (e, t) => {
  const l2 = jt2(t, "length", 20), o2 = Zt2(t, "offset", 0), n2 = de2(Vl(e), l2), r2 = me2(Hl(e), l2), a = ll2(n2, r2, (e2, t2) => (e2 + t2) / 2);
  return { upper: he(_t2(n2, o2)), basis: he(_t2(a, o2)), lower: he(_t2(r2, o2)) };
} }, (e) => Qe(e, (e2) => {
  const t = jt2(e2, "length", 20), l2 = Zt2(e2, "offset", 0);
  return ze(t) && l2 >= 0 ? t - 1 + l2 : null;
})));
var _l = { id: "chande-kroll-stop", name: "Chande Kroll Stop", category: "Trend", placement: "onchart", inputs: [{ key: "p", type: "number", label: "ATR Length (p)", default: 10, min: 1, max: 500, step: 1 }, { key: "x", type: "number", label: "ATR Coefficient (x)", default: 1, min: 1, max: 100, step: 1 }, { key: "q", type: "number", label: "Stop Length (q)", default: 9, min: 1, max: 500, step: 1 }, { key: "longColor", type: "color", label: "Stop Long", default: "#2962ff" }, { key: "shortColor", type: "color", label: "Stop Short", default: "#ff6d00" }], plots: [{ key: "stopLong", type: "line", title: "Stop Long", colorKey: "longColor", style: { color: "#2962ff", lineWidth: 1.5 } }, { key: "stopShort", type: "line", title: "Stop Short", colorKey: "shortColor", style: { color: "#ff6d00", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = jt2(t, "p", 10), o2 = jt2(t, "x", 1), n2 = jt2(t, "q", 9), r2 = Vl(e), a = Hl(e), i2 = vh(r2, a, e.map((e2) => e2.close), l2), s2 = ll2(de2(r2, l2), i2, (e2, t2) => e2 - o2 * t2);
  return { stopLong: he(zl(ll2(me2(a, l2), i2, (e2, t2) => e2 + o2 * t2), n2, false)), stopShort: he(zl(s2, n2, true)) };
} };
var Ql = { id: "chandelier-exit", name: "Chandelier Exit", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 22, min: 1, max: 500, step: 1 }, { key: "atrLength", type: "number", label: "ATR length", default: 22, min: 1, max: 500, step: 1 }, { key: "atrMultiplier", type: "number", label: "ATR multiplier", default: 3, min: 0, max: 50, step: 0.01 }, { key: "longColor", type: "color", label: "Long exit", default: "#2962ff" }, { key: "shortColor", type: "color", label: "Short exit", default: "#ff6d00" }], plots: [{ key: "longExit", type: "line", title: "Long Exit", colorKey: "longColor", style: { color: "#2962ff", lineWidth: 1.5 } }, { key: "shortExit", type: "line", title: "Short Exit", colorKey: "shortColor", style: { color: "#ff6d00", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = jt2(t, "length", 22), o2 = zt2(t, "atrMultiplier", 3), n2 = Vl(e), r2 = Hl(e), a = vh(n2, r2, e.map((e2) => e2.close), jt2(t, "atrLength", 22));
  return { longExit: he(ll2(de2(n2, l2), a, (e2, t2) => e2 - o2 * t2)), shortExit: he(ll2(me2(r2, l2), a, (e2, t2) => e2 + o2 * t2)) };
} };
var eo2 = { id: "standard-error-bands", name: "Standard Error Bands", category: "Volatility", placement: "onchart", inputs: [{ key: "periods", type: "number", label: "Periods", default: 21, min: 3, max: 1e3, step: 1 }, { key: "errors", type: "number", label: "Standard Errors", default: 2, min: 0, max: 100, step: 0.1 }, { key: "method", type: "select", label: "Method", default: "Simple", options: [{ label: "Simple", value: "Simple" }, { label: "Exponential", value: "Exponential" }, { label: "Weighted", value: "Weighted" }] }, { key: "averagePeriods", type: "number", label: "Averaging Periods", default: 3, min: 1, max: 1e3, step: 1 }, { key: "basisColor", type: "color", label: "Basis", default: "#ff6d00" }, { key: "bandColor", type: "color", label: "Bands", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "upper", type: "line", title: "SEB Upper", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }, { key: "basis", type: "line", title: "SEB Basis", colorKey: "basisColor", style: { color: "#ff6d00", lineWidth: 1.5 } }, { key: "lower", type: "line", title: "SEB Lower", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }], fills: [{ between: ["upper", "lower"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: jl }], calc: (e, t) => {
  const l2 = gs(e, "close"), o2 = jt2(t, "periods", 21, 3), n2 = zt2(t, "errors", 2), r2 = jt2(t, "averagePeriods", 3), a = Re(l2, o2), i2 = Be2(l2, o2, 0), s2 = (e2) => he("Exponential" === t.method ? Nl(e2, r2) : "Weighted" === t.method ? ue2(e2, r2) : ce2(e2, r2));
  return { upper: s2(ll2(i2, a, (e2, t2) => e2 + n2 * t2)), basis: s2(i2), lower: s2(ll2(i2, a, (e2, t2) => e2 - n2 * t2)) };
} };
var to2 = { id: "ma-channel", name: "Moving Average Channel", category: "Volatility", placement: "onchart", inputs: [{ key: "upperLength", type: "number", label: "Upper Length", default: 20, min: 1, max: 1e3, step: 1 }, { key: "lowerLength", type: "number", label: "Lower Length", default: 20, min: 1, max: 1e3, step: 1 }, { key: "upperOffset", type: "number", label: "Upper Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "lowerOffset", type: "number", label: "Lower Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "upperColor", type: "color", label: "Upper", default: "#2962ff" }, { key: "lowerColor", type: "color", label: "Lower", default: "#ff6d00" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "upper", type: "line", title: "MAC Upper", colorKey: "upperColor", style: { color: "#2962ff", lineWidth: 1.5 } }, { key: "lower", type: "line", title: "MAC Lower", colorKey: "lowerColor", style: { color: "#ff6d00", lineWidth: 1.5 } }], fills: [{ between: ["upper", "lower"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: jl }], calc: (e, t) => ({ upper: he(_t2(ce2(Vl(e), jt2(t, "upperLength", 20)), Zt2(t, "upperOffset", 0))), lower: he(_t2(ce2(Hl(e), jt2(t, "lowerLength", 20)), Zt2(t, "lowerOffset", 0))) }) };
var lo2 = "#00ff00";
var oo2 = "#ff0000";
var no2 = "#ff9800";
var ro2 = (e) => Math.max(1, Math.floor(e));
var ao2 = (e) => Math.max(1, Math.round(Math.sqrt(e)));
function io2(e, t) {
  const l2 = ue2(e, ro2(t / 2)), o2 = ue2(e, t);
  return ue2(ll2(l2, o2, (e2, t2) => 2 * e2 - t2), ao2(t));
}
function so2(e, t, l2) {
  return "Ehma" === t ? function(e2, t2) {
    return Nl(ll2(be2(e2, ro2(t2 / 2)), be2(e2, t2), (e3, t3) => 2 * e3 - t3), ao2(t2));
  }(e, l2) : "Thma" === t ? function(e2, t2) {
    const l3 = ue2(e2, ro2(t2 / 3)), o2 = ue2(e2, ro2(t2 / 2)), n2 = ue2(e2, t2);
    return ue2(l3.map((e3, t3) => 3 * e3 - o2[t3] - n2[t3]), t2);
  }(e, ro2(l2 / 2)) : io2(e, l2);
}
var co2 = (e, t, l2) => {
  if (false === l2.switchColor) return Yt2(l2, "neutralColor", no2);
  const o2 = e?.[t], n2 = e?.[t - 2];
  return "number" == typeof o2 && "number" == typeof n2 && o2 > n2 ? Yt2(l2, "bullishColor", lo2) : Yt2(l2, "bearishColor", oo2);
};
var uo2 = { id: "hull-suite", name: "Hull Suite", category: "Trend", placement: "onchart", inputs: [{ key: "source", type: "source", label: "Source", default: "close" }, { key: "mode", type: "select", label: "Variation", default: "Hma", options: [{ label: "HMA", value: "Hma" }, { label: "THMA", value: "Thma" }, { label: "EHMA", value: "Ehma" }] }, { key: "length", type: "number", label: "Length", default: 55, min: 1, max: 1e3, step: 1 }, { key: "lengthMult", type: "number", label: "Length Multiplier", default: 1, min: 0.1, max: 10, step: 0.1 }, { key: "switchColor", type: "boolean", label: "Color Hull By Trend", default: true }, { key: "candleCol", type: "boolean", label: "Color Candles By Trend", default: false }, { key: "visualSwitch", type: "boolean", label: "Show Band", default: true }, { key: "bullishColor", type: "color", label: "Bullish Color", default: lo2 }, { key: "bearishColor", type: "color", label: "Bearish Color", default: oo2 }, { key: "neutralColor", type: "color", label: "Neutral Color", default: no2 }], plots: [{ key: "mhull", type: "line", title: "Hull", colorKey: "neutralColor", style: { color: no2, lineWidth: 2 }, colorBy: ({ index: e, values: t, settings: l2 }) => co2(t.mhull, e, l2) }, { key: "shull", type: "line", title: "Hull Displaced", colorKey: "neutralColor", style: { color: no2, lineWidth: 2 }, colorBy: ({ index: e, values: t, settings: l2 }) => co2(t.mhull, e, l2) }], fills: [{ between: ["mhull", "shull"], colorUp: lo2, colorDown: oo2, colorUpKey: "bullishColor", colorDownKey: "bearishColor", opacity: 0.6 }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), o2 = ro2(jt2(t, "length", 55) * zt2(t, "lengthMult", 1)), n2 = so2(l2, Yt2(t, "mode", "Hma"), o2), r2 = false !== t.visualSwitch;
  return { mhull: he(n2), shull: he(r2 ? _t2(n2, 2) : new Array(n2.length).fill(NaN)) };
}, barColors: ({ bars: e, values: t, settings: l2 }) => true === l2.candleCol ? e.map((e2, o2) => co2(t.mhull, o2, l2)) : e.map(() => null) };
var po2 = [Zl, Yl, Jl, Gl, Xl, _l, Ql, eo2, to2, uo2];
var yo = (e) => gs(e, "hl2");
var fo2 = { id: "aroon", name: "Aroon", category: "Trend", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "upColor", type: "color", label: "Aroon Up", default: "#fb8c00" }, { key: "downColor", type: "color", label: "Aroon Down", default: "#2962ff" }], plots: [{ key: "up", type: "line", title: "Aroon Up", colorKey: "upColor", style: { lineWidth: 1.5 } }, { key: "down", type: "line", title: "Aroon Down", colorKey: "downColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = jt2(t, "length", 14), o2 = Me2(e.map((e2) => e2.high), l2 + 1), n2 = xe2(e.map((e2) => e2.low), l2 + 1), r2 = (e2) => e2.map((e3) => 100 * (e3 + l2) / l2);
  return { up: he(r2(o2)), down: he(r2(n2)) };
}, levels: () => [{ price: 50, color: "#5a6b8c", dashed: true }], range: () => ({ min: 0, max: 100 }) };
var mo2 = { id: "aroon-oscillator", name: "Aroon Oscillator", category: "Trend", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "upColor", type: "color", label: "Positive", default: "#4caf50" }, { key: "downColor", type: "color", label: "Negative", default: "#ff5252" }], plots: [{ key: "osc", type: "line", title: "Oscillator", colorKey: "upColor", style: { lineWidth: 1.5 } }], fills: [{ between: ["osc", "zero"], colorUpKey: "upColor", colorDownKey: "downColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = jt2(t, "length", 14), o2 = ll2(Me2(e.map((e2) => e2.high), l2 + 1), xe2(e.map((e2) => e2.low), l2 + 1), (e2, t2) => 100 * (e2 - t2) / l2);
  return { osc: he(o2), zero: o2.map((e2) => Number.isFinite(e2) ? 0 : null) };
}, levels: () => [{ price: 90, color: "#5a6b8c", title: "Upper level", dashed: true }, { price: 0, color: "#787b86" }, { price: -90, color: "#5a6b8c", title: "Lower level", dashed: true }], range: () => ({ min: -100, max: 100 }) };
var ho = { id: "awesome-oscillator", name: "Awesome Oscillator", category: "Momentum", placement: "pane", inputs: [{ key: "upColor", type: "color", label: "Rising", default: "#009688" }, { key: "downColor", type: "color", label: "Falling", default: "#f44336" }], plots: [{ key: "ao", type: "column", title: "AO", colorKey: "upColor", style: { base: 0 }, colorBy: ({ value: e, index: t, values: l2, settings: o2 }) => {
  const n2 = l2.ao?.[t - 1];
  return null == n2 || !Number.isFinite(n2) || e - n2 > 0 ? Yt2(o2, "upColor", "#009688") : Yt2(o2, "downColor", "#f44336");
} }], calc: (e) => {
  const t = yo(e);
  return { ao: he(ll2(ce2(t, 5), ce2(t, 34), (e2, t2) => e2 - t2)) };
}, levels: () => [{ price: 0, color: "#787b86" }] };
var bo2 = { id: "balance-of-power", name: "Balance of Power", category: "Momentum", placement: "pane", inputs: [{ key: "color", type: "color", label: "BOP", default: "#ff5252" }], plots: [{ key: "bop", type: "line", title: "BOP", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e) => ({ bop: e.map((e2) => {
  const t = e2.high - e2.low, l2 = e2.close - e2.open;
  if (0 === t || !Number.isFinite(t) || !Number.isFinite(l2)) return null;
  const o2 = l2 / t;
  return Number.isFinite(o2) ? o2 : null;
}) }), levels: () => [{ price: 0, color: "#787b86" }] };
var go2 = { id: "chande-momentum", name: "Chande Momentum Oscillator", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "Chande MO", default: "#2962ff" }], plots: [{ key: "cmo", type: "line", title: "Chande MO", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "length", 9), n2 = ge2(gs(e, Gt2(t))), r2 = new Array(Math.max(0, l2 - 1)), a = new Array(Math.max(0, l2 - 1));
  for (let e2 = 1; e2 < l2; e2++) {
    const t2 = n2[e2];
    r2[e2 - 1] = t2 >= 0 ? t2 : 0, a[e2 - 1] = t2 >= 0 ? 0 : -t2;
  }
  const i2 = Se2(r2, o2), s2 = Se2(a, o2), c2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < i2.length; e2++) {
    const t2 = i2[e2] + s2[e2];
    c2[e2 + 1] = 0 === t2 ? NaN : 100 * (i2[e2] - s2[e2]) / t2;
  }
  return { cmo: he(c2) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero Line", dashed: true }] };
var wo = { id: "coppock-curve", name: "Coppock Curve", category: "Momentum", placement: "pane", inputs: [{ key: "wmaLength", type: "number", label: "WMA Length", default: 10, min: 1, max: 500, step: 1 }, { key: "longRoCLength", type: "number", label: "Long RoC Length", default: 14, min: 1, max: 500, step: 1 }, { key: "shortRoCLength", type: "number", label: "Short RoC Length", default: 11, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Coppock Curve", default: "#2962ff" }], plots: [{ key: "curve", type: "line", title: "Coppock Curve", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.map((e2) => e2.close);
  return { curve: he(ue2(ll2(we2(l2, jt2(t, "longRoCLength", 14)), we2(l2, jt2(t, "shortRoCLength", 11)), (e2, t2) => e2 + t2), jt2(t, "wmaLength", 10))) };
} };
var ko2 = { id: "dpo", name: "Detrended Price Oscillator", category: "Momentum", placement: "pane", inputs: [{ key: "period", type: "number", label: "Length", default: 21, min: 1, max: 500, step: 1 }, { key: "isCentered", type: "boolean", label: "Centered", default: false }, { key: "color", type: "color", label: "DPO", default: "#43a047" }], plots: [{ key: "dpo", type: "line", title: "DPO", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "period", 21), n2 = Math.floor(o2 / 2) + 1, r2 = e.map((e2) => e2.close), a = ce2(r2, o2), i2 = new Array(l2).fill(NaN);
  if (true === t.isCentered) for (let e2 = 0; e2 + n2 < l2; e2++) i2[e2] = r2[e2] - a[e2 + n2];
  else for (let e2 = n2; e2 < l2; e2++) i2[e2] = r2[e2] - a[e2 - n2];
  return { dpo: he(i2) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero Line" }] };
var vo2 = { id: "fisher-transform", name: "Fisher Transform", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 500, step: 1 }, { key: "fisherColor", type: "color", label: "Fisher", default: "#2962ff" }, { key: "triggerColor", type: "color", label: "Trigger", default: "#ff6d00" }], plots: [{ key: "fisher", type: "line", title: "Fisher", colorKey: "fisherColor", style: { lineWidth: 1.5 } }, { key: "trigger", type: "line", title: "Trigger", colorKey: "triggerColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "length", 9), n2 = yo(e), r2 = de2(n2, o2), a = me2(n2, o2), i2 = new Array(l2).fill(NaN);
  let s2 = 0, c2 = 0;
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = r2[e2] - a[e2];
    if (!Number.isFinite(t2) || !Number.isFinite(n2[e2])) {
      s2 = 0, c2 = 0;
      continue;
    }
    const l3 = 0.66 * ((n2[e2] - a[e2]) / Math.max(t2, 1e-3) - 0.5) + 0.67 * s2, o3 = l3 > 0.99 ? 0.999 : l3 < -0.99 ? -0.999 : l3, u3 = 0.5 * Math.log((1 + o3) / (1 - o3)) + 0.5 * c2;
    i2[e2] = u3, s2 = o3, c2 = u3;
  }
  const u2 = new Array(l2).fill(NaN);
  for (let e2 = 1; e2 < l2; e2++) u2[e2] = i2[e2 - 1];
  return { fisher: he(i2), trigger: he(u2) };
}, levels: () => [{ price: 1.5, color: "#e91e63", title: "1.5" }, { price: 0.75, color: "#787b86", title: "0.75" }, { price: 0, color: "#e91e63", title: "0" }, { price: -0.75, color: "#787b86", title: "-0.75" }, { price: -1.5, color: "#e91e63", title: "-1.5" }] };
function No2(e) {
  const t = e.length, l2 = new Array(t).fill(0);
  for (let o2 = 0; o2 < t; o2++) {
    const t2 = o2 > 0 ? l2[o2 - 1] : 0;
    o2 > 0 && e[o2] === e[o2 - 1] ? l2[o2] = 0 : o2 > 0 && e[o2] > e[o2 - 1] ? l2[o2] = t2 <= 0 ? 1 : t2 + 1 : l2[o2] = t2 >= 0 ? -1 : t2 - 1;
  }
  return l2;
}
var Co2 = { id: "connors-rsi", name: "Connors RSI", category: "Momentum", placement: "pane", inputs: [{ key: "lenrsi", type: "number", label: "RSI Length", default: 3, min: 1, max: 500, step: 1 }, { key: "lenupdown", type: "number", label: "UpDown Length", default: 2, min: 1, max: 500, step: 1 }, { key: "lenroc", type: "number", label: "ROC Length", default: 100, min: 1, max: 1e3, step: 1 }, { key: "color", type: "color", label: "CRSI", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "crsi", type: "line", title: "CRSI", colorKey: "color", style: { lineWidth: 1.5 } }], fills: [{ between: ["bandHigh", "bandLow"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = e.length, o2 = e.map((e2) => e2.close), n2 = mh(o2, jt2(t, "lenrsi", 3)), r2 = mh(No2(o2), jt2(t, "lenupdown", 2)), a = ve2(we2(o2, 1).slice(1), jt2(t, "lenroc", 100)), i2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < a.length; e2++) i2[e2 + 1] = a[e2];
  const s2 = new Array(l2);
  for (let e2 = 0; e2 < l2; e2++) s2[e2] = (n2[e2] + r2[e2] + i2[e2]) / 3;
  return { crsi: he(s2), bandHigh: new Array(l2).fill(70), bandLow: new Array(l2).fill(30) };
}, levels: () => [{ price: 70, color: "#787b86", title: "Upper Band" }, { price: 50, color: "#5a6b8c", title: "Middle Band", dashed: true }, { price: 30, color: "#787b86", title: "Lower Band" }], range: () => ({ min: 0, max: 100 }) };
var Mo2 = [fo2, mo2, ho, bo2, go2, wo, ko2, vo2, Co2];
function xo2(e, t) {
  return `${e}${Math.round(255 * (1 - t / 100)).toString(16).padStart(2, "0")}`;
}
function Ao2(e, t, l2) {
  const o2 = e.length, n2 = ce2(e, t), r2 = fe2(e, t), a = new Array(o2), i2 = new Array(o2);
  for (let e2 = 0; e2 < o2; e2++) {
    const t2 = l2 * r2[e2];
    a[e2] = n2[e2] + t2, i2[e2] = n2[e2] - t2;
  }
  return { middle: n2, upper: a, lower: i2 };
}
var So2 = { id: "bollinger-percent-b", name: "Bollinger Bands %b", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 2e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "mult", type: "number", label: "StdDev", default: 2, min: 1e-3, max: 50, step: 0.1 }, { key: "color", type: "color", label: "Bollinger Bands %b", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Middle Background", default: "#2962ff" }], plots: [{ key: "percentB", type: "line", title: "Bollinger Bands %b", colorKey: "color", style: { lineWidth: 1.5 } }], fills: [{ between: ["bandHigh", "bandLow"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), { upper: o2, lower: n2 } = Ao2(l2, jt2(t, "length", 20), zt2(t, "mult", 2)), r2 = new Array(l2.length);
  for (let e2 = 0; e2 < l2.length; e2++) {
    const t2 = o2[e2] - n2[e2];
    r2[e2] = t2 > 0 ? (l2[e2] - n2[e2]) / t2 : NaN;
  }
  return { percentB: he(r2), bandHigh: new Array(e.length).fill(1), bandLow: new Array(e.length).fill(0) };
}, levels: () => [{ price: 1, color: "#f23645", title: "Overbought", dashed: true }, { price: 0.5, color: "#2962ff", title: "Middle Band" }, { price: 0, color: "#089981", title: "Oversold", dashed: true }] };
var Lo2 = { id: "bollinger-bandwidth", name: "Bollinger BandWidth", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 2e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "mult", type: "number", label: "StdDev", default: 2, min: 1e-3, max: 50, step: 0.1 }, { key: "expansionLength", type: "number", label: "Highest Expansion Length", default: 125, min: 1, max: 5e3, step: 1, tooltip: "Bars searched for the widest bandwidth reading, drawn as the upper reference line." }, { key: "contractionLength", type: "number", label: "Lowest Contraction Length", default: 125, min: 1, max: 5e3, step: 1, tooltip: "Bars searched for the narrowest bandwidth reading, drawn as the lower reference line. A squeeze is price sitting on it." }, { key: "color", type: "color", label: "Bollinger BandWidth", default: "#2962ff" }, { key: "expansionColor", type: "color", label: "Highest Expansion", default: "#f23645" }, { key: "contractionColor", type: "color", label: "Lowest Contraction", default: "#089981" }], plots: [{ key: "bandwidth", type: "line", title: "Bollinger BandWidth", colorKey: "color", style: { lineWidth: 1.5 }, priceFormat: { type: "percent" } }, { key: "expansion", type: "line", title: "Highest Expansion", colorKey: "expansionColor", style: { lineWidth: 1 } }, { key: "contraction", type: "line", title: "Lowest Contraction", colorKey: "contractionColor", style: { lineWidth: 1 } }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), { middle: o2, upper: n2, lower: r2 } = Ao2(l2, jt2(t, "length", 20), zt2(t, "mult", 2)), a = new Array(l2.length);
  for (let e2 = 0; e2 < l2.length; e2++) a[e2] = 0 === o2[e2] ? NaN : (n2[e2] - r2[e2]) / o2[e2] * 100;
  return { bandwidth: he(a), expansion: he(de2(a, jt2(t, "expansionLength", 125))), contraction: he(me2(a, jt2(t, "contractionLength", 125))) };
} };
var Bo2 = { id: "bb-trend", name: "BBTrend", category: "Volatility", placement: "pane", inputs: [{ key: "shortLength", type: "number", label: "Short BB Length", default: 20, min: 1, max: 2e3, step: 1 }, { key: "longLength", type: "number", label: "Long BB Length", default: 50, min: 1, max: 2e3, step: 1 }, { key: "stdDevMult", type: "number", label: "StdDev", default: 2, min: 1e-3, max: 50, step: 0.1 }, { key: "posColor", type: "color", label: "Above zero", default: "#089981" }, { key: "negColor", type: "color", label: "Below zero", default: "#f23645" }], plots: [{ key: "bbtrend", type: "column", title: "BBTrend", colorKey: "posColor", style: { base: 0 }, colorBy: ({ value: e, index: t, values: l2, settings: o2 }) => {
  const n2 = l2.bbtrend?.[t - 1], r2 = "number" == typeof n2 && Number.isFinite(n2);
  return r2 && e > 0 ? xo2(Yt2(o2, "posColor", "#089981"), e >= n2 ? 25 : 50) : r2 && e < 0 ? xo2(Yt2(o2, "negColor", "#f23645"), e > n2 ? 50 : 25) : xo2(Yt2(o2, "posColor", "#089981"), 50);
} }], calc: (e, t) => {
  const l2 = e.map((e2) => e2.close), o2 = zt2(t, "stdDevMult", 2), n2 = Ao2(l2, jt2(t, "shortLength", 20), o2), r2 = Ao2(l2, jt2(t, "longLength", 50), o2), a = new Array(l2.length);
  for (let e2 = 0; e2 < l2.length; e2++) {
    const t2 = Math.abs(n2.lower[e2] - r2.lower[e2]) - Math.abs(n2.upper[e2] - r2.upper[e2]);
    a[e2] = 0 === n2.middle[e2] ? NaN : t2 / n2.middle[e2] * 100;
  }
  return { bbtrend: he(a) };
}, levels: () => [{ price: 0, color: "#5a6b8c", title: "Zero line", dashed: true }] };
var Fo2 = { id: "choppiness-index", name: "Choppiness Index", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 2e3, step: 1 }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "color", type: "color", label: "CHOP", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "chop", type: "line", title: "CHOP", colorKey: "color", style: { lineWidth: 1.5 } }], fills: [{ between: ["bandHigh", "bandLow"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = jt2(t, "length", 14), o2 = e.map((e2) => e2.high), n2 = e.map((e2) => e2.low), r2 = Se2(gh(o2, n2, e.map((e2) => e2.close)), l2), a = de2(o2, l2), i2 = me2(n2, l2), s2 = Math.log10(l2), c2 = new Array(e.length).fill(NaN);
  if (0 !== s2) for (let t2 = 0; t2 < e.length; t2++) {
    const e2 = a[t2] - i2[t2];
    if (!(e2 > 0)) continue;
    const l3 = r2[t2] / e2;
    l3 > 0 && (c2[t2] = 100 * Math.log10(l3) / s2);
  }
  return { chop: he(_t2(c2, Zt2(t, "offset", 0))), bandHigh: new Array(e.length).fill(61.8), bandLow: new Array(e.length).fill(38.2) };
}, levels: () => [{ price: 61.8, color: "#787b86", title: "Upper Band", dashed: true }, { price: 50, color: "#787b86", title: "Middle Band" }, { price: 38.2, color: "#787b86", title: "Lower Band", dashed: true }], range: () => ({ min: 0, max: 100 }) };
var Ko2 = { id: "historical-volatility", name: "Historical Volatility", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 10, min: 1, max: 2e3, step: 1 }, { key: "per", type: "number", label: "Days per bar unit", default: 1, min: 1, max: 365, step: 1, tooltip: "Calendar days each bar covers, used to annualise: 1 for intraday and daily, 7 for weekly and above." }, { key: "color", type: "color", label: "HV", default: "#2962ff" }], plots: [{ key: "hv", type: "line", title: "HV", colorKey: "color", style: { lineWidth: 1.5 }, priceFormat: { type: "percent" } }], calc: (e, t) => {
  const l2 = e.length, o2 = zt2(t, "per", 1), n2 = new Array(l2).fill(NaN);
  for (let t2 = 1; t2 < l2; t2++) {
    const l3 = e[t2 - 1].close, o3 = e[t2].close;
    n2[t2] = l3 > 0 && o3 > 0 ? Math.log(o3 / l3) : NaN;
  }
  const r2 = fe2(n2, jt2(t, "length", 10)), a = o2 > 0 ? Math.sqrt(365 / o2) : NaN;
  return { hv: he(r2.map((e2) => 100 * e2 * a)) };
} };
var Wo2 = { id: "average-daily-range", name: "Average Daily Range", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 2e3, step: 1 }, { key: "color", type: "color", label: "ADR", default: "#2962ff" }], plots: [{ key: "adr", type: "line", title: "ADR", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => ({ adr: he(ce2(e.map((e2) => e2.high - e2.low), jt2(t, "length", 14))) }) };
var Do2 = 4 * Math.atan(1);
var Oo2 = { id: "chop-zone", name: "Chop Zone", category: "Volatility", placement: "pane", inputs: [{ key: "turquoiseColor", type: "color", label: "Steep up", default: "#26c6da" }, { key: "darkGreenColor", type: "color", label: "Up", default: "#43a047" }, { key: "paleGreenColor", type: "color", label: "Mild up", default: "#a5d6a7" }, { key: "limeColor", type: "color", label: "Slight up", default: "#009688" }, { key: "yellowColor", type: "color", label: "Flat", default: "#fdd835" }, { key: "lightOrangeColor", type: "color", label: "Slight down", default: "#ffb74d" }, { key: "orangeColor", type: "color", label: "Mild down", default: "#ff6d00" }, { key: "redColor", type: "color", label: "Down", default: "#e91e63" }, { key: "darkRedColor", type: "color", label: "Steep down", default: "#d50000" }], plots: [{ key: "chopZone", type: "column", title: "Chop Zone", colorKey: "yellowColor", style: { base: 0 }, colorBy: ({ index: e, values: t, settings: l2 }) => {
  const o2 = t.angle?.[e];
  return null != o2 && Number.isFinite(o2) ? o2 >= 5 ? Yt2(l2, "turquoiseColor", "#26c6da") : o2 >= 3.57 ? Yt2(l2, "darkGreenColor", "#43a047") : o2 >= 2.14 ? Yt2(l2, "paleGreenColor", "#a5d6a7") : o2 >= 0.71 ? Yt2(l2, "limeColor", "#009688") : o2 <= -5 ? Yt2(l2, "darkRedColor", "#d50000") : o2 <= -3.57 ? Yt2(l2, "redColor", "#e91e63") : o2 <= -2.14 ? Yt2(l2, "orangeColor", "#ff6d00") : o2 <= -0.71 ? Yt2(l2, "lightOrangeColor", "#ffb74d") : Yt2(l2, "yellowColor", "#fdd835") : Yt2(l2, "yellowColor", "#fdd835");
} }], calc: (e) => {
  const t = e.length, l2 = de2(e.map((e2) => e2.high), 30), o2 = me2(e.map((e2) => e2.high), 30), n2 = be2(e.map((e2) => e2.close), 34), r2 = new Array(t).fill(NaN);
  for (let a = 1; a < t; a++) {
    const t2 = l2[a] - o2[a], i2 = (e[a].high + e[a].low + e[a].close) / 3;
    if (!(t2 > 0) || 0 === i2) continue;
    const s2 = 25 / t2 * o2[a], c2 = (n2[a - 1] - n2[a]) / i2 * s2;
    if (!Number.isFinite(c2)) continue;
    const u2 = Math.sqrt(1 + c2 * c2), p2 = Math.round(180 * Math.acos(1 / u2) / Do2);
    r2[a] = c2 > 0 ? -p2 : p2;
  }
  return { chopZone: new Array(t).fill(1), angle: he(r2) };
}, range: () => ({ min: 0, max: 1 }) };
var Ro2 = { id: "chaikin-volatility", name: "Chaikin Volatility", category: "Volatility", placement: "pane", inputs: [{ key: "periods", type: "number", label: "Periods", default: 10, min: 1, max: 2e3, step: 1 }, { key: "rocLookback", type: "number", label: "Rate of Change Lookback", default: 10, min: 1, max: 2e3, step: 1 }, { key: "color", type: "color", label: "Chaikin Volatility", default: "#ab47bc" }], plots: [{ key: "chaikinVolatility", type: "line", title: "Chaikin Volatility", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => ({ chaikinVolatility: he(we2(be2(e.map((e2) => e2.high - e2.low), jt2(t, "periods", 10)), jt2(t, "rocLookback", 10))) }), levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var To2 = { id: "standard-deviation", name: "Standard Deviation", category: "Volatility", placement: "pane", inputs: [{ key: "periods", type: "number", label: "Periods", default: 5, min: 1, max: 2e3, step: 1 }, { key: "deviations", type: "number", label: "Deviations", default: 1, min: 1e-3, max: 50, step: 0.1 }, { key: "color", type: "color", label: "Standard Deviation", default: "#089981" }], plots: [{ key: "stdDev", type: "line", title: "Standard Deviation", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = zt2(t, "deviations", 1);
  return { stdDev: he(fe2(e.map((e2) => e2.close), jt2(t, "periods", 5)).map((e2) => e2 * l2)) };
} };
var Po2 = { id: "standard-error", name: "Standard Error", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 3, max: 2e3, step: 1 }, { key: "color", type: "color", label: "Standard Error", default: "#ff6d00" }], plots: [{ key: "stdErr", type: "line", title: "Standard Error", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => ({ stdErr: he(Re(e.map((e2) => e2.close), jt2(t, "length", 14, 3))) }) };
var Uo2 = (e) => jt2(e, "length", 20, 2);
var $o2 = Ze({ id: "volatility-squeeze", name: "Volatility Squeeze", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 2, max: 1e3, step: 1 }, { key: "bbMult", type: "number", label: "BB StdDev", default: 2, min: 0.1, max: 10, step: 0.1 }, { key: "kcMult", type: "number", label: "KC Multiplier", default: 1.5, min: 0.1, max: 10, step: 0.1 }, { key: "upColor", type: "color", label: "Momentum up", default: "#26a69a" }, { key: "upFadeColor", type: "color", label: "Momentum up (weakening)", default: "#a7d8d2" }, { key: "downColor", type: "color", label: "Momentum down", default: "#ef5350" }, { key: "downFadeColor", type: "color", label: "Momentum down (weakening)", default: "#f5b0ae" }, { key: "onColor", type: "color", label: "Squeeze on", default: "#ff9800" }, { key: "offColor", type: "color", label: "Squeeze off", default: "#787b86" }], plots: [{ key: "momentum", type: "histogram", title: "Momentum", colorKey: "upColor", style: { color: "#26a69a", base: 0 }, colorBy: ({ value: e, index: t, values: l2, settings: o2 }) => {
  const n2 = l2.momentum?.[t - 1], r2 = "number" == typeof n2 && Number.isFinite(n2) ? n2 : 0;
  return e > 0 ? e > r2 ? Yt2(o2, "upColor", "#26a69a") : Yt2(o2, "upFadeColor", "#a7d8d2") : e < r2 ? Yt2(o2, "downColor", "#ef5350") : Yt2(o2, "downFadeColor", "#f5b0ae");
} }, { key: "squeeze", type: "line", title: "Squeeze", colorKey: "offColor", style: { color: "#787b86", markersOnly: true, markerRadius: 3 }, colorBy: ({ index: e, values: t, settings: l2 }) => 1 === t.state?.[e] ? Yt2(l2, "onColor", "#ff9800") : Yt2(l2, "offColor", "#787b86") }], calc: (e, t) => {
  const l2 = e.length, o2 = Uo2(t), n2 = e.map((e2) => e2.high), r2 = e.map((e2) => e2.low), a = e.map((e2) => e2.close), { middle: i2, upper: s2, lower: c2 } = Ao2(a, o2, zt2(t, "bbMult", 2)), u2 = ce2(gh(n2, r2, a), o2), p2 = zt2(t, "kcMult", 1.5), y2 = de2(n2, o2), f2 = me2(r2, o2), d2 = a.map((e2, t2) => e2 - ((y2[t2] + f2[t2]) / 2 + i2[t2]) / 2), m2 = new Array(l2).fill(null), h2 = new Array(l2).fill(null);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = p2 * u2[e2], l3 = i2[e2] + t2, o3 = i2[e2] - t2;
    [s2[e2], c2[e2], l3, o3].every(Number.isFinite) && (m2[e2] = c2[e2] > o3 && s2[e2] < l3 ? 1 : 0, h2[e2] = 0);
  }
  return { momentum: he(Be2(d2, o2)), squeeze: h2, state: m2 };
} }, (e) => Qe(e, (e2) => 2 * Uo2(e2) - 2));
var Io2 = [So2, Lo2, Bo2, Fo2, Ko2, Wo2, Oo2, Ro2, To2, Po2, $o2];
function Eo2(e) {
  const t = new Array(e.length);
  for (let l2 = 0; l2 < e.length; l2++) {
    const o2 = e[l2], n2 = o2.close === o2.high && o2.close === o2.low || o2.high === o2.low;
    t[l2] = n2 ? 0 : (2 * o2.close - o2.low - o2.high) / (o2.high - o2.low) * tl(o2);
  }
  return t;
}
var qo2 = { id: "chaikin-money-flow", name: "Chaikin Money Flow", category: "Volume", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Color", default: "#43a047" }], plots: [{ key: "cmf", type: "line", title: "CMF", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = jt2(t, "length", 20), o2 = Se2(Eo2(e), l2), n2 = Se2(e.map(tl), l2), r2 = new Array(e.length).fill(NaN);
  for (let t2 = 0; t2 < e.length; t2++) n2[t2] > 0 && (r2[t2] = o2[t2] / n2[t2]);
  return { cmf: he(r2) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var Vo2 = { id: "chaikin-oscillator", name: "Chaikin Oscillator", category: "Volume", placement: "pane", inputs: [{ key: "short", type: "number", label: "Fast Length", default: 3, min: 1, max: 500, step: 1 }, { key: "long", type: "number", label: "Slow Length", default: 10, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Color", default: "#ec407a" }], plots: [{ key: "osc", type: "line", title: "Chaikin Oscillator", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = Le2(Eo2(e)), o2 = Nl(l2, jt2(t, "short", 3)), n2 = Nl(l2, jt2(t, "long", 10)), r2 = new Array(e.length);
  for (let t2 = 0; t2 < e.length; t2++) r2[t2] = o2[t2] - n2[t2];
  return { osc: he(r2) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var Ho2 = { id: "ease-of-movement", name: "Ease of Movement", category: "Volume", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "divisor", type: "number", label: "Divisor", default: 1e4, min: 1, max: 1e6, step: 1 }, { key: "color", type: "color", label: "Color", default: "#43a047" }], plots: [{ key: "eom", type: "line", title: "EOM", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = zt2(t, "divisor", 1e4), o2 = ge2(e.map((e2) => (e2.high + e2.low) / 2)), n2 = new Array(e.length);
  for (let t2 = 0; t2 < e.length; t2++) {
    const r2 = e[t2], a = tl(r2);
    n2[t2] = 0 === a ? NaN : l2 * o2[t2] * (r2.high - r2.low) / a;
  }
  return { eom: he(ce2(n2, jt2(t, "length", 14))) };
} };
var zo2 = { id: "elder-force-index", name: "Elder Force Index", category: "Volume", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 13, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Color", default: "#f44336" }], plots: [{ key: "efi", type: "line", title: "Elder Force Index", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = ge2(e.map((e2) => e2.close)), o2 = new Array(e.length);
  for (let t2 = 0; t2 < e.length; t2++) o2[t2] = l2[t2] * tl(e[t2]);
  return { efi: he(Nl(o2, jt2(t, "length", 13))) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var jo2 = { id: "net-volume", name: "Net Volume", category: "Volume", placement: "pane", inputs: [{ key: "color", type: "color", label: "Color", default: "#2196f3" }], plots: [{ key: "net", type: "histogram", title: "Net Volume", colorKey: "color", style: { base: 0 } }], calc: (e) => {
  const t = new Array(e.length).fill(0);
  for (let l2 = 1; l2 < e.length; l2++) {
    const o2 = e[l2].close - e[l2 - 1].close;
    t[l2] = o2 > 0 ? tl(e[l2]) : o2 < 0 ? -tl(e[l2]) : 0;
  }
  return { net: he(t) };
} };
var Zo2 = [qo2, Vo2, Ho2, zo2, jo2];
var Yo = Ht2({ id: "kama", name: "Kaufman's Adaptive Moving Average", category: "Trend", placement: "onchart", inputs: [{ key: "erLength", type: "number", label: "ER Length", default: 10, min: 1, max: 1e3, step: 1 }, { key: "fastLength", type: "number", label: "Fast Length", default: 2, min: 1, max: 1e3, step: 1 }, { key: "slowLength", type: "number", label: "Slow Length", default: 30, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "KAMA", default: "#2962ff" }], plots: [{ key: "kama", type: "line", title: "KAMA", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), o2 = l2.length, n2 = jt2(t, "erLength", 10), r2 = new Array(o2).fill(NaN);
  if (o2 <= n2) return { kama: he(r2) };
  const a = ge2(l2, 1);
  for (let e2 = 0; e2 < o2; e2++) a[e2] = Number.isFinite(a[e2]) ? Math.abs(a[e2]) : 0;
  const i2 = Se2(a, n2), s2 = ge2(l2, n2), c2 = 2 / (jt2(t, "fastLength", 2) + 1), u2 = 2 / (jt2(t, "slowLength", 30) + 1);
  let p2 = l2[n2];
  r2[n2] = p2;
  for (let e2 = n2 + 1; e2 < o2; e2++) {
    const t2 = i2[e2], o3 = (Number.isFinite(t2) && 0 !== t2 ? Math.abs(s2[e2]) / t2 : 0) * (c2 - u2) + u2;
    p2 += o3 * o3 * (l2[e2] - p2), r2[e2] = p2;
  }
  return { kama: he(r2) };
} });
var Jo2 = Ht2(Ze({ id: "keltner-channel", name: "Keltner Channels", category: "Volatility", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 1e3, step: 1 }, { key: "mult", type: "number", label: "Multiplier", default: 2, min: 0.1, max: 50, step: 0.1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "exp", type: "boolean", label: "Use Exponential MA", default: true }, { key: "bandsStyle", type: "select", label: "Bands Style", default: "Average True Range", options: [{ label: "Average True Range", value: "Average True Range" }, { label: "True Range", value: "True Range" }, { label: "Range", value: "Range" }] }, { key: "atrlength", type: "number", label: "ATR Length", default: 10, min: 1, max: 1e3, step: 1 }, { key: "basisColor", type: "color", label: "Basis", default: "#2962ff" }, { key: "bandColor", type: "color", label: "Bands", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "upper", type: "line", title: "Upper", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }, { key: "basis", type: "line", title: "Basis", colorKey: "basisColor", style: { color: "#2962ff", lineWidth: 1.5 } }, { key: "lower", type: "line", title: "Lower", colorKey: "bandColor", style: { color: "#2962ff", lineWidth: 1 } }], fills: [{ between: ["upper", "lower"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.05 }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "length", 20), n2 = zt2(t, "mult", 2), r2 = gs(e, Gt2(t)), a = Jt2(t, "exp", true) ? be2(r2, o2) : ce2(r2, o2), i2 = e.map((e2) => e2.high), s2 = e.map((e2) => e2.low), c2 = e.map((e2) => e2.close), u2 = Yt2(t, "bandsStyle", "Average True Range");
  let p2;
  p2 = "True Range" === u2 ? gh(i2, s2, c2) : "Range" === u2 ? ye2(ll2(i2, s2, (e2, t2) => e2 - t2), o2) : vh(i2, s2, c2, jt2(t, "atrlength", 10));
  const y2 = new Array(l2).fill(NaN), f2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = p2[e2] * n2;
    y2[e2] = a[e2] + t2, f2[e2] = a[e2] - t2;
  }
  return { upper: he(y2), basis: he(a), lower: he(f2) };
} }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "length", 20), i2 = jt2(l2, "atrlength", 10);
  if (!ze(a) || !ze(i2)) return null;
  const s2 = zt2(l2, "mult", 2), c2 = Gt2(l2), u2 = Jt2(l2, "exp", true), p2 = Yt2(l2, "bandsStyle", "Average True Range"), y2 = (e2) => bs(t[e2], c2);
  return et2(e, `${a}|${i2}|${s2}|${c2}|${u2}|${p2}`, { keys: ["upper", "basis", "lower"], start: () => ({ basis: { run: 0, value: NaN, seeded: false, recent: [] }, range: { run: 0, value: NaN, seeded: false, recent: [] }, atr: { a: NaN, run: 0, recent: [] } }), step: (e2, l3, o3) => {
    const n3 = t[l3], r3 = u2 ? ot2(e2.basis, y2(l3), a, true) : ut2(y2, l3, a), c3 = ("True Range" === p2 ? rt(t, l3) : "Range" === p2 ? ot2(e2.range, n3.high - n3.low, a, false) : it2(e2.atr, rt(t, l3), i2)) * s2;
    o3[0] = He2(r3 + c3), o3[1] = He2(r3), o3[2] = He2(r3 - c3);
  } }, t, o2, n2, r2);
}));
var Go2 = Ht2({ id: "lsma", name: "Least Squares Moving Average", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 25, min: 2, max: 1e3, step: 1 }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "LSMA", default: "#2962ff" }], plots: [{ key: "lsma", type: "line", title: "LSMA", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => ({ lsma: he(Be2(gs(e, Gt2(t)), jt2(t, "length", 25, 2), Zt2(t, "offset", 0))) }) });
var Xo = { id: "klinger-oscillator", name: "Klinger Oscillator", category: "Volume", placement: "pane", inputs: [{ key: "kvoColor", type: "color", label: "Klinger Oscillator", default: "#2962ff" }, { key: "signalColor", type: "color", label: "Signal", default: "#43a047" }], plots: [{ key: "kvo", type: "line", title: "Klinger Oscillator", colorKey: "kvoColor", style: { color: "#2962ff", lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal", colorKey: "signalColor", style: { color: "#43a047", lineWidth: 1.5 } }], calc: (e) => {
  const t = e.length, l2 = ge2(gs(e, "hlc3"), 1), o2 = new Array(t);
  for (let n3 = 0; n3 < t; n3++) {
    const t2 = e[n3].volume ?? 0;
    o2[n3] = l2[n3] >= 0 ? t2 : -t2;
  }
  const n2 = be2(o2, 34), r2 = be2(o2, 55), a = new Array(t).fill(NaN);
  for (let e2 = 0; e2 < t; e2++) a[e2] = n2[e2] - r2[e2];
  return { kvo: he(a), signal: he(Nl(a, 13)) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var _o2 = { id: "know-sure-thing", name: "Know Sure Thing", category: "Momentum", placement: "pane", inputs: [{ key: "roclen1", type: "number", label: "ROC Length #1", default: 10, min: 1, max: 1e3, step: 1 }, { key: "roclen2", type: "number", label: "ROC Length #2", default: 15, min: 1, max: 1e3, step: 1 }, { key: "roclen3", type: "number", label: "ROC Length #3", default: 20, min: 1, max: 1e3, step: 1 }, { key: "roclen4", type: "number", label: "ROC Length #4", default: 30, min: 1, max: 1e3, step: 1 }, { key: "smalen1", type: "number", label: "SMA Length #1", default: 10, min: 1, max: 1e3, step: 1 }, { key: "smalen2", type: "number", label: "SMA Length #2", default: 10, min: 1, max: 1e3, step: 1 }, { key: "smalen3", type: "number", label: "SMA Length #3", default: 10, min: 1, max: 1e3, step: 1 }, { key: "smalen4", type: "number", label: "SMA Length #4", default: 15, min: 1, max: 1e3, step: 1 }, { key: "siglen", type: "number", label: "Signal Line Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "kstColor", type: "color", label: "KST", default: "#009688" }, { key: "signalColor", type: "color", label: "Signal", default: "#f44336" }], plots: [{ key: "kst", type: "line", title: "KST", colorKey: "kstColor", style: { color: "#009688", lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal", colorKey: "signalColor", style: { color: "#f44336", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = gs(e, "close"), n2 = (e2, l3, n3, r3) => ce2(we2(o2, jt2(t, e2, l3)), jt2(t, n3, r3)), r2 = n2("roclen1", 10, "smalen1", 10), a = n2("roclen2", 15, "smalen2", 10), i2 = n2("roclen3", 20, "smalen3", 10), s2 = n2("roclen4", 30, "smalen4", 15), c2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < l2; e2++) c2[e2] = r2[e2] + 2 * a[e2] + 3 * i2[e2] + 4 * s2[e2];
  return { kst: he(c2), signal: he(ce2(c2, jt2(t, "siglen", 9))) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var Qo2 = { id: "linreg-slope", name: "Linear Regression Slope", category: "Trend", placement: "pane", inputs: [{ key: "periods", type: "number", label: "Periods", default: 14, min: 2, max: 1e3, step: 1 }, { key: "color", type: "color", label: "Slope", default: "#ff5252" }], plots: [{ key: "slope", type: "line", title: "Slope", colorKey: "color", style: { color: "#ff5252", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, "close"), o2 = l2.length, n2 = jt2(t, "periods", 14, 2), r2 = new Array(o2).fill(NaN), a = n2 * (n2 + 1) / 2, i2 = n2 * n2 * (n2 * n2 - 1) / 12;
  for (let e2 = n2 - 1; e2 < o2; e2++) {
    let t2 = 0, o3 = 0;
    for (let r3 = 0; r3 < n2; r3++) {
      const a2 = l2[e2 - r3];
      t2 += a2, o3 += a2 * (n2 - r3);
    }
    r2[e2] = (n2 * o3 - a * t2) / i2;
  }
  return { slope: he(r2) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var en2 = [Yo, Jo2, Go2, Xo, _o2, Qo2];
var tn2 = { id: "ma-cross", name: "MA Cross", category: "Trend", placement: "onchart", inputs: [{ key: "shortLength", type: "number", label: "Short MA Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "longLength", type: "number", label: "Long MA Length", default: 26, min: 1, max: 1e3, step: 1 }, { key: "shortColor", type: "color", label: "Short MA", default: "#ff6d00" }, { key: "longColor", type: "color", label: "Long MA", default: "#43a047" }, { key: "crossColor", type: "color", label: "Cross", default: "#2962ff" }], plots: [{ key: "short", type: "line", title: "Short MA", colorKey: "shortColor", style: { color: "#ff6d00", lineWidth: 1.5 } }, { key: "long", type: "line", title: "Long MA", colorKey: "longColor", style: { color: "#43a047", lineWidth: 1.5 } }, { key: "cross", type: "line", title: "Cross", colorKey: "crossColor", style: { markersOnly: true, markerRadius: 3 } }], calc: (e, t) => {
  const l2 = gs(e, "close"), o2 = ce2(l2, jt2(t, "shortLength", 9)), n2 = ce2(l2, jt2(t, "longLength", 26)), r2 = Z2(o2, n2);
  return { short: he(o2), long: he(n2), cross: o2.map((e2, t2) => r2[t2] ? e2 : null) };
} };
var ln = Ht2({ id: "mcginley-dynamic", name: "McGinley Dynamic", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 1e3, step: 1 }, { key: "color", type: "color", label: "McGinley Dynamic", default: "#2962ff" }], plots: [{ key: "mg", type: "line", title: "McGinley Dynamic", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, "close"), o2 = jt2(t, "length", 14), n2 = be2(l2, o2), r2 = new Array(l2.length).fill(NaN);
  let a = NaN;
  for (let e2 = 0; e2 < l2.length; e2++) {
    if (Number.isFinite(a) && 0 !== a) {
      const t2 = o2 * Math.pow(l2[e2] / a, 4), i2 = a + (l2[e2] - a) / t2;
      r2[e2] = Number.isFinite(i2) ? i2 : n2[e2];
    } else r2[e2] = n2[e2];
    a = r2[e2];
  }
  return { mg: he(r2) };
} });
var on2 = { id: "median", name: "Median", category: "Trend", placement: "onchart", inputs: [{ key: "source", type: "source", label: "Median Source", default: "hl2" }, { key: "length", type: "number", label: "Median Length", default: 3, min: 1, max: 1e3, step: 1 }, { key: "atrLength", type: "number", label: "ATR Length", default: 14, min: 1, max: 1e3, step: 1 }, { key: "atrMult", type: "number", label: "ATR Multiplier", default: 2, min: 0, max: 50, step: 0.1 }, { key: "medianColor", type: "color", label: "Median", default: "#ff5252" }, { key: "upperColor", type: "color", label: "Upper Band", default: "#00e676" }, { key: "lowerColor", type: "color", label: "Lower Band", default: "#e040fb" }, { key: "emaColor", type: "color", label: "Median EMA", default: "#2196f3" }], plots: [{ key: "median", type: "line", title: "Median", colorKey: "medianColor", style: { color: "#ff5252", lineWidth: 3 } }, { key: "upper", type: "line", title: "Upper Band", colorKey: "upperColor", style: { color: "#00e676", lineWidth: 1 } }, { key: "lower", type: "line", title: "Lower Band", colorKey: "lowerColor", style: { color: "#e040fb", lineWidth: 1 } }, { key: "medianEma", type: "line", title: "Median EMA", colorKey: "emaColor", style: { color: "#2196f3", lineWidth: 1 } }], fills: [{ between: ["median", "medianEma"], colorUpKey: "upperColor", colorDownKey: "lowerColor", opacity: 0.9 }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t, "source", "hl2")), o2 = jt2(t, "length", 3), n2 = zt2(t, "atrMult", 2), r2 = We2(l2, o2, 50), a = vh(e.map((e2) => e2.high), e.map((e2) => e2.low), e.map((e2) => e2.close), jt2(t, "atrLength", 14));
  return { median: he(r2), upper: he(ll2(r2, a, (e2, t2) => e2 + n2 * t2)), lower: he(ll2(r2, a, (e2, t2) => e2 - n2 * t2)), medianEma: he(Nl(r2, o2)) };
} };
var nn2 = [{ label: "SMA", value: "SMA" }, { label: "EMA", value: "EMA" }, { label: "SMMA (RMA)", value: "SMMA (RMA)" }, { label: "WMA", value: "WMA" }, { label: "VWMA", value: "VWMA" }];
var rn2 = [{ lane: 1, length: 20, color: "#f6c309" }, { lane: 2, length: 50, color: "#fb9800" }, { lane: 3, length: 100, color: "#fb6500" }, { lane: 4, length: 200, color: "#f60c0c" }];
var an = { id: "ma-ribbon", name: "Moving Average Ribbon", category: "Trend", placement: "onchart", inputs: rn2.flatMap((e) => function(e2, t, l2) {
  const o2 = `MA #${e2}`;
  return [{ key: `showMa${e2}`, type: "boolean", label: o2, default: true, group: o2 }, { key: `ma${e2}Type`, type: "select", label: "Type", default: "SMA", options: nn2, group: o2 }, { key: `ma${e2}Source`, type: "source", label: "Source", default: "close", group: o2 }, { key: `ma${e2}Length`, type: "number", label: "Length", default: t, min: 1, max: 1e3, step: 1, group: o2 }, { key: `ma${e2}Color`, type: "color", label: "Color", default: l2, group: o2 }];
}(e.lane, e.length, e.color)), plots: rn2.map((e) => ({ key: `ma${e.lane}`, type: "line", title: `MA #${e.lane}`, colorKey: `ma${e.lane}Color`, style: { color: e.color, lineWidth: 1.5 } })), calc: (e, t) => {
  const l2 = e.map(tl), o2 = {};
  for (const { lane: n2, length: r2 } of rn2) {
    if (!Jt2(t, `showMa${n2}`, true)) {
      o2[`ma${n2}`] = new Array(e.length).fill(null);
      continue;
    }
    const a = gs(e, Gt2(t, `ma${n2}Source`));
    o2[`ma${n2}`] = he(Cl(Yt2(t, `ma${n2}Type`, "SMA"), a, l2, jt2(t, `ma${n2}Length`, r2)));
  }
  return o2;
} };
var sn2 = Ht2({ id: "tema", name: "Triple EMA", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "color", type: "color", label: "TEMA", default: "#2962ff" }], plots: [{ key: "tema", type: "line", title: "TEMA", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, "close"), o2 = jt2(t, "length", 9), n2 = be2(l2, o2), r2 = Nl(n2, o2), a = Nl(r2, o2);
  return { tema: he(n2.map((e2, t2) => 3 * e2 - 3 * r2[t2] + a[t2])) };
} });
var cn = { id: "twap", name: "Time Weighted Average Price", category: "Trend", placement: "onchart", inputs: [{ key: "anchor", type: "select", label: "Anchor Period", default: "session", options: [{ label: "Session", value: "session" }, { label: "Continuous", value: "continuous" }] }, { key: "source", type: "source", label: "Source", default: "ohlc4" }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "color", type: "color", label: "TWAP", default: "#dd7a28" }], plots: [{ key: "twap", type: "line", title: "TWAP", colorKey: "color", style: { color: "#dd7a28", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t, "source", "ohlc4")), o2 = "continuous" !== t.anchor ? zt(e.map((e2) => e2.time), Xt2(t)) : null, n2 = new Array(e.length).fill(NaN);
  let r2 = 0, a = 0;
  for (let t2 = 0; t2 < e.length; t2++) {
    null !== o2 && o2[t2] && (r2 = 0, a = 0);
    const e2 = l2[t2];
    Number.isFinite(e2) && (r2 += e2, a += 1, n2[t2] = r2 / a);
  }
  return { twap: he(_t2(n2, Zt2(t, "offset", 0))) };
} };
var un2 = Ht2({ id: "vwma", name: "Volume Weighted Moving Average", category: "Volume", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "color", type: "color", label: "VWMA", default: "#2962ff" }], plots: [{ key: "vwma", type: "line", title: "VWMA", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => ({ vwma: he(_t2(Ce2(gs(e, Gt2(t)), e.map(tl), jt2(t, "length", 20)), Zt2(t, "offset", 0))) }) });
var pn2 = { id: "alligator", name: "Williams Alligator", category: "Trend", placement: "onchart", inputs: [{ key: "jawLength", type: "number", label: "Jaw Length", default: 21, min: 1, max: 1e3, step: 1 }, { key: "teethLength", type: "number", label: "Teeth Length", default: 13, min: 1, max: 1e3, step: 1 }, { key: "lipsLength", type: "number", label: "Lips Length", default: 8, min: 1, max: 1e3, step: 1 }, { key: "jawOffset", type: "number", label: "Jaw Offset", default: 8, min: -500, max: 500, step: 1 }, { key: "teethOffset", type: "number", label: "Teeth Offset", default: 5, min: -500, max: 500, step: 1 }, { key: "lipsOffset", type: "number", label: "Lips Offset", default: 3, min: -500, max: 500, step: 1 }, { key: "jawColor", type: "color", label: "Jaw", default: "#2962ff" }, { key: "teethColor", type: "color", label: "Teeth", default: "#e91e63" }, { key: "lipsColor", type: "color", label: "Lips", default: "#66bb6a" }], plots: [{ key: "jaw", type: "line", title: "Jaw", colorKey: "jawColor", style: { color: "#2962ff", lineWidth: 1.5 } }, { key: "teeth", type: "line", title: "Teeth", colorKey: "teethColor", style: { color: "#e91e63", lineWidth: 1.5 } }, { key: "lips", type: "line", title: "Lips", colorKey: "lipsColor", style: { color: "#66bb6a", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, "hl2");
  return { jaw: he(_t2(ye2(l2, jt2(t, "jawLength", 21)), Zt2(t, "jawOffset", 8))), teeth: he(_t2(ye2(l2, jt2(t, "teethLength", 13)), Zt2(t, "teethOffset", 5))), lips: he(_t2(ye2(l2, jt2(t, "lipsLength", 8)), Zt2(t, "lipsOffset", 3))) };
} };
var yn2 = Ht2({ id: "smma", name: "Smoothed Moving Average", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 7, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "SMMA", default: "#673ab7" }], plots: [{ key: "smma", type: "line", title: "SMMA", colorKey: "color", style: { color: "#673ab7", lineWidth: 1.5 } }], calc: (e, t) => ({ smma: he(ye2(gs(e, Gt2(t)), jt2(t, "length", 7))) }) });
function fn2(e, t, l2) {
  const o2 = Nl(e, t);
  if (0 === l2) return o2;
  return ll2(o2, Nl(o2, t), (e2, t2) => e2 * (1 + l2) - t2 * l2);
}
var dn2 = Ht2({ id: "t3", name: "T3 Average", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 5, min: 1, max: 1e3, step: 1 }, { key: "factor", type: "number", label: "Factor", default: 0.7, min: 0, max: 1, step: 0.1 }, { key: "highlightMovements", type: "boolean", label: "Highlight Movements", default: true }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "upColor", type: "color", label: "Rising", default: "#26a69a" }, { key: "downColor", type: "color", label: "Falling", default: "#ff5252" }, { key: "neutralColor", type: "color", label: "T3", default: "#6d1e7f" }], plots: [{ key: "t3", type: "line", title: "T3", colorKey: "neutralColor", style: { color: "#6d1e7f", lineWidth: 2 }, colorBy: ({ value: e, index: t, values: l2, settings: o2 }) => {
  if (!Jt2(o2, "highlightMovements", true)) return Yt2(o2, "neutralColor", "#6d1e7f");
  const n2 = l2.t3?.[t - 1];
  return "number" == typeof n2 && Number.isFinite(n2) && e > n2 ? Yt2(o2, "upColor", "#26a69a") : Yt2(o2, "downColor", "#ff5252");
} }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), o2 = jt2(t, "length", 5), n2 = zt2(t, "factor", 0.7), r2 = fn2(l2, o2, n2), a = fn2(r2, o2, n2);
  return { t3: he(fn2(a, o2, n2)) };
} });
var mn2 = [tn2, ln, on2, an, sn2, cn, un2, pn2, yn2, dn2];
function hn2(e, t, l2) {
  const o2 = ge2(e), n2 = (e2) => Nl(Nl(e2, l2), t);
  return ll2(n2(o2), n2(o2.map((e2) => Math.abs(e2))), (e2, t2) => 100 * e2 / t2);
}
var bn2 = { id: "momentum", name: "Momentum", category: "Momentum", placement: "pane", inputs: [{ key: "len", type: "number", label: "Length", default: 10, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "MOM", default: "#2962ff" }], plots: [{ key: "mom", type: "line", title: "MOM", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => ({ mom: he(ge2(gs(e, Gt2(t)), jt2(t, "len", 10))) }) };
var gn2 = { id: "roc", name: "Rate of Change", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "ROC", default: "#2962ff" }], plots: [{ key: "roc", type: "line", title: "ROC", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => ({ roc: he(we2(gs(e, Gt2(t)), jt2(t, "length", 9))) }), levels: () => [{ price: 0, color: "#787b86", title: "Zero Line", dashed: true }] };
function wn2(e, t, l2) {
  return "SMA" === l2 ? ce2(e, t) : Nl(e, t);
}
var kn = { id: "ppo", name: "Percentage Price Oscillator", category: "Momentum", placement: "pane", inputs: [{ key: "source", type: "source", label: "Source", default: "close" }, { key: "fastLength", type: "number", label: "Fast length", default: 12, min: 1, max: 500, step: 1 }, { key: "slowLength", type: "number", label: "Slow length", default: 26, min: 1, max: 500, step: 1 }, { key: "signalLength", type: "number", label: "Signal length", default: 9, min: 1, max: 500, step: 1 }, { key: "oscType", type: "select", label: "Oscillator MA type", default: "EMA", options: [{ label: "EMA", value: "EMA" }, { label: "SMA", value: "SMA" }] }, { key: "sigType", type: "select", label: "Signal MA type", default: "EMA", options: [{ label: "EMA", value: "EMA" }, { label: "SMA", value: "SMA" }] }, { key: "histUpColor", type: "color", label: "Histogram up", default: "#26a69a" }, { key: "histUpFadeColor", type: "color", label: "Histogram up (weakening)", default: "#b2dfdb" }, { key: "histDownFadeColor", type: "color", label: "Histogram down (weakening)", default: "#ffcdd2" }, { key: "histDownColor", type: "color", label: "Histogram down", default: "#ff5252" }, { key: "ppoColor", type: "color", label: "PPO", default: "#2962ff" }, { key: "signalColor", type: "color", label: "Signal line", default: "#ff6d00" }], plots: [{ key: "hist", type: "column", title: "Histogram", colorKey: "histUpColor", style: { base: 0 }, colorBy: ({ value: e, index: t, values: l2, settings: o2 }) => {
  const n2 = l2.hist?.[t - 1], r2 = "number" == typeof n2 && Number.isFinite(n2) && e > n2;
  return e >= 0 ? r2 ? Yt2(o2, "histUpColor", "#26a69a") : Yt2(o2, "histUpFadeColor", "#b2dfdb") : r2 ? Yt2(o2, "histDownFadeColor", "#ffcdd2") : Yt2(o2, "histDownColor", "#ff5252");
} }, { key: "ppo", type: "line", title: "PPO", colorKey: "ppoColor", style: { lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal line", colorKey: "signalColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = gs(e, Gt2(t)), o2 = Yt2(t, "oscType", "EMA"), n2 = ll2(wn2(l2, jt2(t, "fastLength", 12), o2), wn2(l2, jt2(t, "slowLength", 26), o2), (e2, t2) => 0 === t2 ? NaN : 100 * (e2 - t2) / t2), r2 = wn2(n2, jt2(t, "signalLength", 9), Yt2(t, "sigType", "EMA"));
  return { hist: he(ll2(n2, r2, (e2, t2) => e2 - t2)), ppo: he(n2), signal: he(r2) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var vn2 = { id: "trix", name: "TRIX", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 18, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "TRIX", default: "#f44336" }], plots: [{ key: "trix", type: "line", title: "TRIX", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = jt2(t, "length", 18);
  return { trix: he(ge2(Nl(Nl(Nl(e.map((e2) => e2.close > 0 ? Math.log(e2.close) : NaN), l2), l2), l2)).map((e2) => 1e4 * e2)) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var Nn2 = { id: "tsi", name: "True Strength Index", category: "Momentum", placement: "pane", inputs: [{ key: "long", type: "number", label: "Long Length", default: 25, min: 1, max: 500, step: 1 }, { key: "short", type: "number", label: "Short Length", default: 13, min: 1, max: 500, step: 1 }, { key: "signal", type: "number", label: "Signal Length", default: 13, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "True Strength Index", default: "#2962ff" }, { key: "signalColor", type: "color", label: "Signal", default: "#e91e63" }], plots: [{ key: "tsi", type: "line", title: "True Strength Index", colorKey: "color", style: { lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal", colorKey: "signalColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = hn2(e.map((e2) => e2.close), jt2(t, "short", 13), jt2(t, "long", 25));
  return { tsi: he(l2), signal: he(Nl(l2, jt2(t, "signal", 13))) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] };
var Cn2 = { id: "smi-ergodic-indicator", name: "SMI Ergodic Indicator", category: "Momentum", placement: "pane", inputs: [{ key: "longlen", type: "number", label: "Long Length", default: 20, min: 1, max: 500, step: 1 }, { key: "shortlen", type: "number", label: "Short Length", default: 5, min: 1, max: 500, step: 1 }, { key: "siglen", type: "number", label: "Signal Line Length", default: 5, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "SMI", default: "#2962ff" }, { key: "signalColor", type: "color", label: "Signal", default: "#ff6d00" }], plots: [{ key: "erg", type: "line", title: "SMI", colorKey: "color", style: { lineWidth: 1.5 } }, { key: "sig", type: "line", title: "Signal", colorKey: "signalColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = hn2(e.map((e2) => e2.close), jt2(t, "shortlen", 5), jt2(t, "longlen", 20));
  return { erg: he(l2), sig: he(Nl(l2, jt2(t, "siglen", 5))) };
} };
var Mn = { id: "smi-ergodic-oscillator", name: "SMI Ergodic Oscillator", category: "Momentum", placement: "pane", inputs: [{ key: "longlen", type: "number", label: "Long Length", default: 20, min: 1, max: 500, step: 1 }, { key: "shortlen", type: "number", label: "Short Length", default: 5, min: 1, max: 500, step: 1 }, { key: "siglen", type: "number", label: "Signal Line Length", default: 5, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "SMI Ergodic Oscillator", default: "#ff5252" }], plots: [{ key: "osc", type: "histogram", title: "SMI Ergodic Oscillator", colorKey: "color", style: { base: 0 } }], calc: (e, t) => {
  const l2 = hn2(e.map((e2) => e2.close), jt2(t, "shortlen", 5), jt2(t, "longlen", 20));
  return { osc: he(ll2(l2, Nl(l2, jt2(t, "siglen", 5)), (e2, t2) => e2 - t2)) };
} };
var xn2 = { id: "smi", name: "Stochastic Momentum Index", category: "Momentum", placement: "pane", inputs: [{ key: "lengthK", type: "number", label: "%K Length", default: 10, min: 1, max: 15e3, step: 1 }, { key: "lengthD", type: "number", label: "%D Length", default: 3, min: 1, max: 4999, step: 1 }, { key: "lengthEMA", type: "number", label: "EMA Length", default: 3, min: 1, max: 4999, step: 1 }, { key: "color", type: "color", label: "SMI", default: "#2196f3" }, { key: "emaColor", type: "color", label: "SMI-based EMA", default: "#ff9800" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "smi", type: "line", title: "SMI", colorKey: "color", style: { lineWidth: 1.5 } }, { key: "ema", type: "line", title: "SMI-based EMA", colorKey: "emaColor", style: { lineWidth: 1.5 } }], fills: [{ between: ["bandHigh", "bandLow"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = jt2(t, "lengthK", 10), o2 = jt2(t, "lengthD", 3), n2 = de2(e.map((e2) => e2.high), l2), r2 = me2(e.map((e2) => e2.low), l2), a = ll2(n2, r2, (e2, t2) => e2 - t2), i2 = (e2) => Nl(Nl(e2, o2), o2), s2 = ll2(i2(e.map((e2, t2) => e2.close - (n2[t2] + r2[t2]) / 2)), i2(a), (e2, t2) => 0 === t2 ? NaN : e2 / t2 * 200);
  return { smi: he(s2), ema: he(Nl(s2, jt2(t, "lengthEMA", 3))), bandHigh: new Array(e.length).fill(40), bandLow: new Array(e.length).fill(-40) };
}, levels: () => [{ price: 40, color: "#787b86", title: "Overbought Line", dashed: true }, { price: 0, color: "#787b86", title: "Middle Line", dashed: true }, { price: -40, color: "#787b86", title: "Oversold Line", dashed: true }] };
var An2 = [bn2, gn2, kn, vn2, Nn2, Cn2, Mn, xn2];
function Sn2(e, t, l2) {
  const o2 = new Array(e.length).fill(NaN);
  let n2 = 0;
  for (; n2 < e.length; ) {
    if (!Number.isFinite(e[n2])) {
      n2 += 1;
      continue;
    }
    let r2 = n2;
    for (; r2 < e.length && Number.isFinite(e[r2]); ) r2 += 1;
    const a = l2(e.slice(n2, r2), t);
    for (let e2 = 0; e2 < a.length; e2++) o2[n2 + e2] = a[e2];
    n2 = r2;
  }
  return o2;
}
var Ln2 = (e) => "SMA" === e ? ce2 : be2;
function Bn2(e, t, l2, o2) {
  return { id: e, name: t, category: "Volume", placement: "pane", inputs: [{ key: "maLength", type: "number", label: "EMA length", default: 255, min: 1, max: 5e3, step: 1 }, { key: "color", type: "color", label: l2, default: "#2962ff" }, { key: "emaColor", type: "color", label: `${l2}-based EMA`, default: "#ff9800" }], plots: [{ key: e, type: "line", title: l2, colorKey: "color", style: { lineWidth: 1.5 } }, { key: "ema", type: "line", title: `${l2}-based EMA`, colorKey: "emaColor", style: { lineWidth: 1.5 } }], calc: (t2, l3) => {
    const n2 = function(e2, t3) {
      const l4 = new Array(e2.length);
      let o3 = 1;
      for (let n3 = 0; n3 < e2.length; n3++) {
        if (n3 > 0) {
          const l5 = e2[n3], r2 = e2[n3 - 1], a = r2.close, i2 = l5.close;
          ("falling" === t3 ? tl(l5) < tl(r2) : tl(l5) > tl(r2)) && 0 !== a && Number.isFinite(a) && Number.isFinite(i2) && (o3 *= i2 / a);
        }
        l4[n3] = 1e3 * o3;
      }
      return l4;
    }(t2, o2);
    return { [e]: he(n2), ema: he(Sn2(n2, jt2(l3, "maLength", 255), be2)) };
  } };
}
var Fn2 = Bn2("nvi", "Negative Volume Index", "NVI", "falling");
var Kn2 = Bn2("pvi", "Positive Volume Index", "PVI", "rising");
var Wn2 = { id: "pvt", name: "Price Volume Trend", category: "Volume", placement: "pane", inputs: [{ key: "color", type: "color", label: "PVT", default: "#2962ff" }], plots: [{ key: "pvt", type: "line", title: "PVT", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e) => {
  const t = new Array(e.length).fill(NaN);
  for (let l2 = 1; l2 < e.length; l2++) {
    const o2 = e[l2 - 1].close;
    0 !== o2 && Number.isFinite(o2) && (t[l2] = (e[l2].close - o2) / o2 * tl(e[l2]));
  }
  return { pvt: he(Le2(t)) };
} };
var Dn2 = { id: "pvo", name: "Percentage Volume Oscillator", category: "Volume", placement: "pane", inputs: [{ key: "fastLength", type: "number", label: "Fast length", default: 12, min: 1, max: 500, step: 1 }, { key: "slowLength", type: "number", label: "Slow length", default: 26, min: 1, max: 500, step: 1 }, { key: "signalLength", type: "number", label: "Signal length", default: 9, min: 1, max: 500, step: 1 }, { key: "oscType", type: "select", label: "Oscillator MA type", default: "EMA", options: [{ label: "EMA", value: "EMA" }, { label: "SMA", value: "SMA" }] }, { key: "sigType", type: "select", label: "Signal MA type", default: "EMA", options: [{ label: "EMA", value: "EMA" }, { label: "SMA", value: "SMA" }] }, { key: "histUpColor", type: "color", label: "Histogram up", default: "#26a69a" }, { key: "histUpFadeColor", type: "color", label: "Histogram up (weakening)", default: "#b2dfdb" }, { key: "histDownFadeColor", type: "color", label: "Histogram down (weakening)", default: "#ffcdd2" }, { key: "histDownColor", type: "color", label: "Histogram down", default: "#ff5252" }, { key: "color", type: "color", label: "PVO", default: "#2962ff" }, { key: "signalColor", type: "color", label: "Signal line", default: "#ff6d00" }], plots: [{ key: "hist", type: "column", title: "Histogram", colorKey: "histUpColor", style: { base: 0 }, colorBy: ({ value: e, index: t, values: l2, settings: o2 }) => {
  const n2 = l2.hist?.[t - 1], r2 = null != n2 && Number.isFinite(n2) && e > n2;
  return e >= 0 ? r2 ? Yt2(o2, "histUpColor", "#26a69a") : Yt2(o2, "histUpFadeColor", "#b2dfdb") : r2 ? Yt2(o2, "histDownFadeColor", "#ffcdd2") : Yt2(o2, "histDownColor", "#ff5252");
} }, { key: "pvo", type: "line", title: "PVO", colorKey: "color", style: { lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal line", colorKey: "signalColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = e.map(tl), n2 = Ln2(Yt2(t, "oscType", "EMA")), r2 = n2(o2, jt2(t, "fastLength", 12)), a = n2(o2, jt2(t, "slowLength", 26)), i2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < l2; e2++) 0 !== a[e2] && (i2[e2] = 100 * (r2[e2] - a[e2]) / a[e2]);
  const s2 = Sn2(i2, jt2(t, "signalLength", 9), Ln2(Yt2(t, "sigType", "EMA"))), c2 = new Array(l2);
  for (let e2 = 0; e2 < l2; e2++) c2[e2] = i2[e2] - s2[e2];
  return { hist: he(c2), pvo: he(i2), signal: he(s2) };
}, levels: () => [{ price: 0, color: "#787b8680", title: "Zero" }] };
var On2 = { id: "mass-index", name: "Mass Index", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 10, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Mass Index", default: "#2962ff" }], plots: [{ key: "mi", type: "line", title: "Mass Index", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = be2(e.map((e2) => e2.high - e2.low), 9), n2 = be2(o2, 9), r2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < l2; e2++) 0 !== n2[e2] && (r2[e2] = o2[e2] / n2[e2]);
  return { mi: he(Sn2(r2, jt2(t, "length", 10), Se2)) };
} };
var Rn2 = { id: "ulcer-index", name: "Ulcer Index", category: "Volatility", placement: "pane", inputs: [{ key: "source", type: "source", label: "Source", default: "close" }, { key: "length", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Ulcer Index", default: "#2962ff" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "ui", type: "line", title: "Ulcer Index", colorKey: "color", style: { lineWidth: 1.5 } }], fills: [{ between: ["ui", "zero"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "length", 14), n2 = gs(e, Gt2(t)), r2 = de2(n2, o2), a = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = r2[e2];
    if (!Number.isFinite(t2) || 0 === t2) continue;
    const l3 = 100 * (n2[e2] - t2) / t2;
    a[e2] = l3 * l3;
  }
  const i2 = ce2(a, o2), s2 = new Array(l2);
  for (let e2 = 0; e2 < l2; e2++) s2[e2] = Math.sqrt(i2[e2]);
  return { ui: he(s2), zero: s2.map((e2) => Number.isFinite(e2) ? 0 : null) };
}, levels: () => [{ price: 0, color: "#2196f3", title: "Zero" }] };
var Tn2 = [Fn2, Kn2, Wn2, Dn2, On2, Rn2];
function Pn2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2).fill(NaN), r2 = ce2(e, t), a = 2 / (t + 1);
  let i2 = NaN;
  for (let t2 = 0; t2 < o2; t2++) {
    const o3 = e[t2];
    if (Number.isFinite(i2)) if (Number.isFinite(o3)) i2 = o3 * a + i2 * (1 - a);
    else {
      if (!(t2 < l2)) continue;
      i2 = NaN;
    }
    else i2 = r2[t2];
    n2[t2] = i2;
  }
  return n2;
}
var Un2 = Ht2({ id: "stochastic-rsi", name: "Stochastic RSI", category: "Momentum", placement: "pane", inputs: [{ key: "smoothK", type: "number", label: "K", default: 3, min: 1, max: 100, step: 1 }, { key: "smoothD", type: "number", label: "D", default: 3, min: 1, max: 100, step: 1 }, { key: "lengthRSI", type: "number", label: "RSI Length", default: 14, min: 1, max: 500, step: 1 }, { key: "lengthStoch", type: "number", label: "Stochastic Length", default: 14, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "RSI Source", default: "close" }, { key: "kColor", type: "color", label: "K", default: "#2962ff" }, { key: "dColor", type: "color", label: "D", default: "#ff6d00" }, { key: "fillColor", type: "color", label: "Background", default: "#2196f3" }], plots: [{ key: "k", type: "line", title: "K", colorKey: "kColor", style: { lineWidth: 1.5 } }, { key: "d", type: "line", title: "D", colorKey: "dColor", style: { lineWidth: 1.5 } }], fills: [{ between: ["bandHigh", "bandLow"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = jt2(t, "lengthStoch", 14), o2 = vl(mh(gs(e, Gt2(t)), jt2(t, "lengthRSI", 14)), (e2) => Ke2(e2, e2, e2, l2)), n2 = vl(o2, (e2) => ce2(e2, jt2(t, "smoothK", 3))), r2 = vl(n2, (e2) => ce2(e2, jt2(t, "smoothD", 3)));
  return { k: he(n2), d: he(r2), bandHigh: new Array(e.length).fill(80), bandLow: new Array(e.length).fill(20) };
}, levels: () => [{ price: 80, color: "#787b86", title: "Upper Band" }, { price: 50, color: "#5a6b8c", title: "Middle Band" }, { price: 20, color: "#787b86", title: "Lower Band" }], range: () => ({ min: 0, max: 100 }) });
var $n2 = Ht2({ id: "williams-percent-r", name: "Williams Percent Range", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "%R", default: "#7e57c2" }, { key: "fillColor", type: "color", label: "Background", default: "#7e57c2" }], plots: [{ key: "percentR", type: "line", title: "%R", colorKey: "color", style: { lineWidth: 1.5 } }], fills: [{ between: ["bandHigh", "bandLow"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = jt2(t, "length", 14), o2 = gs(e, Gt2(t)), n2 = de2(e.map((e2) => e2.high), l2), r2 = me2(e.map((e2) => e2.low), l2), a = o2.map((e2, t2) => {
    const l3 = n2[t2] - r2[t2];
    return 0 === l3 ? NaN : 100 * (e2 - n2[t2]) / l3;
  });
  return { percentR: he(a), bandHigh: new Array(e.length).fill(-20), bandLow: new Array(e.length).fill(-80) };
}, levels: () => [{ price: -20, color: "#787b86", title: "Upper Band" }, { price: -50, color: "#787b86", title: "Middle Level", dashed: true }, { price: -80, color: "#787b86", title: "Lower Band" }], range: () => ({ min: -100, max: 0 }) });
var In = { id: "ultimate-oscillator", name: "Ultimate Oscillator", category: "Momentum", placement: "pane", inputs: [{ key: "length1", type: "number", label: "Fast Length", default: 7, min: 1, max: 500, step: 1 }, { key: "length2", type: "number", label: "Middle Length", default: 14, min: 1, max: 500, step: 1 }, { key: "length3", type: "number", label: "Slow Length", default: 28, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Oscillator", default: "#f44336" }], plots: [{ key: "uo", type: "line", title: "Oscillator", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = Math.max(0, l2 - 1), n2 = new Array(o2), r2 = new Array(o2);
  for (let t2 = 1; t2 < l2; t2++) {
    const l3 = e[t2 - 1].close, o3 = Math.max(e[t2].high, l3), a2 = Math.min(e[t2].low, l3);
    n2[t2 - 1] = e[t2].close - a2, r2[t2 - 1] = o3 - a2;
  }
  const a = (e2) => ll2(Se2(n2, e2), Se2(r2, e2), (e3, t2) => 0 === t2 ? NaN : e3 / t2), i2 = a(jt2(t, "length1", 7)), s2 = a(jt2(t, "length2", 14)), c2 = a(jt2(t, "length3", 28)), u2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < o2; e2++) u2[e2 + 1] = 100 * (4 * i2[e2] + 2 * s2[e2] + c2[e2]) / 7;
  return { uo: he(u2) };
} };
var En2 = { id: "relative-vigor-index", name: "Relative Vigor Index", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 10, min: 1, max: 500, step: 1 }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "rvgiColor", type: "color", label: "RVGI", default: "#008000" }, { key: "signalColor", type: "color", label: "Signal", default: "#ff0000" }], plots: [{ key: "rvgi", type: "line", title: "RVGI", colorKey: "rvgiColor", style: { lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal", colorKey: "signalColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = jt2(t, "length", 10), o2 = Fe(e.map((e2) => e2.close - e2.open)), n2 = Fe(e.map((e2) => e2.high - e2.low)), r2 = ll2(vl(o2, (e2) => Se2(e2, l2)), vl(n2, (e2) => Se2(e2, l2)), (e2, t2) => 0 === t2 ? NaN : e2 / t2), a = vl(r2, (e2) => Fe(e2)), i2 = Zt2(t, "offset", 0);
  return { rvgi: he(_t2(r2, i2)), signal: he(_t2(a, i2)) };
} };
var qn2 = { id: "relative-volatility-index", name: "Relative Volatility Index", category: "Volatility", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 10, min: 1, max: 500, step: 1 }, { key: "offset", type: "number", label: "Offset", default: 0, min: -500, max: 500, step: 1 }, { key: "color", type: "color", label: "RVI", default: "#7e57c2" }, { key: "fillColor", type: "color", label: "Background", default: "#7e57c2" }, ...Ml("RVI", "SMA", 14)], plots: [{ key: "rvi", type: "line", title: "RVI", colorKey: "color", style: { lineWidth: 1.5 } }, ...xl("RVI")], fills: [{ between: ["bbUpper", "bbLower"], colorUpKey: "bbUpperColor", colorDownKey: "bbUpperColor", opacity: 0.1 }, { between: ["bandHigh", "bandLow"], colorUpKey: "fillColor", colorDownKey: "fillColor", opacity: 0.1 }], calc: (e, t) => {
  const l2 = e.length, o2 = e.map((e2) => e2.close), n2 = fe2(o2, jt2(t, "length", 10)), r2 = ge2(o2), a = new Array(l2), i2 = new Array(l2);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = r2[e2];
    a[e2] = Number.isFinite(t2) && t2 <= 0 ? 0 : n2[e2], i2[e2] = Number.isFinite(t2) && t2 > 0 ? 0 : n2[e2];
  }
  let s2 = 0;
  for (; s2 < l2 && !Number.isFinite(n2[s2]); ) s2 += 1;
  const c2 = Pn2(a, 14, s2), u2 = Pn2(i2, 14, s2), p2 = new Array(l2).fill(NaN);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = c2[e2] + u2[e2];
    p2[e2] = 0 === t2 ? NaN : c2[e2] / t2 * 100;
  }
  return { rvi: he(_t2(p2, Zt2(t, "offset", 0))), ...Al(p2, e.map((e2) => e2.volume ?? 0), t, "SMA", 14), bandHigh: new Array(l2).fill(80), bandLow: new Array(l2).fill(20) };
}, levels: () => [{ price: 80, color: "#787b86", title: "Upper Band" }, { price: 50, color: "#5a6b8c", title: "Middle Band" }, { price: 20, color: "#787b86", title: "Lower Band" }] };
var Vn2 = { id: "woodies-cci", name: "Woodies CCI", category: "Momentum", placement: "pane", inputs: [{ key: "cciTurboLength", type: "number", label: "CCI Turbo Length", default: 6, min: 3, max: 14, step: 1 }, { key: "cci14Length", type: "number", label: "CCI 14 Length", default: 14, min: 7, max: 20, step: 1 }, { key: "upColor", type: "color", label: "Five bars up", default: "#009688" }, { key: "downColor", type: "color", label: "Five bars down", default: "#f44336" }, { key: "turboColor", type: "color", label: "CCI Turbo", default: "#009688" }, { key: "cciColor", type: "color", label: "CCI 14", default: "#f44336" }], plots: [{ key: "hist", type: "histogram", title: "CCI Turbo Histogram", colorKey: "upColor", style: { base: 0 }, colorBy: ({ index: e, values: t, settings: l2 }) => {
  const o2 = Yt2(l2, "upColor", "#009688"), n2 = Yt2(l2, "downColor", "#f44336"), r2 = (l3) => {
    const o3 = t.hist?.[e - l3];
    return "number" == typeof o3 && Number.isFinite(o3) ? o3 : null;
  };
  let a = true, i2 = true;
  for (let e2 = 1; e2 <= 5; e2 += 1) {
    const t2 = r2(e2);
    (null === t2 || t2 <= 0) && (a = false), (null === t2 || t2 >= 0) && (i2 = false);
  }
  if (a) return o2;
  if (i2) return n2;
  const s2 = r2(0);
  return null !== s2 && s2 < 0 ? o2 : n2;
} }, { key: "turbo", type: "line", title: "CCI Turbo", colorKey: "turboColor", style: { lineWidth: 1.5 } }, { key: "cci14", type: "line", title: "CCI 14", colorKey: "cciColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.map((e2) => e2.close), o2 = Oe2(l2, jt2(t, "cciTurboLength", 6)), n2 = Oe2(l2, jt2(t, "cci14Length", 14));
  return { hist: he(n2), turbo: he(o2), cci14: he(n2) };
}, levels: () => [{ price: 100, color: "#787b86", title: "Hundred Line", dashed: true }, { price: 0, color: "#787b86", title: "Zero Line" }, { price: -100, color: "#787b86", title: "Minus Line", dashed: true }] };
var Hn2 = [{ weight: 1, roc: 10, smooth: 10 }, { weight: 2, roc: 15, smooth: 10 }, { weight: 3, roc: 20, smooth: 10 }, { weight: 4, roc: 30, smooth: 15 }, { weight: 1, roc: 40, smooth: 50 }, { weight: 2, roc: 65, smooth: 65 }, { weight: 3, roc: 75, smooth: 75 }, { weight: 4, roc: 100, smooth: 100 }, { weight: 1, roc: 195, smooth: 130 }, { weight: 2, roc: 265, smooth: 130 }, { weight: 3, roc: 390, smooth: 130 }, { weight: 4, roc: 530, smooth: 195 }];
var zn2 = { id: "special-k", name: "Pring's Special K", category: "Momentum", placement: "pane", inputs: [{ key: "source", type: "source", label: "Source", default: "close" }, { key: "length1", type: "number", label: "Signal length 1", default: 100, min: 1, max: 1e3, step: 1 }, { key: "length2", type: "number", label: "Signal length 2", default: 100, min: 1, max: 1e3, step: 1 }, { key: "color", type: "color", label: "Special K", default: "#2962ff" }, { key: "signalColor", type: "color", label: "Signal", default: "#ff6d00" }], plots: [{ key: "specialK", type: "line", title: "Special K", colorKey: "color", style: { lineWidth: 1.5 } }, { key: "signal", type: "line", title: "Signal", colorKey: "signalColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = gs(e, Gt2(t)), n2 = new Array(l2).fill(0);
  for (const e2 of Hn2) {
    const t2 = vl(we2(o2, e2.roc), (t3) => ce2(t3, e2.smooth));
    for (let o3 = 0; o3 < l2; o3++) n2[o3] += e2.weight * t2[o3];
  }
  const r2 = vl(n2, (e2) => ce2(e2, jt2(t, "length1", 100))), a = vl(r2, (e2) => ce2(e2, jt2(t, "length2", 100)));
  return { specialK: he(n2), signal: he(a) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero" }] };
var jn2 = [Un2, $n2, In, En2, qn2, Vn2, zn2];
var Zn2 = { id: "vortex", name: "Vortex Indicator", category: "Trend", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 2, max: 500, step: 1 }, { key: "upColor", type: "color", label: "VI +", default: "#2962ff" }, { key: "downColor", type: "color", label: "VI -", default: "#e91e63" }], plots: [{ key: "vip", type: "line", title: "VI +", colorKey: "upColor", style: { lineWidth: 1.5 } }, { key: "vim", type: "line", title: "VI -", colorKey: "downColor", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "length", 14), n2 = new Array(l2).fill(NaN), r2 = new Array(l2).fill(NaN);
  if (0 === l2) return { vip: he(n2), vim: he(r2) };
  const a = e.map((e2) => e2.high), i2 = e.map((e2) => e2.low), s2 = e.map((e2) => e2.close), c2 = new Array(l2 - 1), u2 = new Array(l2 - 1);
  for (let e2 = 1; e2 < l2; e2++) c2[e2 - 1] = Math.abs(a[e2] - i2[e2 - 1]), u2[e2 - 1] = Math.abs(i2[e2] - a[e2 - 1]);
  const p2 = Se2(c2, o2), y2 = Se2(u2, o2), f2 = Se2(gh(a, i2, s2), o2);
  for (let e2 = 1; e2 < l2; e2++) n2[e2] = p2[e2 - 1] / f2[e2], r2[e2] = y2[e2 - 1] / f2[e2];
  return { vip: he(n2), vim: he(r2) };
} };
var Yn2 = { id: "volatility-stop", name: "Volatility Stop", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 2, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "factor", type: "number", label: "Multiplier", default: 2, min: 0.25, max: 20, step: 0.25 }, { key: "upColor", type: "color", label: "Uptrend", default: "#009688" }, { key: "downColor", type: "color", label: "Downtrend", default: "#f44336" }], plots: [{ key: "up", type: "line", title: "Volatility Stop Up", colorKey: "upColor", style: { markersOnly: true, markerRadius: 1.5 } }, { key: "down", type: "line", title: "Volatility Stop Down", colorKey: "downColor", style: { markersOnly: true, markerRadius: 1.5 } }], calc: (e, t) => {
  const l2 = e.length, o2 = new Array(l2).fill(null), n2 = new Array(l2).fill(null);
  if (0 === l2) return { up: o2, down: n2 };
  const r2 = gs(e, Gt2(t)), a = zt2(t, "factor", 2), i2 = e.map((e2) => e2.high), s2 = e.map((e2) => e2.low), c2 = e.map((e2) => e2.close), u2 = vh(i2, s2, c2, jt2(t, "length", 20)), p2 = gh(i2, s2, c2);
  let y2 = r2[0], f2 = r2[0], d2 = true, m2 = NaN;
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = r2[e2], l3 = Number.isFinite(u2[e2]) ? u2[e2] * a : p2[e2];
    y2 = Math.max(y2, t2), f2 = Math.min(f2, t2);
    let i3 = d2 ? Math.max(m2, y2 - l3) : Math.min(m2, f2 + l3);
    Number.isFinite(i3) || (i3 = t2);
    const s3 = t2 - i3 >= 0;
    e2 > 0 && s3 !== d2 && (y2 = t2, f2 = t2, i3 = s3 ? y2 - l3 : f2 + l3), d2 = s3, m2 = i3, Number.isFinite(i3) && (s3 ? o2[e2] = i3 : n2[e2] = i3);
  }
  return { up: o2, down: n2 };
} };
var Jn2 = { id: "trend-strength-index", name: "Trend Strength Index", category: "Trend", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 14, min: 2, max: 500, step: 1 }, { key: "color", type: "color", label: "Trend Strength Index", default: "#7e57c2" }, { key: "bullishColor", type: "color", label: "Bullish Color", default: "#089981" }, { key: "bearishColor", type: "color", label: "Bearish Color", default: "#f23645" }], plots: [{ key: "tsi", type: "line", title: "Trend Strength Index", colorKey: "color", style: { lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = e.map((e2, t2) => t2);
  return { tsi: he(De2(e.map((e2) => e2.close), l2, jt2(t, "length", 14))) };
}, levels: (e) => [{ price: 1, color: Yt2(e, "bullishColor", "#089981"), title: "TSI Bullish Band" }, { price: 0, color: "#787b86", title: "TSI Middle Band", dashed: true }, { price: -1, color: Yt2(e, "bearishColor", "#f23645"), title: "TSI Bearish Band" }], range: () => ({ min: -1, max: 1 }) };
function Gn2(e, t, l2, o2) {
  const n2 = e[t];
  if (!Number.isFinite(n2)) return false;
  const r2 = (t2) => t2 >= 0 && t2 < e.length && Number.isFinite(e[t2]) && (o2 ? e[t2] < n2 : e[t2] > n2), a = (t2) => t2 >= 0 && t2 < e.length && Number.isFinite(e[t2]) && (o2 ? e[t2] <= n2 : e[t2] >= n2);
  for (let e2 = 1; e2 <= l2; e2++) if (!r2(t + e2)) return false;
  for (let e2 = 0; e2 <= 4; e2++) {
    let o3 = true;
    for (let l3 = 1; l3 <= e2 && o3; l3++) a(t - l3) || (o3 = false);
    for (let n3 = 1; n3 <= l2 && o3; n3++) r2(t - e2 - n3) || (o3 = false);
    if (o3) return true;
  }
  return false;
}
var Xn = { id: "williams-fractals", name: "Williams Fractals", category: "Trend", placement: "onchart", inputs: [{ key: "periods", type: "number", label: "Periods", default: 2, min: 2, max: 100, step: 1 }, { key: "showUp", type: "boolean", label: "Show Up Fractals", default: true }, { key: "showDown", type: "boolean", label: "Show Down Fractals", default: true }, { key: "upColor", type: "color", label: "Up Fractal", default: "#009688" }, { key: "downColor", type: "color", label: "Down Fractal", default: "#f44336" }], plots: [{ key: "fractals", type: "line", title: "Fractals", colorKey: "upColor" }], calc: (e, t) => {
  const l2 = e.length, o2 = new Array(l2).fill(null), n2 = new Array(l2).fill(null), r2 = new Array(l2).fill(null), a = { fractals: o2, upFractal: n2, downFractal: r2 };
  if (0 === l2) return a;
  const i2 = Math.max(2, jt2(t, "periods", 2)), s2 = e.map((e2) => e2.high), c2 = e.map((e2) => e2.low), u2 = Jt2(t, "showUp", true), p2 = Jt2(t, "showDown", true);
  for (let e2 = 0; e2 < l2; e2++) u2 && Gn2(s2, e2, i2, true) && (n2[e2] = s2[e2]), p2 && Gn2(c2, e2, i2, false) && (r2[e2] = c2[e2]);
  return a;
}, markers: ({ bars: e, values: t, settings: l2 }) => {
  const o2 = t.upFractal ?? [], n2 = t.downFractal ?? [], r2 = Yt2(l2, "upColor", "#009688"), a = Yt2(l2, "downColor", "#f44336"), i2 = [];
  for (let t2 = 0; t2 < e.length; t2++) {
    const l3 = o2[t2];
    null != l3 && i2.push({ time: e[t2].time, position: "atPrice", price: l3, shape: "triangleUp", size: "small", color: r2 });
    const s2 = n2[t2];
    null != s2 && i2.push({ time: e[t2].time, position: "atPrice", price: s2, shape: "triangleDown", size: "small", color: a });
  }
  return i2;
} };
var _n2 = { id: "rsi-divergence", name: "RSI Divergence Indicator", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "RSI Period", default: 14, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "RSI Source", default: "close" }, { key: "lbR", type: "number", label: "Pivot Lookback Right", default: 5, min: 1, max: 100, step: 1 }, { key: "lbL", type: "number", label: "Pivot Lookback Left", default: 5, min: 1, max: 100, step: 1 }, { key: "rangeUpper", type: "number", label: "Max of Lookback Range", default: 60, min: 1, max: 1e3, step: 1 }, { key: "rangeLower", type: "number", label: "Min of Lookback Range", default: 5, min: 1, max: 1e3, step: 1 }, { key: "plotBull", type: "boolean", label: "Plot Bullish", default: true }, { key: "plotHiddenBull", type: "boolean", label: "Plot Hidden Bullish", default: false }, { key: "plotBear", type: "boolean", label: "Plot Bearish", default: true }, { key: "plotHiddenBear", type: "boolean", label: "Plot Hidden Bearish", default: false }, { key: "color", type: "color", label: "RSI", default: "#2962ff" }, { key: "bullColor", type: "color", label: "Bullish", default: "#4caf50" }, { key: "bearColor", type: "color", label: "Bearish", default: "#ff5252" }], plots: [{ key: "rsi", type: "line", title: "RSI", colorKey: "color", style: { lineWidth: 2 } }], calc: (e, t) => {
  const l2 = e.length, o2 = new Array(l2).fill(null), n2 = new Array(l2).fill(null), r2 = new Array(l2).fill(null), a = new Array(l2).fill(null), i2 = mh(gs(e, Gt2(t)), jt2(t, "length", 14)), s2 = { rsi: he(i2), bull: o2, hiddenBull: n2, bear: r2, hiddenBear: a };
  if (0 === l2) return s2;
  const c2 = jt2(t, "lbR", 5), u2 = jt2(t, "lbL", 5), p2 = jt2(t, "rangeLower", 5), y2 = jt2(t, "rangeUpper", 60), f2 = false !== t.plotBull, d2 = true === t.plotHiddenBull, m2 = false !== t.plotBear, h2 = true === t.plotHiddenBear, g2 = Ue2(i2, u2, c2).map((e2) => Number.isFinite(e2)), w2 = Pe2(i2, u2, c2).map((e2) => Number.isFinite(e2)), k2 = _t2(i2, c2), v2 = _t2(e.map((e2) => e2.low), c2), N2 = _t2(e.map((e2) => e2.high), c2), C2 = Ee2(Qt2(g2, 1)), M2 = Ee2(Qt2(w2, 1)), A2 = qe2(g2, k2, 1), S2 = qe2(g2, v2, 1), L2 = qe2(w2, k2, 1), B2 = qe2(w2, N2, 1);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = e2 - c2;
    if (t2 < 0) continue;
    const l3 = k2[e2];
    if (g2[e2]) {
      const r3 = p2 <= C2[e2] && C2[e2] <= y2, a2 = l3 > A2[e2] && r3, i3 = l3 < A2[e2] && r3;
      f2 && a2 && v2[e2] < S2[e2] && (o2[t2] = l3), d2 && i3 && v2[e2] > S2[e2] && (n2[t2] = l3);
    }
    if (w2[e2]) {
      const o3 = p2 <= M2[e2] && M2[e2] <= y2, n3 = l3 < L2[e2] && o3, i3 = l3 > L2[e2] && o3;
      m2 && n3 && N2[e2] > B2[e2] && (r2[t2] = l3), h2 && i3 && N2[e2] < B2[e2] && (a[t2] = l3);
    }
  }
  return s2;
}, markers: ({ bars: e, values: t, settings: l2 }) => {
  const o2 = Yt2(l2, "bullColor", "#4caf50"), n2 = Yt2(l2, "bearColor", "#ff5252"), r2 = [{ col: t.bull, shape: "labelUp", text: "Bull", color: o2 }, { col: t.hiddenBull, shape: "labelUp", text: "H Bull", color: o2 }, { col: t.bear, shape: "labelDown", text: "Bear", color: n2 }, { col: t.hiddenBear, shape: "labelDown", text: "H Bear", color: n2 }], a = [];
  for (let t2 = 0; t2 < e.length; t2++) for (const l3 of r2) {
    const o3 = l3.col?.[t2];
    null != o3 && a.push({ time: e[t2].time, position: "atPrice", price: o3, shape: l3.shape, size: "small", color: l3.color, text: l3.text });
  }
  return a;
}, levels: () => [{ price: 70, color: "#787b86", title: "Overbought", dashed: true }, { price: 50, color: "#787b86", title: "Middle Line", dashed: true }, { price: 30, color: "#787b86", title: "Oversold", dashed: true }], range: () => ({ min: 0, max: 100 }) };
var Qn2 = { id: "consolidation-breakout", name: "Consolidation and Breakout", category: "Trend", placement: "onchart", inputs: [{ key: "markbreakout", type: "boolean", label: "Mark Breakouts", default: true }, { key: "colorinside", type: "boolean", label: "Tint Inside Bars", default: true }, { key: "bullBreakColor", type: "color", label: "Break Up", default: "#00c853" }, { key: "bearBreakColor", type: "color", label: "Break Down", default: "#ff5252" }, { key: "insideColor", type: "color", label: "Inside Bar", default: "#000000" }, { key: "highlowColor", type: "color", label: "Range", default: "#e91e63" }], plots: [{ key: "rangeHigh", type: "line", title: "Range High", colorKey: "highlowColor", style: { lineWidth: 2 } }, { key: "rangeLow", type: "line", title: "Range Low", colorKey: "highlowColor", style: { lineWidth: 2 } }], calc: (e) => {
  const t = e.length, l2 = new Array(t).fill(NaN), o2 = new Array(t).fill(NaN), n2 = new Array(t).fill(NaN), r2 = new Array(t).fill(NaN), a = new Array(t).fill(NaN);
  let i2 = 0;
  for (let s2 = 0; s2 < t; s2++) {
    const t2 = e[s2], c2 = Math.max(t2.open, t2.close), u2 = Math.min(t2.open, t2.close), p2 = e[i2].high, y2 = e[i2].low, f2 = s2 - i2, d2 = f2 > 1 && f2 <= 250;
    d2 && c2 > p2 && (n2[s2] = p2), d2 && u2 < y2 && (r2[s2] = y2);
    const m2 = i2;
    i2 = s2 > 1 && u2 >= y2 && u2 <= p2 && c2 >= y2 && c2 <= p2 ? i2 : s2, i2 === m2 && (l2[s2] = e[i2].high, o2[s2] = e[i2].low);
    const h2 = s2 - i2;
    h2 > 0 && (a[s2] = h2);
  }
  return { rangeHigh: he(l2), rangeLow: he(o2), breakUp: he(n2), breakDown: he(r2), insideAge: he(a) };
}, markers: ({ bars: e, values: t, settings: l2 }) => {
  const o2 = [];
  if (!Jt2(l2, "markbreakout", true)) return o2;
  const n2 = t.breakUp ?? [], r2 = t.breakDown ?? [], a = Yt2(l2, "bullBreakColor", "#00c853"), i2 = Yt2(l2, "bearBreakColor", "#ff5252");
  for (let t2 = 0; t2 < e.length; t2++) null !== n2[t2] && void 0 !== n2[t2] && o2.push({ time: e[t2].time, position: "belowBar", shape: "triangleUp", size: "small", color: a }), null !== r2[t2] && void 0 !== r2[t2] && o2.push({ time: e[t2].time, position: "aboveBar", shape: "triangleDown", size: "small", color: i2 });
  return o2;
}, barColors: ({ bars: e, values: t, settings: l2 }) => {
  const o2 = t.insideAge ?? [], n2 = Yt2(l2, "insideColor", "#000000"), r2 = Jt2(l2, "colorinside", true);
  return e.map((e2, t2) => r2 && null !== o2[t2] && void 0 !== o2[t2] ? n2 : null);
} };
var er2 = [Zn2, Yn2, Jn2, Xn, _n2, Qn2];
var tr2 = (e) => new Array(e).fill(NaN);
function lr2(e) {
  const t = function(e2) {
    if (e2.length < 2) return 0;
    const t2 = [];
    for (let l2 = 1; l2 < e2.length; l2++) {
      const o2 = e2[l2].time - e2[l2 - 1].time;
      o2 > 0 && t2.push(o2);
    }
    return 0 === t2.length ? 0 : (t2.sort((e3, t3) => e3 - t3), t2[Math.floor(t2.length / 2)]);
  }(e);
  return t <= 0 || t < 86400 ? "daily" : t < 604800 ? "weekly" : "monthly";
}
var or2 = { daily: "d", weekly: "w", monthly: "m" };
var nr2 = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
var rr2 = (e, t, l2, o2) => ({ key: e, type: "line", title: t, colorKey: l2, style: { markersOnly: true, markerRadius: o2 } });
function ar2(e) {
  const t = or2[e], l2 = nr2[e], o2 = `${t}SupportColor`, n2 = `${t}ResistanceColor`, r2 = `${t}CprColor`;
  return [{ key: `${t}Pivot`, type: "line", title: `${l2} Pivot`, colorKey: `${t}PivotColor`, style: { lineWidth: 2 } }, rr2(`${t}S1`, `${l2} S1`, o2, 1), rr2(`${t}S2`, `${l2} S2`, o2, 1), rr2(`${t}S3`, `${l2} S3`, o2, 1), rr2(`${t}R1`, `${l2} R1`, n2, 1), rr2(`${t}R2`, `${l2} R2`, n2, 1), rr2(`${t}R3`, `${l2} R3`, n2, 1), rr2(`${t}Bc`, `${l2} Bottom Pivot`, r2, 2), rr2(`${t}Tc`, `${l2} Top Pivot`, r2, 2)];
}
function ir2(e) {
  const t = or2[e], l2 = nr2[e];
  return [{ key: `${t}PivotColor`, type: "color", label: "Pivot", default: "#ffeb3b", group: l2 }, { key: `${t}SupportColor`, type: "color", label: "Support", default: "#4caf50", group: l2 }, { key: `${t}ResistanceColor`, type: "color", label: "Resistance", default: "#ff5252", group: l2 }, { key: `${t}CprColor`, type: "color", label: "CPR", default: "#ff9800", group: l2 }, { key: `${t}FillColor`, type: "color", label: "CPR Fill", default: "#f47676", group: l2 }];
}
function sr2(e, t, l2, o2, n2) {
  const r2 = e.length, a = tr2(r2), i2 = tr2(r2), s2 = tr2(r2), c2 = tr2(r2), u2 = tr2(r2), p2 = tr2(r2), y2 = tr2(r2), f2 = tr2(r2), d2 = tr2(r2);
  if (l2) {
    const l3 = function(e2, t2, l4) {
      const o3 = e2.map((e3) => e3.time);
      return "daily" === t2 ? zt(o3, l4) : Et(o3, nl("weekly" === t2 ? "week" : "month", l4));
    }(e, t, n2);
    let m3 = NaN, h2 = NaN, b2 = NaN, g2 = NaN, w2 = NaN, k2 = NaN;
    for (let t2 = 0; t2 < r2; t2++) {
      l3[t2] && (m3 = g2, h2 = w2, b2 = k2);
      const n3 = e[t2], r3 = Number.isFinite(n3.high) ? n3.high : NaN, v2 = Number.isFinite(n3.low) ? n3.low : NaN, N2 = 0 === t2 || l3[t2];
      if (g2 = N2 ? r3 : Math.max(g2, r3), w2 = N2 ? v2 : Math.min(w2, v2), k2 = n3.close, !Number.isFinite(m3) || !Number.isFinite(h2) || !Number.isFinite(b2)) continue;
      const C2 = (m3 + h2 + b2) / 3, M2 = m3 - h2, x2 = 2 * C2 - m3, A2 = 2 * C2 - h2, S2 = (m3 + h2) / 2;
      o2.pivot && (a[t2] = C2), o2.support && (o2.s1r1 && (i2[t2] = x2), s2[t2] = C2 - M2, c2[t2] = x2 - M2), o2.resistance && (o2.s1r1 && (u2[t2] = A2), p2[t2] = C2 + M2, y2[t2] = A2 + M2), o2.cpr && (f2[t2] = S2, d2[t2] = 2 * C2 - S2);
    }
  }
  const m2 = or2[t];
  return { [`${m2}Pivot`]: he(a), [`${m2}S1`]: he(i2), [`${m2}S2`]: he(s2), [`${m2}S3`]: he(c2), [`${m2}R1`]: he(u2), [`${m2}R2`]: he(p2), [`${m2}R3`]: he(y2), [`${m2}Bc`]: he(f2), [`${m2}Tc`]: he(d2) };
}
var cr2 = { id: "cpr", name: "CPR with Floor Pivot", category: "Trend", placement: "onchart", inputs: [{ key: "pivotMode", type: "select", label: "Select Pivot Mode", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "Manual", value: "manual" }] }, { key: "showDaily", type: "boolean", label: "Show Daily CPR (Manual)", default: true }, { key: "showWeekly", type: "boolean", label: "Show Weekly CPR (Manual)", default: false }, { key: "showMonthly", type: "boolean", label: "Show Monthly CPR (Manual)", default: false }, { key: "displaypivots", type: "boolean", label: "Plot Pivot", default: true }, { key: "displaysupport", type: "boolean", label: "Plot Support", default: true }, { key: "displayresistance", type: "boolean", label: "Plot Resistance", default: true }, { key: "displaycpr", type: "boolean", label: "Plot CPR", default: true }, { key: "displayS1R1", type: "boolean", label: "Plot S1 / R1", default: false }, ...ir2("daily"), ...ir2("weekly"), ...ir2("monthly")], plots: [...ar2("daily"), ...ar2("weekly"), ...ar2("monthly")], fills: ["daily", "weekly", "monthly"].map((e) => {
  const t = or2[e];
  return { between: [`${t}Tc`, `${t}Bc`], colorUpKey: `${t}FillColor`, colorDownKey: `${t}FillColor`, opacity: 0.48 };
}), calc: (e, t) => {
  const l2 = "manual" === t.pivotMode, o2 = lr2(e), n2 = { pivot: Jt2(t, "displaypivots", true), support: Jt2(t, "displaysupport", true), resistance: Jt2(t, "displayresistance", true), cpr: Jt2(t, "displaycpr", true), s1r1: Jt2(t, "displayS1R1", false) }, r2 = l2 ? { daily: Jt2(t, "showDaily", true), weekly: Jt2(t, "showWeekly", false), monthly: Jt2(t, "showMonthly", false) } : { daily: "daily" === o2, weekly: "weekly" === o2, monthly: "monthly" === o2 }, a = Xt2(t);
  return { ...sr2(e, "daily", r2.daily, n2, a), ...sr2(e, "weekly", r2.weekly, n2, a), ...sr2(e, "monthly", r2.monthly, n2, a) };
} };
var ur2 = { id: "alphatrend", name: "AlphaTrend", category: "Trend", placement: "onchart", inputs: [{ key: "coeff", type: "number", label: "Multiplier", default: 1, min: 0, max: 20, step: 0.1 }, { key: "AP", type: "number", label: "Common Period", default: 14, min: 1, max: 500, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "showsignalsk", type: "boolean", label: "Show Signals", default: true }, { key: "novolumedata", type: "boolean", label: "Change calculation (no volume data)", default: false }, { key: "color", type: "color", label: "AlphaTrend", default: "#0022fc" }, { key: "lagColor", type: "color", label: "AlphaTrend Lag", default: "#fc0400" }, { key: "risingFillColor", type: "color", label: "Rising Fill", default: "#00e60f" }, { key: "fallingFillColor", type: "color", label: "Falling Fill", default: "#80000b" }, { key: "buyColor", type: "color", label: "Buy", default: "#0022fc" }, { key: "sellColor", type: "color", label: "Sell", default: "#880e4f" }], plots: [{ key: "alphatrend", type: "line", title: "AlphaTrend", colorKey: "color", style: { lineWidth: 3 } }, { key: "lagged", type: "line", title: "AlphaTrend Lag", colorKey: "lagColor", style: { lineWidth: 3 } }], fills: [{ between: ["alphatrend", "lagged"], colorUpKey: "risingFillColor", colorDownKey: "fallingFillColor", opacity: 1 }], markers: ({ bars: e, values: t, settings: l2 }) => {
  if (false === l2.showsignalsk) return [];
  const o2 = t.buySignal ?? [], n2 = t.sellSignal ?? [], r2 = [];
  for (let t2 = 0; t2 < e.length; t2++) {
    const a = o2[t2];
    if (null != a) {
      r2.push({ time: e[t2].time, position: "atPrice", price: a, shape: "labelUp", size: "tiny", color: Yt2(l2, "buyColor", "#0022fc"), text: "BUY" });
      continue;
    }
    const i2 = n2[t2];
    null != i2 && r2.push({ time: e[t2].time, position: "atPrice", price: i2, shape: "labelDown", size: "tiny", color: Yt2(l2, "sellColor", "#880e4f"), text: "SELL" });
  }
  return r2;
}, calc: (e, t) => {
  const l2 = e.length, o2 = tr2(l2), n2 = tr2(l2), r2 = tr2(l2);
  if (0 === l2) return { alphatrend: [], lagged: [], buySignal: [], sellSignal: [] };
  const a = jt2(t, "AP", 14), i2 = zt2(t, "coeff", 1), s2 = true === t.novolumedata, c2 = false !== t.showsignalsk, u2 = e.map((e2) => e2.high), p2 = e.map((e2) => e2.low), y2 = e.map((e2) => e2.close), f2 = _2(gh(u2, p2, y2), a), d2 = s2 ? mh(gs(e, Gt2(t)), a) : function(e2, t2, l3) {
    const o3 = e2.length, n3 = new Array(o3).fill(0), r3 = new Array(o3).fill(0);
    for (let l4 = 1; l4 < o3; l4++) {
      const o4 = e2[l4] * t2[l4];
      e2[l4] > e2[l4 - 1] ? n3[l4] = o4 : e2[l4] < e2[l4 - 1] && (r3[l4] = o4);
    }
    return Te2(n3, r3, l3);
  }(e.map((e2) => (e2.high + e2.low + e2.close) / 3), e.map((e2) => e2.volume ?? 0), a);
  for (let t2 = 0; t2 < l2; t2++) {
    const l3 = t2 > 0 && Number.isFinite(o2[t2 - 1]) ? o2[t2 - 1] : 0;
    if (!Number.isFinite(f2[t2]) || !Number.isFinite(d2[t2])) continue;
    const n3 = f2[t2] * i2;
    o2[t2] = d2[t2] >= 50 ? Math.max(e[t2].low - n3, l3) : Math.min(e[t2].high + n3, l3);
  }
  const m2 = _t2(o2, 2), h2 = z2(o2, m2), g2 = j2(o2, m2);
  if (c2) {
    const e2 = Qt2(h2, 1), t2 = Qt2(g2, 1), o3 = Ee2(h2), a2 = Ee2(g2), i3 = Ee2(e2), s3 = Ee2(t2);
    for (let e3 = 0; e3 < l2; e3++) h2[e3] && i3[e3] > a2[e3] ? n2[e3] = 0.9999 * m2[e3] : g2[e3] && s3[e3] > o3[e3] && (r2[e3] = 1.0001 * m2[e3]);
  }
  return { alphatrend: he(o2), lagged: he(m2), buySignal: he(n2), sellSignal: he(r2) };
} };
var pr2 = { id: "range-analysis", name: "Range Analysis", category: "Volatility", placement: "pane", inputs: [{ key: "showAverage", type: "boolean", label: "Show Average Range", default: false }, { key: "avgLength", type: "number", label: "Average Length", default: 3, min: 1, max: 500, step: 1 }, { key: "color", type: "color", label: "Range", default: "#ff5252" }, { key: "avgColor", type: "color", label: "Average Range", default: "#2196f3" }], plots: [{ key: "range", type: "histogram", title: "Range", colorKey: "color", style: { lineWidth: 3, base: 0 } }, { key: "avgRange", type: "line", title: "Average Range", colorKey: "avgColor", style: { lineWidth: 2 } }], calc: (e, t) => {
  const l2 = e.map((e2) => e2.high - e2.low);
  return true !== t.showAverage ? { range: he(l2), avgRange: new Array(e.length).fill(null) } : { range: he(l2), avgRange: he(ce2(l2, jt2(t, "avgLength", 3))) };
} };
var yr = [cr2, ur2, pr2];
var fr2 = (e) => /^#[0-9a-f]{6}$/i.test(e) ? `${e}99` : e;
var dr2 = { id: "wavetrend", name: "WaveTrend Pro", category: "Momentum", placement: "pane", inputs: [{ key: "source", type: "source", label: "Source", default: "hlc3", group: "WaveTrend" }, { key: "n1", type: "number", label: "Channel Length", default: 10, min: 1, max: 500, step: 1, group: "WaveTrend" }, { key: "n2", type: "number", label: "Average Length", default: 21, min: 1, max: 500, step: 1, group: "WaveTrend" }, { key: "sigLen", type: "number", label: "Signal Smoothing", default: 4, min: 1, max: 100, step: 1, group: "WaveTrend" }, { key: "wt1Color", type: "color", label: "WT1", default: "#2962ff", group: "WaveTrend" }, { key: "wt2Color", type: "color", label: "WT2", default: "#ff6d00", group: "WaveTrend" }, { key: "fillUpColor", type: "color", label: "WT Fill Up", default: "#4caf50", group: "WaveTrend" }, { key: "fillDownColor", type: "color", label: "WT Fill Down", default: "#ff5252", group: "WaveTrend" }, { key: "obLevel1", type: "number", label: "Overbought 1", default: 60, min: -200, max: 200, step: 1, group: "Levels" }, { key: "obLevel2", type: "number", label: "Overbought 2", default: 53, min: -200, max: 200, step: 1, group: "Levels" }, { key: "osLevel1", type: "number", label: "Oversold 1", default: -60, min: -200, max: 200, step: 1, group: "Levels" }, { key: "osLevel2", type: "number", label: "Oversold 2", default: -53, min: -200, max: 200, step: 1, group: "Levels" }, { key: "obBandColor", type: "color", label: "OB Band", default: "#ff5252", group: "Levels" }, { key: "osBandColor", type: "color", label: "OS Band", default: "#4caf50", group: "Levels" }, { key: "filterZone", type: "boolean", label: "Only show crosses inside OB/OS zones", default: true, group: "Signals" }, { key: "useInner", type: "boolean", label: "Use inner levels (53) as the zone gate", default: true, group: "Signals" }, { key: "showMom", type: "boolean", label: "Show momentum histogram (wt1 - wt2)", default: true, group: "Signals" }, { key: "momUpColor", type: "color", label: "Momentum Up", default: "#008080", group: "Signals" }, { key: "momDownColor", type: "color", label: "Momentum Down", default: "#880e4f", group: "Signals" }, { key: "buyColor", type: "color", label: "Bullish Cross", default: "#00e676", group: "Signals" }, { key: "sellColor", type: "color", label: "Bearish Cross", default: "#ff5252", group: "Signals" }, { key: "showRegDiv", type: "boolean", label: "Regular divergence", default: true, group: "Divergence" }, { key: "showHidDiv", type: "boolean", label: "Hidden divergence", default: false, group: "Divergence" }, { key: "lbL", type: "number", label: "Pivot Lookback Left", default: 3, min: 1, max: 100, step: 1, group: "Divergence" }, { key: "lbR", type: "number", label: "Pivot Lookback Right", default: 3, min: 1, max: 100, step: 1, group: "Divergence" }, { key: "rangeUpper", type: "number", label: "Max Bars Between Pivots", default: 60, min: 1, max: 1e3, step: 1, group: "Divergence" }, { key: "rangeLower", type: "number", label: "Min Bars Between Pivots", default: 5, min: 1, max: 1e3, step: 1, group: "Divergence" }, { key: "bullColor", type: "color", label: "Bullish Divergence", default: "#4caf50", group: "Divergence" }, { key: "bearColor", type: "color", label: "Bearish Divergence", default: "#ff5252", group: "Divergence" }], plots: [{ key: "mom", type: "histogram", title: "Momentum", colorKey: "momUpColor", style: { base: 0 }, colorBy: ({ value: e, settings: t }) => e >= 0 ? Yt2(t, "momUpColor", "#008080") : Yt2(t, "momDownColor", "#880e4f") }, { key: "wt1", type: "line", title: "WT1", colorKey: "wt1Color", style: { lineWidth: 2 } }, { key: "wt2", type: "line", title: "WT2", colorKey: "wt2Color", style: { lineWidth: 1 } }], fills: [{ between: ["wt1", "wt2"], colorUp: "#4caf50", colorDown: "#ff5252", colorUpKey: "fillUpColor", colorDownKey: "fillDownColor", opacity: 0.15 }, { between: ["obUpper", "obLower"], colorUp: "#ff5252", colorDown: "#ff5252", colorUpKey: "obBandColor", colorDownKey: "obBandColor", opacity: 0.08 }, { between: ["osUpper", "osLower"], colorUp: "#4caf50", colorDown: "#4caf50", colorUpKey: "osBandColor", colorDownKey: "osBandColor", opacity: 0.08 }], calc: (e, t) => {
  const l2 = e.length, o2 = jt2(t, "n1", 10), n2 = jt2(t, "n2", 21), r2 = jt2(t, "sigLen", 4), a = zt2(t, "obLevel1", 60), i2 = zt2(t, "obLevel2", 53), s2 = zt2(t, "osLevel1", -60), c2 = zt2(t, "osLevel2", -53), u2 = new Array(l2).fill(null), p2 = new Array(l2).fill(null), y2 = new Array(l2).fill(null), f2 = new Array(l2).fill(null), d2 = new Array(l2).fill(null), m2 = new Array(l2).fill(null), h2 = gs(e, Gt2(t, "source", "hlc3")), g2 = vl(h2, (e2) => be2(e2, o2)), w2 = vl(ll2(h2, g2, (e2, t2) => Math.abs(e2 - t2)), (e2) => be2(e2, o2)), k2 = vl(h2.map((e2, t2) => {
    const l3 = w2[t2];
    return Number.isFinite(l3) ? 0 === l3 ? 0 : (e2 - g2[t2]) / (0.015 * l3) : NaN;
  }), (e2) => be2(e2, n2)), v2 = vl(k2, (e2) => _2(e2, r2)), N2 = ll2(k2, v2, (e2, t2) => e2 - t2), C2 = { wt1: he(k2), wt2: he(v2), mom: false === t.showMom ? new Array(l2).fill(null) : he(N2), obUpper: el(l2, a), obLower: el(l2, i2), osUpper: el(l2, c2), osLower: el(l2, s2), buy: u2, sell: p2, bull: y2, bear: f2, hiddenBull: d2, hiddenBear: m2 }, M2 = false !== t.filterZone, x2 = false !== t.useInner, A2 = x2 ? i2 : a, S2 = x2 ? c2 : s2;
  for (let e2 = 1; e2 < l2; e2++) {
    const t2 = k2[e2 - 1], l3 = v2[e2 - 1], o3 = k2[e2], n3 = v2[e2];
    Number.isFinite(t2) && Number.isFinite(l3) && (Number.isFinite(o3) && Number.isFinite(n3) && (o3 > n3 && t2 <= l3 && (!M2 || n3 <= S2) && (u2[e2] = n3), o3 < n3 && t2 >= l3 && (!M2 || n3 >= A2) && (p2[e2] = n3)));
  }
  const L2 = jt2(t, "lbL", 3), B2 = jt2(t, "lbR", 3), F2 = jt2(t, "rangeLower", 5), K3 = jt2(t, "rangeUpper", 60), W = false !== t.showRegDiv, D = true === t.showHidDiv, O2 = Ue2(v2, L2, B2).map((e2) => Number.isFinite(e2)), R2 = Pe2(v2, L2, B2).map((e2) => Number.isFinite(e2)), T2 = _t2(v2, B2), P2 = _t2(e.map((e2) => e2.low), B2), U2 = _t2(e.map((e2) => e2.high), B2), $2 = Ee2(Qt2(O2, 1)), I2 = Ee2(Qt2(R2, 1)), E2 = qe2(O2, T2, 1), q2 = qe2(O2, P2, 1), V2 = qe2(R2, T2, 1), H3 = qe2(R2, U2, 1);
  for (let e2 = 0; e2 < l2; e2++) {
    const t2 = e2 - B2;
    if (t2 < 0) continue;
    const l3 = T2[e2];
    if (O2[e2]) {
      const o3 = F2 <= $2[e2] && $2[e2] <= K3;
      W && o3 && l3 > E2[e2] && P2[e2] < q2[e2] && (y2[t2] = l3), D && o3 && l3 < E2[e2] && P2[e2] > q2[e2] && (d2[t2] = l3);
    }
    if (R2[e2]) {
      const o3 = F2 <= I2[e2] && I2[e2] <= K3;
      W && o3 && l3 < V2[e2] && U2[e2] > H3[e2] && (f2[t2] = l3), D && o3 && l3 > V2[e2] && U2[e2] < H3[e2] && (m2[t2] = l3);
    }
  }
  return C2;
}, markers: ({ bars: e, values: t, settings: l2 }) => {
  const o2 = Yt2(l2, "bullColor", "#4caf50"), n2 = Yt2(l2, "bearColor", "#ff5252"), r2 = [{ col: t.buy, shape: "circle", size: "tiny", color: Yt2(l2, "buyColor", "#00e676"), text: void 0 }, { col: t.sell, shape: "circle", size: "tiny", color: Yt2(l2, "sellColor", "#ff5252"), text: void 0 }, { col: t.bull, shape: "labelUp", size: "small", color: o2, text: "R" }, { col: t.bear, shape: "labelDown", size: "small", color: n2, text: "R" }, { col: t.hiddenBull, shape: "labelUp", size: "small", color: fr2(o2), text: "H" }, { col: t.hiddenBear, shape: "labelDown", size: "small", color: fr2(n2), text: "H" }], a = [];
  for (let t2 = 0; t2 < e.length; t2++) for (const l3 of r2) {
    const o3 = l3.col?.[t2];
    if (null == o3) continue;
    const n3 = { time: e[t2].time, position: "atPrice", price: o3, shape: l3.shape, size: l3.size, color: l3.color };
    void 0 !== l3.text && (n3.text = l3.text), a.push(n3);
  }
  return a;
}, levels: (e) => [{ price: zt2(e, "obLevel1", 60), color: Yt2(e, "obBandColor", "#ff5252"), title: "Overbought 1", dashed: true }, { price: zt2(e, "obLevel2", 53), color: Yt2(e, "obBandColor", "#ff5252"), title: "Overbought 2", dashed: true }, { price: 0, color: "#787b86", title: "Zero", dashed: true }, { price: zt2(e, "osLevel2", -53), color: Yt2(e, "osBandColor", "#4caf50"), title: "Oversold 2", dashed: true }, { price: zt2(e, "osLevel1", -60), color: Yt2(e, "osBandColor", "#4caf50"), title: "Oversold 1", dashed: true }] };
var mr2 = [dr2];
var hr2 = "#089981";
var br2 = "#F23745";
var gr2 = "#787b86";
var wr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function kr2(e, t) {
  let l2 = e;
  if (/^#[0-9a-f]{3}$/i.test(l2)) l2 = `#${l2[1]}${l2[1]}${l2[2]}${l2[2]}${l2[3]}${l2[3]}`;
  else if (/^#[0-9a-f]{8}$/i.test(l2)) l2 = l2.slice(0, 7);
  else if (!/^#[0-9a-f]{6}$/i.test(l2)) return e;
  return `${l2}${Math.round(255 * Math.min(1, Math.max(0, t))).toString(16).padStart(2, "0")}`;
}
var vr2 = kr2(gr2, 0.2);
var Nr = kr2(gr2, 0.5);
function Cr2(e, t, l2, o2) {
  if (null === e || !Number.isFinite(e)) return;
  return kr2(e >= 0 ? l2 : o2, 0.1 + 0.4 * (t > 0 ? Math.min(1, Math.abs(e) / t) : 1));
}
var Mr2 = (e) => `${e.toFixed(2)}%`;
var xr = (e, t) => 100 * e + t;
function Ar2(e, t) {
  const l2 = function(e2, t2) {
    const l3 = [];
    let o3 = null, n3 = 0, a2 = 0;
    for (const i3 of e2) if (null === o3 || i3.time < n3 || i3.time >= a2) {
      const e3 = mt(i3.time, t2);
      o3 = { year: e3.year, month: e3.month, last: i3.close }, l3.push(o3), n3 = It(e3.year, e3.month, 1, 0, 0, 0, t2), a2 = It(e3.year, e3.month + 1, 1, 0, 0, 0, t2);
    } else o3.last = i3.close;
    return l3;
  }(e, Xt2(t)), o2 = Math.round(zt2(t, "startYear", 2015)), n2 = function(e2) {
    const t2 = /* @__PURE__ */ new Set();
    for (const l3 of e2.split(",")) {
      const e3 = l3.replace(/[\s-]/g, "");
      if (!/^\d{6}$/.test(e3)) continue;
      const o3 = Number(e3), n3 = o3 % 100;
      n3 >= 1 && n3 <= 12 && t2.add(o3);
    }
    return t2;
  }(Yt2(t, "ignoredMonths", "")), a = l2.length > 0 ? l2[l2.length - 1] : null;
  null !== a && n2.add(xr(a.year, a.month));
  const i2 = [], c2 = /* @__PURE__ */ new Map();
  for (let e2 = 1; e2 < l2.length; e2++) {
    const t2 = l2[e2], r2 = l2[e2 - 1];
    if (t2.year < o2 || n2.has(xr(t2.year, t2.month))) continue;
    if (!Number.isFinite(r2.last) || !Number.isFinite(t2.last) || 0 === r2.last) continue;
    const a2 = 100 * (t2.last - r2.last) / Math.abs(r2.last);
    if (!Number.isFinite(a2)) continue;
    let s2 = c2.get(t2.year);
    void 0 === s2 && (s2 = new Array(12).fill(null), c2.set(t2.year, s2), i2.push(t2.year)), s2[t2.month - 1] = a2;
  }
  return { years: i2, byYear: c2, skipped: n2 };
}
function Sr2(e, t) {
  const l2 = [];
  for (const o2 of e.years) {
    const n2 = e.byYear.get(o2)?.[t];
    null != n2 && l2.push(n2);
  }
  return l2;
}
var Lr2 = (e) => {
  if (0 === e.length) return null;
  let t = 0;
  for (const l3 of e) t += l3;
  const l2 = t / e.length;
  return Number.isFinite(l2) ? l2 : null;
};
function Br(e) {
  if (e.length < 2) return null;
  const t = Lr2(e);
  if (null === t) return null;
  let l2 = 0;
  for (const o3 of e) l2 += (o3 - t) * (o3 - t);
  const o2 = Math.sqrt(l2 / (e.length - 1));
  return Number.isFinite(o2) ? o2 : null;
}
var Fr = (e) => {
  if (0 === e.length) return null;
  let t = 0;
  for (const l2 of e) l2 >= 0 && (t += 1);
  return 100 * t / e.length;
};
var Kr2 = { Left: "bottom-left", Center: "bottom-center", Right: "bottom-right" };
var Wr2 = [52, ...new Array(12).fill(46)];
var Dr2 = (e) => ({ text: e, bgColor: vr2 });
var Or2 = { id: "seasonality", name: "Seasonality", category: "Trend", placement: "pane", inputs: [{ key: "startYear", type: "number", label: "Starting year", default: 2015, min: 1800, max: 2999, step: 1 }, { key: "posColor", type: "color", label: "Positive Color", default: hr2, group: "Color settings" }, { key: "negColor", type: "color", label: "Negative Color", default: br2, group: "Color settings" }, { key: "cutoffPercent", type: "number", label: "Color intensity cutoff (%)", default: 10, min: 0, max: 100, step: 1, group: "Color settings" }, { key: "tablePosition", type: "select", label: "Table Position", default: "Center", options: [{ label: "Left", value: "Left" }, { label: "Center", value: "Center" }, { label: "Right", value: "Right" }], group: "Heatmap settings" }, { key: "tableWidth", type: "number", label: "Table Width (%)", default: 100, min: 0, max: 100, step: 1, group: "Heatmap settings" }, { key: "tableHeight", type: "number", label: "Table Height (%)", default: 95, min: 0, max: 100, step: 1, group: "Heatmap settings" }, { key: "showAvg", type: "boolean", label: "Show Averages", default: true, group: "Heatmap settings" }, { key: "showStDev", type: "boolean", label: "Show Standard Deviation", default: true, group: "Heatmap settings" }, { key: "showPos", type: "boolean", label: "Show Percent Positive", default: true, group: "Heatmap settings" }, { key: "ignoredMonths", type: "text", label: "Ignored months", default: "YYYY-MM, YYYY-MM", group: "Additional settings" }], plots: [{ key: "seasonality", type: "line", title: "Seasonality" }], calc: (e) => ({ seasonality: new Array(e.length).fill(null) }), table: ({ bars: e, settings: t }) => {
  const l2 = Ar2(e, t);
  if (0 === l2.years.length) return null;
  const o2 = zt2(t, "cutoffPercent", 10), n2 = Yt2(t, "posColor", hr2), r2 = Yt2(t, "negColor", br2), a = [[Dr2("Year"), ...wr.map(Dr2)]], i2 = [1];
  for (const e2 of l2.years) {
    const t2 = l2.byYear.get(e2) ?? [], s3 = [Dr2(String(e2))];
    for (let a2 = 0; a2 < 12; a2++) {
      if (l2.skipped.has(xr(e2, a2 + 1))) {
        s3.push({ text: "SKIP", bgColor: Nr });
        continue;
      }
      const i3 = t2[a2] ?? null;
      s3.push(null === i3 ? { text: "" } : { text: Mr2(i3), bgColor: Cr2(i3, o2, n2, r2) });
    }
    a.push(s3), i2.push(1);
  }
  const s2 = Jt2(t, "showAvg", true), c2 = Jt2(t, "showStDev", true), u2 = Jt2(t, "showPos", true);
  if (s2 || c2 || u2) {
    if (a.push(Array.from({ length: 13 }, () => ({ text: "", bgColor: vr2 }))), i2.push(0.3), s2) {
      const e2 = [Dr2("Avgs:")];
      for (let t2 = 0; t2 < 12; t2++) {
        const a2 = Lr2(Sr2(l2, t2));
        e2.push(null === a2 ? { text: "" } : { text: Mr2(a2), bgColor: Cr2(a2, o2, n2, r2) });
      }
      a.push(e2), i2.push(1);
    }
    if (c2) {
      const e2 = [Dr2("StDev:")];
      for (let t2 = 0; t2 < 12; t2++) {
        const o3 = Br(Sr2(l2, t2));
        e2.push({ text: null === o3 ? "" : o3.toFixed(2), bgColor: vr2 });
      }
      a.push(e2), i2.push(1);
    }
    if (u2) {
      const e2 = [Dr2("Pos%:")];
      for (let t2 = 0; t2 < 12; t2++) {
        const o3 = Fr(Sr2(l2, t2));
        e2.push(null === o3 ? { text: "" } : { text: `${Math.round(o3)}%`, bgColor: Cr2(o3 - 50, 50, n2, r2) });
      }
      a.push(e2), i2.push(1);
    }
  }
  return { rows: a, options: { position: Kr2[Yt2(t, "tablePosition", "Center")] ?? "bottom-center", cellWidth: Wr2, cellHeight: 18, rowWeights: i2, widthPercent: zt2(t, "tableWidth", 100), heightPercent: zt2(t, "tableHeight", 95), fontSize: 10, margin: 8 } };
} };
var Rr = [Or2];
var Tr2 = (e) => Math.floor((e - 1) / 2);
var Pr = Ht2(Ze({ id: "zlema", name: "Zero Lag EMA", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 20, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "ZLEMA", default: "#00bcd4" }], plots: [{ key: "zlema", type: "line", title: "ZLEMA", colorKey: "color", style: { color: "#00bcd4", lineWidth: 1.5 } }], calc: (e, t) => {
  const l2 = jt2(t, "length", 20), o2 = Tr2(l2), n2 = gs(e, Gt2(t));
  return { zlema: he(be2(n2.map((e2, t2) => t2 >= o2 ? e2 + (e2 - n2[t2 - o2]) : NaN), l2)) };
} }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "length", 20), i2 = Tr2(a), s2 = Gt2(l2);
  return et2(e, `${a}|${s2}`, { keys: ["zlema"], start: lt, step: (e2, l3, o3) => {
    const n3 = bs(t[l3], s2);
    o3[0] = He2(ot2(e2, l3 >= i2 ? n3 + (n3 - bs(t[l3 - i2], s2)) : NaN, a, true));
  } }, t, o2, n2, r2);
}));
function Ur2(e, t) {
  const l2 = 2 / (jt2(t, "length", 9) + 1), o2 = jt2(t, "cmoLength", 9), n2 = Gt2(t), r2 = (t2) => bs(e[t2], n2);
  return { keys: ["vidya"], start: () => ({ value: NaN }), step: (e2, t2, n3) => {
    const a = r2(t2), i2 = t2 >= o2 ? l2 * function(e3, t3, l3) {
      let o3 = 0, n4 = 0;
      for (let r4 = t3 - l3 + 1; r4 <= t3; r4++) {
        const t4 = e3(r4) - e3(r4 - 1);
        if (!Number.isFinite(t4)) return NaN;
        t4 >= 0 ? o3 += t4 : n4 -= t4;
      }
      const r3 = o3 + n4;
      return 0 === r3 ? 0 : Math.abs(o3 - n4) / r3;
    }(r2, t2, o2) : NaN, s2 = Number.isNaN(e2.value) ? a : i2 * a + (1 - i2) * e2.value;
    Number.isFinite(a) && Number.isFinite(i2) && Number.isFinite(s2) ? (e2.value = s2, n3[0] = s2) : n3[0] = null;
  } };
}
var $r2 = Ht2(Ze({ id: "vidya", name: "Variable Index Dynamic Average", category: "Trend", placement: "onchart", inputs: [{ key: "length", type: "number", label: "Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "cmoLength", type: "number", label: "CMO Length", default: 9, min: 1, max: 1e3, step: 1 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "VIDYA", default: "#ff9800" }], plots: [{ key: "vidya", type: "line", title: "VIDYA", colorKey: "color", style: { color: "#ff9800", lineWidth: 1.5 } }], calc: (e, t) => tt2(Ur2(e, t), e.length) }, (e) => (t, l2, o2, n2, r2) => et2(e, `${jt2(l2, "length", 9)}|${jt2(l2, "cmoLength", 9)}|${Gt2(l2)}`, Ur2(t, l2), t, o2, n2, r2)));
var Ir2 = Ze({ id: "elder-ray", name: "Elder-Ray Index", category: "Momentum", placement: "pane", inputs: [{ key: "length", type: "number", label: "Length", default: 13, min: 1, max: 500, step: 1 }, { key: "bullColor", type: "color", label: "Bull Power", default: "#26a69a" }, { key: "bearColor", type: "color", label: "Bear Power", default: "#ef5350" }], plots: [{ key: "bull", type: "histogram", title: "Bull Power", colorKey: "bullColor", style: { color: "#26a69a", base: 0 } }, { key: "bear", type: "histogram", title: "Bear Power", colorKey: "bearColor", style: { color: "#ef5350", base: 0 } }], calc: (e, t) => {
  const l2 = be2(gs(e, "close"), jt2(t, "length", 13));
  return { bull: he(ll2(e, l2, (e2, t2) => e2.high - t2)), bear: he(ll2(e, l2, (e2, t2) => e2.low - t2)) };
}, levels: () => [{ price: 0, color: "#787b86", title: "Zero", dashed: true }] }, (e) => (t, l2, o2, n2, r2) => {
  const a = jt2(l2, "length", 13);
  return et2(e, `${a}`, { keys: ["bull", "bear"], start: lt, step: (e2, l3, o3) => {
    const n3 = t[l3], r3 = ot2(e2, n3.close, a, true);
    o3[0] = He2(n3.high - r3), o3[1] = He2(n3.low - r3);
  } }, t, o2, n2, r2);
});
function Er(e, t, l2, o2) {
  if (e.push(t), e.length > l2 && e.shift(), e.length < l2) return NaN;
  let n2 = 1 / 0, r2 = -1 / 0;
  for (const t2 of e) {
    if (!Number.isFinite(t2)) return NaN;
    t2 < n2 && (n2 = t2), t2 > r2 && (r2 = t2);
  }
  const a = r2 - n2;
  return 0 === a ? o2 : a < 1 / 0 ? 100 * (t - n2) / a : NaN;
}
function qr2(e, t) {
  const l2 = jt2(t, "fastLength", 23), o2 = jt2(t, "slowLength", 50), n2 = jt2(t, "cycleLength", 10), r2 = zt2(t, "factor", 0.5), a = Gt2(t);
  return { keys: ["stc"], start: () => ({ fast: { run: 0, value: NaN, seeded: false, recent: [] }, slow: { run: 0, value: NaN, seeded: false, recent: [] }, macd: [], pfs: [], f1: NaN, pf: NaN, f2: NaN, stc: NaN }), step: (t2, i2, s2) => {
    const c2 = bs(e[i2], a), u2 = ot2(t2.fast, c2, l2, true) - ot2(t2.slow, c2, o2, true), p2 = Er(t2.macd, u2, n2, t2.f1);
    let y2 = NaN;
    Number.isFinite(p2) && (t2.f1 = p2, y2 = Number.isNaN(t2.pf) ? p2 : t2.pf + r2 * (p2 - t2.pf), t2.pf = y2);
    const f2 = Er(t2.pfs, y2, n2, t2.f2);
    let d2 = NaN;
    Number.isFinite(f2) && (t2.f2 = f2, d2 = Number.isNaN(t2.stc) ? f2 : t2.stc + r2 * (f2 - t2.stc), t2.stc = d2), s2[0] = He2(d2);
  } };
}
var Vr2 = Ze({ id: "schaff-trend-cycle", name: "Schaff Trend Cycle", category: "Momentum", placement: "pane", inputs: [{ key: "fastLength", type: "number", label: "Fast Length", default: 23, min: 1, max: 500, step: 1 }, { key: "slowLength", type: "number", label: "Slow Length", default: 50, min: 1, max: 500, step: 1 }, { key: "cycleLength", type: "number", label: "Cycle Length", default: 10, min: 1, max: 500, step: 1 }, { key: "factor", type: "number", label: "Smoothing Factor", default: 0.5, min: 0.01, max: 1, step: 0.01 }, { key: "source", type: "source", label: "Source", default: "close" }, { key: "color", type: "color", label: "STC", default: "#2962ff" }], plots: [{ key: "stc", type: "line", title: "STC", colorKey: "color", style: { color: "#2962ff", lineWidth: 1.5 } }], calc: (e, t) => tt2(qr2(e, t), e.length), levels: () => [{ price: 75, color: "#ef5350", title: "Upper", dashed: true }, { price: 25, color: "#26a69a", title: "Lower", dashed: true }], range: () => ({ min: 0, max: 100 }) }, (e) => (t, l2, o2, n2, r2) => et2(e, `${jt2(l2, "fastLength", 23)}|${jt2(l2, "slowLength", 50)}|${jt2(l2, "cycleLength", 10)}|${zt2(l2, "factor", 0.5)}|${Gt2(l2)}`, qr2(t, l2), t, o2, n2, r2));
var Hr2 = [Pr, $r2, Ir2, Vr2];
var zr = (e) => Math.max(0.01, zt2(e, "deviation", 5));
var jr2 = (e, t, l2) => e > 0 && 100 * e >= Math.abs(t) * l2;
function Zr2(e, t, l2, o2, n2) {
  const r2 = t.high, a = t.low;
  if (Number.isFinite(r2) && Number.isFinite(a)) if (0 === e.dir) {
    if (r2 <= e.high || (e.high = r2, e.highAt = l2), a >= e.low || (e.low = a, e.lowAt = l2), e.highAt === e.lowAt) return;
    const t2 = e.lowAt < e.highAt;
    if (!jr2(e.high - e.low, t2 ? e.low : e.high, o2)) return;
    e.dir = t2 ? 1 : -1, n2(e.lowAt, e.low), n2(e.highAt, e.high);
  } else e.dir > 0 ? r2 > e.high ? (n2(e.highAt, null), e.high = r2, e.highAt = l2, n2(l2, r2)) : jr2(e.high - a, e.high, o2) && (e.dir = -1, e.low = a, e.lowAt = l2, n2(l2, a)) : a < e.low ? (n2(e.lowAt, null), e.low = a, e.lowAt = l2, n2(l2, a)) : jr2(r2 - e.low, e.low, o2) && (e.dir = 1, e.high = r2, e.highAt = l2, n2(l2, r2));
}
var Yr2 = { key: "zigzag", type: "line", title: "ZigZag", colorKey: "color", style: { color: "#2962ff", lineWidth: 2 } };
var Jr2 = () => {
};
var Gr2 = ["solid", "dashed", "dotted"];
var Xr2 = Ze({ id: "zigzag", name: "ZigZag", category: "Trend", placement: "onchart", inputs: [{ key: "deviation", type: "number", label: "Deviation (%)", default: 5, min: 0.01, max: 100, step: 0.1 }, { key: "color", type: "color", label: "ZigZag", default: "#2962ff" }], plots: [Yr2], calc: (e, t) => {
  const l2 = new Array(e.length).fill(null), o2 = zr(t), n2 = { dir: 0, high: NaN, highAt: -1, low: NaN, lowAt: -1 }, r2 = (e2, t2) => {
    l2[e2] = t2;
  };
  for (let t2 = 0; t2 < e.length; t2++) Zr2(n2, e[t2], t2, o2, r2);
  return { zigzag: l2 };
}, draws: ({ bars: e, values: t, settings: l2 }) => {
  const o2 = t.zigzag ?? [], n2 = [];
  for (let t2 = 0; t2 < e.length; t2++) {
    const l3 = o2[t2];
    "number" == typeof l3 && Number.isFinite(l3) && n2.push({ time: e[t2].time, price: l3 });
  }
  const r2 = as(Yr2), a = Yt2(l2, r2.color, "#2962ff"), i2 = zt2(l2, r2.opacity, 100), s2 = zt2(l2, r2.width, 2), c2 = l2[r2.lineStyle], u2 = Gr2.includes(c2) ? c2 : "solid", p2 = [];
  for (let e2 = 1; e2 < n2.length; e2++) p2.push({ kind: "line", from: n2[e2 - 1], to: n2[e2], color: i2 >= 100 ? a : se(a, Math.max(0, i2) / 100), lineWidth: s2 > 0 ? s2 : 2, lineStyle: e2 < n2.length - 1 ? u2 : "dashed" === u2 ? "dotted" : "dashed" });
  return p2;
} }, function(e) {
  return (t, l2, o2, n2, r2) => {
    const a = Ye2(r2, e, t, o2), i2 = n2.zigzag;
    if (void 0 === a || void 0 === i2 || i2.length < o2) return null;
    const s2 = zr(l2), c2 = `${s2}`, u2 = Xe2(a, c2, t, o2), p2 = void 0 !== u2 ? { ...u2.state } : { dir: 0, high: NaN, highAt: -1, low: NaN, lowAt: -1 };
    if (void 0 === u2) for (let e2 = 0; e2 < o2; e2++) Zr2(p2, t[e2], e2, s2, Jr2);
    const y2 = /* @__PURE__ */ new Map();
    p2.dir >= 0 && p2.highAt >= 0 && y2.set(p2.highAt, 0 === p2.dir ? null : p2.high), p2.dir <= 0 && p2.lowAt >= 0 && y2.set(p2.lowAt, 0 === p2.dir ? null : p2.low);
    const f2 = t.length, d2 = new Array(f2 - o2).fill(null), m2 = (e2, t2) => {
      e2 >= o2 ? d2[e2 - o2] = t2 : y2.set(e2, t2);
    };
    for (let e2 = o2; e2 < f2; e2++) e2 === f2 - 1 && (a.at = { key: c2, index: e2 - 1, time: e2 > 0 ? t[e2 - 1].time : NaN, state: { ...p2 }, row: [] }), Zr2(p2, t[e2], e2, s2, m2);
    for (const [e2, t2] of y2) if (!Object.is(i2[e2] ?? null, t2)) return null;
    return a.misses = 0, { zigzag: d2 };
  };
});
function _r2(e, t, l2) {
  const o2 = e.length, n2 = new Array(o2 - l2).fill(null), r2 = new Array(o2 - l2).fill(null);
  if (0 === o2) return { high: n2, low: r2 };
  const a = (l3) => bt(e[l3].time, t), s2 = a(0);
  let c2 = o2;
  for (; c2 > l2 && a(c2 - 1) - 364 >= s2; ) c2--;
  if (c2 === o2) return { high: n2, low: r2 };
  let u2 = c2;
  const p2 = a(c2) - 364;
  for (; u2 > 0 && a(u2 - 1) > p2; ) u2--;
  const y2 = [], f2 = [], d2 = [];
  let m2 = 0, h2 = 0;
  for (let t2 = u2; t2 < o2; t2++) {
    const o3 = e[t2];
    if (y2.push(a(t2)), Number.isFinite(o3.high)) {
      for (; f2.length > m2 && e[f2[f2.length - 1]].high <= o3.high; ) f2.pop();
      f2.push(t2);
    }
    if (Number.isFinite(o3.low)) {
      for (; d2.length > h2 && e[d2[d2.length - 1]].low >= o3.low; ) d2.pop();
      d2.push(t2);
    }
    if (t2 < c2) continue;
    const i2 = y2[t2 - u2] - 364;
    for (; m2 < f2.length && y2[f2[m2] - u2] <= i2; ) m2++;
    for (; h2 < d2.length && y2[d2[h2] - u2] <= i2; ) h2++;
    m2 < f2.length && (n2[t2 - l2] = e[f2[m2]].high), h2 < d2.length && (r2[t2 - l2] = e[d2[h2]].low);
  }
  return { high: n2, low: r2 };
}
var Qr2 = Ze({ id: "high-low-52-week", name: "52 Week High/Low", category: "Trend", placement: "onchart", inputs: [{ key: "highColor", type: "color", label: "52W High", default: "#26a69a" }, { key: "lowColor", type: "color", label: "52W Low", default: "#ef5350" }], plots: [{ key: "high", type: "step", title: "52W High", colorKey: "highColor", style: { color: "#26a69a", lineWidth: 1.5 } }, { key: "low", type: "step", title: "52W Low", colorKey: "lowColor", style: { color: "#ef5350", lineWidth: 1.5 } }], calc: (e, t) => _r2(e, Xt2(t), 0) }, (e) => (t, l2, o2, n2, r2) => {
  const a = Ye2(r2, e, t, o2);
  if (void 0 === a) return null;
  const i2 = Math.max(0, o2 - 1);
  return _e2(a, _r2(t, Xt2(l2), i2), o2 - i2, n2, o2);
});
var ea2 = [Xr2, Qr2];
var pa2 = [al2, sl, il, ml, cl, hl, wl, bl, gl, Sl, Ll, Bl, Fl, Kl, Wl, Dl, Ol2, Rl, Tl, Pl, $l, Il2, ql, ...po2, ...Mo2, ...Io2, ...Zo2, ...en2, ...mn2, ...An2, ...Tn2, ...jn2, ...er2, ...yr, ...mr2, ...Rr, ...Hr2, ...ea2];
var ya2 = false;
function fa2() {
  if (!ya2) {
    ya2 = true;
    for (const e of pa2) us(e);
  }
}
fa2();

// src/plugin.js
var ID = "openalgo-charts";
var ROUTE = "/openalgo-charts";
var STORAGE_ALERTS = "alerts";
var STORAGE_WEB = "webUrl";
var POLL_MS = 12e3;
var WEB_URLS = {
  tailnet: "http://100.117.110.100:5000",
  local: "http://127.0.0.1:5000"
};
var $webUrl = atom(WEB_URLS.tailnet);
var INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"];
var SOURCES = [
  { id: "binance", label: "Binance", suffix: "USDT", live: "ws" },
  { id: "hyperliquid", label: "Hyperliquid", suffix: "", live: "poll" },
  { id: "hyperliquid-testnet", label: "HL testnet", suffix: "", live: "poll" },
  { id: "aster", label: "Aster", suffix: "USDT", live: "poll" },
  { id: "aster-testnet", label: "Aster testnet", suffix: "USDT", live: "poll" }
];
var BASES = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"];
function sourceOf(id) {
  return SOURCES.find((s2) => s2.id === id) || SOURCES[0];
}
function symbolFor(sourceId, base) {
  const s2 = sourceOf(sourceId);
  return s2.suffix ? `${base}${s2.suffix}` : base;
}
function intervalMs(interval) {
  const m2 = /^(\d+)([mhd])$/.exec(interval);
  if (!m2) return 6e4;
  const n2 = Number(m2[1]);
  const unit = m2[2] === "m" ? 6e4 : m2[2] === "h" ? 36e5 : 864e5;
  return n2 * unit;
}
fa2();
var ENGINE_LABEL = "vendor openalgo-charts 2.7.0";
var STORAGE_IND = "indicators";
var CATALOG = (Array.isArray(pa2) ? pa2 : Object.values(pa2 || {})).filter((d2) => d2 && d2.id).sort((a, b2) => String(a.name).localeCompare(String(b2.name)));
var DEFAULT_INDICATORS = [
  { id: "ema", inputs: { length: 9 } },
  { id: "ema", inputs: { length: 21 } },
  { id: "rsi", inputs: { length: 14 } }
];
async function fetchBars(sourceId, base, interval, limit = 400) {
  if (sourceId === "binance" || sourceId === "aster" || sourceId === "aster-testnet") {
    const host3 = sourceId === "binance" ? "https://fapi.binance.com" : sourceId === "aster" ? "https://fapi.asterdex.com" : "https://fapi.asterdex-testnet.com";
    const url = `${host3}/fapi/v1/klines?symbol=${base}USDT&interval=${interval}&limit=${limit}`;
    const res2 = await fetch(url, { cache: "no-store" });
    if (!res2.ok) throw new Error(`${sourceId} klines HTTP ${res2.status}`);
    const rows2 = await res2.json();
    return rows2.map((r2) => ({
      time: Math.floor(r2[0] / 1e3),
      open: Number(r2[1]),
      high: Number(r2[2]),
      low: Number(r2[3]),
      close: Number(r2[4]),
      volume: Number(r2[5])
    }));
  }
  const host2 = sourceId === "hyperliquid-testnet" ? "https://api.hyperliquid-testnet.xyz" : "https://api.hyperliquid.xyz";
  const startTime = Date.now() - limit * intervalMs(interval);
  const res = await fetch(`${host2}/info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "candleSnapshot", req: { coin: base, interval, startTime } }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`hyperliquid info HTTP ${res.status}`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error("hyperliquid: resposta inesperada");
  return rows.map((r2) => ({
    time: Math.floor(r2.t / 1e3),
    open: Number(r2.o),
    high: Number(r2.h),
    low: Number(r2.l),
    close: Number(r2.c),
    volume: Number(r2.v)
  })).sort((a, b2) => a.time - b2.time);
}
var $lastPrice = atom(0);
function ChartView(props) {
  const { base, sourceId, interval, alertsApi, indicatorApi, initialIndicators, onTrigger, bump } = props;
  const boxRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("carregando motor\u2026");
  const [series, setSeries] = useState(null);
  const [indCount, setIndCount] = useState(0);
  useEffect(() => {
    if (!boxRef.current) return void 0;
    let chart;
    try {
      chart = va(boxRef.current);
    } catch (err) {
      setError(err.message || String(err));
      return void 0;
    }
    chartRef.current = chart;
    const s2 = chart.addSeries("candlestick");
    seriesRef.current = s2;
    setSeries(s2);
    const applyIndicators = (sel) => {
      try {
        for (const inst of chart.indicators()) {
          try {
            chart.removeIndicator(inst.id);
          } catch (_3) {
          }
        }
      } catch (_3) {
      }
      let n2 = 0;
      for (const entry of sel || []) {
        try {
          chart.addIndicator(entry.id, entry.inputs || {});
          n2 += 1;
        } catch (err) {
          console.warn("[openalgo-charts] addIndicator falhou", entry.id, err);
        }
      }
      setIndCount(n2);
    };
    if (indicatorApi) indicatorApi.apply = applyIndicators;
    applyIndicators(initialIndicators || DEFAULT_INDICATORS);
    const alerts = new Rd(chart);
    if (alertsApi) {
      alertsApi.add = (cfg) => alerts.add(cfg);
      alertsApi.list = () => alerts.list();
      alertsApi.remove = (id) => alerts.remove(id);
      alertsApi.setContext = (c2) => {
        try {
          chart.setDataContext(c2);
        } catch (err) {
          console.warn("[openalgo-charts] setDataContext failed", err);
        }
      };
    }
    const off = chart.on("alert:triggered", (payload) => {
      const ev = payload || {};
      const price = typeof ev.price === "number" ? ev.price : null;
      const title = ev.title || "alerta";
      host.notify({
        kind: "success",
        message: `OpenAlgo alerta \xB7 ${title}${price == null ? "" : " @ " + price}`
      });
      if (onTrigger) onTrigger({ title, price, time: ev.time ?? null, symbol: base, interval });
    });
    setStatus("pronto");
    return () => {
      try {
        off && off();
      } catch (_3) {
      }
      try {
        chart.destroy();
      } catch (_3) {
      }
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);
  useEffect(() => {
    if (!series || !base) return void 0;
    const src = sourceOf(sourceId);
    let cancelled = false;
    let ws2 = null;
    let timer = null;
    setStatus(`carregando ${symbolFor(sourceId, base)} ${interval}\u2026`);
    fetchBars(sourceId, base, interval).then((bars) => {
      if (cancelled || !bars.length) return;
      series.setData(bars);
      $lastPrice.set(bars[bars.length - 1].close);
      try {
        chartRef.current && chartRef.current.timeScale.fitContent(160);
      } catch (_3) {
      }
      if (alertsApi && alertsApi.setContext) {
        alertsApi.setContext({
          symbol: symbolFor(sourceId, base),
          exchange: src.label.toUpperCase(),
          interval
        });
      }
      setStatus(`${bars.length} barras \xB7 ${src.live === "ws" ? "live ws" : "poll 12s"}`);
      if (src.live === "ws") connect();
      else startPolling();
    }).catch((err) => {
      if (!cancelled) setStatus(`erro: ${err.message || err}`);
    });
    function connect() {
      try {
        ws2 = new WebSocket(
          `wss://fstream.binance.com/ws/${symbolFor(sourceId, base).toLowerCase()}@kline_${interval}`
        );
        ws2.onmessage = (evt) => {
          let msg;
          try {
            msg = JSON.parse(evt.data);
          } catch (_3) {
            return;
          }
          const k2 = msg && (msg.k || msg.data && msg.data.k);
          if (!k2 || !seriesRef.current) return;
          const bar = {
            time: Math.floor(k2.t / 1e3),
            open: Number(k2.o),
            high: Number(k2.h),
            low: Number(k2.l),
            close: Number(k2.c),
            volume: Number(k2.v)
          };
          try {
            seriesRef.current.update(bar);
          } catch (_3) {
          }
          $lastPrice.set(bar.close);
        };
        ws2.onclose = () => {
          if (cancelled) return;
          setStatus("live \xB7 reconectando em 5s");
          setTimeout(() => !cancelled && connect(), 5e3);
        };
      } catch (err) {
        setStatus(`ws erro: ${err.message || err}`);
      }
    }
    function startPolling() {
      timer = setInterval(async () => {
        if (cancelled || !seriesRef.current) return;
        try {
          const tail = await fetchBars(sourceId, base, interval, 2);
          const last = tail[tail.length - 1];
          if (!last) return;
          seriesRef.current.update(last);
          $lastPrice.set(last.close);
        } catch (_3) {
        }
      }, POLL_MS);
    }
    return () => {
      cancelled = true;
      try {
        ws2 && ws2.close();
      } catch (_3) {
      }
      if (timer) clearInterval(timer);
    };
  }, [series, base, sourceId, interval, bump]);
  if (error) {
    return jsxs("div", {
      style: { padding: 16, color: "var(--ui-text-secondary)", fontSize: 12, lineHeight: 1.6 },
      children: [
        jsx("div", {
          style: { color: "var(--ui-red, #e5484d)", fontWeight: 600, marginBottom: 6 },
          children: "Motor de gr\xE1fico indispon\xEDvel"
        }),
        jsx("pre", {
          style: { whiteSpace: "pre-wrap", margin: 0, fontFamily: "var(--ui-font-mono, monospace)" },
          children: error
        }),
        jsx("div", {
          style: { marginTop: 8, opacity: 0.8 },
          children: 'Se a mensagem citar CSP ou "Failed to fetch dynamically imported module", o app bloqueia import din\xE2mico \u2014 a c\xF3pia vendorizada em ./vendor deve ser usada.'
        })
      ]
    });
  }
  return jsxs("div", {
    style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 },
    children: [
      jsx("div", { ref: boxRef, style: { flex: 1, minHeight: 0, position: "relative" } }),
      jsx("div", {
        style: {
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: "4px 8px",
          fontSize: 11,
          color: "var(--ui-text-quaternary)",
          borderTop: "1px solid var(--ui-stroke-secondary)"
        },
        children: [
          jsx("span", { children: status }),
          jsx("span", { children: `${indCount} indicadores` }),
          jsx("span", {
            style: { marginLeft: "auto" },
            children: ENGINE_LABEL
          })
        ]
      })
    ]
  });
}
function OpenAlgoPage(props) {
  const { storage } = props;
  const [base, setBase] = useState("BTC");
  const [sourceId, setSourceId] = useState("binance");
  const [interval, setInterval2] = useState("1m");
  const [draft, setDraft] = useState("BTC");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("crossingUp");
  const [bump, setBump] = useState(0);
  const [triggered, setTriggered] = useState([]);
  const [armed, setArmed] = useState([]);
  const alertsApi = useRef({});
  const indicatorApi = useRef({});
  const lastPrice = useValue($lastPrice);
  const [indicators, setIndicators] = useState(() => {
    try {
      const saved = storage.get(STORAGE_IND, null);
      if (Array.isArray(saved)) return saved;
    } catch (_3) {
    }
    return DEFAULT_INDICATORS;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    if (indicatorApi.current.apply) indicatorApi.current.apply(indicators);
    try {
      storage.set(STORAGE_IND, indicators);
    } catch (_3) {
    }
  }, [indicators]);
  const toggleIndicator = useCallback((id) => {
    setIndicators(
      (prev) => prev.some((x2) => x2.id === id) ? prev.filter((x2) => x2.id !== id) : [...prev, { id, inputs: {} }]
    );
  }, []);
  useEffect(() => {
    try {
      const saved = storage.get(STORAGE_ALERTS, null);
      if (Array.isArray(saved)) setTriggered(saved.slice(0, 30));
    } catch (_3) {
    }
  }, []);
  const onTrigger = useCallback((ev) => {
    setTriggered((prev) => {
      const next = [ev, ...prev].slice(0, 30);
      try {
        storage.set(STORAGE_ALERTS, next);
      } catch (_3) {
      }
      return next;
    });
  }, []);
  const addAlert = useCallback(() => {
    const px = Number(price);
    if (!Number.isFinite(px) || px <= 0) {
      host.notify({ kind: "error", message: "Pre\xE7o inv\xE1lido para o alerta" });
      return;
    }
    const api = alertsApi.current;
    if (!api || !api.add) {
      host.notify({ kind: "error", message: "Gr\xE1fico ainda n\xE3o est\xE1 pronto" });
      return;
    }
    const label = `${symbolFor(sourceId, base)} ${condition} ${px}`;
    try {
      const rec = api.add({
        title: label,
        source: { kind: "price", price: px },
        condition,
        policy: "onBarClose",
        repeat: "once"
      });
      setArmed((prev) => [{ id: rec && rec.id, title: label }, ...prev]);
      setPrice("");
      host.notify({ kind: "success", message: "Alerta armado" });
    } catch (err) {
      host.notify({ kind: "error", message: `Falha ao armar: ${err.message || err}` });
    }
  }, [price, condition, sourceId, base]);
  const applySymbol = useCallback(() => {
    const s2 = draft.trim().toUpperCase().replace(/USDT$/, "");
    if (!/^[A-Z0-9]{2,12}$/.test(s2)) {
      host.notify({ kind: "error", message: "S\xEDmbolo inv\xE1lido (ex.: BTC)" });
      return;
    }
    setBase(s2);
    setBump((n2) => n2 + 1);
  }, [draft]);
  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderBottom: "1px solid var(--ui-stroke-secondary)",
    flexWrap: "wrap"
  };
  const segStyle = (active) => ({
    padding: "3px 9px",
    borderRadius: 5,
    fontSize: 11,
    cursor: "pointer",
    border: "1px solid var(--ui-stroke-secondary)",
    background: active ? "var(--ui-accent)" : "transparent",
    color: active ? "#fff" : "var(--ui-text-secondary)"
  });
  return jsxs("div", {
    style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 },
    children: [
      jsxs("div", {
        style: rowStyle,
        children: [
          jsx("span", {
            style: { fontSize: 12, fontWeight: 600, color: "var(--ui-text-secondary)" },
            children: "OpenAlgo Charts"
          }),
          jsx(Input, {
            value: draft,
            onChange: (e) => setDraft(e?.target?.value ?? e),
            onKeyDown: (e) => e.key === "Enter" && applySymbol(),
            style: { width: 90 },
            placeholder: "BTC"
          }),
          jsx(Button, { size: "sm", onClick: applySymbol, children: "Carregar" }),
          jsx("div", {
            style: { display: "flex", gap: 4 },
            children: BASES.slice(0, 4).map(
              (b2) => jsx(
                "button",
                {
                  key: b2,
                  onClick: () => {
                    setDraft(b2);
                    setBase(b2);
                    setBump((n2) => n2 + 1);
                  },
                  style: segStyle(b2 === base),
                  children: b2
                },
                b2
              )
            )
          }),
          jsx("div", {
            style: { display: "flex", gap: 4, marginLeft: 8 },
            children: INTERVALS.map(
              (iv) => jsx(
                "button",
                {
                  key: iv,
                  onClick: () => {
                    setInterval2(iv);
                    setBump((n2) => n2 + 1);
                  },
                  style: segStyle(iv === interval),
                  children: iv
                },
                iv
              )
            )
          }),
          jsxs("div", {
            style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 },
            children: [
              jsx(Badge, { children: lastPrice ? lastPrice.toFixed(2) : "\u2014" }),
              jsx("span", {
                style: { fontSize: 10, color: "var(--ui-text-quaternary)" },
                children: "p\xFAblico \xB7 sem chave"
              })
            ]
          })
        ]
      }),
      jsxs("div", {
        style: { ...rowStyle, paddingTop: 4, paddingBottom: 4 },
        children: [
          jsx("span", {
            style: { fontSize: 10, color: "var(--ui-text-quaternary)" },
            children: "feed"
          }),
          ...SOURCES.map(
            (s2) => jsx(
              "button",
              {
                key: s2.id,
                onClick: () => {
                  setSourceId(s2.id);
                  setBump((n2) => n2 + 1);
                },
                style: segStyle(s2.id === sourceId),
                children: s2.label
              },
              s2.id
            )
          ),
          jsxs("button", {
            onClick: () => setShowPicker((v2) => !v2),
            style: { ...segStyle(showPicker), marginLeft: "auto" },
            children: [`indicadores (${indicators.length})`]
          })
        ]
      }),
      showPicker ? jsxs("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "8px 12px",
          borderBottom: "1px solid var(--ui-stroke-secondary)",
          maxHeight: 210
        },
        children: [
          jsxs("div", {
            style: { display: "flex", gap: 8, alignItems: "center" },
            children: [
              jsx(Input, {
                value: filter,
                onChange: (e) => setFilter(e?.target?.value ?? e),
                placeholder: "filtrar por nome (ex.: supertrend, vwap)",
                style: { width: 260 }
              }),
              jsx("span", {
                style: { fontSize: 10, color: "var(--ui-text-quaternary)" },
                children: `${CATALOG.length} built-ins \xB7 ${indicators.length} ativos`
              }),
              jsx(Button, {
                size: "sm",
                onClick: () => setIndicators(DEFAULT_INDICATORS),
                children: "padr\xE3o"
              }),
              jsx(Button, {
                size: "sm",
                onClick: () => setIndicators([]),
                children: "limpar"
              })
            ]
          }),
          jsx("div", {
            style: { overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "2px 10px" },
            children: CATALOG.filter((d2) => {
              const q2 = filter.trim().toLowerCase();
              if (!q2) return true;
              return `${d2.id} ${d2.name} ${d2.category || ""}`.toLowerCase().includes(q2);
            }).slice(0, 60).map((d2) => {
              const on3 = indicators.some((x2) => x2.id === d2.id);
              return jsxs(
                "label",
                {
                  key: d2.id,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    color: on3 ? "var(--ui-text-secondary)" : "var(--ui-text-quaternary)",
                    minWidth: 128
                  },
                  children: [
                    jsx("input", {
                      type: "checkbox",
                      checked: on3,
                      onChange: () => toggleIndicator(d2.id)
                    }),
                    jsx("span", { children: d2.name }),
                    jsx("span", {
                      style: { fontSize: 9, opacity: 0.6 },
                      children: d2.placement === "onchart" ? "pre\xE7o" : "painel"
                    })
                  ]
                },
                d2.id
              );
            })
          })
        ]
      }) : null,
      jsx("div", {
        style: { flex: 1, minHeight: 0, position: "relative" },
        children: jsx(ChartView, {
          base,
          sourceId,
          interval,
          bump,
          alertsApi: alertsApi.current,
          indicatorApi: indicatorApi.current,
          initialIndicators: indicators,
          onTrigger
        })
      }),
      jsxs("div", {
        style: {
          ...rowStyle,
          borderBottom: "none",
          borderTop: "1px solid var(--ui-stroke-secondary)"
        },
        children: [
          jsx("span", {
            style: { fontSize: 11, color: "var(--ui-text-secondary)" },
            children: "Alerta de pre\xE7o"
          }),
          jsx(Input, {
            value: price,
            onChange: (e) => setPrice(e?.target?.value ?? e),
            placeholder: lastPrice ? String(Math.round(lastPrice)) : "100000",
            style: { width: 110 }
          }),
          jsx("select", {
            value: condition,
            onChange: (e) => setCondition(e.target.value),
            style: {
              fontSize: 11,
              padding: "3px 6px",
              borderRadius: 5,
              background: "transparent",
              color: "var(--ui-text-secondary)",
              border: "1px solid var(--ui-stroke-secondary)"
            },
            children: [
              jsx("option", { value: "crossingUp", children: "cruza acima" }),
              jsx("option", { value: "crossingDown", children: "cruza abaixo" }),
              jsx("option", { value: "greaterThan", children: "maior que" }),
              jsx("option", { value: "lessThan", children: "menor que" })
            ]
          }),
          jsx(Button, { size: "sm", onClick: addAlert, children: "Armar" }),
          jsxs("span", {
            style: { fontSize: 10, color: "var(--ui-text-quaternary)" },
            children: [
              armed.length ? `${armed.length} armado(s)` : "nenhum armado",
              triggered.length ? ` \xB7 ${triggered.length} disparado(s)` : ""
            ]
          }),
          jsx("div", {
            style: {
              marginLeft: "auto",
              fontSize: 10,
              color: "var(--ui-text-quaternary)",
              maxWidth: "48%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            },
            children: triggered[0] ? `\xFAltimo: ${triggered[0].title}${triggered[0].price ? " @ " + triggered[0].price : ""}` : "avalia\xE7\xE3o no fechamento da barra (onBarClose)"
          })
        ]
      })
    ]
  });
}
function OpenAlgoChip(props) {
  const { onOpen } = props;
  const url = useValue($webUrl);
  const [state, setState] = useState("unknown");
  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        await fetch(url, { mode: "no-cors", cache: "no-store" });
        if (alive) setState("up");
      } catch (_3) {
        if (alive) setState("down");
      }
    };
    ping();
    const timer = setInterval(ping, 3e4);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [url]);
  const color = state === "up" ? "var(--ui-green, #3fb950)" : state === "down" ? "var(--ui-red, #e5484d)" : "var(--ui-text-quaternary)";
  return jsxs("button", {
    onClick: onOpen,
    title: `Abrir ${url} no navegador`,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "1px 7px",
      fontSize: 11,
      cursor: "pointer",
      border: "1px solid var(--ui-stroke-secondary)",
      borderRadius: 5,
      background: "transparent",
      color: "var(--ui-text-secondary)"
    },
    children: [
      jsx("span", {
        style: { width: 6, height: 6, borderRadius: 3, background: color, display: "inline-block" }
      }),
      jsx("span", { children: "OpenAlgo" })
    ]
  });
}
var plugin_default = {
  id: ID,
  name: "OpenAlgo Charts",
  register(ctx) {
    const openWeb = () => {
      const url = $webUrl.get();
      try {
        const res = ctx.os && ctx.os.openExternal ? ctx.os.openExternal(url) : null;
        if (res && typeof res.then === "function") {
          res.then((ok) => {
            if (!ok) host.notify({ kind: "error", message: `N\xE3o consegui abrir ${url}` });
          });
        } else if (!res) {
          host.notify({ kind: "error", message: "openExternal indispon\xEDvel neste host" });
        }
      } catch (err) {
        host.notify({ kind: "error", message: `Falha ao abrir: ${err.message || err}` });
      }
    };
    try {
      const saved = ctx.storage.get(STORAGE_WEB, null);
      if (saved === WEB_URLS.local || saved === WEB_URLS.tailnet) $webUrl.set(saved);
    } catch (_3) {
    }
    ctx.register({
      id: "status",
      area: STATUSBAR_AREAS.right,
      order: 150,
      render: () => jsx(OpenAlgoChip, { onOpen: openWeb })
    });
    ctx.registerMany([
      {
        id: "page",
        area: ROUTES_AREA,
        data: { path: ROUTE },
        render: () => jsx(OpenAlgoPage, { storage: ctx.storage })
      },
      {
        id: "nav",
        area: SIDEBAR_NAV_AREA,
        data: { path: ROUTE, label: "OpenAlgo", codicon: "project", order: 30 }
      },
      {
        id: "cmd",
        area: PALETTE_AREA,
        data: {
          id: "openalgo-charts.open",
          label: "OpenAlgo Charts: abrir gr\xE1fico",
          keywords: [
            "openalgo",
            "chart",
            "grafico",
            "candles",
            "binance",
            "hyperliquid",
            "aster",
            "alertas",
            "indicadores"
          ],
          run: () => host.navigate(ROUTE)
        }
      },
      {
        id: "cmd-web",
        area: PALETTE_AREA,
        data: {
          id: "openalgo-charts.web",
          label: "OpenAlgo: abrir UI web no navegador",
          keywords: ["openalgo", "abrir", "navegador", "browser", "web", "plataforma"],
          run: openWeb
        }
      },
      {
        id: "cmd-url",
        area: PALETTE_AREA,
        data: {
          id: "openalgo-charts.url",
          label: "OpenAlgo: alternar URL (tailnet / local)",
          keywords: ["openalgo", "url", "tailnet", "local", "endereco"],
          run: () => {
            const next = $webUrl.get() === WEB_URLS.local ? WEB_URLS.tailnet : WEB_URLS.local;
            $webUrl.set(next);
            try {
              ctx.storage.set(STORAGE_WEB, next);
            } catch (_3) {
            }
            host.notify({ kind: "success", message: `OpenAlgo: ${next}` });
          }
        }
      }
    ]);
  }
};
export {
  plugin_default as default
};
