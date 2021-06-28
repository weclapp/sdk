import {indent} from '@utils/indent';

/**
 * Converts a set of object-entries to interface properties.
 * @param entries
 * @param indentLevel
 */
export const tsInterfaceProperties = (entries: TSInterfaceProperty[], indentLevel?: number): string => {
    const str = entries.map(({name, value,required}) => `${name}${required ? '' : '?'}: ${value};`).join('\n');
    return indentLevel !== undefined ? indent(str, indentLevel) : str;
};

export interface TSInterfaceProperty {
	name: string;
	value: string;
	required: boolean;
}
