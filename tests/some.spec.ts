import {getService} from '@tests/utils/service';
import {assert, test} from 'vitest';

test('Fetch parties', async () => {
    const {entities} = await getService('party').some({
        params: {
            page: 1,
            pageSize: 10
        },
        select: {
            company: true,
            id: true
        }
    });

    assert.isArray(entities);
});

test('Fetch parties and referenced entities', async () => {
    const {entities, references} = await getService('party').some({
        include: {
            primaryContactId: true
        },
        select: {
            primaryContactId: true
        }
    });

    assert.isArray(entities);
    assert.isArray(references.party);
});
