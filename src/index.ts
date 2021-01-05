/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {env} from '@utils/env';
import {blankLn, info, successLn} from '@utils/log';
import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';
import {definitions} from './swagger/definitions';
import {SwaggerFile} from './swagger/types';

const dist = path.resolve(__dirname, '../', env('SDK_DIST'));
const files = {
    types: path.join(dist, 'types.ts'),
    index: path.join(dist, 'index.ts')
};

void (async () => {
    await mkdir(dist, {recursive: true});

    // Read swagger file and create model definitions
    info('Read swagger file...');
    const swagger: SwaggerFile = JSON.parse(await readFile(env('SWAGGER_FILE'), 'utf-8'));
    blankLn(' Done.');

    info('Generate entity models...');
    const models = definitions(swagger.definitions);
    blankLn(' Done.');

    // Create dist directory and write file
    info('Write to disk...');
    await writeFile(files.types, models);
    blankLn(' Done.');

    successLn('All done, bye.');
})();
