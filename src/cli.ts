import {Target} from '@enums/Target';
import {GeneratorOptions} from '@generator/generate';
import {logger} from '@logger';
import {config} from 'dotenv';
import {readFile, stat} from 'fs/promises';
import {OpenAPIV3} from 'openapi-types';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {version} from '../package.json';

interface Args {
    key?: string;
    cache?: boolean;
    query?: string;
    generateUnique?: boolean;
    deprecated?: boolean;
    fromEnv?: boolean;
    target?: Target;
    _: (string | number)[];
}

interface CLIResult {
    cache: boolean;
    content: OpenAPIV3.Document;
    options: GeneratorOptions;
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
        .option('q', {
            alias: 'query',
            describe: 'Extra query params when fetching the openapi.json from a server',
            type: 'string'
        })
        .option('generate-unique', {
            describe: 'Generate .unique functions',
            type: 'boolean'
        })
        .option('d', {
            alias: 'deprecated',
            describe: 'Include deprecated functions and services',
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
        .option('d', {
            alias: 'deprecated',
            describe: 'Include deprecated functions and services',
            type: 'boolean'
        })
        .epilog(`Copyright ${new Date().getFullYear()} weclapp GmbH`) as {argv: Args};

    if (argv.fromEnv) {
        config();
    }

    const {WECLAPP_API_KEY, WECLAPP_BACKEND_URL} = process.env;

    const {
        query,
        cache = false,
        deprecated = false,
        key = WECLAPP_API_KEY as string,
        _: [src = WECLAPP_BACKEND_URL as string]
    } = argv;

    const options: GeneratorOptions = {
        deprecated,
        generateUnique: argv.generateUnique ?? false,
        target: argv.target ?? Target.BROWSER_PROMISES
    };

    if (typeof src === 'number') {
        return Promise.reject('Expected string as command');
    }

    if (!Object.values(Target).includes(options.target)) {
        logger.errorLn(`Unknown target: ${options.target}. Possible values are ${Object.values(Target).join(', ')}`);
        return Promise.reject();
    }

    if (await stat(src).catch(() => false)) {
        logger.infoLn(`Source is a file`);
        const content = JSON.parse(await readFile(src, 'utf-8'));
        return {cache, content, options};
    }

    const url = new URL(src.startsWith('http') ? src : `https://${src}`);
    url.pathname = '/webapp/api/v1/meta/openapi.json';

    if (query?.length) {
        for (const param of query.split(',')) {
            const [name, value] = param.split('=');
            url.searchParams.set(name, value);
        }
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

    return {cache, content, options};
};
