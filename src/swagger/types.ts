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
}
