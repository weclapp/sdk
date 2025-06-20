import { resolveResponseType } from '@enums/Target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateInterfaceFromObject } from '@ts/generateInterface';
import { generateString } from '@ts/generateString';
import { convertParametersToSchema } from '@utils/openapi/convertParametersToSchema';
import { convertToTypeScriptType, createObjectType } from '@utils/openapi/convertToTypeScriptType';
import { pascalCase } from 'change-case';

const functionName = 'count';

export const generateCountEndpoint: ServiceFunctionGenerator = ({
  aliases,
  path,
  target,
  endpoint
}): GeneratedServiceFunction => {
  const service = pascalCase(endpoint.entity);
  const entity = aliases.get(endpoint.entity) ?? service;
  const entityFilter = `${entity}_Filter`;
  const interfaceName = `${service}Service_${pascalCase(functionName)}`;
  const entityParameters = `${interfaceName}_Parameters`;
  const parameterSchema = convertParametersToSchema(path.parameters);

  const parameters = createObjectType({
    params: convertToTypeScriptType(parameterSchema)
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: interfaceName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, query)`,
    params: ['query']
  });

  const interfaceSource = generateArrowFunctionType({
    type: interfaceName,
    params: [`query${parameters.isFullyOptional() ? '?' : ''}: CountQuery<${entityFilter}> & ${entityParameters}`],
    returns: `${resolveResponseType(target)}<number>`
  });

  return {
    entity,
    name: functionName,
    type: { name: interfaceName, source: interfaceSource },
    func: { name: functionName, source: functionSource },
    interfaces: [
      {
        name: entityParameters,
        source: generateInterfaceFromObject(entityParameters, parameters, true)
      }
    ]
  };
};
