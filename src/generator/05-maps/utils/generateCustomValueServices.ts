import { concat } from '@utils/concat';
import { generateStatements } from '@ts/generateStatements';
import { generateStrings } from '@ts/generateString';
import { generateType } from '@ts/generateType';
import { indent } from '@utils/indent';
import { GeneratedService } from '../../04-services/types';

export const generateCustomValueServices = (services: GeneratedService[]): string => {
  const customValueEntities: string[] = [];

  for (const service of services) {
    const relatedEntity = service.relatedEntity;
    if (relatedEntity?.name === 'customValue') {
      customValueEntities.push(service.name);
    }
  }

  return generateStatements(
    generateType('WCustomValueService', concat(generateStrings(customValueEntities), ' | ')),
    `export const wCustomValueServiceNames: WCustomValueService[] = [${concat(generateStrings(customValueEntities))}];`,
    `export const isWCustomValueService = (service: string | undefined): service is WCustomValueService =>\n${indent('wCustomValueServiceNames.includes(service as WCustomValueService);')}`
  );
};
