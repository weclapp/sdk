import { GeneratedEntity } from "@generator/03-entities";
import { GeneratedService } from "@generator/04-services";
import { generateCustomValueUtilities } from "@generator/05-maps/utils/generateCustomValueUtilities";
import { generateEntityPropertyMap } from "@generator/05-maps/utils/generateEntityPropertyMap";
import { generateGroupedServices } from "@generator/05-maps/utils/generateGroupedServices";
import { GeneratorOptions } from "@generator/generate";
import {
  generateBlockComment,
  generateInlineComment,
} from "@ts/generateComment";
import { generateInterface } from "@ts/generateInterface";
import { generateStatements } from "@ts/generateStatements";
import { generateType } from "@ts/generateType";
import { indent } from "@utils/indent";
import { pascalCase } from "change-case";

interface GeneratedMaps {
  source: string;
}

interface MapsGenerator {
  services: GeneratedService[];
  entities: Map<string, GeneratedEntity>;
  enums: string[];
  aliases: Map<string, string>;
  options: GeneratorOptions;
}

const obj = (list: string[]) => `{\n${indent(list.join(",\n"))}\n}`;

const arr = (list: string[]) => `[\n${indent(list.join(",\n"))}\n]`;

export const generateMaps = ({
  services,
  entities,
  aliases,
  enums,
  options,
}: MapsGenerator): GeneratedMaps => {
  const entitiesKeys = [...entities.keys()];

  const enumsArray = `export const wEnums = ${obj(enums)};`;
  const entityNames = `export const wEntityNames: WEntity[] = ${arr(entitiesKeys.map((v) => `'${v}'`))};`;
  const serviceNames = `export const wServiceNames: WService[] = ${arr(services.map((v) => `'${v.entity}'`))};`;

  const serviceValues = `export const wServiceFactories = ${obj(services.map((v) => `${v.entity}: ${v.serviceName}`))};`;
  const serviceInstanceValues = `export const wServices = ${obj(
    services.map((v) => {
      const src = `${v.entity}: ${v.serviceName}()`;
      return v.deprecated
        ? generateInlineComment("@deprecated") + `\n${src}`
        : src;
    }),
  )};`;

  const entityInterfaces = [
    ...entitiesKeys.map((entity) => ({
      name: entity,
      type: pascalCase(entity),
      required: true,
    })),
    ...services.map((service) => {
      const alias = aliases.get(service.entity);

      return {
        name: service.entity,
        type: alias ?? "never",
        required: true,
        comment: alias ? undefined : "no response defined or inlined",
      };
    }),
  ];

  const createMappingType = (type: string, prefix: string) =>
    type !== "never" ? `${type}_${prefix}` : type;

  const entitiesList = generateInterface("WEntities", entityInterfaces);
  const entityReferences = generateInterface(
    "WEntityReferences",
    entityInterfaces.map((v) => ({
      ...v,
      type: createMappingType(v.type, "References"),
    })),
  );
  const entityMappings = generateInterface(
    "WEntityMappings",
    entityInterfaces.map((v) => ({
      ...v,
      type: createMappingType(v.type, "Mappings"),
    })),
  );
  const entityFilter = generateInterface(
    "WEntityFilters",
    entityInterfaces.map((v) => ({
      ...v,
      type: createMappingType(v.type, "Filter"),
    })),
  );

  return {
    source: generateStatements(
      /* JS Values */
      serviceValues,
      serviceInstanceValues,
      entityNames,
      serviceNames,
      enumsArray,
      generateEntityPropertyMap(entities, services, options),

      /* Map of entity to references / mappings and filters*/
      entityReferences,
      entityMappings,
      entityFilter,

      /* List of all entities with their corresponding service */
      generateBlockComment(
        `
                This interfaces merges two maps:
                - Map<[entityName], [entityInterfaceName]>
                - Map<[serviceName], [entityInterfaceName]>
                
                Where [entityName] is 
                - the name of a nested entity (e.g. 'address' from Party)
                - the name of an entity (e.g. 'party', 'article' etc.)
                
                Where [serviceName] is the name of an endpoint (e.g. for /article its 'article')
               
                Where [entityInterfaceName] is
                - the underlying type for this entity
                - the type for what is returned by the api
            `,
        entitiesList,
      ),

      /* type-ofs and types */
      generateType("WServices", "typeof wServices"),
      generateType("WServiceFactories", "typeof wServiceFactories"),
      generateType("WService", "keyof WServices"),
      generateType("WEntity", "keyof WEntities"),
      generateType("WEnums", "typeof wEnums"),
      generateType("WEnum", "keyof WEnums"),

      /* Utilities. */
      generateCustomValueUtilities(entities, services),

      /* All functions grouped by service supporting it */
      ...generateGroupedServices(services),
    ),
  };
};
