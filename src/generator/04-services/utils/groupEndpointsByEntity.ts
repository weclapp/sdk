import { logger } from "@logger";
import {
  parseEndpointPath,
  WeclappEndpoint,
} from "@utils/weclapp/parseEndpointPath";
import { OpenAPIV3 } from "openapi-types";

export interface ParsedEndpoint {
  endpoint: WeclappEndpoint;
  path: OpenAPIV3.PathItemObject;
}

export type GroupedEndpoints = Map<string, ParsedEndpoint[]>;

const isMultiPartUploadPath = (path: string) => {
  const [, entity, ...rest] = path.split("/");
  return entity && rest.length === 2 && rest[1] === "multipartUpload";
};

export const groupEndpointsByEntity = (
  paths: OpenAPIV3.PathsObject,
): GroupedEndpoints => {
  const endpoints: GroupedEndpoints = new Map();

  for (const [rawPath, path] of Object.entries(paths)) {
    const endpoint = parseEndpointPath(rawPath);

    if (!endpoint || !path) {
      // Todo: Should be removed if sdk supports multi part upload.
      if (isMultiPartUploadPath(rawPath)) {
        continue;
      }
      logger.errorLn(`Failed to parse ${rawPath}`);
      continue;
    }

    if (endpoints.has(endpoint.entity)) {
      endpoints.get(endpoint.entity)?.push({ endpoint, path });
    } else {
      endpoints.set(endpoint.entity, [{ endpoint, path }]);
    }
  }

  return endpoints;
};
