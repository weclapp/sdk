import {logger} from '@logger';
import {convertSwaggerToOpenAPI} from '@utils/converter';
import {readFile, stat} from 'fs-extra';
import {OpenAPIV3} from 'openapi-types';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {version} from '../package.json';
import fetch from 'node-fetch';

export const cli = async (): Promise<OpenAPIV3.Document> => {
    const {argv: {_: [src], key, includeHidden}} = yargs(hideBin(process.argv))
        .usage('Usage: $0 <source> [flags]')
        .version(version)
        .example('$0 swagger.json', 'Generate the SDK based on the swagger.json file')
        .example('$0 xxx.weclapp.com --key ABC-DEF', 'Generate the SDK based on the swagger.json file from the given weclapp instance using the API-Key')
        .help('h')
        .alias('v', 'version')
        .alias('h', 'help')
        .alias('k', 'key').describe('k', 'API Key in case of an URL source')
        .alias('x', 'include-hidden').describe('x', 'Include internal endpoints')
        .demandCommand()
        .epilog('Copyright 2021 weclapp');

    if (typeof src === 'number') {
        return Promise.reject('Expected string as command');
    }

    if (await stat(src).catch(() => false)) {
        logger.infoLn(`Source is a file`);
        return convertSwaggerToOpenAPI(JSON.parse(await readFile(src, 'utf-8')));
    }

    logger.infoLn(`Try to interpret source as URL`);
    const url = new URL(src.replace(/(^https?:\/\/|^)/, 'https:\/\/'));
    url.pathname = '/webapp/api/v1/meta/swagger.json';

    if (includeHidden) {
        url.searchParams.set('includeHidden', 'true');
    }

    logger.infoLn(`Source is a URL: ${url.toString()}`);
    return fetch(url, {
        headers: {
            'Accept': 'application/json',
            'AuthenticationToken': key as string
        }
    }).then(res => res.json()).then(convertSwaggerToOpenAPI)
};
