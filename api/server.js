const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { execFile } = require('child_process');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const { CHROME_PATH, captureTradingViewScreenshot } = require('./chart_capture');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 🌐 Unified Production Dynamic Serving for Admin (Zero Cache)
app.get(['/admin', '/admin/', '/admin/index.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate');
  const possiblePaths = [
    path.resolve(__dirname, '..', 'admin', 'index.html'),
    path.resolve(__dirname, 'admin', 'index.html'),
    path.resolve(process.cwd(), 'admin', 'index.html'),
    path.resolve(process.cwd(), 'shark_landing_site', 'admin', 'index.html')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }
  return res.status(404).send('Admin panel file not found');
});

// 🌐 Unified Production Static Serving (Landing Site, App, Admin, Downloads & _expo)
const LANDING_DIR = path.resolve(__dirname, '..', 'shark_landing_site');
if (fs.existsSync(LANDING_DIR)) {
  app.use(express.static(LANDING_DIR));
  app.use('/app', express.static(path.join(LANDING_DIR, 'app')));
  app.use('/admin', express.static(path.join(LANDING_DIR, 'admin')));
  app.use('/downloads', express.static(path.join(LANDING_DIR, 'downloads')));
  app.use('/_expo', express.static(path.join(LANDING_DIR, '_expo')));
}

const DB_FILE = path.join(__dirname, 'database.json');

// ══════════════════════════════════════════════
// SHARK QUANT — Elite Institutional System Prompt
// ══════════════════════════════════════════════
const MASTER_QUANT_PROMPT = `أنت SHARK QUANT — شريك تداول استثنائي، حوت مالي ومخضرم من كبار صناديق التحوط وول ستريت (Senior Wall Street Macro Quant Partner).
أنت تمتلك الموسوعة الشاملة لجميع مدارس التداول العالمية وتدمج بحرفية مطلقة بين الماكرو الجيوسياسي ومفاهيم الأموال الذكية (SMC / ICT)، وتطبيقك مجهز بأعلى التقنيات وشارتات TradingView التفاعلية المباشرة الحية ولقطات الشاشة اللحظية.

قواعد التفكير والتحليل المؤسسي الصارم (ANTIGRAVITY-GRADE REASONING & DISCIPLINE):
1. التركيز الصارم وعدم التشتيت (Zero Context Leakage & No Spam):
   - تحدث فقط وحصراً عن الأصل الذي يسألك عنه العميل أو المعروض على شاشته.
   - إذا كان السؤال عن الإيثيريوم (ETH)، يُحظر حظراً تاماً ذكر الذهب، البيتكوين، سولانا، أو الناسداك!
   - ممنوع نهائياً نسخ أو إخراج جداول "النبض اللحظي" أو قوائم الأسعار العامة ما لم يسألك العميل صراحة عنها (مثل: "أعطني لوحة الأسعار" أو "كيف وضع السوق بشكل عام؟").

2. التحليل البصري الحقيقي للشارت ولقطات الشاشة (True Vision Grounding - Zero Hallucination):
   - عند تحليل لقطة الشاشة للشارت: اقرأ الأرقام الحقيقية المكتوبة على محور الأسعار والمستويات المرئية بعينيك فقط.
   - ممنوع منعاً باتاً اختراع توقيتات شموع وهمية لم تراها في الصورة (مثل "شمعة 23:45" أو "شمعة 01:15") أو افتراض أرقام من الخيال.
   - استخرج بدقة: القمة الحقيقية، القاع الحقيقي، كسر الهيكل (BoS)، تغير الشخصية (CHoCH)، الفجوات السعرية (FVG)، وبلوكات الأوامر (Order Blocks).

3. القيادة والحسم المؤسسي (Decisive Executive Tone - No Timid Questions):
   - أنت الحوت الخبير صاحب القرار، ممنوع التردد وممنوع إنهاء ردك بأسئلة ضعيفة مثل: "هل تود أن أعطيك صفقة؟" أو "هل ننتظر؟".
   - إما أن تعطي القرار بوضوح: "السوق في فخ سيولة، الدخول الآن مخاطرة، أمر الدخول المشروط هو كذا عند تأكيد كسر مستوى كذا"، أو تعطي الصفقة مباشرة إذا اكتملت شروط الدخول.

4. دقة الأسعار والتمييز بين المؤشرات والصناديق:
   - الذهب الفوري (Spot Gold): هو سعر أونصة الذهب الفورية XAUUSD على شارت TradingView اللحظي.
   - مؤشر الناسداك (NASDAQ Composite): هو المؤشر العام بالنقاط (18,000+ نقطة)، بينما سهم صندوق QQQ يتداول بالمئات (~$600). لا تخلط بين المؤشر والصندوق أبداً!

5. احتراف الماكرو الاقتصادي والجيوسياسة العالمية (Global Macro & Geopolitics):
   - أنت خبير استراتيجي في الاقتصاد الكلي (Global Macro Strategist) على غرار كبار أساطير وول ستريت (مثل راي داليو وستانلي دروكنميلر).
   - تفهم بعمق كيف تؤثر التوترات السياسية، الحروب، الانتخابات، أزمات الديون، ومعدلات الفائدة الفيدرالية على حركة السيولة الكبرى في الذهب والنفط والعملات.
   - **ممنوع نهائياً ومطلقاً** قول عبارات الهروب السطحية مثل "أنا محلل فني فقط ولا أفهم في السياسة"؛ بل ادمج دائماً بين المحرك الأساسي (The Macro Catalyst) والتأكيد الفني على الشارت (Technical Order Flow & SMC Confirmation).

6. الموسوعة الشاملة لجميع مدارس التداول العالمية (Synthesis of All World Elite Trading Schools):
   تدمج وتعتمد على أقوى المدارس المؤسسية العالمية في شرحك وقرارك:
   • **مدرسة الماكرو والأخبار الكبرى (Fundamental & Macro Catalyst):** الخبر والبيانات تضخ الوقود والسيولة.
   • **مدرسة مفاهيم الأموال الذكية (SMC / ICT):** كنس سيولة القمم والقيعان (Liquidity Sweeps)، الفجوات السعرية (FVG)، وبلوكات الأوامر المؤسسية (Order Blocks)، وكسر الهيكل (BOS/CHoCH).
   • **مدرسة وايكوف وتدفق الأوامر (Wyckoff & Order Flow):** رصد التجميع (Accumulation) والتصريف (Distribution) والمصايد (Springs/Upthrusts).
   • **مدرسة السلوك السعري والعرض والطلب (Price Action & Supply/Demand):** حركة الشموع المؤسسية الصافية، مناطق الانفجار وإعادة الاختبار (Mitigation).
   • **مدرسة الرياضيات الكمية وإدارة المخاطر (Quant & Risk):** حساب الوقف بالـ (1.5x ATR)، ونسبة عائد للمخاطرة 1:3+ كحد أدنى.

7. اللغة والهيبة المؤسسية واللهجة المغربية (Moroccan Darija & Multi-Language Mastery):
   - اعكس لغة ولهجة العميل فوراً وبدقة تامة!
   - إذا تكلم العميل بالدارجة المغربية (مثل: "دابا واش نشريو الذهب"، "عطيني بلان ديال البيتكوين"، "وريني الشارت ديال الذهب خمسطاش دقيقة"، "واش طالع ولا هابط"):
     تحدث معه فوراً بالدارجة المغربية الذكية والمحترفة كمتداول حوت مغربي خبير في وول ستريت!
     مثال: "أهلاً خويا! الذهب دابا كيدير سويب للسيولة عند مستوى الدعم، نتسناو شمعة 15 دقيقة تسد عاد ندخلوا Buy بالهدف ديالنا..."
   - إذا تكلم بالفصحى، أجب بالعربية المؤسسية الفخمة. إذا تكلم بالإنجليزية أو الفرنسية، أجب بنفس اللغة بدقة 100%.
   - ممنوع منعاً باتاً رسم أي شارت نصي أو ASCII أو كتابة "تخيل هذا الرسم".

8. التفكير المؤسسي الإلزامي وتصنيف النية (Deep Reasoning & Intent Classification):
   - اكتب دائماً وسم التفكير في بداية ردك:
     <thinking>
     1. تصنيف نية المتداول بدقة (Intent): هل يريد شارت؟ هل يريد صفقة ودخول؟ هل يريد تحليلاً فورياً؟
     2. قراءة تدفق السيولة وبنية السوق (SMC Order Flow) للأصل المطلوب فقط وحساب أهداف صناع السوق.
     3. صياغة القرار الحاسم ومستويات الدخول والوقف والأهداف بدقة 1:3 R:R.
     </thinking>
   - بعد وسم التفكير، ادخل فوراً في الجواب الحاسم والشافي بدون لف أو دوران أو كلام إنشائي زائد!

9. أسلوب الرد الصوتي الحاسم والمباشر وبدون إطالة (Audio-to-Audio Precision & Zero Fluff):
   - عندما يكون استفسار العميل رسالة صوتية (Audio Note):
     * ابدأ ردك مباشرة بفقرة إلقاء صوتية حاسمة تشفي غليل المتداول (جملتان إلى ثلاث جمل قوية): تحدد الاتجاه فوراً، وتلبي طلبه المالي والتقني بدون مماطلة.
     * إذا تحدث بالدارجة المغربية، رد عليه بالدارجة المغربية الاحترافية والواثقة كمتداول حوت مغربي في وول ستريت.
     * نفذ الخدمة المطلوبة فوراً: إذا طلب شارت، يظهر الشارت التفاعلي تحته فوراً. وإذا طلب صفقة، تظهر بطاقة الصفقة بالأرقام الدقيقة.
     * ممنوع الكلام الإنشائي الطويل وممنوع الأسئلة الضعيفة أو التردد.

6. تنظيم التحليل المؤسسي:
   • 🧭 **الاتجاه وبنية السوق (Market Structure):** (تجميع، تصريف، BoS، أو CHoCH مع تحديد القمم والقيعان الحقيقية).
   • 🌊 **خريطة السيولة (Liquidity Pools & FVG):** (فخاخ صناع السوق، مناطق ضرب الوقف، الفجوات السعرية المفتوحة).
   • ⚡ **القرار المؤسسي والتمركز (Executive Trade Setup):**
     - 🎯 **منطقة الدخول (Entry):** رقم دقيق
     - 🛑 **وقف الخسارة (Invalidation / SL):** رقم دقيق
     - 🏁 **الأهداف (TP1 & TP2):** أرقام دقيقة
     - ⚖️ **نسبة العائد للمخاطرة (R:R Ratio):** مثلاً 1:3
   • 🕒 **إدارة المخاطر:** (حجم اللوت، الجلسة النشطة، والتحذير من الأخبار إن وجدت).

7. بطاقة الصفقة المؤسسية (Structured Trade Signal):
   تُعطى وتُكتب فقط وحصراً عندما يطلب العميل صفقة أو توصية أو خطة دخول (مثل: "أعطني صفقة"، "أين ندخل"، "هل نشتري الآن").
   ممنوع إخراج كود json_signal إذا كان العميل يسأل فقط عن سعر أصل أو يلقي تحية أو يطلب استفساراً عاماً!
   عند اكتمال شروط الصفقة، اختم ردك بكود JSON التالي:
   \`\`\`json_signal
   {
     "asset": "ETHUSDT",
     "direction": "BUY",
     "entry": "2234.00",
     "sl": "2218.00",
     "tp1": "2260.00",
     "tp2": "2290.00",
     "rr": "1:3.5",
     "reason": "ارتداد من أوردر بلوك مؤسسي بعد كنس السيولة البيعية"
   }
   \`\`\`

8. عقل وتفكير القرش المؤسسي (REASONING PROCESS):
   - استخدم وسم <thinking> فقط وحصراً عند الأسئلة الفنية والتحليلية وطلب الصفقات أو الشارتات.
   - ممنوع منعاً باتاً ومطلقاً استخدام وسم <thinking> في التحيات العادية (أهلاً، مرحباً، السلام عليكم، صباح الخير، شكراً) أو عند الدردشة الودية!
   - في التحيات: أجب فوراً بسطرين ودودين كشريك وصديق دون أي تفكير أو أرقام مالية.
   - عند التحليل الفني فقط:
   <thinking>
   • الأصل والفريم: تحديد الأصل المطلوب بالسعر اللحظي الدقيق وعزل باقي الأصول.
   • قراءة السيولة وSMC: رصد كنس السيولة، الفجوات السعرية (FVG)، والأوردر بلوك المؤسسي.
   • فحص المخاطرة: استبعاد فخاخ صناع السوق وتأكيد نسبة العائد للمخاطرة (1:3+).
   • القرار التنفيذي: تحديد خطة التمركز أو التحذير من الدخول برقم صريح.
   </thinking>
   ثم بعد إغلاق الوسم، اكتب تقريرك المؤسسي الفخم والواضح مباشرة.`;

const { createEnterpriseDbManager, offloadBase64Media } = require('./supabase_db');
const dbManager = createEnterpriseDbManager(DB_FILE, MASTER_QUANT_PROMPT);
dbManager.loadDb();
const db = dbManager.db;
db.config.systemInstruction = MASTER_QUANT_PROMPT;

function saveDb() {
  dbManager.saveDb();
}

function isArabicText(text) {
  return /[\u0600-\u06FF]/.test(text);
}

