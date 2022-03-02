import {generateBase} from '@generator/01-base';
import {generateEnums} from '@generator/02-enums';
import {generateEntities} from '@generator/03-entities';
import {generateServices} from '@generator/04-services';
import {logger} from '@logger';
import {generateBlockComment} from '@ts/generateComment';
import {generateStatements} from '@ts/generateStatements';
import {extractSchemas} from '@utils/openapi/extractSchemas';
import {OpenAPIV3} from 'openapi-types';

export const generate = (doc: OpenAPIV3.Document): string => {
    const schemas = extractSchemas(doc);
    logger.infoLn(`Found ${schemas.size} schemas.`);

    const enums = generateEnums(schemas);
    logger.infoLn(`Found ${enums.size} enums.`);

    const entities = generateEntities(schemas);
    logger.infoLn(`Found ${entities.size} entities.`);

    const services = generateServices(doc.paths);
    logger.infoLn(`Generated ${services.size} services.`);

    return generateStatements(
        generateBlockComment('Base'),
        generateBase(),
        generateBlockComment('ENUMS'),
        [...enums.values()].map(v => v.source).join('\n\n'),
        generateBlockComment('ENTITIES'),
        [...entities.values()].map(v => v.source).join('\n\n'),
        generateBlockComment('SERVICES'),
        [...services.values()].map(v => v.source).join('\n\n')
    );
};
