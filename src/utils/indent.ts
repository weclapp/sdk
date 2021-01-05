import {env} from '@utils/env';
import indentString from 'indent-string';

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
 * @param s
 */
export const indent = (s: string): string => {
    return typeof indentation === 'number' ?
        indentString(s, indentation) :
        indentString(s, 1, {indent: indentation});
};
