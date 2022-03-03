import {isArraySchemaObject, isReferenceObject, isRequestBodyObject, isResponseObject} from '@utils/openapi/guards';
import {parseEndpointPath, WeclappEndpointType} from '@utils/weclapp/parseEndpointPath';
import {OpenAPIV3} from 'openapi-types';

/* eslint-disable @typescript-eslint/no-unsafe-return */
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

    /**
     * Referenced schemas in responses, in some case the response from the root endpoint
     * refers to a schema with a different name
     */
    for (const [path, methods] of Object.entries(doc.paths)) {
        const parsed = parseEndpointPath(path);

        // We only want to add missing types for the root endpoint
        if (parsed?.type !== WeclappEndpointType.ROOT || schemas.has(parsed.entity)) {
            continue;
        }

        for (const method of Object.values(OpenAPIV3.HttpMethods)) {
            const body = (methods as Record<OpenAPIV3.HttpMethods, OpenAPIV3.OperationObject>)[method]?.responses['200'];

            if (isResponseObject(body) && body.content) {
                const responseSchema = Object.values(body.content)[0]?.schema;

                if (isReferenceObject(responseSchema)) {
                    continue;
                }

                const itemsSchema = responseSchema?.properties?.result;
                if (!isArraySchemaObject(itemsSchema)) {
                    continue;
                }

                const {items} = itemsSchema;
                if (isReferenceObject(items)) {
                    const entity = items.$ref.replace(/.*\//, '');
                    schemas.set(parsed.entity, schemas.get(entity));
                }
            }
        }
    }


    return schemas;
};
