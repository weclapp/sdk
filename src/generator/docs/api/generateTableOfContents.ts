import {LibraryStats} from '@generator/library';
import {pascalCase} from 'change-case';

/**
 * Returns a table-of-contents for the given library stats.
 * Needs to be in sync with the generated markdown.
 * @param stats
 */
export const generateTableOfContents = (stats: LibraryStats): string => {
    const list: string[] = [];

    for (const entity of Object.keys(stats.entities)) {
        const name = pascalCase(entity);
        list.push(`* [${name}](#${name})`);
    }

    return list.join('\n');
};
