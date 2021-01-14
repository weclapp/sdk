import {EndpointPath, StatsEntityFunction} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {injectParams, SwaggerPath} from '@generator/utils/parseSwaggerPath';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {tsFunction} from '@ts/functions';
import {pascalCase} from 'change-case';

const TOP_ID_REGEXP = /{\w+}$/;

/**
 * Takes a parsed swagger path and returns a well-readable function name for this special endpoint.
 * @param path
 */
const buildSpecialFunction = (path: SwaggerPath): string => {
    return path.name ? path.params.length ? `${path.name}ById` : path.name : `__unknown${path.entity}`;
};

/**
 * Generates endpoints for the entity endpoint e.g. /customer/id/:id
 * @param path
 * @param methods
 */
export const entityFunction = ({path, methods}: EndpointPath): Functions => {
    const entityName = pascalCase(path.entity);
    const stats: StatsEntityFunction[] = [];
    const sources: string[] = [];

    if (methods.get) {
        const returnType = resolveResponseType(methods.get);

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const description = `Returns the ${entityName} by it's unique identifier.`;
            const signature = `unique<Query extends EntityQuery<${returnType}>>(id: string, options?: Query)`;

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<UniqueReturn<${returnType}, Query>> {
    return _unique<${returnType}, Query>('/${path.entity}', id, options);
}
                `
            }));
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.get) || 'unknown';
            const description = 'Unknown special endpoint.';
            const signature = `${buildSpecialFunction(path)}(data: ${bodyType})`;

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const returnType = resolveResponseType(methods.post);

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const description = 'Unknown special endpoint.';
            const signature = `create(data: Create${entityName})`;

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else if (path.name) {
            const bodyType = resolveRequestType(methods.post) || 'unknown';
            const description = 'Unknown special endpoint.';
            const signature = `${buildSpecialFunction(path)}(data: ${bodyType})`;

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for POST ${path.path}`);
        }
    }

    if (methods.put) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const returnType = resolveResponseType(methods.put);
            const bodyType = resolveRequestType(methods.put);
            const description = `Updates a ${entityName}`;
            const signature = `update(data: Partial<${bodyType}>)`;

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<${returnType}> {
    return Promise.reject();
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for PUT ${path.path}`);
        }
    }

    if (methods.delete) {

        // Check if it's a top-level, by-id endpoint
        if (TOP_ID_REGEXP.test(path.path)) {
            const description = `Deletes a ${entityName} by the given unique identifier.`;
            const signature = 'delete(id: string)';

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<void> {
    return _delete(\`${injectParams(path.path, {id: '${id}'})}\`);
}
                `
            }));
        } else {
            logger.warnLn(`Didn't generate code for DELETE ${path.path}`);
        }
    }

    return {stats, sources};
};
