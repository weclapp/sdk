import {Target} from '@enums/Target';
import {generateBase} from '@generator/01-base';
import {generateEnums} from '@generator/02-enums';
import {generateEntities} from '@generator/03-entities';
import {generateServices} from '@generator/04-services';
import {generateMaps} from '@generator/05-maps';
import {generateBlockComment} from '@ts/generateComment';
import {generateStatements} from '@ts/generateStatements';
import {extractSchemas} from '@utils/openapi/extractSchemas';
import {OpenAPIV3} from 'openapi-types';

export const generate = (doc: OpenAPIV3.Document, target: Target): string => {
    const {schemas, aliases} = extractSchemas(doc);
    const enums = generateEnums(schemas);
    const entities = generateEntities(schemas);
    const services = generateServices(doc, target, aliases);

    return generateStatements(
        generateBase(target),
        generateBlockComment('ENUMS', generateStatements(...[...enums.values()].map(v => v.source))),
        generateBlockComment('ENTITIES', generateStatements(...[...entities.values()].map(v => v.source))),
        generateBlockComment('SERVICES', generateStatements(...[...services.values()].map(v => v.source))),
        generateBlockComment('MAPS', generateMaps({
            services: [...services.values()],
            entities: [...entities.keys()],
            enums: [...enums.keys()],
            aliases
        }).source)
    );
};
