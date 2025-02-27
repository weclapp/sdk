import {bundle} from '@/src/bundle';
import {generate} from '@generator/generate';
import {logger} from '@logger';
import {currentDirname} from '@utils/currentDirname';
import {hash} from '@utils/hash';
import {cp, mkdir, rm, stat, writeFile} from 'fs/promises';
import {dirname, resolve} from 'path';
import {cli} from './cli';
import prettyMs from 'pretty-ms';
import pkg from '../package.json' with {type: 'json'};

const workingDir = resolve(currentDirname(), './sdk');
const cacheDir = resolve(currentDirname(), './.cache');

void (async () => {
    const start = process.hrtime.bigint();

    const {content: doc, cache: useCache, options} = await cli();

    const workingDirPath = async (...paths: string[]): Promise<string> => {
        const fullPath = resolve(workingDir, ...paths);
        await mkdir(dirname(fullPath), {recursive: true});
        return fullPath;
    };

    // Resolve cache dir and key
    const cacheKey = hash([pkg.version, JSON.stringify(doc), JSON.stringify(options)]).slice(-8);
    const cachedSdkDir = resolve(cacheDir, cacheKey);

    // Remove old SDK
    await rm(workingDir, {recursive: true, force: true});

    if (useCache) {
        logger.infoLn(`Cache ID: ${cacheKey}`);
    }

    if (useCache && await stat(cachedSdkDir).catch(() => false)) {
        // Copy cached SDK to working dir
        logger.successLn(`Cache match! (${cachedSdkDir})`);
        await cp(cachedSdkDir, workingDir, {recursive: true});
    } else {
        // Write swagger.json file
        await writeFile(await workingDirPath('openapi.json'), JSON.stringify(doc, null, 2));
        logger.infoLn(`Generate sdk (target: ${options.target})`);

        // Generate and write SDK
        const sdk = generate(doc, options);
        await writeFile(await workingDirPath('src', 'index.ts'), sdk.trim() + '\n');

        // Bundle and write SDK
        logger.infoLn('Bundle... (this may take some time)');
        await bundle(workingDir, options.target);

        if (useCache) {
            // Copy SDK to cache
            logger.successLn(`Caching SDK: (${cachedSdkDir})`);
            await mkdir(cachedSdkDir, {recursive: true});
            await cp(workingDir, cachedSdkDir, {recursive: true});
        }
    }


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
