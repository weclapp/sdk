import {groupEndpointsByEntity} from '@generator/04-services/groupEndpointsByEntity';
import {ServiceFunctionGenerator} from '@generator/04-services/types';
import {generateCountEndpoint} from '@generator/04-services/endpoints/count';
import {generateEntityEndpoint} from '@generator/04-services/endpoints/entity';
import {generateRootEndpoint} from '@generator/04-services/endpoints/root';
import {generateSpecialEntityEndpoint} from '@generator/04-services/endpoints/specialEntity';
import {generateSpecialRootEndpoint} from '@generator/04-services/endpoints/specialRoot';
import {generateInlineComment} from '@ts/generateComment';
import {generateStatements} from '@ts/generateStatements';
import {indent} from '@utils/indent';
import {WeclappEndpointType} from '@utils/weclapp/parseEndpointPath';
import {camelCase, pascalCase} from 'change-case';
import {OpenAPIV3} from 'openapi-types';

interface Service {
    source: string;
}

const endpointGenerators: Record<WeclappEndpointType, ServiceFunctionGenerator> = {
    [WeclappEndpointType.COUNT]: generateCountEndpoint,
    [WeclappEndpointType.ENTITY]: generateEntityEndpoint,
    [WeclappEndpointType.ROOT]: generateRootEndpoint,
    [WeclappEndpointType.SPECIAL_ENTITY]: generateSpecialEntityEndpoint,
    [WeclappEndpointType.SPECIAL_ROOT]: generateSpecialRootEndpoint
};

export const generateServices = (paths: OpenAPIV3.PathsObject): Map<string, Service> => {
    const services: Map<string, Service> = new Map();
    const grouped = groupEndpointsByEntity(paths);

    for (const [entity, paths] of grouped) {
        const serviceName = camelCase(`${entity}Service`);
        const functions = [];
        const interfaces = [];

        for (const {path, endpoint} of paths) {
            const {func, types} = endpointGenerators[endpoint.type]({
                path: path as OpenAPIV3.PathItemObject,
                service: pascalCase(entity),
                endpoint
            });

            functions.push(func);
            interfaces.push(types);
        }

        const comment = generateInlineComment(`Service for ${pascalCase(entity)}`);
        const body = `{\n${indent(functions.join('\n'))}\n}`;
        const source = generateStatements(comment, ...interfaces, `export const ${serviceName} = () => ${body}`);
        services.set(entity, {source});
    }

    return services;
};
