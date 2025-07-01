import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { insertPathPlaceholder } from '@generator/04-services/utils/insertPathPlaceholder';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { pascalCase } from 'change-case';

export const generateRemoveEndpoint: ServiceFunctionGenerator = ({ target, endpoint }): GeneratedServiceFunction => {
  const functionName = 'remove';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: ['id: string', 'options?: RemoveQuery'],
    returns: `${resolveResponseType(target)}<void>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, \`${insertPathPlaceholder(endpoint.path, { id: '${id}' })}\`, options, requestOptions)`,
    params: ['id', 'options?: RemoveQuery', 'requestOptions?: RequestOptions']
  });

  return {
    entity: pascalCase(endpoint.service),
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource }
  };
};
