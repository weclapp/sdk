/**
 * Pluralizes a word, most of the time correct.
 * @param s String to pluralize.
 */
export const pluralize = (s: string): string => {
  return s.endsWith('s') ? s : s.endsWith('y') ? `${s.slice(0, -1)}ies` : `${s}s`;
};
