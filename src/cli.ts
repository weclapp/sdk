import {logger} from '@logger';
import {convertSwaggerToOpenAPI} from '@utils/openapi/convertSwaggerToOpenAPI';
import {config} from 'dotenv';
import {readFile, stat} from 'fs-extra';
import fetch from 'node-fetch';
import {OpenAPIV3} from 'openapi-types';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {version} from '../package.json';

interface Args {
    key?: string;
    cache?: boolean;
    includeHidden?: boolean;
    fromEnv?: boolean;
    _: (string | number)[];
}

interface CLIResult {
    cache: boolean;
    content: OpenAPIV3.Document;
}

export const cli = async (): Promise<CLIResult> => {
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
        }).option('c', {
            alias: 'cache',
            describe: 'If the generated SDK should cached',
            type: 'boolean'
        })
        .option('x', {
            alias: 'include-hidden',
            describe: 'Include internal endpoints',
            type: 'boolean'
        })
        .option('e', {
            alias: 'from-env',
            describe: 'Use env variables WECLAPP_BACKEND_URL and WECLAPP_API_KEY as credentials',
            type: 'boolean'
        })
        .epilog('Copyright 2021 weclapp') as {argv: Args};

    if (argv.fromEnv) {
        config();
    }

    const {WECLAPP_API_KEY, WECLAPP_BACKEND_URL} = process.env;
    const {
        includeHidden, cache = false,
        key = WECLAPP_API_KEY as string,
        _: [src = WECLAPP_BACKEND_URL as string]
    } = argv;

    if (typeof src === 'number') {
        return Promise.reject('Expected string as command');
    }

    if (await stat(src).catch(() => false)) {
        logger.infoLn(`Source is a file`);
        return {
            cache,
            content: await convertSwaggerToOpenAPI(JSON.parse(await readFile(src, 'utf-8')))
        };
    }

    const url = new URL(src.startsWith('http') ? src : `https://${src}`);
    url.pathname = '/webapp/api/v1/meta/swagger.json';

    if (includeHidden) {
        url.searchParams.set('includeHidden', 'true');
    }

    logger.infoLn(`Source is a URL: ${url.toString()}`);
    return {
        cache,
        content: await fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'AuthenticationToken': key
            }
        }).then(res => res.json()).then(convertSwaggerToOpenAPI)
    };
};
