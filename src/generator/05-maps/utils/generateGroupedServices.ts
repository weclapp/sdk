import { generateArray } from '@ts/generateArray';
import { generateInterface, InterfaceProperty } from '@ts/generateInterface';
import { generateStatements } from '@ts/generateStatements';
import { generateType } from '@ts/generateType';
import { indent } from '@utils/indent';
import { camelCase, pascalCase } from 'change-case';
import { GeneratedService } from '../../04-services/types';

// Only functions matching this regex are included in the generation.
const FILTER_REGEX = /^(some|count|create|remove|unique|update)$/;
const SOME_FILTER_REGEX = /^(some)$/;

/**
 * Generates for each function a map with the entity-name as key and service type as value.
 * E.g. WServicesWith[Function] where [Function] may be something like "some" or "create".
 *
 * This function also generates an exported array with the names of each service for each name.
 */
export const generateGroupedServices = (services: GeneratedService[]) => {
  const entityDescriptors: Map<string, InterfaceProperty[]> = new Map();
  const someQueryDescriptors: Map<string, InterfaceProperty[]> = new Map();

  for (const service of services) {
    for (const fn of service.functions) {
      if (!FILTER_REGEX.test(fn.name)) {
        continue;
      }

      entityDescriptors.set(fn.name, [
        ...(entityDescriptors.get(fn.name) ?? []),
        {
          name: service.name,
          required: true,
          type: `${pascalCase(service.name)}Service_${pascalCase(fn.name)}`
        }
      ]);

      if (SOME_FILTER_REGEX.test(fn.name)) {
        someQueryDescriptors.set(fn.name, [
          ...(someQueryDescriptors.get(fn.name) ?? []),
          {
            name: service.name,
            required: true,
            type: `${pascalCase(service.name)}Service_${pascalCase(fn.name)}_Query`
          }
        ]);
      }
    }
  }

  const entityDescriptorEntries = [...entityDescriptors.entries()];
  const someQueryDescriptorEntries = [...someQueryDescriptors.entries()];
  const typeGuards: string[] = [];

  for (const [name] of entityDescriptorEntries) {
    const constant = camelCase(`wServiceWith_${name}_Names`);
    const service = pascalCase(`WServiceWith_${name}`);
    const guard = `(service: string | undefined): service is ${service} =>\n${indent(`${constant}.includes(service as ${service});`)}`;
    typeGuards.push(`export const is${service} = ${guard}`);
  }

  return generateStatements(
    ...entityDescriptorEntries.map(([name, props]) => generateInterface(pascalCase(`WServicesWith_${name}`), props)),
    ...entityDescriptorEntries.map(([name]) =>
      generateType(pascalCase(`WServiceWith_${name}`), `keyof ${pascalCase(`WServicesWith_${name}`)}`)
    ),
    ...someQueryDescriptorEntries.map(([name, props]) =>
      generateInterface(pascalCase(`WServicesWith_${name}_Query`), props)
    ),
    ...someQueryDescriptorEntries.map(([name]) =>
      generateType(pascalCase(`WServiceWith_${name}_Query`), `keyof ${pascalCase(`WServicesWith_${name}_Query`)}`)
    ),
    ...entityDescriptorEntries.map(([name, props]) => {
      const constant = camelCase(`wServiceWith_${name}_Names`);
      const type = pascalCase(`WServiceWith_${name}`);
      const value = generateArray(props.map((v) => v.name));
      return `export const ${constant}: ${type}[] = ${value};`;
    }),
    ...typeGuards
  );
};
