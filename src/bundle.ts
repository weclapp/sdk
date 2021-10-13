import {env} from '@utils/env';
import {terser} from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import {rollup, RollupOptions} from 'rollup';
import {resolve} from 'path';

// Short functions to resolve dist / raw files
const TARGET = env('NODE_ENV') === 'development' ? '../sdk' : '../';
const tsconfig = resolve(__dirname, '../tsconfig.lib.json');
const dist = (...paths: string[]) => resolve(__dirname, TARGET, ...paths);
const raw = (...paths: string[]) => dist('raw', ...paths);

// Maps globals to everything
const globals = (...globals: string[]) => Object.fromEntries(globals.map(v => [v, '*']));

// Builds an output config with given defaults
const output = (config: Record<string, unknown>) => ({
    sourcemap: true,
    banner: `/*! Weclapp SDK */`,
    ...config
});

// Generalized output files for node bundles
const nodeOutput = (dir: string) => [
    output({
        file: dist(dir, 'index.js'),
        format: 'cjs',
        globals: globals('node-fetch', 'url')
    }),
    output({
        file: dist(dir, 'index.mjs'),
        format: 'es',
        globals: globals('node-fetch', 'url')
    })
];

const bundles: RollupOptions[] = [

    // Browser bundle (promises)
    {
        input: raw('sdk.ts'),
        output: [
            output({
                file: dist('main', 'index.js'),
                name: 'Weclapp',
                format: 'umd'
            }),
            output({
                file: dist('main', 'index.mjs'),
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
            output({
                file: dist('rx', 'index.js'),
                name: 'Weclapp',
                format: 'umd',
                globals: globals('rxjs')
            }),
            output({
                file: dist('rx', 'index.mjs'),
                format: 'es',
                globals: globals('rxjs')
            })
        ]
    },

    // NodeJS bundle (promises)
    {
        input: raw('sdk.node.ts'),
        output: nodeOutput('node'),
        external: ['node-fetch', 'url'],
        plugins: [ts({tsconfig})]
    },

    // NodeJS bundle (rxjs)
    {
        input: raw('sdk.rx.node.ts'),
        output: nodeOutput('node/rx'),
        external: ['node-fetch', 'url', 'rxjs'],
        plugins: [ts({tsconfig})]
    },

    // Utilities
    {
        input: raw('utils/index.ts'),
        output: nodeOutput('utils'),
        plugins: [ts({tsconfig})]
    }
];

export const buildSDK = async () => {
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
