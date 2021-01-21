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
    query?: Record<string, unknown>;
    body?: any;
}

export interface RawRequest {
    <T = any>(endpoint: string, requestOptions?: RequestOptions): Promise<T>
}