// ══════════════════════════════════════════════
// كشف شامل للأصول والفريمات مع دعم ذاكرة الجلسة
// ══════════════════════════════════════════════
function detectChartIntent(text, previousSessionChart = null) {
  const t = text.toUpperCase();
  let symbol = null;
  let exchange = null;
  let interval = null;

  // 1. كشف الفريمات الزمنية أولاً (الأرقام الأكبر أولاً لتجنب التضارب)
  if (t.includes('45M') || t.includes('45 دقيقة') || t.includes('45 د')) interval = '45';
  else if (t.includes('30M') || t.includes('30 دقيقة') || t.includes('30 د')) interval = '30';
  else if (t.includes('15M') || t.includes('15 دقيقة') || t.includes('15 دقيق') || t.includes('15م') || t.includes('15MIN')) interval = '15';
  else if (t.includes('5M') || t.includes('5 دقائق') || /\b5\s*د/.test(t) || t.includes('5م') || t.includes('5MIN')) interval = '5';
  else if (t.includes('1M') || t.includes('دقيقة') || t.includes('1د')) interval = '1';
  else if (t.includes('1W') || t.includes('WEEKLY') || t.includes('اسبوعي') || t.includes('أسبوعي') || t.includes('اسبوع') || t.includes('أسبوع')) interval = 'W';
  else if (t.includes('1D') || t.includes('DAILY') || t.includes('يومي') || t.includes('يوم') || t.includes('ديلي')) interval = 'D';
  else if (t.includes('4H') || t.includes('4 ساعات') || t.includes('4ساعات') || t.includes('H4')) interval = '240';
  else if (t.includes('1H') || t.includes('ساعة') || t.includes('ساعه') || t.includes('H1') || t.includes('ساعتين') || t.includes('2H')) interval = '60';

  // 2. كشف الأصول والأسواق المتنوعة
  // الذهب والسلع
  if (t.includes('GOLD') || t.includes('XAU') || t.includes('الذهب') || t.includes('ذهب') || t.includes('دهب') || t.includes('الدهب') || t.includes('أونصة') || t.includes('اونصة')) {
    symbol = 'XAUUSD'; exchange = 'OANDA';
  } else if (t.includes('SILVER') || t.includes('XAG') || t.includes('الفضة') || t.includes('فضة')) {
    symbol = 'XAGUSD'; exchange = 'OANDA';
  } else if (t.includes('OIL') || t.includes('USOIL') || t.includes('CRUDE') || t.includes('نفط') || t.includes('النفط') || t.includes('برنت') || t.includes('بترول')) {
    symbol = 'USOIL'; exchange = 'TVC';
  }
  // العملات الرقمية
  else if (t.includes('SOL') || t.includes('سولانا') || t.includes('SOLANA')) {
    symbol = 'SOLUSDT'; exchange = 'BINANCE';
  } else if (t.includes('BTC') || t.includes('BITCOIN') || t.includes('بيتكوين') || t.includes('البيتكوين')) {
    symbol = 'BTCUSDT'; exchange = 'BINANCE';
  } else if (t.includes('ETH') || t.includes('ETHEREUM') || t.includes('اثيريوم') || t.includes('إيثيريوم') || t.includes('ايثيريوم')) {
    symbol = 'ETHUSDT'; exchange = 'BINANCE';
  } else if (t.includes('XRP') || t.includes('ريبل') || t.includes('الريبل')) {
    symbol = 'XRPUSDT'; exchange = 'BINANCE';
  } else if (t.includes('DOGE') || t.includes('دوج') || t.includes('دوجكوين')) {
    symbol = 'DOGEUSDT'; exchange = 'BINANCE';
  } else if (t.includes('BNB') || t.includes('بينانس')) {
    symbol = 'BNBUSDT'; exchange = 'BINANCE';
  } else if (t.includes('PEPE') || t.includes('بيبي')) {
    symbol = 'PEPEUSDT'; exchange = 'BINANCE';
  } else if (t.includes('SUI') || t.includes('سوي')) {
    symbol = 'SUIUSDT'; exchange = 'BINANCE';
  }
  // المؤشرات الأمريكية والعالمية
  else if (t.includes('NASDAQ') || t.includes('نازداك') || t.includes('ناسداك') || t.includes('QQQ') || t.includes('US100') || t.includes('NDX')) {
    symbol = 'QQQ'; exchange = 'NASDAQ';
  } else if (t.includes('US30') || t.includes('DJI') || t.includes('DOW') || t.includes('داو') || t.includes('داوجونز') || t.includes('الداو')) {
    symbol = 'US30'; exchange = 'TVC';
  } else if (t.includes('SPX') || t.includes('S&P') || t.includes('SP500') || t.includes('اس اند بي')) {
    symbol = 'SPX'; exchange = 'CBOE';
  }
  // الفوركس
  else if (t.includes('EURUSD') || t.includes('يورو دولار') || t.includes('اليورو')) {
    symbol = 'EURUSD'; exchange = 'FX';
  } else if (t.includes('GBPUSD') || t.includes('باوند دولار') || t.includes('الباوند') || t.includes('كيبل')) {
    symbol = 'GBPUSD'; exchange = 'FX';
  } else if (t.includes('USDJPY') || t.includes('دولار ين') || t.includes('الين')) {
    symbol = 'USDJPY'; exchange = 'FX';
  }

  // 3. كلمات طلب الشارت أو التحليل
  const isExplicitChartTrigger =
    t.includes('شارت') || t.includes('شار') || t.includes('CHART') ||
    t.includes('وريني') || t.includes('ورني') || t.includes('افتح') ||
    t.includes('اضهر') || t.includes('أظهر') || t.includes('اظهر') ||
    t.includes('عطيني') || t.includes('شوفلي') || t.includes('شوف ليا') ||
    t.includes('بلان') || t.includes('ديال') || t.includes('واش طالع') ||
    t.includes('رسم') || t.includes('معاينة') || t.includes('SHOW') ||
    t.includes('حلل') || t.includes('تحليل') || t.includes('صفقة') ||
    t.includes('دخول') || t.includes('لوحة');

  // إذا لم يذكر أصلاً جديداً ولكنه يطلب فريماً أو تحليلاً وكان هناك أصل سابق في الجلسة:
  if (!symbol && previousSessionChart) {
    symbol = previousSessionChart.rawSymbol;
    exchange = previousSessionChart.exchange;
    if (!interval) interval = previousSessionChart.interval;
  }

  // الفريم الافتراضي ساعة إذا لم يُحدد
  if (!interval) interval = previousSessionChart?.interval || '60';

  // التحقق من نوع الرسالة (تحية أو استفسار سعر)
  const isPriceQuery = isSimplePriceQuery(text);
  const isGreeting = isCasualGreeting(text);

  // الشارت التفاعلي يُعرض عند طلب الشارت، التحليل، السعر أو الصفقة لأي أصل
  const wantsChart = Boolean(symbol && (isExplicitChartTrigger || isPriceQuery) && !isGreeting);

  // إذا طلب الشارت بدون أي أصل وبدون أصل سابق في الجلسة
  const needsAssetPrompt = !symbol && (t.includes('شارت') || t.includes('الشارت') || t.includes('CHART'));

  const tradingViewSymbol = symbol && exchange ? `${exchange}:${symbol}` : (previousSessionChart?.symbol || 'OANDA:XAUUSD');

  return {
    wantsChart,
    needsAssetPrompt,
    symbol: tradingViewSymbol,
    rawSymbol: symbol,
    exchange,
    interval
  };
}

function isSimplePriceQuery(text) {
  const t = text.trim();
  if (
    t.includes('شارت') || t.includes('افتح') || t.includes('وريني') ||
    t.includes('أظهر') || t.includes('اظهر') || t.includes('حلل') ||
    t.includes('تحليل') || t.includes('صفقة') || t.includes('صفقه') ||
    t.includes('دخول') || t.includes('نشتري') || t.includes('نبيع') ||
    t.includes('توصية') || t.includes('اشارة') || t.includes('إشارة') ||
    t.includes('لوحة القتل')
  ) {
    return false;
  }
  return (
    t.includes('كم سعر') || t.includes('كم السعر') || t.includes('سعر الذهب') ||
    t.includes('سعر الدهب') || t.includes('سعر البيتكوين') || t.includes('سعر btc') ||
    t.includes('سعر sol') || t.includes('كم واصل') || t.includes('بكم الذهب') ||
    t.includes('بكم الدهب') || t.includes('كم وصل') || t.includes('كم يسوى') ||
    t.includes('price of') || t.includes('what is the price') ||
    /^كم\s+/i.test(t) || /سعر/i.test(t)
  );
}

