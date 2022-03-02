import {indent} from '@utils/indent';

export interface InterfacePropertyType {
    type: 'primitive' | 'reference';
    value: string;
}

export interface InterfaceProperty {
    name: string;
    type: InterfacePropertyType;
    required?: boolean;
}

export const generateInterface = (name: string, entries: InterfaceProperty[]): string => {
    const body = entries
        .map(({name, type, required}) => `${name}${required ? '' : '?'}: ${type.value};`)
        .join('\n');

    return `export interface ${name} {\n${indent(body)}\n}`;
};
