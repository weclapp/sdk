import {indent} from '@utils/indent';
import {constantCase, pascalCase} from 'change-case';

interface EnumNameDefinition {
    entityName: string;
    propertyName: string;
}

export interface EnumDeclaration {
    enumName: string;
    enumValues: string[]
}

export const tsEnumMemberDefinition = (enumValues: string[], indentLevel?: number): string => {
    const str = enumValues.map(v => `${v} = '${v}',`).join('\n');
    return indentLevel !== undefined ? indent(str, indentLevel) : str;
};

export const tsEnumName = ({entityName, propertyName}: EnumNameDefinition): string => {
    return constantCase(pascalCase(entityName) + pascalCase(propertyName));
};
