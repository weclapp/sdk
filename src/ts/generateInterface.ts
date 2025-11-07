import { generateInlineComment } from '@ts/generateComment';
import { generateType } from '@ts/generateType';
import { arrayify } from '@utils/arrayify';
import { indent } from '@utils/indent';
import { ObjectType, PropertyPropagationOption } from '@utils/openapi/convertToTypeScriptType';

export interface InterfaceProperty {
  name: string;
  type?: string;
  required?: boolean;
  readonly?: boolean;
  comment?: string;
  filterable?: boolean;
}

const generateInterfaceProperties = (entries: InterfaceProperty[]): string => {
  const properties = entries
    .filter((v) => v.type !== undefined)
    .filter((value, index, array) => array.findIndex((v) => v.name === value.name) === index)
    .map(({ name, type, required, readonly, comment }) => {
      const cmd = comment ? `${generateInlineComment(comment)}\n` : '';
      const req = required ? '' : '?';
      const rol = readonly ? 'readonly ' : '';
      return `${cmd + rol + name + req}: ${type as string};`;
    })
    .join('\n');

  return properties.length ? `{\n${indent(properties)}\n}` : `{}`;
};

export const generateInterfaceFromObject = (
  name: string,
  obj: ObjectType,
  propertyPropagationOption?: PropertyPropagationOption
): string => `export interface ${name} ${obj.toString(propertyPropagationOption)}`;

export const generateInterface = (name: string, entries: InterfaceProperty[], extend?: string | string[]): string => {
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

  let typeDefinition = '';
  if (bases) {
    typeDefinition = bases;
  } else {
    typeDefinition = body;
  }
  if (bases && body !== '{}') {
    typeDefinition += ` & ${body}`;
  }

  return generateType(name, typeDefinition);
};
