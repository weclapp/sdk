// Comparison operators
export type EqualityOperators = 'EQ' | 'NE';
export type ComparisonOperators = 'LT' | 'GT' | 'LE' | 'GE' | 'LIKE' | 'ILIKE' | 'NOT_LIKE' | 'NOT_ILIKE';
export type ArrayOperators = 'IN' | 'NOT_IN';
export type Operator = ComparisonOperators | ArrayOperators;
export type SortDirection = 'asc' | 'desc'

// Generic filter object
export type FilterObject<T> =
    { [K in EqualityOperators]?: T | null; } &
    { [K in ComparisonOperators]?: T; } &
    { [K in ArrayOperators]?: T[]; };

// Base filter without the OR part.
export type RootQueryFilter<T> = {
    [P in keyof T]?:
        T[P] extends Array<infer U> | undefined ? RootQueryFilter<U> :
            T[P] extends object | undefined ? RootQueryFilter<T[P]> : FilterObject<T[P]>;
};

export type ReferencesRootQueryFilter<T> = {
    [P in keyof T as T[P] extends ReferenceResolution ? T[P]['sortAndFilterProperty']
      : P]?:
      T[P] extends ReferenceResolution ? ReferencesRootQueryFilter<T[P]['entity']> | ReferencesRootQueryFilter<T[P]['relatedEntity']>
        : FilterObject<T[P]>;
}

// Takes an model and returns all possible filters.
export type Filterable<T, R> = R extends undefined ? RootQueryFilter<T> | {OR?: RootQueryFilter<T>[][];}
  : RootQueryFilter<T> | ReferencesRootQueryFilter<R> | {OR?: RootQueryFilter<T>[][] | ReferencesRootQueryFilter<R>[][];};

// Only allow sort for non object or array properties. Map to available SortDirection for the remaining props
export type Sortable<T, R> = R extends undefined ? EntitySortable<T> : EntitySortable<T> | ReferencesSortable<R>;

type EntitySortable<T> = {
    [P in keyof T as T[P] extends Array<infer U> ?
      never : T[P] extends object ?
        never: P]?: SortDirection;
}

export type ReferenceResolution = {
    entity: unknown;
    relatedEntity: unknown;
    sortAndFilterProperty: string;
}

// references can be sorted e.g. article with articleCategory.id
type ReferencesSortable<T> = {
    [P in keyof T as T[P] extends Array<infer U> ? never :
      T[P] extends ReferenceResolution ? T[P]['sortAndFilterProperty']
        : P
    ]?:
    T[P] extends Array<infer U> ? never:
      T[P] extends ReferenceResolution ? ReferencesSortable<T[P]['entity']> | ReferencesSortable<T[P]['relatedEntity']>
        : SortDirection;
}

// Maps all property types from an object to boolean (or the sub-object)
export type Selectable<T> = {
    [P in keyof T]?:
        T[P] extends Array<infer U> | undefined ? (Selectable<U> | boolean) :
            T[P] extends Record<any, any> | undefined ? (Selectable<T[P]> | boolean) : boolean;
}

// Extracts properties based on the select query
export type Select<T, Q extends Selectable<T>> = {

    // Filter out excluded properties beforehand
    [P in keyof T as Q[P] extends boolean ? P : Q[P] extends object ? P : never]:

    // Property
    Q[P] extends true ? T[P] :

    // Array
    T[P] extends Array<infer U> ? Select<U, Q[P] & Selectable<any>>[] :

    // Object
    T[P] extends Record<any, any> ? Select<T[P], Q[P] & Selectable<any>> : never
}

// Select wrapper for entity-queries
export type OptionalSelect<T, Q extends EntityQuery<T, any>> =
    Q['select'] extends Selectable<T> ? Select<T, Q['select']> : T;

// Entity model used to query a single or multiple entities
export interface EntityQuery<Entity, RelatedEntities = undefined> {
    // If result should be serialized (e.g. non-defined fields nullable)
    serialize?: boolean;

    // Query only these properties
    select?: Selectable<Entity>;

    // Resolve additional references
    include?: RelatedEntities extends undefined ? undefined : (keyof RelatedEntities)[];
}

export interface WrappedResponse<Data> {

    // The entity itself
    data: Data;

    // Entities included by include
    // TODO: Resolve value by query or inject references?
    references?: Record<string, unknown[]>;
}

interface SortQuery<Entity, RelatedEntitiesSortAndFilter = undefined> {
    sort?: Sortable<Entity, RelatedEntitiesSortAndFilter>;
}

interface PaginationQuery {
    page?: number;
    pageSize?: number;
}

interface RequiredParams<Params> {
    params?: Params;
}

export interface ListQuery<Entity, Params, RelatedEntities> extends EntityQuery<Entity, RelatedEntities>, SortQuery<Entity, RelatedEntities>, PaginationQuery, RequiredParams<Params> {
    filter?: Filterable<Entity, RelatedEntities>;
}

export interface FirstQuery<Entity, Params, RelatedEntities> extends EntityQuery<Entity, RelatedEntities>, SortQuery<Entity, RelatedEntities>, RequiredParams<Params> {
    filter?: Filterable<Entity, RelatedEntities>;
}

// Return value for the .unique and .first query
export type UniqueReturn<
    Entity,
    RelatedEntities = undefined,
    Query extends EntityQuery<Entity, RelatedEntities> = {}
> = Query['include'] extends string[] ?
    WrappedResponse<OptionalSelect<Entity, Query>> :
    (OptionalSelect<Entity, Query> | null);

// Return value for the .some function
export type SomeReturn<
    Entity,
    RelatedEntities = undefined,
    Query extends ListQuery<Entity, Record<string, unknown>, RelatedEntities> = {}
> = Query['include'] extends string[] ?
    WrappedResponse<OptionalSelect<Entity, EntityQuery<Entity>>[]> :
    OptionalSelect<Entity, EntityQuery<Entity>>[];
