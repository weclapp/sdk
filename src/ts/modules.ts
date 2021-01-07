import {indent} from '@utils/indent';

/**
 * Generates an import statement, imports will be wrapped if too long
 * @param source Source file
 * @param imports Things to import
 */
export const tsDeconstructedImport = (source: string, imports: string[]): string => {

    // Total string length of import
    const totalStringLength = imports.reduce((pv, cv) => pv + cv.length + 1, 0);

    // Use multi-lines if too long
    if (totalStringLength > 80) {
        return `import {\n${indent(imports.join(',\n'))}\n} from '${source}';`;
    } else {
        return `import {${imports.join(', ')}} from '${source}';`;
    }
};
