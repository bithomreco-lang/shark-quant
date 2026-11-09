// ══════════════════════════════════════════════
// LIVE CALL TURN ENGINE — audio in (or text) -> understand + reply in ONE Gemini call
// ══════════════════════════════════════════════
const CHART_MAP = {
  GOLD: { symbol: 'OANDA:XAUUSD', raw: 'XAUUSD', exchange: 'OANDA' },
  BTC: { symbol: 'BINANCE:BTCUSDT', raw: 'BTCUSDT', exchange: 'BINANCE' },
  ETH: { symbol: 'BINANCE:ETHUSDT', raw: 'ETHUSDT', exchange: 'BINANCE' },
  SOL: { symbol: 'BINANCE:SOLUSDT', raw: 'SOLUSDT', exchange: 'BINANCE' },
  NASDAQ: { symbol: 'NASDAQ:QQQ', raw: 'QQQ', exchange: 'NASDAQ' }
};

function shortenForVoice(text) {
  let t = (text || '').replace(/[*#_`>~]/g, '').replace(/\s+/g, ' ').trim();
  if (t.length <= 230) return t;
  const parts = t.match(/[^.!؟?\n]+[.!؟?]?/g) || [t];
  let out = '';
  for (const p of parts) {
    if ((out + p).length > 230) break;
    out += p;
  }
  return (out || t.substring(0, 230)).trim();
}

module.exports = function registerLiveTurn(app, deps) {
  const { db, saveDb, fetch, getLiveTickerSnapshot, fetchLiveMarketData } = deps;

  app.post('/api/live-turn', async (req, res) => {
    const {
      userEmail = 'guest',
      userName = 'صديقي',
      userPlan = 'VIP',
      userBalance = 50000,
      audioBase64,
      text,
      activeChart
    } = req.body || {};

    if (!audioBase64 && !text) return res.status(400).json({ error: 'audio or text required' });

    try {
      if (!db.sessions[userEmail]) db.sessions[userEmail] = {};
      if (!db.sessions[userEmail].live_call) {
        db.sessions[userEmail].live_call = { title: 'Live Call', messages: [], activeChart: null, updatedAt: new Date().toISOString() };
      }
      const session = db.sessions[userEmail].live_call;

      const tickers = await getLiveTickerSnapshot();
      let chartContext = '';
      if (activeChart && activeChart.rawSymbol) {
        try {
          const ex = activeChart.symbol && activeChart.symbol.includes(':') ? activeChart.symbol.split(':')[0] : 'OANDA';
          const md = await fetchLiveMarketData(activeChart.rawSymbol, ex, activeChart.interval || '60');
          if (md) {
            chartContext = `\nCHART ON USER SCREEN NOW: ${md.symbol} tf ${md.interval}, price ${md.currentPrice}, change ${md.change24h}, trend ${md.trend}, high ${md.high}, low ${md.low}. Last candles: ` +
              md.candles.slice(-6).map(c => `${c.time} O${c.open} H${c.high} L${c.low} C${c.close}`).join(' | ');
          }
        } catch (e) {}
      }

      const system = `You are SHARK, a sharp, warm senior trading partner on a LIVE PHONE CALL with ${userName} (plan ${userPlan}, capital $${userBalance}). You talk like a close friend who is also a pro Smart-Money trader — natural, human, relaxed. Think like ChatGPT voice / Gemini Live. Address the user as a male (خويا / صاحبي), never feminine. Do not ask a question in every reply.

HARD RULES:
- Reply in the SAME language and dialect the user speaks (Moroccan Darija -> Darija, Arabic -> Arabic, French -> French, English -> English).
- MAX 2 short spoken sentences (about 25 words). Never monologue. No lists, no markdown, no emojis, no tables.
- Answer exactly what was said. Greeting -> one short friendly line. Don't mention assets or prices nobody asked about.
- If the user asks to see/open/analyze a chart or asset, set "chart" and give ONE punchy insight with a real level from the data below.
- If they want to end the call (bye, اقطع, بسلامة, safi, hang up...), say a very short farewell and set "hangup": true.
- If the audio is silence/noise/unclear, set "heard" to "" and "reply" to "".
- Use only real data below, never invent numbers.

LIVE PRICES: Gold ${tickers.gold}, BTC ${tickers.btc}, ETH ${tickers.eth}, SOL ${tickers.sol}, Nasdaq(QQQ) ${tickers.nasdaq}.${chartContext}

OUTPUT strict JSON only: {"heard":"exact transcript of what the user said","reply":"your short spoken reply","chart":null or {"asset":"GOLD|BTC|ETH|SOL|NASDAQ","interval":"1|5|15|60|240"},"hangup":false}`;

      const contents = [];
      session.messages.slice(-10).forEach(m => {
        if (m.content) contents.push({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] });
      });
      const userParts = audioBase64
        ? [{ inlineData: { mimeType: 'audio/wav', data: audioBase64 } }, { text: 'Transcribe and answer this voice message.' }]
        : [{ text }];
      contents.push({ role: 'user', parts: userParts });

      const models = ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
      let parsed = null;
      let lastErr = null;
      for (const model of models) {
        try {
          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${db.config.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents,
              generationConfig: { responseMimeType: 'application/json', temperature: 0.8, maxOutputTokens: 700 }
            })
          });
          const j = await r.json();
          const raw = j.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
          if (raw) {
            try {
              parsed = JSON.parse(raw.replace(/^```json|```$/g, '').trim());
              break;
            } catch (e) { lastErr = e; }
          } else if (j.error) {
            lastErr = j.error;
            console.warn(`live-turn ${model} failed:`, j.error.code, (j.error.message || '').substring(0, 70));
          }
        } catch (e) { lastErr = e; }
      }

      if (!parsed) return res.json({ heard: '', reply: '', error: true, detail: String(lastErr && (lastErr.message || lastErr)) });

      const heard = (parsed.heard || (text || '')).trim();
      const reply = shortenForVoice(parsed.reply);
      if (!heard || !reply) return res.json({ heard: '', reply: '' });

      let chart = null;
      if (parsed.chart && CHART_MAP[String(parsed.chart.asset || '').toUpperCase()]) {
        const m = CHART_MAP[String(parsed.chart.asset).toUpperCase()];
        const iv = ['1', '5', '15', '60', '240'].includes(String(parsed.chart.interval)) ? String(parsed.chart.interval) : '60';
        chart = { symbol: m.symbol, rawSymbol: m.raw, interval: iv };
      }

      session.messages.push({ role: 'user', content: heard, timestamp: new Date().toISOString() });
      session.messages.push({ role: 'model', content: reply, timestamp: new Date().toISOString() });
      session.updatedAt = new Date().toISOString();
      saveDb();

      res.json({
        heard,
        reply,
        chart,
        shouldHangup: Boolean(parsed.hangup),
        aiVoiceUrl: `/api/tts?text=${encodeURIComponent(reply)}&lang=ar`
      });
    } catch (err) {
      console.error('live-turn error:', err);
      res.json({ heard: '', reply: '', error: true });
    }
  });
};
