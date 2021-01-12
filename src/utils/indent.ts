import indentString from 'indent-string';

/**
 * Indents each line of the given string
 * @param s String to indent
 * @param level Indentation level
 */
export const indent = (s: string, level = 1): string => {
    return indentString(s, 4 * level);
};
