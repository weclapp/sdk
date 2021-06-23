import {indent} from '@utils/indent';

/**
 * Converts a set of object-entries to interface properties.
 * @param entries
 * @param indentLevel
 */
export const tsInterfaceProperties = (entries: [string, string][], indentLevel?: number): string => {
    const str = entries.map(([prop, value]) => `${prop}: ${value};`).join('\n');
    return indentLevel !== undefined ? indent(str, indentLevel) : str;
};
