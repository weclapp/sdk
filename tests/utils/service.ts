import {weclappServices, WeclappServices} from '@sdk/node';
import {config} from 'dotenv';

config();

export const getService = <K extends keyof WeclappServices>(name: K): WeclappServices[K] => {
    return weclappServices[name]({
        domain: process.env.WECLAPP_BACKEND_URL as string,
        key: process.env.WECLAPP_API_KEY as string,
        secure: true
    });
};
