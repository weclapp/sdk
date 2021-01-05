import {TSBlock} from '@ts/TSBlock';
import {TSBlockComment} from '@ts/TSBlockComment';
import {TSFile} from '@ts/TSFile';
import {TSInterface} from '@ts/TSInterface';
import {TSValueType} from '@ts/TSValueType';
import {Statement} from '@ts/types';
import {errorLn, warnLn} from '@utils/log';
import {pascalCase} from 'change-case';
import {Definition, DefinitionProperty, DefinitionReference} from './types';

/**
 * Resolves the type of a swagger definition, assumes that all references are defined somewhere!
 * @param obj
 */
function getType(obj: DefinitionProperty | DefinitionReference): TSValueType {
    const {type} = obj;

    switch (type) {
        case 'string':
        case 'boolean':
            return new TSValueType(type);
        case 'integer':
            return TSValueType.number();
        case 'array': {
            const {$ref, type} = (obj as DefinitionReference).items;

            if (typeof $ref === 'string') {
                return new TSValueType(pascalCase($ref.replace(/.*\//, '')));
            } else if (typeof type === 'string') {
                return getType(type);
            } else {
                return TSValueType.unknown();
            }
        }
        default:
            return TSValueType.unknown();
    }
}

/**
 * Creates base and create models
 * @param name
 * @param definition
 */
function createModels(name: string, definition: Definition): Statement[] {
    const interfaceName = pascalCase(name);

    // Validate definition set
    if (definition.type !== 'object') {
        errorLn(`Invalid definitions for ${name}`);
        return [];
    }

    // Create base interface
    const base = new TSInterface(interfaceName, true);
    const baseComment = new TSBlockComment(`${interfaceName} entity.`);

    for (const [name, type] of Object.entries(definition.properties)) {
        base.set(name, getType(type));
    }

    // Create interface for new instances
    const create = new TSInterface(`Create${interfaceName}`, true);
    for (const name of definition.required ?? []) {
        const type = base.get(name);
        if (type) {
            create.set(name, type);
        } else {
            warnLn(`Cannot resolve "${name}" property in "${interfaceName}"`);
        }
    }

    const note = `\nThere are no required properties to create a new instance of ${interfaceName}.`;
    const createComment = new TSBlockComment(
        `Required properties to create a new ${interfaceName}. ${create.size ? '' : note}`
    );

    return [
        new TSBlock(baseComment, base),
        new TSBlock(createComment, create)
    ];
}


/**
 * Generates a ts-file which will contain interfaces for the given definitions
 * @param definitions
 */
export const definitions = (definitions: Record<string, Definition>): TSFile => {
    const file = new TSFile();

    // Loop through declarations and convert to ts interfaces
    for (const [name, definition] of Object.entries(definitions)) {
        file.addStatement(...createModels(name, definition));
    }

    return file;
};
