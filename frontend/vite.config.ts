import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';

const bgWorkerCode = `
chrome.runtime.onInstalled.addListener(() => {
  console.log('One Swagger Extension Initialized');
});
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'FETCH_PROXY') {
    const { url, options } = message.payload;
    const startTime = performance.now();
    fetch(url, options)
      .then(async (response) => {
        const latencyMs = Math.round(performance.now() - startTime);
        const headers = {};
        response.headers.forEach((val, key) => { headers[key] = val; });
        let data = null;
        let rawText = '';
        try { rawText = await response.text(); data = JSON.parse(rawText); } catch { data = rawText; }
        const sizeBytes = new Blob([rawText]).size;
        sendResponse({ success: true, data: { status: response.status, statusText: response.statusText, headers, data, rawText, latencyMs, sizeBytes, timestamp: new Date().toISOString() } });
      })
      .catch((error) => {
        const latencyMs = Math.round(performance.now() - startTime);
        sendResponse({ success: false, error: error.message || 'Network request failed', latencyMs });
      });
    return true;
  }
});
`.trim();

const corsProxyPlugin = () => ({
  name: 'cors-proxy-plugin',
  configureServer(server: any) {
    server.middlewares.use('/__cors_proxy', (req: any, res: any) => {
      const urlObj = new URL(req.url, 'http://localhost');
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing url parameter' }));
        return;
      }

      const chunks: any[] = [];
      req.on('data', (chunk: any) => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const bodyBuffer = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
          const headersToForward: Record<string, string> = {};
          
          for (const [key, value] of Object.entries(req.headers)) {
            if (!['host', 'origin', 'referer', 'content-length'].includes(key.toLowerCase()) && typeof value === 'string') {
              headersToForward[key] = value;
            }
          }

          const fetchOptions: any = {
            method: req.method,
            headers: headersToForward
          };
          if (bodyBuffer && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
            fetchOptions.body = bodyBuffer;
          }

          const response = await fetch(targetUrl, fetchOptions);
          
          res.statusCode = response.status;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', '*');
          res.setHeader('Access-Control-Allow-Headers', '*');
          
          response.headers.forEach((val, key) => {
            if (key.toLowerCase() !== 'content-encoding') {
              res.setHeader(key, val);
            }
          });

          const resBuffer = await response.arrayBuffer();
          res.end(Buffer.from(resBuffer));
        } catch (err: any) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ error: err.message || 'Proxy Error' }));
        }
      });
    });
  }
});

const copyExtensionFiles = () => ({
  name: 'copy-extension-files',
  closeBundle() {
    const distDir = resolve(__dirname, 'dist');

    copyFileSync(resolve(__dirname, 'manifest.json'), resolve(distDir, 'manifest.json'));

    const iconsDir = resolve(distDir, 'icons');
    if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });
    ['icon16.png', 'icon48.png', 'icon128.png'].forEach((icon) => {
      const src = resolve(__dirname, 'public', 'icons', icon);
      if (existsSync(src)) copyFileSync(src, resolve(iconsDir, icon));
    });

    const bgDir = resolve(distDir, 'background');
    if (!existsSync(bgDir)) mkdirSync(bgDir, { recursive: true });
    writeFileSync(resolve(bgDir, 'service-worker.js'), bgWorkerCode);
  }
});

export default defineConfig({
  plugins: [react(), corsProxyPlugin(), copyExtensionFiles()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sidepanel: resolve(__dirname, 'sidepanel.html')
      }
    }
  }
});