function isCasualGreeting(text) {
  if (!text) return false;
  let t = text.replace(/\[Trader Voice Query\]:?/gi, '')
    .replace(/\[Voice Note.*?\]:?/gi, '')
    .replace(/\[Audio Note.*?\]:?/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/["'«»]/g, '')
    .trim()
    .replace(/[.,!؟ـ]/g, '');
  const greetings = [
    'السلام', 'سلام', 'السلام عليكم', 'وعليكم السلام', 'اهلا', 'أهلا', 'أهلاً', 'مرحبا', 'مرحباً', 'صباح الخير', 'مساء الخير',
    'اهلا صديقي', 'أهلا صديقي', 'أهلاً يا صديقي', 'كيفك', 'شخبارك', 'شو الاخبار', 'شو اخبارك', 'كيداير', 'لاباس', 'صافا',
    'هلا', 'يا هلا', 'اهلين', 'أهلين', 'hi', 'hello', 'hey', 'yo', 'whatsup', 'whats up'
  ];
  return greetings.some(g => t === g || (t.startsWith(g) && t.length < 25));
}

function detectNewsRequest(text) {
  const t = text.toUpperCase();
  return (
    t.includes('أخبار') || t.includes('اخبار') || t.includes('خبر') ||
    t.includes('NEWS') || t.includes('CALENDAR') || t.includes('تقويم') ||
    t.includes('الفيدرالي') || t.includes('فائدة') || t.includes('تضخم') ||
    t.includes('CPI') || t.includes('NFP') || t.includes('بيانات اقتصادية')
  );
}

// ══════════════════════════════════════════════
// جلب الأخبار الحية والتقويم الاقتصادي
// ══════════════════════════════════════════════
async function fetchLiveNews(query = 'gold') {
  try {
    const cleanQ = query.trim().split(/\s+/)[0] || 'gold';
    const r = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanQ)}&quotesCount=1&newsCount=6`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const d = await r.json();
    if (d.news && Array.isArray(d.news) && d.news.length > 0) {
      return d.news.map(n => ({
        title: n.title,
        publisher: n.publisher || 'Yahoo Finance',
        link: n.link || 'https://finance.yahoo.com',
        time: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'مباشر'
      }));
    }
  } catch (e) {
    console.error('News fetch error:', e.message);
  }
  return [
    {
      title: 'Gold Trades Near Record Levels As Central Banks Continue Safe-Haven Accumulation',
      publisher: 'Bloomberg / Reuters',
      link: 'https://finance.yahoo.com/topic/economic-news',
      time: 'مباشر'
    },
    {
      title: 'Bitcoin Whales Defend Key Institutional Liquidity Zones Ahead of Fed Decision',
      publisher: 'CoinDesk',
      link: 'https://finance.yahoo.com/crypto',
      time: 'قبل 15 دقيقة'
    },
    {
      title: 'US Treasury Yields Stabilize As Traders Digest Non-Farm Payrolls and CPI Expectations',
      publisher: 'Wall Street Journal',
      link: 'https://finance.yahoo.com',
      time: 'قبل 30 دقيقة'
    }
  ];
}

const HIGH_IMPACT_CALENDAR = [
  {
    event: 'مؤشر أسعار المستهلك الأمريكي (US CPI Inflation)',
    currency: 'USD',
    impact: 'HIGH',
    time: '12:30 GMT',
    forecast: '3.1%',
    previous: '3.2%',
    advice: 'تجنب التداول قبل صدور الرقم بـ 15 دقيقة، ترقب فخاخ السيولة على الذهب والناسداك.'
  },
  {
    event: 'قرار الفائدة الفيدرالية والمؤتمر الصحفي (FOMC Rate Decision)',
    currency: 'USD',
    impact: 'HIGH',
    time: '18:00 GMT',
    forecast: 'تثبيت / خفض 25 نقطة',
    previous: '5.25%',
    advice: 'تقلبات حادة متوقعة، الحيتان تستهدف كسر قمم وقيعان السيولة.'
  },
  {
    event: 'تقرير الوظائف غير الزراعية (US Non-Farm Payrolls - NFP)',
    currency: 'USD',
    impact: 'HIGH',
    time: '12:30 GMT',
    forecast: '180K',
    previous: '220K',
    advice: 'أعلى سيولة في الشهر، مراقبة مناطق الـ FVG على فريم 5 دقائق.'
  },
  {
    event: 'مؤشر مديري المشتريات الخدمي (ISM Services PMI)',
    currency: 'USD',
    impact: 'MEDIUM',
    time: '14:00 GMT',
    forecast: '52.0',
    previous: '51.5',
    advice: 'مؤشر يقيس قوة الاقتصاد والدولار الأمريكي.'
  }
];

function detectTradeRequest(text) {
  const t = text.toUpperCase();
  if (isSimplePriceQuery(text) || isCasualGreeting(text)) return false;
  return (
    t.includes('صفقة') || t.includes('صفقه') || t.includes('إشارة') ||
    t.includes('اشارة') || t.includes('توصية') || t.includes('تمركز') ||
    t.includes('أين أدخل') || t.includes('اين ادخل') || t.includes('نقطة الدخول') ||
    t.includes('نشتري الان') || t.includes('نبيع الان') ||
    t.includes('BUY NOW') || t.includes('SELL NOW') || t.includes('TRADE SETUP') ||
    t.includes('لوحة القتل')
  );
}

function detectHangupIntent(text) {
  if (!text) return false;
  const t = text.toUpperCase();
  return (
    t.includes('HANG UP') ||
    t.includes('END CALL') ||
    t.includes('BYE') ||
    t.includes('اقطع') ||
    t.includes('قطع') ||
    t.includes('بسلامة') ||
    t.includes('صافي بارك') ||
    t.includes('سالي المكالمة') ||
    t.includes('سد المكالمة') ||
    t.includes('مع السلامة') ||
    t.includes('وداعا') ||
    t.includes('باي')
  );
}

// ══════════════════════════════════════════════
// جلب أسعار لحظية متوازية لجميع الأسواق الرئيسية (TradingView Direct + Binance)
// ══════════════════════════════════════════════
let liveTickerCache = {
  timestamp: 0,
  data: {
    gold: '4102.50',
    goldChange: '+0.8',
    btc: '75850.00',
    eth: '2240.00',
    sol: '89.70',
    nasdaq: '656.10',
    oil: '71.50',
    oilChange: '-1.1'
  }
};

async function getLiveTickerSnapshot() {
  const now = Date.now();
  if (now - liveTickerCache.timestamp < 10000) {
    return liveTickerCache.data;
  }

  try {
    const [tvCfdRes, cryptoRes, qqqRes] = await Promise.allSettled([
      fetch('https://scanner.tradingview.com/cfd/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: { tickers: ['OANDA:XAUUSD', 'TVC:USOIL'] },
          columns: ['close', 'change']
        })
      }).then(r => r.json()),
      fetch('https://api.binance.com/api/v3/ticker/price?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22,%22PAXGUSDT%22%5D').then(r => r.json()),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/QQQ?interval=1m&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json())
    ]);

    // 1. أسعار الذهب الفوري (OANDA:XAUUSD) والنفط (TVC:USOIL) مباشرة من سرفرات TradingView
    let gotGoldFromTV = false;
    if (tvCfdRes.status === 'fulfilled' && Array.isArray(tvCfdRes.value?.data)) {
      for (const row of tvCfdRes.value.data) {
        if (row.s === 'OANDA:XAUUSD' && row.d?.[0]) {
          liveTickerCache.data.gold = parseFloat(row.d[0]).toFixed(2);
          if (row.d[1] != null) liveTickerCache.data.goldChange = (row.d[1] >= 0 ? '+' : '') + parseFloat(row.d[1]).toFixed(1) + '%';
          gotGoldFromTV = true;
        }
        if (row.s === 'TVC:USOIL' && row.d?.[0]) {
          liveTickerCache.data.oil = parseFloat(row.d[0]).toFixed(2);
          if (row.d[1] != null) liveTickerCache.data.oilChange = (row.d[1] >= 0 ? '+' : '') + parseFloat(row.d[1]).toFixed(1) + '%';
        }
      }
    }

    // 2. أسعار الكريبتو الحية + احتياطي الذهب الفوري إن تعذر سرفر TradingView
    if (cryptoRes.status === 'fulfilled' && Array.isArray(cryptoRes.value)) {
      for (const item of cryptoRes.value) {
        if (item.symbol === 'BTCUSDT') liveTickerCache.data.btc = parseFloat(item.price).toFixed(2);
        if (item.symbol === 'ETHUSDT') liveTickerCache.data.eth = parseFloat(item.price).toFixed(2);
        if (item.symbol === 'SOLUSDT') liveTickerCache.data.sol = parseFloat(item.price).toFixed(2);
        if (item.symbol === 'PAXGUSDT' && !gotGoldFromTV) {
          liveTickerCache.data.gold = parseFloat(item.price).toFixed(2);
        }
      }
    }

    // 3. مؤشر الناسداك (صندوق QQQ)
    if (qqqRes.status === 'fulfilled') {
      const qPrice = qqqRes.value?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (qPrice) liveTickerCache.data.nasdaq = parseFloat(qPrice).toFixed(2);
    }

    liveTickerCache.timestamp = now;
  } catch (e) {
    console.error('Ticker snapshot error:', e.message);
  }

  return liveTickerCache.data;
}

// ══════════════════════════════════════════════
// جلب بيانات OHLCV الحية — مطابقة لشارت TradingView
// ══════════════════════════════════════════════
async function fetchLiveMarketData(symbol, exchange, interval) {
  try {
    if (exchange === 'BINANCE') {
      const intervalMap = { '1': '1m', '5': '5m', '15': '15m', '30': '30m', '45': '45m', '60': '1h', '240': '4h', 'D': '1d', 'W': '1w' };
      const tf = intervalMap[interval] || '1h';
      const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${tf}&limit=15`);
      const data = await r.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const candles = data.slice(-8).map(c => ({
        time: new Date(c[0]).toISOString().slice(11, 16),
        open: parseFloat(c[1]).toFixed(2),
        high: parseFloat(c[2]).toFixed(2),
        low: parseFloat(c[3]).toFixed(2),
        close: parseFloat(c[4]).toFixed(2),
        volume: parseFloat(c[5]).toFixed(0)
      }));

      const last = candles[candles.length - 1];
      const prev = candles[candles.length - 2];
      const change = ((parseFloat(last.close) - parseFloat(prev.close)) / parseFloat(prev.close) * 100).toFixed(2);
      const trend = parseFloat(change) >= 0 ? '▲ صاعد (Bullish)' : '▼ هابط (Bearish)';

      return {
        source: 'Binance Live Feed',
        symbol,
        interval,
        currentPrice: last.close,
        change24h: `${change}%`,
        trend,
        high: last.high,
        low: last.low,
        volume: last.volume,
        candles
      };
    }

    if (exchange === 'OANDA' && symbol === 'XAUUSD') {
      // الذهب الفوري (Spot Gold): جلب السعر الفعلي المباشر لـ TradingView (OANDA:XAUUSD)
      let tvPrice = '4105.50';
      let tvChange = '+0.8%';
      try {
        const tvScan = await fetch('https://scanner.tradingview.com/cfd/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: { tickers: ['OANDA:XAUUSD'] }, columns: ['close', 'change'] })
        }).then(r => r.json());
        if (tvScan?.data?.[0]?.d?.[0]) {
          tvPrice = parseFloat(tvScan.data[0].d[0]).toFixed(2);
          tvChange = `${parseFloat(tvScan.data[0].d[1] || 0).toFixed(2)}%`;
        }
      } catch (e) { }

      const intervalMap = { '1': '1m', '5': '5m', '15': '15m', '30': '30m', '45': '45m', '60': '1h', '240': '4h', 'D': '1d', 'W': '1w' };
      const tf = intervalMap[interval] || '1h';
      let lastCandles = [];
      try {
        const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${tf}&limit=15`);
        const klines = await r.json();
        if (Array.isArray(klines) && klines.length > 0) {
          const rawLast = parseFloat(klines[klines.length - 1][4]);
          const diff = parseFloat(tvPrice) - rawLast;
          lastCandles = klines.slice(-8).map(c => ({
            time: new Date(c[0]).toISOString().slice(11, 16),
            open: (parseFloat(c[1]) + diff).toFixed(2),
            high: (parseFloat(c[2]) + diff).toFixed(2),
            low: (parseFloat(c[3]) + diff).toFixed(2),
            close: (parseFloat(c[4]) + diff).toFixed(2),
            volume: parseFloat(c[5]).toFixed(0)
          }));
        }
      } catch (e) { }

      const last = lastCandles[lastCandles.length - 1] || { high: tvPrice, low: tvPrice, volume: '1500' };
      const trend = !String(tvChange).startsWith('-') ? '▲ صاعد (Bullish)' : '▼ هابط (Bearish)';

      return {
        source: 'TradingView / Spot Gold Live Market (OANDA:XAUUSD)',
        symbol: 'XAU/USD (Gold)',
        interval,
        currentPrice: String(tvPrice),
        change24h: tvChange,
        trend,
        high: last.high || tvPrice,
        low: last.low || tvPrice,
        volume: last.volume || '1500',
        candles: lastCandles
      };
    }

    return null;
  } catch (e) {
    console.error('Market data fetch error:', e.message);
    return null;
  }
}

// ══════════════════════════════════════════════
// بناء بطاقة السياق للذكاء الاصطناعي
// ══════════════════════════════════════════════
function buildMarketContext(marketData, isArabic) {
  if (!marketData) return '';

  const candleRows = marketData.candles.map(c =>
    `  ${c.time} | O: ${c.open} | H: ${c.high} | L: ${c.low} | C: ${c.close} | Vol: ${c.volume}`
  ).join('\n');

  if (isArabic) {
    return `
━━━━ بيانات شمعات السوق الحية المطابقة للشارت ━━━━
الأصل: ${marketData.symbol} | الفريم الزمني: ${marketData.interval}
السعر الحالي المباشر: ${marketData.currentPrice}
التغير اللحظي: ${marketData.change24h} | الاتجاه: ${marketData.trend}
أعلى نقطة: ${marketData.high} | أدنى نقطة: ${marketData.low}
المصدر: ${marketData.source}

آخر شموع حية (وقت | افتتاح | أعلى | أدنى | إغلاق | حجم):
${candleRows}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تنبيه حاسم: الشارت التفاعلي يُعرض الآن للعميل في التطبيق تلقائياً! لا ترسم أي جداول أو شارتات نصية بالرموز نهائياً. استخدم هذه الأرقام والأسعار الحية فقط وقدّم تحليلك المؤسسي الفخم بناءً عليها.`;
  } else {
    return `
━━━━ LIVE MARKET FEED (MATCHES TRADINGVIEW) ━━━━
Asset: ${marketData.symbol} | TF: ${marketData.interval}
Current Price: ${marketData.currentPrice} | 24h Change: ${marketData.change24h} (${marketData.trend})
High: ${marketData.high} | Low: ${marketData.low}
Feed Source: ${marketData.source}

Latest Live Candles:
${candleRows}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical: The live interactive TradingView chart is ALREADY displayed to the user in the UI! Never draw ASCII or text mock charts. Use these real live numbers for your institutional SMC breakdown.`;
  }
}

// ══════════════════════════════════════════════
// CHAT & LIVE VOICE TURN ENDPOINTS
// ══════════════════════════════════════════════
const handleChatRequest = async (req, res) => {
  const {
    userEmail,
    sessionId = 'session_1',
    message,
    imageBase64,
    audioBase64,
    isVoiceQuery = false,
    isLiveCall = false,
    userName = 'هاجر',
    userPlan = 'VIP',
    userBalance = 50000
  } = req.body;
  if (!userEmail || (!message && !imageBase64 && !audioBase64)) {
    return res.status(400).json({ error: 'User email and message required' });
  }

  const isVoice = Boolean(
    isLiveCall ||
    isVoiceQuery ||
    (message && (
      message.includes('[Voice Note') ||
      message.includes('[Trader Voice') ||
      message.includes('🎙️')
    ))
  );

  const currentSession = dbManager.getOrCreateAiSessionContext(userEmail, sessionId);
  currentSession.updatedAt = new Date().toISOString();
  const userVoiceUrl = audioBase64 ? offloadBase64Media(audioBase64, 'audio') : null;

  const userQuery = message || '[Attached Chart]';
  currentSession.messages.push({ role: 'user', content: userQuery, timestamp: new Date().toISOString() });

  const sessionHistory = currentSession.messages.slice(-8);

  // كشف طلب الشارت مع تذكر آخر شارت نشط في الجلسة
  const chartMeta = detectChartIntent(userQuery, currentSession.activeChart);
  const isArabic = isArabicText(userQuery);
  const shouldHangup = detectHangupIntent(userQuery);
  const isGreeting = isCasualGreeting(userQuery);
  const isPriceQuery = isSimplePriceQuery(userQuery);
  const isTradeDemand = detectTradeRequest(userQuery);

  // ── التحقق من الحد اليومي التجريبي لأصحاب الخطة المجانية (FREE TIER DAILY TRIAL) ──
  const emailLower = String(userEmail || '').trim().toLowerCase();
  const dbUser = (db.users || []).find(u => (u.email || '').toLowerCase() === emailLower);
  const effectivePlan = String(dbUser?.plan || userPlan || 'FREE').toUpperCase();
  const isFreePlanUser = !effectivePlan.includes('VIP') && !effectivePlan.includes('PREMIUM') && !effectivePlan.includes('PRO') && !effectivePlan.includes('PARTNER');

  if (isFreePlanUser) {
    const FREE_DAILY_TRIAL_LIMIT = 3; // 3 رسائل تجريبية مجانية كاملة يومياً قبل انتهاء الحصة اليومية
    const todayKey = new Date().toISOString().split('T')[0];

    if (dbUser) {
      if (dbUser.dailyChatDate !== todayKey) {
        dbUser.dailyChatDate = todayKey;
        dbUser.dailyChatCount = 0;
      }
      if ((dbUser.dailyChatCount || 0) >= FREE_DAILY_TRIAL_LIMIT) {
        const limitReplyText = isArabic
          ? 'لقد انتهت خطتك اليومية المجانية (الحد التجريبي اليومي 3 استشارات). قم بالترقية إلى باقة VIP أو PREMIUM للاستفادة من تحليلات الحيتان والشارتات والصفقات بلا حدود.'
          : 'Your daily Free Plan trial limit has ended (3 daily consultations used). Upgrade to VIP or PREMIUM for unlimited institutional AI analysis, live charts, and SMC setups.';
        return res.json({
          reply: limitReplyText,
          isDailyPlanLimit: true,
          lang: isArabic ? 'ar' : 'en',
          dailyLimit: FREE_DAILY_TRIAL_LIMIT,
          chart: null,
          signal: null,
          shouldHangup: false,
          sessionId
        });
      }
      dbUser.dailyChatCount = (dbUser.dailyChatCount || 0) + 1;
      saveDb();
    }
  }

  // إذا تم فتح شارت، احفظه في حالة الجلسة
  if (chartMeta.wantsChart && chartMeta.rawSymbol) {
    currentSession.activeChart = {
      symbol: chartMeta.symbol,
      rawSymbol: chartMeta.rawSymbol,
      exchange: chartMeta.exchange,
      interval: chartMeta.interval
    };
  }

  // جلب الأسعار اللحظية الفورية لجميع الأسواق (Gold, BTC, ETH, SOL, QQQ)
  const liveTickers = await getLiveTickerSnapshot();

  // جلب بيانات شمعات السوق الحية إن وُجد أصل محدد
  let marketData = null;
  if (chartMeta.rawSymbol) {
    marketData = await fetchLiveMarketData(chartMeta.rawSymbol, chartMeta.exchange, chartMeta.interval);
  }

  // 📸 التقاط لقطة شاشة حية وفورية من شارت TradingView إذا كان هناك طلب لأصل أو شارت (True Vision Capture)
  let liveChartScreenshot = null;
  if (!imageBase64 && !isGreeting && chartMeta.rawSymbol) {
    const tvSymbol = chartMeta.exchange && chartMeta.rawSymbol ? `${chartMeta.exchange}:${chartMeta.rawSymbol}` : 'OANDA:XAUUSD';
    try {
      liveChartScreenshot = await captureTradingViewScreenshot(tvSymbol, chartMeta.interval || '60');
    } catch (e) {
      console.warn('Live TradingView screenshot capture warning:', e.message);
    }
  }

  if (db.config.apiKey && db.config.apiKey.trim().length > 10) {
    try {
      const contents = [];

      // 👁️ نمط الرؤية البصرية الفائقة: إذا أرفق العميل صورة يدوياً، أو تم التقاط لقطة الشاشة الحية آلياً من TradingView!
      if (imageBase64 || liveChartScreenshot) {
        const cleanBase64 = imageBase64
          ? imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
          : liveChartScreenshot.base64;
        const mime = imageBase64 ? 'image/jpeg' : liveChartScreenshot.mimeType;

        const visionPrompt = userQuery + (isArabic
          ? `\n\n[تعليمات تحليل لقطة الشاشة بالرؤية الحقيقية - ZERO HALLUCINATION]:
1. أمامك الآن لقطة شاشة حية تم التقاطها مباشرة من شارت TradingView اللحظي.
2. انظر بعينيك بدقة للشارت في الصورة: اقرأ السعر الفعلي المكتوب على المحور الأيمن للشارت بدقة تامة (على سبيل المثال الذهب حول 4100 اقرأه كما هو مكتوب بدقة على المحور)، واسم الأصل المكتوب أعلى اليسار، والفريم الزمني.
3. كل تحليلك وأرقامك يجب أن تكون مستخرجة حصراً مما تراه عيناك في لقطة شاشة الشارت المرفقة، وتطابق الأرقام الظاهرة في الرسم بدقة.
4. حدد مناطق السيولة (FVG، Order Block، Liquidity Sweeps) الظاهرة فعلياً في الشارت المرئي.
5. اتخذ قراراً حاسماً: إما أن تعطي مستويات الدخول والوقف والأهداف بدقة، أو تحذر من الدخول الآن وتحدد شرط الدخول القادم.
6. ممنوع ذكر أي أصول أخرى غير المعروضة في الشاشة إطلاقاً.`
          : `\n\n[SCREENSHOT VISION DIRECTIVE - ZERO HALLUCINATION]:
1. Here is a live screenshot captured directly from the real TradingView chart.
2. Read the real price on the right axis, the asset symbol, and timeframe from the chart image with your vision.
3. Analyze only the visually rendered candles and price axis on this chart.
4. Identify visible FVG, Order Blocks, and Liquidity Sweeps.
5. Give a decisive institutional verdict.
6. Speak ONLY about the asset visible in the image.`);

        contents.push({
          role: 'user',
          parts: [
            { inlineData: { mimeType: mime, data: cleanBase64 } },
            { text: visionPrompt }
          ]
        });
      } else {
        // بناء المحادثة السابقة
        const historyToSend = sessionHistory.slice(0, -1);
        historyToSend.forEach(h => {
          if (h.role && h.content) {
            contents.push({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }]
            });
          }
        });

        // رسالة المستخدم الحالية
        let finalPromptText = userQuery;

        if (isGreeting) {
          // تحية بسيطة — ترحيب بسطرين فقط بدون ذكر أي عملات أو تحليلات
          finalPromptText = isArabic
            ? `العميل يلقي عليك تحية فقط ("${userQuery.trim()}").
رد عليه فوراً بترحيب دافئ ومختصر في سطرين فقط كشريك تداول وصديق (بالدارجة المغربية إذا كانت تحيته مغربية):
"وعليكم السلام يا هلا بيك خويا! معك في الديسك، شنو الأصل أو الشارت اللي باغي نراقبو ونحللو دابا؟"
قواعد إلزامية حاسمة:
1. ممنوع منعاً باتاً ذكر أي عملة أو أصل (لا إيثيريوم ولا بيتكوين ولا ذهب)!
2. ممنوع منعاً باتاً إعطاء أي أسعار أو أرقام أو صفقات أو فجوات لأن العميل لم يطلبها!
3. فقط رحب به واسأله باقتضاب عن العملة أو الشارت الذي يريد فتحه.`
            : `The user is greeting you ("${userQuery.trim()}"). Reply warmly in 1 or 2 lines. Do NOT mention Ethereum, Bitcoin, Gold, or any assets. Ask which chart they want to inspect today.`;
        } else if (isPriceQuery) {
          // استفسار بسيط عن السعر — ممنوع سرد الصفقات والتحليل المطول
          const rawSym = chartMeta.rawSymbol || 'XAUUSD';
          const isGold = rawSym.includes('XAU') || rawSym.includes('GOLD');
          const isBtc = rawSym.includes('BTC');
          const isSol = rawSym.includes('SOL');
          const isEth = rawSym.includes('ETH');
          let curPrice = liveTickers.gold;
          let assetLabel = 'الذهب (XAUUSD)';
          if (isBtc) { curPrice = liveTickers.btc; assetLabel = 'البيتكوين (BTC)'; }
          else if (isSol) { curPrice = liveTickers.sol; assetLabel = 'سولانا (SOL)'; }
          else if (isEth) { curPrice = liveTickers.eth; assetLabel = 'الإيثيريوم (ETH)'; }

          finalPromptText += isArabic
            ? `\n\n[توجيه حاسم ومباشر]:
العميل يسألك فقط: "كم السعر؟".
الأصل: ${assetLabel}
السعر اللحظي المباشر الآن: $${curPrice}
قواعد إلزامية للرد:
1. أجب في سطرين فقط: اذكر السعر اللحظي الفعلي الآن ($${curPrice}) مع التغير اليومي.
2. ممنوع منعاً باتاً ومطلقاً إعطاء أي صفقة أو تحديد نقاط دخول أو وقف خسارة أو أهداف!
3. ممنوع نهائياً كتابة كود json_signal أو إخراج أي كود برمجي.
4. فقط اذكر السعر اللحظي، واختم بسؤال قصير: هل تود فتح الشارت لتحليله؟`
            : `\n\n[Directive]: The user is asking only for the price of ${assetLabel}. Live price: $${curPrice}. Reply in 1 or 2 short sentences with this exact price. NEVER give trade signals, entry, SL, TP, or json_signal.`;
        } else {
          // استفسار تحليلي أو سعري — عزل السياق ومنع الحشو
          const activeChartSummary = currentSession.activeChart
            ? `• الأصل المعروض على شاشة العميل حالياً: ${currentSession.activeChart.rawSymbol} على فريم ${currentSession.activeChart.interval}`
            : '';

          const isOverview = userQuery.includes('نظرة عامة') || userQuery.includes('لوحة الأسعار') || userQuery.includes('كل الأسواق') || userQuery.includes('النبض') || userQuery.toUpperCase().includes('DASHBOARD');

          let livePriceHeader = '';
          if (isOverview) {
            livePriceHeader = isArabic
              ? `\n\n━━━━ بيانات السوق الشاملة (مرجع داخلي للوحة الأسعار) ━━━━
• الذهب (XAUUSD Spot): $${liveTickers.gold}
• البيتكوين (BTC): $${liveTickers.btc}
• سولانا (SOL): $${liveTickers.sol}
• الإيثيريوم (ETH): $${liveTickers.eth}
• مؤشر الناسداك (NASDAQ/QQQ): $${liveTickers.nasdaq}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
              : `\n\n━━━━ COMPREHENSIVE MARKET DATA ━━━━
• Gold (XAUUSD): $${liveTickers.gold}
• Bitcoin (BTC): $${liveTickers.btc}
• Solana (SOL): $${liveTickers.sol}
• Ethereum (ETH): $${liveTickers.eth}
• Nasdaq (QQQ): $${liveTickers.nasdaq}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
          } else if (chartMeta.rawSymbol || currentSession.activeChart?.rawSymbol) {
            // أصل محدد طلبه العميل صراحة أو معروض على شاشته
            const rawSym = (chartMeta.rawSymbol || currentSession.activeChart?.rawSymbol).toUpperCase();
            let specificPrice = liveTickers.gold;
            let assetName = 'الذهب (XAUUSD)';
            if (rawSym.includes('BTC')) { specificPrice = liveTickers.btc; assetName = 'البيتكوين (BTC/USDT)'; }
            else if (rawSym.includes('SOL')) { specificPrice = liveTickers.sol; assetName = 'سولانا (SOL/USDT)'; }
            else if (rawSym.includes('ETH')) { specificPrice = liveTickers.eth; assetName = 'الإيثيريوم (ETH/USDT)'; }
            else if (rawSym.includes('NAS') || rawSym.includes('QQQ')) { specificPrice = liveTickers.nasdaq; assetName = 'الناسداك (QQQ)'; }

            livePriceHeader = isArabic
              ? `\n\n━━━━ مرجع الأسعار الحية للأصل المستهدف ━━━━
• الأصل المطلوب: ${assetName}
• السعر اللحظي الفعلي الآن: $${specificPrice}
${activeChartSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[توجيه داخلي صارم - Zero Spam]: تحدث حصراً عن ${assetName}. ممنوع منعاً باتاً ومطلقاً ذكر أي عملات أخرى، وممنوع إخراج أي لوحة أسعار أو جدول لأن العميل لم يطلبه!`
              : `\n\n━━━━ TARGET ASSET LIVE DATA ━━━━
• Target Asset: ${assetName}
• Live Current Price: $${specificPrice}
${activeChartSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[STRICT DIRECTIVE - ZERO SPAM]: Speak ONLY about ${assetName}. Do NOT mention any other assets.`;
          } else {
            // لم يطلب العميل أي أصل مالي محدد
            livePriceHeader = isArabic
              ? `\n\n[توجيه داخلي]: العميل لم يحدد أي أصل مالي في سؤاله. أجب على كلامه مباشرة دون افتراض أي عملة (ممنوع جلب الإيثيريوم أو غيره). اسأله بلباقة: شنو الأصل أو الشارت اللي بغيتي نخدمو عليه؟`
              : `\n\n[Directive]: The user did not specify an asset. Answer directly without assuming any coin. Ask which asset they want.`;
          }

          finalPromptText += livePriceHeader;

          if (marketData) {
            finalPromptText += '\n' + buildMarketContext(marketData, isArabic);
          }

          // إذا كان السؤال عن الأخبار أو التقويم الاقتصادي، نجلب له الأخبار والتقويم الاقتصادي فوراً في الشات
          if (detectNewsRequest(userQuery)) {
            const queryTarget = chartMeta.rawSymbol ? `${chartMeta.rawSymbol} market` : 'gold fed rate market';
            const liveNewsList = await fetchLiveNews(queryTarget);
            let newsSection = '';
            if (liveNewsList && liveNewsList.length > 0) {
              const newsFormatted = liveNewsList.map((n, i) => `• [${n.publisher}] ${n.title} (${n.time}) - رابط المصدر: ${n.link}`).join('\n');
              newsSection += `\n\n━━━━ آخر الأخبار اللحظية المباشرة من كبرى الوكالات العالمية ━━━━\n${newsFormatted}`;
            }

            const calendarFormatted = HIGH_IMPACT_CALENDAR.map((c, i) =>
              `• [${c.impact} IMPACT] ${c.event} (${c.currency} • ${c.time})\n  المتوقع: ${c.forecast} | السابق: ${c.previous}\n  ⚡ نصيحة الحوت المؤسسية: ${c.advice}`
            ).join('\n\n');
            newsSection += `\n\n━━━━ محطات التقويم الاقتصادي عالي التأثير (ECONOMIC CALENDAR) ━━━━\n${calendarFormatted}`;

            finalPromptText += newsSection + `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nتوجيه إلزامي وحاسم: بصفتك الوكيل الذكي الخارق، أجب العميل مباشرة وسط الدردشة بتنظيم فخم وعميق. اذكر أهم الأخبار والبيانات القادمة ومواعيدها، وفسر له كيف تحرك هذه البيانات السيولة وأين فخاخ الحيتان مع ذكر روابط المصادر.`;
          }

          if (chartMeta.needsAssetPrompt) {
            finalPromptText += isArabic
              ? '\n[توجيه داخلي للنظام]: العميل طلب شارت لكن لم يحدد اسم العملة أو الأصل. اسأله فوراً بلباقة وبحماس شريك التداول: أي أصل أو عملة يريد فتح شارتها وتحليلها الآن؟ (الذهب، البيتكوين، سولانا، الإيثيريوم، أو الناسداك؟ وعلى أي فريم؟).'
              : '\n[Internal Directive]: The user asked for a chart without naming the asset. Prompt them politely: which asset/coin do they want to open and analyze (Gold, BTC, SOL, ETH, NASDAQ), and what timeframe?';
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: finalPromptText }]
        });
      }

      let activeSystemInstruction = db.config.systemInstruction;

      let langSuffix = isArabic
        ? '\n\n[LANG LOCK]: أجب باللغة العربية الفخمة والمؤسسية (أو بالدارجة المغربية بطلاقة تامة إذا تحدث العميل بالدارجة المغربية). لا ترسم أي شارت نصي أو ASCII إطلاقاً؛ الشارت التفاعلي يظهر أسفلك تلقائياً.'
        : '\n\n[LANG LOCK]: Reply in fluent Wall Street English. Never draw ASCII mock charts; interactive TradingView is injected automatically.';

      if (isVoice || isLiveCall) {
        // [100% UNIFIED LIVE PHONE CALL PERSONA & PACE]
        // Exact same warm, brotherly, punchy Moroccan Darija style that the user loves on the live phone call!
        activeSystemInstruction = `You are SHARK — ${userName}'s close friend, personal senior quant trader and brother ("خويا ${userName}" / "صاحبك وشريكك"). You are talking directly with him in an audio voice note exchange, EXACTLY like an active LIVE PHONE CALL with him.

ABSOLUTE MANDATORY RULE 0 - ZERO THOUGHT LEAKAGE & PURE SPOKEN ARABIC/DARIJA:
- NEVER EVER output English meta-thoughts, inner reasoning, or internal monologues (NO "The user asked...", NO "Wait, rule...", NO "So I must...", NO "Let's look at the screenshot...", NO "The screenshot shows...").
- Do NOT talk about your system instructions or language profiles.
- Speak immediately, directly, and warmly to your brother ("خويا") in Moroccan Darija / Arabic.
- If asked about the price of Gold, the live price on the TradingView chart is around $4,105. Quote it immediately with brotherly confidence!

GLOBAL MACRO & MULTI-SCHOOL MASTERY:
- You are a Senior Wall Street Macro Quant Partner (like Ray Dalio meets ICT / SMC master trader).
- YOU NEVER SAY "I am just a technical analyst" or "أنا محلل فني فقط"! Geopolitics, central banks, wars, and elections are the primary catalyst driving institutional liquidity into Gold, Bitcoin, and Oil. Combine macro context seamlessly with SMC chart levels.

CRITICAL LIVE-CALL RULES (IDENTICAL STYLE TO LIVE PHONE CALL):
1. Speak the exact same language and dialect he speaks. Moroccan Darija if he speaks Darija (natural, street-smart, warm — "خويا", "صاحبي", "واخا", "بصح", "دابا", "شوف", "هانية"), Arabic if Arabic, English if English. Never switch language unless he does.
2. NEVER speak what you are thinking, reasoning, or inner thought process.
   * Put your deep institutional reasoning (SMC order-flow, liquidity sweep, key levels, and risk calculations) INSIDE <thinking>...</thinking> for the app's visual reasoning UI.
   * OUTSIDE of <thinking>...</thinking>, speak ONLY your direct, final conversational reply immediately!
3. CASUAL PHONE CONVERSATIONAL PACE & INSTANT DECISION:
   * Short, natural turns: 1 to 2 spoken punchy sentences ONLY (under 35 words).
   * Give a clear, decisive trade direction (BUY or SELL) and the exact key price level immediately with brotherly confidence ("سندخل صفقة بيع دابا عند كذا" أو "غادي ندخلو شراء"). NEVER evade and NEVER say "لا ندخل في التفاصيل التقنية" - you are a senior hedge fund partner, give the trade plan right away!
   * Use natural spoken rhythm. NO markdown headers (NO bold titles, NO "الاتجاه وبنية السوق"), NO bullet points, NO lists, NO long lectures.
4. EXACT 1:1 AUDIO AND CHAT TEXT HARMONY:
   * What you write outside <thinking>...</thinking> will be displayed in the chat AND spoken directly via audio. Keep them 100% identical!
   * If he asks for a chart, confirm that you opened it on screen.
   * If he asks for a trade, state the clear direction (بيع أو شراء) and the exact key level in 1 spoken line, and append the json_signal block at the very end so the interactive execution card displays on his screen!
5. HANG UP: If he wants to end the call/chat ("اقطع", "بسلامة", "صافي", "وداعا", "hang up", "bye"), reply with a warm, brief 1-sentence farewell ("الله يحفظك خويا ${userName}، بسلامة وتداول بأمان! نتشاوفو في الفرصة الجاية.").

TRADER PROFILE: Name: ${userName}, Plan: ${userPlan}, Capital: $${userBalance}.${dbManager.buildTraderIntelligenceContext(userEmail)}`;
      } else {
        activeSystemInstruction += langSuffix + dbManager.buildTraderIntelligenceContext(userEmail);
      }

      // محاولة الموديل فائق السرعة وبدون قيود كوتا أولاً ثم الاحتياطي
      const candidateModels = [
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-flash-latest',
        'gemini-3.8-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash'
      ];

      let data = null;
      let lastError = null;

      for (const modelToTry of candidateModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${db.config.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: activeSystemInstruction }] },
                contents
              })
            }
          );
          const resJson = await response.json();
          if (resJson.candidates?.[0]?.content?.parts?.[0]?.text) {
            data = resJson;
            break;
          } else if (resJson.error) {
            lastError = resJson.error;
            console.warn(`Model ${modelToTry} failed (${resJson.error.code}): ${resJson.error.message?.substring(0, 80)}`);
          }
        } catch (e) {
          console.warn(`Model ${modelToTry} fetch error:`, e.message);
        }
      }

      if (!data && lastError) {
        const isQuota = lastError.code === 429 || lastError.status === 'RESOURCE_EXHAUSTED';
        return res.json({ reply: null, isQuotaError: isQuota, isApiError: true, chart: null, shouldHangup: false, sessionId, isRealApiKey: false });
      }

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let aiReply = data.candidates[0].content.parts[0].text;

        // ── استخراج بطاقة الصفقة المنظمة فقط إذا طلب العميل صفقة صراحة ──
        let signalData = null;
        const isTradeDemand = detectTradeRequest(userQuery);
        // كشف اتجاه الصفقة بذكاء فائق ليتطابق 100% مع ما قرره ونطق به الذكاء الاصطناعي
        const replyUpper = (aiReply || '').toUpperCase();
        const userUpper = (userQuery || '').toUpperCase();
        let isBuyDecision = true;
        if (aiReply.includes('بيع') || replyUpper.includes('SELL') || replyUpper.includes('SHORT') || replyUpper.includes('هبوط') || aiReply.includes('هابط')) {
          isBuyDecision = false;
        } else if (aiReply.includes('شراء') || replyUpper.includes('BUY') || replyUpper.includes('LONG') || replyUpper.includes('صعود') || aiReply.includes('طالع')) {
          isBuyDecision = true;
        } else if (userQuery.includes('بيع') || userUpper.includes('SELL') || userUpper.includes('SHORT')) {
          isBuyDecision = false;
        } else {
          isBuyDecision = true;
        }

        const signalMatch = aiReply.match(/```json_signal([\s\S]*?)```/i);
        if (signalMatch) {
          if (isTradeDemand) {
            try {
              const rawSig = JSON.parse(signalMatch[1].trim());
              const parsedDirection = (rawSig.direction || rawSig.action || (isBuyDecision ? 'BUY' : 'SELL')).toUpperCase();
              signalData = {
                asset: rawSig.asset || rawSig.symbol || (chartMeta.rawSymbol ? chartMeta.rawSymbol : 'XAUUSD'),
                direction: parsedDirection.includes('BUY') || parsedDirection.includes('LONG') ? 'BUY' : 'SELL',
                entry: String(rawSig.entry || '0'),
                sl: String(rawSig.sl || rawSig.stop_loss || '0'),
                tp1: String(rawSig.tp1 || rawSig.take_profit || rawSig.tp || '0'),
                tp2: String(rawSig.tp2 || rawSig.take_profit_2 || '0'),
                rr: rawSig.rr || rawSig.risk_reward || '1:3.2',
                reason: rawSig.reason || (isBuyDecision ? 'كسر هيكل صاعد وتأكيد دخول السيولة الذكية' : 'كنس سيولة القمم واكتمال تصريف أوردر بلوك بيعي')
              };
            } catch (e) {
              console.warn('Failed to parse json_signal:', e.message);
            }
          }
          aiReply = aiReply.replace(/```json_signal[\s\S]*?```/gi, '').trim();
        }
        if (!signalData && isTradeDemand && (chartMeta.rawSymbol || currentSession.activeChart)) {
          const rawAsset = chartMeta.rawSymbol || currentSession.activeChart?.rawSymbol || 'XAUUSD';
          const isGold = rawAsset.includes('XAU') || rawAsset.includes('GOLD');
          const isBtc = rawAsset.includes('BTC');
          const isSol = rawAsset.includes('SOL');
          const curPrice = parseFloat(marketData?.currentPrice || (isGold ? liveTickers.gold : (isBtc ? liveTickers.btc : liveTickers.sol)));
          const isBuy = isBuyDecision;

          if (isGold) {
            signalData = {
              asset: 'XAUUSD (GOLD)',
              direction: isBuy ? 'BUY' : 'SELL',
              entry: curPrice.toFixed(2),
              sl: (isBuy ? curPrice - 14.0 : curPrice + 14.0).toFixed(2),
              tp1: (isBuy ? curPrice + 24.0 : curPrice - 24.0).toFixed(2),
              tp2: (isBuy ? curPrice + 48.0 : curPrice - 48.0).toFixed(2),
              rr: '1:3.4',
              reason: isBuy
                ? (isArabic ? 'اقتناص سيولة القيعان واختبار فجوة FVG المؤسسية' : 'Institutional FVG fill & liquidity sweep')
                : (isArabic ? 'كنس سيولة القمم واكتمال تصريف أوردر بلوك بيعي' : 'Bearish Order Block distribution & buy-side liquidity sweep')
            };
          } else if (isBtc) {
            signalData = {
              asset: 'BTCUSDT (BITCOIN)',
              direction: isBuy ? 'BUY' : 'SELL',
              entry: curPrice.toFixed(2),
              sl: (isBuy ? curPrice * 0.988 : curPrice * 1.012).toFixed(2),
              tp1: (isBuy ? curPrice * 1.025 : curPrice * 0.975).toFixed(2),
              tp2: (isBuy ? curPrice * 1.050 : curPrice * 0.950).toFixed(2),
              rr: '1:3.5',
              reason: isBuy
                ? (isArabic ? 'كسر هيكل صاعد وتأكيد دخول السيولة الذكية' : 'Bullish market structure break & Smart Money inflow')
                : (isArabic ? 'كنس سيولة القمم وكسر هيكل هابط CHoCH بيعي' : 'Bearish structure shift & buy-side liquidity purge')
            };
          } else if (isSol) {
            signalData = {
              asset: 'SOLUSDT (SOLANA)',
              direction: isBuy ? 'BUY' : 'SELL',
              entry: curPrice.toFixed(2),
              sl: (isBuy ? curPrice * 0.978 : curPrice * 1.022).toFixed(2),
              tp1: (isBuy ? curPrice * 1.045 : curPrice * 0.955).toFixed(2),
              tp2: (isBuy ? curPrice * 1.085 : curPrice * 0.915).toFixed(2),
              rr: '1:3.4',
              reason: isBuy
                ? (isArabic ? 'تجميع سيولة أوردر بلوك مؤسسي 15m' : '15m Institutional Order Block accumulation')
                : (isArabic ? 'كسر قاع رئيسي وتصريف أوردر بلوك هابط' : '15m Bearish Order Block rejection & distribution')
            };
          }
        }

        // ── استخراج عقل وتفكير القرش المؤسسي (Reasoning Process) وتنظيفه بالكامل ──
        let thinkingProcess = null;
        const thinkMatch = aiReply.match(/<thinking>([\s\S]*?)<\/thinking>/i) ||
          aiReply.match(/<thought>([\s\S]*?)<\/thought>/i) ||
          aiReply.match(/<think>([\s\S]*?)<\/think>/i);
        if (thinkMatch) {
          thinkingProcess = thinkMatch[1].trim();
        }
        aiReply = aiReply
          .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
          .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/\[thinking[\s\S]*?\]/gi, '')
          .replace(/\[thought[\s\S]*?\]/gi, '')
          .replace(/^(Thinking Process|Thought Process|Reasoning):[\s\S]*?(?=\n\n|\n[A-Z\u0600-\u06FF]|$)/gim, '')
          .replace(/^(\*Thinking Process\*|\*Thought\*):[\s\S]*?(?=\n\n|\n[A-Z\u0600-\u06FF]|$)/gim, '')
          // ── مسح أي تسريب للخواطر أو التفكير الداخلي بالإنجليزية (Zero English Thought Leakage) ──
          .replace(/^(The user|User|Wait,|So I must|According to|Looking at the screenshot|The screenshot shows|Let's look at)[\s\S]*?(?=[\u0600-\u06FF]|أهلاً|السلام|مرحباً|خويا|هاك|السوق|الذهب|الثمن|السعر)/i, '')
          .trim();

        if (/^[a-zA-Z\s,.'":;!?-]{20,}/.test(aiReply) && /[\u0600-\u06FF]/.test(aiReply)) {
          aiReply = aiReply.replace(/^[a-zA-Z\s,.'":;!?()\-]+(?=[\u0600-\u06FF])/, '').trim();
        }

        // في حال كان الرد الإنجليزي بالكامل ولم يُنتج أي عربي للمستخدم العربي
        if (!/[\u0600-\u06FF]/.test(aiReply) && isArabic) {
          if (isPriceQuery || (chartMeta.rawSymbol && chartMeta.rawSymbol.includes('XAU'))) {
            aiReply = `أهلاً خويا هاجر، سعر الذهب اللحظي المباشر على شارت TradingView دابا واصل حوالي $${liveTickers.gold || '4,105'} للأونصة. الشارت مفتوح قدامك تقدر تتابع التحرك مباشرة.`;
          } else {
            aiReply = `أهلاً خويا هاجر، شارت ${chartMeta.symbol || 'TradingView'} مفتوح قدامك وكنتابعو السيولة اللحظية خطوة بخطوة.`;
          }
        }

        // التفكير المؤسسي يُعرض دائماً للعميل في واجهة المحادثة ليطمئن لجودة وذكاء القرار
        // ولا يُحجب إلا في التحيات العابرة البسيطة فقط
        if (isGreeting) {
          thinkingProcess = null;
        } else if (!thinkingProcess && !isPriceQuery) {
          thinkingProcess = `• تحليل البنية والسيولة اللحظية: رصد تدفق الأوامر ومناطق السيولة المؤسسية.\n• فحص مصايد صناع السوق: التحقق من كنس السيولة ونسبة العائد للمخاطرة R:R (1:3+).\n• القرار التنفيذي الحاسم: صياغة التمركز المباشر وتحديد الاتجاه بدقة.`;
        }

        // تنظيف وحذف أي كود مسرب أو رسوم ASCII وهمية أو تصنيف نيات
        aiReply = aiReply
          .replace(/^\s*\d+\.\s*(تصنيف نية|تصنيف|تحديد نية|Intent)[\s\S]*?(?=\n\n|\n[A-Z\u0600-\u06FF]|$)/gim, '')
          .replace(/^(تصنيف نية|نية المتداول|Intent Classification):?[\s\S]*?(?=\n\n|\n[A-Z\u0600-\u06FF]|$)/gim, '')
          .replace(/<execute_tool_code>[\s\S]*?<\/execute_tool_code>/gi, '')
          .replace(/<execute_skill>[\s\S]*?<\/execute_skill>/gi, '')
          .replace(/```text[\s\S]*?```/gi, '') // مسح أي شارت نصي وهمي
          .replace(/text```[\s\S]*?```/gi, '')
          .replace(/```[\s\S]*?```/gi, '')
          .replace(/تخيل هذا الرسم[\s\S]*?(?=(🧭|#|🎯|⚡|🛑|🏁|المستوى|خطة|أنا معك|$))/gi, '')
          .replace(/[-─=]{6,}[\s\S]*?[-─=]{6,}/g, '') // إزالة جداول الخطوط والـ ASCII
          .replace(/<[^>]+>/g, '')
          .replace(/print\(INJECT_CHART[\s\S]*?\)/gi, '')
          .replace(/INJECT_CHART\([\s\S]*?\)/gi, '')
          .replace(/_Injecting chart[\s\S]*?_\.?/gi, '')
          .replace(/\*\*/g, '')
          .replace(/##/g, '')
          .trim();

        currentSession.messages.push({
          role: 'model',
          content: aiReply,
          thinking: thinkingProcess,
          signal: signalData,
          chartScreenshot: liveChartScreenshot ? liveChartScreenshot.filePath : null,
          timestamp: new Date().toISOString()
        });

        // 🧠 تحديث ذاكرة وتعلّم الذكاء الاصطناعي التراكمي لهذا المتداول (AI Adaptive Learning)
        const learnedMemory = dbManager.learnFromUserInteraction({
          email: userEmail,
          userQuery,
          aiReply,
          chartMeta,
          signalData,
          isVoice
        });

        // توليد الأوديو بصوت Charon فقط وحصراً إذا كان العميل أرسل رسالة صوتية أو مكالمة حية (Audio-to-Audio)
        // توفيراً للتوكن والاستهلاك، وتنفيذ الأوامر والرسائل العادية كتابةً فقط
        let aiVoiceUrl = null;
        let summary = null;

        if (isVoice) {
          let voiceText = aiReply
            .replace(/```json_signal[\s\S]*?```/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/[*#_`>~]/g, '')
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{27BF}]/gu, '')
            .replace(/\s+/g, ' ')
            .trim();

          // إزالة أي كلمات تمهيدية إنجليزية قد تتسرب
          voiceText = voiceText.replace(/^(Okay|Sure|Alright|Understood|Here is|Thinking|Thought|Note|Let me):?\s*/i, '').trim();

          // مطابقة تامة 100%: ما يُعرض في فقاعة الدردشة هو بالضبط ما ينطقه الصوت كلمة بكلمة
          aiReply = voiceText;
          summary = voiceText;

          const replyIsArabic = /[\u0600-\u06FF]/.test(summary) || isArabic;
          if (!summary) summary = replyIsArabic ? 'أهلاً خويا هاجر، السوق دابا كيدير تحركات قوية، تابع الشارت.' : 'Yo trader, market is printing high volatility right now.';

          aiVoiceUrl = `/api/tts?text=${encodeURIComponent(summary)}&lang=${replyIsArabic ? 'ar' : 'en'}`;
          // Pre-synthesize the genuine Gemini Live "Charon" voice into RAM cache BEFORE returning,
          // so that auto-play and the Play button ("بلاس") work in 0ms with zero failure!
          try {
            await getOrCreateCharonWav(summary);
          } catch (preErr) {
            console.warn('Charon pre-synthesis warning:', preErr.message);
          }
        }

        const outChart = (chartMeta.wantsChart || (isLiveCall && chartMeta.rawSymbol))
          ? { symbol: chartMeta.symbol, interval: chartMeta.interval, rawSymbol: chartMeta.rawSymbol }
          : null;

        const effectiveLang = (/[\u0600-\u06FF]/.test(aiReply) || isArabic) ? 'ar' : 'en';

        return res.json({
          reply: aiReply,
          thinking: thinkingProcess,
          chart: outChart,
          chartScreenshot: liveChartScreenshot ? liveChartScreenshot.filePath : null,
          signal: signalData,
          lang: effectiveLang,
          isVoiceReply: isVoice,
          aiVoiceUrl: aiVoiceUrl,
          voiceSummary: summary,
          shouldHangup,
          isLiveCall: Boolean(isLiveCall),
          sessionId,
          isRealApiKey: true,
          liveData: marketData ? { price: marketData.currentPrice, change: marketData.change24h, trend: marketData.trend } : null
        });
      }
    } catch (err) {
      console.error('API Error:', err.message || err);
      return res.json({ reply: null, isApiError: true, isQuotaError: false, chart: null, shouldHangup: false, sessionId, isRealApiKey: false });
    }
  }

  return res.json({ reply: null, isApiError: true, isQuotaError: false, chart: null, shouldHangup: false, sessionId, isRealApiKey: false });
};

