import { GeneratedEntity } from '@generator/03-entities';
import { generateCustomValueServices } from './utils/generateCustomValueServices';
import { generateEntityProperties } from '@generator/05-maps/utils/generateEntityProperties';
import { generateGroupedServices } from '@generator/05-maps/utils/generateGroupedServices';
import { GeneratorOptions } from '@generator/generate';
import { generateInterface } from '@ts/generateInterface';
import { generateStatements } from '@ts/generateStatements';
import { generateType } from '@ts/generateType';
import { GeneratedEnum } from '../02-enums';
import { generateArray } from '@ts/generateArray';
import { generateObject } from '@ts/generateObject';
import { OpenApiContext } from '@utils/weclapp/extractContext';
import { GeneratedService } from '../04-services/types';

export const generateMaps = (
  enums: Map<string, GeneratedEnum>,
  entities: Map<string, GeneratedEntity>,
  services: Map<string, GeneratedService>,
  context: OpenApiContext,
  options: GeneratorOptions
) => {
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

  return generateStatements(
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
        ...[...entities.entries()].map(([name, entity]) => ({
          name,
          type: entity.interfaceName,
          required: true
        })),
        ...generatedServices
          .filter(({ relatedEntity }) => !!relatedEntity)
          .filter(({ name }) => !entities.get(name))
          .map(({ name, relatedEntity }) => ({
            name,
            type: relatedEntity!.interfaceName,
            required: true
          }))
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
    generateCustomValueServices(generatedServices),

    /* Entity Properties (Runtime Meta Infos) */
    generateEntityProperties(entities, generatedServices, options)
  );
};
