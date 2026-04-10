import { generateBase } from '@generator/01-base';
import { generateEnums } from '@generator/02-enums';
import { generateEntities, generateReferencedEntities } from '@generator/03-entities';
import { generateServices } from '@generator/04-services';
import { generateMaps } from '@generator/05-maps';
import { generateBlockComment } from '@ts/generateComment';
import { generateStatements } from '@ts/generateStatements';
import { extractContext } from '@utils/weclapp/extractContext';
import { OpenAPIV3 } from 'openapi-types';
import { Target } from '../target';

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
  const context = extractContext(doc);

  const base = generateBase(doc.info.version, options);
  const enums = generateEnums(context);
  const entities = generateEntities(context);
  const services = generateServices(entities, context, options);
  const maps = generateMaps(enums, entities, services, context, options);

  return generateStatements(
    generateBlockComment('BASE', base),
    generateBlockComment('ENUMS', generateStatements(...[...enums.values()].map((v) => v.source))),
    generateBlockComment('ENTITIES', generateStatements(...[...entities.values()].map((v) => v.source))),
    generateBlockComment('FILTERS', generateStatements(...[...entities.values()].map((v) => v.filterSource))),
    generateBlockComment('REFERENCED ENTITIES', generateReferencedEntities(entities, context.aliases, services)),
    generateBlockComment('SERVICES', generateStatements(...[...services.values()].map((v) => v.source))),
    generateBlockComment('MAPS', maps)
  );
};
