import {Statement} from '@ts/types';

/**
 * Represents a comment.
 */
export class TSBlockComment implements Statement {

    public constructor(
        private content = ''
    ) {
    }

    /**
     * Overrides the current content.
     * @param content
     */
    public setContent(content: string): void {
        this.content = content;
    }

    public toTS(): string {
        const raw = this.content.trim();

        if (!raw) {
            return '';
        }

        return '/**\n' +
            `${raw.replace(/^/gm, ' * ')}\n` +
            ' */';
    }
}
