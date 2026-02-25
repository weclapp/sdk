import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateInterfaceFromObject, generateInterfaceType } from '@ts/generateInterface';
import { generateString } from '@ts/generateString';
import { convertToTypeScriptType, createObjectType } from '@utils/openapi/convertToTypeScriptType';
import { resolveParameters } from '../utils/resolveParameters';
import { pascalCase } from 'change-case';

export const generateCountEndpoint: ServiceFunctionGenerator = ({
  endpoint,
  operationObject,
  entities,
  context,
  options
}): GeneratedServiceFunction => {
  const functionName = 'count';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

  const relatedEntityName = context.aliases.get(endpoint.service);
  const relatedEntity = !!relatedEntityName && entities.get(relatedEntityName);

  if (!relatedEntity) {
    throw Error(`Related entity schema for service ${endpoint.service} not found`);
  }

  const parametersTypeName = `${functionTypeName}_Parameters`;
  const parametersType = createObjectType({
    params: convertToTypeScriptType(resolveParameters(operationObject.parameters, context.parameters))
  });
  const parametersTypeSource = generateInterfaceFromObject(parametersTypeName, parametersType, 'propagate');

  const filterTypeName = `${functionTypeName}_Filter`;
  const filterTypeSource = generateInterfaceType(filterTypeName, [], [`${relatedEntity.filterInterfaceName}`]);

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: [
      `query${parametersType.isFullyOptional() ? '?' : ''}: CountQuery<${filterTypeName}>${operationObject.parameters?.length ? ' & ' + parametersTypeName : ''}`,
      'requestOptions?: RequestOptions'
    ],
    returns: `${resolveResponseType(options.target)}<number>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, query, requestOptions)`,
    params: ['query', 'requestOptions?: RequestOptions']
  });

  return {
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource },
    interfaces: [
      ...(operationObject.parameters?.length ? [{ name: parametersTypeName, source: parametersTypeSource }] : []),
      { name: filterTypeName, source: filterTypeSource }
    ]
  };
};
