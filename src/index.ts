/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {Target} from '@enums/Target';
import {definitions} from '@generator/definitions';
import {generateSdk} from '@generator/library';
import {logger} from '@logger';
import {tsImport} from '@ts/modules';
import {env} from '@utils/env';
import {writeSourceFile} from '@utils/writeSourceFile';
import fse from 'fs-extra';
import {mkdir, readFile} from 'fs/promises';
import {OpenAPIV3} from 'openapi-types';
import path from 'path';

const types = path.resolve(__dirname, '../', env('SDK_TYPES'));
const dist = path.resolve(__dirname, '../', env('SDK_RAW_DIR'));

const files = {
    sdks: {
        main: path.join(dist, 'sdk.ts'),
        node: path.join(dist, 'sdk.node.ts')
    },
    types: {
        models: path.join(dist, 'types.models.ts')
    }
};

void (async () => {
    const start = process.hrtime.bigint();
    await mkdir(dist, {recursive: true});

    // Read openapi file and create model definitions
    logger.infoLn('Read openapi file...');
    const openapi: OpenAPIV3.Document = JSON.parse(await readFile(env('SRC_OPENAPI'), 'utf-8'));

    logger.infoLn('Generate entity models...');
    if (!openapi.components?.schemas) {
        return logger.errorLn('components.schemas missing.');
    }

    // Generate import statement for type-declarations
    const models = definitions(openapi.components.schemas);
    const modelsImport = tsImport('./types.models', models.exports);

    // Type files
    logger.infoLn('Generate type files...');
    await writeSourceFile(files.types.models, models.source);

    // Static type files
    logger.infoLn('Copy static types...');
    await fse.copy(path.join(types), dist);

    // Libraries
    logger.infoLn('Generate SDK\'s...');
    await writeSourceFile(files.sdks.main, `${modelsImport}\n\n${generateSdk(openapi, Target.BROWSER_PROMISES)}`);
    await writeSourceFile(files.sdks.node, `${modelsImport}\n\n${generateSdk(openapi, Target.NODE_PROMISES)}`);

    // Print job summary
    const duration = Math.floor(Number((process.hrtime.bigint() - start) / 1_000_000n));
    logger.blankLn();
    logger.printSummary();
    logger.blankLn(`SDK generated in ${duration}ms. Bye.`);
    // TODO: Exit with non-zero code on errors?
})();
