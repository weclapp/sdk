import {isNodeTarget, isRXTarget, Target} from '@enums/Target';
import {generateBlockComment} from '@ts/generateComment';
import {generateImport} from '@ts/generateImport';
import {generateStatements} from '@ts/generateStatements';
import filter from './static/filter.ts.txt';
import root from './static/root.ts.txt';

const resolveImports = (target: Target): string => {
    const imports: string[] = [];

    if (isNodeTarget(target)) {
        imports.push(generateImport('node-fetch', ['Response'], 'fetch'));
    }

    if (isRXTarget(target)) {
        imports.push(generateImport('rxjs', ['defer', 'Observable']));
    }

    return imports.join('\n');
};

export const generateBase = (target: Target): string => {
    return generateStatements(
        generateBlockComment('Imports'),
        resolveImports(target),
        generateBlockComment('Static utils and types'),
        filter,
        root
    );
};
