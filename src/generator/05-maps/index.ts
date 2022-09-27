import {GeneratedService} from '@generator/04-services';
import {generateBlockComment} from '@ts/generateComment';
import {generateGroupedServiceInterfaces} from './generateGroupedServiceInterfaces';
import {generateInterface} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {generateType} from '@ts/generateType';
import {indent} from '@utils/indent';
import {pascalCase} from 'change-case';

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

    const entitiesInterfaces = [
        ...entities.map(entity => ({
            name: entity,
            type: pascalCase(entity),
            required: true
        })),
        ...entityInterfaceProperties.map(entityWithService => ({
            ...entityWithService,
            type: pascalCase(entityWithService.type)
        }))
    ];

    const entitiesList = generateInterface('WEntities', entitiesInterfaces);
    const entityReferences = generateInterface('WEntityReferences', entitiesInterfaces.map(v => ({...v, type: `${v.type}_References`})));
    const entityMappings = generateInterface('WEntityMappings', entitiesInterfaces.map(v => ({...v, type: `${v.type}_Mappings`})));
    const entityFilter = generateInterface('WEntityFilters', entitiesInterfaces.map(v => ({...v, type: `${v.type}_Filter`})));

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
            generateBlockComment(`
                This interfaces merges two maps:
                - Map<[entityName], [entityInterfaceName]>
                - Map<[serviceName], [entityInterfaceName]>
                
                Where [entityName] is 
                - the name of a nested entity (e.g. 'address' from Party)
                - the name of an entity (e.g. 'party', 'article' etc.)
                
                Where [serviceName] is the name of an endpoint (e.g. for /article its 'article')
               
                Where [entityInterfaceName] is
                - the underlying type for this entity
                - the type for what is returned by the api
            `, entitiesList),

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
