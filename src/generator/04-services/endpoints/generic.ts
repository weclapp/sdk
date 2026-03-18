import { isNodeTarget, resolveResponseType, Target } from '../../../target';
import { GeneratedServiceFunction, ServiceFunctionGenerator } from '@generator/04-services/types';
import { generateGenericFunctionName } from '@generator/04-services/utils/generateGenericFunctionName';
import { generateRequestBodyType } from '@generator/04-services/utils/generateRequestBodyType';
import { generateResponseType } from '../utils/generateResponseType';
import { insertPathPlaceholder } from '@generator/04-services/utils/insertPathPlaceholder';
import { generateArrowFunction } from '@ts/generateArrowFunction';
import { generateArrowFunctionType } from '@ts/generateArrowFunctionType';
import { generateInterfaceFromObject } from '@ts/generateInterface';
import { generateString } from '@ts/generateString';
import {
  AnyType,
  convertToTypeScriptType,
  createObjectType,
  createRawType
} from '@utils/openapi/convertToTypeScriptType';
import { pascalCase } from 'change-case';
import { resolveParameters } from '../utils/resolveParameters';

const wrapBody = (type: AnyType, target: Target): AnyType => {
  return type.toString() === 'binary' ? createRawType(isNodeTarget(target) ? 'BodyInit' : 'Blob') : type; // node-fetch returns a Blob as well
};

export const generateGenericEndpoint =
  (suffix?: string): ServiceFunctionGenerator =>
  ({ method, endpoint, operationObject, context, options }): GeneratedServiceFunction => {
    const functionName = generateGenericFunctionName(endpoint.path, suffix, method);
    const functionTypeName = `${pascalCase(endpoint.service)}Service_${pascalCase(functionName)}`;

    const entityQuery = `${functionTypeName}_Query`;
    const hasId = endpoint.path.includes('{id}');

    const params = createObjectType({
      params:
        operationObject.parameters &&
        convertToTypeScriptType(resolveParameters(operationObject.parameters, context.parameters)),
      body:
        method === 'get'
          ? undefined
          : wrapBody(generateRequestBodyType(operationObject, context.requestBodies), options.target)
    });

    const responseBody = generateResponseType(operationObject, context.responses);

    const functionTypeSource = generateArrowFunctionType({
      type: functionTypeName,
      params: [
        ...(hasId ? ['id: string'] : []),
        `query${params.isFullyOptional() ? '?' : ''}: ${entityQuery}`,
        'requestOptions?: RequestOptions'
      ],
      returns: `${resolveResponseType(options.target)}<${wrapBody(responseBody, options.target).toString('force')}>`
    });

    const functionSource = generateArrowFunction({
      name: functionName,
      signature: functionTypeName,
      params: hasId ? ['id', 'query', 'requestOptions?: RequestOptions'] : ['query', 'requestOptions?: RequestOptions'],
      returns: `_generic(cfg, ${generateString(method.toUpperCase())}, \`${insertPathPlaceholder(endpoint.path, { id: '${id}' })}\`, query, ${String(responseBody.toString() === 'binary')}, requestOptions)`
    });

    return {
      name: functionName,
      type: { name: functionTypeName, source: functionTypeSource },
      func: { name: functionName, source: functionSource },
      interfaces: [
        {
          name: entityQuery,
          source: generateInterfaceFromObject(entityQuery, params, 'propagate')
        }
      ]
    };
  };
