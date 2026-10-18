import { httpStatus, timeoutError } from "./fetchErrors";

// "||" and not "??": an unset repository variable reaches the build as an empty
// string, not as undefined, and "??" would happily accept it - leaving every request
// pointed at the site root instead of the API.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// How long one attempt may wait for the gateway before it is given up on. Without a limit a
// request to a stalled service stays "loading" until the browser's own (minutes-long) timeout.
// Long enough for what the backend can honestly need: a cold day loads two languages from
// Wikipedia one after the other, ~10s when Wikipedia is merely slow. The gateway bounds its side
// too (10s for most routes, 30s for history), so this is the limit a reader actually meets.
export const REQUEST_TIMEOUT_MS = 20_000;

// A GET that failed in a way that often does not repeat gets one more try after this pause
// (plus as much again at random, so many clients do not all come back at the same instant).
const RETRY_PAUSE_MS = 400;

// 502 and 504 are the gateway failing to reach, or hear back from, a service for a moment.
// Deliberately not 503: history-service answers that when Wikipedia is rate-limiting it or
// down after its own retries and cool-down, and asking again straight away can only add load
// to the thing that is already struggling. Not 429 either, and never a timeout: waiting
// another 20s on a service that did not answer in the first 20s is not a retry, it is a hang.
const RETRYABLE_STATUSES = [502, 504];

// fetch() rejects with a TypeError when the server cannot be reached at all (offline, DNS,
// connection reset); an answer, even a 5xx one, is not that.
function isTransient(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const status = httpStatus(error);
  return status !== undefined && RETRYABLE_STATUSES.includes(status);
}

// One attempt, with its own clock. The caller's signal and the timer both feed one controller,
// so fetch() sees a single signal; which of the two fired is remembered here, not read back from
// the rejection, because older browsers reject with a plain AbortError whatever the reason was.
async function attempt<T>(url: string, init: RequestInit, callerSignal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const abortLikeCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) abortLikeCaller();
  callerSignal?.addEventListener("abort", abortLikeCaller, { once: true });
  const timeout = timeoutError(REQUEST_TIMEOUT_MS);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort(timeout);
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    // Awaited here, inside the try: the timer also covers a body that stops arriving halfway.
    return await (response.json() as Promise<T>);
  } catch (error) {
    throw timedOut ? timeout : error;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener("abort", abortLikeCaller);
  }
}

// Resolves after `ms`, or rejects at once with the signal's reason if it is aborted first.
function pause(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { signal: given, ...init } = options;
  const signal = given ?? undefined;
  const url = `${BASE_URL}${endpoint}`;
  const settings: RequestInit = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  };
  // Only a GET is asked again: repeating a write could do it twice.
  const retries = (init.method ?? "GET").toUpperCase() === "GET" ? 1 : 0;

  for (let tried = 0; ; tried += 1) {
    try {
      return await attempt<T>(url, settings, signal);
    } catch (error) {
      if (tried >= retries || signal?.aborted || !isTransient(error)) throw error;
      await pause(RETRY_PAUSE_MS * (1 + Math.random()), signal);
    }
  }
}

// `signal` lets a caller abandon a request it no longer needs (a hook whose key moved on):
// the request is cancelled and rejects with the signal's reason.
export const api = {
  get: <T>(endpoint: string, signal?: AbortSignal) => request<T>(endpoint, { signal }),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
