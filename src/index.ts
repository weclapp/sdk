import {bundle} from '@/src/bundle';
import {generate} from '@generator/generate';
import {logger} from '@logger';
import {currentDirname} from '@utils/currentDirname';
import {hash} from '@utils/hash';
import {cp, mkdir, rm, stat, writeFile} from 'fs/promises';
import {dirname, resolve} from 'path';
import pkg from '../package.json';
import {cli} from './cli';
import prettyMs from 'pretty-ms';

const workingDirectory = resolve(currentDirname(), './sdk');
const folders = ['docs', 'main', 'node', 'raw', 'rx', 'utils'];

void (async () => {
    const start = process.hrtime.bigint();
    const {content: doc, cache: useCache, options} = await cli();

    // Resolve cache dir and key
    const cacheKey = hash([pkg.version, JSON.stringify(doc), JSON.stringify(options)]).slice(-8);
    const cacheDir = resolve(currentDirname(), '.tmp', cacheKey);

    const dist = (...paths: string[]) => resolve(workingDirectory, ...paths);
    const tmp = async (...paths: string[]): Promise<string> => {
        const fullPath = resolve(cacheDir, ...paths);
        await mkdir(dirname(fullPath), {recursive: true}).catch(() => null);
        return fullPath;
    };

    if (useCache) {
        logger.infoLn(`Cache ID: ${cacheKey}`);
    }

    if (useCache && await stat(cacheDir).catch(() => false)) {
        logger.successLn(`Cache match! (${cacheDir})`);
    } else {

        // Store swagger.json file
        await writeFile(await tmp('openapi.json'), JSON.stringify(doc, null, 2));
        logger.infoLn(`Generate sdk (target: ${options.target})`);

        // Generate SDKs
        const sdk = generate(doc, options);
        await writeFile(await tmp('src', `${options.target}.ts`), sdk.trim() + '\n');

        // Bundle
        logger.infoLn('Bundle... (this may take some time)');
        await bundle(cacheDir, options.target);

        // Remove old SDK
        await Promise.all(folders.map(async dir => rm(dist(dir), {recursive: true}).catch(() => 0)));
    }

    // Copy bundled SDK
    await cp(cacheDir, workingDirectory, {recursive: true});

    // Print job summary
    const duration = (process.hrtime.bigint() - start) / 1_000_000n;
    logger.successLn(`SDK built in ${prettyMs(Number(duration))}`);
    logger.printSummary();
})().catch((error: unknown) => {
    logger.errorLn(`Fatal error:`);

    /* eslint-disable no-console */
    console.error(error);
}).finally(() => {
    logger.errors && process.exit(1);
});
