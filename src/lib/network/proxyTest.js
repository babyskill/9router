import { ProxyAgent, fetch as undiciFetch } from "undici";

const DEFAULT_TEST_URL = "https://google.com/";
const DEFAULT_TIMEOUT_MS = 8000;

function getErrorMessage(err) {
  if (!err) return "Unknown error";
  const base = err?.message || String(err);
  const causeCode = err?.cause?.code || err?.code;
  const causeMessage = err?.cause?.message;

  if (causeMessage && causeMessage !== base) {
    return causeCode ? `${base}: ${causeMessage} (${causeCode})` : `${base}: ${causeMessage}`;
  }

  if (causeCode && !base.includes(causeCode)) {
    return `${base} (${causeCode})`;
  }

  return base;
}

function normalizeString(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

export async function testProxyUrl({ proxyUrl, testUrl, timeoutMs } = {}) {
  const normalizedProxyUrl = normalizeString(proxyUrl);
  if (!normalizedProxyUrl) {
    return { ok: false, status: 400, error: "proxyUrl is required" };
  }

  const normalizedTestUrl = normalizeString(testUrl) || DEFAULT_TEST_URL;
  const timeoutMsRaw = Number(timeoutMs);
  const normalizedTimeoutMs =
    Number.isFinite(timeoutMsRaw) && timeoutMsRaw > 0
      ? Math.min(timeoutMsRaw, 30000)
      : DEFAULT_TIMEOUT_MS;

  const isSocks = normalizedProxyUrl && /^socks[45]/i.test(normalizedProxyUrl);
  if (isSocks) {
    try {
      const parsedTestUrl = new URL(normalizedTestUrl);
      const { SocksProxyAgent } = await import("socks-proxy-agent");
      const agent = new SocksProxyAgent(normalizedProxyUrl);

      const httpModule = await import("http");
      const httpsModule = await import("https");
      const http = httpModule.default ?? httpModule;
      const https = httpsModule.default ?? httpsModule;

      const isHttps = parsedTestUrl.protocol === "https:";
      const client = isHttps ? https : http;

      const controller = new AbortController();
      const startedAt = Date.now();
      const timer = setTimeout(() => controller.abort(), normalizedTimeoutMs);

      const reqOptions = {
        agent,
        hostname: parsedTestUrl.hostname,
        port: parsedTestUrl.port || (isHttps ? 443 : 80),
        path: parsedTestUrl.pathname + parsedTestUrl.search,
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "9Router",
        }
      };

      return new Promise((resolve) => {
        const req = client.request(reqOptions, (res) => {
          clearTimeout(timer);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            url: normalizedTestUrl,
            elapsedMs: Date.now() - startedAt,
          });
        });

        req.on("error", (err) => {
          clearTimeout(timer);
          const message = err?.name === "AbortError" ? "Proxy test timed out" : getErrorMessage(err);
          resolve({ ok: false, status: 500, error: message });
        });
        req.end();
      });
    } catch (err) {
      return { ok: false, status: 400, error: `Invalid SOCKS proxy: ${err.message}` };
    }
  }

  let dispatcher;

  try {
    try {
      dispatcher = new ProxyAgent({ uri: normalizedProxyUrl });
    } catch (err) {
      return {
        ok: false,
        status: 400,
        error: `Invalid proxy URL: ${err?.message || String(err)}`,
      };
    }

    const controller = new AbortController();
    const startedAt = Date.now();
    const timer = setTimeout(() => controller.abort(), normalizedTimeoutMs);

    try {
      const res = await undiciFetch(normalizedTestUrl, {
        method: "HEAD",
        dispatcher,
        signal: controller.signal,
        headers: {
          "User-Agent": "9Router",
        },
      });

      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        url: normalizedTestUrl,
        elapsedMs: Date.now() - startedAt,
      };
    } catch (err) {
      const message =
        err?.name === "AbortError"
          ? "Proxy test timed out"
          : getErrorMessage(err);
      return { ok: false, status: 500, error: message };
    } finally {
      clearTimeout(timer);
    }
  } finally {
    try {
      await dispatcher?.close?.();
    } catch {
      // ignore
    }
  }
}