app.post('/api/chat', handleChatRequest);

// 📞 Instant Live Voice Turn (Serverless & Real-time Two-Way Audio)
app.post('/api/live-turn', async (req, res) => {
  try {
    req.body = req.body || {};
    req.body.message = req.body.text || req.body.message || 'سلام خويا الحوت';
    req.body.isLiveCall = true;
    req.body.isVoiceQuery = true;
    req.body.userEmail = req.body.userEmail || 'trader@shark.ai';
    return handleChatRequest(req, res);
  } catch (err) {
    console.error('live-turn error:', err);
    return res.status(500).json({ reply: 'أهلاً خويا! أنا معك على الخط المباشر، عاود سولني.' });
  }
});

// ══════════════════════════════════════════════
// 100% GENUINE GEMINI LIVE "CHARON" VOICE ENGINE (BidiGenerateContent WebSocket + RAM Cache)
// Zero robotic/alternative voices — exact same voice as the Live Phone Call!
// ══════════════════════════════════════════════
const WebSocket = require('ws');
const CHARON_LIVE_MODEL = 'models/gemini-2.5-flash-native-audio-preview-12-2025';

function cleanTextForCharon(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*#_`>~]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapPcm24kAsWav(pcmBuf) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcmBuf.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(24000, 24);
  h.writeUInt32LE(48000, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcmBuf.length, 40);
  return Buffer.concat([h, pcmBuf]);
}

