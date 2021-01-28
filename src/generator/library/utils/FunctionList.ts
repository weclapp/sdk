import {generateFunction, Target} from '@enums/Target';
import {StatsEntityFunction} from '@generator/library';
import {Functions} from '@generator/library/functions/generateFunctions';
import {tsFunction} from '@ts/functions';

interface Documentation {
    description?: string;
    signature?: string;
}

interface Code {
    description: string;
    parameters?: [string, string][];
    example?: string;
    signature: string;
    returnType: string;
    returnValue: string;
}

interface AddFunction {
    docs?: Documentation;
    code: Code;
}

/**
 * Holds not only a set of function but also the corresponding documentation about them.
 */
export class FunctionList {
    readonly #stats: StatsEntityFunction[] = [];
    readonly #sources: string[] = [];

    /**
     * Generates a function description.
     * @param description General description.
     * @param parameters Optional paramters for this function including a description.
     * @param example An usage example
     */
    public static generateFunctionDescription({description, parameters, example}: Code): string {
        let comment = description;

        if (parameters) {
            comment += `\n\n${parameters.map(value => `@param ${value[0]} ${value[1]}`).join('\n')}`;
        }

        if (example) {
            comment += `\n@example ${example}`;
        }

        return comment;
    }

    /**
     * Adds a new function to this container
     * @param target Target
     * @param code Function related settings
     * @param docs Optional specific values for the docs
     */
    public add(target: Target, {code, docs}: AddFunction): this {
        this.#stats.push({
            description: docs?.description ?? code.description,
            signature: docs?.signature ?? code.signature
        });

        this.#sources.push(tsFunction({
            description: FunctionList.generateFunctionDescription(code),
            body: generateFunction(target, {
                signature: code.signature,
                returnType: code.returnType,
                returnValue: code.returnValue
            })
        }));

        return this;
    }

    /**
     * Returns all stats and sources for this
     */
    public getAll(): Functions {
        return {
            stats: this.#stats,
            sources: this.#sources
        };
    }
}
