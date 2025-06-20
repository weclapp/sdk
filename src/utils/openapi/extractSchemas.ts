import { isArraySchemaObject, isReferenceObject, isResponseObject } from '@utils/openapi/guards';
import { parseEndpointPath, WeclappEndpointType } from '@utils/weclapp/parseEndpointPath';
import { pascalCase } from 'change-case';
import { OpenAPIV3 } from 'openapi-types';

const parseReferencedEntityType = (obj: OpenAPIV3.ReferenceObject): string => pascalCase(obj.$ref.replace(/.*\//, ''));

const extractServiceAliases = (doc: OpenAPIV3.Document, schemas: Map<string, OpenAPIV3.SchemaObject>) => {
  const aliases: Map<string, string> = new Map();
  for (const [path, methods] of Object.entries(doc.paths)) {
    const parsed = parseEndpointPath(path);

    if (!parsed || !methods || parsed.type !== WeclappEndpointType.ROOT || schemas.has(parsed.service)) {
      continue;
    }

    const body = methods[OpenAPIV3.HttpMethods.GET]?.responses['200'];
    if (isResponseObject(body) && body.content?.['application/json']) {
      const responseSchema = body.content['application/json'].schema;
      if (!responseSchema || isReferenceObject(responseSchema)) {
        continue;
      }

      const resultSchema = responseSchema.properties?.result;
      if (!resultSchema) {
        continue;
      }

      if (isReferenceObject(resultSchema)) {
        aliases.set(parsed.service, parseReferencedEntityType(resultSchema));
        continue;
      }

      if (isArraySchemaObject(resultSchema)) {
        const resultItemSchema = resultSchema.items;
        if (isReferenceObject(resultItemSchema)) {
          aliases.set(parsed.service, parseReferencedEntityType(resultItemSchema));
        }
      }
    }
  }
  return aliases;
};

export const extractSchemas = (doc: OpenAPIV3.Document) => {
  const schemas: Map<string, OpenAPIV3.SchemaObject> = new Map();
  for (const [name, schema] of Object.entries(doc.components?.schemas ?? {})) {
    if (!isReferenceObject(schema)) {
      schemas.set(name, schema);
    }
  }

  const aliases = extractServiceAliases(doc, schemas);

  return { schemas, aliases };
};
