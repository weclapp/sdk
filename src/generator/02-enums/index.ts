import { generateEnum } from '@ts/generateEnum';
import { loosePascalCase } from '@utils/case';
import { isEnumSchemaObject } from '@utils/openapi/guards';
import { OpenApiContext } from '@utils/weclapp/extractContext';

export interface GeneratedEnum {
  name: string;
  source: string;
  properties: string[];
}

export const generateEnums = (context: OpenApiContext): Map<string, GeneratedEnum> => {
  const enums: Map<string, GeneratedEnum> = new Map();

  for (const [schemaName, schema] of context.schemas) {
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
