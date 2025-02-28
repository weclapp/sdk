import { GeneratedEnum } from "@generator/02-enums";
import { loosePascalCase } from "@utils/case";
import { getRefName } from "@utils/openapi/convertToTypeScriptType";
import {
  isArraySchemaObject,
  isReferenceObject,
  WeclappMetaProperties,
} from "@utils/openapi/guards";
import { OpenAPIV3 } from "openapi-types";

export interface PropertyMetaData {
  type?: string;
  format?: string;
  maxLength?: number;
  pattern?: string;
  service?: string;
  entity?: string;
  enum?: string;
}

const setEntityEnumProperty = (
  enums: Map<string, GeneratedEnum>,
  prop: OpenAPIV3.ReferenceObject,
  meta: PropertyMetaData,
) => {
  const referenceName = getRefName(prop);
  const enumName = loosePascalCase(referenceName);

  if (enums.has(enumName)) {
    meta.enum = enumName;
  } else {
    meta.entity = referenceName;
  }
};

export const extractPropertyMetaData = (
  enums: Map<string, GeneratedEnum>,
  meta: WeclappMetaProperties,
  prop: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
): PropertyMetaData => {
  const result: PropertyMetaData = {
    service: meta.service,
    entity: meta.entity,
  };

  if (isReferenceObject(prop)) {
    setEntityEnumProperty(enums, prop, result);
    result.type = "reference";
    return result;
  }

  result.type = prop.type;
  result.format = prop.format;
  result.maxLength = prop.maxLength;
  result.pattern = prop.pattern;

  if (isArraySchemaObject(prop)) {
    if (isReferenceObject(prop.items)) {
      setEntityEnumProperty(enums, prop.items, result);
      result.format = "reference";
    } else {
      result.format = "string";
    }
  }

  return result;
};
