import { indent } from '@utils/indent';
import { generateInlineComment } from './generateComment';

export interface ObjectProperty {
  key: string;
  value: string | number | undefined | null | boolean | ObjectProperty[];
  comment?: string;
}

export const generateObject = (properties: ObjectProperty[]): string => {
  const body = [];

  for (const { key, value, comment } of properties) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      const str = generateObject(value);

      if (str.length > 2) {
        body.push(`${comment ? generateInlineComment(comment) + '\n' : ''}${key}: ${str}`);
      }
    } else {
      body.push(`${comment ? generateInlineComment(comment) + '\n' : ''}${key}: ${String(value)}`);
    }
  }

  return body.length ? `{\n${indent(body.join(',\n'))}\n}` : `{}`;
};
