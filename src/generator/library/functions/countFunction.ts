import {EndpointPath} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {SwaggerPathType} from '@generator/utils/parseSwaggerPath';
import {guessResponseEntity, resolveResponseType} from '@generator/utils/resolveResponseType';
import {tsFunction} from '@ts/functions';
import {pascalCase} from 'change-case';

/**
 * The swagger file is missing information about what kind of entity corresponds to the given count function.
 * To at least guess what it might be (99% accurate) the response entity of the root GET function will be used.
 * For example, for /customer/count the response entity for GET /customer will be returned.
 * @param endpoints
 */
const guessEntityType = (endpoints: EndpointPath[]): string => {
    const rootRequest = endpoints.find(v => v.path.type === SwaggerPathType.Entity)?.methods?.get;
    return rootRequest ? guessResponseEntity(resolveResponseType(rootRequest)) : 'any';
};

/**
 * Special count-entities endpoint.
 */
export const countFunction = ({path}: EndpointPath, endpoints: EndpointPath[]): Functions => {
    const entityName = pascalCase(path.entity);
    const entityType = guessEntityType(endpoints);
    const description = `Counts the amount of ${entityName}s entities which match the given filter.`;
    const signature = `count(filter?: QueryFilter<${entityType}>)`;

    return {
        stats: [{description, signature}],
        sources: [
            tsFunction({
                description,
                body: `
async ${signature}: Promise<number> {
    return _count<${entityType}>('${path.path}', filter);
}
            `
            })
        ]
    };
};
