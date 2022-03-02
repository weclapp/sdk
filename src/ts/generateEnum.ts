import {indent} from '@utils/indent';

export const generateEnum = (name: string, values: string[]): string => {
    const props = indent(values.map(v => `${v} = '${v}',`).join('\n'));
    return `export enum ${name} {\n${props}\n}`;
};
