import { generateBodyType } from '@generator/04-services/utils/generateBodyType';
import { AnyType, createRawType } from '@utils/openapi/convertToTypeScriptType';
import { OpenAPIV3 } from 'openapi-types';

export const generateRequestBodyType = (
  { requestBody }: OpenAPIV3.OperationObject,
  isDeepPartialType?: boolean
): AnyType => {
  return generateBodyType(requestBody, isDeepPartialType) ?? createRawType('unknown');
};
