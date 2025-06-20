import { concat } from '@utils/concat';
import { generateString } from '@ts/generateString';
import { generateType } from '@ts/generateType';

export const generateTuple = (name: string, values: string[]): string =>
  generateType(name, concat(values.map(generateString), ' | '));
