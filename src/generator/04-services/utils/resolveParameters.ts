import { isReferenceObject } from '@utils/openapi/guards';
import { getRefName } from '@utils/openapi/convertToTypeScriptType';
import { OpenAPIV3 } from 'openapi-types';

export const resolveParameters = (
  resolvableParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] = [],
  parameters: Map<string, OpenAPIV3.ParameterObject>
): OpenAPIV3.ParameterObject[] => {
  if (!resolvableParameters) return [];
  return resolvableParameters.flatMap((param) => {
    if (isReferenceObject(param)) {
      const resolved = parameters.get(getRefName(param));
      return resolved ? [resolved] : [];
    }
    return [param];
  });
};
