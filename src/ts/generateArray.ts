import {generateString} from '@ts/generateString';
import {concat} from './concat';

export const generateArray = (values: unknown[]): string => {
    return `[${concat(values.map(v => generateString(String(v))))}]`;
};