import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateRequestBodyType } from '@generator/04-services/utils/generateRequestBodyType';
import { generateResponseBodyType } from '@generator/04-services/utils/generateResponseBodyType';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateString } from '@ts/generateString';
import { pascalCase } from 'change-case';

export const generateCreateEndpoint: ServiceFunctionGenerator = ({
  target,
  path,
  endpoint
}): GeneratedServiceFunction => {
  const functionName = 'create';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: [`data: DeepPartial<${generateRequestBodyType(path).toString()}>`, 'requestOptions?: RequestOptions'],
    returns: `${resolveResponseType(target)}<${generateResponseBodyType(path).toString()}>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, data, requestOptions)`,
    params: ['data', 'requestOptions?: RequestOptions']
  });

  return {
    entity: pascalCase(endpoint.service),
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource }
  };
};
