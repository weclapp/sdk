import {Target} from '@enums/Target';
import {definitions} from '@generator/definitions';
import {generateAPIDocumentation} from '@generator/docs/api';
import {generateSdk} from '@generator/library';
import {logger} from '@logger';
import {tsImport} from '@ts/modules';
import {env} from '@utils/env';
import {cli} from './cli';
import {writeSourceFile} from '@utils/writeSourceFile';
import {config} from 'dotenv';
import {copy, mkdir, writeFile} from 'fs-extra';
import path from 'path';

// Load .env variables
config();

// Path resolver
const dist = (...paths: string[]) => path.resolve(__dirname, '../', env('SDK_REPOSITORY'), ...paths);
const distDocs = (...paths: string[]) => dist('docs', ...paths);
const srcStatic = (...paths: string[]) => path.resolve(__dirname, '../static', ...paths);
const src = (...paths: string[]) => dist('src', ...paths);

const files = {
    sdks: {
        promises: {
            browser: src('sdk.ts'),
            node: src('sdk.node.ts')
        },
        rxjs: {
            browser: src('sdk.rx.ts'),
            node: src('sdk.rx.node.ts')
        }
    },
    types: {
        models: src('types.models.ts')
    }
};

void (async () => {
    const start = process.hrtime.bigint();
    await mkdir(distDocs(), {recursive: true});
    await mkdir(src(), {recursive: true});
    const doc = await cli();

    if (!doc.components?.schemas) {
        return logger.errorLn('components.schemas missing.');
    }

    // Generate import statement for type-declarations
    logger.infoLn('Generate entity models...');
    const models = definitions(doc);
    await writeSourceFile(files.types.models, models.source);

    // Copy static files
    logger.infoLn('Copy static files...');
    await copy(srcStatic('types'), src());
    await copy(srcStatic('code'), src());

    // Main library and documentation
    logger.infoLn('Generate main SDK\'s...');
    const sdk = generateSdk(doc, Target.BROWSER_PROMISES);
    const modelsImport = tsImport('./types.models', models.stats.exports);
    await writeSourceFile(files.sdks.promises.browser, `${modelsImport}\n${sdk.source}`);

    logger.infoLn('Generate API documentation...');
    await copy(srcStatic('docs', 'utils.md'), distDocs('utils.md'));
    await writeSourceFile(distDocs('api.md'), await generateAPIDocumentation(sdk.stats, srcStatic('docs', 'api.md')));

    // Additional libraries
    logger.infoLn('Generate additional SDK\'s...');
    await writeFile(files.sdks.promises.node, `${modelsImport}\n${generateSdk(doc, Target.NODE_PROMISES).source}`);
    await writeFile(files.sdks.rxjs.browser, `${modelsImport}\n${generateSdk(doc, Target.BROWSER_RX).source}`);
    await writeFile(files.sdks.rxjs.node, `${modelsImport}\n${generateSdk(doc, Target.NODE_RX).source}`);

    // Print job summary
    const duration = Math.floor(Number((process.hrtime.bigint() - start) / 1_000_000n));
    logger.blankLn();
    logger.printSummary();
    logger.infoLn(`SDK generated in ${duration}ms. Bye.`);
    logger.errors && process.exit(1);
})();
