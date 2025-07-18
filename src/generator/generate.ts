import { Target } from '../target';
import { generateBase } from '@generator/01-base';
import { generateEnums } from '@generator/02-enums';
import { generateEntities } from '@generator/03-entities';
import { generateServices } from '@generator/04-services';
import { generateMaps } from '@generator/05-maps';
import { generateBlockComment } from '@ts/generateComment';
import { generateStatements } from '@ts/generateStatements';
import { extractSchemas } from '@utils/openapi/extractSchemas';
import { OpenAPIV3 } from 'openapi-types';

export interface GeneratorOptions {
  /* Generate unique methods as well. */
  generateUnique: boolean;
  /* Build target */
  target: Target;
  /* Generate deprecated functions */
  deprecated: boolean;
  /* Generate the new where property for some and count queries */
  useQueryLanguage: boolean;
}

export const generate = (doc: OpenAPIV3.Document, options: GeneratorOptions): string => {
  const { schemas, aliases } = extractSchemas(doc);

  const enums = generateEnums(schemas);
  const entities = generateEntities(schemas, enums);
  const services = generateServices(doc.paths, entities, aliases, options);
  const maps = generateMaps(enums, entities, services, aliases, options);

  return generateStatements(
    generateBase(options.target, doc.info.version, options),
    generateBlockComment('ENUMS', generateStatements(...[...enums.values()].map((v) => v.source))),
    generateBlockComment('ENTITIES', generateStatements(...[...entities.values()].map((v) => v.source))),
    generateBlockComment('SERVICES', generateStatements(...[...services.values()].map((v) => v.source))),
    generateBlockComment('MAPS', generateStatements(maps.source))
  );
};
