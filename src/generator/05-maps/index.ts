import {GeneratedService} from '@generator/04-services';
import {generateInterface} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {generateTuple} from '@ts/generateTuple';
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
    const entityTypes = generateInterface('WeclappEntities', entities.map(v => ({required: true, name: camelCase(v), type: v})));
    const serviceTypes = generateType('WeclappServices', 'typeof weclappServices');
    const entityTuple = generateType('WeclappEntity', 'keyof WeclappEntities');

    const functionSets: Map<string, string[]> = new Map();
    for (const {entity, generatedFunctions} of services) {
        for (const func of generatedFunctions) {
            functionSets.set(func, [...(functionSets.get(func) ?? []), entity]);
        }
    }

    return {
        source: generateStatements(
            serviceTypes,
            serviceValues,
            serviceInstanceValues,
            entityTypes,
            entityTuple,
            ...[...functionSets.entries()]
                .map(v => generateTuple(pascalCase(`EntitiesWith_${v[0]}`), v[1]))
        )
    };
};
