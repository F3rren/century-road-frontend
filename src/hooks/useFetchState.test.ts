import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import i18n from '@/i18n';
import { describeFetchError, useFetchOnce, useKeyedFetch } from './useFetchState';

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

  it('reads a 5xx answer as the service being down', () => {
    expect(describeFetchError(new Error('HTTP 502: Bad Gateway'))).toBe(i18n.t('errors.server'));
  });

  it('never shows the technical text of anything else', () => {
    expect(describeFetchError(new Error('Unexpected response shape from server'))).toBe(i18n.t('errors.unexpected'));
    expect(describeFetchError('a string')).toBe(i18n.t('errors.unexpected'));
  });
});