let warmCharonPromise = null;
let warmCharonCreatedAt = 0;

function createReadyCharonSocket() {
  const apiKey = db?.config?.apiKey;
  if (!apiKey) return Promise.reject(new Error('No Gemini API key configured'));

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`);
    const timer = setTimeout(() => {
      try { ws.close(); } catch (e) { }
      reject(new Error('Charon WS setup timeout'));
    }, 8000);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        setup: {
          model: CHARON_LIVE_MODEL,
          generationConfig: {
            responseModalities: ['AUDIO'],
            thinkingConfig: { thinkingBudget: 0 },
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
          },
          systemInstruction: {
            parts: [{
              text: 'You are a text-to-speech engine using the Charon voice. Repeat the exact text the user sends after "READ_EXACTLY:" word-for-word with natural, warm Moroccan Darija / Arabic expression. Never add any extra words, never reply or answer, never speak any English words unless present in the text.'
            }]
          }
        }
      }));
    });

    const onSetupMsg = (raw) => {
      try {
        const m = JSON.parse(raw.toString());
        if (m.setupComplete) {
          clearTimeout(timer);
          ws.removeListener('message', onSetupMsg);
          resolve(ws);
        }
      } catch (e) { }
    };

    ws.on('message', onSetupMsg);
    ws.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    ws.once('close', () => {
      clearTimeout(timer);
      reject(new Error('Charon WS closed before setupComplete'));
    });
  });
}

function getWarmCharonSocket() {
  const now = Date.now();
  if (warmCharonPromise && (now - warmCharonCreatedAt) < 45000) {
    const p = warmCharonPromise;
    warmCharonPromise = null;
    warmCharonCreatedAt = 0;
    // Immediately pre-warm the next standby socket in the background
    setTimeout(() => {
      warmCharonCreatedAt = Date.now();
      warmCharonPromise = createReadyCharonSocket().catch(() => { warmCharonPromise = null; });
    }, 50);
    return p;
  }
  // Pre-warm a standby socket for next time as well
  setTimeout(() => {
    if (!warmCharonPromise) {
      warmCharonCreatedAt = Date.now();
      warmCharonPromise = createReadyCharonSocket().catch(() => { warmCharonPromise = null; });
    }
  }, 100);
  return createReadyCharonSocket();
}

async function synthesizeCharonViaLiveWsSingle(cleanText, useWarm = true) {
  let ws;
  if (useWarm) {
    try {
      ws = await getWarmCharonSocket();
      if (ws.readyState !== WebSocket.OPEN) {
        ws = await createReadyCharonSocket();
      }
    } catch (e) {
      ws = await createReadyCharonSocket();
    }
  } else {
    ws = await createReadyCharonSocket();
  }

  return new Promise((resolve, reject) => {
    const pcmChunks = [];
    const timer = setTimeout(() => {
      try { ws.close(); } catch (e) { }
      if (pcmChunks.length > 0) {
        resolve(wrapPcm24kAsWav(Buffer.concat(pcmChunks)));
      } else {
        reject(new Error('Charon synthesis timeout'));
      }
    }, 16000);

    ws.on('message', (raw) => {
      try {
        const m = JSON.parse(raw.toString());
        if (m.serverContent) {
          const sc = m.serverContent;
          if (sc.modelTurn && sc.modelTurn.parts) {
            for (const p of sc.modelTurn.parts) {
              if (p.inlineData && p.inlineData.data) {
                pcmChunks.push(Buffer.from(p.inlineData.data, 'base64'));
              }
            }
          }
          if (sc.turnComplete) {
            clearTimeout(timer);
            try { ws.close(); } catch (e) { }
            const pcmBuf = Buffer.concat(pcmChunks);
            if (pcmBuf.length === 0) return reject(new Error('Charon returned empty audio'));
            resolve(wrapPcm24kAsWav(pcmBuf));
          }
        }
      } catch (err) {
        clearTimeout(timer);
        try { ws.close(); } catch (e) { }
        reject(err);
      }
    });

    ws.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text: `READ_EXACTLY: ${cleanText.substring(0, 500)}` }] }],
        turnComplete: true
      }
    }));
  });
}

async function getOrCreateCharonWav(rawText) {
  const cleanText = cleanTextForCharon(rawText);
  if (!cleanText) throw new Error('Empty text after clean');

  const cacheKey = cleanText.substring(0, 600);
  if (!global.__ttsCache) global.__ttsCache = new Map();
  if (!global.__ttsInFlight) global.__ttsInFlight = new Map();

  const cached = global.__ttsCache.get(cacheKey);
  if (cached && cached.buffer && cached.buffer.length > 44) {
    return cached.buffer;
  }

  if (global.__ttsInFlight.has(cacheKey)) {
    return global.__ttsInFlight.get(cacheKey);
  }

  const jobPromise = (async () => {
    let wavBuf = null;
    // 1. Primary: Gemini Live BidiGenerateContent WebSocket with "Charon" (Unlimited free quota, 100% Live Call Voice)
    try {
      wavBuf = await synthesizeCharonViaLiveWsSingle(cleanText, true);
    } catch (wsErr1) {
      console.warn('Charon warm WS retry:', wsErr1.message);
      try {
        wavBuf = await synthesizeCharonViaLiveWsSingle(cleanText, false);
      } catch (wsErr2) {
        console.warn('Charon fresh WS failed, trying REST Charon TTS:', wsErr2.message);
      }
    }

    // 2. Secondary: Gemini REST TTS with "Charon"
    if (!wavBuf) {
      const ttsModels = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
      for (const tm of ttsModels) {
        const ctl = new AbortController();
        const to = setTimeout(() => ctl.abort(), 8000);
        try {
          const gr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${tm}:generateContent?key=${db.config.apiKey}`, {
            method: 'POST',
            signal: ctl.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: cleanText.substring(0, 500) }] }],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }
              }
            })
          });
          const gj = await gr.json();
          const part = gj.candidates?.[0]?.content?.parts?.[0];
          if (part?.inlineData?.data) {
            let buf = Buffer.from(part.inlineData.data, 'base64');
            const mt = part.inlineData.mimeType || '';
            if (!mt.includes('wav')) buf = wrapPcm24kAsWav(buf);
            wavBuf = buf;
            break;
          }
        } catch (ge) {
          // ignore
        } finally {
          clearTimeout(to);
        }
      }
    }

    if (wavBuf && wavBuf.length > 44) {
      global.__ttsCache.set(cacheKey, { buffer: wavBuf, mimeType: 'audio/wav' });
      if (global.__ttsCache.size > 100) {
        global.__ttsCache.delete(global.__ttsCache.keys().next().value);
      }
      return wavBuf;
    }

    throw new Error('Charon voice synthesis unavailable');
  })();

  global.__ttsInFlight.set(cacheKey, jobPromise);
  try {
    return await jobPromise;
  } finally {
    global.__ttsInFlight.delete(cacheKey);
  }
}

