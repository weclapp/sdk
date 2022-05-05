import {GeneratedService} from '@generator/04-services';
import {concat} from '@ts/concat';
import {generateInterface, InterfaceProperty} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {generateType} from '@ts/generateType';
import {indent} from '@utils/indent';
import {camelCase, pascalCase} from 'change-case';

interface GeneratedMaps {
    source: string;
}

interface MapsGenerator {
    services: GeneratedService[];
    entities: string[];
}

export const generateMaps = ({services, entities}: MapsGenerator): GeneratedMaps => {
    const serviceValues = `export const weclappServices = {\n${indent(services.map(v => `${v.entity}: ${v.serviceName}`).join(',\n'))}\n}`;
    const serviceInstanceValues = `export const weclappServiceInstances = {\n${indent(services.map(v => `${v.entity}: ${v.serviceName}()`).join(',\n'))}\n}`;

    const entityTypes = generateInterface(
        'WeclappEntities',
        entities
            .filter(entity => services.find(s => pascalCase(s.entity) === entity))
            .map(v => ({required: true, name: camelCase(v), type: v}))
    );

    const entityUpdateTypes = generateInterface(
        'WeclappUpdateEntities',
        entities
            .filter(v => v.startsWith('CreateOrUpdate'))
            .map(v => ({required: true, name: camelCase(v.slice(14)), type: v}))
    );

    const serviceTypes = generateType('WeclappServices', 'typeof weclappServices');
    const entityTuple = generateType('WeclappEntity', 'keyof WeclappEntities');
    const weclappService = generateType('WeclappService', concat(services.map(v => v.serviceTypeName), ' | '));

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

    return {
        source: generateStatements(
            serviceTypes,
            serviceValues,
            serviceInstanceValues,
            entityTypes,
            entityUpdateTypes,
            entityTuple,
            weclappService,
            ...[...entityDescriptors.entries()]
                .map(v => generateInterface(pascalCase(`EntitiesWith_${v[0]}`), v[1]))
        )
    };
};
