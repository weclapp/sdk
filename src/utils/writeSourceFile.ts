import {writeFile} from 'fs-extra';

/**
 * Writes a source-file to disk.
 * Will trim the content and add a line-break at the end.
 * @param path
 * @param content
 */
export const writeSourceFile = (path: string, content: string): Promise<void> => {
    return writeFile(path, content.trim() + '\n');
};
