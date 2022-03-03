import {generateInterface, InterfaceProperty} from '@ts/generateInterface';
import {generateTypeScriptType} from '@utils/openapi/generateTypeScriptType';
import {isParameterObject} from '@utils/openapi/guards';
import {typeFallback} from '@utils/openapi/typeFallback';
import {OpenAPIV3} from 'openapi-types';

export const generateParametersInterface = (
    name: string,
    params: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] = []
): string => {
    const properties: InterfaceProperty[] = [];

    for (const param of params) {
        if (isParameterObject(param) && param.in === 'query') {
            const {required, schema, name} = param;
            const type = typeFallback(schema ? generateTypeScriptType(schema) : undefined);
            properties.push({name, required, type});
        }
    }

    return generateInterface(name, properties);
};
