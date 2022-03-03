import {OpenAPIV3} from 'openapi-types';

export const resolveReference = <T = OpenAPIV3.SchemaObject>(
    doc: OpenAPIV3.Document,
    {$ref}: OpenAPIV3.ReferenceObject
): T => {
    if (!$ref.startsWith('#/')) {
        throw new Error(`Only absolute paths in the same document are supported. Received '${$ref}'`);
    }

    const path = $ref.slice(2).split('/');
    let node: any = doc;

    while (node && path.length) {
        node = node[path.shift() as string];
    }

    return node as T;
};
