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

export type Definition = Record<string, DefinitionProperty | DefinitionReference>;
