export interface Options {
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

interface RequestOptions {
    method?: Method;
    params?: Record<string, unknown>;
    body?: any;
}

export interface RawRequest {
    (endpoint: string, requestOptions: RequestOptions): Promise<any>
}
