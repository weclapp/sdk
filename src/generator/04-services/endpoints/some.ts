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
const excludedParameters = [
    'page', 'pageSize', 'sort',
    'serializeNulls', 'properties', 'includeReferencedEntities'
];

export const generateSomeEndpoint: ServiceFunctionGenerator = ({aliases, target, path, endpoint}): GeneratedServiceFunction => {

    // Required interface names
    const service = pascalCase(endpoint.entity);
    const entity = aliases.get(endpoint.entity) ?? service;
    const interfaceName = `${service}Service_${pascalCase(functionName)}`;
    const entityFilter = `${entity}_Filter`;
    const entityMappings = `${entity}_Mappings`;
    const entityReferences = `${entity}_References`;
    const entityParameters = `${service}_Parameters`;
    const parameterSchema = convertParametersToSchema(path.parameters);

    // We already cover page, pageSize and sort
    parameterSchema.properties = Object.fromEntries(
        Object.entries(parameterSchema.properties ?? {})
            .filter(v => !excludedParameters.includes(v[0]))
    );

    const parameters = createObjectType({
        params: convertToTypeScriptType(parameterSchema)
    });

    const interfaceSource = generateArrowFunctionType({
        type: interfaceName,
        generics: [
            `S extends (QuerySelect<${entity}> | undefined) = undefined`,
            `I extends (QuerySelect<${entityMappings}> | undefined) = undefined`
        ],
        params: [`query${parameters.isFullyOptional() ? '?' : ''}: SomeQuery<${entity}, ${entityFilter}, I, S> & ${entityParameters}`],
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
