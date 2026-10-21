import { describe, expect, it } from 'vitest';
import { isWebUrl } from './safeUrl';

describe('isWebUrl', () => {
  it.each([
    'https://it.wikipedia.org/wiki/Sputnik_1',
    'http://example.org/path?q=1#frag',
    'HTTPS://EXAMPLE.ORG',
    'https://commons.wikimedia.org/wiki/File:Royal_Standard_of_the_King_of_France.svg',
  ])('accepts the web URL %s', (url) => {
    expect(isWebUrl(url)).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    '\tjavascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'blob:https://example.org/uuid',
    'file:///etc/passwd',
    'ftp://example.org/file',
    'mailto:nome@example.org',
  ])('refuses %j, whatever its case or whitespace', (url) => {
    expect(isWebUrl(url)).toBe(false);
  });

  it.each(['', '   ', '//example.org/x', '/relative/path', 'example.org', 'not a url', 'https://', 'http://:80'])(
    'refuses what is not an absolute http(s) URL: %j',
    (url) => {
      expect(isWebUrl(url)).toBe(false);
    },
  );

  it('refuses a missing address', () => {
    expect(isWebUrl(undefined)).toBe(false);
    expect(isWebUrl(null)).toBe(false);
  });
});
