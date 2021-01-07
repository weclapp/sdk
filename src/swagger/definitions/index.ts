import {Definition} from '../types';
import {createModels} from './createModels';

export interface GeneratedDefinitions {
    source: string;
    exports: string[];
}

/**
 * Generates a ts-file which will contain interfaces for the given definitions
 * @param definitions
 */
export const definitions = (definitions: Record<string, Definition>): GeneratedDefinitions => {
    const exports: string[] = [];
    let source = '';

    // Loop through declarations and convert to ts interfaces
    for (const [name, definition] of Object.entries(definitions)) {
        const models = createModels(name, definition);

        if (models) {
            source += `${models.source}\n`;
            exports.push(...models.exports);
        }
    }

    return {source, exports};
};
