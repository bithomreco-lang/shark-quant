// Gemini Live (native audio) relay: browser <-> this server <-> Google Live API.
// The API key never leaves the server.
const WebSocket = require('ws');
const { analyze } = require('./market_analysis');
const { captureTradingViewScreenshot, captureWebScreenshot, scrollActivePage, searchYouTubeFinancial } = require('./chart_capture');

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
      name: 'post_to_community',
      description: 'Post a message, trade setup, or analysis to the Shark Community Hub on behalf of this user under their actual name and profile. Call it whenever the user asks you to write, post, or share something in the community (e.g. "اكتب رسالة فالمجتمع", "شارك هاد التحليل فالمجتمع", "حط صفقة").',
      parameters: {
        type: 'OBJECT',
        properties: {
          content: { type: 'STRING', description: 'The exact message text to publish into the community feed on behalf of the user.' },
          tag: { type: 'STRING', description: 'Tag for the message', enum: ['ANALYSIS', 'ALERT', 'SIGNAL', 'CHAT', 'SETUP'] }
        },
        required: ['content']
      }
    },
    {
      name: 'read_community_discussions',
      description: 'Read the latest discussions and messages from other traders in the Shark Community Hub to know what everyone is discussing, fearing, or buying right now. Call whenever the user asks what traders/members are saying in the community.',
      parameters: {
        type: 'OBJECT',
        properties: {
          topic: { type: 'STRING', description: 'Optional keyword to filter discussions, e.g. gold, btc, fed' }
        }
      }
    },
    {
      name: 'open_in_app_browser',
      description: 'Open a sleek live in-app browser window on the user screen showing any website, news article, or financial source (Investing.com, ForexFactory, Reuters, CoinDesk, Bloomberg, TradingView, or any URL). Call whenever the user asks to open, browse, see, or visit any website or link.',
      parameters: {
        type: 'OBJECT',
        properties: {
          url: { type: 'STRING', description: 'The website URL to open, e.g. https://www.forexfactory.com or https://www.investing.com' },
          title: { type: 'STRING', description: 'Title or name of the website or article' },
          summary: { type: 'STRING', description: 'Short 1-2 sentence Moroccan Darija summary of what this page contains and how it impacts the market.' }
        },
        required: ['url']
      }
    },
    {
      name: 'browse_and_analyze_web',
      description: 'Fast live web reader and scraper that enters any financial site or URL, reads its actual text and breaking reports in real-time, extracts key numbers, and reports them to the user. Call whenever the user asks you to read, scrape, or deeply analyze any website or link.',
      parameters: {
        type: 'OBJECT',
        properties: {
          url: { type: 'STRING', description: 'The URL to visit and analyze' }
        },
        required: ['url']
      }
    },
    {
      name: 'scroll_web_page',
      description: 'Scroll the currently open website page down or up to see lower paragraphs, tables, economic figures, or comments. Call whenever the user says "هبط لتحت", "سكرولي لتحت", "طلع الفوق", "scroll down", or "scroll up".',
      parameters: {
        type: 'OBJECT',
        properties: {
          direction: { type: 'STRING', enum: ['down', 'up'], description: 'Scroll direction (down or up)' },
          amount: { type: 'NUMBER', description: 'Pixels to scroll, e.g. 600' }
        },
        required: ['direction']
      }
    },
    {
      name: 'search_youtube_news',
      description: 'Search YouTube for breaking financial live news, market analysis, Fed press conferences, or trading podcasts. Directly opens and plays the video on the user screen and analyzes the broadcast. Call whenever the user asks for YouTube, videos, or broadcasts.',
      parameters: {
        type: 'OBJECT',
        properties: {
          topic: { type: 'STRING', description: 'Topic or keyword to search on YouTube, e.g. "gold analysis live", "fed interest rate", "bitcoin breaking"' }
        },
        required: ['topic']
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

    // Extract recent community context for this user and the group
    const userCommunityMsgs = (db.communityHub?.messages || [])
      .filter(m => (m.userEmail && m.userEmail.toLowerCase() === email.toLowerCase()) || (m.senderName && m.senderName.toLowerCase() === name.toLowerCase()))
      .slice(-6);
    const userCommunityBlock = userCommunityMsgs.length > 0
      ? '\n• Recent messages this user posted in the community chat:\n' + userCommunityMsgs.map(m => `  - [${m.timestamp}]: "${m.content}"`).join('\n')
      : '';

    const otherRecentMsgs = (db.communityHub?.messages || []).slice(-8);
    const communityPulseBlock = otherRecentMsgs.length > 0
      ? '\n• Live community pulse (what other traders are chatting about right now in the room):\n' + otherRecentMsgs.map(m => `  - ${m.senderName} (@${m.username || 'trader'}): "${m.content}"`).join('\n')
      : '';

    const system = `You are SHARK — ${name}'s close friend, personal senior quant trader, and elite Wall Street Hedge Fund Partner on a LIVE PHONE CALL with him right now. You possess the world's most comprehensive institutional mastery across ALL trading schools and global macro geopolitics.

WHO YOU ARE & YOUR PLATFORM:
- Your Name: SHARK (خويا الحوت).
- Platform & App Name: "SHARK TRADERS AI" (منصة SHARK QUANT للتداول المؤسسي والكمي).
- When ${name} asks what app this is ("شنو سميت هاد التطبيق", "منصة شنو هادي"), tell him clearly and warmly: "هذا تطبيق SHARK TRADERS AI (منصة SHARK QUANT المؤسسية)، وأنا خويا الحوت شريكك في التداول!"
- WHAT YOU CAN DO & YOUR PRIVILEGES IN THIS LIVE CALL:
  1. Open & Switch Live Charts (فتح وتبديل الشارتات لايف على شاشته): Whenever he asks to see or open a chart (Gold, BTC, ETH, SOL, NASDAQ), call show_chart and the TradingView chart opens directly on his screen!
  2. Real-Time SMC / ICT Market Analysis (التحليل المؤسسي والأسعار اللحظية): You fetch real candle data, Order Blocks, Fair Value Gaps (FVG), Liquidity Sweeps, support/resistance, and exact spot prices.
  3. Live Vision & Screen Analysis (الرؤية المباشرة للشاشة): When he taps the screen button (🖥️), you receive live frames of his screen, observe his charts and drawings, and discuss them.
  4. Macro & Geopolitical News (الأخبار اللحظية والماكرو): You track central banks (Fed rates), wars, elections, CPI inflation, and explain their direct impact on market liquidity.
  5. Executive Trade Signals (صفقات واضحة مع إدارة المخاطر): Precise Entry, Stop Loss (1.5x ATR), and Take Profit (1:3+ R:R) adapted to his balance ($${balance}).
  6. Post to Community On His Behalf (النشر في المجتمع بصوته): When he says "اكتب رسالة فالمجتمع قول ليهم...", you call post_to_community and publish the message into the community feed under his actual name and avatar!
  7. In-App Web Browser & Scraping (متصفح وقارئ مواقع لايف): When he asks to open or check any website/link (Investing, ForexFactory, Reuters, etc.), you open the in-app browser with open_in_app_browser and scrape/analyze it with browse_and_analyze_web!
  8. Interactive Scrolling (السكرول التفاعلي في المواقع): When he says "هبط لتحت", "سكرولي لتحت", "طلع الفوق", call scroll_web_page to reveal lower paragraphs and tables. You receive the new visual snapshot in real-time!
  9. YouTube Live Broadcasts & Analysis (يوتيوب والأخبار المرئية): When he asks for YouTube or video news ("شوف يوتيوب شنو واقع", "جيب ليا لايف الفيدرالي في يوتيوب"), call search_youtube_news to open and play the video right in his call viewport!

COMMUNITY OMNISCIENCE & TRADER PSYCHOLOGY:
- You know ${name}'s mindset, their recent chats, and what they said in the community:${userCommunityBlock || ' (No previous community posts yet)'}
- You know what other traders are discussing in the community room right now:${communityPulseBlock || ' (Community is active)'}
- If ${name} asks what traders are saying or discussing, quote the actual topics and traders from the community pulse!

WHO YOU ARE & INSTITUTIONAL MASTERY:
- You are a Senior Wall Street Macro Quant Partner (like Ray Dalio meets ICT / SMC master trader).
- YOU NEVER SAY "I am just a technical analyst" or "أنا محلل فني فقط"! That is amateur retail talk. In Wall Street, geopolitics, elections, wars, BRICS, inflation (CPI), and central banks (Fed rates) are the PRIMARY FUEL (المحرك والوقود) that dictates institutional order-flow and safe-haven rushes into Gold and Bitcoin.
- YOU MASTER & COMBINE ALL ELITE METHODOLOGIES:
  1. Global Macro & Geopolitics: News & geopolitics create the macro liquidity surge (The Catalyst / المحرك الأساسي).
  2. Smart Money Concepts (SMC / ICT): Order Blocks, Fair Value Gaps (FVG), Liquidity Sweeps (BSL/SSL), Break of Structure (BOS), Change of Character (CHoCH).
  3. Wyckoff Method & Order Flow: Accumulation, Springs, Upthrusts, Distribution, and institutional volume absorption.
  4. Pure Price Action & Supply / Demand: Clean key levels, institutional rejection wicks, and mitigation.
  5. Quantitative Risk & Volatility: Mathematical ATR-based stops (1.5x ATR), strictly 1:3+ Risk-to-Reward ratio, sizing for capital.
  6. Volume Profile & Session Killzones: London Open & New York Open liquidity injection.

HOW YOU CORRELATE NEWS WITH THE CHART:
- When politics, wars, news, or world events are discussed, immediately explain their direct impact on market liquidity (e.g., tensions, debt ceiling, or rate cut bets push safe-haven liquidity into Gold / Bitcoin, while Middle East oil supply shifts crude).
- Then connect it immediately to the visible chart: "The macro news pushed the volume, but the real entry is at the 15m/1h Order Block / FVG on the chart!"

HOW YOU TALK ON THE PHONE:
- Speak the exact same language/dialect he speaks. Moroccan Darija if he speaks Darija (natural, street-smart, warm, brotherly — "خويا", "صاحبي", "واخا", "بصح", "دابا", "شوف", "هانية"). Never switch language unless he does.
- NEVER speak your inner thoughts or meta-reasoning. Speak ONLY your direct, final conversational words immediately.
- Natural, fast, confident phone dialogue: 1-3 spoken punchy sentences. No markdown headers, no lists, no bullet points, no robotic lectures.
- He is male. Never be feminine toward him.
- If he just greets, greet back in 1 short brotherly line.

WHAT YOU KNOW: ${name} — plan ${plan}, trading capital $${balance}.${learnedBlock}
${recent ? 'Earlier in your conversations:\n' + recent : ''}

CRITICAL RULE ON PRICES, TRADES & MACRO NEWS:
- Whenever ${name} asks about the price of Gold, Bitcoin, or any coin/asset ("شحال واصل الذهب دابا", "السعر", "عطيني ثمن"), or asks for a trade setup ("عطيني صفقة", "ندخلو بيع ولا شراء"), you MUST call get_market_data or show_chart!
- Calling get_market_data immediately opens the interactive TradingView chart on his phone screen and fetches the real live TradingView spot price (e.g. Gold is around 4104-4106 on OANDA:XAUUSD).
- Always quote the exact price and levels from the chart returned by get_market_data! Never invent prices or guess from old memory.
- If asked about news, politics, wars, elections, or why the market moved, call get_live_macro_news!
- If asked for a trade, give the exact Entry, Stop Loss, and Take Profit based on the live chart levels, and tell him you opened the chart on his screen.

TOOLS (use them, don't just talk about it):
- show_chart: when he asks to see/open any chart — call it right away AND call get_market_data for the same asset, then tell him what the candles really show in 1-2 natural sentences.
- get_market_data: before quoting any price, level or giving a trade idea, fetch the real data. Never invent numbers.
- get_live_macro_news: fetch breaking news, political updates, and calendar events to explain market drivers.
- post_to_community: when ${name} asks you to write, post, or publish something in the community chat on their behalf ("كتب رسالة فالمجتمع...", "نشر هاد التحليل فالمجتمع", "شارك صفقة مع الدراري"), call post_to_community immediately with the content and confirm to him warmly!
- read_community_discussions: when ${name} asks what people/traders are saying or discussing ("شنو كيقولو الدراري", "واش كاين شي هضرة فالمجتمع"), call it to fetch the latest messages and summarize them!
- open_in_app_browser: when ${name} asks to see or open any website or article ("فتح موقع كذا", "وريني Investing", "دخل لـ ForexFactory"), call it! The in-app browser window opens right on his screen!
- browse_and_analyze_web: when ${name} asks you to read, scrape, or deeply analyze what is written on a webpage or link, call it to fetch live text and explain the key findings!
- You may receive live frames of his screen when he shares it (screen-share button). Use them: read the price axis, candles, structure, his drawings, and combine with get_market_data.
- end_call: when he wants to hang up, say a very short warm goodbye then call it.
Trade ideas: give entry, stop and target clearly but briefly, with risk sized for his capital, and say it's his decision.`;

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
        upstream.send(JSON.stringify({ realtimeInput: { text: `(The call just connected. Greet ${name} with one very short natural line, like a friend picking up the phone.)` } }));
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
              // 📸 التقاط لقطة شاشة حية من الشارت وبثها فوراً كإطار صورة إلى Gemini Live ليراه بعينيه في المكالمة
              captureTradingViewScreenshot(cfg.symbol, iv).then(cap => {
                if (cap && upstream.readyState === WebSocket.OPEN) {
                  upstream.send(JSON.stringify({
                    realtimeInput: {
                      mediaChunks: [{ mimeType: 'image/png', data: cap.base64 }]
                    }
                  }));
                }
              }).catch(() => {});
            } else if (fc.name === 'get_market_data' && cfg) {
              // فتح الشارت مباشرة على هاتف العميل ليطابق ما يراه مع ما يسمعه
              send({ type: 'chart', chart: { symbol: cfg.symbol, rawSymbol: cfg.raw, interval: iv } });
              const an = await analyze(cfg, iv);
              // 📸 التقاط لقطة شاشة حية فورية لإمداد الذكاء بالصورة البصرية للشارت أثناء استعلام السعر
              captureTradingViewScreenshot(cfg.symbol, iv).then(cap => {
                if (cap && upstream.readyState === WebSocket.OPEN) {
                  upstream.send(JSON.stringify({
                    realtimeInput: {
                      mediaChunks: [{ mimeType: 'image/png', data: cap.base64 }]
                    }
                  }));
                }
              }).catch(() => {});
              result = an ? { asset: a, liveTradingViewSpotPrice: an.price, ...an } : { error: 'no data' };
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
            } else if (fc.name === 'post_to_community') {
              const content = String(fc.args?.content || '').trim();
              const tag = String(fc.args?.tag || 'COMMUNITY').toUpperCase();
              if (!content) {
                result = { error: 'Content is required to post.' };
              } else {
                if (!db.communityHub) db.communityHub = {};
                if (!Array.isArray(db.communityHub.messages)) db.communityHub.messages = [];
                const userObj = (db.users || []).find(u => (u.email || '').toLowerCase() === email.toLowerCase());
                const cleanSenderName = userObj?.name || name || 'Shark Trader';
                const cleanUsername = userObj?.username || name.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'trader';
                const newMsg = {
                  id: Date.now().toString(),
                  senderName: cleanSenderName,
                  username: cleanUsername,
                  userEmail: email,
                  avatarText: userObj?.avatar || '🦈',
                  content,
                  tag,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  likes: 0,
                  likedBy: [],
                  reactions: { fire: [], target: [], rocket: [], blood: [] },
                  isAiPostedOnBehalf: true
                };
                db.communityHub.messages.push(newMsg);
                try { saveDb(); } catch (e) {}
                if (dbManager && typeof dbManager.syncAllDataToSupabase === 'function') {
                  dbManager.syncAllDataToSupabase().catch(() => {});
                }
                // Broadcast to user app immediately so community chat updates in real time
                send({ type: 'community_post_created', post: newMsg });
                result = {
                  ok: true,
                  posted: true,
                  postedAs: cleanSenderName,
                  content: newMsg.content,
                  announcement: `تم نشر الرسالة في مجتمع الحيتان بنجاح باسمك (${cleanSenderName})!`
                };
              }
            } else if (fc.name === 'read_community_discussions') {
              const msgs = (db.communityHub?.messages || []).slice(-12);
              const formatted = msgs.map(m => `• [${m.senderName} @${m.username}]: "${m.content}" (${m.timestamp})`);
              result = {
                ok: true,
                count: msgs.length,
                recentCommunityDiscussions: formatted,
                summary: 'Discussions fetched. Tell the user what fellow traders are chatting about.'
              };
            } else if (fc.name === 'open_in_app_browser' || fc.name === 'browse_and_analyze_web') {
              let targetUrl = String(fc.args?.url || '').trim();
              if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                targetUrl = 'https://' + targetUrl;
              }
              const browserTitle = String(fc.args?.title || targetUrl.replace(/^https?:\/\//, '').split('/')[0]).trim();
              const summary = String(fc.args?.summary || 'عرض وتحليل فوري لصفحة الويب').trim();

              // Send initial state to client
              send({
                type: 'in_call_viewport',
                viewType: 'web',
                url: targetUrl,
                title: browserTitle,
                summary
              });

              // AWAIT the visual screenshot so Gemini Live gets the image BEFORE speaking!
              const cap = await captureWebScreenshot(targetUrl);
              if (cap && cap.base64 && upstream.readyState === WebSocket.OPEN) {
                upstream.send(JSON.stringify({
                  realtimeInput: {
                    mediaChunks: [{ mimeType: 'image/jpeg', data: cap.base64 }]
                  }
                }));
                send({
                  type: 'in_call_viewport',
                  viewType: 'web',
                  url: targetUrl,
                  title: cap.title || browserTitle,
                  summary,
                  screenshotUrl: cap.filePath
                });
              }

              result = {
                ok: true,
                url: targetUrl,
                title: cap?.title || browserTitle,
                visualFedToEyes: true,
                directive: 'The actual visual screenshot of this webpage is in your vision right now! Speak immediately describing what you see on the screen in natural Darija.'
              };
            } else if (fc.name === 'scroll_web_page') {
              const dir = String(fc.args?.direction || 'down').toLowerCase();
              const amt = Number(fc.args?.amount) || 600;
              const cap = await scrollActivePage(dir, amt);
              if (cap && cap.base64 && upstream.readyState === WebSocket.OPEN) {
                upstream.send(JSON.stringify({
                  realtimeInput: {
                    mediaChunks: [{ mimeType: 'image/jpeg', data: cap.base64 }]
                  }
                }));
                send({
                  type: 'in_call_viewport',
                  viewType: 'web',
                  url: cap.url,
                  title: cap.title,
                  screenshotUrl: cap.filePath,
                  currentScrollY: cap.currentScrollY
                });
              }
              result = {
                ok: true,
                scrolled: dir,
                directive: 'You have scrolled the page down. The newly revealed content is now in your vision. Describe what you see in Darija.'
              };
            } else if (fc.name === 'search_youtube_news') {
              const topic = String(fc.args?.topic || 'gold market news live').trim();
              const yt = await searchYouTubeFinancial(topic);
              if (yt.screenshot && yt.screenshot.base64 && upstream.readyState === WebSocket.OPEN) {
                upstream.send(JSON.stringify({
                  realtimeInput: {
                    mediaChunks: [{ mimeType: 'image/jpeg', data: yt.screenshot.base64 }]
                  }
                }));
              }
              send({
                type: 'in_call_viewport',
                viewType: 'youtube',
                embedUrl: yt.embedUrl,
                videoId: yt.topVideoId,
                title: yt.title,
                query: topic,
                screenshotUrl: yt.screenshot ? yt.screenshot.filePath : null
              });
              result = {
                ok: true,
                platform: 'youtube',
                videoTitle: yt.title,
                embedUrl: yt.embedUrl,
                directive: 'YouTube video broadcast is now open on the user screen inside the call. Discuss the live video topic with the user in Darija.'
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
        upstream.send(JSON.stringify({ realtimeInput: { audio: { data: m.data, mimeType: 'audio/pcm;rate=16000' } } }));
      } else if (m.type === 'video' && m.data) {
        upstream.send(JSON.stringify({ realtimeInput: { mediaChunks: [{ mimeType: 'image/jpeg', data: m.data }] } }));
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
