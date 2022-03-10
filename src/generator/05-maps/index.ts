import {GeneratedService} from '@generator/04-services';
import {generateInterface} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {generateType} from '@ts/generateType';
import {indent} from '@utils/indent';
import {camelCase} from 'change-case';

interface GeneratedMaps {
    source: string;
}

interface MapsGenerator {
    services: GeneratedService[];
    entities: string[];
}

export const generateMaps = ({services, entities}: MapsGenerator): GeneratedMaps => {
    const serviceTypes = generateInterface('WeclappServices', services.map(v => ({required: true, name: v.entity, type: v.serviceTypeName})));
    const serviceValues = `export const weclappServices = {\n${indent(services.map(v => `${v.entity}: ${v.serviceName}`).join(',\n'))}\n}`;
    const entityTypes = generateInterface('WeclappEntities', entities.map(v => ({required: true, name: camelCase(v), type: v})));
    const entityTuple = generateType('WeclappEntity', 'keyof WeclappEntities');
    const source = generateStatements(entityTypes, entityTuple, serviceTypes, serviceValues);
    return {source};
};
