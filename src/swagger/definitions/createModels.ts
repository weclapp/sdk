import {tsBlockComment} from '@ts/comments';
import {tsInterface, tsInterfaceProperties} from '@ts/interfaces';
import {errorLn, warnLn} from '@utils/log';
import {pascalCase} from 'change-case';
import {Definition} from '../types';
import {getDeclarationType} from './getDeclarationType';

/**
 * Creates base and create models
 * @param name
 * @param definition
 */
export const createModels = (name: string, definition: Definition): string => {
    const interfaceName = pascalCase(name);

    // Validate definition set
    if (definition.type !== 'object') {
        errorLn(`Invalid definitions for ${name}`);
        return '';
    }

    // Create base interface
    const baseEntries = Object.entries(definition.properties)
        .map(([name, type]) => {
            return [name, getDeclarationType(type)] as [string, string];
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

    return `
${tsBlockComment(`${interfaceName} entity.`)}
${tsInterface(interfaceName, tsInterfaceProperties(baseEntries))}

${tsBlockComment(`Required properties to create a new ${interfaceName}.`)}
${tsInterface(`Create${interfaceName}`, tsInterfaceProperties(createEntries))}
`.trim();
};
