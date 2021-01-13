import {weclapp} from '../sdk/node';

export const sdk = weclapp({
    apiKey: process.env.TEST_API_KEY as string,
    domain: process.env.TEST_DOMAIN as string
});
