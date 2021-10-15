import {logger} from '@logger';
import {convertSwaggerToOpenAPI} from '@utils/converter';
import {readFile, stat} from 'fs-extra';
import {OpenAPIV3} from 'openapi-types';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {version} from '../package.json';
import fetch from 'node-fetch';

interface Args {
    key?: string;
    includeHidden?: boolean;
    _: (string | number)[];
}

export const cli = async (): Promise<OpenAPIV3.Document> => {
    const {argv} = yargs(hideBin(process.argv))
        .scriptName('sdk-generator')
        .usage('Usage: $0 <source> [flags]')
        .version(version)
        .example('$0 swagger.json', 'Generate the SDK based on the swagger.json file')
        .example('$0 xxx.weclapp.com --key ...', 'Generate the SDK based on the swagger.json file from the given weclapp instance using the API-Key')
        .help('h')
        .alias('v', 'version')
        .alias('h', 'help')
        .option('k', {
            alias: 'key',
            describe: 'API Key in case of an URL source',
            type: 'string'
        })
        .option('x', {
            alias: 'include-hidden',
            describe: 'Include internal endpoints',
            type: 'boolean'
        })
        .demandCommand()
        .epilog('Copyright 2021 weclapp');

    const {_: [src], key, includeHidden} = argv as Args;

    if (typeof src === 'number') {
        return Promise.reject('Expected string as command');
    }

    if (await stat(src).catch(() => false)) {
        logger.infoLn(`Source is a file`);
        return convertSwaggerToOpenAPI(JSON.parse(await readFile(src, 'utf-8')));
    }

    const url = new URL(src.replace(/(^https?:\/\/|^)/, 'https://'));
    url.pathname = '/webapp/api/v1/meta/swagger.json';

    if (includeHidden) {
        url.searchParams.set('includeHidden', 'true');
    }

    logger.infoLn(`Source is a URL: ${url.toString()}`);
    return fetch(url.toString(), {
        headers: {
            'Accept': 'application/json',
            'AuthenticationToken': key as string
        }
    }).then(res => res.json()).then(convertSwaggerToOpenAPI);

};
