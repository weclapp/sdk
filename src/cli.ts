import {Target} from '@enums/Target';
import {logger} from '@logger';
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
    target?: Target;
    _: (string | number)[];
}

interface CLIResult {
    cache: boolean;
    target: Target;
    content: OpenAPIV3.Document;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export const cli = async (): Promise<CLIResult> => {
    const {argv} = yargs(hideBin(process.argv))
        .scriptName('sdk-generator')
        .usage('Usage: $0 <source> [flags]')
        .version(version)
        .example('$0 swagger.json', 'Generate the SDK based on the openapi / swagger file')
        .example('$0 xxx.weclapp.com --key ...', 'Generate the SDK based on the openapi / swagger file from the given weclapp instance using the API-Key')
        .help('h')
        .alias('v', 'version')
        .alias('h', 'help')
        .option('k', {
            alias: 'key',
            describe: 'API Key in case of an URL source',
            type: 'string'
        })
        .option('c', {
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
        .option('t', {
            alias: 'target',
            describe: 'Define targets, example: -t browser',
            type: 'string'
        })
        .epilog('Copyright 2021 weclapp') as {argv: Args};

    if (argv.fromEnv) {
        config();
    }
    const {WECLAPP_API_KEY, WECLAPP_BACKEND_URL} = process.env;

    const {
        includeHidden,
        target = Target.BROWSER_PROMISES,
        cache = false,
        key = WECLAPP_API_KEY as string,
        _: [src = WECLAPP_BACKEND_URL as string]
    } = argv;

    if (typeof src === 'number') {
        return Promise.reject('Expected string as command');
    }

    if (!Object.values(Target).includes(target)) {
        logger.errorLn(`Unknown target: ${target}. Possible values are ${Object.values(Target).join(', ')}`);
        return Promise.reject();
    }

    if (await stat(src).catch(() => false)) {
        logger.infoLn(`Source is a file`);
        const content = JSON.parse(await readFile(src, 'utf-8'));
        return {cache, target, content};
    }

    const url = new URL(src.startsWith('http') ? src : `https://${src}`);
    url.pathname = '/webapp/api/v1/meta/openapi.json';

    if (includeHidden) {
        url.searchParams.set('includeHidden', 'true');
    }

    const content = await fetch(url.toString(), {
        headers: {'Accept': 'application/json', 'AuthenticationToken': key}
    }).then(res => res.ok ? res.json() : undefined);

    if (!content) {
        logger.errorLn(`Couldn't fetch file ${url.toString()} `);
        return Promise.reject();
    } else {
        logger.infoLn(`Use remote file: ${url.toString()}`);
    }

    return {cache, target, content};
};
