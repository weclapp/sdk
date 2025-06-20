import { generateBodyType } from '@generator/04-services/utils/generateBodyType';
import { AnyType, createRawType } from '@utils/openapi/convertToTypeScriptType';
import { OpenAPIV3 } from 'openapi-types';

export const resolveBodyType = ({
  responses
}: OpenAPIV3.OperationObject): OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject =>
  Object.entries(responses).filter((v) => v[0].startsWith('2'))[0]?.[1];

export const generateResponseBodyType = (object: OpenAPIV3.OperationObject): AnyType =>
  generateBodyType(resolveBodyType(object)) ?? createRawType('void');
