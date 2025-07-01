import { GeneratedEntity } from '@generator/03-entities';
import { GeneratedService } from '@generator/04-services';
import { generateCustomValueServices } from './utils/generateCustomValueServices';
import { generateEntityProperties } from '@generator/05-maps/utils/generateEntityProperties';
import { generateGroupedServices } from '@generator/05-maps/utils/generateGroupedServices';
import { GeneratorOptions } from '@generator/generate';
import { generateInterface } from '@ts/generateInterface';
import { generateStatements } from '@ts/generateStatements';
import { generateType } from '@ts/generateType';
import { GeneratedEnum } from '../02-enums';
import { loosePascalCase } from '@utils/case';
import { generateArray } from '@ts/generateArray';
import { generateObject } from '@ts/generateObject';

export interface GeneratedMaps {
  source: string;
}

export const generateMaps = (
  enums: Map<string, GeneratedEnum>,
  entities: Map<string, GeneratedEntity>,
  services: Map<string, GeneratedService>,
  aliases: Map<string, string>,
  options: GeneratorOptions
): GeneratedMaps => {
  const enumInstances = `export const wEnums = ${generateObject(
    [...enums.keys()].map((v) => ({ key: v, value: v }))
  )};`;

  const entityNames = `export const wEntityNames: WEntity[] = ${generateArray([...entities.keys()])};`;

  const generatedServices = [...services.values()];
  const serviceInstances = `export const wServices = ${generateObject(
    generatedServices.map((v) => ({
      key: v.name,
      value: `${v.serviceFnName}()`,
      comment: v.deprecated ? '@deprecated' : undefined
    }))
  )};`;
  const serviceFactories = `export const wServiceFactories = ${generateObject(
    generatedServices.map((v) => ({
      key: v.name,
      value: v.serviceFnName,
      comment: v.deprecated ? '@deprecated' : undefined
    }))
  )};`;

  return {
    source: generateStatements(
      /* Enums */
      generateInterface(
        'WEnums',
        [...enums.keys()].map((name) => ({ name, type: name, required: true }))
      ),
      generateType('WEnum', 'keyof WEnums'),
      enumInstances,

      /* Entities */
      generateInterface(
        'WEntities',
        [
          ...[...entities.keys()].map((name) => ({ name, type: loosePascalCase(name), required: true })),
          ...[...aliases.entries()].map(([name, type]) => ({ name, type, required: true }))
        ].sort((a, b) => (a.name > b.name ? 1 : -1))
      ),
      generateType('WEntity', 'keyof WEntities'),
      entityNames,

      /* Services */
      serviceInstances,
      generateType('WServices', 'typeof wServices'),
      generateType('WService', 'keyof WServices'),

      serviceFactories,
      generateType('WServiceFactories', 'typeof wServiceFactories'),

      /* Service Utils */
      generateGroupedServices(generatedServices),
      generateCustomValueServices(entities, generatedServices),

      /* Entity Properties (Runtime Meta Infos) */
      generateEntityProperties(entities, aliases, generatedServices, options)
    )
  };
};
