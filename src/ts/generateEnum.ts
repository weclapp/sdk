import {indent} from '@utils/indent';
import {snakeCase} from 'change-case';

const transformKey = (s: string) => snakeCase(s).toUpperCase();

export const generateEnum = (name: string, values: string[]): string => {
    const props = indent(values.map(v => `${transformKey(v)} = '${v}'`).join(',\n'));
    return `export enum ${name} {\n${props}\n}`;
};
