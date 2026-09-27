import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useKeyedFetch } from './useFetchState';

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
