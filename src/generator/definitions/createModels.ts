import {logger} from '@logger';
import {tsBlockComment} from '@ts/comments';
import {tsInterfaceProperties} from '@ts/interfaces';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';
import {resolveDeclarationType} from '../utils/resolveDeclarationType';
import {EnumDeclaration, tsEnumMemberDefinition, tsEnumName} from '@ts/enums';
import {isNonArraySchemaObject, isReferenceObject, isRelatedEntitySchema, RelatedEntitySchema} from '@generator/guards';
import {relatedEntitiesName, RelatedEntityProperty, relatedEntityPropertyDefinition} from '@ts/relatedEntities';
import NonArraySchemaObject = OpenAPIV3.NonArraySchemaObject;

export interface GeneratedModels {
    source: string;
    exports: string[];
}

/**
 * Creates base and create models
 * @param name
 * @param definition
 */
export const createModels = (name: string, definition: OpenAPIV3.SchemaObject): GeneratedModels | null => {
    const intSig = pascalCase(name);

    // Validate definition set
    if (definition.type !== 'object') {
        logger.errorLn(`Invalid definitions for ${name}`);
        return null;
    }

    const properties = Object.entries(definition.properties ?? {});

    // Create base interface
    const baseEntries = properties.map(([name, type]) => (
      {name, value: resolveDeclarationType(type, name, intSig), required: !!definition.required?.includes(name)}
    ));

    const propertiesWithEnum = properties
      .filter(([, type]) => !isReferenceObject(type) && isNonArraySchemaObject(type) && type?.enum?.length)
      .map(([name, type]) => ({
          enumName: tsEnumName({entityName: intSig, propertyName: name}),
          enumValues: (type as NonArraySchemaObject).enum as string[]
      })) as EnumDeclaration[];

    const propertiesWithRelatedEntities = properties
      .filter(([, type]) => isRelatedEntitySchema(type))
      .map(([name, type]) => ({
          property: name,
          relatedEntity: (type as RelatedEntitySchema)['x-relatedEntityName']
      })) as RelatedEntityProperty[];

    const source = `
${tsBlockComment(`${intSig} entity.`)}
export interface ${intSig} {
${tsInterfaceProperties(baseEntries, 1)}
}

${tsBlockComment(`RelatedEntitiesMap for ${intSig} entity.`)}
export type ${relatedEntitiesName(intSig)} = ${propertiesWithRelatedEntities.length ? `{
${relatedEntityPropertyDefinition(propertiesWithRelatedEntities, 1)}
}` : 'undefined;'}

${propertiesWithEnum.map(v => `
${tsBlockComment(`${v.enumName} enum for ${intSig} entity.`)}
export enum ${v.enumName} {
${tsEnumMemberDefinition(v.enumValues, 1)}
}
`.trim()).join(`\n\n`)}
`.trim();

    return {
        source,
        exports: [intSig, relatedEntitiesName(intSig)]
    };
};
