export const generateType = (name: string, value: string): string => {
    return `export type ${name} = ${value};`;
};
