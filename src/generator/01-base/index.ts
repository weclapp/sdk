import {isRXTarget, resolveBinaryType, Target} from '@enums/Target';
import {generateImport} from '@ts/generateImport';
import {generateStatements} from '@ts/generateStatements';
import root from './static/root.ts.txt';
import types from './static/types.ts.txt';


const resolveImports = (target: Target): string => {
    const imports: string[] = [];

    if (isRXTarget(target)) {
        imports.push(generateImport({src: 'rxjs', imports: ['defer', 'Observable']}));
    }

    return imports.join('\n');
};

const resolveMappings = (target: Target) =>
    `const wrapResponse = ${isRXTarget(target) ? 'defer' : '(v: (...args: any[]) => any) => v()'};`;

const resolveBinaryClass = (target: Target) =>
    `const resolveBinaryObject = () => ${resolveBinaryType(target)};`;

export const generateBase = (target: Target): string => {
    return generateStatements(
        resolveImports(target),
        resolveMappings(target),
        resolveBinaryClass(target),
        types,
        root
    );
};
