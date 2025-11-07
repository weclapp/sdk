import { AnyType, convertToTypeScriptType, createTupleType } from '@utils/openapi/convertToTypeScriptType';
import { isReferenceObject } from '@utils/openapi/guards';
import { OpenAPIV3 } from 'openapi-types';

export const generateBodyType = (
  body?: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject
): AnyType | undefined => {
  if (isReferenceObject(body)) {
    return convertToTypeScriptType(body);
  }

  const types: AnyType[] = [];
  for (const { schema } of Object.values(body?.content ?? {})) {
    if (schema) {
      types.push(convertToTypeScriptType(schema));
    }
  }

  return types.length ? (types.length === 1 ? types[0] : createTupleType(types)) : undefined;
};
