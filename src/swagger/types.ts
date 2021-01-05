export type PropertyType = 'string' | 'boolean' | 'integer';

export interface DefinitionProperty {
    type: PropertyType;
    format?: string;
}

export interface DefinitionReference {
    type: 'array';
    items: {
        $ref: string;
        type: DefinitionProperty | DefinitionReference;
    }
}

export interface Definition {
    properties: Record<string, DefinitionProperty | DefinitionReference>;
    required?: string[]
    type?: string;
}

export interface EndpointParameter {
    in: string;
    name: string;
    required: boolean;
    schema: DefinitionProperty
}

export interface Endpoint {
    description: string;
    parameters: EndpointParameter[];
    produces?: string[];
    tags?: string[]
}

export interface Methods {
    get?: Endpoint;
    post?: Endpoint;
    put?: Endpoint;
    delete?: Endpoint;
}

export interface SwaggerFile {
    paths: Record<string, Methods>;
    definitions: Record<string, Definition>;
    consumes?: string[];
    basePath: string;
}
