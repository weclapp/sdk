import {isReferenceObject, isResponseObject} from '@openapi/guards';
import {resolveDeclarationType} from '@openapi/utils/resolveDeclarationType';
import {match} from '@utils/regex';
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
export const resolveResponseType = ({responses}: OpenAPIV3.OperationObject): string => {
    // TODO: Update after responses has been fixed in openapi.json
    const response = responses?.['200 OK'] || responses?.['200'];

    if (isReferenceObject(response)) {
        return extractDefinitionName(response.$ref);
    } else if (isResponseObject(response)) {
        const schema = response?.content?.['application/json']?.schema;

        if (schema) {
            return resolveDeclarationType(schema);
        }
    }

    return 'unknown';
};

/**
 * Takes a response type and guesses what kind of payload is expected.
 * TODO: Improve this by reading out the "result" prop's type!
 * @param response
 */
export const guessResponseEntity = (response: string): string => {
    return match(response, /[A-Z]\w+/, 0) || 'unknown';
};
