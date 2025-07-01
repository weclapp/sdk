import { generateEnum } from '@ts/generateEnum';
import { loosePascalCase } from '@utils/case';
import { isEnumSchemaObject } from '@utils/openapi/guards';
import { OpenAPIV3 } from 'openapi-types';

export interface GeneratedEnum {
  name: string;
  source: string;
  properties: string[];
}

export const generateEnums = (schemas: Map<string, OpenAPIV3.SchemaObject>): Map<string, GeneratedEnum> => {
  const enums: Map<string, GeneratedEnum> = new Map();

  for (const [schemaName, schema] of schemas) {
    if (isEnumSchemaObject(schema)) {
      const enumName = loosePascalCase(schemaName);

      if (!enums.has(enumName)) {
        enums.set(enumName, {
          name: enumName,
          properties: schema.enum,
          source: generateEnum(enumName, schema.enum)
        });
      }
    }
  }

  return enums;
};
