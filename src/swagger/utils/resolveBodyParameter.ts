import {Endpoint} from '@swagger/types';
import {extractDefinitionName} from '@swagger/utils/resolveResponseType';

/**
 * Tries to resolve the body-data type.
 * @param endpoint
 */
export const resolveBodyParameter = ({parameters}: Endpoint): string | null => {

    // TODO: Update after responses has been fixed in swagger.json
    const schema = parameters.find(v => v.schema)?.schema;

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
