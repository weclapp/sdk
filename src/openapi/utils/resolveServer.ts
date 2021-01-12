import {OpenAPIV3} from 'openapi-types';

/**
 * Picks the first server found in the OpenAPI document.
 * @param doc
 */
export const resolveServer = (doc: OpenAPIV3.Document): string | null => {
    return doc.servers?.[0].url || null;
};
