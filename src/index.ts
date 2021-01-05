/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
require('dotenv').config();
import {env} from '@utils/env';
import {mkdir, readFile} from 'fs/promises';
import path from 'path';
import {definitions} from './swagger/definitions';

void (async () => {

    // Read swagger file and create model definitions
    console.log('[i] Read swagger file.');
    const swagger = JSON.parse(await readFile(env('SWAGGER_FILE'), 'utf-8'));

    console.log('[i] Parse definitions.');
    const models = definitions(swagger.definitions);

    // Create dist directory and write file
    console.log('[i] Write to disk.');
    const dist = path.resolve(__dirname, '../', env('SDK_DIST'));
    await mkdir(dist, {recursive: true});
    await models.writeTo(path.join(dist, 'types.ts'));

    console.log('[i] All done, bye.');
})();
