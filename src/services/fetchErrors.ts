// What api.ts throws, and how to read it back. A module of its own, not part of api.ts: the
// hooks read errors with these, and tests that replace api.ts with a stub must not take them away.
// Errors are plain thrown Errors here too - no error class, only the platform's own types.

// The status api.ts puts in the message of the Error it throws for a non-ok answer
// ("HTTP 404: Not Found"); undefined for anything else.
export function httpStatus(error: unknown): number | undefined {
  const status = error instanceof Error ? /^HTTP (\d{3})/.exec(error.message)?.[1] : undefined;
  return status === undefined ? undefined : Number(status);
}

// What a request rejects with when the gateway does not answer in time: the platform's own
// "TimeoutError", the one AbortSignal.timeout() produces.
export function timeoutError(afterMs: number): DOMException {
  return new DOMException(`No answer after ${afterMs / 1000}s`, 'TimeoutError');
}

// By name, not instanceof: the same error crosses realms (iframes, test environments) as a
// different DOMException class.
export function isTimeout(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'TimeoutError';
}
