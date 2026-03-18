import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateRequestBodyType } from '@generator/04-services/utils/generateRequestBodyType';
import { generateResponseType } from '../utils/generateResponseType';
import { insertPathPlaceholder } from '@generator/04-services/utils/insertPathPlaceholder';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { pascalCase } from 'change-case';

export const generateUpdateEndpoint: ServiceFunctionGenerator = ({
  endpoint,
  operationObject,
  context,
  options
}): GeneratedServiceFunction => {
  const functionName = 'update';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: [
      'id: string',
      `data: DeepPartial<${generateRequestBodyType(operationObject, context.requestBodies).toString()}>`,
      'options?: UpdateQuery',
      'requestOptions?: RequestOptions'
    ],
    returns: `${resolveResponseType(options.target)}<${generateResponseType(operationObject, context.responses).toString()}>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, \`${insertPathPlaceholder(endpoint.path, { id: '${id}' })}\`, data, options, requestOptions)`,
    params: ['id', 'data', 'options', 'requestOptions?: RequestOptions']
  });

  return {
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource }
  };
};
