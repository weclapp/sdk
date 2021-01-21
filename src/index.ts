/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {Target} from '@enums/Target';
import {definitions} from '@generator/definitions';
import {generateAPIDocumentation} from '@generator/docs/api';
import {generateSdk} from '@generator/library';
import {logger} from '@logger';
import {tsImport} from '@ts/modules';
import {env} from '@utils/env';
import {writeSourceFile} from '@utils/writeSourceFile';
import fse, {writeFile} from 'fs-extra';
import {mkdir, readFile} from 'fs/promises';
import {OpenAPIV3} from 'openapi-types';
import path from 'path';

// Path resolver
const dist = (...paths: string[]) => path.resolve(__dirname, '../', env('SDK_REPOSITORY'), ...paths);
const docs = (...paths: string[]) => path.resolve(dist(), 'docs', ...paths);
const statc = (...paths: string[]) => path.resolve(__dirname, '../static', ...paths);
const src = (...paths: string[]) => path.resolve(dist(), 'src', ...paths);

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
    docs: {
        api: dist('API.md')
    },
    types: {
        models: src('types.models.ts')
    }
};

void (async () => {
    const start = process.hrtime.bigint();
    await mkdir(docs(), {recursive: true});
    await mkdir(src(), {recursive: true});

    // Read openapi file and create model definitions
    logger.infoLn('Read openapi file...');
    const openapi: OpenAPIV3.Document = JSON.parse(await readFile(env('SRC_OPENAPI'), 'utf-8'));

    logger.infoLn('Generate entity models...');
    if (!openapi.components?.schemas) {
        return logger.errorLn('components.schemas missing.');
    }

    // Generate import statement for type-declarations
    const models = definitions(openapi.components.schemas);
    const modelsImport = tsImport('./types.models', models.stats.exports);

    // Type files
    logger.infoLn('Generate type files...');
    await writeSourceFile(files.types.models, models.source);

    // Static files
    logger.infoLn('Copy static files...');
    await fse.copy(statc('types'), src());
    await fse.copy(statc('code'), src());

    // Main library and documentation
    logger.infoLn('Generate main SDK\'s...');
    const sdk = generateSdk(openapi, Target.BROWSER_PROMISES);
    await writeSourceFile(files.sdks.promises.browser, `${modelsImport}\n\n${sdk.source}`);

    logger.infoLn('Generate API documentation...');
    await writeSourceFile(docs('api.md'), await generateAPIDocumentation(sdk.stats, statc('docs', 'api.md')));

    // Additional libraries
    logger.infoLn('Generate additional SDK\'s...');
    await writeFile(files.sdks.promises.node, `${modelsImport}\n\n${generateSdk(openapi, Target.NODE_PROMISES).source}`);
    await writeFile(files.sdks.rxjs.browser, `${modelsImport}\n\n${generateSdk(openapi, Target.BROWSER_RX).source}`);
    await writeFile(files.sdks.rxjs.node, `${modelsImport}\n\n${generateSdk(openapi, Target.NODE_RX).source}`);

    // Print job summary
    const duration = Math.floor(Number((process.hrtime.bigint() - start) / 1_000_000n));
    logger.blankLn();
    logger.printSummary();
    logger.blankLn(`SDK generated in ${duration}ms. Bye.`);
    // TODO: Exit with non-zero code on errors?
})();
