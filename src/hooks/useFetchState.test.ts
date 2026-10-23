import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import i18n from '@/i18n';
import { describeFetchError, httpStatus, useFetchOnce, useKeyedFetch } from './useFetchState';

describe('useKeyedFetch', () => {
  it('settles on the latest key even when an earlier key resolves after it', async () => {
    let resolveA: (value: string) => void = () => {};
    let resolveB: (value: string) => void = () => {};

    const fetcher = vi.fn((key: 'a' | 'b') => {
      if (key === 'a') return new Promise<string>((resolve) => { resolveA = resolve; });
      return new Promise<string>((resolve) => { resolveB = resolve; });
    });

    const { result, rerender } = renderHook(({ key }: { key: 'a' | 'b' }) => useKeyedFetch(key, fetcher), {
      initialProps: { key: 'a' },
    });

    expect(result.current.isLoading).toBe(true);

    rerender({ key: 'b' });
    expect(result.current.isLoading).toBe(true);

    // B resolves first, then the stale A resolves after it — A's result must
    // never be shown as B's answer.
    resolveB('data for b');
    await waitFor(() => expect(result.current.data).toBe('data for b'));

    resolveA('data for a');
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.data).toBe('data for b');
    expect(result.current.key).toBe('b');
  });

  it('asks again on retry, showing loading instead of the old error meanwhile', async () => {
    let calls = 0;
    let resolveSecond: (value: string) => void = () => {};
    const fetcher = vi.fn(() => {
      calls += 1;
      if (calls === 1) return Promise.reject(new TypeError('Failed to fetch'));
      return new Promise<string>((resolve) => { resolveSecond = resolve; });
    });

    const { result } = renderHook(() => useKeyedFetch('day', fetcher));
    await waitFor(() => expect(result.current.error).toBe(i18n.t('errors.network')));

    act(() => result.current.retry());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    resolveSecond('today');
    await waitFor(() => expect(result.current.data).toBe('today'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('abort', () => {
  // The signal a hook hands its fetcher is how a fetcher that passes it on to api.get() stops a
  // request nobody is waiting for any more.
  it('aborts the request of a key that has been left behind, and only that one', async () => {
    const signals: Record<string, AbortSignal> = {};
    const fetcher = vi.fn((key: 'a' | 'b', signal: AbortSignal) => {
      signals[key] = signal;
      return new Promise<string>(() => {});
    });

    const { rerender } = renderHook(({ key }: { key: 'a' | 'b' }) => useKeyedFetch(key, fetcher), {
      initialProps: { key: 'a' },
    });
    expect(signals.a.aborted).toBe(false);

    rerender({ key: 'b' });

    expect(signals.a.aborted).toBe(true);
    expect(signals.b.aborted).toBe(false);
  });

  it('aborts the request when the component goes away', () => {
    let signal: AbortSignal | undefined;
    const fetcher = vi.fn((_key: string, given: AbortSignal) => {
      signal = given;
      return new Promise<string>(() => {});
    });

    const { unmount } = renderHook(() => useKeyedFetch('day', fetcher));
    expect(signal?.aborted).toBe(false);

    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('shows nothing for an aborted request that rejects, and settles on the key that is current', async () => {
    const fetcher = vi.fn((key: 'a' | 'b', signal: AbortSignal) =>
      key === 'a'
        ? new Promise<string>((_resolve, reject) =>
            signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
          )
        : Promise.resolve('data for b'),
    );

    const { result, rerender } = renderHook(({ key }: { key: 'a' | 'b' }) => useKeyedFetch(key, fetcher), {
      initialProps: { key: 'a' },
    });
    rerender({ key: 'b' });

    await waitFor(() => expect(result.current.data).toBe('data for b'));
    expect(result.current.error).toBeNull();
  });

  it('is how a keyless fetch gets its signal too, and it is the first argument', () => {
    let signal: AbortSignal | undefined;
    const fetcher = vi.fn((given: AbortSignal) => {
      signal = given;
      return new Promise<string>(() => {});
    });

    const { unmount } = renderHook(() => useFetchOnce(fetcher));
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);

    unmount();
    expect(signal?.aborted).toBe(true);
  });
});

describe('useFetchOnce', () => {
  it('asks again on retry, so a keyless fetch can offer a "Riprova" too', async () => {
    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('HTTP 503: Service Unavailable'))
      .mockResolvedValueOnce('ok');

    const { result } = renderHook(() => useFetchOnce(fetcher));
    await waitFor(() => expect(result.current.error).toBe(i18n.t('errors.server')));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toBe('ok'));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('describeFetchError', () => {
  it('reads a fetch that never reached the server as a connection problem', () => {
    expect(describeFetchError(new TypeError('Failed to fetch'))).toBe(i18n.t('errors.network'));
  });

  it('reads a request the service did not answer in time as that, not as a connection problem', () => {
    expect(describeFetchError(new DOMException('No answer after 20s', 'TimeoutError'))).toBe(i18n.t('errors.timeout'));
    expect(i18n.t('errors.timeout')).not.toBe(i18n.t('errors.network'));
  });

  it('reads a request the page itself gave up on as nothing worth a message of its own', () => {
    expect(describeFetchError(new DOMException('aborted', 'AbortError'))).toBe(i18n.t('errors.unexpected'));
  });

  it('reads a 5xx answer as the service being down', () => {
    expect(describeFetchError(new Error('HTTP 502: Bad Gateway'))).toBe(i18n.t('errors.server'));
  });

  it('reads a 404 as content that does not exist, and a 429 as too many requests', () => {
    expect(describeFetchError(new Error('HTTP 404: Not Found'))).toBe(i18n.t('errors.notFound'));
    expect(describeFetchError(new Error('HTTP 429: Too Many Requests'))).toBe(i18n.t('errors.rateLimited'));
  });

  it('never shows the technical text of anything else', () => {
    expect(describeFetchError(new Error('Unexpected response shape from server'))).toBe(i18n.t('errors.unexpected'));
    expect(describeFetchError('a string')).toBe(i18n.t('errors.unexpected'));
  });
});

describe('httpStatus', () => {
  it('reads the status api.ts puts in its error, and nothing else', () => {
    expect(httpStatus(new Error('HTTP 400: Bad Request'))).toBe(400);
    expect(httpStatus(new Error('Unexpected response shape from server'))).toBeUndefined();
    expect(httpStatus(new TypeError('Failed to fetch'))).toBeUndefined();
    expect(httpStatus('HTTP 500')).toBeUndefined();
  });
});
