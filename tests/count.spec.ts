import 'jest-extended';
import {weclapp} from '../lib/sdk.min.js';

describe('.count', () => {
    const api = weclapp({
        apiKey: process.env.TEST_API_KEY as string,
        domain: process.env.TEST_DOMAIN as string
    });

    for (const [entity, obj] of Object.entries(api)) {
        const count = (obj as any)?.count;

        if (count) {
            it(`Should return the total amount of ${entity}s`, async () => {
                expect(await (api as any)[entity].count()).toBeNumber();
            });
        }
    }
});
