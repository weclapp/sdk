import {rm} from 'fs-extra';
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

    const dirs = {
        main: resolve(workingDirectory, 'main'),
        rx: resolve(workingDirectory, 'rx'),
        node: resolve(workingDirectory, 'node')
    };

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

    // Remove build dirs
    await Promise.all(Object.values(dirs).map(v => rm(v, {recursive: true, force: true})));

    const bundles: RollupOptions[] = [

        // Browser bundle (promises)
        {
            input: raw('sdk.ts'),
            output: [
                generateOutput({
                    file: resolve(dirs.main, 'index.js'),
                    name: 'Weclapp',
                    format: 'umd'
                }),
                generateOutput({
                    file: resolve(dirs.main, 'index.mjs'),
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
                    file: resolve(dirs.rx, 'index.js'),
                    name: 'Weclapp',
                    format: 'umd',
                    globals: resolveGlobals('rxjs')
                }),
                generateOutput({
                    file: resolve(dirs.rx, 'index.mjs'),
                    format: 'es',
                    globals: resolveGlobals('rxjs')
                })
            ]
        },

        // NodeJS bundle (promises)
        {
            input: raw('sdk.node.ts'),
            output: generateNodeOutput(dirs.node),
            external: ['node-fetch', 'url'],
            plugins: [ts({tsconfig})]
        },

        // NodeJS bundle (rxjs)
        {
            input: raw('sdk.rx.node.ts'),
            output: generateNodeOutput(resolve(dirs.node, 'rx')),
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
