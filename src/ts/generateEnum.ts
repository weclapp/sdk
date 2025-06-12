import { generateString } from "@ts/generateString";
import { indent } from "@utils/indent";
import { snakeCase } from "change-case";

const transformKey = (s: string) => {
  const asSnakeCase = snakeCase(s);

  return asSnakeCase === s ? asSnakeCase : asSnakeCase.toUpperCase();
};

export const generateEnum = (name: string, values: string[]): string => {
  const props = indent(
    values.map((v) => `${transformKey(v)} = ${generateString(v)}`).join(",\n"),
  );
  return `export enum ${name} {\n${props}\n}`;
};
