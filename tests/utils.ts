import {AnySchema} from 'joi';
import {weclapp} from '@sdk/node';
import {weclapp as weclappRx} from '@sdk/node/rx';

const options = {
    apiKey: process.env.TEST_API_KEY as string,
    domain: process.env.TEST_DOMAIN as string
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
    const {errors, warning} = schema.validate(data);

    if (errors) {
        throw errors;
    } else if (warning) {
        throw warning;
    }
};
