import { generateContentType } from './generateContentType';
import { AnyType, getRefName } from '@utils/openapi/convertToTypeScriptType';
import { OpenAPIV3 } from 'openapi-types';
import { isReferenceObject } from '@utils/openapi/guards';

export const generateRequestBodyType = (
  { requestBody }: OpenAPIV3.OperationObject,
  requestBodies: Map<string, OpenAPIV3.RequestBodyObject>
): AnyType => {
  const requestBodyObject =
    requestBody && isReferenceObject(requestBody) ? requestBodies.get(getRefName(requestBody)) : requestBody;
  return generateContentType(requestBodyObject);
};
