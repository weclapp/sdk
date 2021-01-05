export interface Generable {
    toTS(): string;
}

// Identifies typescript statements
export type Statement = Generable
