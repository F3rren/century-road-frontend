// The only schemes an external link may use. Everything else a URL can start with (`javascript:`,
// `data:`, `vbscript:`, `blob:`, `file:`) runs code or reads local content when followed, and the
// addresses shown as links come from outside the app: the backend, and through it Wikipedia.
const WEB_PROTOCOLS = new Set(['http:', 'https:']);

// True only for an absolute http(s) URL. A relative address, a protocol-relative one (`//host`) or
// anything that does not parse is not a web URL. The URL parser itself drops the leading spaces,
// tabs and line breaks and reads the scheme case-insensitively, so ` JavaScript:…` and `java\tscript:…`
// are seen for what they are rather than slipping past a string comparison.
export function isWebUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    return WEB_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}
