import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

/**
 * Returns the "Party" from "#/definitions/party"
 * @param s
 */
export const extractDefinitionName = (s: string): string => {
    return pascalCase(s.replace(/.*\//, ''));
};

/**
 * Resolves the entity / declaration name from an endpoint.
 * @param endpoint
 */
export const resolveResponseType = ({responses}: OpenAPIV3.OperationObject): string | null => {

    // TODO: Update after responses has been fixed in openapi.json
    const schema = responses?.['200 OK'] as (OpenAPIV3.ReferenceObject & OpenAPIV3.ResponseObject);

    // Single object
    if (schema?.$ref) {
        return extractDefinitionName(schema.$ref);
    }

    return null;
};
