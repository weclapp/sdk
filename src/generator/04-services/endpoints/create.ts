import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateRequestBodyType } from '@generator/04-services/utils/generateRequestBodyType';
import { generateResponseType } from '../utils/generateResponseType';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateString } from '@ts/generateString';
import { pascalCase } from 'change-case';

export const generateCreateEndpoint: ServiceFunctionGenerator = ({
  endpoint,
  operationObject,
  context,
  options
}): GeneratedServiceFunction => {
  const endpointName = pascalCase(endpoint.service);
  const functionName = 'create';
  const functionTypeName = `${endpointName}Service_${pascalCase(functionName)}`;

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: [
      `data: ${generateRequestBodyType(operationObject, context.requestBodies).toString()}_Create`,
      'requestOptions?: RequestOptions'
    ],
    returns: `${resolveResponseType(options.target)}<${generateResponseType(operationObject, context.responses).toString()}>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, data, requestOptions)`,
    params: ['data', 'requestOptions?: RequestOptions']
  });

  return {
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource }
  };
};
