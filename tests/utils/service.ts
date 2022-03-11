import {ServiceConfig, weclappServices, WeclappServices} from '@sdk/node';
import {config} from 'dotenv';

config();

export const getService = <K extends keyof WeclappServices>(
    name: K, config?: Partial<ServiceConfig>
): WeclappServices[K] => {
    return weclappServices[name]({
        domain: process.env.WECLAPP_BACKEND_URL as string,
        key: process.env.WECLAPP_API_KEY as string,
        secure: true,
        ...config
    }) as WeclappServices[K];
};
