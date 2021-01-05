import {TSValueType} from '@ts/TSValueType';
import {Statement} from '@ts/types';
import {indent} from '@utils/indent';

/**
 * Represents a typescript interface.
 */
export class TSInterface implements Statement {
    private readonly properties = new Map<string, TSValueType>();

    public constructor(
        private readonly name: string,
        private readonly exported: boolean
    ) {
    }

    /**
     * Adds a property to this interface.
     * @param name
     * @param value
     */
    public addProperty(name: string, value: TSValueType): this {
        this.properties.set(name, value);
        return this;
    }

    public toTS(): string {
        const header = `${this.exported ? 'export ' : ''}interface ${this.name}`;
        const properties: string[] = [];

        for (const [prop, type] of this.properties.entries()) {
            properties.push(`${prop}: ${type.toTS()};`);
        }

        return `${header} {\n${indent(properties.join('\n'))}\n}`;
    }
}
