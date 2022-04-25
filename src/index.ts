import {bundle} from '@/src/bundle';
import {generate} from '@generator/generate';
import {logger} from '@logger';
import {hash} from '@utils/hash';
import {writeSourceFile} from '@utils/writeSourceFile';
import {copy, mkdirp, rm, stat, writeFile} from 'fs-extra';
import {dirname, resolve} from 'path';
import pkg from '../package.json';
import {cli} from './cli';

const workingDirectory = resolve(__dirname, '../sdk');
const folders = ['docs', 'main', 'node', 'raw', 'rx', 'utils'];

logger.infoLn(`Working directory: ${workingDirectory}`);

void (async () => {
    const start = process.hrtime.bigint();
    const {content: doc, cache: useCache, targets} = await cli();

    // Resolve cache dir and key
    const cacheKey = hash([pkg.version, JSON.stringify(doc), ...targets]).slice(-8);
    const cacheDir = resolve(__dirname, '../', '.tmp', cacheKey);

    const dist = (...paths: string[]) => resolve(workingDirectory, ...paths);
    const tmp = async (...paths: string[]): Promise<string> => {
        const fullPath = resolve(cacheDir, ...paths);
        await mkdirp(dirname(fullPath)).catch(() => null);
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

        // Generate SDKs
        for (const target of targets) {
            logger.infoLn(`Generate SDK (target: ${target})`);
            await writeSourceFile(await tmp(`raw/${target}.ts`), generate(doc, target));
        }

        // Bundle
        logger.infoLn('Bundle (this may take some time)...');
        await bundle(cacheDir, targets);

        // Print job summary
        const duration = Math.floor(Number((process.hrtime.bigint() - start) / 1_000_000n));
        logger.blankLn();
        logger.successLn(`SDK generated in ${duration}ms.`);

        // Remove old SDK
        await Promise.all(folders.map(async dir => rm(dist(dir), {recursive: true}).catch(() => 0)));
    }

    await copy(cacheDir, workingDirectory);

    logger.successLn(`Cleanup done, Bye.`);
    logger.printSummary();
})().catch((error: unknown) => {
    logger.errorLn(`Fatal error:`);

    /* eslint-disable no-console */
    console.error(error);
}).finally(() => {
    logger.errors && process.exit(1);
});
