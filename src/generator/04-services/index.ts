import {Target} from '@enums/Target';
import {generateCountEndpoint} from '@generator/04-services/endpoints/count';
import {generateCreateEndpoint} from '@generator/04-services/endpoints/create';
import {generateGenericEndpoint} from '@generator/04-services/endpoints/generic';
import {generateRemoveEndpoint} from '@generator/04-services/endpoints/remove';
import {generateSomeEndpoint} from '@generator/04-services/endpoints/some';
import {generateUniqueEndpoint} from '@generator/04-services/endpoints/unique';
import {generateUpdateEndpoint} from '@generator/04-services/endpoints/update';
import {GeneratedServiceFunction, ServiceFunctionGenerator} from '@generator/04-services/types';
import {groupEndpointsByEntity} from '@generator/04-services/utils/groupEndpointsByEntity';
import {logger} from '@logger';
import {concat} from '@ts/concat';
import {generateBlockComment} from '@ts/generateComment';
import {generateInterface} from '@ts/generateInterface';
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

export const generateServices = (doc: OpenAPIV3.Document, target: Target): Map<string, GeneratedService> => {
    const services: Map<string, GeneratedService> = new Map();
    const grouped = groupEndpointsByEntity(doc.paths);

    for (const [entity, paths] of grouped) {
        const serviceName = camelCase(`${entity}Service`);
        const serviceTypeName = pascalCase(`${entity}Service`);
        const functions: GeneratedServiceFunction[] = [];

        for (const {path, endpoint} of paths) {
            const resolver = generators[endpoint.type];

            for (const [method, config] of Object.entries(path)) {
                if (resolver[method]) {
                    const path = config as OpenAPIV3.OperationObject;

                    functions.push(resolver[method]({endpoint, method, target, path}));
                } else {
                    logger.errorLn(`Failed to generate a function for ${method.toUpperCase()}:${endpoint.type} ${endpoint.path}`);
                }
            }
        }

        const types = generateStatements(
            ...functions.flatMap(v => v.interfaces?.map(v => v.source) ?? []),
            ...functions.map(v => v.type.source),
            generateInterface(serviceTypeName, [
                ...functions.map(v => ({
                    required: true,
                    name: v.func.name,
                    type: v.type.name
                }))
            ])
        );

        const funcBody = generateBlockStatements(
            ...functions.map(v => v.func.source),
            `return {${concat(functions.map(v => v.func.name))}};`
        );

        const func = `export const ${serviceName} = (cfg?: ServiceConfig): ${serviceTypeName} => ${funcBody};`;
        const source = generateBlockComment(`${pascalCase(entity)} service`, generateStatements(types, func));
        services.set(entity, {entity, serviceName, serviceTypeName, source, functions});
    }

    return services;
};
