import { GeneratedEntity } from '@generator/03-entities';
import { GeneratedService } from '@generator/04-services';
import { logger } from '@logger';
import { concat } from '@utils/concat';
import { generateStatements } from '@ts/generateStatements';
import { generateStrings } from '@ts/generateString';
import { generateType } from '@ts/generateType';
import { indent } from '@utils/indent';
import { camelCase } from 'change-case';

export const generateCustomValueServices = (
  entities: Map<string, GeneratedEntity>,
  services: GeneratedService[]
): string => {
  const customValueEntity = entities.get('customValue');
  const customValueEntities: string[] = [];

  if (!customValueEntity) {
    logger.warn('Cannot generate custom value utils, type not found.');
    return '';
  }

  serviceLoop: for (const service of services) {
    const someFunction = service.functions.find((v) => v.name === 'some');
    if (!someFunction) {
      continue;
    }

    const entity = entities.get(camelCase(someFunction.entity));
    if (entity?.properties.size !== customValueEntity.properties.size) {
      continue;
    }

    for (const [prop, { type }] of entity.properties) {
      if (customValueEntity.properties.get(prop)?.type !== type) {
        continue serviceLoop;
      }
    }

    customValueEntities.push(service.name);
  }

  return generateStatements(
    generateType('WCustomValueService', concat(generateStrings(customValueEntities), ' | ')),
    `export const wCustomValueServiceNames: WCustomValueService[] = [${concat(generateStrings(customValueEntities))}];`,
    `export const isWCustomValueService = (service: string | undefined): service is WCustomValueService =>\n${indent('wCustomValueServiceNames.includes(service as WCustomValueService);')}`
  );
};
