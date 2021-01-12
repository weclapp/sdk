import {logger} from '@logger';
import {resolveServer} from '@openapi/utils/resolveServer';
import {indent} from '@utils/indent';
import {OpenAPIV3} from 'openapi-types';
import pkg from '@/package.json';

export const generateLibraryRoot = (endpoints: string, doc: OpenAPIV3.Document): string => {
    const server = resolveServer(doc);

    if (!server) {
        logger.errorLn('Couldn\'t resolve server!');
        process.exit(1);
    }

    return `
interface Options {
    domain: string;
    apiKey: string;
    secure?: boolean;
}

export enum Method {
    GET = 'GET',
    HEAD = 'HEAD',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    CONNECT = 'CONNECT',
    OPTIONS = 'OPTIONS',
    TRACE = 'TRACE',
    PATCH = 'PATCH'
}

interface MakeRequest {
    (
        endpoint: string,
        method?: Method,
        body?: any
    ): Promise<any>;
}

// Current version.
export const version = '${pkg.version}';

/**
 * Creates a new weclapp instance using the given credentials.
 * @param domain Domain of your weclapp instance.
 * @param apiKey Your API-Key.
 * @param secure If https should be used (default is true).
 */
export const weclapp = ({
    domain,
    apiKey,
    secure = true
}: Options) => {

    // Strip protocol from domain
    domain = domain.replace(/^https?:\\/\\//, '');
    const base = \`http\${secure ? 's' : ''}://\${domain}${server}\`;

    /**
     * Takes a response and converts it to a js object if possible.
     * @param res
     */
    const handleContentType = (res: Response): Promise<Response> => {
        if (res.headers?.get('content-type')?.includes('application/json')) {
            return res.json();
        }

        return Promise.resolve(res);
    };

    /**
     * Makes a raw request to the given endpoint.
     * @param endpoint Endpoint url.
     * @param method Request method (GET is default)
     * @param body Optional body data.
     */
    const makeRequest: MakeRequest = async (endpoint, method = Method.GET, body): Promise<any> => {
        return fetch(\`\${base}/\${endpoint}\`, {
            ...(body && {body: JSON.stringify(body)}),
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'AuthenticationToken': apiKey
            }
        }).then(async res => {
            const data = await handleContentType(res);

            // Check if response was successful
            if (!res.ok) {
                throw data;
            }

            return data;
        });
    };

    return {
        raw: makeRequest,

${indent(endpoints, 2)}
    };
};
    `;
};
