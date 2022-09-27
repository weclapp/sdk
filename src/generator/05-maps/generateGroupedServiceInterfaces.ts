import {GeneratedService} from '@generator/04-services';
import {generateInterface, InterfaceProperty} from '@ts/generateInterface';
import {generateType} from '@ts/generateType';
import {pascalCase} from 'change-case';

/**
 * Generates for each function a map with the entity-name as key and service type as value.
 * E.g. WServicesWith[Function] where [Function] may be something like "some" or "create"
 */
export const generateGroupedServiceInterfaces = (services: GeneratedService[]) => {
    const entityDescriptors: Map<string, InterfaceProperty[]> = new Map();
    for (const {entity, functions} of services) {
        for (const {name} of functions) {
            entityDescriptors.set(name, [
                ...(entityDescriptors.get(name) ?? []), {
                    name: entity,
                    required: true,
                    type: `${pascalCase(entity)}Service_${pascalCase(name)}`
                }
            ]);
        }
    }

    const descriptors = [...entityDescriptors.entries()];

    return [
        ...descriptors.map(v => generateInterface(pascalCase(`WServicesWith_${v[0]}`), v[1])),
        ...descriptors.map(v => generateType(
            pascalCase(`WServiceWith_${v[0]}`),
            `keyof ${pascalCase(`WServicesWith_${v[0]}`)}`
        ))
    ];
};