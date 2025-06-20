import { resolveResponseType } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateRequestBodyType } from '@generator/04-services/utils/generateRequestBodyType';
import { generateResponseBodyType } from '@generator/04-services/utils/generateResponseBodyType';
import { insertPathPlaceholder } from '@generator/04-services/utils/insertPathPlaceholder';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { pascalCase } from 'change-case';

export const generateUpdateEndpoint: ServiceFunctionGenerator = ({
  target,
  path,
  endpoint
}): GeneratedServiceFunction => {
  const functionName = 'update';
  const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

  const functionTypeSource = generateArrowFunctionType({
    type: functionTypeName,
    params: ['id: string', `data: DeepPartial<${generateRequestBodyType(path).toString()}>`, 'options?: UpdateQuery'],
    returns: `${resolveResponseType(target)}<${generateResponseBodyType(path).toString()}>`
  });

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: functionTypeName,
    returns: `_${functionName}(cfg, \`${insertPathPlaceholder(endpoint.path, { id: '${id}' })}\`, data, options)`,
    params: ['id', 'data', 'options']
  });

  return {
    entity: pascalCase(endpoint.service),
    name: functionName,
    type: { name: functionTypeName, source: functionTypeSource },
    func: { name: functionName, source: functionSource }
  };
};
