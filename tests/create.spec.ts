import {PartyType, TaskPriority, TaskStatus, TaskVisibilityType} from '@sdk/node';
import {getService} from '@tests/utils/service';
import {assert, test} from 'vitest';

test('Create a new party', async () => {
    assert.isObject(await getService('party').create({
        partyType: PartyType.ORGANIZATION,
        company: 'Corporation'
    }));
});

test('Create a new task', async () => {
    assert.isObject(await getService('task').create({
        taskPriority: TaskPriority.HIGH,
        taskStatus: TaskStatus.COMPLETED,
        taskVisibilityType: TaskVisibilityType.ORGANIZATION,
        subject: 'Buy apples'
    }));
});
