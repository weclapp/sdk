import {indent} from '@utils/indent';

export interface InterfaceProperty {
    name: string;
    type?: string;
    required?: boolean;
}

export const generateInterface = (name: string, entries: InterfaceProperty[], extend?: string): string => {
    const signature = `${name} ${extend ? `extends ${extend}` : ''}`.trim();

    const properties = entries
        .filter(v => v.type !== undefined)
        .map(({name, type, required}) => `${name}${required ? '' : '?'}: ${type};`)
        .join('\n');

    const body = properties.length ? `{\n${indent(properties)}\n}` : `{}`;
    return `export interface ${signature} ${body}`;
};

export const createInterface = (
    name: string,
    extend?: string
) => {
    const properties: InterfaceProperty[] = [];

    return {
        properties, name,
        add: (...props: InterfaceProperty[]) => properties.push(...props),
        toString: () => generateInterface(name, properties, extend)
    };
};
