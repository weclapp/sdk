import {Endpoint} from '@swagger/types';
import {pascalCase} from 'change-case';

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
export const resolveResponseType = ({responses}: Endpoint): string | null => {

    // TODO: Update after responses has been fixed in swagger.json
    const schema = responses?.['200 OK'].schema;

    // Single object
    if (schema?.$ref) {
        return extractDefinitionName(schema.$ref);
    }

    // Possible array
    if (schema?.properties) {
        const {type, items: {$ref}} = schema.properties.result;
        const name = extractDefinitionName($ref);
        return type === 'array' ? `${name}[]` : name;
    }

    return null;
};
