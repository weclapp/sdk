import {
  AnyType,
  convertToTypeScriptType,
  createRawType,
  createTupleType
} from '@utils/openapi/convertToTypeScriptType';
import { OpenAPIV3 } from 'openapi-types';

export const generateContentType = (
  body?: OpenAPIV3.RequestBodyObject | OpenAPIV3.ResponseObject,
  fallback: string = 'unknown'
): AnyType => {
  if (!body?.content) return createRawType(fallback);

  const types: AnyType[] = [];
  for (const { schema } of Object.values(body.content)) {
    if (schema) {
      types.push(convertToTypeScriptType(schema));
    }
  }

  return (types.length > 1 ? createTupleType(types) : types[0]) ?? createRawType(fallback);
};
