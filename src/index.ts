/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {definitions} from '@openapi/definitions';
import {endpoints} from '@openapi/endpoint';
import {tsDeconstructedImport} from '@ts/modules';
import {env} from '@utils/env';
import {errorLn, infoLn, successLn} from '@utils/log';
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
    infoLn('Read openapi file...');
    const openapi: OpenAPIV3.Document = JSON.parse(await readFile(env('SRC_OPENAPI'), 'utf-8'));


    infoLn('Generate entity models...');
    if (!openapi.components?.schemas) {
        return errorLn('components.schemas missing.');
    }

    const {source: defCode, exports: defExports} = definitions(openapi.components.schemas);
    const defImportStatement = tsDeconstructedImport('./types', defExports);

    infoLn('Generate endpoints...');
    const endpointCode = endpoints(openapi.paths);

    infoLn('Generate sdk...');
    await writeSourceFile(files.types, defCode);
    await writeSourceFile(files.sdk, `${defImportStatement}\n\n${endpointCode}`);

    successLn('All done, bye.');
})();
