import {logger} from '@logger';

/**
 * Injects values into a markdown template.
 * @param template
 * @param fields
 */
export const inject = (template: string, fields: Record<string, string>): string => {
    return template.replace(/%([A-Z_]+)%/g, (_, key: string) => {
        const value = fields[key];

        if (value === undefined) {
            logger.errorLn(`Couldn't inject value for ${key} into the template.`);
        }

        return value ?? 'Nothing here.';
    });
};
