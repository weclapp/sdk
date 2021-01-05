import {tsBlockComment} from '@ts/comments';
import {SwaggerPath, SwaggerPathType} from '@utils/parseSwaggerPath';
import {paramCase, pascalCase} from 'change-case';
import {Methods} from '../types';
import {EndpointPath} from './index';

const createCountFunction = (path: SwaggerPath): string[] => {
    const entityName = paramCase(path.entity);

    const comment = tsBlockComment(`Counts the amount of ${entityName}s entities which match the given filter.`);
    return [`${comment}
async count(): Promise<number> {
    return Promise.resolve(4);
}`];
};

const createEntityFunction = (path: SwaggerPath, methods: Methods): string[] | null => {
    return null;
};

const createRootFunction = (path: SwaggerPath, methods: Methods): string[] | null => {
    const functions: string[] = [];
    const interfaceName = pascalCase(path.entity);
    const entityName = paramCase(path.entity);

    if (methods.get) {
        const comment = tsBlockComment(`Finds all ${entityName}s entities which match the given filter.`);
        functions.push(`${comment}
async some(filter: Partial<${interfaceName}>): Promise<Customer[]> {
    return Promise.resolve([]);
}`);
    }

    if (methods.post) {
        const comment = tsBlockComment(`Creates a new ${entityName} with the given data.\nReturns the newly created ${entityName}.`);
        functions.push(`${comment}
async create(data: Create${interfaceName}): Promise<Customer> {
    return Promise.reject('Not implemented');
}`);
    }

    return functions;
};

/**
 * Generates a single function for a single endpoint.
 * @param path
 * @param methods
 */
export const generateEndpointFunctions = ({path, methods}: EndpointPath): string[] | null => {
    switch (path.type) {
        case SwaggerPathType.Count:
            return createCountFunction(path);
        case SwaggerPathType.Entity:
            return createEntityFunction(path, methods);
        case SwaggerPathType.Root:
            return createRootFunction(path, methods);
    }

    return null;
};

