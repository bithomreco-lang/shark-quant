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

async function captureTradingViewScreenshot(symbol = 'OANDA:XAUUSD', interval = '60') {
  if (process.env.VERCEL || !puppeteer || !CHROME_PATH) return null;
  const safeSym = String(symbol || 'OANDA:XAUUSD').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `tv_${safeSym}_${interval}_${Date.now()}.png`;
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const outPath = path.join(uploadsDir, filename);
  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(symbol)}&interval=${interval}&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0A0D14&studies=[]&theme=dark&style=1&timezone=exchange&locale=en`;

  let browser = null;
  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu', '--window-size=1200,650', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 650 });
    await page.goto(chartUrl, { waitUntil: 'networkidle2', timeout: 15000 });
    // Wait for the actual canvas element to be rendered
    await page.waitForSelector('canvas', { timeout: 10000 });
    // Wait for candles, price axis, and quotes to fully paint
    await new Promise(r => setTimeout(r, 1800));
    const buf = await page.screenshot({ type: 'png' });
    await browser.close();
    browser = null;

    if (buf && buf.length > 15000) {
      fs.writeFileSync(outPath, buf);
      return {
        filePath: `/uploads/${filename}`,
        base64: buf.toString('base64'),
        mimeType: 'image/png',
        buffer: buf
      };
    }
  } catch (err) {
    console.warn('Puppeteer chart capture warning:', err.message);
  } finally {
    if (browser) {
      try { await browser.close(); } catch (e) {}
    }
  }
  return null;
}

module.exports = {
  CHROME_PATH,
  captureTradingViewScreenshot
};

