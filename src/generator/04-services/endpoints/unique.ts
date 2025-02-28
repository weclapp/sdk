import { resolveResponseType } from "@enums/Target";
import {
  GeneratedServiceFunction,
  ServiceFunctionGenerator,
} from "@generator/04-services/types";
import { generateResponseBodyType } from "@generator/04-services/utils/generateResponseBodyType";
import { insertPathPlaceholder } from "@generator/04-services/utils/insertPathPlaceholder";
import { generateArrowFunction } from "@ts/generateArrowFunction";
import { generateArrowFunctionType } from "@ts/generateArrowFunctionType";
import { pascalCase } from "change-case";

const functionName = "unique";

export const generateUniqueEndpoint: ServiceFunctionGenerator = ({
  target,
  path,
  endpoint,
}): GeneratedServiceFunction => {
  const entity = pascalCase(endpoint.entity);
  const interfaceName = `${entity}Service_${pascalCase(functionName)}`;

  const functionSource = generateArrowFunction({
    name: functionName,
    signature: interfaceName,
    params: ["id", "query"],
    returns: `_${functionName}(cfg, \`${insertPathPlaceholder(endpoint.path, { id: "${id}" })}\`, query)`,
  });

  const interfaceSource = generateArrowFunctionType({
    type: interfaceName,
    params: ["id: string", "query?: Q"],
    generics: ["Q extends UniqueQuery"],
    returns: `${resolveResponseType(target)}<${generateResponseBodyType(path).toString()}>`,
  });

  return {
    entity,
    name: functionName,
    type: { name: interfaceName, source: interfaceSource },
    func: { name: functionName, source: functionSource },
  };
};
