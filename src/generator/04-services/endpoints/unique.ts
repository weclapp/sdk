import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateResponseType } from '../utils/generateResponseType';
import { insertPathPlaceholder } from '@generator/04-services/utils/insertPathPlaceholder';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { pascalCase } from 'change-case';

export const generateUniqueEndpoint: ServiceFunctionGenerator = ({
  operationObject,
  endpoint,
  context,
  options
}): GeneratedServiceFunction => {
  const functionName = 'unique';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: ['id: string', 'query?: Q', 'requestOptions?: RequestOptions'],
    generics: ['Q extends UniqueQuery'],
    returns: `${resolveResponseType(options.target)}<${generateResponseType(operationObject, context.responses).toString()}>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    params: ['id', 'query', 'requestOptions?: RequestOptions'],
    returns: `_${functionName}(cfg, \`${insertPathPlaceholder(endpoint.path, { id: '${id}' })}\`, query, requestOptions)`
  });

  return {
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource }
  };
};
