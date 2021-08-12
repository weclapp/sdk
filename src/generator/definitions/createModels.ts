import {logger} from '@logger';
import {tsBlockComment} from '@ts/comments';
import {tsInterfaceProperties} from '@ts/interfaces';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';
import {resolveDeclarationType} from '../utils/resolveDeclarationType';
import {EnumDeclaration, tsEnumMemberDefinition, tsEnumName} from '@ts/enums';
import {isNonArraySchemaObject, isReferenceObject} from '@generator/guards';

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

    // Create base interface
    const baseEntries = Object.entries(definition.properties ?? {})
        .map(([name, type]) => ({name, value: resolveDeclarationType(type, name, intSig), required: !!definition.required?.includes(name)}));

    const propertiesWithEnum = Object.entries(definition.properties ?? {}).map(([name,type]) => {
        if(isReferenceObject(type) || !isNonArraySchemaObject(type) || !type?.enum?.length) {
            return undefined;
        }
        return {
            enumName: tsEnumName({entityName: intSig, propertyName: name}),
            enumValues: type.enum as string[]
        };
    }).filter(Boolean) as EnumDeclaration[];


    const source = `
${tsBlockComment(`${intSig} entity.`)}
export interface ${intSig} {
${tsInterfaceProperties(baseEntries, 1)}
}

${propertiesWithEnum.map(v => `
${tsBlockComment(`${v.enumName} enum for ${intSig} entity.`)}
export enum ${v.enumName} {
${tsEnumMemberDefinition(v.enumValues, 1)}
}
`.trim()).join(`\n\n`)}
`.trim();

    return {
        source,
        exports: [intSig]
    };
};
