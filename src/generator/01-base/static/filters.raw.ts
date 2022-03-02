type EqualityOperators = 'EQ' | 'NE';
type ComparisonOperators = 'LT' | 'GT' | 'LE' | 'GE' | 'LIKE' | 'ILIKE' | 'NOT_LIKE' | 'NOT_ILIKE';
type ArrayOperators = 'IN' | 'NOT_IN';

// Generic filter object
type Operators<T> = { [K in EqualityOperators]?: T | null; } &
    { [K in ComparisonOperators]?: T; } &
    { [K in ArrayOperators]?: T[]; };

// Base filter without the OR part.
type QueryFilter<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ?
        QueryFilter<U> : T[P] extends object ?
            QueryFilter<T[P]> : Operators<T[P]>;
};

