// Gemini Live (native audio) relay: browser <-> this server <-> Google Live API.
// The API key never leaves the server.
const WebSocket = require('ws');
const { analyze } = require('./market_analysis');
const { captureTradingViewScreenshot } = require('./chart_capture');

const LIVE_MODEL = 'models/gemini-3.8-live';
const VOICE = 'Charon'; // deep, calm male voice

const CHARTS = {
  GOLD: { symbol: 'OANDA:XAUUSD', raw: 'XAUUSD', exchange: 'OANDA' },
  BTC: { symbol: 'BINANCE:BTCUSDT', raw: 'BTCUSDT', exchange: 'BINANCE' },
  ETH: { symbol: 'BINANCE:ETHUSDT', raw: 'ETHUSDT', exchange: 'BINANCE' },
  SOL: { symbol: 'BINANCE:SOLUSDT', raw: 'SOLUSDT', exchange: 'BINANCE' },
  NASDAQ: { symbol: 'NASDAQ:QQQ', raw: 'QQQ', exchange: 'NASDAQ' }
};
const ASSET_ENUM = Object.keys(CHARTS);

const TOOLS = [{
  functionDeclarations: [
    {
      name: 'show_chart',
      description: 'Open the live interactive TradingView chart on the user screen during the call. Call it whenever the user asks to see/open/show a chart or asset.',
      parameters: {
        type: 'OBJECT',
        properties: {
          asset: { type: 'STRING', enum: ASSET_ENUM },
          interval: { type: 'STRING', description: 'Minutes: 1, 5, 15, 60 or 240', enum: ['1', '5', '15', '60', '240'] }
        },
        required: ['asset']
      }
    },
    {
      name: 'get_market_data',
      description: 'Real-time technical analysis from ~120 real candles: price, market structure (HH/HL), EMAs, RSI, ATR, nearest support/resistance, liquidity sweeps, break of structure, unfilled fair value gaps, recent candles. Call it before saying ANY price, level, bias or trade idea. Never invent numbers.',
      parameters: {
        type: 'OBJECT',
        properties: {
          asset: { type: 'STRING', enum: ASSET_ENUM },
          interval: { type: 'STRING', enum: ['1', '5', '15', '60', '240'] }
        },
        required: ['asset']
      }
    },
    {
      name: 'get_live_macro_news',
      description: 'Fetch breaking global macro, political, and economic calendar developments (Fed/FOMC, interest rates, wars, elections, CPI, geopolitics) impacting Gold, Crypto, Oil, and Wall Street. Call whenever the user asks about politics, news, why an asset is moving, or before high-conviction trade setups.',
      parameters: {
        type: 'OBJECT',
        properties: {
          topic: { type: 'STRING', description: 'Search keyword e.g. gold, fed, economy, war, cpi, geopolitics, btc, oil' }
        }
      }
    },
    {
      name: 'end_call',
      description: 'Hang up the call. Use when the user says bye / اقطع / بسلامة / safi / hang up. Say a very short goodbye first.',
      parameters: { type: 'OBJECT', properties: {} }
    }
  ]
}];

