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

// Helper type to "select" properties from an object
type SelectQuery<Entity> = {
    [K in keyof Entity]?: boolean;
}

// Returns those values which were selected by Query
export type Select<Entity, Query extends EntityQuery<Entity>> =
    Query['select'] extends SelectQuery<Entity> ? {
        // Filter properties
        [K in keyof Entity as Query['select'][K] extends true ? K : never]: Entity[K]
    } : Entity;

// Entity model used to query a single or multiple entities
export interface EntityQuery<Entity> {

    // If result should be serialized (e.g. non-defined fields nulled)
    serialize?: boolean;

    // Query only these properties
    select?: SelectQuery<Entity>;

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
    filter?: QueryFilter<Entity>;
}

export interface FirstQuery<Entity> extends EntityQuery<Entity> {
    filter?: QueryFilter<Entity>;
}

// Return value for the .unique and .first query
export type UniqueReturn<Entity, Query extends EntityQuery<Entity> = {}> = Query['include'] extends string[] ?
    WrappedResponse<Select<Entity, Query>> : (Select<Entity, Query> | null);

// Return value for the .some function
export type SomeReturn<Entity, Query extends ListQuery<Entity> = {}> = Query['include'] extends string[] ?
    WrappedResponse<Select<Entity, Query>[]> : Select<Entity, Query>[];
