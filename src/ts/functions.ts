import {tsBlockComment} from '@ts/comments';
import stripIndent from 'strip-indent';

interface FunctionConfig {
    description: string;
    body: string;
}

/**
 * Generates a function based on the configuration
 * @param conf
 */
export const tsFunction = (conf: FunctionConfig): string => {
    return `${tsBlockComment(conf.description.trim())}
${stripIndent(conf.body.replace(/^\s*\n|\n\s*$/gm, ''))}`;
};
