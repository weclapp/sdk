import {Target} from '@enums/Target';
import {GeneratedEntity} from '@generator/03-entities';
import {generateString} from '@ts/generateString';
import {generateCountEndpoint} from './endpoints/count';
import {generateCreateEndpoint} from './endpoints/create';
import {generateGenericEndpoint} from './endpoints/generic';
import {generateRemoveEndpoint} from './endpoints/remove';
import {generateSomeEndpoint} from './endpoints/some';
import {generateUniqueEndpoint} from './endpoints/unique';
import {generateUpdateEndpoint} from './endpoints/update';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from './types';
import {groupEndpointsByEntity} from './utils/groupEndpointsByEntity';
import {logger} from '@logger';
import {concat} from '@ts/concat';
import {generateBlockComment} from '@ts/generateComment';
import {generateInterface} from '@ts/generateInterface';
import {generateObject} from '@ts/generateObject';
import {generateBlockStatements, generateStatements} from '@ts/generateStatements';
import {WeclappEndpointType} from '@utils/weclapp/parseEndpointPath';
import {camelCase, pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

export interface GeneratedService {
    entity: string;
    serviceName: string;
    serviceTypeName: string;
    source: string;
    functions: GeneratedServiceFunction[];
}

const generators: Record<WeclappEndpointType, Record<string, ServiceFunctionGenerator>> = {
    [WeclappEndpointType.COUNT]: {
        get: generateCountEndpoint
    },
    [WeclappEndpointType.ROOT]: {
        get: generateSomeEndpoint,
        post: generateCreateEndpoint
    },
    [WeclappEndpointType.ENTITY]: {
        get: generateUniqueEndpoint,
        delete: generateRemoveEndpoint,
        put: generateUpdateEndpoint
    },
    [WeclappEndpointType.GENERIC_ENTITY]: {
        get: generateGenericEndpoint('ById'),
        post: generateGenericEndpoint('ById')
    },
    [WeclappEndpointType.GENERIC_ROOT]: {
        get: generateGenericEndpoint(),
        post: generateGenericEndpoint()
    }
};

export const generateServices = (
    doc: OpenAPIV3.Document,
    target: Target,
    aliases: Map<string, string>,
    entities: Map<string, GeneratedEntity>
): Map<string, GeneratedService> => {
    const services: Map<string, GeneratedService> = new Map();
    const grouped = groupEndpointsByEntity(doc.paths);

    for (const [endpoint, paths] of grouped) {
        const generatedEntity = entities.get(endpoint);
        const serviceName = camelCase(`${endpoint}Service`);
        const serviceTypeName = pascalCase(`${endpoint}Service`);
        const serviceMetaInformationName = pascalCase(`${endpoint}_Meta`);
        const entity = aliases.get(endpoint) ?? endpoint;

        const functions: GeneratedServiceFunction[] = [];

        for (const {path, endpoint} of paths) {
            const resolver = generators[endpoint.type];

            for (const [method, config] of Object.entries(path)) {
                if (resolver[method]) {
                    const path = config as OpenAPIV3.OperationObject;

                    functions.push(resolver[method]({endpoint, method, target, path, aliases}));
                } else {
                    logger.errorLn(`Failed to generate a function for ${method.toUpperCase()}:${endpoint.type} ${endpoint.path}`);
                }
            }
        }

        const metaInformation = generateObject({
            properties: generatedEntity ? generateObject(Object.fromEntries(
                Array.from(generatedEntity.properties.entries())
                    .map(([property, meta]) => [
                        property,
                        Object.fromEntries(Object.entries(meta).map(([property, value]) => [
                            property,
                            value ? generateString(value) : undefined
                        ]))
                    ])
            )) : 'undefined'
        });

        const metaInterface = generateInterface(serviceMetaInformationName, [
            {name: 'properties', type: `Partial<Record<keyof ${pascalCase(entity)}, WEntityPropertyMeta>>`}
        ]);

        const hasSomeEndpoint = paths.some(v => v.endpoint.type === WeclappEndpointType.ROOT);

        const types = generateStatements(
            ...functions.flatMap(v => v.interfaces?.map(v => v.source) ?? []),
            ...functions.map(v => v.type.source),
            ...(hasSomeEndpoint ? [metaInterface] : []),
            generateInterface(serviceTypeName, [
                ...(hasSomeEndpoint ? [{name: 'meta', type: serviceMetaInformationName, required: true}] : []),
                ...functions.map(v => ({
                    required: true,
                    name: v.func.name,
                    type: v.type.name
                }))
            ])
        );

        const funcBody = generateBlockStatements(
            ...functions.map(v => v.func.source),
            ...(hasSomeEndpoint ? [`const meta: ${serviceMetaInformationName} = ${metaInformation};`] : []),
            `return {${concat([
                ...(hasSomeEndpoint ? ['meta'] : []),
                ...functions.map(v => v.func.name)
            ])}};`
        );

        const func = `export const ${serviceName} = (cfg?: ServiceConfig): ${serviceTypeName} => ${funcBody};`;
        const source = generateBlockComment(`${pascalCase(endpoint)} service`, generateStatements(types, func));
        services.set(endpoint, {entity: endpoint, serviceName, serviceTypeName, source, functions});
    }

    return services;
};
