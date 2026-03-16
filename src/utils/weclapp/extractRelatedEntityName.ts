import { OpenAPIV3 } from 'openapi-types';
import { WeclappEndpointType } from './parseEndpointPath';
import { isArraySchemaObject, isReferenceObject } from '../openapi/guards';
import { getRefName } from '../openapi/convertToTypeScriptType';
import { ParsedEndpoint } from './extractContext';

export function extractRelatedEntityName(
  serviceEndpoints: ParsedEndpoint[],
  responses: Map<string, OpenAPIV3.ResponseObject>
) {
  const rootEndpoint = serviceEndpoints.find((v) => v.endpoint.type === WeclappEndpointType.ROOT);
  if (!rootEndpoint) return;

  const response = rootEndpoint?.path.get?.responses['200'];
  if (!response) return;

  let responseObject: OpenAPIV3.ResponseObject | undefined;
  if (isReferenceObject(response)) {
    const refName = getRefName(response);
    responseObject = responses.get(refName);
  } else {
    responseObject = response;
  }

  const responseSchema = responseObject?.content?.['application/json'].schema;
  if (responseSchema) {
    if (isReferenceObject(responseSchema)) {
      return;
    }

    const resultSchema = responseSchema.properties?.result;
    if (!resultSchema) {
      return;
    }

    if (isReferenceObject(resultSchema)) {
      return getRefName(resultSchema);
    } else if (isArraySchemaObject(resultSchema)) {
      const resultItemSchema = resultSchema.items;
      if (isReferenceObject(resultItemSchema)) {
        return getRefName(resultItemSchema);
      }
    }
  }
}
