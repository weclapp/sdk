import {Definition} from '../types';
import {createModels} from './createModels';

/**
 * Generates a ts-file which will contain interfaces for the given definitions
 * @param definitions
 */
export const definitions = (definitions: Record<string, Definition>): string => {
    let file = '';

    // Loop through declarations and convert to ts interfaces
    for (const [name, definition] of Object.entries(definitions)) {
        file += `${createModels(name, definition)}\n`;
    }

    return file;
};
