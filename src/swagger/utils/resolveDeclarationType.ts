import {pascalCase} from 'change-case';
import {DefinitionProperty, DefinitionReference} from '../types';

/**
 * Resolves the type of a swagger definition, assumes that all references are defined somewhere!
 * @param obj
 */
export function resolveDeclarationType(obj: DefinitionProperty | DefinitionReference): string {
    const {type} = obj;

    switch (type) {
        case 'string':
        case 'boolean':
            return type;
        case 'integer':
            return 'number';
        case 'array': {
            const {$ref, type} = (obj as DefinitionReference).items;

            if (typeof $ref === 'string') {
                return pascalCase($ref.replace(/.*\//, ''));
            } else if (typeof type === 'string') {
                return resolveDeclarationType(type);
            } else {
                return 'unknown';
            }
        }
        default:
            return 'unknown';
    }
}

