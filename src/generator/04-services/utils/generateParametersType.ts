import {generateTypeScriptType} from '@utils/openapi/generateTypeScriptType';
import {isParameterObject} from '@utils/openapi/guards';
import {OpenAPIV3} from 'openapi-types';

export const generateParametersType = ({parameters = []}: OpenAPIV3.OperationObject): string | undefined => {
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

    if (!properties.length) {
        return undefined;
    }

    return generateTypeScriptType({
        type: 'object', required,
        properties: Object.fromEntries(properties)
    });
};
