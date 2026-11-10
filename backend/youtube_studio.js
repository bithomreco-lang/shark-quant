// SHARK QUANT YOUTUBE MASTERCLASS STUDIO
// Isolated module for generating professional 10-15 minute market breakdowns
// with synced TradingView multi-timeframe charts and genuine Charon quant voice.

const { analyze } = require('./market_analysis');

const CHARTS = {
  GOLD: { symbol: 'OANDA:XAUUSD', raw: 'XAUUSD', exchange: 'OANDA', name: 'الذهب (Gold XAUUSD)' },
  BTC: { symbol: 'BINANCE:BTCUSDT', raw: 'BTCUSDT', exchange: 'BINANCE', name: 'البيتكوين (Bitcoin BTCUSDT)' },
  ETH: { symbol: 'BINANCE:ETHUSDT', raw: 'ETHUSDT', exchange: 'BINANCE', name: 'الإيثيريوم (Ethereum ETHUSDT)' },
  SOL: { symbol: 'BINANCE:SOLUSDT', raw: 'SOLUSDT', exchange: 'BINANCE', name: 'سولانا (Solana SOLUSDT)' },
  NASDAQ: { symbol: 'NASDAQ:QQQ', raw: 'QQQ', exchange: 'NASDAQ', name: 'الناسداك (Nasdaq QQQ)' }
};

let lastGeneratedEpisode = null;

