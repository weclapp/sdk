import { isReferenceObject } from '../openapi/guards';
import { parseEndpointsPaths, WeclappEndpoint } from './parseEndpointPath';
import { OpenAPIV3 } from 'openapi-types';
import { extractRelatedEntityName } from './extractRelatedEntityName';

export interface ParsedEndpoint {
  endpoint: WeclappEndpoint;
  path: OpenAPIV3.PathItemObject;
}

export interface OpenApiContext {
  endpoints: Map<string, ParsedEndpoint[]>;
  schemas: Map<string, OpenAPIV3.SchemaObject>;
  responses: Map<string, OpenAPIV3.ResponseObject>;
  parameters: Map<string, OpenAPIV3.ParameterObject>;
  requestBodies: Map<string, OpenAPIV3.RequestBodyObject>;
  aliases: Map<string, string>;
}

const extractServiceAliases = (
  endpoints: Map<string, ParsedEndpoint[]>,
  responses: Map<string, OpenAPIV3.ResponseObject>
) => {
  const aliases: Map<string, string> = new Map();
  for (const [serviceName, serviceEndpoints] of endpoints) {
    const relatedEntityName = extractRelatedEntityName(serviceEndpoints, responses);
    if (relatedEntityName) aliases.set(serviceName, relatedEntityName);
  }
  return aliases;
};

export const extractContext = (doc: OpenAPIV3.Document): OpenApiContext => {
  const endpoints = parseEndpointsPaths(doc.paths);

  const schemas: Map<string, OpenAPIV3.SchemaObject> = new Map();
  for (const [name, schema] of Object.entries(doc.components?.schemas ?? {})) {
    if (!isReferenceObject(schema)) {
      schemas.set(name, schema);
    }
  }

  const responses: Map<string, OpenAPIV3.ResponseObject> = new Map();
  for (const [name, response] of Object.entries(doc.components?.responses ?? {})) {
    if (!isReferenceObject(response)) {
      responses.set(name, response);
    }
  }

  const parameters: Map<string, OpenAPIV3.ParameterObject> = new Map();
  for (const [name, parameter] of Object.entries(doc.components?.parameters ?? {})) {
    if (!isReferenceObject(parameter)) {
      parameters.set(name, parameter);
    }
  }

  const requestBodies: Map<string, OpenAPIV3.RequestBodyObject> = new Map();
  for (const [name, requestBody] of Object.entries(doc.components?.requestBodies ?? {})) {
    if (!isReferenceObject(requestBody)) {
      requestBodies.set(name, requestBody);
    }
  }

  const aliases = extractServiceAliases(endpoints, responses);

  return { endpoints, schemas, responses, parameters, requestBodies, aliases };
};
