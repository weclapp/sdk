import {Target} from '@enums/Target';
import {EndpointPath} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {FunctionList} from '@generator/library/utils/FunctionList';
import {SwaggerPathType} from '@generator/utils/parseSwaggerPath';
import {guessResponseEntity, resolveResponseType} from '@generator/utils/resolveResponseType';
import {pluralize} from '@utils/pluralize';
import {camelCase, pascalCase} from 'change-case';

/**
 * The swagger file is missing information about what kind of entity corresponds to the given count function.
 * To at least guess what it might be (99% accurate) the response entity of the root GET function will be used.
 * For example, for /customer/count the response entity for GET /customer will be returned.
 * @param endpoints
 */
const guessEntityType = (endpoints: EndpointPath[]): string => {
    const rootRequest = endpoints.find(v => v.path.type === SwaggerPathType.Root)?.methods?.get;
    return rootRequest ? guessResponseEntity(resolveResponseType(rootRequest)) : 'any';
};

/**
 * Special count-entities endpoint.
 */
export const countFunction = ({path}: EndpointPath, endpoints: EndpointPath[], target: Target): Functions => {
    const entityName = pascalCase(path.entity);
    const entityType = guessEntityType(endpoints);
    const pluralEntityName = pluralize(entityName);
    const relatedEntities = `Weclapp__RelatedEntities_${entityType}`;

    return new FunctionList()
        .add(target, {
            code: {
                description: `Counts the amount of ${pluralEntityName} entities which match the given filter.`,
                parameters: [['filter', `The filter for the ${pluralEntityName} we want to count.`]],
                example: `const total${pluralEntityName} = await sdk.${camelCase(entityName)}.count();`,
                signature: `count(filter?: Filterable<${entityType}, ${relatedEntities}>)`,
                returnValue: `_count<${entityType}, ${relatedEntities}>('${path.path}', filter)`,
                returnType: 'number'
            }
        }).getAll();
};
