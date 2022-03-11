import {getService} from '@tests/utils/service';
import {Request, Response} from 'node-fetch';
import {assert, test} from 'vitest';

test('Intercept the request and response', async () => {
    const party = await getService('party', {
        interceptors: {
            request: (req) => assert.instanceOf(req, Request),
            response: (res) => assert.instanceOf(res, Response)
        }
    });

    assert.isNumber(await party.count());
});

test('Fake a response', async () => {
    const count = Math.floor(Math.random() * 1000);
    const party = await getService('party', {
        interceptors: {
            request() {
                return new Response(`{"result": ${count}}`, {
                    headers: {'content-type': 'application/json'}
                });
            }
        }
    });

    assert.equal(await party.count(), count);
});
