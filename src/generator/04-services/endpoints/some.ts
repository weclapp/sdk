import {resolveResponseType} from '@enums/Target';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateArrowFunction} from '@ts/generateArrowFunction';
import {generateArrowFunctionType} from '@ts/generateArrowFunctionType';
import {generateInterfaceFromObject} from '@ts/generateInterface';
import {generateString} from '@ts/generateString';
import {convertParametersToSchema} from '@utils/openapi/convertParametersToSchema';
import {convertToTypeScriptType, createObjectType} from '@utils/openapi/convertToTypeScriptType';
import {pascalCase} from 'change-case';

const functionName = 'some';

export const generateSomeEndpoint: ServiceFunctionGenerator = ({target, path, endpoint}): GeneratedServiceFunction => {

    // Required interface names
    const entity = pascalCase(endpoint.entity);
    const interfaceName = `${entity}Service_${pascalCase(functionName)}`;
    const entityMappings = `${entity}_Mappings`;
    const entityReferences = `${entity}_References`;
    const entityParameters = `${interfaceName}_Parameters`;
    const parameterSchema = convertParametersToSchema(path.parameters);

    // We already cover page, pageSize and sort
    parameterSchema.properties = Object.fromEntries(
        Object.entries(parameterSchema.properties ?? {})
            .filter(v => !['page', 'pageSize', 'sort'].includes(v[0]))
    );

    const parameters = createObjectType({
        params: convertToTypeScriptType(parameterSchema)
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        generics: [`S extends QuerySelect<${entity}>`, `I extends QuerySelect<${entityMappings}>`],
        params: [`query${parameters.isFullyOptional() ? '?' : ''}: SomeQuery<${entity}, I, S> & ${entityParameters}`],
        returns: `${resolveResponseType(target)}<SomeQueryReturn<${entity}, ${entityReferences}, ${entityMappings}, I, S>>`
    });

    const functionSource = generateArrowFunction({
        name: functionName,
        signature: interfaceName,
        returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, query)`,
        params: ['query']
    });

    return {
        name: functionName,
        type: {name: interfaceName, source: interfaceSource},
        func: {name: functionName, source: functionSource},
        interfaces: [
            {
                name: entityParameters,
                source: generateInterfaceFromObject(entityParameters, parameters, true)
            }
        ]
    };
};
