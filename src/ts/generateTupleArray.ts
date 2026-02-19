import { concat } from '@utils/concat';
import { generateString } from '@ts/generateString';

export const generateTupleArray = (values: string[]): string => `(${concat(values.map(generateString), ' | ')})[]`;
