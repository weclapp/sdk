import { OpenAPIV3 } from 'openapi-types';

export const resolveResponsesObject = (responses: OpenAPIV3.ResponsesObject) =>
  Object.entries(responses).find(([statusCode]) => statusCode.startsWith('2'))?.[1];
