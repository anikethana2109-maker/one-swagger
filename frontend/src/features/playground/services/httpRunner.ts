import { HttpRequestConfig, HttpResponseResult, HistoryItem } from '../../../types/http';
import { saveLocalHistoryItem } from '../../history/services/localHistoryStorage';

declare const chrome: any;

export async function executeHttpRequest(
  config: HttpRequestConfig,
  authToken?: string
): Promise<HttpResponseResult> {
  const startTime = performance.now();

  const headers: Record<string, string> = { ...config.headers };

  if (config.contentType) {
    headers['Content-Type'] = config.contentType;
  } else if (config.body && typeof config.body === 'object' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken && !headers['Authorization']) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  let targetUrl = config.url;
  if (config.params && Object.keys(config.params).length > 0) {
    try {
      const urlObj = new URL(targetUrl);
      Object.entries(config.params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          urlObj.searchParams.set(k, String(v));
        }
      });
      targetUrl = urlObj.toString();
    } catch {}
  }

  let bodyData: any = undefined;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase()) && config.body) {
    if (typeof config.body === 'object') {
      bodyData = JSON.stringify(config.body);
    } else {
      bodyData = String(config.body);
    }
  }

  // 1. Chrome Extension Background Proxy (Zero-CORS)
  if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
    try {
      const proxyResponse = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'FETCH_PROXY',
            payload: {
              url: targetUrl,
              options: {
                method: config.method.toUpperCase(),
                headers,
                body: bodyData
              }
            }
          },
          (res: any) => {
            if (chrome.runtime?.lastError) {
              resolve(null);
            } else {
              resolve(res);
            }
          }
        );
      });

      if (proxyResponse && proxyResponse.success && proxyResponse.data) {
        const result = proxyResponse.data as HttpResponseResult;
        logHistory(config, targetUrl, result);
        return result;
      }
    } catch {}
  }

  // 2. Direct browser fetch
  try {
    const res = await fetch(targetUrl, {
      method: config.method.toUpperCase(),
      headers,
      body: bodyData
    });

    const latencyMs = Math.round(performance.now() - startTime);
    const resHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      resHeaders[key] = val;
    });

    const rawText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }

    const sizeBytes = new Blob([rawText]).size;
    const result: HttpResponseResult = {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
      data,
      rawText,
      latencyMs,
      sizeBytes,
      timestamp: new Date().toISOString()
    };

    logHistory(config, targetUrl, result);
    return result;
  } catch (directErr: any) {
    // 3. Fallback: Dev CORS proxy
    try {
      const proxyUrl = `/__cors_proxy?url=${encodeURIComponent(targetUrl)}`;
      const proxyRes = await fetch(proxyUrl, {
        method: config.method.toUpperCase(),
        headers,
        body: bodyData
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const resHeaders: Record<string, string> = {};
      proxyRes.headers.forEach((val, key) => {
        resHeaders[key] = val;
      });

      const rawText = await proxyRes.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }

      const sizeBytes = new Blob([rawText]).size;
      const result: HttpResponseResult = {
        status: proxyRes.status,
        statusText: proxyRes.statusText,
        headers: resHeaders,
        data,
        rawText,
        latencyMs,
        sizeBytes,
        timestamp: new Date().toISOString()
      };

      logHistory(config, targetUrl, result);
      return result;
    } catch (proxyErr: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      const errorResult: HttpResponseResult = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: directErr.message || 'Request failed' },
        rawText: directErr.message || 'Request failed',
        latencyMs,
        sizeBytes: 0,
        timestamp: new Date().toISOString()
      };

      logHistory(config, targetUrl, errorResult);
      return errorResult;
    }
  }
}

function logHistory(config: HttpRequestConfig, finalUrl: string, res: HttpResponseResult): void {
  try {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: res.timestamp,
      url: finalUrl,
      method: config.method.toUpperCase(),
      status: res.status,
      latencyMs: res.latencyMs,
      requestBody: config.body,
      responsePreview: typeof res.data === 'object' ? JSON.stringify(res.data).slice(0, 120) : String(res.rawText).slice(0, 120)
    };
    saveLocalHistoryItem(item);
  } catch (err) {
    console.error('Failed to log history', err);
  }
}
