import {TSFile} from '@ts/TSFile';
import {TSInterface} from '@ts/TSInterface';
import {TSValueType} from '@ts/TSValueType';
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
 * Creates a single model for a swagger definition
 * @param name
 * @param properties
 */
function createModel(name: string, properties: DefinitionProperty | DefinitionReference): TSInterface {
    const model = new TSInterface(pascalCase(name), true);

    // Loop through property declarations
    for (const [name, definition] of Object.entries(properties)) {
        model.addProperty(name, getType(definition));
    }

    return model;
}


/**
 * Generates a ts-file which will contain interfaces for the given definitions
 * @param definitions
 */
export const definitions = (definitions: Record<string, Definition>): TSFile => {
    const file = new TSFile();

    // Loop through declarations
    for (const [declaration, {properties}] of Object.entries(definitions)) {
        file.addStatement(createModel(declaration, properties));
    }

    return file;
};
