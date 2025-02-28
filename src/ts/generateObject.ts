import { indent } from "@utils/indent";

export interface ObjectProperty {
  key: string;
  value: string | number | undefined | null | boolean | ObjectProperty[];
}

export const generateObject = (properties: ObjectProperty[]): string => {
  const body = [];

  for (const { key, value } of properties) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      const str = generateObject(value);

      if (str.length > 2) {
        body.push(`${key}: ${str}`);
      }
    } else {
      body.push(`${key}: ${String(value)}`);
    }
  }

  return body.length ? `{\n${indent(body.join(",\n"))}\n}` : `{}`;
};