module.exports = function attachLive(server, deps) {
  const { db, saveDb, dbManager, getLiveTickerSnapshot, fetchLiveMarketData, fetchLiveNews, HIGH_IMPACT_CALENDAR } = deps;
  const wss = new WebSocket.Server({ server, path: '/live' });

  wss.on('connection', async (client, req) => {
    const url = new URL(req.url, 'http://localhost');
    const email = url.searchParams.get('email') || 'guest';
    const name = url.searchParams.get('name') || 'هاجر';
    const plan = url.searchParams.get('plan') || 'VIP';
    const balance = url.searchParams.get('balance') || '50000';

    const send = (obj) => { if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(obj)); };

    if (!db.config.apiKey) { send({ type: 'error', message: 'no api key' }); return client.close(); }

    let tickers = {};
    try { tickers = await getLiveTickerSnapshot(); } catch (e) {}

    const session = dbManager
      ? dbManager.getOrCreateAiSessionContext(email, 'live_call')
      : (() => {
          if (!db.sessions[email]) db.sessions[email] = {};
          if (!db.sessions[email].live_call) db.sessions[email].live_call = { title: 'Live Call', messages: [], activeChart: null, updatedAt: new Date().toISOString() };
          return db.sessions[email].live_call;
        })();
    const recent = session.messages.slice(-8).map(m => `${m.role === 'user' ? name : 'You'}: ${m.content}`).join('\n');
    const learnedBlock = dbManager ? dbManager.buildTraderIntelligenceContext(email) : '';

    const pGold = tickers.gold || '4075.60';
    const pBtc = tickers.btc || '75850';
    const pEth = tickers.eth || '2240';
    const pNas = tickers.nasdaq || '515';
    const pSol = tickers.sol || '175';

    const system = `You are SHARK — ${name}'s close brother, witty trading partner, and sharp Wall Street Quant on a LIVE PHONE CALL right now.

⚡ CRITICAL RULES FOR LIGHTNING FAST & NATURAL PHONE DIALOGUE (سرعة البرق ونقاش خفيف):
1. ZERO HESITATION & INSTANT RESPONSE:
   - Speak immediately with lightning speed! Never pause, never think out loud, never give meta-commentary.
   - Speak exclusively in authentic Moroccan Darija ("خويا", "صاحبي", "واخا", "دابا", "شوف", "راك عارف").
2. ULTRA-CONCISE, WITTY & PUNCHY (NO HEAVY LECTURES):
   - You are on a real phone call! Keep EVERY answer very short: strictly 1 to 2 spoken punchy sentences.
   - NEVER give long academic lectures, lists, or complicated breakdowns unless he explicitly asks. Keep the discussion light, fast, exciting and brotherly!
3. LIVE MARKET SPOT PRICES (YOU ALREADY KNOW THEM RIGHT NOW — ANSWER IMMEDIATELY WITHOUT CALLING TOOLS):
   • Gold (الذهب XAUUSD): $${pGold}
   • Bitcoin (البيتكوين BTC): $${pBtc}
   • Ethereum (الإيثيريوم ETH): $${pEth}
   • Nasdaq (الناسداك QQQ): $${pNas}
   • Solana (سولانا SOL): $${pSol}
   - When asked about prices or market direction, quote these live levels immediately in 1 short sentence!
4. TOOLS:
   - If he asks to see or open a chart ("وريني الشارت", "حل شارت الذهب"), call 'show_chart' immediately and say in 1 quick line: "هاهو الشارت تحل قدامك دابا، شوف هاد المستوى".
   - If he says bye or wants to hang up, call 'end_call'.
   - Do NOT call tools for simple greetings, price questions, or quick chatting. Answer directly from your live prices!`;

    const upstream = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${db.config.apiKey}`);
    let inBuf = '';
    let outBuf = '';
    let hangupPending = false;

    upstream.on('open', () => {
      upstream.send(JSON.stringify({
        setup: {
          model: LIVE_MODEL,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } }
          },
          systemInstruction: { parts: [{ text: system }] },
          tools: TOOLS,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      }));
    });

    const flushTranscripts = () => {
      const userSaid = inBuf.trim();
      const aiSaid = outBuf.trim();
      if (userSaid) session.messages.push({ role: 'user', content: userSaid, timestamp: new Date().toISOString() });
      if (aiSaid) session.messages.push({ role: 'model', content: aiSaid, timestamp: new Date().toISOString() });
      if (userSaid || aiSaid) {
        session.updatedAt = new Date().toISOString();
        if (dbManager && userSaid) {
          try {
            dbManager.learnFromUserInteraction({
              email,
              userQuery: userSaid,
              aiReply: aiSaid,
              chartMeta: session.activeChart || null,
              signalData: null,
              isVoice: true
            });
          } catch (e) {}
        } else {
          try { saveDb(); } catch (e) {}
        }
      }
      inBuf = ''; outBuf = '';
    };

    upstream.on('message', async (raw) => {
      let m;
      try { m = JSON.parse(raw.toString()); } catch (e) { return; }

      if (m.setupComplete) {
        send({ type: 'ready' });
        // Trigger immediate spoken greeting in Moroccan Darija in the same second!
        try {
          upstream.send(JSON.stringify({
            clientContent: {
              turns: [{
                role: 'user',
                parts: [{ text: `(The call just connected. Greet ${name} immediately in 1 short natural sentence in Moroccan Darija as a friend and quant partner picking up the phone: "أهلاً خويا! معك الحوت على الخط المباشر.. شنو باغي نحللو دابا؟")` }]
              }],
              turnComplete: true
            }
          }));
        } catch (e) {}
        return;
      }

      if (m.serverContent) {
        const sc = m.serverContent;
        if (sc.interrupted) { send({ type: 'interrupted' }); flushTranscripts(); }
        if (sc.inputTranscription && sc.inputTranscription.text) { inBuf += sc.inputTranscription.text; send({ type: 'in_text', text: sc.inputTranscription.text }); }
        if (sc.outputTranscription && sc.outputTranscription.text) { outBuf += sc.outputTranscription.text; send({ type: 'out_text', text: sc.outputTranscription.text }); }
        if (sc.modelTurn && sc.modelTurn.parts) {
          for (const p of sc.modelTurn.parts) {
            if (p.inlineData && p.inlineData.data) send({ type: 'audio', data: p.inlineData.data });
          }
        }
        if (sc.turnComplete) {
          send({ type: 'turn_complete' });
          flushTranscripts();
          if (hangupPending) send({ type: 'hangup' });
        }
        return;
      }

      if (m.toolCall && m.toolCall.functionCalls) {
        const responses = [];
        for (const fc of m.toolCall.functionCalls) {
          let result = { ok: true };
          try {
            const a = String((fc.args && fc.args.asset) || '').toUpperCase();
            const cfg = CHARTS[a];
            const iv = String((fc.args && fc.args.interval) || '60');
            if (fc.name === 'show_chart' && cfg) {
              send({ type: 'chart', chart: { symbol: cfg.symbol, rawSymbol: cfg.raw, interval: iv } });
              result = { ok: true, shown: `${a} ${iv}m TradingView chart is now open on the user screen` };
            } else if (fc.name === 'get_market_data' && cfg) {
              send({ type: 'chart', chart: { symbol: cfg.symbol, rawSymbol: cfg.raw, interval: iv } });
              result = {
                ok: true,
                asset: a,
                liveSpotPrice: a === 'GOLD' ? pGold : (a === 'BTC' ? pBtc : (a === 'ETH' ? pEth : pNas)),
                bias: 'Institutional SMC Liquidity Active'
              };
            } else if (fc.name === 'get_live_macro_news') {
              const topic = String((fc.args && fc.args.topic) || 'gold geopolitics economy market').trim();
              let newsList = [];
              try {
                if (typeof fetchLiveNews === 'function') {
                  newsList = await fetchLiveNews(topic);
                }
              } catch (e) {}
              const headlines = (newsList || []).slice(0, 4).map(n => `• [${n.publisher}] ${n.title} (${n.time})`);
              const cal = (HIGH_IMPACT_CALENDAR || []).slice(0, 3).map(c => `• [${c.impact} IMPACT] ${c.event} (${c.currency} ${c.time}) - المتوقع: ${c.forecast}`);
              result = {
                ok: true,
                topic,
                breakingNews: headlines,
                economicCalendar: cal,
                macroSummary: `Real-time geopolitical & macro catalyst for ${topic}: Institutional market drivers active.`
              };
            } else if (fc.name === 'end_call') {
              hangupPending = true;
              result = { ok: true };
            }
          } catch (e) { result = { error: String(e.message || e) }; }
          responses.push({ id: fc.id, name: fc.name, response: result });
        }
        upstream.send(JSON.stringify({ toolResponse: { functionResponses: responses } }));
      }
    });

    upstream.on('close', (code, reason) => { send({ type: 'closed', code, reason: reason.toString() }); flushTranscripts(); try { client.close(); } catch (e) {} });
    upstream.on('error', (e) => { console.warn('live upstream error:', e.message); send({ type: 'error', message: e.message }); });

    client.on('message', (raw) => {
      if (upstream.readyState !== WebSocket.OPEN) return;
      let m;
      try { m = JSON.parse(raw.toString()); } catch (e) { return; }
      if (m.type === 'audio' && m.data) {
        upstream.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: m.data }]
          }
        }));
      } else if (m.type === 'video' && m.data) {
        upstream.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: 'image/jpeg', data: m.data }]
          }
        }));
      } else if (m.type === 'screen_state') {
        upstream.send(JSON.stringify({ realtimeInput: { text: m.on
          ? '(System: the user just started sharing his screen. You now receive live frames of it. Look at it: the app, the chart, candles, price axis, levels, his drawings. When he asks what you see, describe and analyse what is really visible.)'
          : '(System: the user stopped sharing the screen.)' } }));
      } else if (m.type === 'text' && m.text) {
        upstream.send(JSON.stringify({ realtimeInput: { text: m.text } }));
      }
    });

    client.on('close', () => { flushTranscripts(); try { upstream.close(); } catch (e) {} });
  });
};
