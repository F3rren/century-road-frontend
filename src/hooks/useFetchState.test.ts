import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import i18n from '@/i18n';
import { describeFetchError, useKeyedFetch } from './useFetchState';

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
