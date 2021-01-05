import {Generable} from '@ts/types';

/**
 * Represents a typescript type
 */
export class TSValueType implements Generable {
    public constructor(
        private readonly type: string
    ) {
    }

    public static readonly string = (): TSValueType => new TSValueType('string');

    public static readonly number = (): TSValueType => new TSValueType('number');

    public static readonly boolean = (): TSValueType => new TSValueType('boolean');

    public static readonly null = (): TSValueType => new TSValueType('null');

    public static readonly undefined = (): TSValueType => new TSValueType('undefined');

    public static readonly unknown = (): TSValueType => new TSValueType('unknown');

    public static readonly array = (v: TSValueType): TSValueType => new TSValueType(`${v.toTS()}[]`);

    public toTS(): string {
        return this.type;
    }
}
