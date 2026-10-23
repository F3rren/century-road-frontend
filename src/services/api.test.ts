import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, REQUEST_TIMEOUT_MS } from './api';
import { isTimeout } from './fetchErrors';

// The browser's behaviour, as far as it matters here: a fetch that is aborted rejects with the
// signal's reason, at once if the signal already was.
function rejectWhenAborted(signal: AbortSignal | null | undefined, reject: (reason: unknown) => void) {
  if (signal?.aborted) reject(signal.reason);
  signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
}

const answer = (body: unknown, status = 200, statusText = '') =>
  ({ ok: status >= 200 && status < 300, status, statusText, json: () => Promise.resolve(body) }) as Response;

const stalled = (_url: unknown, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => rejectWhenAborted(init?.signal, reject));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('api.get', () => {
  it('returns the parsed answer', async () => {
    fetchMock.mockResolvedValueOnce(answer({ ok: 1 }));

    await expect(api.get('/history/paths')).resolves.toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/history/paths');
  });

  it('turns a non-ok answer into an Error carrying the status', async () => {
    fetchMock.mockResolvedValueOnce(answer({}, 404, 'Not Found'));

    await expect(api.get('/x')).rejects.toThrow('HTTP 404: Not Found');
  });
});

describe('timeout', () => {
  it('gives up on a service that never answers, with a TimeoutError', async () => {
    fetchMock.mockImplementation(stalled);

    const outcome = api.get('/history/on-this-day/10/16').catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    expect(isTimeout(await outcome)).toBe(true);
  });

  it('does not give up early', async () => {
    fetchMock.mockImplementation(stalled);

    let settled = false;
    api.get('/x').catch(() => { settled = true; });
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS - 1);

    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(true);
  });

  it('is a TimeoutError even where the browser rejects an aborted fetch with a plain AbortError', async () => {
    fetchMock.mockImplementation((_url, init) =>
      new Promise<Response>((_resolve, reject) =>
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
      ),
    );

    const outcome = api.get('/x').catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    expect(isTimeout(await outcome)).toBe(true);
  });

  it('also covers a body that stops arriving halfway', async () => {
    fetchMock.mockImplementation((_url, init) =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: '',
        json: () => new Promise((_resolve, reject) => rejectWhenAborted(init?.signal, reject)),
      } as Response),
    );

    const outcome = api.get('/x').catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    expect(isTimeout(await outcome)).toBe(true);
  });

  it('is never retried: another wait on a service that did not answer is a hang, not a retry', async () => {
    fetchMock.mockImplementation(stalled);

    const outcome = api.get('/x').catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS * 3);
    await outcome;

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('abort', () => {
  it('cancels the request and rejects with the signal\'s reason', async () => {
    fetchMock.mockImplementation(stalled);
    const controller = new AbortController();

    const outcome = api.get('/x', controller.signal).catch((e: unknown) => e);
    controller.abort();

    const error = await outcome;
    expect((error as DOMException).name).toBe('AbortError');
    expect(isTimeout(error)).toBe(false);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it('does not start a request for a signal that is already aborted', async () => {
    fetchMock.mockImplementation(stalled);
    const controller = new AbortController();
    controller.abort();

    await expect(api.get('/x', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('is not retried, and stops a retry that is waiting for its pause', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const controller = new AbortController();

    const outcome = api.get('/x', controller.signal).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await vi.advanceTimersByTimeAsync(5_000);

    expect(((await outcome) as DOMException).name).toBe('AbortError');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('leaves no timer behind once the request is done', async () => {
    fetchMock.mockResolvedValueOnce(answer({}));

    await api.get('/x');

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('one retry for a GET', () => {
  it('asks again after a network error, and returns the second answer', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(answer({ ok: 2 }));

    const result = api.get('/x');
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(result).resolves.toEqual({ ok: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([502, 504])('asks again after a %i', async (status) => {
    fetchMock.mockResolvedValueOnce(answer({}, status, 'Bad')).mockResolvedValueOnce(answer({ ok: 3 }));

    const result = api.get('/x');
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(result).resolves.toEqual({ ok: 3 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('waits before asking again, rather than at once', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(answer({}));

    const result = api.get('/x');
    await vi.advanceTimersByTimeAsync(300);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1_000);
    await result;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('is only one: a second failure is the answer', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const outcome = api.get('/x').catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(10_000);

    expect(await outcome).toBeInstanceOf(TypeError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // 503 is what history-service says when Wikipedia is rate-limiting it or down after its own
  // retries: asking again at once would only lean on it harder.
  it.each([
    [400, 'Bad Request'],
    [404, 'Not Found'],
    [429, 'Too Many Requests'],
    [500, 'Internal Server Error'],
    [503, 'Service Unavailable'],
  ])('does not ask again after a %i', async (status, text) => {
    fetchMock.mockResolvedValue(answer({}, status, text));

    const outcome = api.get('/x').catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(10_000);

    expect(((await outcome) as Error).message).toBe(`HTTP ${status}: ${text}`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('writes', () => {
  it('are never asked twice, whatever went wrong', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const outcome = api.post('/history/reports', { a: 1 }).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(10_000);

    expect(await outcome).toBeInstanceOf(TypeError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('still send their body and JSON content type, and are bounded by the same timeout', async () => {
    fetchMock.mockImplementation(stalled);

    const outcome = api.post('/history/reports', { a: 1 }).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    expect(isTimeout(await outcome)).toBe(true);
    const init = fetchMock.mock.calls[0][1];
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"a":1}');
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });
});
