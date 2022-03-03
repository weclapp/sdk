import {GeneratedService} from '@generator/04-services';
import {generateInterface} from '@ts/generateInterface';
import {generateStatements} from '@ts/generateStatements';
import {indent} from '@utils/indent';

interface GeneratedMaps {
    source: string;
}

export const generateMaps = (services: GeneratedService[]): GeneratedMaps => {
    const types = generateInterface('WeclappServices', services.map(v => ({required: true, name: v.entity, type: v.serviceTypeName})));
    const values = `export const weclappServices = {\n${indent(services.map(v => `${v.entity}: ${v.serviceName}`).join(',\n'))}\n}`;
    const source = generateStatements(types, values);
    return {source};
};
