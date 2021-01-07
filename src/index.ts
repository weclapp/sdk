/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {definitions} from '@swagger/definitions';
import {endpoints} from '@swagger/endpoint';
import {SwaggerFile} from '@swagger/types';
import {tsDeconstructedImport} from '@ts/modules';
import {env} from '@utils/env';
import {infoLn, successLn} from '@utils/log';
import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';

const dist = path.resolve(__dirname, '../', env('SDK_DIST'));
const files = {
    sdk: path.join(dist, 'index.ts'),
    types: path.join(dist, 'types.ts')
};

void (async () => {
    await mkdir(dist, {recursive: true});

    // Read swagger file and create model definitions
    infoLn('Read swagger file...');
    const swagger: SwaggerFile = JSON.parse(await readFile(env('SWAGGER_FILE'), 'utf-8'));

    infoLn('Generate entity models...');
    const {source: defCode, exports: defExports} = definitions(swagger.definitions);
    const defImportStatement = tsDeconstructedImport('./types', defExports);

    infoLn('Generate endpoints...');
    const endpointCode = endpoints(swagger.paths);

    infoLn('Generate sdk...');
    await writeFile(files.types, defCode);
    await writeFile(files.sdk, `${defImportStatement}\n\n${endpointCode}`);

    successLn('All done, bye.');
})();
