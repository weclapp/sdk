// These operators are for simple comparison.
export type CompareOperators = 'eq' | 'ne' | 'lt' | 'gt' | 'le' | 'ge' | 'like' | 'notlike' | 'ilike' | 'notilike';

// These operators expect an array / list of values.
export type ArrayOperators = 'in' | 'notin';

// These operators ignore the value, for consistency a boolean is expected.
export type BooleanOperators = 'null' | 'notnull';

// Generic filter object.
export type FilterObject =
    { [K in CompareOperators]?: string | number; } &
    { [K in BooleanOperators]?: boolean; } &
    { [K in ArrayOperators]?: (string | number)[]; };

// Deeply remaps all properties from a object.
export type DeepMap<T, V> = {
    [P in keyof T]?:
        T[P] extends Array<infer U> ? (Selectable<U> | V) :
            T[P] extends object ? (Selectable<T[P]> | V) : V;
}

// Takes an model and returns all possible filters.
export type QueryFilter<T> = DeepMap<T, FilterObject>;

// Maps all property types from an object to boolean (or the sub-object)
export type Selectable<T> = DeepMap<T, boolean>;

// Extracts properties based on the select query
export type Select<T, Q extends Selectable<T>> = {

    // Filter out excluded properties beforehand
    [P in keyof T as Q[P] extends boolean ? P : Q[P] extends object ? P : never]:

    // Property
    Q[P] extends true ? T[P] :

    // Array
    T[P] extends Array<infer U> ? Select<U, Q[P]>[] :

    // Object
    T[P] extends object ? Select<T[P], Q[P]> : never
}

// Select wrapper for entity-queries
export type OptionalSelect<T, Q extends EntityQuery<T>> =
    Q['select'] extends Selectable<T> ? Select<T, Q['select']> : T

// Entity model used to query a single or multiple entities
export interface EntityQuery<Entity> {

    // If result should be serialized (e.g. non-defined fields nullable)
    serialize?: boolean;

    // Query only these properties
    select?: Selectable<Entity>;

    // Resolve additional references
    // TODO: Not all props refer to another entity
    include?: (keyof Entity)[];
}

export interface WrappedResponse<Data> {

    // The entity itself
    data: Data;

    // Entities included by include
    // TODO: Resolve value by query or inject references?
    references?: Record<string, unknown[]>;
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
export type UniqueReturn<
    Entity,
    Query extends EntityQuery<Entity
> = {}> = Query['include'] extends string[] ?
    WrappedResponse<OptionalSelect<Entity, Query>> :
    (OptionalSelect<Entity, Query> | null);

// Return value for the .some function
export type SomeReturn<
    Entity,
    Query extends ListQuery<Entity> = {}
> = Query['include'] extends string[] ?
    WrappedResponse<OptionalSelect<Entity, Query>[]> :
    OptionalSelect<Entity, Query>[];