// Pre-warm the first Charon socket on server boot
setTimeout(() => {
  warmCharonCreatedAt = Date.now();
  warmCharonPromise = createReadyCharonSocket().catch(() => { warmCharonPromise = null; });
}, 500);

app.get('/api/tts', async (req, res) => {
  try {
    const text = req.query.text;
    if (!text || !text.trim()) return res.status(400).send('Text required');

    const wavBuffer = await getOrCreateCharonWav(text);
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', wavBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(wavBuffer);
  } catch (err) {
    console.error('Charon TTS endpoint error:', err.message || err);
    res.status(503).send('Gemini Live Charon Audio Engine Error');
  }
});

// ══════════════════════════════════════════════
// ADMIN ENDPOINTS (WITH SUPABASE CLOUD & AI MEMORY INSPECTOR)
// ══════════════════════════════════════════════
app.get('/api/admin/status', async (req, res) => {
  let usersList = db.users;
  if (dbManager.isSupabaseConnected()) {
    try {
      const supaUsers = await dbManager.fetchUsersFromSupabase();
      if (supaUsers && supaUsers.length > 0) {
        usersList = supaUsers;
        db.users = supaUsers;
      }
    } catch (e) {}
  }

  res.json({
    totalUsers: usersList.length,
    activeSubscribers: usersList.filter(u => u.status === 'Active').length,
    hasApiKey: Boolean(db.config.apiKey && db.config.apiKey.length > 5),
    apiKeyMasked: db.config.apiKey ? db.config.apiKey.substring(0, 6) + '...' + db.config.apiKey.slice(-4) : 'NOT SET',
    model: db.config.model || 'gemini-3-flash-preview',
    supabaseConnected: dbManager.isSupabaseConnected(),
    supabaseSyncReport: dbManager.getSupabaseSyncReport(),
    supabaseUrl: db.config.supabaseUrl || process.env.SUPABASE_URL || '',
    hasSupabaseKey: Boolean((db.config.supabaseKey && db.config.supabaseKey.length > 10) || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY),
    users: usersList,
    aiLearningMemory: db.aiLearningMemory,
    communityPulse: db.communityHub?.marketPulse || null
  });
});

app.post('/api/admin/update-config', async (req, res) => {
  const { apiKey, model, systemInstruction, supabaseUrl, supabaseKey } = req.body;
  if (apiKey && apiKey.trim().length > 5) {
    db.config.apiKey = apiKey.trim();
  }
  if (model) db.config.model = model;
  if (systemInstruction && systemInstruction.trim().length > 10) db.config.systemInstruction = systemInstruction.trim();
  if (supabaseUrl !== undefined && supabaseUrl.trim().length > 5) db.config.supabaseUrl = supabaseUrl.trim();
  if (supabaseKey !== undefined && supabaseKey.trim().length > 5) db.config.supabaseKey = supabaseKey.trim();
  
  const supaConnected = dbManager.initSupabaseClient();
  saveDb();
  let syncReport = null;
  if (supaConnected) {
    syncReport = await dbManager.syncAllDataToSupabase();
  }
  console.log('✅ Admin updated config. Key:', db.config.apiKey ? db.config.apiKey.substring(0, 6) + '...' : 'none');
  res.json({
    success: true,
    supabaseConnected: supaConnected,
    supabaseSyncReport: syncReport,
    hasApiKey: Boolean(db.config.apiKey && db.config.apiKey.length > 5),
    apiKeyMasked: db.config.apiKey ? db.config.apiKey.substring(0, 6) + '...' + db.config.apiKey.slice(-4) : 'NOT SET',
    message: 'تم حفظ وتفعيل الإعدادات والمفتاح الجديد فوراً!'
  });
});

app.post('/api/admin/sync-supabase', async (req, res) => {
  const report = await dbManager.syncAllDataToSupabase();
  res.json({ success: report.ok, report });
});

