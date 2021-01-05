import {Generable, Statement} from '@ts/types';

/**
 * Represents a block of code / statements
 */
export class TSBlock implements Generable {
    private readonly statements: Statement[] = [];

    public constructor(...statements: Statement[]) {
        this.statements = statements;
    }

    public toTS(): string {
        return this.statements
            .map(v => v.toTS())
            .join('\n');
    }
}
