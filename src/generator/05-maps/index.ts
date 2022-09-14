import {GeneratedService} from '@generator/04-services';
import {generateString} from '@ts/generateString';
import {generateGroupedServiceInterfaces} from './generateGroupedServiceInterfaces';
import {generateInterface} from '@ts/generateInterface';
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

    const enumsArray = `export const wEnums = ${obj(enums)};`;
    const entityNames = `export const wEntityNames: WEntity[] = ${arr(entities.map(v => `'${v}'`))};`;
    const serviceNames = `export const wServiceNames: WService[] = ${arr(services.map(v => `'${v.entity}'`))};`;

    const serviceValues = `export const wServiceFactories = ${obj(services.map(v => `${v.entity}: ${v.serviceName}`))};`;
    const serviceInstanceValues = `export const wServices = ${obj(services.map(v => `${v.entity}: ${v.serviceName}()`))};`;

    const entityInterfaceProperties = entitiesWithService
        .map(v => ({required: true, name: v, type: pascalCase(v)}))
        .concat([...aliases].map(v => ({required: true, name: v[0], type: pascalCase(v[1])})));

    const entityReferences = generateInterface('WEntityReferences', entityInterfaceProperties.map(v => ({...v, type: `${v.type}_References`})));
    const entityMappings = generateInterface('WEntityMappings', entityInterfaceProperties.map(v => ({...v, type: `${v.type}_Mappings`})));
    const entityFilter = generateInterface('WEntityFilters', entityInterfaceProperties.map(v => ({...v, type: `${v.type}_Filter`})));

    const servicesList = generateInterface('WEntityServices', entityInterfaceProperties.map(entityWithService => ({
        ...entityWithService,
        type: generateString(camelCase(entityWithService.type))
    })));

    const entitiesList = generateInterface('WEntities', entities.map(entity => ({
        name: entity,
        type: pascalCase(entity),
        required: true
    })));

    return {
        source: generateStatements(
            /* JS Values */
            serviceValues,
            serviceInstanceValues,
            entityNames,
            serviceNames,
            enumsArray,

            /* Map of entity to references / mappings and filters*/
            entityReferences,
            entityMappings,
            entityFilter,

            /* List of all entities with their corresponding service */
            entitiesList,
            servicesList,

            /* type-ofs and types */
            generateType('WServices', 'typeof wServices'),
            generateType('WServiceFactories', 'typeof wServiceFactories'),
            generateType('WService', 'keyof WServices'),
            generateType('WEntity', 'keyof WEntities'),
            generateType('WEnums', 'typeof wEnums'),
            generateType('WEnum', 'keyof WEnums'),

            /* All functions grouped by service supporting it */
            ...generateGroupedServiceInterfaces(services)
        )
    };
};
