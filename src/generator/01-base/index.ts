import {isNodeTarget, isRXTarget, Target} from '@enums/Target';
import {generateImport} from '@ts/generateImport';
import {generateStatements} from '@ts/generateStatements';
import filter from './static/filter.ts.txt';
import root from './static/root.ts.txt';

const resolveImports = (target: Target): string => {
    const imports: string[] = [];

    if (isNodeTarget(target)) {
        imports.push(generateImport({src: 'node-fetch', default: 'fetch'}));
    }

    if (isRXTarget(target)) {
        imports.push(generateImport({src: 'rxjs', imports: ['defer', 'Observable']}));
    }

    return imports.join('\n');
};

const resolveMappings = (target: Target) =>
    `const wrapResponse = ${isRXTarget(target) ? 'defer' : '(v: (...args: any[]) => any) => v()'};`;

export const generateBase = (target: Target): string => {
    return generateStatements(
        resolveImports(target),
        resolveMappings(target),
        filter,
        root
    );
};
