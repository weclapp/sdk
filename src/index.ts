/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {logger} from '@logger';
import {definitions} from '@openapi/definitions';
import {endpoints} from '@openapi/endpoint';
import {tsDeconstructedImport} from '@ts/modules';
import {env} from '@utils/env';
import {writeSourceFile} from '@utils/writeSourceFile';
import {mkdir, readFile} from 'fs/promises';
import {OpenAPIV3} from 'openapi-types';
import path from 'path';

const dist = path.resolve(__dirname, '../', env('DIST_SDK_DIR'));
const files = {
    sdk: path.join(dist, 'index.ts'),
    types: path.join(dist, 'types.ts')
};

void (async () => {
    await mkdir(dist, {recursive: true});

    // Read openapi file and create model definitions
    logger.infoLn('Read openapi file...');
    const openapi: OpenAPIV3.Document = JSON.parse(await readFile(env('SRC_OPENAPI'), 'utf-8'));


    logger.infoLn('Generate entity models...');
    if (!openapi.components?.schemas) {
        return logger.errorLn('components.schemas missing.');
    }

    const {source: defCode, exports: defExports} = definitions(openapi.components.schemas);
    const defImportStatement = tsDeconstructedImport('./types', defExports);

    logger.infoLn('Generate endpoints...');
    const endpointCode = endpoints(openapi.paths);

    logger.infoLn('Generate sdk...');
    await writeSourceFile(files.types, defCode);
    await writeSourceFile(files.sdk, `${defImportStatement}\n\n${endpointCode}`);

    // Print job summary
    logger.blankLn();
    logger.printSummary();
    logger.blankLn('All done, bye.');
    // TODO: Exit with non-zero code on errors?
})();
