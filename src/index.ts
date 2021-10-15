import {buildSDK} from '@/src/bundle';
import {Target} from '@enums/Target';
import {definitions} from '@generator/definitions';
import {generateAPIDocumentation} from '@generator/docs/api';
import {generateSdk} from '@generator/library';
import {logger} from '@logger';
import {tsImport} from '@ts/modules';
import {env} from '@utils/env';
import {cli} from './cli';
import {writeSourceFile} from '@utils/writeSourceFile';
import {copy, writeFile, mkdirp} from 'fs-extra';
import {resolve, dirname} from 'path';

const workingDirectory = resolve(__dirname, env('NODE_ENV') === 'development' ? '../sdk' : '../');
const dist = async (...paths: string[]): Promise<string> => {
    const fullPath = resolve(workingDirectory, ...paths);
    await mkdirp(dirname(fullPath)).catch(() => null);
    return fullPath;
};

const resolveDocsDist = async (...paths: string[]) => dist('docs', ...paths);
const resolveStaticContent = (...paths: string[]) => resolve(__dirname, '../static', ...paths);

logger.infoLn(`Mode: ${env('NODE_ENV') ?? 'production'}`);
logger.infoLn(`Working directory: ${workingDirectory}`);

void (async () => {
    const start = process.hrtime.bigint();
    const doc = await cli();

    if (!doc.components?.schemas) {
        return logger.errorLn('components.schemas missing.');
    }

    // Generate import statement for type-declarations
    logger.infoLn('Generate entity models...');
    const models = definitions(doc);
    await writeSourceFile(await dist('raw/types.models.ts'), models.source);

    // Copy static files
    logger.infoLn('Copy static files...');
    await copy(resolveStaticContent('types'), await dist('raw'));
    await copy(resolveStaticContent('code'), await dist('raw'));

    // Main library and documentation
    logger.infoLn('Generate main SDK...');
    const sdk = generateSdk(doc, Target.BROWSER_PROMISES);
    const modelsImport = tsImport('./types.models', models.stats.exports);
    await writeSourceFile(await dist('raw/sdk.ts'), `${modelsImport}\n${sdk.source}`);

    logger.infoLn('Generate API documentation...');
    await copy(resolveStaticContent('docs/utils.md'), await resolveDocsDist('utils.md'));
    await writeSourceFile(await resolveDocsDist('api.md'), await generateAPIDocumentation(sdk.stats, resolveStaticContent('docs', 'api.md')));

    // Additional libraries
    logger.infoLn('Generate additional SDK\'s...');
    await writeFile(await dist('raw/sdk.node.ts'), `${modelsImport}\n${generateSdk(doc, Target.NODE_PROMISES).source}`);
    await writeFile(await dist('raw/sdk.rx.ts'), `${modelsImport}\n${generateSdk(doc, Target.BROWSER_RX).source}`);
    await writeFile(await dist('raw/sdk.rx.node.ts'), `${modelsImport}\n${generateSdk(doc, Target.NODE_RX).source}`);

    logger.infoLn('Bundle SDK (this may take some time)...');
    await buildSDK(workingDirectory);

    // Print job summary
    const duration = Math.floor(Number((process.hrtime.bigint() - start) / 1_000_000n));
    logger.blankLn();
    logger.printSummary();
    logger.infoLn(`SDK generated in ${duration}ms. Bye.`);
})().catch((error: unknown) => {
    logger.errorLn(`Fatal error:`);

    /* eslint-disable no-console */
    console.error(error);
}).finally(() => {
    logger.errors && process.exit(1);
});
