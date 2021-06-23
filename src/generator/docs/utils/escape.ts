/**
 * Escapes special characters in a string used for markdown.
 * @param s
 */
export const escapeMarkdown = (s: string): string => {
    return s.replace(/[#|`_~*<>]/g, sub => `\\${sub}`);
};

/**
 * Escapes inline values for markdown, e.g. new-lines with single spaces.
 * @param s
 */
export const escapeInline = (s: string): string => {
    return s.replace(/[\n\r]+/g, ' ');
};
