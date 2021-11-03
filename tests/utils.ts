import {weclapp} from '@sdk/raw/sdk';
import {weclapp as weclappRx} from '@sdk/raw/sdk.rx';
import {AnySchema} from 'joi';

const options = {
    apiKey: process.env.WECLAPP_API_KEY as string,
    domain: process.env.WECLAPP_BACKEND_URL as string
};

// Create weclapp instances of both libraries
export const sdkRx = weclappRx(options);
export const sdk = weclapp(options);

/**
 * Tests the data against the given schema
 * @param data
 * @param schema
 */
export const testSchema = (data: unknown, schema: AnySchema): void => {
    const {error, warning} = schema.validate(data);

    if (error) {
        throw error;
    } else if (warning) {
        throw warning;
    }
};
