import {resolve} from 'path';
import {terser} from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import {rollup, RollupOptions} from 'rollup';

const tsconfig = resolve(__dirname, '../tsconfig.lib.json');
const resolveGlobals = (...globals: string[]) => Object.fromEntries(globals.map(v => [v, '*']));

const generateOutput = (config: Record<string, unknown>) => ({
    sourcemap: true,
    banner: `/*! Weclapp SDK */`,
    ...config
});

export const buildSDK = async (workingDirectory: string) => {
    const raw = (...paths: string[]) => resolve(workingDirectory, 'raw', ...paths);

    const generateNodeOutput = (dir: string) => [
        generateOutput({
            file: resolve(workingDirectory, dir, 'index.js'),
            format: 'cjs',
            globals: resolveGlobals('node-fetch', 'url')
        }),
        generateOutput({
            file: resolve(workingDirectory, dir, 'index.mjs'),
            format: 'es',
            globals: resolveGlobals('node-fetch', 'url')
        })
    ];

    const bundles: RollupOptions[] = [

        // Browser bundle (promises)
        {
            input: raw('sdk.ts'),
            output: [
                generateOutput({
                    file: resolve(workingDirectory, 'main', 'index.js'),
                    name: 'Weclapp',
                    format: 'umd'
                }),
                generateOutput({
                    file: resolve(workingDirectory, 'main', 'index.mjs'),
                    format: 'es'
                })
            ],
            plugins: [ts({tsconfig}), terser()]
        },

        // Browser bundle (rxjs)
        {
            input: raw('sdk.rx.ts'),
            external: ['rxjs'],
            plugins: [ts({tsconfig}), terser()],
            output: [
                generateOutput({
                    file: resolve(workingDirectory, 'rx', 'index.js'),
                    name: 'Weclapp',
                    format: 'umd',
                    globals: resolveGlobals('rxjs')
                }),
                generateOutput({
                    file: resolve(workingDirectory, 'rx', 'index.mjs'),
                    format: 'es',
                    globals: resolveGlobals('rxjs')
                })
            ]
        },

        // NodeJS bundle (promises)
        {
            input: raw('sdk.node.ts'),
            output: generateNodeOutput('node'),
            external: ['node-fetch', 'url'],
            plugins: [ts({tsconfig})]
        },

        // NodeJS bundle (rxjs)
        {
            input: raw('sdk.rx.node.ts'),
            output: generateNodeOutput('node/rx'),
            external: ['node-fetch', 'url', 'rxjs'],
            plugins: [ts({tsconfig})]
        },

        // Utilities
        {
            input: raw('utils/index.ts'),
            output: generateNodeOutput('utils'),
            plugins: [ts({tsconfig})]
        }
    ];

    return Promise.all(
        bundles.map(async config => {
            const bundle = await rollup(config);

            if (Array.isArray(config.output)) {
                await Promise.all(config.output.map(bundle.write));
            } else if (config.output) {
                await bundle.write(config.output);
            }

            await bundle.close();
        })
    );
};
