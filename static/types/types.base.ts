// These operators are for simple comparison.
export type CompareOperators = 'eq' | 'ne' | 'lt' | 'gt' | 'le' | 'ge' | 'like' | 'notlike' | 'ilike' | 'notilike';

// These operators expect an array / list of values.
export type ArrayOperators = 'in' | 'notin';

// These operators ignore the value, for consistency a boolean is expected.
export type BooleanOperators = 'null' | 'notnull';

// Takes an model and returns all possible filters.
export type QueryFilter<Entity> =
    { [K in keyof Entity as `${K & string}-${CompareOperators}`]?: Entity[K]; } &
    { [K in keyof Entity as `${K & string}-${BooleanOperators}`]?: boolean; } &
    { [K in keyof Entity as `${K & string}-${ArrayOperators}`]?: Entity[K][]; };

// Entity model used to query a single or multiple entities
export interface EntityQuery<Entity> {

    // If result should be serialized (e.g. non-defined fields nulled)
    serialize?: boolean;

    // Query only these properties
    select?: (keyof Entity)[];

    // Resolve additional references
    // TODO: Provide type-list for resolvable entitites
    include?: string[];
}

export interface WrappedResponse<Data> {

    // The entity itself
    data: Data;

    // TODO: Resolve types based on EntityQuery
    references?: unknown[];
}

export interface ListQuery<Entity> extends EntityQuery<Entity> {
    page?: number;
    pageSize?: number;
}

// Return value for the .unique query
export type UniqueReturn<Entity, Query extends EntityQuery<Entity> = {}> =
    Query['include'] extends string[] ? WrappedResponse<Entity> : Entity;

// Return value for the .some function
export type SomeReturn<Entity, Query extends ListQuery<Entity> = {}> =
    Query['include'] extends string[] ? WrappedResponse<Entity[]> : Entity[];
