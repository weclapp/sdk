import {EndpointPath, StatsEntityFunction} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {resolveRequestType} from '@generator/utils/resolveRequestType';
import {guessResponseEntity, resolveResponseType} from '@generator/utils/resolveResponseType';
import {logger} from '@logger';
import {tsFunction} from '@ts/functions';
import {pascalCase} from 'change-case';

/**
 * Generates functions for the root level of an endpoint e.g. /customer
 * @param path
 * @param methods
 */
export const rootFunction = ({path, methods}: EndpointPath): Functions => {
    const entityName = pascalCase(path.entity);
    const stats: StatsEntityFunction[] = [];
    const sources: string[] = [];

    if (methods.get) {
        const response = resolveResponseType(methods.get);

        if (response) {
            const returnType = guessResponseEntity(response);
            const description = `Finds all ${entityName} entities which match the given filter.`;
            const signature = `some<Query extends ListQuery<${returnType}>>(options?: Query, filter?: Partial<${returnType}>)`;

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<SomeReturn<${returnType}, Query>> {
    return _some<${returnType}, Query>('${path.path}', options, filter);
}
                `
            }));
        } else {
            logger.errorLn(`Couldn't resolve response type for GET ${path.path}`);
        }
    }

    if (methods.post) {
        const bodyType = resolveRequestType(methods.post);

        if (bodyType) {
            const returnType = resolveResponseType(methods.post);
            const description = `Creates a new ${entityName} with the given data.\nReturns the newly created ${entityName}.`;
            const signature = `create(data: Partial<${bodyType}> & Create${bodyType})`;

            stats.push({description, signature});
            sources.push(tsFunction({
                description,
                body: `
async ${signature}: Promise<${returnType}> {
    return _create('${path.path}', data);
}
                `
            }));
        } else {
            logger.warnLn(`Couldn't resolve body type for POST ${path.path}`);
        }
    }

    methods.delete && logger.warnLn(`Didn't generate code for POST ${path.path}`);
    methods.put && logger.warnLn(`Didn't generate code for POST ${path.path}`);

    return {stats, sources};
};
