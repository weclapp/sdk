import {generateBlockComment} from '@ts/generateComment';
import {generateType} from '@ts/generateType';
import {arrayify} from '@utils/arrayify';
import {indent} from '@utils/indent';
import {ObjectType} from '@utils/openapi/convertToTypeScriptType';

export interface InterfaceProperty {
    name: string;
    type?: string;
    required?: boolean;
    comment?: string;
}

const generateInterfaceProperties = (entries: InterfaceProperty[]): string => {
    const properties = entries
        .filter(v => v.type !== undefined)
        .filter((value, index, array) => array.findIndex(v => v.name === value.name) === index)
        .map(({name, type, required, comment}) =>
            `${comment ? `${generateBlockComment(comment)}\n` : ''}${name}${required ? '' : '?'}: ${type as string};`
        )
        .join('\n');

    return properties.length ? `{\n${indent(properties)}\n}` : `{}`;
};

export const generateInterfaceFromObject = (
    name: string,
    obj: ObjectType,
    propagateOptionalProperties?: boolean
): string => `export interface ${name} ${obj.toString(propagateOptionalProperties)}`;

export const generateInterface = (
    name: string,
    entries: InterfaceProperty[],
    extend?: string | string[]
): string => {
    const signature = `${name} ${extend ? `extends ${arrayify(extend).join(', ')}` : ''}`.trim();
    const body = generateInterfaceProperties(entries);
    return `export interface ${signature} ${body}`;
};

export const generateInterfaceType = (
    name: string,
    entries: InterfaceProperty[],
    extend?: string | string[]
): string => {
    const body = generateInterfaceProperties(entries);
    const bases = extend ? arrayify(extend).join(' & ') : undefined;
    return generateType(name, `${bases ? `${bases} & ` : ''}${body}`);
};

