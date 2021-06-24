// Comparison operators
export type SimpleOperators = 'EQ' | 'NE' | 'LT' | 'GT' | 'LE' | 'GE' | 'LIKE' | 'ILIKE' | 'NOT_LIKE' | 'NOT_ILIKE';
export type ArrayOperators = 'IN' | 'NOT_IN';
export type Operator = SimpleOperators | ArrayOperators;

// Generic filter object.
export type ComparableType = string | number | boolean | null;
export type FilterObject =
    { [K in SimpleOperators]?: ComparableType; } &
    { [K in ArrayOperators]?: ComparableType[]; };

// Base filter without the OR part.
export type RootQueryFilter<T> = {
    [P in keyof T]?:
        T[P] extends Array<infer U> ? RootQueryFilter<U> :
            T[P] extends object ? RootQueryFilter<T[P]> : FilterObject;
}

// Takes an model and returns all possible filters.
export type Filterable<T> = RootQueryFilter<T> &
    {OR?: RootQueryFilter<T>[];} &
    Record<string, any>;

// Maps all property types from an object to boolean (or the sub-object)
export type Selectable<T> = {
    [P in keyof T]?:
        T[P] extends Array<infer U> | undefined ? (Selectable<U> | boolean) :
            T[P] extends object | undefined ? (Selectable<T[P]> | boolean) : boolean;
}

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
    filter?: Filterable<Entity>;
}

export interface FirstQuery<Entity> extends EntityQuery<Entity> {
    filter?: Filterable<Entity>;
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
