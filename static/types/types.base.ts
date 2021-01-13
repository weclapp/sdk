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

export interface EntityQuery<Model> {
    serialize?: boolean;
    select?: (keyof Model)[]
}
