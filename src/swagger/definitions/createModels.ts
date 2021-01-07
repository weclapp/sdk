import {tsBlockComment} from '@ts/comments';
import {tsInterface, tsInterfaceProperties} from '@ts/interfaces';
import {errorLn, warnLn} from '@utils/log';
import {pascalCase} from 'change-case';
import {Definition} from '../types';
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
export const createModels = (name: string, definition: Definition): GeneratedModels | null => {
    const interfaceName = pascalCase(name);

    // Validate definition set
    if (definition.type !== 'object') {
        errorLn(`Invalid definitions for ${name}`);
        return null;
    }

    // Create base interface
    const baseEntries = Object.entries(definition.properties)
        .map(([name, type]) => {
            return [name, resolveDeclarationType(type)] as [string, string];
        });

    const createEntries: [string, string][] = [];
    for (const key of (definition.required ?? [])) {
        const entry = baseEntries.find(v => v[0] === key);

        if (entry) {
            createEntries.push([key, entry[1]]);
        } else {
            warnLn(`Cannot resolve "${name}" property in "${interfaceName}"`);
        }
    }

    const createInterfaceName = `Create${interfaceName}`;
    const source = `
${tsBlockComment(`${interfaceName} entity.`)}
${tsInterface(interfaceName, tsInterfaceProperties(baseEntries))}

${tsBlockComment(`Required properties to create a new ${interfaceName}.`)}
${tsInterface(createInterfaceName, tsInterfaceProperties(createEntries))}
`.trim();

    return {
        source,
        exports: [interfaceName, createInterfaceName]
    };
};
