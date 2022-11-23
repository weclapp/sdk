import {isArraySchemaObject, isReferenceObject, isResponseObject} from '@utils/openapi/guards';
import {parseEndpointPath} from '@utils/weclapp/parseEndpointPath';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

interface ExtractSchemasResult {
    schemas: Map<string, OpenAPIV3.SchemaObject>;
    aliases: Map<string, string>;
}

const parseReferencedEntity = (obj: OpenAPIV3.ReferenceObject): string =>
    pascalCase(obj.$ref.replace(/.*\//, ''));

/* eslint-disable @typescript-eslint/no-unsafe-return */
export const extractSchemas = (doc: OpenAPIV3.Document): ExtractSchemasResult => {
    const schemas: Map<string, OpenAPIV3.SchemaObject> = new Map();
    const aliases: Map<string, string> = new Map();

    for (const [name, schema] of Object.entries(doc.components?.schemas ?? {})) {
        if (!isReferenceObject(schema)) {
            schemas.set(name, schema);
        }
    }

    /**
     * Referenced schemas in responses, in some case the response from the root endpoint
     * refers to a schema with a different name
     */
    for (const [path, methods] of Object.entries(doc.paths)) {
        const parsed = parseEndpointPath(path);

        if (!parsed || schemas.has(parsed.entity)) {
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
                if (isReferenceObject(itemsSchema)) {
                    aliases.set(parsed.entity, parseReferencedEntity(itemsSchema));
                    continue;
                }

                if (isArraySchemaObject(itemsSchema)) {
                    const {items} = itemsSchema;

                    if (isReferenceObject(items)) {
                        aliases.set(parsed.entity, parseReferencedEntity(items));
                    }
                }
            }
        }
    }

    return {schemas, aliases};
};
