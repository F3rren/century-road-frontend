// The editorial texts are plain strings; a blank line separates paragraphs.
export function paragraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part !== '');
}
