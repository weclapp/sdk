import {AnySchema} from 'joi';
import {weclapp} from '../sdk/node';

export const sdk = weclapp({
    apiKey: process.env.TEST_API_KEY as string,
    domain: process.env.TEST_DOMAIN as string
});

export const testSchema = (data: any, schema: AnySchema): void => {
    const {errors, warning} = schema.validate(data);

    if (errors) {
        throw errors;
    } else if (warning) {
        throw warning;
    }
};
