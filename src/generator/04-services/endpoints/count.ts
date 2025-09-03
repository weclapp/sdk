import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateInterfaceFromObject, generateInterfaceType } from '@ts/generateInterface';
import { generateString } from '@ts/generateString';
import { convertParametersToSchema } from '@utils/openapi/convertParametersToSchema';
import { convertToTypeScriptType, createObjectType } from '@utils/openapi/convertToTypeScriptType';
import { pascalCase } from 'change-case';

export const generateCountEndpoint: ServiceFunctionGenerator = ({
  aliases,
  path,
  target,
  endpoint
}): GeneratedServiceFunction => {
  const functionName = 'count';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;
  const entity = aliases.get(endpoint.service) ?? pascalCase(endpoint.service);

  const parametersTypeName = `${functionTypeName}_Parameters`;
  const parametersType = createObjectType({
    params: convertToTypeScriptType(convertParametersToSchema(path.parameters))
  });
  const parametersTypeSource = generateInterfaceFromObject(parametersTypeName, parametersType, true);

  const filterTypeName = `${functionTypeName}_Filter`;
  const filterTypeSource = generateInterfaceType(filterTypeName, [], [entity]);

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: [
      `query${parametersType.isFullyOptional() ? '?' : ''}: CountQuery<${filterTypeName}>${path.parameters?.length ? ' & ' + parametersTypeName : ''}`,
      'requestOptions?: RequestOptions'
    ],
    returns: `${resolveResponseType(target)}<number>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, query, requestOptions)`,
    params: ['query', 'requestOptions?: RequestOptions']
  });

  return {
    entity,
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource },
    interfaces: [
      ...(path.parameters?.length ? [{ name: parametersTypeName, source: parametersTypeSource }] : []),
      { name: filterTypeName, source: filterTypeSource }
    ]
  };
};
