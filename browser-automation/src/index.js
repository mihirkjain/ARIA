/**
 * ARIA Browser Automation Service
 * Provides Express API for browser control via Puppeteer
 * Listens on localhost:8001
 */

import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json());

// Browser instances store
const browsers = new Map();
const tabs = new Map();
let browserCounter = 0;
let tabCounter = 0;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'aria-browser-automation' });
});

// Launch new browser
app.post('/api/browser/launch', async (req, res) => {
  try {
    const { browser_type = 'chromium' } = req.body;

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const browserId = `browser_${browserCounter++}`;
    browsers.set(browserId, browser);

    res.json({
      success: true,
      browser_id: browserId,
      browser_type: 'chromium',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Open new tab
app.post('/api/browser/open-tab', async (req, res) => {
  try {
    const { browser_id, url = 'about:blank' } = req.body;

    if (!browsers.has(browser_id)) {
      return res.status(404).json({ success: false, error: 'Browser not found' });
    }

    const browser = browsers.get(browser_id);
    const page = await browser.newPage();

    const tabId = `tab_${tabCounter++}`;
    tabs.set(tabId, { page, browser_id, url });

    if (url !== 'about:blank') {
      await page.goto(url, { waitUntil: 'networkidle2' });
    }

    res.json({
      success: true,
      tab_id: tabId,
      browser_id,
      url: page.url(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Navigate to URL
app.post('/api/browser/navigate', async (req, res) => {
  try {
    const { tab_id, url } = req.body;

    if (!tabs.has(tab_id)) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    const tab = tabs.get(tab_id);
    await tab.page.goto(url, { waitUntil: 'networkidle2' });

    res.json({
      success: true,
      url: tab.page.url(),
      title: await tab.page.title(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all open tabs
app.get('/api/browser/tabs', async (req, res) => {
  try {
    const tabList = [];

    for (const [tabId, tab] of tabs.entries()) {
      tabList.push({
        tab_id: tabId,
        browser_id: tab.browser_id,
        url: tab.page.url(),
        title: await tab.page.title(),
      });
    }

    res.json({
      success: true,
      tabs: tabList,
      count: tabList.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Click element
app.post('/api/browser/click', async (req, res) => {
  try {
    const { tab_id, selector } = req.body;

    if (!tabs.has(tab_id)) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    const tab = tabs.get(tab_id);
    const element = await tab.page.$(selector);

    if (!element) {
      return res.status(404).json({ success: false, error: 'Element not found', element_found: false });
    }

    await element.click();

    res.json({
      success: true,
      element_found: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Type text in element
app.post('/api/browser/type-text', async (req, res) => {
  try {
    const { tab_id, selector, text } = req.body;

    if (!tabs.has(tab_id)) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    const tab = tabs.get(tab_id);
    await tab.page.type(selector, text);

    res.json({
      success: true,
      text_length: text.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Extract page content
app.post('/api/browser/extract-content', async (req, res) => {
  try {
    const { tab_id } = req.body;

    if (!tabs.has(tab_id)) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    const tab = tabs.get(tab_id);

    const content = await tab.page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      text: document.body.innerText.slice(0, 5000), // First 5000 chars
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent,
        href: a.href,
      })),
      images: Array.from(document.querySelectorAll('img')).slice(0, 10).map(img => ({
        src: img.src,
        alt: img.alt,
      })),
    }));

    res.json({
      success: true,
      content,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Take screenshot
app.post('/api/browser/screenshot', async (req, res) => {
  try {
    const { tab_id } = req.body;

    if (!tabs.has(tab_id)) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    const tab = tabs.get(tab_id);
    const screenshot = await tab.page.screenshot({ encoding: 'base64' });

    res.json({
      success: true,
      screenshot: `data:image/png;base64,${screenshot}`,
      size: screenshot.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute JavaScript
app.post('/api/browser/execute-script', async (req, res) => {
  try {
    const { tab_id, script } = req.body;

    if (!tabs.has(tab_id)) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    const tab = tabs.get(tab_id);

    // Safe eval with error handling
    const result = await tab.page.evaluate((code) => {
      try {
        return eval(`(${code})`);
      } catch (e) {
        return { error: e.message };
      }
    }, script);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Close tab
app.post('/api/browser/close-tab', async (req, res) => {
  try {
    const { tab_id } = req.body;

    if (!tabs.has(tab_id)) {
      return res.status(404).json({ success: false, error: 'Tab not found' });
    }

    const tab = tabs.get(tab_id);
    await tab.page.close();
    tabs.delete(tab_id);

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Close browser
app.post('/api/browser/close-browser', async (req, res) => {
  try {
    const { browser_id } = req.body;

    if (!browsers.has(browser_id)) {
      return res.status(404).json({ success: false, error: 'Browser not found' });
    }

    const browser = browsers.get(browser_id);

    // Close all tabs in this browser
    for (const [tabId, tab] of tabs.entries()) {
      if (tab.browser_id === browser_id) {
        await tab.page.close();
        tabs.delete(tabId);
      }
    }

    await browser.close();
    browsers.delete(browser_id);

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`ARIA Browser Automation Service running on http://localhost:${PORT}`);
});
