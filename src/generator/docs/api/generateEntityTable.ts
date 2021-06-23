import {escapeInline, escapeMarkdown} from '@generator/docs/utils/escape';
import {StatsEntity} from '@generator/library';

const TABLE_HEADER = `
| Function signature | Description |
| ------------------ | ----------- |
`.trim();

/**
 * Generates a markdown table with implementation details about the given library entity.
 * @param stats
 */
export const generateEntityTable = (stats: StatsEntity): string => {
    const rows: string[] = [];

    for (const func of stats.functions) {
        rows.push(`| \`${func.signature}\` | ${escapeMarkdown(escapeInline(func.description))} |`);
    }

    return `${TABLE_HEADER}\n${rows.join('\n')}`;
};
