import {env} from '@utils/env';
import indentString from 'indent-string';
import stripIndent from 'strip-indent';

// Pre-process env variable
const rawIndentation = env('CODE_INDENTATION');
const indentation = /^\d+$/.test(rawIndentation) ?
    Number(rawIndentation) : rawIndentation === 'tab' ?
        '\t' : null;

// Validate value
if (!indentation) {
    throw new Error(`Invalid value for CODE_INDENTATION, expected number or 'tab' but got '${rawIndentation}'`);
}

/**
 * Indents each line of the given string
 * @param s String to indent
 * @param level Indentation level
 */
export const indent = (s: string, level = 1): string => {
    return typeof indentation === 'number' ?
        indentString(s, indentation * level) :
        indentString(s, level, {indent: indentation});
};

/**
 * Trims the string and removes redundant indentation.
 * @param s
 */
export const clearIndent = (s: string): string => {
    return stripIndent(s.replace(/^\s*\n|\n\s*$/gm, ''));
};
