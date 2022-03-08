import {isParameterObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

type Parameters = OpenAPIV3.OperationObject['parameters'];

export const convertParametersToSchema = (parameters: Parameters = []): OpenAPIV3.SchemaObject => {
    const properties: [string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject][] = [];
    const required: string[] = [];

    for (const param of parameters) {
        if (isParameterObject(param) && param.in === 'query') {
            if (param.schema) {
                properties.push([param.name, param.schema]);
                param.required && required.push(param.name);
            }
        }
    }

    return {
        type: 'object', required,
        properties: Object.fromEntries(properties)
    };
};