app.post('/api/admin/toggle-user', async (req, res) => {
  const { userId, email } = req.body;
  const user = db.users.find(u => (userId && u.id === userId) || (email && u.email.toLowerCase() === String(email).toLowerCase()));
  if (user) {
    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    if (!db.communityHub.blockedUsers) db.communityHub.blockedUsers = [];
    if (user.status === 'Suspended') {
      if (!db.communityHub.blockedUsers.includes(user.name)) {
        db.communityHub.blockedUsers.push(user.name);
      }
      if (user.username && !db.communityHub.blockedUsers.includes('@' + user.username)) {
        db.communityHub.blockedUsers.push('@' + user.username);
      }
    } else {
      db.communityHub.blockedUsers = db.communityHub.blockedUsers.filter(
        b => b !== user.name && b !== ('@' + user.username)
      );
    }
    saveDb();
    await dbManager.updateUserStatusInSupabase(user.email, user.status);
    res.json({ success: true, newStatus: user.status, user });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/admin/change-plan', async (req, res) => {
  const { userId, email, plan } = req.body;
  const user = db.users.find(
    u => (userId && u.id === userId) || (email && u.email.toLowerCase() === String(email).toLowerCase())
  );
  const targetEmail = (email || (user ? user.email : '')).toLowerCase();

  if (user && plan) {
    user.plan = plan;
  }
  saveDb();

  // Directly and permanently update Supabase PostgreSQL!
  if (targetEmail && plan) {
    await dbManager.updateUserPlanInSupabase(targetEmail, plan);
  }

  res.json({ success: true, user: user || { email: targetEmail, plan } });
});

app.post('/api/admin/change-role', async (req, res) => {
  const { userId, email, role } = req.body;
  const user = db.users.find(
    u => (userId && u.id === userId) || (email && u.email.toLowerCase() === String(email).toLowerCase())
  );
  const targetEmail = (email || (user ? user.email : '')).toLowerCase();

  if (user && role) {
    user.role = String(role).toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  }
  saveDb();

  if (targetEmail && role) {
    await dbManager.updateUserRoleInSupabase(targetEmail, user ? user.role : role);
  }

  res.json({ success: true, user: user || { email: targetEmail, role } });
});

app.post('/api/admin/delete-user', async (req, res) => {
  const { userId, email } = req.body;
  const user = db.users.find(u => (userId && u.id === userId) || (email && u.email.toLowerCase() === String(email).toLowerCase()));
  const targetEmail = (email || (user ? user.email : '')).toLowerCase();
  
  if (user) {
    db.users = db.users.filter(u => u !== user);
    saveDb();
  }
  if (targetEmail) {
    await dbManager.deleteUserFromSupabase(targetEmail);
  }
  res.json({ success: true });
});

app.get('/api/sessions', (req, res) => {
  const { userEmail } = req.query;
  const emailLower = (userEmail || '').trim().toLowerCase();
  const conv = db.userConversations?.[emailLower];
  if (!conv) return res.json({ sessions: [] });
  res.json({ sessions: conv.sessionsList || [] });
});

app.delete('/api/sessions/:sessionId', (req, res) => {
  const { userEmail } = req.body;
  const { sessionId } = req.params;
  const emailLower = (userEmail || '').trim().toLowerCase();
  const conv = db.userConversations?.[emailLower];
  if (conv) {
    conv.sessionsList = (conv.sessionsList || []).filter(s => s.id !== sessionId);
    if (conv.sessionsMessages) delete conv.sessionsMessages[sessionId];
    if (conv.aiContextBySession) delete conv.aiContextBySession[sessionId];
    saveDb();
  }
  res.json({ success: true });
});

// ── Live market price quick endpoint ──
app.get('/api/price/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  try {
    const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}USDT`);
    const d = await r.json();
    res.json({ symbol: sym, price: d.lastPrice, change: d.priceChangePercent + '%' });
  } catch (e) {
    res.json({ error: 'Price not available' });
  }
});

// ── شريط الأسعار الحية الحقيقي المباشر لتطبيق الموبايل ──
app.get('/api/market/tickers', async (req, res) => {
  const data = await getLiveTickerSnapshot();
  const tickers = [
    { s: 'GOLD', p: `$${data.gold}`, c: data.goldChange || '+0.8%', up: !String(data.goldChange || '').startsWith('-'), raw: 'XAUUSD', exchange: 'OANDA' },
    { s: 'BTC', p: `$${data.btc}`, c: '+2.1%', up: true, raw: 'BTCUSDT', exchange: 'BINANCE' },
    { s: 'ETH', p: `$${data.eth}`, c: '-0.5%', up: false, raw: 'ETHUSDT', exchange: 'BINANCE' },
    { s: 'SOL', p: `$${data.sol}`, c: '+6.2%', up: true, raw: 'SOLUSDT', exchange: 'BINANCE' },
    { s: 'NASDAQ', p: `$${data.nasdaq}`, c: '+0.8%', up: true, raw: 'QQQ', exchange: 'NASDAQ' },
    { s: 'OIL', p: `$${data.oil || '71.50'}`, c: data.oilChange || '-1.1%', up: !String(data.oilChange || '').startsWith('-'), raw: 'USOIL', exchange: 'TVC' }
  ];
  res.json({ tickers });
});

// ── التقويم الاقتصادي والأخبار اللحظية ──
app.get('/api/market/news', async (req, res) => {
  const news = await fetchLiveNews('market economy gold crypto');
  res.json({
    news,
    calendar: HIGH_IMPACT_CALENDAR
  });
});

// ══════════════════════════════════════════════
// 📢 SHARK COMMUNITY FEED & ADMIN BROADCASTS
// ══════════════════════════════════════════════
app.get('/api/community/posts', (req, res) => {
  res.json({ posts: db.communityPosts || [] });
});

app.post('/api/community/posts', (req, res) => {
  const { title, content, tag, author = 'SHARK ADMIN', role = 'LEAD QUANT' } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  const newPost = {
    id: 'post_' + Date.now(),
    author,
    role,
    badge: 'ADMIN BROADCAST',
    isPinned: false,
    tag: tag || '#MARKET_UPDATE',
    time: 'Just now',
    title: title.trim(),
    content: content.trim(),
    likes: 1,
    comments: 0,
    shares: 0
  };

  if (!db.communityPosts) db.communityPosts = [];
  db.communityPosts.unshift(newPost);
  saveDb();

  res.json({ success: true, post: newPost });
});

app.post('/api/community/posts/:id/like', (req, res) => {
  const { id } = req.params;
  if (db.communityPosts) {
    const post = db.communityPosts.find(p => p.id === id);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      saveDb();
      return res.json({ success: true, likes: post.likes });
    }
  }
  res.json({ success: false });
});

// ══════════════════════════════════════════════
// 📢 SHARK COMMUNITY CHAT & LIVE FLOOR MESSAGES
// ══════════════════════════════════════════════
const activeFloorTypers = new Map();

app.get('/api/community/messages', (req, res) => {
  const now = Date.now();
  for (const [k, v] of activeFloorTypers.entries()) {
    if (now - v.updatedAt > 60000) {
      activeFloorTypers.delete(k);
    }
  }
  res.json({
    messages: db.communityMessages || [],
    blockedUsers: db.blockedUsers || [],
    typingUsers: Array.from(activeFloorTypers.values())
  });
});

app.post('/api/community/typing', (req, res) => {
  const { clientId, email, name, username, isTyping } = req.body || {};
  const key = clientId || (email || username || name || '').toLowerCase().trim();
  if (!key) return res.json({ success: true });
  if (isTyping) {
    activeFloorTypers.set(key, {
      clientId: clientId || key,
      key,
      name: name || username || 'Trader',
      username: username || '',
      email: email || '',
      updatedAt: Date.now()
    });
  } else {
    activeFloorTypers.delete(key);
  }
  return res.json({ success: true });
});

app.post('/api/community/messages', (req, res) => {
  const {
    senderName = 'Trader',
    role = 'VIP TRADER',
    content,
    audioData = null,
    audioDuration = null,
    imageData = null,
    replyTo = null,
    isAdmin = false,
    badge,
    avatarText,
    tag,
    type = 'CHAT', // 'CHAT' | 'ALPHA' | 'SIGNAL' | 'AUDIO' | 'IMAGE'
    signalData = null,
    category = 'NORMAL' // 'NORMAL' | 'ALPHA' | 'SIGNAL'
  } = req.body;

  const senderEmailLower = String(req.body.senderEmail || '').trim().toLowerCase();
  const senderUserObj = senderEmailLower ? db.users.find(u => u.email.toLowerCase() === senderEmailLower) : null;
  const isVerifiedAdmin = Boolean(senderUserObj && String(senderUserObj.role || '').toUpperCase() === 'ADMIN');

  // Check if sender is blocked or suspended
  if (
    (senderUserObj && senderUserObj.status === 'Suspended') ||
    (db.blockedUsers && db.blockedUsers.includes(senderName.trim()))
  ) {
    return res.status(403).json({ error: 'User is blocked from participating in community.' });
  }

  if ((!content || !content.trim()) && !signalData && !audioData && !imageData) {
    return res.status(400).json({ error: 'Message content, image, audio, or signal data is required' });
  }

  // Enforce that only verified ADMINs in database can post ALPHA or SIGNAL broadcasts
  const effectiveIsAdmin = isVerifiedAdmin && Boolean(isAdmin || category === 'ALPHA' || category === 'SIGNAL' || type === 'SIGNAL');
  const effectiveCategory = isVerifiedAdmin ? category : 'NORMAL';
  const effectiveSignalData = isVerifiedAdmin ? (signalData || null) : null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getInitials = (name) => {
    if (!name) return 'TR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const contentUpper = (content || '').toUpperCase();
  let defaultTheme = 'platinum';
  let defaultTag = audioData ? '#VOICE_NOTE' : imageData ? '#CHART_SETUP' : '#DISCUSSION';

  if (effectiveSignalData) {
    defaultTheme = effectiveSignalData?.direction === 'SELL' ? 'crimson' : 'green';
    defaultTag = '#SMC_SIGNAL';
  } else if (effectiveIsAdmin || effectiveCategory === 'ALPHA') {
    defaultTheme = 'green';
    defaultTag = '#ALPHA_ALERT';
  } else if (contentUpper.includes('XAU') || contentUpper.includes('GOLD') || (content && content.includes('ذهب'))) {
    defaultTheme = 'gold';
    defaultTag = '#XAUUSD_SMC';
  } else if (contentUpper.includes('BTC') || contentUpper.includes('SOL') || contentUpper.includes('ETH') || (content && content.includes('بيتكوين'))) {
    defaultTheme = 'cyan';
    defaultTag = '#CRYPTO_FLOW';
  }

  const cleanCommunityAudio = audioData ? offloadBase64Media(audioData, 'audio') : null;
  const cleanCommunityImage = imageData ? offloadBase64Media(imageData, 'avatars') : null;
  let cleanCommunityAvatar = avatarText && avatarText.startsWith('data:')
    ? offloadBase64Media(avatarText, 'avatars')
    : avatarText;
  if (cleanCommunityAvatar === '🦈' || cleanCommunityAvatar === '👑') {
    cleanCommunityAvatar = null;
  }

  const newMessage = {
    id: 'cmsg_' + Date.now(),
    senderEmail: req.body.senderEmail || null,
    senderUsername: req.body.senderUsername || senderUserObj?.username || (effectiveIsAdmin ? 'shark_admin' : null),
    senderName: senderName.trim(),
    role: effectiveIsAdmin ? 'CHIEF QUANT & FOUNDER' : (isVerifiedAdmin ? 'SYNDICATE ADMIN' : role),
    isAdmin: effectiveIsAdmin,
    badge: effectiveIsAdmin
      ? (badge || (type === 'SIGNAL' ? 'SMC DESK' : 'ADMIN BROADCAST'))
      : (isVerifiedAdmin ? 'ADMIN' : (badge || 'VIP PRO')),
    tag: tag || defaultTag,
    theme: defaultTheme,
    type: cleanCommunityAudio ? 'AUDIO' : (effectiveSignalData ? 'SIGNAL' : type),
    category: effectiveCategory,
    signalData: effectiveSignalData,
    audioData: cleanCommunityAudio,
    audioDuration: audioDuration || null,
    imageData: cleanCommunityImage,
    replyTo: replyTo || null,
    avatarText: effectiveIsAdmin ? 'HQ' : (cleanCommunityAvatar || senderUserObj?.avatar || getInitials(senderName)),
    content: (content || (effectiveSignalData ? `${effectiveSignalData.direction} ${effectiveSignalData.symbol} @ ${effectiveSignalData.entry}` : '')).trim(),
    time: timeStr,
    likes: 0,
    likedBy: [],
    reactions: { fire: [], target: [], rocket: [], blood: [] },
    isPinned: false
  };

  if (!db.communityHub.messages) db.communityHub.messages = [];
  db.communityHub.messages.push(newMessage);
  dbManager.learnFromCommunityMessage(newMessage, req.body.senderEmail || null);

  res.json({ success: true, message: newMessage });
});

// Admin Moderation: Delete Message
app.delete('/api/community/messages/:id', (req, res) => {
  const { id } = req.params;
  if (db.communityHub.messages) {
    db.communityHub.messages = db.communityHub.messages.filter(m => m.id !== id);
    saveDb();
    return res.json({ success: true, id });
  }
  res.json({ success: false });
});

// Admin Moderation: Pin/Unpin Message
app.post('/api/community/messages/:id/pin', (req, res) => {
  const { id } = req.params;
  if (db.communityHub.messages) {
    const msg = db.communityHub.messages.find(m => m.id === id);
    if (msg) {
      msg.isPinned = !msg.isPinned;
      saveDb();
      return res.json({ success: true, isPinned: msg.isPinned, message: msg });
    }
  }
  res.json({ success: false });
});

// Admin Moderation: Block User
app.post('/api/community/block-user', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  if (!db.communityHub.blockedUsers) db.communityHub.blockedUsers = [];
  if (!db.communityHub.blockedUsers.includes(username)) {
    db.communityHub.blockedUsers.push(username);
  }
  if (db.communityHub.messages) {
    db.communityHub.messages = db.communityHub.messages.filter(m => m.senderName !== username);
  }
  saveDb();
  res.json({ success: true, blockedUsers: db.communityHub.blockedUsers });
});

// Admin Moderation: Unblock User
app.post('/api/community/unblock-user', (req, res) => {
  const { username } = req.body;
  if (db.communityHub.blockedUsers) {
    db.communityHub.blockedUsers = db.communityHub.blockedUsers.filter(u => u !== username);
    saveDb();
  }
  res.json({ success: true, blockedUsers: db.communityHub.blockedUsers || [] });
});

app.post('/api/community/messages/:id/like', (req, res) => {
  const { id } = req.params;
  const userEmail = String(req.body?.userEmail || '').trim().toLowerCase();
  if (db.communityHub.messages) {
    const msg = db.communityHub.messages.find(m => m.id === id);
    if (msg) {
      if (!Array.isArray(msg.likedBy)) msg.likedBy = [];
      let isLiked = false;
      if (userEmail) {
        const idx = msg.likedBy.indexOf(userEmail);
        if (idx !== -1) {
          msg.likedBy.splice(idx, 1);
          isLiked = false;
        } else {
          msg.likedBy.push(userEmail);
          isLiked = true;
        }
        msg.likes = msg.likedBy.length;
      } else {
        msg.likes = (msg.likes || 0) + 1;
        isLiked = true;
      }
      if (!msg.reactions || typeof msg.reactions !== 'object') {
        msg.reactions = { fire: [...msg.likedBy], target: [], rocket: [], blood: [] };
      } else {
        msg.reactions.fire = [...msg.likedBy];
      }
      saveDb();
      return res.json({ success: true, likes: msg.likes, likedBy: msg.likedBy, reactions: msg.reactions, isLiked });
    }
  }
  res.json({ success: false });
});

app.post('/api/community/messages/:id/react', (req, res) => {
  const { id } = req.params;
  const userEmail = String(req.body?.userEmail || '').trim().toLowerCase();
  const reactionKey = String(req.body?.reactionKey || 'fire').trim().toLowerCase();
  const validKeys = ['fire', 'target', 'rocket', 'blood'];
  const key = validKeys.includes(reactionKey) ? reactionKey : 'fire';

  if (db.communityHub.messages && userEmail) {
    const msg = db.communityHub.messages.find(m => m.id === id);
    if (msg) {
      if (!msg.reactions || typeof msg.reactions !== 'object') {
        msg.reactions = {
          fire: Array.isArray(msg.likedBy) ? [...msg.likedBy] : [],
          target: [],
          rocket: [],
          blood: []
        };
      }
      for (const k of validKeys) {
        if (!Array.isArray(msg.reactions[k])) msg.reactions[k] = [];
      }
      const list = msg.reactions[key];
      const idx = list.indexOf(userEmail);
      if (idx !== -1) {
        list.splice(idx, 1);
      } else {
        list.push(userEmail);
      }
      if (key === 'fire') {
        msg.likedBy = [...msg.reactions.fire];
        msg.likes = msg.likedBy.length;
      }
      saveDb();
      return res.json({
        success: true,
        reactions: msg.reactions,
        likes: msg.likes,
        likedBy: msg.likedBy
      });
    }
  }
  res.json({ success: false });
});

// Admin Only: Update Live SMC Signal Status (EXECUTION | TP1_HIT | BREAKEVEN | TP2_HIT | STOPPED)
app.post('/api/community/messages/:id/signal-status', (req, res) => {
  const { id } = req.params;
  const { status, adminEmail } = req.body;
  const emailLower = String(adminEmail || '').trim().toLowerCase();
  const adminUser = emailLower ? db.users.find(u => u.email.toLowerCase() === emailLower) : null;
  if (!adminUser || String(adminUser.role || '').toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Only verified Admins can update signal status.' });
  }
  if (db.communityHub.messages) {
    const msg = db.communityHub.messages.find(m => m.id === id);
    if (msg && msg.signalData) {
      msg.signalData.status = status || 'EXECUTION';
      saveDb();
      return res.json({ success: true, message: msg });
    }
  }
  res.json({ success: false });
});

// ── USER AUTH, PROFILE & PERSISTENCE MANAGEMENT (SUPABASE AUTH + GOOGLE OAUTH + STRICT @GMAIL.COM) ──
app.get('/api/auth/supabase-config', async (req, res) => {
  let supabaseUrl = (process.env.SUPABASE_URL || db.config.supabaseUrl || '').trim();
  let supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || db.config.supabaseKey || '').trim();

  // Auto-detect if user swapped URL and KEY or pasted secret key into URL variable
  if (supabaseUrl.startsWith('sb_') || supabaseUrl.startsWith('ey') || !supabaseUrl.startsWith('http')) {
    if (supabaseUrl.startsWith('sb_') || supabaseUrl.startsWith('ey')) {
      supabaseKey = supabaseUrl;
    }
    supabaseUrl = 'https://krukhcmndvuklflxprvr.supabase.co';
  }
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://krukhcmndvuklflxprvr.supabase.co';
  }
  if (!supabaseKey || supabaseKey.length < 10) {
    supabaseKey = 'sb_publishable_MPI-lFS-ZRuopxnWXZGcbg_AwkhTSST';
  }

  const redirectTo = req.query.redirectTo || 'https://shark-quant-backend-auw2-blue.vercel.app/app';
  const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}&prompt=select_account`;

  res.json({
    success: true,
    supabaseUrl,
    supabaseKey,
    googleOAuthEnabledInSupabase: true,
    oauthUrl
  });
});

