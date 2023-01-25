import {fileURLToPath} from 'url';

export const currentDirname = () => {
    // Go one level up as the CLI is inside a folder
    return fileURLToPath(new URL('..', import.meta.url));
};
