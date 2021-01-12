/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {Target} from '@enums/Target';
import {definitions} from '@generator/definitions';
import {generateSdk} from '@generator/library';
import {logger} from '@logger';
import {tsDeconstructedImport} from '@ts/modules';
import {env} from '@utils/env';
import {writeSourceFile} from '@utils/writeSourceFile';
import {mkdir, readFile} from 'fs/promises';
import {OpenAPIV3} from 'openapi-types';
import path from 'path';

const dist = path.resolve(__dirname, '../', env('SDK_RAW_DIR'));
const files = {
    sdk: path.join(dist, 'sdk.ts'),
    node: path.join(dist, 'sdk.node.ts'),
    types: path.join(dist, 'types.ts')
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
    const {source: defCode, exports: defExports} = definitions(openapi.components.schemas);
    const defImportStatement = tsDeconstructedImport('./types', defExports);

    logger.infoLn('Generate SDK\'s...');
    await writeSourceFile(files.types, defCode);
    await writeSourceFile(files.sdk, `${defImportStatement}\n\n${generateSdk(openapi, Target.BROWSER_PROMISES)}`);
    await writeSourceFile(files.node, `${defImportStatement}\n\n${generateSdk(openapi, Target.NODE_PROMISES)}`);

    // Print job summary
    const duration = Math.floor(Number((process.hrtime.bigint() - start) / 1_000_000n));
    logger.blankLn();
    logger.printSummary();
    logger.blankLn(`SDK generated in ${duration}ms. Bye.`);
    // TODO: Exit with non-zero code on errors?
})();
