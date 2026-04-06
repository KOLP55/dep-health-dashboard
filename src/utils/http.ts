import * as https from 'https';
import * as http from 'http';

/**
 * Lightweight HTTP client — no external dependencies needed.
 * Uses Node.js built-in https module.
 */
export function fetchJSON<T>(url: string, timeoutMs: number = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, { timeout: timeoutMs }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchJSON<T>(res.headers.location, timeoutMs).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

/**
 * POST JSON to a URL and return the parsed response.
 */
export function postJSON<T>(url: string, body: any, timeoutMs: number = 10000): Promise<T> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);

    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode} for POST ${url}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (e) {
          reject(new Error(`Failed to parse JSON from POST ${url}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout posting to ${url}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Batch fetch with concurrency control.
 * Prevents overwhelming registry APIs.
 */
export async function batchFetch<T, R>(
  items: T[],
  fetcher: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<Map<T, R | Error>> {
  const results = new Map<T, R | Error>();
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()!;
      try {
        results.set(item, await fetcher(item));
      } catch (e) {
        results.set(item, e instanceof Error ? e : new Error(String(e)));
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
