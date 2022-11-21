import {GeneratedService} from '@generator/04-services';
import {generateArray} from '@ts/generateArray';
import {generateInterface, InterfaceProperty} from '@ts/generateInterface';
import {generateType} from '@ts/generateType';
import {camelCase, pascalCase} from 'change-case';

// Only functions matching this regex are included in the generation.
const FILTER_REGEX = /^(some|count|create|remove|unique|update)$/;

/**
 * Generates for each function a map with the entity-name as key and service type as value.
 * E.g. WServicesWith[Function] where [Function] may be something like "some" or "create".
 *
 * This function also generates an exported array with the names of each service for each name.
 */
export const generateGroupedServices = (services: GeneratedService[]) => {
    const entityDescriptors: Map<string, InterfaceProperty[]> = new Map();
    for (const {entity, functions} of services) {
        for (const {name} of functions) {
            if (!FILTER_REGEX.test(name)) {
                continue;
            }

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
        ...descriptors.map(([name, props]) => generateInterface(pascalCase(`WServicesWith_${name}`), props)),
        ...descriptors.map(([name]) => generateType(
            pascalCase(`WServiceWith_${name}`),
            `keyof ${pascalCase(`WServicesWith_${name}`)}`
        )),
        ...descriptors.map(([name, props]) => {
            const constant = camelCase(`wServiceWith_${name}_Names`);
            const type = pascalCase(`WServiceWith_${name}`);
            const value = generateArray(props.map(v => v.name));
            return `export const ${constant}: ${type}[] = ${value};`;
        })
    ];
};