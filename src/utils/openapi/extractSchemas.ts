import {isReferenceObject, isRequestBodyObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const extractSchemas = (doc: OpenAPIV3.Document): Map<string, OpenAPIV3.SchemaObject> => {
    const schemas = new Map();

    for (const [name, schema] of Object.entries(doc.components?.schemas ?? {})) {
        schemas.set(name, schema);
    }

    for (const [name, body] of Object.entries(doc.components?.requestBodies ?? {})) {
        if (isRequestBodyObject(body)) {
            const schema = Object.values(body.content)[0]?.schema;

            if (!isReferenceObject(schema)) {
                schemas.set(name, schema);
            }
        }
    }

    return schemas;
};
