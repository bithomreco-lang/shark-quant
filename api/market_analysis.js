// Real market analysis engine: fetches ~120 real candles and computes structure/levels so the
// voice agent talks from facts (never invented numbers).
const fetch = require('node-fetch');

const BINANCE_TF = { '1': '1m', '5': '5m', '15': '15m', '60': '1h', '240': '4h' };
const YAHOO_TF = { '1': ['1m', '1d'], '5': ['5m', '5d'], '15': ['15m', '5d'], '60': ['60m', '1mo'], '240': ['60m', '3mo'] };

async function getTradingViewGoldSpot() {
  try {
    const r = await fetch('https://scanner.tradingview.com/cfd/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols: { tickers: ['OANDA:XAUUSD'] }, columns: ['close'] })
    });
    const j = await r.json();
    const p = j?.data?.[0]?.d?.[0];
    if (p) return parseFloat(p);
  } catch (e) {}
  return null;
}

async function getCandles(cfg, interval) {
  if (cfg.exchange === 'BINANCE' || cfg.raw === 'XAUUSD') {
    const sym = cfg.raw === 'XAUUSD' ? 'PAXGUSDT' : cfg.raw;
    const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${BINANCE_TF[interval] || '1h'}&limit=150`);
    const d = await r.json();
    if (!Array.isArray(d)) return null;
    let list = d.map(c => ({ t: c[0], o: +c[1], h: +c[2], l: +c[3], c: +c[4], v: +c[5] }));
    if (cfg.raw === 'XAUUSD' && list.length > 0) {
      const tvSpot = await getTradingViewGoldSpot();
      if (tvSpot) {
        const lastPaxg = list[list.length - 1].c;
        const diff = tvSpot - lastPaxg;
        list = list.map(c => ({
          t: c.t,
          o: +(c.o + diff).toFixed(2),
          h: +(c.h + diff).toFixed(2),
          l: +(c.l + diff).toFixed(2),
          c: +(c.c + diff).toFixed(2),
          v: c.v
        }));
      }
    }
    return list;
  }
  const ticker = cfg.raw;
  const [iv, range] = YAHOO_TF[interval] || YAHOO_TF['60'];
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${iv}&range=${range}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const j = await r.json();
  const res = j && j.chart && j.chart.result && j.chart.result[0];
  if (!res) return null;
  const q = res.indicators.quote[0];
  let out = [];
  res.timestamp.forEach((t, i) => {
    if (q.close[i] != null && q.open[i] != null) out.push({ t: t * 1000, o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i], v: q.volume[i] || 0 });
  });
  if (interval === '240') { // aggregate 1h -> 4h
    const agg = [];
    for (let i = 0; i < out.length; i += 4) {
      const g = out.slice(i, i + 4);
      agg.push({ t: g[0].t, o: g[0].o, h: Math.max(...g.map(x => x.h)), l: Math.min(...g.map(x => x.l)), c: g[g.length - 1].c, v: g.reduce((a, x) => a + x.v, 0) });
    }
    out = agg;
  }
  return out.slice(-150);
}

const ema = (arr, p) => { const k = 2 / (p + 1); let e = arr[0]; for (let i = 1; i < arr.length; i++) e = arr[i] * k + e * (1 - k); return e; };
function rsi(closes, p = 14) {
  let g = 0, l = 0;
  for (let i = closes.length - p; i < closes.length; i++) { const d = closes[i] - closes[i - 1]; if (d >= 0) g += d; else l -= d; }
  return l === 0 ? 100 : 100 - 100 / (1 + g / l);
}
function atr(c, p = 14) {
  let s = 0;
  for (let i = c.length - p; i < c.length; i++) s += Math.max(c[i].h - c[i].l, Math.abs(c[i].h - c[i - 1].c), Math.abs(c[i].l - c[i - 1].c));
  return s / p;
}

function swings(c, n = 3) {
  const highs = [], lows = [];
  for (let i = n; i < c.length - n; i++) {
    let isH = true, isL = true;
    for (let k = 1; k <= n; k++) {
      if (c[i].h <= c[i - k].h || c[i].h <= c[i + k].h) isH = false;
      if (c[i].l >= c[i - k].l || c[i].l >= c[i + k].l) isL = false;
    }
    if (isH) highs.push({ i, p: c[i].h });
    if (isL) lows.push({ i, p: c[i].l });
  }
  return { highs, lows };
}

async function analyze(cfg, interval = '60') {
  const c = await getCandles(cfg, interval);
  if (!c || c.length < 40) return null;
  const dec = c[c.length - 1].c > 1000 ? 1 : c[c.length - 1].c > 10 ? 2 : 4;
  const f = (x) => +x.toFixed(dec);
  const closes = c.map(x => x.c);
  const last = c[c.length - 1];
  const price = last.c;
  const a = atr(c);
  const e20 = ema(closes, 20), e50 = ema(closes, 50);
  const r = rsi(closes);
  const { highs, lows } = swings(c);

  const hh = highs.slice(-2), ll = lows.slice(-2);
  let structure = 'ranging';
  if (hh.length === 2 && ll.length === 2) {
    if (hh[1].p > hh[0].p && ll[1].p > ll[0].p) structure = 'bullish (higher highs, higher lows)';
    else if (hh[1].p < hh[0].p && ll[1].p < ll[0].p) structure = 'bearish (lower highs, lower lows)';
  }

  const resistances = highs.filter(h => h.p > price).map(h => h.p).sort((x, y) => x - y).slice(0, 2);
  const supports = lows.filter(l => l.p < price).map(l => l.p).sort((x, y) => y - x).slice(0, 2);

  // liquidity sweep on the last 3 candles
  let sweep = null;
  const refHigh = highs.length ? highs[highs.length - 1] : null;
  const refLow = lows.length ? lows[lows.length - 1] : null;
  for (let k = c.length - 3; k < c.length; k++) {
    if (refHigh && k > refHigh.i && c[k].h > refHigh.p && c[k].c < refHigh.p) sweep = `swept buy-side liquidity above ${f(refHigh.p)} and closed back below (bearish signal)`;
    if (refLow && k > refLow.i && c[k].l < refLow.p && c[k].c > refLow.p) sweep = `swept sell-side liquidity below ${f(refLow.p)} and closed back above (bullish signal)`;
  }

  // break of structure
  let bos = null;
  if (refHigh && price > refHigh.p) bos = `price broke above last swing high ${f(refHigh.p)} (bullish BOS)`;
  else if (refLow && price < refLow.p) bos = `price broke below last swing low ${f(refLow.p)} (bearish BOS)`;

  // unfilled fair value gaps in last 40 candles
  const fvgs = [];
  for (let i = c.length - 40; i < c.length - 1; i++) {
    if (i < 1) continue;
    if (c[i + 1].l > c[i - 1].h) { // bullish gap
      const top = c[i + 1].l, bot = c[i - 1].h;
      if (!c.slice(i + 2).some(x => x.l <= bot)) fvgs.push({ type: 'bullish', from: f(bot), to: f(top) });
    }
    if (c[i + 1].h < c[i - 1].l) { // bearish gap
      const top = c[i - 1].l, bot = c[i + 1].h;
      if (!c.slice(i + 2).some(x => x.h >= top)) fvgs.push({ type: 'bearish', from: f(bot), to: f(top) });
    }
  }

  const rangeSlice = c.slice(-50);
  const rHigh = Math.max(...rangeSlice.map(x => x.h));
  const rLow = Math.min(...rangeSlice.map(x => x.l));
  const first = c[Math.max(0, c.length - 24)].c;

  return {
    timeframe: interval === '60' ? '1h' : interval === '240' ? '4h' : interval + 'm',
    price: f(price),
    change_last_24_candles_pct: +(((price - first) / first) * 100).toFixed(2),
    structure,
    ema20: f(e20), ema50: f(e50),
    price_vs_ema: price > e20 && price > e50 ? 'above both EMAs (bullish momentum)' : price < e20 && price < e50 ? 'below both EMAs (bearish momentum)' : 'between EMAs (mixed)',
    rsi14: +r.toFixed(1),
    atr14: f(a),
    nearest_resistance: resistances.map(f),
    nearest_support: supports.map(f),
    range_50_candles: { high: f(rHigh), low: f(rLow), position_pct: +(((price - rLow) / (rHigh - rLow)) * 100).toFixed(0) },
    liquidity_sweep: sweep,
    break_of_structure: bos,
    unfilled_fair_value_gaps: fvgs.slice(-3),
    last_5_candles: c.slice(-5).map(x => ({ o: f(x.o), h: f(x.h), l: f(x.l), c: f(x.c) })),
    suggested_risk_distance_atr_x1_5: f(a * 1.5)
  };
}

module.exports = { analyze };

