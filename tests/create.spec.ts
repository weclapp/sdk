import 'jest-extended';
import {weclapp} from '../sdk/node';

describe('.create', () => {
    const api = weclapp({
        apiKey: process.env.TEST_API_KEY as string,
        domain: process.env.TEST_DOMAIN as string
    });

    it('Should create a new article', async () => {
        // TODO: Add tests if responses is valid and added
    });
});