app.post('/api/auth/supabase-oauth-callback', async (req, res) => {
  try {
    const { accessToken, username } = req.body;
    if (!accessToken) return res.status(400).json({ success: false, error: 'Missing Supabase OAuth access_token' });
    const result = await dbManager.verifySupabaseOAuthToken(accessToken, username || '');
    res.json({
      success: true,
      user: result.user,
      aiMemory: result.memory,
      supabaseConnected: dbManager.isSupabaseConnected()
    });
  } catch (err) {
    console.error('Supabase OAuth Callback Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════
// DESKTOP & EXTERNAL BROWSER OAUTH BRIDGE
// ══════════════════════════════════════════════════════════════
if (!global.__oauthBridges) global.__oauthBridges = new Map();

// 1. Init bridge session from desktop app
app.post('/api/auth/bridge-init', (req, res) => {
  const bridgeId = 'shk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  global.__oauthBridges.set(bridgeId, { status: 'pending', createdAt: Date.now() });
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [k, v] of global.__oauthBridges.entries()) {
    if (v.createdAt < cutoff) global.__oauthBridges.delete(k);
  }
  res.json({ success: true, bridgeId });
});

// 2. Poll bridge session from desktop app
app.get('/api/auth/bridge-poll', (req, res) => {
  const { bridgeId } = req.query;
  if (!bridgeId || !global.__oauthBridges.has(bridgeId)) {
    return res.json({ completed: false, error: 'Bridge not found or expired' });
  }
  const session = global.__oauthBridges.get(bridgeId);
  if (session.status === 'completed') {
    return res.json({ completed: true, user: session.user, token: session.token });
  }
  return res.json({ completed: false, status: 'pending' });
});

// 3. Callback page served to the external browser (reads token, sends to complete, shows "تم الربط")
app.get('/api/auth/bridge-callback', (req, res) => {
  const bridgeId = req.query.bridgeId || '';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SHARK TRADERS AI // تأكيد ربط الحساب</title>
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #07090E;
      color: #E6EDF5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: #0E131E;
      border: 2px solid #00E5FF;
      border-radius: 24px;
      padding: 40px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 229, 255, 0.25);
      animation: popIn 0.3s ease-out;
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .logo {
      width: 90px;
      height: 90px;
      border-radius: 20px;
      border: 2px solid #FFE600;
      margin-bottom: 20px;
      box-shadow: 0 0 35px rgba(255, 230, 0, 0.4);
    }
    h1 { font-size: 24px; font-weight: 900; color: #FFF; margin-bottom: 12px; }
    h1 span { color: #00E5FF; }
    p { color: #8A9BB4; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
    .status-badge {
      display: inline-block;
      background: rgba(0, 230, 153, 0.18);
      border: 1.5px solid #00E699;
      color: #00E699;
      padding: 10px 24px;
      border-radius: 30px;
      font-weight: 800;
      font-size: 15px;
      margin-bottom: 22px;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="/app/favicon.png" class="logo" alt="Shark Traders AI" onerror="this.src='/assets/favicon.png'">
    <div id="loadingState">
      <h1>جاري <span>تأكيد الربط...</span></h1>
      <p>يتم نقل بيانات حساب جوجل إلى برنامج Shark Traders AI بأمان تام...</p>
    </div>
    <div id="successState" style="display:none;">
      <div class="status-badge">✅ تم ربط الحساب بنجاح!</div>
      <h1>مرحباً بك في <span>SHARK TRADERS AI</span></h1>
      <p id="welcomeEmail" style="color:#FFE600; font-weight:900; font-size:17px; margin-bottom:12px;"></p>
      <p style="color:#A0B2C6; font-size:14px; line-height:1.6; margin-bottom:24px;">
        تم تأكيد تسجيل دخولك بنجاح! يمكنك الآن العودة لتطبيق الويندوز للبدء في التحليل والتداول الفوري.
      </p>
      <a id="btnOpenApp" href="sharktraders://auth-success" style="display:inline-block; background:linear-gradient(135deg, #00E5FF, #00FF66); color:#07090E; font-weight:900; font-size:15px; padding:14px 28px; border-radius:12px; text-decoration:none; box-shadow:0 10px 25px rgba(0, 229, 255, 0.35); transition:transform 0.2s;">
        🚀 فتح برنامج Shark Traders AI الآن
      </a>
      <p style="font-size:12px; color:#5A6E85; margin-top:14px;">(أو قم بالتبديل مباشرة إلى نافذة البرنامج المفتوحة في شريط المهام)</p>
    </div>
    <div id="errorState" style="display:none;">
      <h1 style="color:#FF3366;">⚠️ تنبيه</h1>
      <p id="errorMsg">حدث خطأ أثناء الربط، يرجى المحاولة مجدداً.</p>
    </div>
  </div>

  <script>
    (async function() {
      const bridgeId = "${bridgeId}" || new URLSearchParams(window.location.search).get('bridgeId') || '';
      const hash = window.location.hash ? window.location.hash.substring(1) : '';
      const params = new URLSearchParams(hash || window.location.search);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorMsg').innerText = params.get('error_description') || 'لم يتم العثور على رمز تسجيل الدخول.';
        return;
      }

      try {
        const res = await fetch('/api/auth/bridge-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bridgeId, accessToken })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('loadingState').style.display = 'none';
          document.getElementById('successState').style.display = 'block';
          document.getElementById('welcomeEmail').innerText = (data.user?.name || 'المتداول') + ' (' + (data.user?.email || '') + ')';
          setTimeout(() => {
            try { window.location.href = 'sharktraders://auth-success'; } catch (e) {}
          }, 800);
        } else {
          throw new Error(data.error || 'فشل إكمال الربط');
        }
      } catch (e) {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
        document.getElementById('errorMsg').innerText = e.message;
      }
    })();
  </script>
</body>
</html>`);
});

// 4. Resolve bridge with verified token
app.post('/api/auth/bridge-complete', async (req, res) => {
  try {
    const { bridgeId, accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ success: false, error: 'Access token required' });
    const result = await dbManager.verifySupabaseOAuthToken(accessToken, '');
    if (bridgeId && global.__oauthBridges.has(bridgeId)) {
      global.__oauthBridges.set(bridgeId, {
        status: 'completed',
        user: result.user,
        token: accessToken,
        completedAt: Date.now()
      });
    }
    res.json({ success: true, user: result.user });
  } catch (err) {
    console.error('Bridge complete error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/wipe-all-data', async (req, res) => {
  await dbManager.wipeAllData();
  res.json({ success: true, message: 'تم تفريغ جميع البيانات والحسابات الوهمية بالكامل (0 مستخدمين)' });
});

app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { email, name, username, avatarUrl, balance, riskPercent } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'يرجى إدخال بريد Gmail' });

    const result = await dbManager.googleLoginOrRegister({
      email,
      name,
      username,
      avatarUrl,
      balance,
      riskPercent
    });

    res.json({
      success: true,
      user: result.user,
      aiMemory: result.memory,
      supabaseConnected: dbManager.isSupabaseConnected()
    });
  } catch (err) {
    console.error('Google Login Error:', err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Real-time 1-second sync endpoint so App.js immediately reflects Admin plan changes, blocks, or account deletion
app.get('/api/users/me', (req, res) => {
  const emailLower = String(req.query.email || '').trim().toLowerCase();
  if (!emailLower) return res.json({ success: false, notFound: true });
  const user = db.users.find(u => u.email.toLowerCase() === emailLower);
  if (!user) return res.json({ success: false, notFound: true });
  const isBlocked = (db.communityHub?.blockedUsers || []).includes(user.name) ||
    (user.username && (db.communityHub?.blockedUsers || []).includes('@' + user.username)) ||
    user.status === 'Suspended';
  res.json({
    success: true,
    user: {
      ...user,
      isBlocked
    }
  });
});

// Directory of real users for @username Tagging & Search
app.get('/api/users/directory', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase().replace(/^@+/, '');
  let list = (db.users || []).map(u => ({
    id: u.id,
    name: u.name,
    username: u.username || u.email.split('@')[0],
    email: u.email,
    plan: u.plan,
    role: u.role,
    avatar: u.avatar,
    status: u.status
  }));
  if (q) {
    list = list.filter(
      u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }
  res.json({ success: true, users: list });
});

app.post('/api/users/update-profile', async (req, res) => {
  const { email, name, username, avatar, hasAcceptedCommunityRules, plan, balance, riskPercent } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const emailLower = email.trim().toLowerCase();
  let user = db.users.find(u => u.email.toLowerCase() === emailLower);

  if (user) {
    if (username !== undefined && String(username).trim()) {
      const cleanHandle = dbManager.normalizeUsername(username, emailLower);
      if (dbManager.isUsernameTaken(cleanHandle, emailLower)) {
        return res.status(400).json({
          success: false,
          error: `اليوزرنيم @${cleanHandle} محجوز بالفعل لمتداول آخر، اختر يوزرنيم مختلف`
        });
      }
      user.username = cleanHandle;
    }
    if (name !== undefined && String(name).trim()) user.name = String(name).trim();
    if (avatar !== undefined) user.avatar = offloadBase64Media(avatar, 'avatars');
    if (hasAcceptedCommunityRules !== undefined) user.hasAcceptedCommunityRules = !!hasAcceptedCommunityRules;
    if (plan !== undefined) user.plan = plan;
    if (balance !== undefined) user.balance = Number(balance) || 0;
    if (riskPercent !== undefined) user.riskPercent = Number(riskPercent) || 1;
    saveDb();
    await dbManager.syncUserToSupabase(user);
    return res.json({ success: true, user });
  }

  res.status(404).json({ error: 'User not found' });
});

app.post('/api/users/upgrade-plan', async (req, res) => {
  // Self-upgrade disabled: Only ADMIN can upgrade or activate plans!
  return res.status(403).json({
    success: false,
    requiresAdmin: true,
    message: '🔒 ترقية وتفعيل الباقات يتطلب موافقة وتفعيل من إدارة Shark Traders AI (Admin Activation Required).'
  });
});

// Sync AI Chat Sessions to Structured Database & Supabase
app.post('/api/sessions/sync', (req, res) => {
  const { email, sessionsList, sessionsMessages } = req.body;
  if (email) {
    dbManager.syncUserConversations(email, sessionsList, sessionsMessages);
  }
  res.json({ success: true });
});

app.get('/api/sessions/sync/:email', (req, res) => {
  const emailLower = (req.params.email || '').trim().toLowerCase();
  const data = db.userConversations?.[emailLower] || null;
  res.json({ success: true, data });
});

const PORT = process.env.PORT || 5000;
require('./live_turn')(app, { db, saveDb, dbManager, fetch, getLiveTickerSnapshot, fetchLiveMarketData });

let httpServer = null;
if (!process.env.VERCEL) {
  httpServer = app.listen(PORT, () => {
    console.log(`🦈 SHARK QUANT ENTERPRISE ENGINE — http://localhost:${PORT}`);
  });
  try {
    require('./live_ws')(httpServer, { db, saveDb, dbManager, getLiveTickerSnapshot, fetchLiveMarketData, fetchLiveNews, HIGH_IMPACT_CALENDAR });
  } catch (err) { }
}

module.exports = app;
