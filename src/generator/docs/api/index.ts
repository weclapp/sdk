import {generateEntityTable} from '@generator/docs/api/generateEntityTable';
import {generateTableOfContents} from '@generator/docs/api/generateTableOfContents';
import {inject} from '@generator/docs/utils/inject';
import {LibraryStats} from '@generator/library';
import {pascalCase} from 'change-case';
import {readFile} from 'fs-extra';

/**
 * Generates library documentation based on the given library statistics.
 * @param stats Generated library stats
 * @param template Template file
 */
export const generateAPIDocumentation = async (
    stats: LibraryStats,
    template: string
): Promise<string> => {
    const sections: string[] = [];

    for (const [entity, entityStats] of Object.entries(stats.entities)) {
        const info = `> The following function can be accessed by using \`sdk.${entity}\`:`;
        const header = `### ${pascalCase(entity)}`;
        const table = generateEntityTable(entityStats);

        sections.push(`${header}\n\n${info}\n\n${table}`);
    }

    const templateContent = await readFile(template, 'utf8');
    return inject(templateContent, {
        TABLE_OF_CONTENTS: generateTableOfContents(stats),
        IMPLEMENTATIONS: sections.join('\n\n')
    });
};
