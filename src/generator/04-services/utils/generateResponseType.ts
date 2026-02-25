import { generateContentType } from './generateContentType';
import { AnyType, getRefName } from '@utils/openapi/convertToTypeScriptType';
import { OpenAPIV3 } from 'openapi-types';
import { isReferenceObject } from '@utils/openapi/guards';
import { resolveResponsesObject } from './resolveResponsesObject';

export const generateResponseType = (
  operationObject: OpenAPIV3.OperationObject,
  responses: Map<string, OpenAPIV3.ResponseObject>
): AnyType => {
  const response = resolveResponsesObject(operationObject.responses);
  const responseObject = response && isReferenceObject(response) ? responses.get(getRefName(response)) : response;
  return generateContentType(responseObject, 'void');
};
