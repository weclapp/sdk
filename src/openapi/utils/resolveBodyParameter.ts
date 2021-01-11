import {isParameterObject} from '@openapi/guards';
import {OpenAPIV3} from 'openapi-types';
import {extractDefinitionName} from '../utils/resolveResponseType';

/**
 * Tries to resolve the body-data type.
 * @param endpoint
 */
export const resolveBodyParameter = ({parameters}: OpenAPIV3.PathItemObject): string | null => {

    // TODO: Update after responses has been fixed in openapi.json
    const targetParameter = parameters?.find(v => isParameterObject(v) && v.schema) as OpenAPIV3.ParameterObject | undefined;
    const schema = targetParameter?.schema as (OpenAPIV3.SchemaObject & OpenAPIV3.ReferenceObject);

    // Single object
    if (schema?.$ref) {
        return extractDefinitionName(schema.$ref);
    }

    // Possible array
    if (schema?.properties?.result) {
        const {type, items: {$ref}} = schema.properties.result as (OpenAPIV3.ReferenceObject & OpenAPIV3.ArraySchemaObject & OpenAPIV3.NonArraySchemaObject);
        const name = extractDefinitionName($ref);
        return type === 'array' ? `${name}[]` : name;
    }

    return null;
};
