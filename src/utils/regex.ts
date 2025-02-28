/**
 * Tries to match the content using the given regular expresison
 * @param content Content
 * @param r Regexp
 * @param g Optional group to extract
 */
export const match = (content: string, r: RegExp, g = 0): string | null => {
  return r.exec(content)?.[g] ?? null;
};