module.exports = function attachYouTubeStudio(app, deps) {
  const { db, fetch, fetchLiveNews, HIGH_IMPACT_CALENDAR } = deps;

  app.get('/api/youtube/latest-episode', (req, res) => {
    res.json({ success: true, episode: lastGeneratedEpisode });
  });

  app.post('/api/youtube/generate-episode', async (req, res) => {
    try {
      const assetKey = String(req.body.asset || 'GOLD').toUpperCase();
      const cfg = CHARTS[assetKey] || CHARTS.GOLD;
      const customTopic = String(req.body.topic || '').trim();
      const language = String(req.body.language || 'darija').toLowerCase();

      const apiKey = db.config?.apiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ success: false, error: 'Gemini API key is required' });
      }

      // 1. Fetch live multi-timeframe market analysis
      let h4Data = null;
      let h1Data = null;
      let m15Data = null;
      try {
        [h4Data, h1Data, m15Data] = await Promise.all([
          analyze(cfg, '240').catch(() => null),
          analyze(cfg, '60').catch(() => null),
          analyze(cfg, '15').catch(() => null)
        ]);
      } catch (e) {
        console.warn('Market analysis fetch warning:', e.message);
      }

      const spotPrice = m15Data?.price || h1Data?.price || h4Data?.price || 'Direct Spot';

      // 2. Fetch live macro and geopolitical news
      let newsList = [];
      try {
        if (typeof fetchLiveNews === 'function') {
          newsList = await fetchLiveNews(assetKey === 'GOLD' ? 'gold fed geopolitics dollar' : 'crypto bitcoin fed inflation');
        }
      } catch (e) {}

      const headlines = (newsList || []).slice(0, 4).map(n => `• [${n.publisher || 'Macro'}] ${n.title}`).join('\n');
      const calendar = (HIGH_IMPACT_CALENDAR || []).slice(0, 3).map(c => `• ${c.event} (${c.impact} IMPACT) - ${c.currency}`).join('\n');

      // 3. Construct YouTube Masterclass Prompt for Gemini
      const prompt = `أنت SHARK QUANT — كبير مديري صناديق التحوط وول ستريت ومقدم محتوى مالي ونخبوي على YouTube.
المطلوب منك إنتاج حلقة فيديو يوتيوب كاملة، احترافية، ممتعة، وتثقيفية بالدارجة المغربية الفصيحة والمحترمة (أو العربية المؤسسية الممتازة) لتحليل أصل "${cfg.name}".
السعر اللحظي الحالي: ${spotPrice}.

بيانات السوق الحقيقية:
- فريم 4 ساعات (4H): الاتجاه: ${h4Data?.trend || 'مؤسسي'} | الهيكل: ${h4Data?.structure || 'BoS'}.
- فريم ساعة (1H): الدعم/المقاومة: ${h1Data?.support || 'محدد'} - ${h1Data?.resistance || 'محدد'} | Order Blocks: ${h1Data?.orderBlock || 'نشط'}.
- فريم 15 دقيقة (15M): فجوات FVG: ${m15Data?.fvg || 'موجودة'} | RSI: ${m15Data?.rsi || '50'}.

أحدث الأخبار اللحظية والتقويم الاقتصادي:
${headlines || 'الأسواق تترقب حركة الفيدرالي والسيولة.'}
${calendar || ''}

${customTopic ? `التركيز الخاص للحلقة: "${customTopic}"` : ''}

قواعد الحلقة لليوتيوب:
1. قسم الحلقة إلى 5 فصول (Chapters) متتابعة ومحبوكة بدقة مثل برامج وول ستريت الوثائقية.
2. كل فصل له نص منطوق كامل ومفصل (بين 180 إلى 260 كلمة لكل فصل) بصوت "خويا الحوت" الشيق والواثق والمقنع، يتحدث بطلاقة وتفاعل مع متابعي القناة.
3. حدد لكل فصل الفريم المناسب له على الشارت (مثلاً المقدمة والأخبار 4H، تشريح الشموع 1H، الدخول والصفقة 15M).
4. اذكر أسرار حقيقية لقراءة الشموع: ذيول الشموع (Wicks) كأفخاخ سيولة (Liquidity Traps)، شموع الابتلاع المؤسسي، وتوازن السوق عند الـ FVG.
5. أخرج النتيجة بصيغة JSON حصرية وصحيحة 100% بدون أي نصوص خارج الـ JSON.

الصيغة المطلوبة تماماً (JSON):
{
  "title": "عنوان جذاب جداً لليوتيوب مع إيموجي (مثلاً: 🦈 أسرار شموع الحيتان في الذهب: أين تتجه السيولة غداً؟)",
  "hook": "جملة افتتاحية نارية كخطاف لجذب المشاهد في أول 5 ثواني",
  "targetAsset": "${assetKey}",
  "spotPrice": "${spotPrice}",
  "totalEstimatedDuration": "12-15 دقيقة",
  "chapters": [
    {
      "id": 1,
      "title": "1. المقدمة والشرارة الجيوسياسية (Hook & Macro Intro)",
      "symbol": "${cfg.symbol}",
      "interval": "240",
      "timeframeLabel": "4H Chart",
      "duration": "02:30",
      "keyTakeaway": "خلاصة الفصل في سطر واحد مركز",
      "keyLevels": ["مستوى كذا", "مستوى كذا"],
      "script": "نص الفصل المنطوق كاملاً بالدارجة المغربية بأسلوب مشوق..."
    },
    {
      "id": 2,
      "title": "2. تشريح الأخبار والوقود الماكرو (Macro Catalyst & Fed Rates)",
      "symbol": "${cfg.symbol}",
      "interval": "240",
      "timeframeLabel": "4H Chart",
      "duration": "02:45",
      "keyTakeaway": "خلاصة الفصل",
      "keyLevels": ["مستوى كذا"],
      "script": "نص الفصل المنطوق كاملاً..."
    },
    {
      "id": 3,
      "title": "3. أسرار قراءة الشموع وهيكل الحيتان (Candlestick Secrets & Order Blocks)",
      "symbol": "${cfg.symbol}",
      "interval": "60",
      "timeframeLabel": "1H Chart",
      "duration": "03:30",
      "keyTakeaway": "خلاصة الفصل",
      "keyLevels": ["مستوى كذا"],
      "script": "نص الفصل المنطوق كاملاً يشرح قراءة الشموع والـ Wicks والـ Order Block..."
    },
    {
      "id": 4,
      "title": "4. هندسة السيولة وفخاخ الصانع (Liquidity Grab & FVG Mitigation)",
      "symbol": "${cfg.symbol}",
      "interval": "15",
      "timeframeLabel": "15M Chart",
      "duration": "03:00",
      "keyTakeaway": "خلاصة الفصل",
      "keyLevels": ["مستوى كذا"],
      "script": "نص الفصل المنطوق كاملاً..."
    },
    {
      "id": 5,
      "title": "5. الخطة التنفيذية وخاتمة الحلقة (Actionable Trade Plan & Outro)",
      "symbol": "${cfg.symbol}",
      "interval": "15",
      "timeframeLabel": "15M Chart",
      "duration": "02:30",
      "keyTakeaway": "خلاصة الفصل والصفقة الصريحة",
      "keyLevels": ["الدخول: كذا", "الوقف: كذا", "الهدف: كذا"],
      "script": "نص الفصل المنطوق كاملاً مع الخاتمة والدعوة للاشتراك في القناة..."
    }
  ]
}`;

      // 4. Call Gemini REST API
      const geminiModel = db.config?.model || 'gemini-2.5-flash';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      const geminiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 5000,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        throw new Error(`Gemini API error: ${geminiRes.status} ${errText.slice(0, 200)}`);
      }

      const geminiData = await geminiRes.json();
      const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      let episode = {};
      try {
        episode = JSON.parse(rawText);
      } catch (jsonErr) {
        const cleanMatch = rawText.match(/\{[\s\S]*\}/);
        if (cleanMatch) episode = JSON.parse(cleanMatch[0]);
        else throw new Error('Failed to parse generated episode JSON');
      }

      // 5. Attach audio URLs (TTS Charon voice) per chapter
      if (Array.isArray(episode.chapters)) {
        episode.chapters = episode.chapters.map(ch => {
          const summaryForVoice = (ch.script || ch.title || '').slice(0, 350);
          return {
            ...ch,
            audioUrl: `/api/tts?text=${encodeURIComponent(summaryForVoice)}&lang=ar`
          };
        });
      }

      episode.createdAt = new Date().toISOString();
      lastGeneratedEpisode = episode;

      return res.json({
        success: true,
        episode
      });
    } catch (err) {
      console.error('YouTube Studio generation error:', err.message || err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });
};
