import { indent } from '@utils/indent';

export const generateStatements = (...statements: string[]): string =>
  statements
    .map((v) => v.trim())
    .filter((v) => v.length)
    .join('\n\n');

export const generateBlockStatements = (...statements: string[]): string =>
  `{\n${indent(generateStatements(...statements))}\n}`;
