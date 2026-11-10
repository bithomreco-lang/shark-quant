const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH ||
  (fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : (fs.existsSync('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe')
        ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        : (fs.existsSync('/usr/bin/chromium')
            ? '/usr/bin/chromium'
            : (fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : null))));

let sharedBrowser = null;
let sharedBrowserLaunching = null;

async function getWarmBrowser() {
  if (!CHROME_PATH) return null;
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }
  if (sharedBrowserLaunching) {
    return await sharedBrowserLaunching;
  }

  sharedBrowserLaunching = (async () => {
    try {
      const b = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--window-size=1280,820',
          '--disable-features=IsolateOrigins,site-per-process',
          '--blink-settings=imagesEnabled=true'
        ]
      });
      b.on('disconnected', () => { sharedBrowser = null; });
      sharedBrowser = b;
      return b;
    } catch (err) {
      console.warn('Warm browser launch warning:', err.message);
      return null;
    } finally {
      sharedBrowserLaunching = null;
    }
  })();

  return await sharedBrowserLaunching;
}

// Pre-warm browser in background immediately
setTimeout(() => { getWarmBrowser().catch(() => {}); }, 300);

// Active interactive page session for scrolling and interacting inside calls
let activePage = null;
let activePageUrl = '';
let activeScrollY = 0;

async function captureTradingViewScreenshot(symbol = 'OANDA:XAUUSD', interval = '60') {
  if (!CHROME_PATH) return null;
  const safeSym = String(symbol || 'OANDA:XAUUSD').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `tv_${safeSym}_${interval}_${Date.now()}.png`;
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const outPath = path.join(uploadsDir, filename);
  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(symbol)}&interval=${interval}&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0A0D14&studies=[]&theme=dark&style=1&timezone=exchange&locale=en`;

  const browser = await getWarmBrowser();
  if (!browser) return null;

  let page = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 650 });
    await page.goto(chartUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
    try { await page.waitForSelector('canvas', { timeout: 6000 }); } catch (e) {}
    await new Promise(r => setTimeout(r, 900));
    const buf = await page.screenshot({ type: 'png' });
    await page.close();
    page = null;

    if (buf && buf.length > 5000) {
      fs.writeFileSync(outPath, buf);
      return {
        filePath: `/uploads/${filename}`,
        base64: buf.toString('base64'),
        mimeType: 'image/png',
        buffer: buf
      };
    }
  } catch (err) {
    console.warn('TradingView screenshot warning:', err.message);
    if (page) { try { await page.close(); } catch (e) {} }
  }
  return null;
}

async function captureWebScreenshot(url, options = {}) {
  if (!CHROME_PATH || !url) return null;
  const browser = await getWarmBrowser();
  if (!browser) return null;

  const safeName = String(url).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
  const filename = `web_${safeName}_${Date.now()}.jpg`;
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const outPath = path.join(uploadsDir, filename);

  try {
    // If user is continuing on the exact same page, reuse active page for smooth scrolling!
    let page = (activePage && !activePage.isClosed() && activePageUrl === url) ? activePage : null;
    if (!page) {
      if (activePage && !activePage.isClosed()) {
        try { await activePage.close(); } catch (e) {}
      }
      page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 820 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ar,fr-FR,fr;q=0.9,en-US,en;q=0.8',
        'Upgrade-Insecure-Requests': '1'
      });
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      activePage = page;
      activePageUrl = url;
      activeScrollY = 0;
    }

    // Scroll if requested
    if (options.scroll) {
      const delta = options.scroll === 'up' ? -600 : (Number(options.scroll) || 600);
      activeScrollY = Math.max(0, activeScrollY + delta);
      await page.evaluate((sy) => { window.scrollTo({ top: sy, behavior: 'instant' }); }, activeScrollY);
      await new Promise(r => setTimeout(r, 400));
    } else {
      await new Promise(r => setTimeout(r, 700));
    }

    const title = await page.title().catch(() => '');
    const buf = await page.screenshot({ type: 'jpeg', quality: 75 });

    if (buf && buf.length > 5000) {
      fs.writeFileSync(outPath, buf);
      return {
        filePath: `/uploads/${filename}`,
        base64: buf.toString('base64'),
        mimeType: 'image/jpeg',
        buffer: buf,
        title,
        url,
        currentScrollY: activeScrollY
      };
    }
  } catch (err) {
    console.warn('Web capture warning:', err.message);
  }
  return null;
}

async function scrollActivePage(direction = 'down', amount = 600) {
  if (!activePage || activePage.isClosed() || !activePageUrl) {
    return null;
  }
  const delta = direction === 'up' ? -amount : amount;
  return await captureWebScreenshot(activePageUrl, { scroll: delta });
}

// Fast YouTube Financial News & Live Stream Search
async function searchYouTubeFinancial(query = 'gold trading live news') {
  const q = String(query).trim();
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' market news')}`;
  const snap = await captureWebScreenshot(searchUrl);

  // Quick scrape of top video IDs
  let topVideoId = 'live_stream';
  let videoTitle = `${q} - YouTube Market Broadcast`;
  try {
    const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    const res = await fetchFn(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const vidMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (vidMatch && vidMatch[1]) {
      topVideoId = vidMatch[1];
    }
  } catch (e) {}

  return {
    query: q,
    searchUrl,
    topVideoId,
    embedUrl: `https://www.youtube.com/embed/${topVideoId}?autoplay=1&mute=0`,
    title: videoTitle,
    screenshot: snap
  };
}

module.exports = {
  CHROME_PATH,
  captureTradingViewScreenshot,
  captureWebScreenshot,
  scrollActivePage,
  searchYouTubeFinancial
};
