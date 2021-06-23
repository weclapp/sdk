import {tsBlockComment} from '@ts/comments';

interface FunctionConfig {
    description: string;
    body: string;
}

/**
 * Generates a function based on the configuration
 * @param conf
 */
export const tsFunction = (conf: FunctionConfig): string => {
    return `${tsBlockComment(conf.description.trim())}\n${conf.body.trim()}`;
};
