import {indent} from '@utils/indent';
import {ObjectType} from '@utils/openapi/convertToTypeScriptType';

export interface InterfaceProperty {
    name: string;
    type?: string;
    required?: boolean;
}

export const generateInterfaceFromObject = (
    name: string,
    obj: ObjectType,
    propagateOptionalProperties?: boolean
): string => `export interface ${name} ${obj.toString(propagateOptionalProperties)}`;

export const generateInterface = (name: string, entries: InterfaceProperty[], extend?: string | string[]): string => {
    const signature = `${name} ${extend ? `extends ${Array.isArray(extend) ? extend.join(', ') : extend}` : ''}`.trim();

    const properties = entries
        .filter(v => v.type !== undefined)
        .filter((value, index, array) => array.findIndex(v => v.name === value.name) === index)
        .map(({name, type, required}) => `${name}${required ? '' : '?'}: ${type as string};`)
        .join('\n');

    const body = properties.length ? `{\n${indent(properties)}\n}` : `{}`;
    return `export interface ${signature} ${body}`;
};
