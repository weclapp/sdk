import {resolve} from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@tests': resolve(__dirname, 'tests'),
            '@sdk': resolve(__dirname, 'sdk')
        }
    }
});
