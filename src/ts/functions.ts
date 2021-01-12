import {tsBlockComment} from '@ts/comments';
import {clearIndent} from '@utils/indent';

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
${clearIndent(conf.body)}`;
};
