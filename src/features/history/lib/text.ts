// Wikipedia's Italian feed ends many entries with a stray ";" (they are list
// items in the source); it reads as a typo once the entry stands alone.
export function cleanText(text: string): string {
  return text.replace(/[;\s]+$/, '');
}
