import {isReferenceObject, isResponseObject} from '@openapi/guards';
import {resolveDeclarationType} from '@openapi/utils/resolveDeclarationType';
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
    const response = responses?.['200 OK'];

    if (isReferenceObject(response)) {
        return extractDefinitionName(response.$ref);
    } else if (isResponseObject(response)) {
        const schema = response?.content?.['application/json']?.schema;

        if (schema) {
            return resolveDeclarationType(schema);
        }
    }

    return null;
};
