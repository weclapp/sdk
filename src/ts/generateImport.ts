import {indent} from '@utils/indent';

export const generateImport = (source: string, imports: string[], def?: string): string => {

    // Total string length of import
    const totalStringLength = imports.reduce((pv, cv) => pv + cv.length + 1, 0);
    const defaultImport = def ? `${def}, ` : '';

    // Use multi-lines if too long
    if (totalStringLength > 80) {
        return `import ${defaultImport}{\n${indent(imports.join(',\n'))}\n} from '${source}';`;
    } else {
        return `import ${defaultImport}{${imports.join(', ')}} from '${source}';`;
    }
};
