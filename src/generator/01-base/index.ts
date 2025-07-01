import { isRXTarget, resolveBinaryType, Target } from '../../target';
import { generateImport } from '@ts/generateImport';
import { generateStatements } from '@ts/generateStatements';
import globalConfig from './static/globalConfig.ts.txt';
import multiRequest from './static/multiRequest.ts.txt';
import queriesWithFilter from './static/queriesWithFilter.ts.txt';
import queriesWithQueryLanguage from './static/queriesWithQueryLanguage.ts.txt';
import root from './static/root.ts.txt';
import unique from './static/unique.ts.txt';
import types from './static/types.ts.txt';
import utils from './static/utils.ts.txt';
import { GeneratorOptions } from '../generate';

const resolveImports = (target: Target): string => {
  const imports: string[] = [];

  if (isRXTarget(target)) {
    imports.push(generateImport({ src: 'rxjs', imports: ['defer', 'Observable'] }));
  }

  return imports.join('\n');
};

const resolveMappings = (target: Target) =>
  `const wrapResponse = ${isRXTarget(target) ? 'defer' : '(v: (...args: any[]) => any) => v()'};`;

const resolveBinaryClass = (target: Target) => `const resolveBinaryObject = () => ${resolveBinaryType(target)};`;

export const generateBase = (target: Target, apiVersion: string, options: GeneratorOptions): string => {
  return generateStatements(
    resolveImports(target),
    `const apiVersion = ${apiVersion}`,
    resolveMappings(target),
    resolveBinaryClass(target),
    globalConfig,
    types,
    utils,
    root,
    options.useQueryLanguage ? queriesWithQueryLanguage : queriesWithFilter,
    options.generateUnique ? unique : '',
    multiRequest
  );
};
