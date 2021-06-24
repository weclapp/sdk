import {logger} from '@logger';
import {tsBlockComment} from '@ts/comments';
import {tsInterfaceProperties} from '@ts/interfaces';
import {pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';
import {resolveDeclarationType} from '../utils/resolveDeclarationType';

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
        .map(([name, type]) => ({name, value: resolveDeclarationType(type), required: !!definition.required?.includes(name)}));

    const source = `
${tsBlockComment(`${intSig} entity.`)}
export interface ${intSig} {
${tsInterfaceProperties(baseEntries, 1)}
}

`.trim();

    return {
        source,
        exports: [intSig]
    };
};
