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

// Path resolver
const BASE = resolve(__dirname, '../');
const TARGET = env('NODE_ENV') === 'development' ? 'sdk' : '.';
const dist = async (...paths: string[]): Promise<string> => {
    const fullPath = resolve(BASE, TARGET, ...paths);
    await mkdirp(dirname(fullPath)).catch(() => null);
    return fullPath;
};

const distDocs = async (...paths: string[]) => dist('docs', ...paths);
const srcStatic = (...paths: string[]) => resolve(BASE, './static', ...paths);

logger.infoLn(`Mode: ${env('NODE_ENV') ?? 'production'}`);

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
    await copy(srcStatic('types'), await dist('raw'));
    await copy(srcStatic('code'), await dist('raw'));

    // Main library and documentation
    logger.infoLn('Generate main SDK...');
    const sdk = generateSdk(doc, Target.BROWSER_PROMISES);
    const modelsImport = tsImport('./types.models', models.stats.exports);
    await writeSourceFile(await dist('raw/sdk.ts'), `${modelsImport}\n${sdk.source}`);

    logger.infoLn('Generate API documentation...');
    await copy(srcStatic('docs/utils.md'), await distDocs('utils.md'));
    await writeSourceFile(await distDocs('api.md'), await generateAPIDocumentation(sdk.stats, srcStatic('docs', 'api.md')));

    // Additional libraries
    logger.infoLn('Generate additional SDK\'s...');
    await writeFile(await dist('raw/sdk.node.ts'), `${modelsImport}\n${generateSdk(doc, Target.NODE_PROMISES).source}`);
    await writeFile(await dist('raw/sdk.rx.ts'), `${modelsImport}\n${generateSdk(doc, Target.BROWSER_RX).source}`);
    await writeFile(await dist('raw/sdk.rx.node.ts'), `${modelsImport}\n${generateSdk(doc, Target.NODE_RX).source}`);

    logger.infoLn('Bundle SDK (this may take some time)...');
    await buildSDK();

    // Print job summary
    const duration = Math.floor(Number((process.hrtime.bigint() - start) / 1_000_000n));
    logger.blankLn();
    logger.printSummary();
    logger.infoLn(`SDK generated in ${duration}ms. Bye.`);
})().catch((error: unknown) => {
    logger.errorLn(`Fatal error: ${String(error)}`);
}).finally(() => {
    logger.errors && process.exit(1);
});
