export const generateString = (str: string): string => `'${str}'`;

export const generateStrings = (str: string[]): string[] => str.map(generateString);
