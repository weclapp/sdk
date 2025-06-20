import { resolveResponseType } from '@enums/Target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateRequestBodyType } from '@generator/04-services/utils/generateRequestBodyType';
import { generateResponseBodyType } from '@generator/04-services/utils/generateResponseBodyType';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateString } from '@ts/generateString';
import { pascalCase } from 'change-case';

const functionName = 'create';

export const generateCreateEndpoint: ServiceFunctionGenerator = ({
  target,
  path,
  endpoint
}): GeneratedServiceFunction => {
  const entity = pascalCase(endpoint.entity);
  const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: interfaceName,
    returns: `_${functionName}(cfg, ${generateString(endpoint.path)}, data)`,
    params: ['data']
  });

  const interfaceSource = generateArrowFunctionType({
    type: interfaceName,
    params: [`data: DeepPartial<${generateRequestBodyType(path).toString()}>`],
    returns: `${resolveResponseType(target)}<${generateResponseBodyType(path).toString()}>`
  });

  return {
    entity,
    name: functionName,
    type: { name: interfaceName, source: interfaceSource },
    func: { name: functionName, source: functionSource }
  };
};
