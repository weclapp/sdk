import {Target} from '@enums/Target';
import {rm} from 'fs-extra';
import {resolve} from 'path';
import {rollup, RollupOptions} from 'rollup';
import {terser} from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';

const tsconfig = resolve(__dirname, '../tsconfig.lib.json');
const resolveGlobals = (...globals: string[]) => Object.fromEntries(globals.map(v => [v, '*']));

const generateOutput = (config: Record<string, unknown>) => ({
    sourcemap: true,
    banner: `/* weclapp sdk */`,
    ...config
});

export const bundle = async (workingDirectory: string, target: Target) => {
    const dist = (...paths: string[]) => resolve(workingDirectory, 'dist', ...paths);
    const src = (...paths: string[]) => resolve(workingDirectory, 'src', ...paths);

    const generateNodeOutput = () => [
        generateOutput({
            file: dist('index.cjs'),
            format: 'cjs',
            globals: resolveGlobals('node-fetch', 'url')
        }),
        generateOutput({
            file: dist('index.mjs'),
            format: 'es',
            globals: resolveGlobals('node-fetch', 'url')
        })
    ];

    // Remove build dir
    await rm(dist(), {recursive: true, force: true});

    const bundles: Record<Target, () => RollupOptions> = {
        [Target.BROWSER_PROMISES]: () => ({
            input: src('browser.ts'),
            output: [
                generateOutput({
                    file: dist('index.cjs'),
                    name: 'Weclapp',
                    format: 'umd'
                }),
                generateOutput({
                    file: dist('index.mjs'),
                    format: 'es'
                })
            ],
            plugins: [ts({tsconfig}), terser()]
        }),
        [Target.BROWSER_RX]: () => ({
            external: ['rxjs'],
            input: src('browser.rx.ts'),
            plugins: [ts({tsconfig}), terser()],
            output: [
                generateOutput({
                    file: dist('index.cjs'),
                    name: 'Weclapp',
                    format: 'umd',
                    globals: resolveGlobals('rxjs')
                }),
                generateOutput({
                    file: dist('index.mjs'),
                    format: 'es',
                    globals: resolveGlobals('rxjs')
                })
            ]
        }),
        [Target.NODE_PROMISES]: () => ({
            input: src('node.ts'),
            output: generateNodeOutput(),
            external: ['node-fetch', 'url'],
            plugins: [ts({tsconfig})]
        }),
        [Target.NODE_RX]: () => ({
            input: src('node.rx.ts'),
            output: generateNodeOutput(),
            external: ['node-fetch', 'url', 'rxjs'],
            plugins: [ts({tsconfig})]
        })
    };

    const config = bundles[target]();
    const bundle = await rollup(config);

    if (Array.isArray(config.output)) {
        await Promise.all(config.output.map(bundle.write));
    } else if (config.output) {
        await bundle.write(config.output);
    }

    await bundle.close();
};
