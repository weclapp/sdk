// These operators are for simple comparison.
export type CompareOperators = 'eq' | 'ne' | 'lt' | 'gt' | 'le' | 'ge' | 'like' | 'notlike' | 'ilike' | 'notilike';

// These operators expect an array / list of values.
export type ArrayOperators = 'in' | 'notin';

// These operators ignore the value, for consistency a boolean is expected.
export type BooleanOperators = 'null' | 'notnull';

// Takes an model and returns all possible filters.
export type QueryFilter<Model> =
    { [K in keyof Model as `${K & string}-${CompareOperators}`]?: Model[K]; } &
    { [K in keyof Model as `${K & string}-${BooleanOperators}`]?: boolean; } &
    { [K in keyof Model as `${K & string}-${ArrayOperators}`]?: Model[K][]; };


// Entity model used to query a single or multiple entities
export interface EntityQuery<Model> {

    // If result should be serialized (e.g. non-defined fields nulled)
    serialize?: boolean;

    // Query only these properties
    select?: (keyof Model)[];

    // Resolve additional references
    // TODO: Provide type-list for resolvable entitites
    include?: string[];
}

// Return value for a single .unique query
export type UniqueReturn<Entity, Query extends EntityQuery<Entity>> =
    Query['include'] extends string[] ? {

        // The entity itself
        data: Entity;

        // TODO: Resolve types based on EntityQuery
        references?: unknown[];
    } : Entity;
