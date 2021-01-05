import {Generable, Statement} from '@ts/types';
import {writeFile} from 'fs/promises';

/**
 * Represents a typescript file.
 */
export class TSFile implements Generable {
    private readonly statements: Statement[] = [];

    /**
     * Adds a statement to this file
     * @param statements
     */
    public addStatement(...statements: Statement[]): this {
        this.statements.push(...statements);
        return this;
    }

    public toTS(): string {
        return this.statements
            .map(v => v.toTS())
            .join('\n\n');
    }

    /**
     * Writes this file to the disk.
     * @param path
     */
    public async writeTo(path: string): Promise<void> {
        return writeFile(path, this.toTS() + '\n');
    }
}
