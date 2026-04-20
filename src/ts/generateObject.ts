import { indent } from '@utils/indent';
import { generateInlineComment } from './generateComment';

export interface ObjectProperty {
  key: string;
  value: string | number | undefined | null | boolean | ObjectProperty[];
  comment?: string;
  optional?: boolean;
}

export const generateObject = (properties: ObjectProperty[]): string => {
  const body = [];

  for (const { key, value, comment, optional } of properties) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      const str = generateObject(value);

      if (str.length > 2) {
        body.push(`${comment ? generateInlineComment(comment) + '\n' : ''}${key}${optional ? '?' : ''}: ${str}`);
      }
    } else {
      body.push(
        `${comment ? generateInlineComment(comment) + '\n' : ''}${key}${optional ? '?' : ''}: ${String(value)}`
      );
    }
  }

  return body.length ? `{\n${indent(body.join(',\n'))}\n}` : `{}`;
};
