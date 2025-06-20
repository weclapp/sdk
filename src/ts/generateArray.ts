import { generateString } from '@ts/generateString';
import { concat } from '@utils/concat';

export const generateArray = (values: unknown[]): string => {
  return `[${concat(values.map((v) => generateString(String(v))))}]`;
};
