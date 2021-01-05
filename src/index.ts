/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {definitions} from '@swagger/definitions';
import {endpoints} from '@swagger/endpoint';
import {SwaggerFile} from '@swagger/types';
import {env} from '@utils/env';
import {blankLn, info, successLn} from '@utils/log';
import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';

const dist = path.resolve(__dirname, '../', env('SDK_DIST'));
const files = {
    sdk: path.join(dist, 'index.ts')
};

void (async () => {
    await mkdir(dist, {recursive: true});

    // Read swagger file and create model definitions
    info('Read swagger file...');
    const swagger: SwaggerFile = JSON.parse(await readFile(env('SWAGGER_FILE'), 'utf-8'));
    blankLn(' Done.');

    info('Generate entity models...');
    const defCode = definitions(swagger.definitions);
    blankLn(' Done.');

    info('Generate endpoints...');
    const endpointCode = endpoints(swagger.paths);
    blankLn(' Done.');

    info('Generate sdk...');
    await writeFile(files.sdk, defCode + endpointCode);
    blankLn(' Done.');

    successLn('All done, bye.');
})();
