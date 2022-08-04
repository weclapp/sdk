import {GeneratedService} from '@generator/04-services';
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
    enums: string[];
    aliases: Map<string, string>;
}

const obj = (list: string[]) =>
    `{\n${indent(list.join(',\n'))}\n}`;

const arr = (list: string[]) =>
    `[\n${indent(list.join(',\n'))}\n]`;

export const generateMaps = ({services, entities, aliases, enums}: MapsGenerator): GeneratedMaps => {
    const entitiesWithService = entities.filter(entity => services.some(s => s.entity === entity));

    const weclappEnums = `export const wEnums = ${obj(enums)};`;
    const entityNames = `export const wEntityNames: WEntity[] = ${arr(entitiesWithService.map(v => `'${v}'`))};`;
    const serviceNames = `export const wServiceNames: WService[] = ${arr(services.map(v => `'${v.entity}'`))};`;

    const serviceValues = `export const weclappServices = ${obj(services.map(v => `${v.entity}: ${v.serviceName}`))};`;
    const serviceInstanceValues = `export const weclappServiceInstances = ${obj(services.map(v => `${v.entity}: ${v.serviceName}()`))};`;

    const entityInterfaceProperties = entitiesWithService
        .map(v => ({required: true, name: v, type: pascalCase(v)}))
        .concat([...aliases].map(v => ({required: true, name: v[0], type: pascalCase(v[1])})));

    const entityReferences = generateInterface('WEntityReferences', entityInterfaceProperties.map(v => ({...v, type: `${v.type}_References`})));
    const entityMappings = generateInterface('WEntityMappings', entityInterfaceProperties.map(v => ({...v, type: `${v.type}_Mappings`})));
    const entityFilter = generateInterface('WEntityFilters', entityInterfaceProperties.map(v => ({...v, type: `${v.type}_Filter`})));
    const entityTypes = generateInterface('WEntities', entityInterfaceProperties);

    const entityUpdateTypes = generateInterface(
        'CreateOrUpdateWEntities',
        entities
            .filter(v => v.startsWith('createOrUpdate'))
            .map(v => ({required: true, name: camelCase(v.slice(14)), type: pascalCase(v)}))
    );

    const weclappEnumTypes = generateType('WEnums', 'typeof wEnums');
    const serviceTypes = generateType('WServices', 'typeof weclappServiceInstances');
    const serviceFactoryTypes = generateType('WServiceFactories', 'typeof weclappServices');
    const entityTuple = generateType('WEntity', 'keyof WEntities');
    const weclappService = generateType('WService','keyof WServices');

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
            serviceFactoryTypes,
            serviceValues,
            serviceInstanceValues,
            entityNames,
            serviceNames,
            entityTypes,
            entityUpdateTypes,
            entityReferences,
            entityMappings,
            entityFilter,
            entityTuple,
            weclappService,
            weclappEnums,
            weclappEnumTypes,
            ...[...entityDescriptors.entries()]
                .map(v => generateInterface(pascalCase(`WServicesWith_${v[0]}`), v[1]))
        )
    };
};
