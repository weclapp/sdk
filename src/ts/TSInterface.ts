import {TSValueType} from '@ts/TSValueType';
import {Statement} from '@ts/types';
import {indent} from '@utils/indent';

/**
 * Represents a typescript interface.
 */
export class TSInterface extends Map<string, TSValueType> implements Statement {

    public constructor(
        private readonly name: string,
        private readonly exported: boolean
    ) {
        super();
    }

    public toTS(): string {
        const header = `${this.exported ? 'export ' : ''}interface ${this.name}`;
        const properties: string[] = [];

        for (const [prop, type] of this.entries()) {
            properties.push(`${prop}: ${type.toTS()};`);
        }

        return properties.length ? `${header} {\n${indent(properties.join('\n'))}\n}` : `${header} {}`;
    }
}
