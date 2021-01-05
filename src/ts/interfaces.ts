import {indent} from '@utils/indent';

/**
 * Creates a new typescript interface with the given content.
 * The content is intended automatically.
 * @param name
 * @param content
 */
export const tsInterface = (
    name: string,
    content: string
): string => `export interface ${name} {
${indent(content)}     
}`;

/**
 * Converts a set of object-entries to interface properties.
 * @param entries
 */
export const tsInterfaceProperties = (entries: [string, string][]): string => {
    return entries.map(([prop, value]) => `${prop}: ${value};`).join('\n');
};
