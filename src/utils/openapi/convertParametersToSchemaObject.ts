import { OpenAPIV3 } from 'openapi-types';

export const convertParametersToSchemaObject = (
  parameters: OpenAPIV3.ParameterObject[]
): OpenAPIV3.NonArraySchemaObject => {
  const properties: [string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject][] = [];
  const required: string[] = [];

  for (const param of parameters) {
    if (param.in === 'query' && param.schema) {
      properties.push([param.name, param.schema]);
      if (param.required) required.push(param.name);
    }
  }

  return {
    type: 'object',
    properties: Object.fromEntries(properties),
    required
  };
};
